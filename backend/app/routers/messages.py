from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Message, User, Workspace
from app.schemas import MessageOut

router = APIRouter(tags=["messages"])


@router.get("/workspaces/{workspace_id}/messages", response_model=list[MessageOut])
def get_messages(workspace_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return db.query(Message).filter(Message.workspace_id == workspace_id).order_by(Message.created_at).all()
