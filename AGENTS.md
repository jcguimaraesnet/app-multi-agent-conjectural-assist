# AGENTS.md - Guia para Agentes de IA

## Sobre o Projeto

**Conjectural Assist** é uma aplicação web para gerenciamento de requisitos de software, desenvolvida como parte de um projeto acadêmico da UFRJ sobre sistemas multiagentes conjecturais. Migrado para Next.js com App Router.

## Stack Tecnológica

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Next.js | 16.x | Framework React com SSR/SSG |
| React | 19.x | UI Framework |
| TypeScript | ~5.9 | Tipagem estática |
| Tailwind CSS | 4.x | Estilização |
| Lucide React | ^0.562.0 | Ícones |
| Supabase | ^2.x | Backend as a Service (Auth, Database) |
| pnpm | - | Gerenciador de pacotes |

## Estrutura do Projeto

```
src/
 app/
    globals.css            # Estilos globais + config Tailwind v4
    layout.tsx             # Layout raiz com ThemeProvider e AuthProvider
    page.tsx               # Página Home
    auth/
       actions.ts         # Server actions para autenticação
       login/page.tsx     # Página de login
       signup/page.tsx    # Página de cadastro
       forgot-password/page.tsx # Recuperação de senha
       confirm/route.ts   # Handler de confirmação de email
       signout/route.ts   # Handler de logout
       error/page.tsx     # Página de erro de autenticação
    projects/
       page.tsx           # Página de Projetos
    requirements/
       page.tsx           # Página de Requisitos
    settings/
       page.tsx           # Página de Configurações
 components/
    layout/
       AppLayout.tsx      # Layout compartilhado (Sidebar + Header + container)
       Header.tsx         # Cabeçalho com seletor de projeto, tema e perfil
       Sidebar.tsx        # Menu lateral de navegação com rotas ativas
    projects/
       ProjectsTable.tsx  # Tabela de projetos
       ProjectsToolbar.tsx # Toolbar de busca e ações de projetos
    requirements/
       RequirementsTable.tsx   # Tabela de requisitos
       RequirementsToolbar.tsx # Toolbar com filtros e busca
       ActiveFilters.tsx       # Chips de filtros ativos
    settings/
       SettingsPanel.tsx  # Painel de configurações
    ui/
       Badge.tsx          # Badge para tipos de requisitos
       PageTitle.tsx      # Título de página reutilizável
 constants/
    index.ts              # Dados mock e constantes
 contexts/
    ThemeContext.tsx      # Contexto global para dark mode
    AuthContext.tsx       # Contexto global para autenticação
 lib/
    utils.ts              # Funções utilitárias (cn)
    supabase/
       client.ts          # Cliente Supabase para browser
       server.ts          # Cliente Supabase para server components
       middleware.ts      # Utilitário para middleware de sessão
 middleware.ts            # Next.js middleware para proteção de rotas
 types/
    index.ts              # Definições de tipos TypeScript
```

## Padrões de Arquitetura

### AppLayout
Todas as páginas usam o componente `AppLayout` para estrutura consistente:

```tsx
// Uso básico (largura padrão 5xl)
<AppLayout>
  <PageTitle title="Requirements" />
  {/* conteúdo da página */}
</AppLayout>

// Com largura customizada
<AppLayout maxWidth="3xl">
  <PageTitle title="Settings" />
  {/* conteúdo da página */}
</AppLayout>
```

### Componentização de Toolbars
Cada domínio tem sua própria toolbar componentizada:
- `RequirementsToolbar` - filtros, busca, export, add
- `ProjectsToolbar` - busca, add

### Gerenciamento de Tema (Dark Mode)
- `ThemeContext` gerencia estado global do tema
- Script inline no `layout.tsx` previne flash de tema incorreto
- Ícones usam classes CSS (`dark:block`/`dark:hidden`) ao invés de JS condicional
- Tema persiste via `localStorage`

```tsx
// Uso do hook de tema
const { isDarkMode, toggleTheme } = useTheme();
```

## Convenções de Código

### Componentes React
- **Componentes funcionais** com função nomeada `export default function Component()`
- **Hooks** padrão do React (useState, useEffect)
- Arquivos de componente em **PascalCase** (ex: `RequirementsTable.tsx`)
- Um componente por arquivo
- Props definidas via interfaces TypeScript
- Componentes com interatividade devem usar `"use client"`

### TypeScript
- Interfaces para props de componentes
- Enums para valores categóricos (ex: `RequirementType`)
- Path alias `@/*` configurado para `src/`

### Estilização (Tailwind CSS v4)
- Configuração via `@theme` no `globals.css`
- Suporte a **Dark Mode** com classe `dark:` 
- Cores customizadas:
  - `primary`: `#E86F28` (laranja)
  - `surface-dark/light`: cores de superfície
  - `background-dark/light`: cores de fundo
  - `border-dark/light`: cores de borda
- Fonte padrão: **Inter**

### Padrões de UI
- Bordas arredondadas (`rounded-lg`, `rounded-xl`)
- Transições suaves (`transition-colors duration-200`)
- Sombras sutis (`shadow-sm`, `shadow-lg`)
- Responsividade com classes Tailwind (`sm:`, etc.)

## Tipos Principais

```typescript
enum RequirementType {
  Functional = 'Functional',
  NonFunctional = 'Non-Functional',
  Conjectural = 'Conjectural'
}

interface Requirement {
  id: string;
  title: string;
  description: string;
  type: RequirementType;
  author: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  requirementsCount: number;
  lastUpdated: string;
}
```

