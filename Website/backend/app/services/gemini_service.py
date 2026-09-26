import json
import logging
import re
from flask import current_app
from google import genai
from google.genai import types
from google.genai.errors import APIError, ClientError, ServerError

logger = logging.getLogger(__name__)

SYSTEM_INSTRUCTION = """You are Siva Kumar's Project Assistant. Help visitors turn practical software ideas into clearer, structured project requirements.

Your responsibilities:
1. Understand the user's problem.
2. Identify the likely project type (e.g. Web Application, REST API, Full Stack System, Machine Learning System).
3. Suggest a practical system scope (MVP / Phase 1).
4. Identify core features, clearly distinguishing between what the user explicitly asked for (CONFIRMED FROM YOUR IDEA) and what you recommend as useful additions (AI SUGGESTION).
5. Suggest a reasonable technical direction and recommended stack.
6. Point out missing requirements or questions to clarify (NEEDS CLARIFICATION).
7. Suggest practical immediate next steps.

Strict Rules:
- Do not make business promises or guarantees regarding cost or timeline.
- Do not invent customers, users, or performance metrics.
- Do not claim Siva Kumar has built something unless it is relevant general software engineering context.
- Known real technologies in Siva's portfolio include: Python, Flask, SQL, MySQL, SQLite, JavaScript, HTML, CSS, Scikit-learn, XGBoost. Suggest these where appropriate, but do not automatically force them if another tool is more suited.
- Return ONLY valid JSON matching the requested structure.
"""

# JSON schema specification for the project brief
PROJECT_BRIEF_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "projectTitle": {"type": "STRING"},
        "projectType": {"type": "STRING"},
        "problemSummary": {"type": "STRING"},
        "suggestedScope": {"type": "STRING"},
        "coreFeatures": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "title": {"type": "STRING"},
                    "description": {"type": "STRING"},
                    "tag": {
                        "type": "STRING",
                        "enum": ["CONFIRMED FROM YOUR IDEA", "AI SUGGESTION"],
                    },
                },
                "required": ["title", "description", "tag"],
            },
        },
        "recommendedStack": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "name": {"type": "STRING"},
                    "role": {"type": "STRING"},
                    "tag": {"type": "STRING"},
                },
                "required": ["name", "role"],
            },
        },
        "questionsToClarify": {
            "type": "ARRAY",
            "items": {"type": "STRING"},
        },
        "nextSteps": {
            "type": "ARRAY",
            "items": {"type": "STRING"},
        },
    },
    "required": [
        "projectTitle",
        "projectType",
        "problemSummary",
        "suggestedScope",
        "coreFeatures",
        "recommendedStack",
        "questionsToClarify",
        "nextSteps",
    ],
}


def clean_json_text(text: str) -> str:
    """Extract clean JSON text from potential markdown code fences."""
    if not text:
        return ""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return text


def normalize_brief(data: dict) -> dict:
    """Validate and sanitize structured fields to ensure frontend stability."""
    if not isinstance(data, dict):
        raise ValueError("Structured result is not a dictionary.")

    # Support nested project_overview if present
    overview = data.get("project_overview") if isinstance(data.get("project_overview"), dict) else {}
    scope_obj = data.get("system_scope") if isinstance(data.get("system_scope"), dict) else {}

    project_title = str(
        data.get("projectTitle")
        or data.get("project_title")
        or data.get("title")
        or "Untitled Project"
    ).strip()[:150]

    project_type = str(
        data.get("projectType")
        or data.get("project_type")
        or overview.get("project_type")
        or "Web Application"
    ).strip()[:100]

    problem_summary = str(
        data.get("problemSummary")
        or data.get("problem_summary")
        or overview.get("problem_statement")
        or ""
    ).strip()[:1000]

    suggested_scope = str(
        data.get("suggestedScope")
        or data.get("suggested_scope")
        or scope_obj.get("phase_1_mvp")
        or ""
    ).strip()[:1000]

    raw_features = data.get("coreFeatures") or data.get("features") or []
    core_features = []
    if isinstance(raw_features, list):
        for item in raw_features[:15]:
            if isinstance(item, dict):
                title = str(item.get("title") or item.get("feature_name") or "Feature").strip()[:120]
                desc = str(item.get("description") or "").strip()[:300]
                tag_raw = str(item.get("tag") or item.get("origin") or "").upper()
                tag = "CONFIRMED FROM YOUR IDEA" if "CONFIRMED" in tag_raw else "AI SUGGESTION"
                core_features.append({
                    "title": title,
                    "description": desc,
                    "tag": tag,
                })
            elif isinstance(item, str) and item.strip():
                core_features.append({
                    "title": item.strip()[:120],
                    "description": "",
                    "tag": "AI SUGGESTION",
                })

    raw_stack = data.get("recommendedStack") or data.get("recommended_stack")
    if not raw_stack and isinstance(data.get("technical_direction"), dict):
        raw_stack = data["technical_direction"].get("recommended_stack")

    recommended_stack = []
    if isinstance(raw_stack, list):
        for item in raw_stack[:12]:
            if isinstance(item, dict):
                recommended_stack.append({
                    "name": str(item.get("name") or "Technology").strip()[:60],
                    "role": str(item.get("role") or "Core").strip()[:60],
                    "tag": str(item.get("tag") or "AI SUGGESTION").strip()[:60],
                })
            elif isinstance(item, str) and item.strip():
                recommended_stack.append({
                    "name": item.strip()[:60],
                    "role": "Core",
                    "tag": "AI SUGGESTION",
                })
    elif isinstance(raw_stack, dict):
        for key, val in list(raw_stack.items())[:12]:
            recommended_stack.append({
                "name": str(val).strip()[:60],
                "role": str(key).replace("_", " ").title()[:60],
                "tag": "AI SUGGESTION",
            })

    raw_questions = (
        data.get("questionsToClarify")
        or data.get("needs_clarification")
        or data.get("clarification_questions")
        or []
    )
    questions = [
        str(q).strip()[:300]
        for q in raw_questions
        if isinstance(q, str) and q.strip()
    ][:10]

    raw_next_steps = data.get("nextSteps") or data.get("next_steps") or []
    next_steps = [
        str(s).strip()[:300]
        for s in raw_next_steps
        if isinstance(s, str) and s.strip()
    ][:10]

    return {
        "projectTitle": project_title,
        "projectType": project_type,
        "problemSummary": problem_summary,
        "suggestedScope": suggested_scope,
        "coreFeatures": core_features,
        "recommendedStack": recommended_stack,
        "questionsToClarify": questions,
        "nextSteps": next_steps,
    }


