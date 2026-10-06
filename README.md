# Painel de Beneficiário BPC do Recife

Sistema de gestão e acompanhamento de beneficiários do Benefício de Prestação Continuada (BPC) do Município do Recife, com backend construído em **Node.js + Fastify**, persistência e migrações relacionais em **MySQL** e frontend moderno em **React (Vite + Tailwind CSS)**.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js** (v18+ recomendado)
- **MySQL Server** (v5.7+ ou v8.0+) em execução local ou remota

### 1. Clonar e Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie ou edite o arquivo `.env` na raiz do projeto com base no `.env.example`:
```env
# Configurações do MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=sua_senha_aqui
MYSQL_DATABASE=bpc_recife_db

# Ou via Connection String URL completa (opcional):
# DATABASE_URL=mysql://root:senha@localhost:3306/bpc_recife_db
```

> **Nota sobre Migrações Automáticas**: Ao iniciar o servidor com `npm run dev`, o backend garante a criação automática do banco `bpc_recife_db` (`CREATE DATABASE IF NOT EXISTS`), executa o DDL de todas as tabelas e povoa com dados iniciais (seeds) caso as tabelas estejam vazias. Caso o MySQL não esteja rodando, o sistema ativa automaticamente o modo de fallback em memória (Standby).

### 3. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```
O servidor estará acessível em: `http://localhost:3000`

---

## 🗄️ Entidades e Modelagem Relacional (MySQL)

O sistema implementa o modelo relacional de controle de acesso (RBAC) e gestão de dados do BPC:

1. **`usuarios`**: `id`, `nome`, `email`, `senha` (hash bcrypt), `ativo`, `data_criacao`, `data_atualizacao`
2. **`papeis`**: `id`, `nome`, `descricao`, `data_criacao`, `data_atualizacao`
3. **`permissoes`**: `id`, `nome`, `descricao`, `data_criacao`, `data_atualizacao`
4. **`usuario_papel`**: `usuario_id` (FK -> `usuarios.id`), `papel_id` (FK -> `papeis.id`)
5. **`papel_permissao`**: `papel_id` (FK -> `papeis.id`), `permissao_id` (FK -> `permissoes.id`)
6. **`beneficiarios_bpc`**: `id`, `numero_beneficio`, `nis`, `nome_beneficiario`, `cpf_mascarado`, `tipo_beneficio`, `bairro_recife`, `rpa_recife`, `valor_mensal`, `status_cadastral`, `cras_referencia`, `data_concessao`, `data_ultima_atualizacao`

---

## 📚 Documentação Completa dos Endpoints da API

Todas as rotas da API possuem o prefixo `/api` e respondem no formato `application/json`.

---

### 1. Sistema & Diagnóstico do Banco de Dados

#### `GET /api/health`
Retorna o status de saúde do servidor Fastify.
- **Resposta (200 OK)**:
```json
{
  "status": "online",
  "server": "Fastify / Node.js",
  "service": "Painel de Beneficiário BPC do Recife API",
  "timestamp": "2026-09-29T14:30:00.000Z"
}
```

#### `GET /api/db-status`
Retorna o status detalhado da conexão com o banco MySQL, modo de operação e métricas em tempo real.
- **Resposta (200 OK)**:
```json
{
  "connected": true,
  "mode": "MYSQL_LIVE",
  "engine": "MySQL / Fastify Node.js",
  "host": "localhost",
  "port": 3306,
  "user": "root",
  "database": "bpc_recife_db",
  "migrationsExecuted": true,
  "lastError": null,
  "stats": {
    "totalUsuarios": 5,
    "totalPapeis": 5,
    "totalPermissoes": 10,
    "totalBeneficiarios": 8
  }
}
```

#### `POST /api/db-test-connection`
Força a reexecução do método `initDbConnection()`, tentando reconectar ao MySQL, criar o banco, rodar as migrações DDL e seeds.
- **Resposta (200 OK)**: Retorna o objeto de status atualizado do banco de dados (mesmo formato de `/api/db-status`).

#### `GET /api/schema/sql`
Retorna o script SQL DDL completo de criação das tabelas e a estrutura detalhada de colunas e chaves estrangeiras.
- **Resposta (200 OK)**:
```json
{
  "sql": "CREATE TABLE IF NOT EXISTS usuarios (...);",
  "entities": [
    {
      "name": "usuarios",
      "columns": ["id (PK, AUTO_INCREMENT)", "nome VARCHAR(255)", "email VARCHAR(255) UNIQUE", "..."]
    }
  ]
}
```

