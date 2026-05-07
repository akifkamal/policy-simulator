from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import User, Workspace
from app.schemas import WorkspaceCreate, WorkspaceOut

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.get("", response_model=list[WorkspaceOut])
def list_workspaces(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Workspace).order_by(Workspace.created_at.desc()).all()


@router.post("", response_model=WorkspaceOut, status_code=201)
def create_workspace(body: WorkspaceCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    ws = Workspace(name=body.name, description=body.description)
    db.add(ws)
    db.commit()
    db.refresh(ws)
    return ws


@router.get("/{workspace_id}", response_model=WorkspaceOut)
def get_workspace(workspace_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return ws
