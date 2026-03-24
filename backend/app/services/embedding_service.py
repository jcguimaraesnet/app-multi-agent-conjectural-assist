"""
Embedding service for semantic similarity using Azure OpenAI text-embedding-3-small.

Uses a fixed embedding model hosted on Azure regardless of the user's LLM
provider choice, ensuring all embeddings are always comparable.
"""

import os
from typing import List, Dict, Any, Optional

import numpy as np
from openai import AsyncAzureOpenAI, AzureOpenAI

from app.services.supabase_client import get_async_supabase_client, get_supabase_client

EMBEDDING_DEPLOYMENT = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1536


def _get_azure_client() -> AzureOpenAI:
    return AzureOpenAI(
        api_key=os.environ.get("AZURE_OPENAI_API_KEY"),
        azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
        api_version=os.environ.get("AZURE_OPENAI_API_VERSION", "2025-03-01-preview"),
    )


def _get_async_azure_client() -> AsyncAzureOpenAI:
    return AsyncAzureOpenAI(
        api_key=os.environ.get("AZURE_OPENAI_API_KEY"),
        azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
        api_version=os.environ.get("AZURE_OPENAI_API_VERSION", "2025-03-01-preview"),
    )


async def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """Generate embeddings for a list of texts using Azure text-embedding-3-small."""
    if not texts:
        return []

    client = _get_async_azure_client()
    response = await client.embeddings.create(
        model=EMBEDDING_DEPLOYMENT,
        input=texts,
    )
    return [item.embedding for item in response.data]


def generate_embeddings_sync(texts: List[str]) -> List[List[float]]:
    """Generate embeddings synchronously (for use in sync persistence code)."""
    if not texts:
        return []

    client = _get_azure_client()
    response = client.embeddings.create(
        model=EMBEDDING_DEPLOYMENT,
        input=texts,
    )
    return [item.embedding for item in response.data]


def _parse_embedding(raw) -> Optional[List[float]]:
    """Parse an embedding from Supabase (may be a string, list, or None)."""
    if raw is None:
        return None
    if isinstance(raw, list):
        return raw
    if isinstance(raw, str):
        import json as _json
        try:
            return _json.loads(raw)
        except _json.JSONDecodeError:
            return None
    return None


async def fetch_existing_embeddings(project_id: str) -> List[Dict[str, Any]]:
    """Fetch existing positive_impact embeddings for a project via Supabase RPC."""
    if not project_id:
        return []

    supabase = await get_async_supabase_client()
    try:
        result = await supabase.rpc(
            "match_positive_impact_embeddings",
            {"query_project_id": project_id, "match_count": 50},
        ).execute()
        rows = result.data or []
        # Parse embedding strings into float lists
        for row in rows:
            row["embedding"] = _parse_embedding(row.get("embedding"))
        return [r for r in rows if r.get("embedding") is not None]
    except Exception as e:
        print(f"[Embedding] Error fetching existing embeddings: {e}")
        return []


def _cosine_similarity(a: List[float], b: List[float]) -> float:
    """Compute cosine similarity between two vectors."""
    va = np.array(a)
    vb = np.array(b)
    dot = np.dot(va, vb)
    norm = np.linalg.norm(va) * np.linalg.norm(vb)
    if norm == 0:
        return 0.0
    return float(dot / norm)


def select_most_diverse(
    candidate_texts: List[str],
    candidate_embeddings: List[List[float]],
    existing_embeddings: List[List[float]],
    count: int,
) -> List[int]:
    """Select the `count` candidates most different from existing embeddings.

    Uses max cosine distance: for each candidate, compute the maximum
    similarity against all existing embeddings. The candidates with
    the lowest max-similarity are the most diverse.

    Returns indices into the candidate lists.
    """
    if not existing_embeddings:
        return list(range(min(count, len(candidate_texts))))

    # For each candidate, compute max similarity against all existing
    max_similarities: List[float] = []
    for c_emb in candidate_embeddings:
        max_sim = max(_cosine_similarity(c_emb, e_emb) for e_emb in existing_embeddings)
        max_similarities.append(max_sim)

    # Sort by max_similarity ascending (least similar first)
    ranked_indices = sorted(range(len(max_similarities)), key=lambda i: max_similarities[i])

    selected = ranked_indices[:count]

    for idx in selected:
        print(f"  [Embedding] Selected candidate {idx}: max_similarity={max_similarities[idx]:.4f} — {candidate_texts[idx][:80]}")

    return selected


def select_most_diverse_among(
    texts: List[str],
    embeddings: List[List[float]],
    count: int,
) -> List[int]:
    """Select the `count` most diverse items among themselves using greedy max-min.

    1. Start with the pair of embeddings most distant from each other.
    2. Iteratively add the embedding with the greatest minimum distance
       to the already-selected set.

    Returns indices into the input lists.
    """
    n = len(texts)
    if n <= count:
        return list(range(n))

    # Precompute pairwise similarity matrix
    sim_matrix = np.zeros((n, n))
    for i in range(n):
        for j in range(i + 1, n):
            sim = _cosine_similarity(embeddings[i], embeddings[j])
            sim_matrix[i][j] = sim
            sim_matrix[j][i] = sim

    # Step 1: Find the pair with minimum similarity (most distant)
    min_sim = float("inf")
    seed_a, seed_b = 0, 1
    for i in range(n):
        for j in range(i + 1, n):
            if sim_matrix[i][j] < min_sim:
                min_sim = sim_matrix[i][j]
                seed_a, seed_b = i, j

    selected = [seed_a, seed_b]

    # Step 2: Greedily add the most diverse remaining item
    while len(selected) < count:
        best_idx = -1
        best_min_dist = -1.0
        for i in range(n):
            if i in selected:
                continue
            # Min distance to any already-selected item (distance = 1 - similarity)
            min_dist = min(1.0 - sim_matrix[i][s] for s in selected)
            if min_dist > best_min_dist:
                best_min_dist = min_dist
                best_idx = i
        selected.append(best_idx)

    for idx in selected:
        print(f"  [Embedding] Diverse selection [{idx}]: {texts[idx][:80]}")

    return selected


def is_similar_to_existing(
    candidate_embedding: List[float],
    existing_embeddings: List[List[float]],
    threshold: float = 0.85,
) -> bool:
    """Check if a candidate is similar to any existing embedding (above threshold)."""
    if not existing_embeddings:
        return False

    max_sim = max(_cosine_similarity(candidate_embedding, e_emb) for e_emb in existing_embeddings)
    print(f"  [Embedding] Similarity check: max_similarity={max_sim:.4f}, threshold={threshold}")
    return max_sim >= threshold
