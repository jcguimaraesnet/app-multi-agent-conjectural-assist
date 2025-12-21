# Conjectural Assist - Backend API

Backend FastAPI para o sistema Conjectural Assist, responsável pelo processamento de documentos e extração de requisitos usando IA.

## Stack Tecnológica

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Python | 3.11+ | Linguagem principal |
| FastAPI | ≥0.109 | Framework web async |
| PyPDF2 | ≥3.0 | Extração de texto de PDFs |
| pdfplumber | ≥0.10 | Extração de tabelas de PDFs |
| google-genai | ≥1.0 | Google GenAI SDK (Gemini) |
| supabase-py | ≥2.0 | Cliente Supabase |
| Pydantic | ≥2.5 | Validação de dados |

## Estrutura do Projeto

```
backend/
├── main.py                    # Entrada da aplicação FastAPI
├── requirements.txt           # Dependências Python
├── .env.example               # Exemplo de variáveis de ambiente
├── .gitignore
└── app/
    ├── __init__.py
    ├── config.py              # Configurações (env vars)
    ├── routers/
    │   ├── __init__.py
    │   ├── projects.py        # Endpoints de projetos
    │   └── requirements.py    # Endpoints de requisitos
    ├── services/
    │   ├── __init__.py
    │   ├── document_parser.py      # Extração de texto (PyPDF2)
    │   ├── requirement_extractor.py # Extração de requisitos (pdfplumber + Gemini)
    │   └── supabase_client.py      # Cliente Supabase
    └── models/
        ├── __init__.py
        └── schemas.py         # Schemas Pydantic
```

## Configuração

### 1. Criar ambiente virtual

```bash
cd backend
uv venv
```

### 2. Instalar dependências

```bash
uv pip install -r requirements.txt
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
```

### 4. Executar o servidor

```bash
# Desenvolvimento (com hot reload)
uv run uvicorn main:app --reload --port 8000

# Produção
python main.py
```

## API Endpoints

### Health Check

| Method | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Informações da API |
| GET | `/health` | Status de saúde |

### Projects

| Method | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/projects/vision/extract` | Extrai texto de documento de visão (PDF) |
| POST | `/api/projects/requirements/extract` | Extrai requisitos de documento (PDF) |
| POST | `/api/projects` | Cria um novo projeto |
| GET | `/api/projects` | Lista todos os projetos do usuário |
| GET | `/api/projects/{id}` | Obtém um projeto específico |
| DELETE | `/api/projects/{id}` | Deleta um projeto |

### Requirements

| Method | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/requirements/project/{project_id}` | Lista requisitos de um projeto |
| POST | `/api/requirements` | Cria um novo requisito |
| GET | `/api/requirements/{id}` | Obtém um requisito específico |
| PUT | `/api/requirements/{id}` | Atualiza um requisito |
| DELETE | `/api/requirements/{id}` | Deleta um requisito |

## Exemplos de Uso

### Extrair texto de documento de visão (Step 2)

```bash
curl -X POST "http://localhost:8000/api/projects/vision/extract" \
  -F "file=@vision_document.pdf"
```

**Resposta:**
```json
{
  "text": "Extracted text content...",
  "metadata": {
    "page_count": 5,
    "title": "Project Vision",
    "author": "Author Name"
  },
  "char_count": 15000,
  "page_count": 5
}
```

### Extrair requisitos de documento (Step 3)

```bash
curl -X POST "http://localhost:8000/api/projects/requirements/extract" \
  -F "file=@requirements_document.pdf"
```

**Resposta:**
```json
{
  "functional": [
    {
      "id": "REQ-F001",
      "description": "The system shall allow users to login with email and password"
    }
  ],
  "non_functional": [
    {
      "id": "REQ-NF001",
      "description": "The system shall respond to requests within 2 seconds",
      "category": "performance"
    }
  ]
}
```

### Criar projeto completo

```bash
curl -X POST "http://localhost:8000/api/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user_id>" \
  -d '{
    "title": "My Project",
    "description": "Project description",
    "vision_extracted_text": "Extracted vision text..."
  }'
```

## Categorias de Requisitos Não-Funcionais

| Categoria | Descrição |
|-----------|-----------|
| interoperability | Integração com outros sistemas |
| reliability | Confiabilidade e tolerância a falhas |
| performance | Velocidade, throughput, tempo de resposta |
| availability | Disponibilidade do sistema |
| scalability | Capacidade de escalar |
| maintainability | Facilidade de manutenção |
| portability | Portabilidade entre plataformas |
| security | Segurança de dados e acesso |
| usability | Usabilidade e experiência do usuário |
| regulatory | Requisitos legais e de conformidade |
| constraint | Restrições técnicas ou de negócio |

## Documentação Interativa

Com o servidor rodando, acesse:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Banco de Dados (Supabase)

### Tabela: projects

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Primary key |
| user_id | UUID | FK para auth.users |
| title | TEXT | Título do projeto |
| description | TEXT | Descrição |
| vision_document_url | TEXT | URL do documento de visão |
| vision_document_name | TEXT | Nome do arquivo |
| vision_extracted_text | TEXT | Texto extraído |
| requirements_document_url | TEXT | URL do documento de requisitos |
| requirements_document_name | TEXT | Nome do arquivo |
| created_at | TIMESTAMPTZ | Data de criação |
| updated_at | TIMESTAMPTZ | Data de atualização |

### Tabela: requirements

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Primary key |
| project_id | UUID | FK para projects |
| requirement_id | TEXT | ID externo (REQ-F001) |
| type | ENUM | functional, non_functional, conjectural |
| description | TEXT | Descrição do requisito |
| category | ENUM | Categoria do NFR (nullable) |
| created_at | TIMESTAMPTZ | Data de criação |
| updated_at | TIMESTAMPTZ | Data de atualização |
