from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import secrets

from fastapi import FastAPI, Depends, HTTPException, status, Request, Response, Form, UploadFile, File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from pydantic_settings import BaseSettings
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker, relationship
from sqlalchemy.sql.sqltypes import TIMESTAMP
from datetime import datetime
from sqlalchemy.sql.expression import text

# Database configuration
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create database tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Settings class for environment variables
class Settings(BaseSettings):
    SECRET_KEY: str = "your_default_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    model_config = {
        "env_file": ".env",
        "env_prefix": "",
    }
settings = Settings()

# Create database tables
create_tables()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Token blacklist for storing invalidated tokens
token_blacklist = set()

# Token model for blacklist
class TokenBlacklist(Base):
    __tablename__ = "token_blacklist"
    id = Column(Integer, primary_key=True, index=True)
    jti = Column(String, unique=True, index=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    @classmethod
    def is_blacklisted(cls, jti: str, db: Session) -> bool:
        return db.query(cls).filter(cls.jti == jti).first() is not None

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    posts = relationship("Post", back_populates="user", cascade="all, delete-orphan")

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key = True, index = True)
    title = Column(String, index = True)
    content = Column(String, index = True)
    createtime = Column(TIMESTAMP(timezone=True), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user = relationship("User", back_populates="posts")

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class UserBase(BaseModel):
    username: str
    email: str
    name: str


class UserCreate(UserBase):
    password: str


class UserInDB(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    username: str


# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(db, username: str):
    return db.query(User).filter(User.username == username).first()


def authenticate_user(db, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_jti() -> str:
    return secrets.token_urlsafe(32)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    jti = create_jti()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "jti": jti,
        "type": "access"
    })
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    jti = create_jti()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({
        "exp": expire,
        "jti": jti,
        "type": "refresh"
    })
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


async def get_token_payload(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(
    request: Request,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify token is not blacklisted
        if TokenBlacklist.is_blacklisted(token, db):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked"
            )
            
        payload = await get_token_payload(token)
        username: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if username is None or token_type != "access":
            raise credentials_exception
            
        token_data = TokenData(username=username)
        user = get_user(db, username=token_data.username)
        
        if user is None:
            raise credentials_exception
            
        # Add token to request state for potential logging or other middleware
        request.state.token_payload = payload
        
        return user
        
    except Exception as e:
        if not isinstance(e, HTTPException):
            raise credentials_exception
        raise e


async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


# Auth endpoints
class TokenResponse(Token):
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

@app.post("/token", response_model=TokenResponse)
async def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, 
        expires_delta=access_token_expires
    )
    
    # Create refresh token
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_refresh_token(
        data={"sub": user.username},
        expires_delta=refresh_token_expires
    )
    
    # Set secure, HTTP-only cookies
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": int(access_token_expires.total_seconds())
    }

@app.post("/refresh")
async def refresh_token(
    request: Request,
    db: Session = Depends(get_db)
):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is missing"
        )
    
    try:
        payload = await get_token_payload(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
            
        # Create new access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        new_access_token = create_access_token(
            data={"sub": payload.get("sub")},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": new_access_token,
            "token_type": "bearer",
            "expires_in": int(access_token_expires.total_seconds())
        }
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

