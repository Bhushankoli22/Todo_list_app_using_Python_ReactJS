from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Base class for declarative models
Base = declarative_base()


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    name = Column(String, nullable=False)
    password = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    token = Column(String)
    role = Column(String)

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, token={self.token})>"
    
# Task model
class Task(Base):
    __tablename__ = "tasks"  # Table name for tasks
    
    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)  # Auto-increment primary key
    task = Column(String, nullable=False)  # The task description
    created_by = Column(String, nullable=False)  # The name of the user who created the task
    assigned_to = Column(String, nullable=False)  # The name of the user assigned to the task
    duration = Column(Integer, nullable=False)  # Duration for the task (in minutes, hours, etc.)
    status = Column(String, nullable=False)  # Status of the task (e.g., "in progress", "completed")
    
    def __repr__(self):
        return f"<Task(id={self.id}, task={self.task}, assigned_to={self.assigned_to}, status={self.status})>"