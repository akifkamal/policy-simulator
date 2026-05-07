import json

from celery import Celery

from app.config import settings

celery_app = Celery(
    "policy_simulator",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)
celery_app.conf.task_serializer = "json"
celery_app.conf.result_serializer = "json"
celery_app.conf.accept_content = ["json"]


@celery_app.task(name="run_simulation")
def run_simulation(run_id: int):
    from app.agent import pipeline
    from app.database import SessionLocal
    from app.models import Message, Run

    db = SessionLocal()
    try:
        run = db.query(Run).filter(Run.id == run_id).first()
        if not run:
            return

        run.status = "running"
        db.commit()

        result = pipeline.run(run.scenario_text)

        run.status = "complete" if result["success"] else "failed"
        run.narration = result["narration"]
        run.tables_json = json.dumps(result["tables"])
        run.charts_json = json.dumps(result["charts"])
        run.parameters = result["parameters"]
        run.error_message = result.get("stderr", "") if not result["success"] else ""

        assistant_content = result["narration"] or "The simulation encountered an issue. Please check the error details."
        msg = Message(workspace_id=run.workspace_id, role="assistant", content=assistant_content)
        db.add(msg)

        db.commit()
    except Exception as exc:
        run = db.query(Run).filter(Run.id == run_id).first()
        if run:
            run.status = "failed"
            run.error_message = str(exc)
            db.commit()
        raise
    finally:
        db.close()