@app.post("/logout")
async def logout(
    request: Request,
    response: Response,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        # Add current token to blacklist
        payload = await get_token_payload(token)
        jti = payload.get("jti")
        expires_at = datetime.fromtimestamp(payload["exp"])
        
        # Add to blacklist in database
        blacklisted_token = TokenBlacklist(
            jti=jti,
            expires_at=expires_at
        )
        db.add(blacklisted_token)
        db.commit()
        
        # Clear refresh token cookie
        response.delete_cookie("refresh_token")
        
        return {"message": "Successfully logged out"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not log out"
        )


# User endpoints
@app.post("/users/", response_model=UserInDB)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        name=user.name,
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.get("/users/", response_model=list[UserResponse])
def read_users(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@app.get("/users/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_active_user)):
    return current_user

@app.get("/users/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

class UserUpdate(BaseModel):
    name:Optional[str] = None
    username:Optional[str] = None
    email:Optional[str] = None

# CONTROVERSIAL CODE ALERT: depending on requirement you can change user.name != "" to is not None

@app.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db_user.name = user.name if user.name is not None else db_user.name
    db_user.username = user.username if user.username is not None else db_user.username
    db_user.email = user.email if user.email is not None else db_user.email
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/users/{user_id}", response_model=UserResponse)
def delete_user(user_id:int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    with os.scandir("./uploads") as entries:
        for entry in entries:
            if entry.name.split('-')[0] == str(user_id):
                os.remove(entry)
    db.delete(db_user)
    db.commit()
    return db_user




#----------POST------------------------------------------------------------------------------------------------




class PostCreate(BaseModel):
    title: str
    content: str

class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    createtime: datetime
    user_id: int
    image: str

@app.post("/{user_name}/posts/", response_model=PostResponse)
def create_post(user_name: str, post: PostCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_name).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db_post = Post(title = post.title, content = post.content, createtime = datetime.now(), user_id = user.id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@app.get("/{user_name}/posts/", response_model = list[PostResponse])
def read_posts(user_name: str, skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_name).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    posts = db.query(Post).filter(Post.user_id == user.id).offset(skip).limit(limit).all()
    return posts

@app.get("/{user_name}/posts/{post_title}", response_model = PostResponse)
def read_post(user_name: str, post_title: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_name).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    post = db.query(Post).filter(Post.title == post_title and Post.user_id == user.id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

class PostUpdate(BaseModel):
    title:Optional[str] = None
    content:Optional[str] = None

@app.post("/{user_name}/posts/", response_model=PostResponse)
def create_post(user_name: str, ptitle: str = Form(...), pcontent: str = Form(...), img: UploadFile = File(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_name).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    imgname = str(user.id) + '-' + img.filename
    post = db.query(Post).filter(Post.user_id == user.id).filter(Post.image == imgname).first()
    if post is not None:
        raise HTTPException(status_code=400, detail="Cannot add two images with the same filename.")
    if img.content_type.split('/')[0] != "image":
        raise HTTPException(status_code=400, detail="Incorrect file type")
    with open(f'./uploads/{imgname}', "wb") as f:
        f.write(img.file.read())
    db_post = Post(title = ptitle, content = pcontent, createtime = datetime.now(), user_id = user.id, image = imgname)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@app.get("/{user_name}/posts/", response_model = list[PostResponse])
def read_posts(user_name: str, skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_name).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    posts = db.query(Post).filter(Post.user_id == user.id).offset(skip).limit(limit).all()
    return posts

@app.get("/{user_name}/posts/{post_title}", response_model = PostResponse)
def read_post(user_name: str, post_title: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_name).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    post = db.query(Post).filter(Post.title == post_title).filter(Post.user_id == user.id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@app.put("/{user_name}/posts/{post_id}", response_model=PostResponse)
def update_post(user_name: str, post_id: int, ptitle: Optional[str] = Form(None), pcontent: Optional[str] = Form(None), img: Optional[UploadFile] = File(None), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_name).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db_post = db.query(Post).filter(Post.id == post_id).filter(Post.user_id == user.id).first()
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    db_post.title = ptitle if ptitle is not None else db_post.title
    db_post.content = pcontent if pcontent is not None else db_post.content
    if (img):
        if img.content_type.split('/')[0] != "image":
            raise HTTPException(status_code=400, detail="Incorrect file type")
        imgname = str(user.id) + '-' + img.filename
        file_to_delete = f"./uploads/{db_post.image}"
        os.remove(file_to_delete)
        with open(f'./uploads/{imgname}', "wb") as f:
            f.write(img.file.read())
        db_post.image = imgname
    db.commit()
    db.refresh(db_post)
    return db_post

@app.delete("/{user_name}/posts/{post_id}", response_model=PostResponse)
def delete_post(user_name: str, post_id:int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_name).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db_post = db.query(Post).filter(Post.id == post_id).filter(Post.user_id == user.id).first()
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    file_to_delete = f"./uploads/{db_post.image}"
    os.remove(file_to_delete)
    db.delete(db_post)
    db.commit()
    return db_post