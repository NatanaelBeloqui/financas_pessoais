using System.Collections.Concurrent;
using System.Net;

namespace financas_backend.Middlewares
{
    public class RateLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private static readonly ConcurrentDictionary<string, ClientRequestInfo> _clients = new();
        private static readonly object _cleanupLock = new object();
        private static DateTime _lastCleanup = DateTime.UtcNow;

        public RateLimitingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Obter IP do cliente
            var clientIp = GetClientIp(context);
            var endpoint = context.Request.Path.Value?.ToLower() ?? "";

            // Limpar cache antigo (a cada 10 minutos)
            CleanupOldEntries();

            // Configurar limites por endpoint
            var limits = GetLimitsForEndpoint(endpoint);

            // Verificar rate limit
            if (!IsRequestAllowed(clientIp, endpoint, limits))
            {
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.ContentType = "application/json";
                
                var retryAfter = GetRetryAfterSeconds(clientIp, endpoint);
                context.Response.Headers.Add("Retry-After", retryAfter.ToString());
                
                await context.Response.WriteAsJsonAsync(new
                {
                    error = "Muitas requisições. Tente novamente mais tarde.",
                    retryAfter = retryAfter
                });
                return;
            }

            // Registrar requisição
            RecordRequest(clientIp, endpoint);

            await _next(context);
        }

        private string GetClientIp(HttpContext context)
        {
            // Tenta obter IP real (considera proxies)
            var ip = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(ip))
            {
                return ip.Split(',')[0].Trim();
            }

            ip = context.Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(ip))
            {
                return ip;
            }

            return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }

        private RateLimitConfig GetLimitsForEndpoint(string endpoint)
        {
            // Login e Register: MUITO RESTRITIVO (5 tentativas por minuto)
            if (endpoint.Contains("/api/auth/login") || endpoint.Contains("/api/auth/register"))
            {
                return new RateLimitConfig
                {
                    MaxRequests = 5,
                    TimeWindowSeconds = 60
                };
            }

            // Endpoints de escrita (POST, PUT, DELETE): RESTRITIVO (30 por minuto)
            if (endpoint.Contains("/api/categorias") || endpoint.Contains("/api/transacoes"))
            {
                return new RateLimitConfig
                {
                    MaxRequests = 30,
                    TimeWindowSeconds = 60
                };
            }

            // Demais endpoints: LIBERAL (100 por minuto)
            return new RateLimitConfig
            {
                MaxRequests = 100,
                TimeWindowSeconds = 60
            };
        }

        private bool IsRequestAllowed(string clientIp, string endpoint, RateLimitConfig limits)
        {
            var key = $"{clientIp}:{endpoint}";
            
            if (!_clients.TryGetValue(key, out var clientInfo))
            {
                return true; // Primeira requisição sempre é permitida
            }

            var now = DateTime.UtcNow;
            var timeWindow = TimeSpan.FromSeconds(limits.TimeWindowSeconds);

            // Remove requisições antigas fora da janela de tempo
            clientInfo.RequestTimestamps.RemoveAll(t => now - t > timeWindow);

            // Verifica se excedeu o limite
            return clientInfo.RequestTimestamps.Count < limits.MaxRequests;
        }

        private void RecordRequest(string clientIp, string endpoint)
        {
            var key = $"{clientIp}:{endpoint}";
            var now = DateTime.UtcNow;

            _clients.AddOrUpdate(key,
                // Adicionar novo cliente
                new ClientRequestInfo
                {
                    RequestTimestamps = new List<DateTime> { now }
                },
                // Atualizar cliente existente
                (k, existing) =>
                {
                    existing.RequestTimestamps.Add(now);
                    return existing;
                });
        }

        private int GetRetryAfterSeconds(string clientIp, string endpoint)
        {
            var key = $"{clientIp}:{endpoint}";
            
            if (_clients.TryGetValue(key, out var clientInfo) && clientInfo.RequestTimestamps.Count > 0)
            {
                var oldestRequest = clientInfo.RequestTimestamps.Min();
                var limits = GetLimitsForEndpoint(endpoint);
                var timeWindow = TimeSpan.FromSeconds(limits.TimeWindowSeconds);
                var timeSinceOldest = DateTime.UtcNow - oldestRequest;
                var remaining = timeWindow - timeSinceOldest;

                return Math.Max(1, (int)remaining.TotalSeconds);
            }

            return 60; // Default: 1 minuto
        }

        private void CleanupOldEntries()
        {
            // Executar limpeza a cada 10 minutos
            if ((DateTime.UtcNow - _lastCleanup).TotalMinutes < 10)
                return;

            lock (_cleanupLock)
            {
                if ((DateTime.UtcNow - _lastCleanup).TotalMinutes < 10)
                    return;

                var now = DateTime.UtcNow;
                var keysToRemove = new List<string>();

                foreach (var kvp in _clients)
                {
                    // Remove entradas sem requisições nos últimos 10 minutos
                    kvp.Value.RequestTimestamps.RemoveAll(t => (now - t).TotalMinutes > 10);

                    if (kvp.Value.RequestTimestamps.Count == 0)
                    {
                        keysToRemove.Add(kvp.Key);
                    }
                }

                foreach (var key in keysToRemove)
                {
                    _clients.TryRemove(key, out _);
                }

                _lastCleanup = DateTime.UtcNow;
            }
        }

        private class ClientRequestInfo
        {
            public List<DateTime> RequestTimestamps { get; set; } = new();
        }

        private class RateLimitConfig
        {
            public int MaxRequests { get; set; }
            public int TimeWindowSeconds { get; set; }
        }
    }
}