## Scripts Disponíveis

```bash
pnpm dev      # Inicia servidor de desenvolvimento (porta 3000)
pnpm build    # Build para produção
pnpm start    # Inicia servidor de produção
pnpm lint     # Executa ESLint
```

## Variáveis de Ambiente

Copie `.env.local.example` para `.env.local` e configure:

```bash
# Supabase Configuration (obrigatório)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional
GEMINI_API_KEY=your-gemini-api-key
```

## Autenticação (Supabase Auth)

### Arquitetura
- **AuthContext** (`src/contexts/AuthContext.tsx`) - Gerencia estado de sessão no cliente
- **Middleware** (`src/middleware.ts`) - Protege rotas e atualiza tokens
- **Server Actions** (`src/app/auth/actions.ts`) - Login, signup, logout, reset password

### Fluxo de Autenticação
1. Usuário não autenticado é redirecionado para `/auth/login`
2. Login com email/senha via `signInWithPassword`
3. Signup armazena `first_name` e `last_name` no `user_metadata`
4. Trigger no Supabase cria perfil automaticamente em `public.profiles`
5. Sessão é mantida via cookies (gerenciado por `@supabase/ssr`)

### Páginas de Auth
- `/auth/login` - Login com email e senha
- `/auth/signup` - Cadastro com nome, sobrenome, email e senha
- `/auth/forgot-password` - Solicitar reset de senha
- `/auth/error` - Exibir erros de autenticação

### Proteção de Rotas
O middleware protege todas as rotas exceto:
- `/auth/*` - Páginas de autenticação
- `/` - Página inicial (permitida)
- Arquivos estáticos

### Uso do AuthContext

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, profile, isLoading, signOut } = useAuth();
  
  if (isLoading) return <Loading />;
  
  return (
    <div>
      <p>Welcome, {profile?.first_name}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Tabela de Perfis (Supabase)

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Conta Padrão para Desenvolvimento
Para criar um usuário de teste, acesse `/auth/signup` e registre:
- **First Name**: Júlio
- **Last Name**: Guimarães  
- **Email**: jcguimaraes@gmail.com
- **Password**: senha123

## Funcionalidades

### Implementadas
- ✅ Navegação multi-página (Home, Projects, Requirements, Settings)
- ✅ Listagem de requisitos em tabela com ações (visualizar, excluir)
- ✅ Filtro por tipo de requisito
- ✅ Busca por título/descrição
- ✅ Chips de filtros ativos com remoção
- ✅ Listagem de projetos em tabela
- ✅ Busca de projetos
- ✅ Alternância de tema claro/escuro persistente
- ✅ Prevenção de flash de tema no carregamento
- ✅ Seletor de projeto no header
- ✅ Seletor de modelo de IA
- ✅ Menu de perfil com opção de logout
- ✅ Página de configurações com toggles e inputs numéricos
- ✅ Layout compartilhado (AppLayout)
- ✅ Componentes reutilizáveis (PageTitle, Toolbars)
- ✅ Autenticação com Supabase (login, signup, forgot password)
- ✅ Proteção de rotas para usuários autenticados
- ✅ Tabela de perfis com trigger automático

### Planejadas
- ⬜ CRUD de requisitos no Supabase
- ⬜ CRUD de projetos no Supabase
- ⬜ Persistência de configurações
- ⬜ Upload de documentos (PDF, DOCX, TXT)
- ⬜ Backend Python com LangGraph para requisitos conjecturais

## Diretrizes para Agentes de IA

### ✅ FAZER
- Usar componentes funcionais com hooks
- Adicionar `"use client"` em componentes com estado/eventos
- Manter tipagem TypeScript em todo código
- Seguir padrões de estilização Tailwind existentes
- Usar ícones do `lucide-react`
- Manter suporte a dark mode em novos componentes
- Usar path alias `@/` para imports
- Usar `AppLayout` como wrapper para novas páginas
- Usar `PageTitle` para títulos de página
- Componentizar toolbars específicas de domínio
- **Escrever todos os labels, textos e mensagens da UI em inglês americano (en-US)**

### ❌ NÃO FAZER
- Não usar `class components`
- Não usar `any` como tipo TypeScript
- Não adicionar novas bibliotecas sem justificativa
- Não criar arquivos CSS separados (usar Tailwind)
- Não usar estilos inline com `style={{}}`
- Não usar `React.FC<Props>` (preferir função nomeada)
- Não usar condicionais JS para ícones de tema (usar classes CSS)
- **Não usar português ou outros idiomas nos textos da interface**

### 📁 Ao Criar Novos Componentes
1. Criar arquivo na pasta apropriada (`ui/`, `layout/`, `[domínio]/`)
2. Definir interface para props
3. Adicionar `"use client"` se usar hooks/eventos
4. Incluir classes `dark:` para suporte a tema escuro
5. Seguir padrão visual dos componentes existentes

### 🗂️ Ao Criar Novas Rotas
1. Criar pasta em `src/app/` com nome da rota
2. Adicionar `page.tsx` como componente da página
3. Usar `AppLayout` como wrapper
4. Usar `PageTitle` para o título
5. Adicionar rota no `Sidebar.tsx` se necessário

## Contexto Acadêmico

Este projeto faz parte de uma pesquisa sobre **sistemas multiagentes conjecturais** para elicitação de requisitos. O termo "Conjectural" nos tipos de requisitos refere-se a requisitos hipotéticos ou especulativos que podem ser sugeridos por agentes de IA.

---

*Última atualização: Dezembro 2025*
