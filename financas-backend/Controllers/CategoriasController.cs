using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using financas_backend.Data;
using financas_backend.DTOs;
using financas_backend.Models;
using financas_backend.Services;

namespace financas_backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly AuditoriaService _auditoriaService;

        public CategoriasController(ApplicationDbContext context, AuditoriaService auditoriaService)
        {
            _context = context;
            _auditoriaService = auditoriaService;
        }

        private int GetUsuarioId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim ?? "0");
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoriaResponseDTO>>> GetCategorias([FromQuery] string? tipo = null)
        {
            try
            {
                var usuarioId = GetUsuarioId();

                var query = _context.Categorias
                    .Where(c => c.UsuarioId == usuarioId && c.Ativo);

                if (!string.IsNullOrEmpty(tipo))
                {
                    if (Enum.TryParse<TipoTransacao>(tipo, true, out var tipoEnum))
                    {
                        query = query.Where(c => c.Tipo == tipoEnum);
                    }
                }

                var categorias = await query
                    .Select(c => new CategoriaResponseDTO
                    {
                        Id = c.Id,
                        Nome = c.Nome,
                        Tipo = c.Tipo,
                        Cor = c.Cor,
                        Icone = c.Icone,
                        Ativo = c.Ativo,
                        DataCriacao = c.DataCriacao
                    })
                    .ToListAsync();

                return Ok(categorias);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro no servidor" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoriaResponseDTO>> GetCategoria(int id)
        {
            try
            {
                var usuarioId = GetUsuarioId();

                var categoria = await _context.Categorias
                    .Where(c => c.Id == id && c.UsuarioId == usuarioId)
                    .Select(c => new CategoriaResponseDTO
                    {
                        Id = c.Id,
                        Nome = c.Nome,
                        Tipo = c.Tipo,
                        Cor = c.Cor,
                        Icone = c.Icone,
                        Ativo = c.Ativo,
                        DataCriacao = c.DataCriacao
                    })
                    .FirstOrDefaultAsync();

                if (categoria == null)
                {
                    return NotFound(new { message = "Categoria não encontrada" });
                }

                return Ok(categoria);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro no servidor" });
            }
        }

        [HttpPost]
        public async Task<ActionResult<CategoriaResponseDTO>> CreateCategoria([FromBody] CategoriaCreateDTO dto)
        {
            try
            {
                var usuarioId = GetUsuarioId();

                var categoria = new Categoria
                {
                    Nome = dto.Nome,
                    Tipo = dto.Tipo,
                    Cor = dto.Cor,
                    Icone = dto.Icone,
                    UsuarioId = usuarioId
                };

                _context.Categorias.Add(categoria);
                await _context.SaveChangesAsync();

                // ✅ REGISTRAR CRIAÇÃO
                await _auditoriaService.RegistrarAcao(
                    usuarioId,
                    "CRIAR",
                    "Categoria",
                    categoria.Id,
                    null,
                    new { dto.Nome, dto.Tipo, dto.Cor, dto.Icone }
                );

                var response = new CategoriaResponseDTO
                {
                    Id = categoria.Id,
                    Nome = categoria.Nome,
                    Tipo = categoria.Tipo,
                    Cor = categoria.Cor,
                    Icone = categoria.Icone,
                    Ativo = categoria.Ativo,
                    DataCriacao = categoria.DataCriacao
                };

                return CreatedAtAction(nameof(GetCategoria), new { id = categoria.Id }, response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro no servidor" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategoria(int id, [FromBody] CategoriaUpdateDTO dto)
        {
            try
            {
                var usuarioId = GetUsuarioId();

                var categoria = await _context.Categorias
                    .FirstOrDefaultAsync(c => c.Id == id && c.UsuarioId == usuarioId);

                if (categoria == null)
                {
                    return NotFound(new { message = "Categoria não encontrada" });
                }

                // ✅ SALVAR DADOS ANTERIORES
                var dadosAntes = new
                {
                    categoria.Nome,
                    categoria.Cor,
                    categoria.Icone,
                    categoria.Ativo
                };

                categoria.Nome = dto.Nome;
                categoria.Cor = dto.Cor;
                categoria.Icone = dto.Icone;
                categoria.Ativo = dto.Ativo;

                await _context.SaveChangesAsync();

                // ✅ REGISTRAR EDIÇÃO
                await _auditoriaService.RegistrarAcao(
                    usuarioId,
                    "EDITAR",
                    "Categoria",
                    id,
                    dadosAntes,
                    new { dto.Nome, dto.Cor, dto.Icone, dto.Ativo }
                );

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro no servidor" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategoria(int id)
        {
            try
            {
                var usuarioId = GetUsuarioId();

                var categoria = await _context.Categorias
                    .FirstOrDefaultAsync(c => c.Id == id && c.UsuarioId == usuarioId);

                if (categoria == null)
                {
                    return NotFound(new { message = "Categoria não encontrada" });
                }

                // Verifica se há transações usando essa categoria
                var temTransacoes = await _context.Transacoes
                    .AnyAsync(t => t.CategoriaId == id);

                if (temTransacoes)
                {
                    // ✅ REGISTRAR TENTATIVA DE EXCLUSÃO NEGADA
                    await _auditoriaService.RegistrarAcao(
                        usuarioId,
                        "DELETAR_NEGADO",
                        "Categoria",
                        id,
                        new { categoria.Nome, Motivo = "Categoria possui transações associadas" },
                        null
                    );

                    return BadRequest(new { message = "Não é possível excluir categoria com transações associadas" });
                }

                // ✅ SALVAR DADOS ANTES DE DELETAR
                var dadosAntes = new
                {
                    categoria.Nome,
                    categoria.Tipo,
                    categoria.Cor,
                    categoria.Icone
                };

                _context.Categorias.Remove(categoria);
                await _context.SaveChangesAsync();

                // ✅ REGISTRAR EXCLUSÃO
                await _auditoriaService.RegistrarAcao(
                    usuarioId,
                    "DELETAR",
                    "Categoria",
                    id,
                    dadosAntes,
                    null
                );

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro no servidor" });
            }
        }
    }
}