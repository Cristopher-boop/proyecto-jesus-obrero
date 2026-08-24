# Entrypoint para desarrollo en el directorio raíz del backend
# Permite ejecutar uvicorn directamente como: uvicorn main:app --reload

from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
