from datetime import datetime
from typing import Any

from pydantic import BaseModel


# Auth
class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True


# Workspaces
class WorkspaceCreate(BaseModel):
    name: str
    description: str = ""


class WorkspaceOut(BaseModel):
    id: int
    name: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True


# Messages
class MessageOut(BaseModel):
    id: int
    workspace_id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


# Runs
class RunCreate(BaseModel):
    scenario_text: str


class TableData(BaseModel):
    headers: list[str]
    rows: list[list[Any]]


class RunOut(BaseModel):
    id: int
    workspace_id: int
    scenario_text: str
    status: str
    parameters: str
    narration: str
    tables_json: str
    charts_json: str
    error_message: str
    selected: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Leadership
class LeadershipRunOut(BaseModel):
    id: int
    workspace_id: int
    workspace_name: str
    scenario_text: str
    narration: str
    tables_json: str
    charts_json: str
    created_at: datetime

    class Config:
        from_attributes = True