---

### 2. Autenticação (JWT - JSON Web Token)

O sistema utiliza tokens **JWT (JSON Web Token)** assinados com algoritmo HMAC SHA-256 e validade de 12 horas.
Para acessar os endpoints protegidos, o cliente deve enviar o cabeçalho HTTP:
```http
Authorization: Bearer <seu_token_jwt>
```

#### `POST /api/auth/login`
Autentica um usuário através de seu e-mail e senha cadastrados (validação com hash bcrypt).
- **Body**:
```json
{
  "email": "alberto.barbieri@recife.pe.gov.br",
  "senha": "admin123"
}
```
- **Resposta (200 OK)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibm9tZSI6IkFsYmVydG8gQmFyYmllcmki...",
  "usuario": {
    "id": 1,
    "nome": "Alberto Barbieri",
    "email": "alberto.barbieri@recife.pe.gov.br",
    "ativo": true,
    "papeis": [
      { "id": 1, "nome": "Administrador Geral" },
      { "id": 2, "nome": "Gestor Municipal BPC" }
    ],
    "permissoes": [
      "bpc:visualizar",
      "bpc:cadastrar",
      "bpc:editar",
      "bpc:excluir",
      "bpc:exportar",
      "usuarios:gerenciar",
      "papeis:gerenciar",
      "permissoes:gerenciar",
      "auditoria:visualizar",
      "relatorios:gerenciais"
    ]
  },
  "message": "Autenticado com sucesso via JWT."
}
```
- **Erros**:
  - `400 Bad Request`: `{"success": false, "error": "Email é obrigatório para autenticação."}`
  - `401 Unauthorized`: `{"success": false, "error": "Credenciais inválidas ou senha incorreta."}`
  - `403 Forbidden`: `{"success": false, "error": "Conta de usuário desativada pelo administrador."}`

#### `GET /api/auth/me`
*Rota Protegida por JWT (`Authorization: Bearer <token>`)*.
Retorna os dados cadastrais, perfil, papéis e permissões do usuário atualmente autenticado na sessão.
- **Resposta (200 OK)**:
```json
{
  "success": true,
  "usuario": {
    "id": 1,
    "nome": "Alberto Barbieri",
    "email": "alberto.barbieri@recife.pe.gov.br",
    "ativo": true,
    "papeis": [
      { "id": 1, "nome": "Administrador Geral" }
    ],
    "permissoes": ["bpc:visualizar", "usuarios:gerenciar", "..."]
  }
}
```
- **Erros**:
  - `401 Unauthorized`: Token ausente, inválido ou expirado.

---

### 3. Gestão de Usuários (`usuarios` & `usuario_papel`)

#### `GET /api/usuarios`
Lista todos os usuários cadastrados, com os nomes e IDs dos seus respectivos papéis associados.
- **Resposta (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Alberto Barbieri",
      "email": "alberto.barbieri@recife.pe.gov.br",
      "ativo": true,
      "data_criacao": "2025-01-10 08:30:00",
      "data_atualizacao": "2025-01-10 08:30:00",
      "papeis": [1, 2],
      "papeis_nomes": ["Administrador Geral", "Gestor Municipal BPC"]
    }
  ],
  "total": 1
}
```

#### `POST /api/usuarios`
Cadastra um novo usuário no banco de dados com senha criptografada (bcrypt) e vincula seus papéis em `usuario_papel`.
- **Body**:
```json
{
  "nome": "Novo Gestor Social",
  "email": "gestor@recife.pe.gov.br",
  "senha": "SenhaForte@2025",
  "ativo": true,
  "papeis": [2, 3]
}
```
- **Resposta (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": 6,
    "nome": "Novo Gestor Social",
    "email": "gestor@recife.pe.gov.br",
    "ativo": true,
    "data_criacao": "2026-09-29 14:35:00",
    "data_atualizacao": "2026-09-29 14:35:00",
    "papeis": [2, 3],
    "papeis_nomes": ["Gestor Municipal BPC", "Assistente Social / CRAS"]
  },
  "message": "Usuário cadastrado com sucesso."
}
```
- **Erros**:
  - `400 Bad Request`: Nome/e-mail ausentes ou e-mail duplicado.

#### `PUT /api/usuarios/:id`
Atualiza dados cadastrais, status ativo/inativo, senha ou reatribui os papéis do usuário.
- **Parâmetros de URL**: `id` (número inteiro)
- **Body**:
```json
{
  "nome": "Alberto Barbieri Atualizado",
  "email": "alberto.barbieri@recife.pe.gov.br",
  "ativo": true,
  "papeis": [1]
}
```
- **Resposta (200 OK)**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Usuário atualizado com sucesso."
}
```

