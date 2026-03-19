"""
Dashboard Router

Endpoints that return pre-computed chart data for the project dashboard.
"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional, List, Dict, Any
from uuid import UUID
import statistics

from app.services.supabase_client import get_supabase_client


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _get_user_id(authorization: Optional[str]) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    return parts[1]


def _fetch_evaluations(project_id: str) -> List[Dict[str, Any]]:
    """Fetch all evaluations for a project via conjectural_requirements join."""
    supabase = get_supabase_client()
    result = supabase.table("conjectural_requirements") \
        .select("id, evaluations(*)") \
        .eq("project_id", project_id) \
        .execute()

    evals: List[Dict[str, Any]] = []
    for req in result.data or []:
        for ev in req.get("evaluations") or []:
            evals.append(ev)
    return evals


CRITERIA = ["unambiguous", "completeness", "atomicity", "verifiable", "conforming"]


# ── 1. Radar Chart ────────────────────────────────────────────────────────────

@router.get("/radar/{project_id}")
async def radar_chart(
    project_id: UUID,
    authorization: Optional[str] = Header(None),
):
    """
    Average scores across all requirements and attempts, grouped by evaluation type.
    """
    _get_user_id(authorization)
    try:
        evals = _fetch_evaluations(str(project_id))
        if not evals:
            return {"llm": None, "human": None}

        def avg_by_type(eval_type: str):
            subset = [e for e in evals if e.get("type") == eval_type]
            if not subset:
                return None
            result = {}
            for c in CRITERIA:
                vals = [e[c] for e in subset if e.get(c) is not None]
                result[c] = round(sum(vals) / len(vals), 2) if vals else 0
            overalls = [e.get("overall_score") for e in subset if e.get("overall_score") is not None]
            result["overall_score"] = round(sum(overalls) / len(overalls), 2) if overalls else 0
            return result

        return {"llm": avg_by_type("llm"), "human": avg_by_type("human")}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute radar data: {e}")


# ── 2. Boxplot ────────────────────────────────────────────────────────────────

@router.get("/boxplot/{project_id}")
async def boxplot_chart(
    project_id: UUID,
    authorization: Optional[str] = Header(None),
):
    """
    Boxplot statistics of overall_score grouped by attempt and evaluation type (llm/human).
    Returns min, q1, median, q3, max for each attempt+type combination.
    """
    _get_user_id(authorization)
    try:
        evals = _fetch_evaluations(str(project_id))
        if not evals:
            return {"attempts": [], "has_human": False}

        # Group by (attempt, type)
        by_key: Dict[tuple, List[float]] = {}
        has_human = False
        for e in evals:
            attempt = e.get("attempt")
            eval_type = e.get("type")  # "llm" or "human"
            score = e.get("overall_score")
            if attempt is not None and score is not None and eval_type:
                by_key.setdefault((attempt, eval_type), []).append(score)
                if eval_type == "human":
                    has_human = True

        def _quartiles(scores: List[float]) -> dict:
            scores = sorted(scores)
            n = len(scores)
            q1 = statistics.median(scores[: n // 2]) if n > 1 else scores[0]
            q3 = statistics.median(scores[(n + 1) // 2 :]) if n > 1 else scores[0]
            return {
                "min": round(scores[0], 2),
                "q1": round(q1, 2),
                "median": round(statistics.median(scores), 2),
                "q3": round(q3, 2),
                "max": round(scores[-1], 2),
            }

        result = []
        for (attempt, eval_type) in sorted(by_key.keys()):
            scores = by_key[(attempt, eval_type)]
            if not scores:
                continue
            entry = {"attempt": attempt, "type": eval_type, **_quartiles(scores)}
            result.append(entry)

        return {"attempts": result, "has_human": has_human}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute boxplot data: {e}")


# ── 3. Confusion Matrix ──────────────────────────────────────────────────────

@router.get("/confusion-matrix/{project_id}")
async def confusion_matrix_chart(
    project_id: UUID,
    authorization: Optional[str] = Header(None),
):
    """
    Confusion matrix comparing LLM predictions vs Human ground truth.
    Positive class: scores 4-5. Negative class: scores 1-3.
    Each criterion is treated as an independent observation.
    """
    _get_user_id(authorization)
    try:
        evals = _fetch_evaluations(str(project_id))
        if not evals:
            return {"tp": 0, "fp": 0, "fn": 0, "tn": 0}

        # Group evaluations by (requirement_id, attempt) to pair LLM and Human
        pairs: Dict[str, Dict[str, Dict]] = {}
        for e in evals:
            key = f"{e.get('requirement_id')}_{e.get('attempt')}"
            pairs.setdefault(key, {})
            pairs[key][e["type"]] = e

        tp = fp = fn = tn = 0
        for pair in pairs.values():
            llm_eval = pair.get("llm")
            human_eval = pair.get("human")
            if not llm_eval or not human_eval:
                continue

            for c in CRITERIA:
                llm_score = llm_eval.get(c)
                human_score = human_eval.get(c)
                if llm_score is None or human_score is None:
                    continue

                llm_pos = llm_score >= 4
                human_pos = human_score >= 4

                if human_pos and llm_pos:
                    tp += 1
                elif not human_pos and llm_pos:
                    fp += 1
                elif human_pos and not llm_pos:
                    fn += 1
                else:
                    tn += 1

        return {"tp": tp, "fp": fp, "fn": fn, "tn": tn}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute confusion matrix: {e}")


# ── 4. Classification Metrics (Precision, Recall, F1) ────────────────────────

@router.get("/classification-metrics/{project_id}")
async def classification_metrics_chart(
    project_id: UUID,
    authorization: Optional[str] = Header(None),
):
    """
    Precision, Recall and F1-Score segmented by attempt.
    Uses same positive/negative threshold as confusion matrix (>=4 positive).
    """
    _get_user_id(authorization)
    try:
        evals = _fetch_evaluations(str(project_id))
        if not evals:
            return {"attempts": []}

        # Group by (requirement_id, attempt)
        pairs: Dict[str, Dict[str, Dict]] = {}
        for e in evals:
            key = f"{e.get('requirement_id')}_{e.get('attempt')}"
            pairs.setdefault(key, {})
            pairs[key][e["type"]] = e

        # Accumulate TP/FP/FN per attempt
        attempt_counts: Dict[int, Dict[str, int]] = {}
        for pair in pairs.values():
            llm_eval = pair.get("llm")
            human_eval = pair.get("human")
            if not llm_eval or not human_eval:
                continue

            attempt = llm_eval.get("attempt", 1)
            counts = attempt_counts.setdefault(attempt, {"tp": 0, "fp": 0, "fn": 0})

            for c in CRITERIA:
                llm_score = llm_eval.get(c)
                human_score = human_eval.get(c)
                if llm_score is None or human_score is None:
                    continue

                llm_pos = llm_score >= 4
                human_pos = human_score >= 4

                if human_pos and llm_pos:
                    counts["tp"] += 1
                elif not human_pos and llm_pos:
                    counts["fp"] += 1
                elif human_pos and not llm_pos:
                    counts["fn"] += 1

        result = []
        for attempt in sorted(attempt_counts.keys()):
            c = attempt_counts[attempt]
            precision = c["tp"] / (c["tp"] + c["fp"]) if (c["tp"] + c["fp"]) > 0 else 0
            recall = c["tp"] / (c["tp"] + c["fn"]) if (c["tp"] + c["fn"]) > 0 else 0
            f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
            result.append({
                "attempt": attempt,
                "precision": round(precision, 4),
                "recall": round(recall, 4),
                "f1": round(f1, 4),
            })

        return {"attempts": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute classification metrics: {e}")


def _avg_criteria(ev: Dict[str, Any]) -> float | None:
    """Return the mean of the 5 criteria scores for a single evaluation."""
    vals = [ev[c] for c in CRITERIA if ev.get(c) is not None]
    return round(sum(vals) / len(vals), 2) if vals else None


# ── 5. Pass Rate (Pass@k) ───────────────────────────────────────────────────

@router.get("/pass-rate/{project_id}")
async def pass_rate_chart(
    project_id: UUID,
    authorization: Optional[str] = Header(None),
):
    """
    Horizontal stacked-bar data: % of requirements that achieved a good score
    (avg criteria >= 4) at each attempt, plus failure rate.
    Returned separately for LLM and Human evaluations.
    """
    _get_user_id(authorization)
    try:
        evals = _fetch_evaluations(str(project_id))
        if not evals:
            return {"llm": None, "human": None}

        # Group by (requirement_id, type) → list of evals sorted by attempt
        groups: Dict[tuple, List[Dict[str, Any]]] = {}
        for e in evals:
            req_id = e.get("requirement_id")
            eval_type = e.get("type")
            if req_id and eval_type:
                groups.setdefault((req_id, eval_type), []).append(e)

        def _compute(eval_type: str):
            type_groups = {k: v for k, v in groups.items() if k[1] == eval_type}
            if not type_groups:
                return None

            total = len(type_groups)
            buckets = {"pass_at_1": 0, "pass_at_2": 0, "pass_at_3": 0, "fail": 0}

            for _key, group_evals in type_groups.items():
                sorted_evals = sorted(group_evals, key=lambda x: x.get("attempt", 0))
                classified = False
                for ev in sorted_evals:
                    attempt = ev.get("attempt")
                    avg = _avg_criteria(ev)
                    if avg is not None and avg >= 4.0:
                        if attempt == 1:
                            buckets["pass_at_1"] += 1
                        elif attempt == 2:
                            buckets["pass_at_2"] += 1
                        else:
                            buckets["pass_at_3"] += 1
                        classified = True
                        break
                if not classified:
                    buckets["fail"] += 1

            return {
                "total": total,
                **{
                    k: {"count": v, "percent": round(v / total * 100, 1) if total else 0}
                    for k, v in buckets.items()
                },
            }

        return {"llm": _compute("llm"), "human": _compute("human")}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute pass-rate data: {e}")


# ── 6. Scatter Correlation (LLM vs Human) ───────────────────────────────────

@router.get("/scatter-correlation/{project_id}")
async def scatter_correlation_chart(
    project_id: UUID,
    authorization: Optional[str] = Header(None),
):
    """
    Scatter plot data: each point is a (requirement, attempt) pair with the
    average criteria score for both the Human and LLM evaluations.
    Also returns the global Spearman rank-correlation coefficient.
    """
    _get_user_id(authorization)
    try:
        evals = _fetch_evaluations(str(project_id))
        if not evals:
            return {"points": [], "spearman_rho": None, "has_data": False}

        # Group by (requirement_id, attempt) → {llm: eval, human: eval}
        pairs: Dict[str, Dict[str, Dict]] = {}
        for e in evals:
            key = f"{e.get('requirement_id')}_{e.get('attempt')}"
            pairs.setdefault(key, {})
            pairs[key][e["type"]] = e

        points = []
        for pair in pairs.values():
            llm_eval = pair.get("llm")
            human_eval = pair.get("human")
            if not llm_eval or not human_eval:
                continue
            llm_avg = _avg_criteria(llm_eval)
            human_avg = _avg_criteria(human_eval)
            if llm_avg is None or human_avg is None:
                continue
            points.append({
                "requirement_id": str(llm_eval.get("requirement_id", "")),
                "attempt": llm_eval.get("attempt", 1),
                "human_avg": human_avg,
                "llm_avg": llm_avg,
            })

        spearman_rho = None
        if len(points) >= 3:
            import math
            from scipy.stats import spearmanr
            human_vals = [p["human_avg"] for p in points]
            llm_vals = [p["llm_avg"] for p in points]
            rho, _ = spearmanr(human_vals, llm_vals)
            spearman_rho = None if math.isnan(rho) else round(float(rho), 2)

        return {"points": points, "spearman_rho": spearman_rho, "has_data": len(points) > 0}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute scatter correlation data: {e}")
