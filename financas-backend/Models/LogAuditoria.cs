namespace financas_backend.Models
{
    public class LogAuditoria
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public string Acao { get; set; } = string.Empty;
        public string Entidade { get; set; } = string.Empty;
        public int? EntidadeId { get; set; }
        public DateTime DataHora { get; set; }
        public string? DadosAntes { get; set; }
        public string? DadosDepois { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }

        // Relacionamento
        public Usuario? Usuario { get; set; }
    }
}