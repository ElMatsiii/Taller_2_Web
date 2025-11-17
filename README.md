Taller 2: Backend de 3 APIs

Intro. a Web Movil

Este repositorio contiene el código fuente del backend para el Taller Nº 2. Consiste en tres APIs independientes, cada una con su propia base de datos SQLite, construidas para ser portables y cumplir con los requisitos del taller.

Integrantes del Grupo

Grupo Nº: [NÚMERO DE GRUPO]

Integrante 1: [Matias Gutierrez, 21.733.537-K]

Integrante 2: [Máximo Sazo, 21.654.236-3]

Integrante 3: [Daniela Infante, 21.446.602-3]

Integrante 4: [Maximiliano Pizarro, 21.776.433-5]

Arquitectura y Tecnologías

El backend está compuesto por 3 microservicios independientes. Para asegurar la portabilidad y facilidad de evaluación, todas las APIs han sido migradas de PostgreSQL a SQLite.

API de Recetas (Express + SQLite):

Framework: Express.js

Lenguaje: JavaScript (Node.js)

Base de Datos: SQLite (Archivo: recetas.db)

Puerto: http://localhost:3002

API de Películas Ghibli (FastAPI + SQLite):

Framework: FastAPI

Lenguaje: Python

Base de Datos: SQLite (Archivo: ghibli.db)

Puerto: http://localhost:8000 (por defecto de uvicorn)

API de Entrenadores Pokémon (NestJS + SQLite):

Framework: NestJS

Lenguaje: TypeScript (Node.js)

Base de Datos: SQLite (Archivo: db.sqlite)

Puerto: http://localhost:3000

Instrucciones de Instalación y Ejecución

Siga estos pasos para levantar el entorno de backend completo. Necesitará 3 terminales separadas.

Prerrequisitos

Node.js: v18 o superior (incluye npm)

Python: v3.8 o superior (incluye pip)

1. Clonar el Repositorio

git clone [URL_DEL_REPOSITORIO]
cd [NOMBRE_DEL_REPOSITORIO]


2. Levantar el Backend (3 Terminales)

Terminal 1: API de Recetas (Express)

# 1. Navegar a la carpeta
cd backend/api_express

# 2. Instalar dependencias
npm install

# 3. Inicializar la base de datos (SOLO LA PRIMERA VEZ)
# Esto crea y puebla recetas.db
node init_db.js

# 4. Iniciar el servidor
npm start


API de Recetas escuchando en http://localhost:3002

Terminal 2: API de Ghibli (FastAPI)

# 1. Navegar a la carpeta
cd backend/api_fastapi

# 2. Crear y activar un entorno virtual
python -m venv venv
# En Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# En macOS/Linux:
# source venv/bin/activate

# 3. Instalar dependencias de Python
pip install -r requirements.txt

# 4. Inicializar la base de datos (SOLO LA PRIMERA VEZ)
# Esto crea y puebla ghibli.db
python init_db.py

# 5. Iniciar el servidor
uvicorn main:app --reload


API de Ghibli escuchando en http://localhost:8000

Terminal 3: API de Entrenadores (NestJS)

# 1. Navegar a la carpeta
cd backend/api_nestjs

# 2. Instalar dependencias
npm install

# 3. Inicializar la base de datos (SOLO LA PRIMERA VEZ)
# Esto crea y puebla db.sqlite
node init_db.js

# 4. Iniciar el servidor en modo desarrollo (watch)
npm run start:dev


API de Entrenadores escuchando en http://localhost:3000

3. Probar las APIs

Usa Postman o un cliente similar para probar los endpoints:

Recetas: GET http://localhost:3002/api/recetas

Ghibli: GET http://localhost:8000/films

Entrenadores: GET http://localhost:3000/trainers
