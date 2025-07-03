from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
from app.db import get_db
from app.schemas.user import UserCreate, UserRead, UserUpdate, UserPasswordUpdate, UserLogin, Token
from app.crud import user as user_crud
from app.auth import create_access_token, get_current_active_user, require_admin, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Logowanie użytkownika"""
    user = user_crud.authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserRead)
def read_users_me(current_user = Depends(get_current_active_user)):
    """Pobiera informacje o aktualnie zalogowanym użytkowniku"""
    return current_user

@router.put("/me/password")
def update_my_password(
    password_update: UserPasswordUpdate,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Zmiana hasła aktualnie zalogowanego użytkownika"""
    success = user_crud.update_user_password(db, current_user.id, password_update)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    return {"message": "Password updated successfully"}

@router.get("/", response_model=List[UserRead])
def read_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Pobiera listę wszystkich użytkowników (tylko dla adminów)"""
    users = user_crud.get_users(db, skip=skip, limit=limit)
    return users

@router.post("/", response_model=UserRead)
def create_user(
    user: UserCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Tworzy nowego użytkownika (tylko dla adminów)"""
    # Sprawdź czy użytkownik już istnieje
    db_user = user_crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_user = user_crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    return user_crud.create_user(db=db, user=user)

@router.get("/{user_id}", response_model=UserRead)
def read_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Pobiera użytkownika po ID (tylko dla adminów)"""
    db_user = user_crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Aktualizuje użytkownika (tylko dla adminów)"""
    db_user = user_crud.update_user(db, user_id, user_update)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Usuwa użytkownika (tylko dla adminów)"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    success = user_crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}
