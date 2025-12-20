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
| pnpm | - | Gerenciador de pacotes |

## Estrutura do Projeto

```
src/
 app/
    globals.css            # Estilos globais + config Tailwind v4
    layout.tsx             # Layout raiz com ThemeProvider
    page.tsx               # Página Home
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
 lib/
    utils.ts              # Funções utilitárias (cn)
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

- `GEMINI_API_KEY` - Chave de API do Google Gemini (definir em `.env.local`)

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

### Planejadas
- ⬜ Autenticação com Supabase
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

### ❌ NÃO FAZER
- Não usar `class components`
- Não usar `any` como tipo TypeScript
- Não adicionar novas bibliotecas sem justificativa
- Não criar arquivos CSS separados (usar Tailwind)
- Não usar estilos inline com `style={{}}`
- Não usar `React.FC<Props>` (preferir função nomeada)
- Não usar condicionais JS para ícones de tema (usar classes CSS)

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
