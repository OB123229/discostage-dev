import sqlite3, hashlib, secrets
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional

app = FastAPI(title="Discover Stage API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB = "discover_stage.db"

# ── DATABASE ───────────────────────────────────────────────
def get_db():
    db = sqlite3.connect(DB)
    db.row_factory = sqlite3.Row
    return db

def init_db():
    db = get_db()
    db.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT NOT NULL,
            email      TEXT UNIQUE NOT NULL,
            password   TEXT NOT NULL,
            role       TEXT NOT NULL,
            town       TEXT NOT NULL,
            state      TEXT NOT NULL,
            token      TEXT DEFAULT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)
    db.commit()
    db.close()

init_db()

# ── HELPERS ───────────────────────────────────────────────
def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

def make_token() -> str:
    return secrets.token_hex(32)

def safe_user(row) -> dict:
    u = dict(row)
    u.pop("password", None)
    return u

def get_current_user(authorization: Optional[str] = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization[7:]
    db = get_db()
    row = db.execute("SELECT * FROM users WHERE token = ?", (token,)).fetchone()
    db.close()
    if not row:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return dict(row)

# ── SCHEMAS ───────────────────────────────────────────────
class RegisterBody(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    town: str
    state: str

    @field_validator("password")
    @classmethod
    def pw_length(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("role")
    @classmethod
    def valid_role(cls, v):
        if v not in ("FAN", "ARTIST"):
            raise ValueError("Role must be FAN or ARTIST")
        return v

    @field_validator("name", "town", "state")
    @classmethod
    def not_empty(cls, v):
        if not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()

class LoginBody(BaseModel):
    email: EmailStr
    password: str

class UpdateBody(BaseModel):
    name: Optional[str] = None
    town: Optional[str] = None
    state: Optional[str] = None
    role: Optional[str] = None

# ── ENDPOINTS ─────────────────────────────────────────────

@app.post("/api/register", summary="Create a new account", tags=["Auth"])
def register(body: RegisterBody):
    """
    Register a new user. Collects everything in one step:
    name, email, password, role (FAN or ARTIST), town, and state.
    """
    db = get_db()
    token = make_token()
    try:
        db.execute(
            "INSERT INTO users (name, email, password, role, town, state, token) VALUES (?,?,?,?,?,?,?)",
            (body.name, body.email.lower(), hash_pw(body.password), body.role, body.town, body.state, token)
        )
        db.commit()
        user = db.execute("SELECT * FROM users WHERE email = ?", (body.email.lower(),)).fetchone()
        return {"token": token, "user": safe_user(user)}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    finally:
        db.close()


@app.post("/api/login", summary="Sign in to an existing account", tags=["Auth"])
def login(body: LoginBody):
    """
    Sign in with email and password.
    Returns the user's full profile including role, town, and state.
    """
    db = get_db()
    row = db.execute("SELECT * FROM users WHERE email = ?", (body.email.lower(),)).fetchone()
    if not row or row["password"] != hash_pw(body.password):
        db.close()
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = make_token()
    db.execute("UPDATE users SET token = ? WHERE id = ?", (token, row["id"]))
    db.commit()
    user = db.execute("SELECT * FROM users WHERE id = ?", (row["id"],)).fetchone()
    db.close()
    return {"token": token, "user": safe_user(user)}


@app.get("/api/users", summary="Get all users", tags=["Users"])
def get_users():
    """
    Returns every user in the database with their full account details
    (password excluded). Useful for admin/testing purposes.
    """
    db = get_db()
    rows = db.execute("SELECT * FROM users").fetchall()
    db.close()
    return {"users": [safe_user(r) for r in rows]}


@app.get("/api/users/{user_id}", summary="Get a single user by ID", tags=["Users"])
def get_user(user_id: int):
    """
    Returns one user's full account details by their ID.
    """
    db = get_db()
    row = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    db.close()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user": safe_user(row)}


@app.patch("/api/users/{user_id}", summary="Update a user's profile", tags=["Users"])
def update_user(user_id: int, body: UpdateBody):
    """
    Update any combination of name, town, state, or role for a user.
    Only fields you provide will be updated.
    """
    db = get_db()
    row = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="User not found")
    updated = dict(row)
    if body.name  is not None: updated["name"]  = body.name.strip()
    if body.town  is not None: updated["town"]  = body.town.strip()
    if body.state is not None: updated["state"] = body.state.strip()
    if body.role  is not None:
        if body.role not in ("FAN", "ARTIST"):
            raise HTTPException(status_code=400, detail="Role must be FAN or ARTIST")
        updated["role"] = body.role
    db.execute(
        "UPDATE users SET name=?, town=?, state=?, role=? WHERE id=?",
        (updated["name"], updated["town"], updated["state"], updated["role"], user_id)
    )
    db.commit()
    row = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    db.close()
    return {"user": safe_user(row)}


@app.delete("/api/users/{user_id}", summary="Delete a user", tags=["Users"])
def delete_user(user_id: int):
    """
    Permanently deletes a user from the database.
    """
    db = get_db()
    row = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="User not found")
    db.execute("DELETE FROM users WHERE id = ?", (user_id,))
    db.commit()
    db.close()
    return {"ok": True, "deleted_id": user_id}

from fastapi.staticfiles import StaticFiles
app.mount("/", StaticFiles(directory=".", html=True), name="static")