def generate_project_brief(message: str, context: dict = None) -> tuple[dict | None, str | None, int]:
    """
    Call Gemini using official google-genai SDK to generate a structured project brief.

    Returns:
        (result_dict, error_message, http_status_code)
    """
    api_key = current_app.config.get("GEMINI_API_KEY") or ""
    primary_model = current_app.config.get("GEMINI_MODEL") or "gemini-3.5-flash-lite"

    if not api_key:
        logger.warning("GEMINI_API_KEY is not configured in environment.")
        return (
            None,
            "AI configuration is not available in this environment. Please configure GEMINI_API_KEY.",
            503,
        )

    # Build prompt with optional context
    prompt_parts = []
    if context and isinstance(context, dict):
        if context.get("project_type"):
            prompt_parts.append(f"Preferred Project Type: {str(context['project_type'])[:100]}")
        if context.get("technology_preference"):
            prompt_parts.append(f"Technology Preference: {str(context['technology_preference'])[:200]}")
        if context.get("existing_features"):
            prompt_parts.append(f"Existing Features Mentioned: {str(context['existing_features'])[:500]}")
        if context.get("previous_brief") and isinstance(context["previous_brief"], dict):
            prompt_parts.append("Previous Project Brief for Refinement:")
            prompt_parts.append(json.dumps(context["previous_brief"], indent=2)[:2000])

    prompt_parts.append(f"User Project Idea / Request:\n{message}")
    full_prompt = "\n\n".join(prompt_parts)

    candidate_models = [primary_model]
    for fallback in ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.8-flash"]:
        if fallback not in candidate_models:
            candidate_models.append(fallback)

    last_error = None
    last_status = 500

    for model_name in candidate_models:
        try:
            client = genai.Client(api_key=api_key)

            config = types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                response_schema=PROJECT_BRIEF_SCHEMA,
                temperature=0.2,
            )

            response = client.models.generate_content(
                model=model_name,
                contents=full_prompt,
                config=config,
            )

            raw_text = response.text or ""
            cleaned = clean_json_text(raw_text)

            if not cleaned:
                last_error = "The AI returned an empty response. Please try again."
                last_status = 502
                continue

            parsed_json = json.loads(cleaned)
            brief = normalize_brief(parsed_json)
            return brief, None, 200

        except ClientError as ce:
            err_msg = str(ce)
            if "401" in err_msg or "403" in err_msg or "API_KEY_INVALID" in err_msg:
                logger.error("Gemini authentication failure: invalid or unauthorized API key.")
                return (
                    None,
                    "AI assistant authentication failed. Please verify the API key configuration.",
                    502,
                )
            elif "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
                logger.warning("Gemini rate limit exceeded (429).")
                return (
                    None,
                    "Your request limit has been reached. Please try again later.",
                    429,
                )
            elif "404" in err_msg:
                logger.warning(f"Gemini model {model_name} returned 404, attempting fallback...")
                last_error = "Configured AI model is unavailable."
                last_status = 503
                continue
            else:
                logger.error(f"Gemini ClientError: {ce}")
                return (
                    None,
                    "Unable to process your project idea. Please rephrase and try again.",
                    400,
                )

        except ServerError as se:
            logger.warning(f"Gemini ServerError on {model_name} (503/Spike): {se}. Trying next model...")
            last_error = "AI assistant is temporarily experiencing high demand. Please try again."
            last_status = 503
            continue

        except json.JSONDecodeError as jde:
            logger.error(f"Failed to parse Gemini output as JSON: {jde}")
            last_error = "The AI generated an unparseable response. Please try again."
            last_status = 502
            continue

        except Exception as e:
            logger.error(f"Unexpected error communicating with Gemini on {model_name}: {type(e).__name__}")
            last_error = "AI assistant encountered an unexpected error. Please try again later."
            last_status = 500
            continue

    return None, last_error or "AI assistant is temporarily unavailable. Please try again.", last_status

