import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Message, Run, User, Workspace
from app.schemas import LeadershipRunOut, RunCreate, RunOut

router = APIRouter(tags=["runs"])


@router.post("/workspaces/{workspace_id}/runs", response_model=RunOut, status_code=201)
def create_run(workspace_id: int, body: RunCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    user_msg = Message(workspace_id=workspace_id, role="user", content=body.scenario_text)
    db.add(user_msg)

    run = Run(workspace_id=workspace_id, scenario_text=body.scenario_text)
    db.add(run)
    db.commit()
    db.refresh(run)

    # Enqueue Celery task; if broker is unavailable the run stays pending
    try:
        from app.worker import run_simulation
        run_simulation.delay(run.id)
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning("Celery unavailable, run %s stays pending: %s", run.id, exc)

    return run


@router.get("/workspaces/{workspace_id}/runs", response_model=list[RunOut])
def list_runs(workspace_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return db.query(Run).filter(Run.workspace_id == workspace_id).order_by(Run.created_at.desc()).all()


@router.get("/runs/{run_id}", response_model=RunOut)
def get_run(run_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run


@router.patch("/runs/{run_id}/select", response_model=RunOut)
def select_run(run_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    if run.status != "complete":
        raise HTTPException(status_code=400, detail="Only completed runs can be selected")
    db.query(Run).filter(Run.workspace_id == run.workspace_id).update({"selected": False})
    run.selected = True
    db.commit()
    db.refresh(run)
    return run


@router.get("/leadership", response_model=list[LeadershipRunOut])
def leadership_view(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    runs = db.query(Run).filter(Run.selected == True).order_by(Run.created_at.desc()).all()
    result = []
    for run in runs:
        ws = db.query(Workspace).filter(Workspace.id == run.workspace_id).first()
        result.append(LeadershipRunOut(
            id=run.id,
            workspace_id=run.workspace_id,
            workspace_name=ws.name if ws else "",
            scenario_text=run.scenario_text,
            narration=run.narration,
            tables_json=run.tables_json,
            charts_json=run.charts_json,
            created_at=run.created_at,
        ))
    return result
