using System.Text.Json;
using financas_backend.Data;
using financas_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace financas_backend.Services
{
    public class AuditoriaService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditoriaService(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// Registra uma ação de auditoria no banco de dados
        /// </summary>
        public async Task RegistrarAcao(
            int usuarioId,
            string acao,
            string entidade,
            int? entidadeId = null,
            object? dadosAntes = null,
            object? dadosDepois = null)
        {
            try
            {
                var log = new LogAuditoria
                {
                    UsuarioId = usuarioId,
                    Acao = acao,
                    Entidade = entidade,
                    EntidadeId = entidadeId,
                    DataHora = DateTime.UtcNow,
                    DadosAntes = dadosAntes != null ? JsonSerializer.Serialize(dadosAntes) : null,
                    DadosDepois = dadosDepois != null ? JsonSerializer.Serialize(dadosDepois) : null,
                    IpAddress = ObterIpCliente(),
                    UserAgent = ObterUserAgent()
                };

                _context.LogsAuditoria.Add(log);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log de erro (não falhar a operação principal por causa do log)
                Console.WriteLine($"Erro ao registrar auditoria: {ex.Message}");
            }
        }

        /// <summary>
        /// Registra tentativa de login (sucesso ou falha)
        /// </summary>
        public async Task RegistrarLogin(int? usuarioId, string email, bool sucesso)
        {
            try
            {
                var log = new LogAuditoria
                {
                    UsuarioId = usuarioId ?? 0, // 0 para login falhado
                    Acao = sucesso ? "LOGIN_SUCESSO" : "LOGIN_FALHA",
                    Entidade = "Usuario",
                    EntidadeId = usuarioId,
                    DataHora = DateTime.UtcNow,
                    DadosDepois = JsonSerializer.Serialize(new { Email = email }),
                    IpAddress = ObterIpCliente(),
                    UserAgent = ObterUserAgent()
                };

                _context.LogsAuditoria.Add(log);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao registrar login: {ex.Message}");
            }
        }

        /// <summary>
        /// Registra tentativa de acesso não autorizado
        /// </summary>
        public async Task RegistrarAcessoNegado(string recurso)
        {
            try
            {
                var log = new LogAuditoria
                {
                    UsuarioId = 0, // Usuário não autenticado
                    Acao = "ACESSO_NEGADO",
                    Entidade = recurso,
                    DataHora = DateTime.UtcNow,
                    IpAddress = ObterIpCliente(),
                    UserAgent = ObterUserAgent()
                };

                _context.LogsAuditoria.Add(log);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao registrar acesso negado: {ex.Message}");
            }
        }

        /// <summary>
        /// Busca logs de auditoria com filtros
        /// </summary>
        public async Task<List<LogAuditoria>> BuscarLogs(
            int? usuarioId = null,
            string? acao = null,
            DateTime? dataInicio = null,
            DateTime? dataFim = null,
            int limite = 100)
        {
            var query = _context.LogsAuditoria.AsQueryable();

            if (usuarioId.HasValue)
                query = query.Where(l => l.UsuarioId == usuarioId.Value);

            if (!string.IsNullOrEmpty(acao))
                query = query.Where(l => l.Acao == acao);

            if (dataInicio.HasValue)
                query = query.Where(l => l.DataHora >= dataInicio.Value);

            if (dataFim.HasValue)
                query = query.Where(l => l.DataHora <= dataFim.Value);

            return await query
                .OrderByDescending(l => l.DataHora)
                .Take(limite)
                .ToListAsync();
        }

        private string ObterIpCliente()
        {
            var context = _httpContextAccessor.HttpContext;
            if (context == null) return "unknown";

            // Tenta obter IP real (considera proxies)
            var ip = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(ip))
                return ip.Split(',')[0].Trim();

            ip = context.Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(ip))
                return ip;

            return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }

        private string ObterUserAgent()
        {
            var context = _httpContextAccessor.HttpContext;
            return context?.Request.Headers["User-Agent"].ToString() ?? "unknown";
        }
    }
}
