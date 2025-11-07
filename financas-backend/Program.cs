// Program.cs

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using financas_backend.Data;
using financas_backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Configuração do DbContext (MySQL)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Configuração de Autenticação JWT
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("SecretKey não configurada");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Configuração de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Adiciona Controllers
builder.Services.AddControllers();

// Adiciona Services
builder.Services.AddScoped<AuthService>();

var app = builder.Build();

// ====================================
// 🔒 MIDDLEWARE DE HEADERS DE SEGURANÇA
// ====================================
app.Use(async (context, next) =>
{
    // Content Security Policy - Previne XSS e injection attacks
    context.Response.Headers.Append("Content-Security-Policy",
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' data:; " +
        "connect-src 'self' http://localhost:3000; " +
        "frame-ancestors 'none'");

    // X-Frame-Options - Previne Clickjacking
    context.Response.Headers.Append("X-Frame-Options", "DENY");

    // X-Content-Type-Options - Previne MIME sniffing
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");

    // X-XSS-Protection - Proteção adicional contra XSS (legacy browsers)
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");

    // Referrer-Policy - Controla informações de referência
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");

    // Permissions-Policy - Controla APIs do navegador
    context.Response.Headers.Append("Permissions-Policy",
        "geolocation=(), " +
        "microphone=(), " +
        "camera=(), " +
        "payment=(), " +
        "usb=(), " +
        "magnetometer=()");

    // Strict-Transport-Security (HSTS) - Força HTTPS
    // ⚠️ DESCOMENTE APENAS EM PRODUÇÃO COM HTTPS CONFIGURADO
    // context.Response.Headers.Append("Strict-Transport-Security", 
    //     "max-age=31536000; includeSubDomains; preload");

    // Remove headers que expõem informações do servidor
    context.Response.Headers.Remove("Server");
    context.Response.Headers.Remove("X-Powered-By");
    context.Response.Headers.Remove("X-AspNet-Version");
    context.Response.Headers.Remove("X-AspNetMvc-Version");

    await next();
});

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles();
app.MapControllers();

app.Run();