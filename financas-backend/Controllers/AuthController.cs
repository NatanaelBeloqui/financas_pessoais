using financas_backend.Data;
using financas_backend.DTOs;
using financas_backend.Helpers;
using financas_backend.Models;
using financas_backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace financas_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly AuthService _authService;
        private readonly AuditoriaService _auditoriaService;
        private readonly IConfiguration _configuration;

        public AuthController(
            ApplicationDbContext context, 
            AuthService authService, 
            AuditoriaService auditoriaService,
            IConfiguration configuration)
        {
            _context = context;
            _authService = authService;
            _auditoriaService = auditoriaService;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDTO>> Register(RegisterDTO registerDto)
        {
            try
            {
                // Verifica se email já existe
                if (await _context.Usuarios.AnyAsync(u => u.Email == registerDto.Email))
                {
                    return BadRequest(new { message = "Email já cadastrado" });
                }

                // Cria o usuário
                var salt = HashHelper.GenerateSalt();
                var usuario = new Usuario
                {
                    Nome = registerDto.Nome,
                    Email = registerDto.Email,
                    Salt = salt,
                    PasswordHash = HashHelper.HashPassword(registerDto.Password, salt),
                    EmailConfirmado = true // Por enquanto, sem confirmação de email
                };

                _context.Usuarios.Add(usuario);
                await _context.SaveChangesAsync();

                // ✅ REGISTRAR CADASTRO
                await _auditoriaService.RegistrarAcao(
                    usuario.Id,
                    "CRIAR",
                    "Usuario",
                    usuario.Id,
                    null,
                    new { Email = usuario.Email, Nome = usuario.Nome }
                );

                // Gera tokens
                var token = _authService.GenerateJwtToken(usuario);
                var refreshToken = _authService.GenerateRefreshToken();

                // Salva refresh token
                var jwtSettings = _configuration.GetSection("JwtSettings");
                var refreshTokenExpiration = int.Parse(jwtSettings["RefreshTokenExpirationDays"] ?? "7");

                var tokenAcesso = new TokenAcesso
                {
                    UsuarioId = usuario.Id,
                    RefreshToken = refreshToken,
                    DataExpiracao = DateTime.UtcNow.AddDays(refreshTokenExpiration),
                    IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                    UserAgent = HttpContext.Request.Headers["User-Agent"].ToString()
                };

                _context.TokensAcesso.Add(tokenAcesso);
                await _context.SaveChangesAsync();

                // ✅ REGISTRAR LOGIN AUTOMÁTICO APÓS CADASTRO
                await _auditoriaService.RegistrarLogin(usuario.Id, usuario.Email, true);

                return Ok(new AuthResponseDTO
                {
                    Token = token,
                    RefreshToken = refreshToken,
                    Expiration = DateTime.UtcNow.AddMinutes(int.Parse(jwtSettings["ExpirationMinutes"] ?? "60")),
                    Usuario = new UsuarioDTO
                    {
                        Id = usuario.Id,
                        Nome = usuario.Nome,
                        Email = usuario.Email
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro no servidor" });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDTO>> Login(LoginDTO loginDto)
        {
            try
            {
                var usuario = await _context.Usuarios
                    .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

                if (usuario == null)
                {
                    // ✅ REGISTRAR LOGIN FALHADO (usuário não encontrado)
                    await _auditoriaService.RegistrarLogin(null, loginDto.Email, false);
                    return Unauthorized(new { message = "Email ou senha inválidos" });
                }

                // Verifica se conta está bloqueada
                if (usuario.ContaBloqueada)
                {
                    // ✅ REGISTRAR TENTATIVA DE ACESSO EM CONTA BLOQUEADA
                    await _auditoriaService.RegistrarAcao(
                        usuario.Id,
                        "LOGIN_BLOQUEADO",
                        "Usuario",
                        usuario.Id,
                        null,
                        new { Email = loginDto.Email, Motivo = "Conta bloqueada" }
                    );
                    return Unauthorized(new { message = "Conta bloqueada. Contate o suporte." });
                }

                // Verifica senha
                if (!HashHelper.VerifyPassword(loginDto.Password, usuario.Salt, usuario.PasswordHash))
                {
                    // Incrementa tentativas falhadas
                    usuario.TentativasLoginFalhadas++;

                    if (usuario.TentativasLoginFalhadas >= 5)
                    {
                        usuario.ContaBloqueada = true;
                        usuario.DataBloqueio = DateTime.UtcNow;

                        // ✅ REGISTRAR BLOQUEIO POR TENTATIVAS EXCESSIVAS
                        await _auditoriaService.RegistrarAcao(
                            usuario.Id,
                            "CONTA_BLOQUEADA",
                            "Usuario",
                            usuario.Id,
                            null,
                            new { Email = loginDto.Email, Motivo = "Tentativas excessivas de login", Tentativas = usuario.TentativasLoginFalhadas }
                        );
                    }

                    await _context.SaveChangesAsync();

                    // ✅ REGISTRAR LOGIN FALHADO (senha incorreta)
                    await _auditoriaService.RegistrarLogin(usuario.Id, loginDto.Email, false);

                    return Unauthorized(new { message = "Email ou senha inválidos" });
                }

                // Reset tentativas falhadas
                usuario.TentativasLoginFalhadas = 0;
                usuario.UltimoLogin = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // Gera tokens
                var token = _authService.GenerateJwtToken(usuario);
                var refreshToken = _authService.GenerateRefreshToken();

                // Salva refresh token
                var jwtSettings = _configuration.GetSection("JwtSettings");
                var refreshTokenExpiration = int.Parse(jwtSettings["RefreshTokenExpirationDays"] ?? "7");

                var tokenAcesso = new TokenAcesso
                {
                    UsuarioId = usuario.Id,
                    RefreshToken = refreshToken,
                    DataExpiracao = DateTime.UtcNow.AddDays(refreshTokenExpiration),
                    IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                    UserAgent = HttpContext.Request.Headers["User-Agent"].ToString()
                };

                _context.TokensAcesso.Add(tokenAcesso);
                await _context.SaveChangesAsync();

                // ✅ REGISTRAR LOGIN SUCESSO
                await _auditoriaService.RegistrarLogin(usuario.Id, loginDto.Email, true);

                return Ok(new AuthResponseDTO
                {
                    Token = token,
                    RefreshToken = refreshToken,
                    Expiration = DateTime.UtcNow.AddMinutes(int.Parse(jwtSettings["ExpirationMinutes"] ?? "60")),
                    Usuario = new UsuarioDTO
                    {
                        Id = usuario.Id,
                        Nome = usuario.Nome,
                        Email = usuario.Email
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro no servidor" });
            }
        }
    }
}