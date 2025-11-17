from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import os
from decimal import Decimal
app = FastAPI(
    title="API de Películas Ghibli (con SQLite)",
    description="API REST con FastAPI y SQLite",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = os.getenv('DB_FILE', './ghibli.db')

def get_db_connection():
    """Crear conexión a la base de datos"""
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        print(f"Error al conectar a la base de datos: {e}")
        raise

class Pelicula(BaseModel):
    id: str
    titulo: str
    titulo_original: Optional[str]
    director: str
    productor: Optional[str]
    anio_lanzamiento: int
    duracion: int
    descripcion: str
    imagen_url: Optional[str]
    calificacion: Optional[float]

    class Config:
        from_attributes = True

class PeliculaResponse(BaseModel):
    id: str
    title: str
    original_title: Optional[str]
    director: str
    producer: Optional[str]
    release_date: str
    running_time: str
    description: str
    image: Optional[str]
    rt_score: Optional[str]

def format_pelicula(row: sqlite3.Row) -> dict:
    """Formatear película al formato de la API original de Ghibli"""
    return {
        "id": row['id'],
        "title": row['titulo'],
        "original_title": row['titulo_original'] or row['titulo'],
        "director": row['director'],
        "producer": row['productor'] or '',
        "release_date": str(row['anio_lanzamiento']),
        "running_time": str(row['duracion']),
        "description": row['descripcion'],
        "image": row['imagen_url'] or '',
        "rt_score": str(int(row['calificacion'] * 10)) if row['calificacion'] else '0'
    }

@app.get("/")
async def root():
    """Endpoint de bienvenida"""
    return {
        "message": "API de Películas Ghibli funcionando correctamente (con SQLite)",
        "version": "1.0.0",
        "endpoints": [
            "GET /films - Listar todas las películas",
            "GET /films/{id} - Obtener película por ID",
            "GET /films/search?q=titulo - Buscar películas",
            "GET /docs - Documentación interactiva (Swagger)"
        ]
    }

@app.get("/films", response_model=List[PeliculaResponse])
async def get_films(
    limit: Optional[int] = Query(None, description="Límite de resultados"),
    offset: Optional[int] = Query(0, description="Offset para paginación")
):
    """
    Obtener lista de todas las películas de Studio Ghibli
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        query = """
            SELECT id, titulo, titulo_original, director, productor,
                   anio_lanzamiento, duracion, descripcion, imagen_url, calificacion
            FROM peliculas
            ORDER BY anio_lanzamiento DESC
        """

        params = []
        if limit:
            query += f" LIMIT ?"
            params.append(limit)
        if offset:
            query += f" OFFSET ?"
            params.append(offset)

        cur.execute(query, tuple(params))
        rows = cur.fetchall()

        cur.close()
        conn.close()

        return [format_pelicula(row) for row in rows]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener películas: {str(e)}")

@app.get("/films/{film_id}", response_model=PeliculaResponse)
async def get_film(film_id: str):
    """
    Obtener detalle de una película por ID
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT id, titulo, titulo_original, director, productor,
                   anio_lanzamiento, duracion, descripcion, imagen_url, calificacion
            FROM peliculas
            WHERE id = ?
        """, (film_id,))

        row = cur.fetchone()

        cur.close()
        conn.close()

        if not row:
            raise HTTPException(status_code=404, detail="Película no encontrada")

        return format_pelicula(row)

    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Error de base de datos: {str(e)}")

@app.get("/films/search/", response_model=List[PeliculaResponse])
async def search_films(q: str = Query(..., description="Término de búsqueda")):
    """
    Buscar películas por título
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT id, titulo, titulo_original, director, productor,
                   anio_lanzamiento, duracion, descripcion, imagen_url, calificacion
            FROM peliculas
            WHERE LOWER(titulo) LIKE LOWER(?)
               OR LOWER(titulo_original) LIKE LOWER(?)
            ORDER BY anio_lanzamiento DESC
        """, (f'%{q}%', f'%{q}%'))

        rows = cur.fetchall()

        cur.close()
        conn.close()

        return [format_pelicula(row) for row in rows]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al buscar películas: {str(e)}")

@app.post("/films", response_model=dict)
async def create_film(pelicula: Pelicula):
    """
    Crear una nueva película (BONUS)
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO peliculas (id, titulo, titulo_original, director, productor,
                                 anio_lanzamiento, duracion, descripcion, imagen_url, calificacion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            pelicula.id,
            pelicula.titulo,
            pelicula.titulo_original,
            pelicula.director,
            pelicula.productor,
            pelicula.anio_lanzamiento,
            pelicula.duracion,
            pelicula.descripcion,
            pelicula.imagen_url,
            pelicula.calificacion
        ))

        new_id = cur.lastrowid
        conn.commit()

        cur.close()
        conn.close()

        return {"message": "Película creada exitosamente", "id": new_id}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error al crear película: {str(e)}")

@app.get("/health")
async def health_check():
    """Verificar estado de la API y conexión a la base de datos"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) as count FROM peliculas")
        result = cur.fetchone()
        cur.close()
        conn.close()

        return {
            "status": "healthy",
            "database": "connected",
            "films_count": result['count']
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }
