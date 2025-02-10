from fastapi import FastAPI, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from models import User, Task
from database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from sqlalchemy.exc import SQLAlchemyError 
from schemas import UserCreate
import uuid


app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allows all origins from the list
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Password encrytpion and decryption using hash
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Your JWT secret and algorithm
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"


# Databse Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Authenticate the user
def authenticate_user(email: str, password: str, db: Session):
    # print(email,"USER's email")
    user = db.query(User).filter(User.email == email).first()
    # print(user,"USER Authenticated one")
    if not user:
        return False
    if user.password != password:
        return False
    return user


# Create access token
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta  # Corrected this line
    else:
        expire = datetime.now() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(form_data.username, form_data.password, db)
    # print("  Form data Username ",form_data.username," Form data Password ", form_data.password, " Form data email ", form_data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # access_token_expires = timedelta(mi)
    access_token = create_access_token(
        data={"sub": user.email}
        # expires_delta=access_token_expires
    )
    # print(user.email,"EMAIL OF USER")
    return {"access_token": access_token, "token_type": "bearer", "username" : user.email}


@app.get("/verify-token/{token}")
async def verify_user_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])  # Fix: algorithms should be a list
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token is invalid or expired")
        return payload  # Fix: Return the actual payload instead of just a message
    except JWTError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token is invalid or expired")

# Endpoint to get tasks for the logged-in user
@app.get("/get-tasks")
async def get_tasks(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        # print(f"Received token: {token}")  # Debugging
        payload = await verify_user_token(token)  # Fix: Now returns actual payload
        username = payload.get("sub")  # Extract email from the payload
        
        if not username:
            raise HTTPException(status_code=403, detail="Invalid token: 'sub' claim missing")

        user = db.query(User).filter(User.email == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        tasks = db.query(Task).filter(Task.created_by == user.name).all()
        return {"tasks": [
            {
                "id": task.id,
                "task": task.task,
                "created_by": task.created_by,
                "assigned_to": task.assigned_to,
                "duration": task.duration,
                "status": task.status
            } for task in tasks
        ]}

    except Exception as e:
        # print(f"Error fetching tasks: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching tasks: {str(e)}")

# Endpoint to add a task
@app.post("/add-task")
async def add_task(request: Request, db: Session = Depends(get_db)):
    task_data = await request.json()
    try:
        # Find the user by email (assuming email is unique)
        user = db.query(User).filter(User.email == task_data["email"]).first()

        if user:
            user.token = task_data["token"]  # Update token if user already exists
            db.commit(user.token)
        else:
            new_user = User(email=task_data["email"], token=task_data["token"])  
            db.add(new_user)
            db.commit()
            db.refresh(new_user)

        created_by = user.name if user else task_data.get("assigned_by")
        # Create the new task and add to the tasks table
        new_task = Task(
            duration=task_data["duration"],
            task=task_data["task"],
            assigned_to=task_data["assigned_to"],
            # assigned_by=task_data["assigned_by"],    
            created_by = user.name if user else task_data.get("assigned_by", "Unknown"),
            status="Pending"
        )

        db.add(new_task)
        db.commit()
        db.refresh(new_task)
        
        return {"task": new_task}
    
    except SQLAlchemyError as e:
        db.rollback()
        return {"error": str(e)}

    

# Endpoint to delete a task by id
@app.delete("/delete-task/{task_id}")
def delete_task(task_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_user_token(token)
    username = payload.get("sub")
    # user = db.query(User).filter(User.username == username).first()
    if not Task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    task = db.query(Task).filter(Task.id == task_id, Task.owner_id == Task.id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}


@app.post("/signup")
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Generate UUID for user ID
    user_id = str(uuid.uuid4())

    # Create JWT token
    payload = {"sub": user.email, "exp": datetime.now() + timedelta(days=30)}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    # Create new user
    new_user = User(
        id=user_id,
        name=user.name,
        email=user.email,
        password=user.password,  # No hashing since you want raw passwords
        token=token,
        role="User"  # Default role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully", "token": token}
