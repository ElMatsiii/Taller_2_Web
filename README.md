# Taller 2: Backend de 3 APIs

**Introducción a Web Móvil**

---

## Descripción del Proyecto

Este repositorio contiene el código fuente del backend para el Taller Nº 2. Consiste en tres APIs independientes, cada una con su propia base de datos SQLite, construidas para ser portables y cumplir con los requisitos del taller.

---

## Integrantes del Grupo

**Grupo Nº:** 10

| Nombre | RUT |
|--------|-----|
| Matias Gutierrez | 21.733.537-K |
| Máximo Sazo | 21.654.236-3 |
| Daniela Infante | 21.446.602-3 |
| Maximiliano Pizarro | 21.776.433-5 |

---

## Arquitectura y Tecnologías

El backend está compuesto por 3 microservicios independientes. Para asegurar la portabilidad y facilidad de evaluación, todas las APIs han sido migradas de PostgreSQL a SQLite.

### API de Recetas (Express + SQLite)

- **Framework:** Express.js
- **Lenguaje:** JavaScript (Node.js)
- **Base de Datos:** SQLite (`recetas.db`)
- **Puerto:** `http://localhost:3002`

### API de Películas Ghibli (FastAPI + SQLite)

- **Framework:** FastAPI
- **Lenguaje:** Python
- **Base de Datos:** SQLite (`ghibli.db`)
- **Puerto:** `http://localhost:3003`

### API de Entrenadores Pokémon (NestJS + SQLite)

- **Framework:** NestJS
- **Lenguaje:** TypeScript (Node.js)
- **Base de Datos:** SQLite (`db.sqlite`)
- **Puerto:** `http://localhost:3000`

---

## Instrucciones de Instalación y Ejecución

Siga estos pasos para levantar el entorno de backend completo. **Necesitará 3 terminales separadas.**

### Prerrequisitos

- **Node.js:** v18 o superior (incluye npm)
- **Python:** v3.8 o superior (incluye pip)

---

### 1. Clonar el Repositorio

```bash
git clone [URL_DEL_REPOSITORIO]
cd [NOMBRE_DEL_REPOSITORIO]
```

---

### 2. Levantar el Backend

#### Terminal 1: API de Recetas (Express)

```bash
# Navegar a la carpeta
cd backend/api_express

# Instalar dependencias
npm install

# Inicializar la base de datos (SOLO LA PRIMERA VEZ)
# Esto crea y puebla recetas.db
node init_db.js

# Iniciar el servidor
npm start
```

**Resultado:** API de Recetas escuchando en `http://localhost:3002`

---

#### Terminal 2: API de Ghibli (FastAPI)

```bash
# Navegar a la carpeta
cd backend/api_fastapi

# Crear y activar un entorno virtual
python -m venv venv

# Activar el entorno virtual
# En Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias de Python
pip install -r requirements.txt

# Inicializar la base de datos (SOLO LA PRIMERA VEZ)
# Esto crea y puebla ghibli.db
python init_db.py

# Iniciar el servidor
uvicorn main:app --reload --port 3003
```

**Resultado:** API de Ghibli escuchando en `http://localhost:3003`

---

#### Terminal 3: API de Entrenadores (NestJS)

```bash
# Navegar a la carpeta
cd backend/api_nestjs

# Instalar dependencias
npm install

# Inicializar la base de datos (SOLO LA PRIMERA VEZ)
# Esto crea y puebla db.sqlite
node init_db.js

# Iniciar el servidor en modo desarrollo
npm run start
```

**Resultado:** API de Entrenadores escuchando en `http://localhost:3000`

---

### 3. Probar las APIs

Utilice Postman o un cliente HTTP similar para probar los siguientes endpoints:

| API | Endpoint | URL |
|-----|----------|-----|
| Recetas | GET | `http://localhost:3002/api/recetas` |
| Ghibli | GET | `http://localhost:3003/films` |
| Entrenadores | GET | `http://localhost:3000/trainers` |

---

## Notas Importantes

- Los scripts de inicialización de base de datos (`init_db.js` / `init_db.py`) deben ejecutarse **solo la primera vez** que se levanta cada API.
- Asegúrese de tener los puertos 3000, 3002 y 8000 disponibles antes de iniciar los servicios.
- Cada API es completamente independiente y puede ejecutarse por separado si es necesario.