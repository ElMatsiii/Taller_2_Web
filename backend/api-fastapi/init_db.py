# api_fastapi/init_db.py
import sqlite3
import os

DB_FILE = './ghibli.db'

SQL_INIT = """
-- Borramos las tablas si ya existen
DROP TABLE IF EXISTS peliculas;
DROP TABLE IF EXISTS idx_peliculas_titulo;
DROP TABLE IF EXISTS idx_peliculas_anio;

-- 1. CREAR TABLA PELICULAS
CREATE TABLE peliculas (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    titulo_original TEXT,
    director TEXT,
    productor TEXT,
    anio_lanzamiento INTEGER,
    duracion INTEGER,
    descripcion TEXT,
    imagen_url TEXT,
    calificacion REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. INSERTAR PELÍCULAS (especificando columnas)
INSERT INTO peliculas (id, titulo, titulo_original, director, productor, anio_lanzamiento, duracion, descripcion, imagen_url, calificacion) VALUES
('2baf70d1-42bb-4437-b551-e5fed5a87abe', 'El Castillo en el Cielo', 'Tenkū no Shiro Rapyuta',
 'Hayao Miyazaki', 'Isao Takahata', 1986, 124,
 'Una joven con un cristal mágico y un chico minero se embarcan en una aventura épica para encontrar Laputa, una legendaria ciudad flotante.',
 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/npOnzAbLh6VOIu3naU5QaEcTepo.jpg', 8.5),

('12cfb892-aac0-4c5b-94af-521852e46d6a', 'Mi Vecino Totoro', 'Tonari no Totoro',
 'Hayao Miyazaki', 'Hayao Miyazaki', 1988, 86,
 'Dos hermanas se mudan al campo y descubren a Totoro, un espíritu del bosque gigante y amistoso.',
 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/rtGDOeG9LzoerkDGZF9dnVeLppL.jpg', 8.8),

('58611129-2dbc-4a81-a72f-77ddfc1b1b49', 'El Viaje de Chihiro', 'Sen to Chihiro no Kamikakushi',
 'Hayao Miyazaki', 'Toshio Suzuki', 2001, 125,
 'Una niña debe trabajar en una casa de baños para espíritus para salvar a sus padres, transformados en cerdos.',
 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', 9.0),

('0440483e-ca0e-4120-8c50-4c8cd9b965d6', 'La Princesa Mononoke', 'Mononoke-hime',
 'Hayao Miyazaki', 'Toshio Suzuki', 1997, 134,
 'Un joven guerrero se ve envuelto en una lucha entre los dioses del bosque y los humanos que consumen sus recursos.',
 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/jHWmNr7m544fJ8eItsfNk8fs2Ed.jpg', 8.9),

('45204234-adfd-45cb-a505-a8e7a676b114', 'El Castillo Ambulante', 'Hauru no Ugoku Shiro',
 'Hayao Miyazaki', 'Toshio Suzuki', 2004, 119,
 'Una joven es transformada en anciana por una bruja y busca refugio en un castillo mágico que camina.',
 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/TkTPELWinKaWO3YCPvP1mprYHj.jpg', 8.7);

-- 3. CREAR ÍNDICES
CREATE INDEX idx_peliculas_titulo ON peliculas(titulo);
CREATE INDEX idx_peliculas_anio ON peliculas(anio_lanzamiento);
"""

def initialize_database():
    try:
        if os.path.exists(DB_FILE):
            os.remove(DB_FILE)
            print(f"Base de datos '{DB_FILE}' anterior eliminada.")

        print(f"Conectando y creando la base de datos '{DB_FILE}'...")
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()

        print("Ejecutando script de inicialización SQL...")
        cursor.executescript(SQL_INIT)

        conn.commit()
        print(f"✅ Base de datos '{DB_FILE}' creada y poblada exitosamente.")

    except sqlite3.Error as e:
        print(f"❌ Error al inicializar la base de datos: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    initialize_database()