#### `DELETE /api/usuarios/:id`
Remove um usuário do banco de dados (as associações em `usuario_papel` são excluídas automaticamente via chave estrangeira `ON DELETE CASCADE`).
- **Parâmetros de URL**: `id` (número inteiro)
- **Resposta (200 OK)**:
```json
{
  "success": true,
  "message": "Usuário removido com sucesso."
}
```

---

### 4. Gestão de Papéis (`papeis` & `papel_permissao`)

#### `GET /api/papeis`
Retorna todos os perfis/papéis cadastrados, com a listagem de permissões e a contagem de usuários associados.
- **Resposta (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Administrador Geral",
      "descricao": "Acesso irrestrito a todas as funções...",
      "data_criacao": "2025-01-01 08:00:00",
      "data_atualizacao": "2025-01-01 08:00:00",
      "permissoes": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      "permissoes_nomes": ["bpc:visualizar", "bpc:cadastrar", "bpc:editar", "..."],
      "total_usuarios": 1
    }
  ],
  "total": 1
}
```

#### `POST /api/papeis`
Cria um novo papel de acesso e vincula as permissões informadas via `papel_permissao`.
- **Body**:
```json
{
  "nome": "Coordenador Regional RPA",
  "descricao": "Coordenação de atendimentos das RPAs do Recife",
  "permissoes": [1, 2, 3, 5, 10]
}
```
- **Resposta (201 Created)**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Papel criado com sucesso."
}
```

#### `PUT /api/papeis/:id`
Atualiza o nome, descrição ou a matriz de permissões associadas a um papel.
- **Parâmetros de URL**: `id` (número inteiro)
- **Body**:
```json
{
  "nome": "Coordenador Regional RPA",
  "descricao": "Nova descrição",
  "permissoes": [1, 3, 5]
}
```
- **Resposta (200 OK)**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Papel atualizado com sucesso."
}
```

#### `DELETE /api/papeis/:id`
Exclui um papel do catálogo e remove suas associações em cascata.
- **Parâmetros de URL**: `id` (número inteiro)
- **Resposta (200 OK)**:
```json
{
  "success": true,
  "message": "Papel removido com sucesso."
}
```

---

### 5. Catálogo de Permissões (`permissoes`)

#### `GET /api/permissoes`
Lista todas as permissões cadastradas no catálogo do sistema.
- **Resposta (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "bpc:visualizar",
      "descricao": "Permite visualizar fichas e lista de beneficiários do BPC Recife",
      "data_criacao": "2025-01-01 08:00:00",
      "data_atualizacao": "2025-01-01 08:00:00"
    },
    {
      "id": 2,
      "nome": "bpc:cadastrar",
      "descricao": "Permite cadastrar novo registro de beneficiário ou solicitação BPC",
      "data_criacao": "2025-01-01 08:00:00",
      "data_atualizacao": "2025-01-01 08:00:00"
    }
  ],
  "total": 2
}
```

