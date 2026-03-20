SPECIFICATION_CONJECTURAL_REFINEMENT_PROMPT = {
    "en": """You are an expert in software requirements specification with uncertainties.

Your task is to generate an **improved version** of a conjectural requirement specification based on a previous attempt and its quality evaluation.

## Project Context

**Project Summary:**
{project_summary}

**Business Domain:** {domain}

**Primary Stakeholder:** {stakeholder}

**Business Objective:** {business_objective}

## Previous Conjectural Requirement (to be improved)

[FERC]
- **Desired behavior:** {prev_desired_behavior}
- **Positive impact:** {prev_positive_impact}
- **Uncertainties:** {prev_uncertainties}

[QESS]
- **Solution assumption:** {prev_solution_assumption}
- **Uncertainty evaluated:** {prev_uncertainty_evaluated}
- **Observation & analysis:** {prev_observation_analysis}

## LLM-as-Judge Evaluation of the Previous Requirement

{evaluation_summary}

## Instruction

Based on the evaluation above, generate an **improved version** of this conjectural requirement that addresses the weaknesses identified by the evaluator.
Focus especially on criteria that received low scores (1-3) and follow the justifications provided.

The improved requirement MUST still follow the FERC + QESS structure:

**Writing Format for Conjectural Requirements (FERC):**
**It is expected that the software system has** [desired behavior]
**So that** [need or positive impact of the desired attribute]
**However, we do not know:**
- **Uncertainty:** [uncertainty associated with this requirement — one or many]

**Solution Assumption Experimentation Framework (QESS):**
**We expect that** [description of the solution assumption]
**Will result in updating the uncertainties about** [only one of the uncertainties that will be evaluated]
**As a result of** [description of the observation and analysis that will result in updating the uncertainties]

You MUST return ONLY a valid JSON object (no markdown, no explanation) with:
- "ferc": an object with:
  - "desired_behavior": the [desired behavior] part of the FERC (string)
  - "positive_impact": the [need or positive impact] part of the FERC (string)
  - "uncertainties": list of uncertainty strings (array of strings)
- "qess": an object with:
  - "solution_assumption": the [description of the solution assumption] (string)
  - "uncertainty_evaluated": the [one uncertainty that will be evaluated] (string)
  - "observation_analysis": the [observation and analysis description] (string)
""",
    "pt-br": """Você é um especialista em especificação de requisitos de software com incertezas.

Sua tarefa é gerar uma **versão melhorada** de uma especificação de requisito conjectural com base em uma tentativa anterior e sua avaliação de qualidade.

## Contexto do Projeto

**Resumo do Projeto:**
{project_summary}

**Domínio de Negócio:** {domain}

**Stakeholder Principal:** {stakeholder}

**Objetivo de Negócio:** {business_objective}

## Requisito Conjectural Anterior (a ser melhorado)

[FERC]
- **Comportamento desejado:** {prev_desired_behavior}
- **Impacto positivo:** {prev_positive_impact}
- **Incertezas:** {prev_uncertainties}

[QESS]
- **Suposição de solução:** {prev_solution_assumption}
- **Incerteza avaliada:** {prev_uncertainty_evaluated}
- **Observação e análise:** {prev_observation_analysis}

## Avaliação LLM-as-Judge do Requisito Anterior

{evaluation_summary}

## Instrução

Com base na avaliação acima, gere uma **versão melhorada** deste requisito conjectural que aborde as fraquezas identificadas pelo avaliador.
Foque especialmente nos critérios que receberam pontuações baixas (1-3) e siga as justificativas fornecidas.

O requisito melhorado DEVE seguir a estrutura FERC + QESS:

**Formato de Escrita para Requisitos Conjecturais (FERC):**
**É esperado que o sistema de software tenha** [comportamento desejado]
**De modo que** [necessidade ou impacto positivo do atributo desejado]
**Porém, não sabemos:**
- **Incerteza:** [incerteza associada a este requisito — uma ou várias]

**Framework de Experimentação de Suposição de Solução (QESS):**
**Esperamos que** [descrição da suposição de solução]
**Resulte na atualização das incertezas sobre** [apenas uma das incertezas que será avaliada]
**Como resultado de** [descrição da observação e análise que resultará na atualização das incertezas]

Você DEVE retornar APENAS um objeto JSON válido (sem markdown, sem explicação) com:
- "ferc": um objeto com:
  - "desired_behavior": a parte [comportamento desejado] do FERC (string)
  - "positive_impact": a parte [necessidade ou impacto positivo] do FERC (string)
  - "uncertainties": lista de strings de incertezas (array de strings)
- "qess": um objeto com:
  - "solution_assumption": a [descrição da suposição de solução] (string)
  - "uncertainty_evaluated": a [uma incerteza que será avaliada] (string)
  - "observation_analysis": a [descrição da observação e análise] (string)
""",
}
