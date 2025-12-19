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
    globals.css         # Estilos globais + config Tailwind v4
    layout.tsx          # Layout raiz
    page.tsx            # Página principal (Requirements)
 components/
    layout/
       Header.tsx      # Cabeçalho com seletor de projeto e tema
       Sidebar.tsx     # Menu lateral de navegação
    requirements/
       RequirementsTable.tsx  # Tabela de requisitos
    ui/
        Badge.tsx       # Badge para tipos de requisitos
 constants/
    index.ts            # Dados mock e constantes
 lib/
    utils.ts            # Funções utilitárias (cn)
 types/
     index.ts            # Definições de tipos TypeScript
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
-  Listagem de requisitos em tabela
-  Filtro por tipo de requisito
-  Busca por título/descrição
-  Alternância de tema claro/escuro
-  Seletor de projeto
-  Seletor de modelo de IA
-  Migração para Next.js App Router

### Planejadas
-  Autenticação com Supabase
-  CRUD de requisitos no Supabase
-  Cadastro de configurações
-  Cadastro de projetos
-  Upload de documentos (PDF, DOCX, TXT)
-  Backend Python com LangGraph para requisitos conjecturais

## Diretrizes para Agentes de IA

###  FAZER
- Usar componentes funcionais com hooks
- Adicionar `"use client"` em componentes com estado/eventos
- Manter tipagem TypeScript em todo código
- Seguir padrões de estilização Tailwind existentes
- Usar ícones do `lucide-react`
- Manter suporte a dark mode em novos componentes
- Usar path alias `@/` para imports

###  NÃO FAZER
- Não usar `class components`
- Não usar `any` como tipo TypeScript
- Não adicionar novas bibliotecas sem justificativa
- Não criar arquivos CSS separados (usar Tailwind)
- Não usar estilos inline com `style={{}}`
- Não usar `React.FC<Props>` (preferir função nomeada)

###  Ao Criar Novos Componentes
1. Criar arquivo na pasta apropriada (`ui/`, `layout/`, etc.)
2. Definir interface para props
3. Adicionar `"use client"` se usar hooks/eventos
4. Incluir classes `dark:` para suporte a tema escuro
5. Seguir padrão visual dos componentes existentes

###  Ao Criar Novas Rotas
1. Criar pasta em `src/app/` com nome da rota
2. Adicionar `page.tsx` como componente da página
3. Usar `layout.tsx` se precisar de layout específico

## Contexto Acadêmico

Este projeto faz parte de uma pesquisa sobre **sistemas multiagentes conjecturais** para elicitação de requisitos. O termo "Conjectural" nos tipos de requisitos refere-se a requisitos hipotéticos ou especulativos que podem ser sugeridos por agentes de IA.

---

*Última atualização: Dezembro 2025*
