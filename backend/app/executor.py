import base64
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path


def run_script(script: str, timeout: int = 600) -> dict:
    """Execute a generated Python script in a subprocess and return collected artifacts."""
    with tempfile.TemporaryDirectory() as tmpdir:
        artifacts_dir = Path(tmpdir)
        (artifacts_dir / "charts").mkdir()
        (artifacts_dir / "tables").mkdir()

        script_path = artifacts_dir / "model_script.py"
        script_path.write_text(script, encoding="utf-8")

        env = os.environ.copy()
        env["ARTIFACTS_DIR"] = str(artifacts_dir)
        # Ensure matplotlib uses non-interactive backend
        env["MPLBACKEND"] = "Agg"

        try:
            result = subprocess.run(
                [sys.executable, str(script_path)],
                capture_output=True,
                text=True,
                timeout=timeout,
                env=env,
            )
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "stdout": "",
                "stderr": "Script timed out after 10 minutes.",
                "charts": [],
                "tables": [],
                "stats": {},
            }

        stdout = result.stdout
        stderr = result.stderr
        success = result.returncode == 0

        charts = _load_charts(artifacts_dir / "charts")
        tables = _load_tables(artifacts_dir / "tables")
        stats = _load_stats(artifacts_dir / "stats.json")

        return {
            "success": success,
            "stdout": stdout,
            "stderr": stderr,
            "charts": charts,
            "tables": tables,
            "stats": stats,
        }


def _load_charts(charts_dir: Path) -> list[str]:
    charts = []
    for png in sorted(charts_dir.glob("*.png")):
        data = png.read_bytes()
        charts.append(base64.b64encode(data).decode())
    return charts


def _load_tables(tables_dir: Path) -> list[dict]:
    tables = []
    for csv_path in sorted(tables_dir.glob("*.csv")):
        try:
            import csv
            with open(csv_path, newline="", encoding="utf-8") as f:
                reader = csv.reader(f)
                rows = list(reader)
            if rows:
                tables.append({"headers": rows[0], "rows": rows[1:]})
        except Exception:
            pass
    return tables


def _load_stats(stats_path: Path) -> dict:
    if stats_path.exists():
        try:
            return json.loads(stats_path.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}
