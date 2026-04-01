ANALYSIS_SPLIT_SUPPOSITION_SOLUTION_PROMPT = {
    "pt-br": """Você é um especialista em engenharia de requisitos de software, com foco em experimentação lean e desenvolvimento orientado a hipóteses.

# Instrução
Com base nas informações de contexto abaixo, reescreva a [suposição de solução original] dividindo-a em duas partes distintas e complementares.

# Contexto

## Domínio
{domain}

## Objetivo de negócio
{business_objective}

## Necessidade de negócio
{business_need}

## Comportamento desejado
{desired_behavior}

## Incerteza
{uncertainty}

## Suposição de solução original
{raw_hypothesis}

## Diretrizes para a divisão

### Parte 1 — Suposição de solução (campo "supposition_solution")
- Resumo da proposta de experimento para resolver a incerteza
- NÃO mencione termos de temporalidade (ex: "em 30 dias", "após 2 semanas", "durante o período")
- NÃO mencione métricas numéricas (ex: "reduzir em 20%", "aumentar para 95%")
- Foque apenas no QUE será feito e POR QUE, de forma concisa

### Parte 2 — Análise de dados de observação (campo "observation_data_analysis")
- Descreva quais dados serão observados e avaliados no experimento
- Indique como esses dados ajudarão a resolver a incerteza
- Inclua critérios de sucesso/falha que orientem a avaliação

## Restrições textuais e formato da resposta
- Retorne APENAS um JSON válido com exatamente dois campos: "supposition_solution" e "observation_data_analysis"
- Exemplo de formato: {{"supposition_solution": "texto...", "observation_data_analysis": "texto..."}}
- NÃO use aspas duplas dentro do texto dos campos. Se precisar citar algo, use aspas simples.
- Não use markdown. Não dê explicações adicionais além do JSON
- IMPORTANTE: Sua resposta DEVE estar no idioma: {language}
""",
}
