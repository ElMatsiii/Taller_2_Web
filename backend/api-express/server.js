// ============================================
// API EXPRESS - RECETAS (Migrada a SQLite)
// Archivo: api-express/server.js
// ============================================

const express = require('express');
const cors = require('cors');
// <-- CAMBIO: Importamos sqlite3 y el wrapper 'sqlite' para async/await
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
const PORT = process.env.PORT || 3002;
const DB_FILE = './recetas.db'; // <-- CAMBIO: Nombre de nuestra base de datos

// <-- CAMBIO: Declaramos la variable de la base de datos
let db;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// ENDPOINTS
// ============================================

// 1. GET / - Health check
app.get('/', (req, res) => {
    res.json({
        message: 'API de Recetas funcionando correctamente (con SQLite)',
        version: '1.0.0',
        endpoints: [
            'GET /api/recetas - Listar todas las recetas',
            'GET /api/recetas/search?s=nombre - Buscar recetas por nombre',
            'GET /api/recetas/:id - Obtener detalle de receta'
        ]
    });
});

// 2. GET /api/recetas - Listar todas las recetas
app.get('/api/recetas', async (req, res) => {
    try {
        // <-- CAMBIO: Sintaxis de consulta
        const result = await db.all(`
      SELECT id, nombre, categoria, area, imagen_url, 
             SUBSTR(instrucciones, 1, 200) as instrucciones_cortas
      FROM recetas
      ORDER BY nombre
    `);

        // El SUBSTR es el equivalente de LEFT en SQLite

        const recetas = result.map(r => ({
            idMeal: r.id.toString(),
            strMeal: r.nombre,
            strCategory: r.categoria,
            strArea: r.area,
            strMealThumb: r.imagen_url,
            strInstructions: r.instrucciones_cortas + '...'
        }));

        res.json({ meals: recetas });
    } catch (error) {
        console.error('Error al obtener recetas:', error);
        res.status(500).json({ error: 'Error al obtener recetas' });
    }
});

// 3. GET /api/recetas/search?s=nombre - Buscar recetas por nombre
app.get('/api/recetas/search', async (req, res) => {
    try {
        const searchTerm = req.query.s || '';

        // <-- CAMBIO: Sintaxis de consulta y placeholder '?' en lugar de '$1'
        const result = await db.all(`
      SELECT id, nombre, categoria, area, imagen_url, 
             SUBSTR(instrucciones, 1, 200) as instrucciones_cortas
      FROM recetas
      WHERE LOWER(nombre) LIKE LOWER(?)
      ORDER BY nombre
    `, [`%${searchTerm}%`]); // El parámetro se pasa como array

        if (result.length === 0) {
            return res.json({ meals: null });
        }

        const recetas = result.map(r => ({
            idMeal: r.id.toString(),
            strMeal: r.nombre,
            strCategory: r.categoria,
            strArea: r.area,
            strMealThumb: r.imagen_url,
            strInstructions: r.instrucciones_cortas + '...'
        }));

        res.json({ meals: recetas });
    } catch (error) {
        console.error('Error al buscar recetas:', error);
        res.status(500).json({ error: 'Error al buscar recetas' });
    }
});

// 4. GET /api/recetas/:id - Obtener detalle de receta con ingredientes
app.get('/api/recetas/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // <-- CAMBIO: Usamos db.get() para un solo resultado y '?'
        const receta = await db.get(`
      SELECT * FROM recetas WHERE id = ?
    `, [id]);

        if (!receta) {
            return res.status(404).json({ error: 'Receta no encontrada' });
        }

        // <-- CAMBIO: Usamos db.all() para la lista de ingredientes
        const ingredientesResult = await db.all(`
      SELECT ingrediente, medida FROM ingredientes
      WHERE receta_id = ?
      ORDER BY id
    `, [id]);

        // Formatear respuesta como TheMealDB
        const meal = {
            idMeal: receta.id.toString(),
            strMeal: receta.nombre,
            strCategory: receta.categoria,
            strArea: receta.area,
            strInstructions: receta.instrucciones,
            strMealThumb: receta.imagen_url,
            strYoutube: receta.video_url || '',
        };

        // Agregar ingredientes
        ingredientesResult.forEach((ing, index) => {
            const num = index + 1;
            meal[`strIngredient${num}`] = ing.ingrediente;
            meal[`strMeasure${num}`] = ing.medida;
        });

        // Rellenar ingredientes vacíos hasta 20
        for (let i = ingredientesResult.length + 1; i <= 20; i++) {
            meal[`strIngredient${i}`] = '';
            meal[`strMeasure${i}`] = '';
        }

        res.json({ meals: [meal] });
    } catch (error) {
        console.error('Error al obtener detalle de receta:', error);
        res.status(500).json({ error: 'Error al obtener detalle de receta' });
    }
});

// 5. POST /api/recetas - Crear nueva receta (BONUS)
app.post('/api/recetas', async (req, res) => {
    try {
        const { nombre, categoria, area, imagen_url, instrucciones, ingredientes } = req.body;

        // <-- CAMBIO: Manejo de transacciones en SQLite
        await db.run('BEGIN TRANSACTION');

        // Insertar receta
        const recetaResult = await db.run(`
      INSERT INTO recetas (nombre, categoria, area, imagen_url, instrucciones)
      VALUES (?, ?, ?, ?, ?)
    `, [nombre, categoria, area, imagen_url, instrucciones]);

        // <-- CAMBIO: Obtener el ID del último insert
        const recetaId = recetaResult.lastID;

        // Insertar ingredientes
        if (ingredientes && ingredientes.length > 0) {
            // Preparamos la consulta
            const stmt = await db.prepare(`
        INSERT INTO ingredientes (receta_id, ingrediente, medida)
        VALUES (?, ?, ?)
      `);
            for (const ing of ingredientes) {
                await stmt.run(recetaId, ing.ingrediente, ing.medida);
            }
            await stmt.finalize(); // Cerramos la consulta preparada
        }

        await db.run('COMMIT');

        res.status(201).json({
            message: 'Receta creada exitosamente',
            id: recetaId
        });
    } catch (error) {
        await db.run('ROLLBACK'); // <-- CAMBIO: Rollback
        console.error('Error al crear receta:', error);
        res.status(500).json({ error: 'Error al crear receta' });
    }
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
});

// <-- CAMBIO: Función principal asíncrona para abrir la DB primero
async function startServer() {
    try {
        // Abrimos la conexión a la base de datos
        db = await open({
            filename: DB_FILE,
            driver: sqlite3.Database
        });

        console.log('Conectado a la base de datos SQLite.');

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🍜 API de Recetas escuchando en http://localhost:${PORT}`);
            console.log(`📚 Documentación disponible en http://localhost:${PORT}/`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
    }
}

// Iniciar la aplicación
startServer();

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
    console.log('Cerrando servidor...');
    if (db) {
        await db.close();
    }
    process.exit(0);
});