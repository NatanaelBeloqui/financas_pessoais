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
    public class TransacoesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly AuditoriaService _auditoriaService;

        public TransacoesController(ApplicationDbContext context, AuditoriaService auditoriaService)
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
        public async Task<ActionResult<IEnumerable<TransacaoResponseDTO>>> GetTransacoes(
            [FromQuery] string? tipo = null,
            [FromQuery] DateTime? dataInicio = null,
            [FromQuery] DateTime? dataFim = null)
        {
            try
            {
                var usuarioId = GetUsuarioId();

                var query = _context.Transacoes
                    .Include(t => t.Categoria)
                    .Where(t => t.UsuarioId == usuarioId);

                if (!string.IsNullOrEmpty(tipo))
                {
                    if (Enum.TryParse<TipoTransacao>(tipo, true, out var tipoEnum))
                    {
                        query = query.Where(t => t.Tipo == tipoEnum);
                    }
                }

                if (dataInicio.HasValue)
                {
                    query = query.Where(t => t.Data >= dataInicio.Value);
                }

                if (dataFim.HasValue)
                {
                    query = query.Where(t => t.Data <= dataFim.Value);
                }

                var transacoes = await query
                    .OrderByDescending(t => t.Data)
                    .Select(t => new TransacaoResponseDTO
                    {
                        Id = t.Id,
                        Descricao = t.Descricao,
                        Valor = t.Valor,
                        Tipo = t.Tipo,
                        Data = t.Data,
                        CategoriaId = t.CategoriaId,
                        CategoriaNome = t.Categoria.Nome,
                        CategoriaCor = t.Categoria.Cor,
                        CategoriaIcone = t.Categoria.Icone,
                        Observacoes = t.Observacoes,
                        Recorrente = t.Recorrente,
                        TipoRecorrencia = t.TipoRecorrencia,
                        DataCriacao = t.DataCriacao,
                        DataAtualizacao = t.DataAtualizacao
                    })
                    .ToListAsync();

                return Ok(transacoes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro no servidor" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TransacaoResponseDTO>> GetTransacao(int id)
        {
            try
            {
                var usuarioId = GetUsuarioId();

                var transacao = await _context.Transacoes
                    .Include(t => t.Categoria)
                    .Where(t => t.Id == id && t.UsuarioId == usuarioId)
                    .Select(t => new TransacaoResponseDTO
                    {
                        Id = t.Id,
                        Descricao = t.Descricao,
                        Valor = t.Valor,
                        Tipo = t.Tipo,
                        Data = t.Data,
                        CategoriaId = t.CategoriaId,
                        CategoriaNome = t.Categoria.Nome,
                        CategoriaCor = t.Categoria.Cor,
                        CategoriaIcone = t.Categoria.Icone,
                        Observacoes = t.Observacoes,
                        Recorrente = t.Recorrente,
                        TipoRecorrencia = t.TipoRecorrencia,
                        DataCriacao = t.DataCriacao,
                        DataAtualizacao = t.DataAtualizacao
                    })
                    .FirstOrDefaultAsync();

                if (transacao == null)
                {
                    return NotFound(new { message = "Transação não encontrada" });
                }

                return Ok(transacao);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro no servidor" });
            }
        }

        [HttpPost]
        public async Task<ActionResult<TransacaoResponseDTO>> CreateTransacao([FromBody] TransacaoCreateDTO dto)
        {
            try
            {
                var usuarioId = GetUsuarioId();

                // Verifica se a categoria pertence ao usuário
                var categoriaExiste = await _context.Categorias
                    .AnyAsync(c => c.Id == dto.CategoriaId && c.UsuarioId == usuarioId);

                if (!categoriaExiste)
                {
                    return BadRequest(new { message = "Categoria inválida" });
                }

                var transacao = new Transacao
                {
                    Descricao = dto.Descricao,
                    Valor = dto.Valor,
                    Tipo = dto.Tipo,
                    Data = dto.Data,
                    CategoriaId = dto.CategoriaId,
                    UsuarioId = usuarioId,
                    Observacoes = dto.Observacoes,
                    Recorrente = dto.Recorrente,
                    TipoRecorrencia = dto.TipoRecorrencia
                };

                _context.Transacoes.Add(transacao);
                await _context.SaveChangesAsync();

                // ✅ REGISTRAR CRIAÇÃO
                await _auditoriaService.RegistrarAcao(
                    usuarioId,
                    "CRIAR",
                    "Transacao",
                    transacao.Id,
                    null,
                    new 
                    { 
                        dto.Descricao, 
                        dto.Valor, 
                        dto.Tipo, 
                        dto.Data, 
                        dto.CategoriaId,
                        dto.Observacoes,
                        dto.Recorrente
                    }
                );

                // Busca a transação criada com a categoria
                var transacaoCriada = await _context.Transacoes
                    .Include(t => t.Categoria)
                    .FirstAsync(t => t.Id == transacao.Id);

                var response = new TransacaoResponseDTO
                {
                    Id = transacaoCriada.Id,
                    Descricao = transacaoCriada.Descricao,
                    Valor = transacaoCriada.Valor,
                    Tipo = transacaoCriada.Tipo,
                    Data = transacaoCriada.Data,
                    CategoriaId = transacaoCriada.CategoriaId,
                    CategoriaNome = transacaoCriada.Categoria.Nome,
                    CategoriaCor = transacaoCriada.Categoria.Cor,
                    CategoriaIcone = transacaoCriada.Categoria.Icone,
                    Observacoes = transacaoCriada.Observacoes,
                    Recorrente = transacaoCriada.Recorrente,
                    TipoRecorrencia = transacaoCriada.TipoRecorrencia,
                    DataCriacao = transacaoCriada.DataCriacao,
                    DataAtualizacao = transacaoCriada.DataAtualizacao
                };

                return CreatedAtAction(nameof(GetTransacao), new { id = transacao.Id }, response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro no servidor" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTransacao(int id, [FromBody] TransacaoUpdateDTO dto)
        {
            try
            {
                var usuarioId = GetUsuarioId();

                var transacao = await _context.Transacoes
                    .FirstOrDefaultAsync(t => t.Id == id && t.UsuarioId == usuarioId);

                if (transacao == null)
                {
                    return NotFound(new { message = "Transação não encontrada" });
                }

                // Verifica se a categoria pertence ao usuário
                var categoriaExiste = await _context.Categorias
                    .AnyAsync(c => c.Id == dto.CategoriaId && c.UsuarioId == usuarioId);

                if (!categoriaExiste)
                {
                    return BadRequest(new { message = "Categoria inválida" });
                }

                // ✅ SALVAR DADOS ANTERIORES
                var dadosAntes = new
                {
                    transacao.Descricao,
                    transacao.Valor,
                    transacao.Tipo,
                    transacao.Data,
                    transacao.CategoriaId,
                    transacao.Observacoes,
                    transacao.Recorrente,
                    transacao.TipoRecorrencia
                };

                transacao.Descricao = dto.Descricao;
                transacao.Valor = dto.Valor;
                transacao.Tipo = dto.Tipo;
                transacao.Data = dto.Data;
                transacao.CategoriaId = dto.CategoriaId;
                transacao.Observacoes = dto.Observacoes;
                transacao.Recorrente = dto.Recorrente;
                transacao.TipoRecorrencia = dto.TipoRecorrencia;
                transacao.DataAtualizacao = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // ✅ REGISTRAR EDIÇÃO
                await _auditoriaService.RegistrarAcao(
                    usuarioId,
                    "EDITAR",
                    "Transacao",
                    id,
                    dadosAntes,
                    new 
                    { 
                        dto.Descricao, 
                        dto.Valor, 
                        dto.Tipo, 
                        dto.Data, 
                        dto.CategoriaId,
                        dto.Observacoes,
                        dto.Recorrente
                    }
                );

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro no servidor" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransacao(int id)
        {
            try
            {
                var usuarioId = GetUsuarioId();

                var transacao = await _context.Transacoes
                    .FirstOrDefaultAsync(t => t.Id == id && t.UsuarioId == usuarioId);

                if (transacao == null)
                {
                    return NotFound(new { message = "Transação não encontrada" });
                }

                // ✅ SALVAR DADOS ANTES DE DELETAR
                var dadosAntes = new
                {
                    transacao.Descricao,
                    transacao.Valor,
                    transacao.Tipo,
                    transacao.Data,
                    transacao.CategoriaId
                };

                _context.Transacoes.Remove(transacao);
                await _context.SaveChangesAsync();

                // ✅ REGISTRAR EXCLUSÃO
                await _auditoriaService.RegistrarAcao(
                    usuarioId,
                    "DELETAR",
                    "Transacao",
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

        [HttpGet("resumo")]
        public async Task<ActionResult> GetResumo([FromQuery] int? mes = null, [FromQuery] int? ano = null)
        {
            try
            {
                var usuarioId = GetUsuarioId();
                var mesAtual = mes ?? DateTime.UtcNow.Month;
                var anoAtual = ano ?? DateTime.UtcNow.Year;

                var transacoes = await _context.Transacoes
                    .Where(t => t.UsuarioId == usuarioId
                        && t.Data.Month == mesAtual
                        && t.Data.Year == anoAtual)
                    .ToListAsync();

                var totalReceitas = transacoes
                    .Where(t => t.Tipo == TipoTransacao.Receita)
                    .Sum(t => t.Valor);

                var totalDespesas = transacoes
                    .Where(t => t.Tipo == TipoTransacao.Despesa)
                    .Sum(t => t.Valor);

                var saldo = totalReceitas - totalDespesas;

                return Ok(new
                {
                    mes = mesAtual,
                    ano = anoAtual,
                    totalReceitas,
                    totalDespesas,
                    saldo,
                    quantidadeTransacoes = transacoes.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro no servidor" });
            }
        }
    }
}