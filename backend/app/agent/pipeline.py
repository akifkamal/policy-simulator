import json

from app.agent import code_gen, data_search, intent, narrate
from app.executor import run_script


def run(scenario_text: str) -> dict:
    """Full agent pipeline. Returns dict with narration, tables, charts, stats."""
    print(f"[pipeline] Parsing intent for: {scenario_text[:80]}...")
    intent_data = intent.parse(scenario_text)
    print(f"[pipeline] Intent: {intent_data.get('summary', '')}")

    print("[pipeline] Finding CMHC datasets...")
    data_info = data_search.find_datasets(intent_data)
    print(f"[pipeline] Found {len(data_info.get('datasets', []))} datasets")

    print("[pipeline] Generating model script...")
    script = code_gen.generate(intent_data, data_info)
    print(f"[pipeline] Script generated ({len(script)} chars)")

    print("[pipeline] Executing model script...")
    exec_result = run_script(script)

    # One retry if the script has a syntax/runtime error
    if not exec_result["success"] and exec_result["stderr"]:
        print(f"[pipeline] Script failed, retrying with fix...\n{exec_result['stderr'][:600]}")
        fixed_script = code_gen.fix(script, exec_result["stderr"])
        exec_result = run_script(fixed_script)
        if exec_result["stdout"]:
            print(f"[pipeline] Fixed script stdout:\n{exec_result['stdout'][:500]}")
        if not exec_result["success"]:
            print(f"[pipeline] Fixed script also failed:\n{exec_result['stderr'][:300]}")

    if exec_result["stdout"]:
        print(f"[pipeline] Script stdout:\n{exec_result['stdout'][:500]}")

    stats = exec_result["stats"]
    tables = exec_result["tables"]
    charts = exec_result["charts"]

    print(f"[pipeline] Artifacts: {len(charts)} charts, {len(tables)} tables")
    print("[pipeline] Generating narration...")
    narration = narrate.generate(scenario_text, stats, len(tables), len(charts))

    # Mark as complete if we have narration, even if the model script failed
    success = exec_result["success"] or bool(narration)

    return {
        "success": success,
        "narration": narration,
        "tables": tables,
        "charts": charts,
        "stats": stats,
        "parameters": json.dumps(intent_data),
        "stderr": exec_result.get("stderr", "") if not exec_result["success"] else "",
    }