#### `POST /api/permissoes`
Cadastra uma nova chave de permissão no catálogo.
- **Body**:
```json
{
  "nome": "cadunico:sincronizar",
  "descricao": "Permite acionar a rotina de sincronização CadÚnico"
}
```
- **Resposta (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": 11,
    "nome": "cadunico:sincronizar",
    "descricao": "Permite acionar a rotina de sincronização CadÚnico",
    "data_criacao": "2026-09-29 14:40:00",
    "data_atualizacao": "2026-09-29 14:40:00"
  },
  "message": "Permissão criada com sucesso."
}
```

#### `DELETE /api/permissoes/:id`
Remove uma permissão do catálogo do sistema.
- **Parâmetros de URL**: `id` (número inteiro)
- **Resposta (200 OK)**:
```json
{
  "success": true,
  "message": "Permissão removida com sucesso."
}
```

---

### 6. Beneficiários BPC do Recife (`beneficiarios_bpc`)

#### `GET /api/beneficiarios-bpc`
Consulta a listagem de beneficiários com suporte a filtros combinados e totalizador de repasses municipais.
- **Query Parameters (Opcionais)**:
  - `query`: Termo de busca textual (nome, número de benefício, NIS, bairro ou CRAS)
  - `tipo`: Tipo de benefício (`TODOS`, `BPC_IDOSO`, `BPC_PCD`)
  - `status`: Situação cadastral (`TODOS`, `REGULAR`, `EM_REVISAO`, `BLOQUEADO`, `PENDENCIA_CADUNICO`)
  - `rpa`: Região Político-Administrativa (`TODOS`, `RPA 1` a `RPA 6`)
- **Exemplo de Requisição**:
  ```http
  GET /api/beneficiarios-bpc?tipo=BPC_IDOSO&rpa=RPA%203
  ```
- **Resposta (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "numero_beneficio": "870.192.831-2",
      "nis": "128.94821.90-3",
      "nome_beneficiario": "Severina Maria de Jesus Cavalcanti",
      "cpf_mascarado": "***.482.194-**",
      "tipo_beneficio": "BPC_IDOSO",
      "bairro_recife": "Casa Amarela",
      "rpa_recife": "RPA 3",
      "valor_mensal": 1412.00,
      "status_cadastral": "REGULAR",
      "cras_referencia": "CRAS Alto do Mandu / Casa Amarela",
      "data_concessao": "2018-04-12",
      "data_ultima_atualizacao": "2025-02-10 10:14:00"
    }
  ],
  "total": 1,
  "resumo": {
    "totalGeral": 1,
    "idosos": 1,
    "pcd": 0,
    "regulares": 1,
    "emRevisao": 0,
    "bloqueados": 0,
    "pendenciaCadUnico": 0,
    "totalRepasseMensal": 1412.00
  }
}
```

#### `POST /api/beneficiarios-bpc`
Insere um novo beneficiário BPC no banco de dados.
- **Body**:
```json
{
  "numero_beneficio": "880.123.456-7",
  "nis": "199.12345.67-8",
  "nome_beneficiario": "Maria de Lourdes Bezerra",
  "cpf_mascarado": "***.789.012-**",
  "tipo_beneficio": "BPC_IDOSO",
  "bairro_recife": "Afogados",
  "rpa_recife": "RPA 5",
  "valor_mensal": 1412.00,
  "status_cadastral": "REGULAR",
  "cras_referencia": "CRAS Afogados / San Martin",
  "data_concessao": "2024-03-01"
}
```
- **Resposta (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": 9,
    "numero_beneficio": "880.123.456-7",
    "nis": "199.12345.67-8",
    "nome_beneficiario": "Maria de Lourdes Bezerra",
    "cpf_mascarado": "***.789.012-**",
    "tipo_beneficio": "BPC_IDOSO",
    "bairro_recife": "Afogados",
    "rpa_recife": "RPA 5",
    "valor_mensal": 1412.00,
    "status_cadastral": "REGULAR",
    "cras_referencia": "CRAS Afogados / San Martin",
    "data_concessao": "2024-03-01",
    "data_ultima_atualizacao": "2026-09-29 14:42:00"
  },
  "message": "Beneficiário cadastrado com sucesso."
}
```
- **Erros**:
  - `400 Bad Request`: `{"success": false, "error": "Campos obrigatórios ausentes."}`

---

## 🛠️ Resumo de Códigos de Status HTTP

| Código | Significado | Quando é utilizado |
|---|---|---|
| `200 OK` | Sucesso | Consultas, atualizações e exclusões realizadas com êxito |
| `201 Created` | Criado | Cadastros de novos usuários, papéis, permissões e beneficiários |
| `400 Bad Request` | Requisição Inválida | Campos obrigatórios ausentes, duplicados ou formato inválido |
| `401 Unauthorized` | Não Autorizado | Credenciais inválidas no login |
| `403 Forbidden` | Proibido | Conta inativa ou sem permissão de acesso |
| `404 Not Found` | Não Encontrado | Rota de API ou recurso não existente |
| `500 Internal Server Error` | Erro do Servidor | Exceção inesperada na camada de banco de dados ou backend |

---

## 📄 Licença
Desenvolvido para o **Painel de Beneficiário BPC do Recife**.
