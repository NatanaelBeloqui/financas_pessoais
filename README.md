# 💰 Sistema de Finanças Pessoais

Sistema web completo para controle de finanças pessoais com foco em **segurança** e **boas práticas**.

![Status](https://img.shields.io/badge/status-ativo-success.svg)
![Versão](https://img.shields.io/badge/vers%C3%A3o-1.0.0-blue.svg)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-green.svg)

---

## 🎯 Sobre o Projeto

Sistema web desenvolvido para gerenciamento de finanças pessoais, permitindo aos usuários:
- Controlar receitas e despesas
- Organizar transações por categorias personalizadas
- Visualizar resumos financeiros mensais
- Acompanhar o saldo atual

O projeto foi desenvolvido com **foco em segurança**, implementando proteções contra vulnerabilidades comuns como **XSS, CSRF, SQL Injection** e outras ameaças.

---

## ✨ Funcionalidades

### 🔐 Autenticação e Autorização
- ✅ Cadastro de usuários com validação de senha forte
- ✅ Login com JWT (JSON Web Tokens)
- ✅ Senhas criptografadas com BCrypt
- ✅ Logout com invalidação de sessão
- ✅ Rotas protegidas por autenticação

### 📊 Dashboard
- ✅ Resumo mensal de receitas e despesas
- ✅ Cálculo automático de saldo
- ✅ Cards com gradientes visuais
- ✅ Listagem de transações recentes

### 📂 Gestão de Categorias
- ✅ CRUD completo (Criar, Ler, Atualizar, Deletar)
- ✅ Categorias de Receita e Despesa
- ✅ Descrição opcional
- ✅ Validação de dados
- ✅ Confirmação antes de excluir

### 💳 Gestão de Transações
- ✅ CRUD completo
- ✅ Campos: descrição, valor, data, tipo, categoria
- ✅ Filtros por tipo, categoria e período
- ✅ Formatação de valores monetários
- ✅ Associação com categorias
- ✅ Confirmação antes de excluir

### 🎨 Interface
- ✅ Design moderno e responsivo
- ✅ Menu lateral retrátil (Sidebar)
- ✅ Feedback visual (mensagens de sucesso/erro)
- ✅ Ícones e cores intuitivas
- ✅ CSS puro customizado

---

## 🛠️ Tecnologias Utilizadas

### **Backend**
- **ASP.NET Core 8** - Framework web
- **C#** - Linguagem de programação
- **Entity Framework Core** - ORM
- **MySQL** - Banco de dados
- **JWT** - Autenticação
- **BCrypt** - Hash de senhas
- **Swagger** - Documentação da API (desabilitado em produção)

### **Frontend**
- **React 18** - Biblioteca JavaScript
- **React Router DOM** - Roteamento
- **Axios** - Requisições HTTP
- **Context API** - Gerenciamento de estado
- **CSS3** - Estilização

### **Ferramentas**
- **XAMPP** - Servidor MySQL local
- **MySQL Workbench** - Gerenciamento do banco
- **Visual Studio Code** - Editor de código
- **Git** - Controle de versão

---

## 🏗️ Arquitetura

```
ProjetoCaixeta/
├── financas-backend/          # API em C#
│   ├── Controllers/           # Controladores da API
│   ├── Models/                # Modelos de dados
│   ├── DTOs/                  # Data Transfer Objects
│   ├── Services/              # Lógica de negócio
│   ├── Data/                  # Contexto do banco
│   ├── Helpers/               # Funções auxiliares
│   ├── Migrations/            # Migrações do banco
│   ├── wwwroot/uploads/       # Upload de arquivos
│   ├── appsettings.json       # Configurações
│   └── Program.cs             # Configuração da aplicação
│
└── financas-frontend/         # Interface React
    ├── src/
    │   ├── components/        # Componentes reutilizáveis
    │   │   └── layout/        # Layout (Sidebar, etc)
    │   ├── pages/             # Páginas da aplicação
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Categorias.jsx
    │   │   └── Transacoes.jsx
    │   ├── services/          # Comunicação com API
    │   ├── context/           # Context API (AuthContext)
    │   ├── utils/             # Funções utilitárias
    │   ├── App.jsx            # Componente principal
    │   └── index.css          # Estilos globais
    └── package.json
```

---

## 🔒 Segurança Implementada

### **Proteção contra XSS (Cross-Site Scripting)**
- ✅ React sanitiza automaticamente via Virtual DOM
- ✅ Inputs com `maxLength` para limitar tamanho
- ✅ Validação e escape de dados do usuário
- ✅ Evitado uso de `dangerouslySetInnerHTML`

### **Proteção contra CSRF (Cross-Site Request Forgery)**
- ✅ Token JWT enviado no header `Authorization`
- ✅ CORS configurado para aceitar apenas origem do frontend
- ✅ SameSite cookies (quando necessário)

### **Proteção contra SQL Injection**
- ✅ Entity Framework com queries parametrizadas
- ✅ Frontend não envia SQL diretamente
- ✅ Validação de tipos no backend

### **Autenticação e Autorização**
- ✅ Senhas hasheadas com BCrypt (custo 12)
- ✅ JWT com expiração configurável
- ✅ Validação de senha forte (maiúscula, minúscula, número, especial)
- ✅ Token armazenado em `localStorage` (frontend)
- ✅ Logout remove token e invalida sessão
- ✅ Rotas protegidas por autenticação

### **Validação de Dados**
- ✅ **Frontend:** Validação básica antes de enviar
- ✅ **Backend:** Validação rigorosa (única fonte confiável)
- ✅ Sanitização de inputs (`trim`, escape)
- ✅ Mensagens de erro genéricas (não expõe detalhes internos)

### **Boas Práticas**
- ✅ HTTPS (recomendado em produção)
- ✅ CORS configurado adequadamente
- ✅ Swagger desabilitado em produção
- ✅ Confirmação antes de ações destrutivas (deletar)
- ✅ Logs de auditoria (estrutura criada no banco)

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (v16 ou superior) - [Download](https://nodejs.org/)
- **.NET 8 SDK** - [Download](https://dotnet.microsoft.com/download)
- **MySQL** (via XAMPP ou standalone) - [Download XAMPP](https://www.apachefriends.org/)
- **Git** - [Download](https://git-scm.com/)

---

## 🚀 Instalação

### **1. Clone o repositório**

```bash
git clone https://github.com/seu-usuario/financas-pessoais.git
cd financas-pessoais
```

### **2. Configurar o Backend**

```bash
cd financas-backend

# Restaurar dependências
dotnet restore

# Criar o banco de dados
dotnet ef database update

# OU execute o script SQL manualmente no MySQL Workbench
```

### **3. Configurar o Frontend**

```bash
cd financas-frontend

# Instalar dependências
npm install
```

---

## ⚙️ Configuração

### **Backend - appsettings.json**

Edite o arquivo `financas-backend/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=FinancasDB;User=root;Password=;"
  },
  "JwtSettings": {
    "SecretKey": "ChaveSecretaSuperSeguraParaJWT_2024!",
    "Issuer": "FinancasAPI",
    "Audience": "FinancasApp",
    "ExpirationMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

⚠️ **IMPORTANTE:** Em produção, altere:
- `SecretKey` para uma chave mais longa e aleatória
- `ConnectionString` para as credenciais reais do banco
- `ExpirationMinutes` para um valor menor (15-30 minutos)

### **Frontend - Configuração da API**

Edite o arquivo `financas-frontend/src/services/api.js`:

```javascript
const API_URL = 'http://localhost:5134/api';
// Em produção, altere para a URL real da API
```

---

## ▶️ Executando o Projeto

### **1. Iniciar o MySQL (XAMPP)**

```bash
# Abra o XAMPP Control Panel
# Clique em "Start" no módulo MySQL
# Aguarde até ficar verde
```

### **2. Executar o Backend**

```bash
cd financas-backend
dotnet run
```

A API estará disponível em: `http://localhost:5134`

### **3. Executar o Frontend**

Em outro terminal:

```bash
cd financas-frontend
npm start
```

O frontend estará disponível em: `http://localhost:3000`

### **4. Acessar o Sistema**

1. Abra o navegador em `http://localhost:3000`
2. Crie uma conta na tela de cadastro
3. Faça login
4. Comece a usar! 🎉

---

## 📁 Estrutura de Pastas

### **Backend**

```
financas-backend/
├── Controllers/
│   ├── AuthController.cs         # Login e registro
│   ├── CategoriasController.cs   # CRUD de categorias
│   └── TransacoesController.cs   # CRUD de transações
├── Models/
│   ├── Usuario.cs
│   ├── Categoria.cs
│   ├── Transacao.cs
│   ├── Anexo.cs
│   └── TokenAcesso.cs
├── DTOs/
│   ├── LoginDTO.cs
│   ├── CategoriaDTO.cs
│   └── TransacaoDTO.cs
├── Services/
│   └── AuthService.cs            # Lógica de autenticação
├── Data/
│   └── ApplicationDbContext.cs   # Contexto do EF Core
├── Helpers/
│   └── HashHelper.cs             # BCrypt para senhas
└── Program.cs                     # Configuração da aplicação
```

### **Frontend**

```
financas-frontend/
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── Sidebar.jsx       # Menu lateral
│   │       └── Layout.jsx        # Wrapper do layout
│   ├── pages/
│   │   ├── Login.jsx             # Tela de login
│   │   ├── Register.jsx          # Tela de cadastro
│   │   ├── Dashboard.jsx         # Tela principal
│   │   ├── Categorias.jsx        # Gestão de categorias
│   │   └── Transacoes.jsx        # Gestão de transações
│   ├── services/
│   │   ├── api.js                # Configuração Axios
│   │   ├── authService.js        # Serviço de autenticação
│   │   ├── categoriaService.js   # Serviço de categorias
│   │   └── transacaoService.js   # Serviço de transações
│   ├── context/
│   │   └── AuthContext.jsx       # Contexto de autenticação
│   ├── utils/
│   │   └── formatters.js         # Formatação de moeda e data
│   ├── App.jsx                    # Rotas da aplicação
│   └── index.css                  # Estilos globais
└── package.json
```

---

## 🌐 API Endpoints

### **Autenticação**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/Auth/register` | Cadastrar novo usuário |
| POST | `/api/Auth/login` | Fazer login |

### **Categorias**

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/api/Categorias` | Listar todas | ✅ Requerida |
| GET | `/api/Categorias/{id}` | Buscar por ID | ✅ Requerida |
| POST | `/api/Categorias` | Criar categoria | ✅ Requerida |
| PUT | `/api/Categorias/{id}` | Atualizar categoria | ✅ Requerida |
| DELETE | `/api/Categorias/{id}` | Deletar categoria | ✅ Requerida |

### **Transações**

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/api/Transacoes` | Listar todas | ✅ Requerida |
| GET | `/api/Transacoes/{id}` | Buscar por ID | ✅ Requerida |
| GET | `/api/Transacoes/resumo` | Resumo mensal | ✅ Requerida |
| POST | `/api/Transacoes` | Criar transação | ✅ Requerida |
| PUT | `/api/Transacoes/{id}` | Atualizar transação | ✅ Requerida |
| DELETE | `/api/Transacoes/{id}` | Deletar transação | ✅ Requerida |

---

## 📊 Banco de Dados

### **Tabelas Principais**

```sql
-- Usuarios
CREATE TABLE Usuarios (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Nome VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    SenhaHash VARCHAR(255) NOT NULL,
    DataCadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categorias
CREATE TABLE Categorias (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Nome VARCHAR(50) NOT NULL,
    Tipo ENUM('Receita', 'Despesa') NOT NULL,
    Descricao VARCHAR(200),
    UsuarioId INT NOT NULL,
    FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id)
);

-- Transacoes
CREATE TABLE Transacoes (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Descricao VARCHAR(200) NOT NULL,
    Valor DECIMAL(10,2) NOT NULL,
    Data DATE NOT NULL,
    Tipo ENUM('Receita', 'Despesa') NOT NULL,
    CategoriaId INT NOT NULL,
    UsuarioId INT NOT NULL,
    DataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CategoriaId) REFERENCES Categorias(Id),
    FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id)
);
```

---

## 🚀 Melhorias Futuras

- [ ] Upload de cupons fiscais (anexos)
- [ ] Gráficos de receitas vs despesas (Chart.js)
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Metas financeiras
- [ ] Notificações de vencimento
- [ ] Modo escuro (dark mode)
- [ ] Aplicativo mobile (React Native)
- [ ] Integração com bancos (Open Banking)
- [ ] Backup automático
- [ ] Auditoria completa (logs detalhados)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autores

**Seu Nome** - Desenvolvedor Full Stack
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [Seu Nome](https://linkedin.com/in/seu-perfil)

**Parceiro de Segurança** - Especialista em Segurança
- Responsável por testes de vulnerabilidades e auditorias

---

## 📞 Suporte

Para dúvidas ou sugestões:
- 📧 Email: seu-email@example.com
- 💬 Issues: [GitHub Issues](https://github.com/seu-usuario/financas-pessoais/issues)

---

## 🙏 Agradecimentos

- Comunidade ASP.NET Core
- Comunidade React
- Claude AI (assistente no desenvolvimento)
- Todos que contribuíram com feedback

---

<div align="center">

**Desenvolvido com ❤️ e ☕**

⭐ Se este projeto te ajudou, considere dar uma estrela!

</div>
