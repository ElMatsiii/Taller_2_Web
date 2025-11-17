const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
const PORT = process.env.PORT || 3002;
const DB_FILE = './recetas.db';

let db;

app.use(cors());
app.use(express.json());

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

app.get('/api/recetas', async (req, res) => {
    try {
        const result = await db.all(`
      SELECT id, nombre, categoria, area, imagen_url, 
             SUBSTR(instrucciones, 1, 200) as instrucciones_cortas
      FROM recetas
      ORDER BY nombre
    `);

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

app.get('/api/recetas/search', async (req, res) => {
    try {
        const searchTerm = req.query.s || '';

        const result = await db.all(`
      SELECT id, nombre, categoria, area, imagen_url, 
             SUBSTR(instrucciones, 1, 200) as instrucciones_cortas
      FROM recetas
      WHERE LOWER(nombre) LIKE LOWER(?)
      ORDER BY nombre
    `, [`%${searchTerm}%`]);

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

app.get('/api/recetas/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const receta = await db.get(`
      SELECT * FROM recetas WHERE id = ?
    `, [id]);

        if (!receta) {
            return res.status(404).json({ error: 'Receta no encontrada' });
        }

        const ingredientesResult = await db.all(`
      SELECT ingrediente, medida FROM ingredientes
      WHERE receta_id = ?
      ORDER BY id
    `, [id]);

        const meal = {
            idMeal: receta.id.toString(),
            strMeal: receta.nombre,
            strCategory: receta.categoria,
            strArea: receta.area,
            strInstructions: receta.instrucciones,
            strMealThumb: receta.imagen_url,
            strYoutube: receta.video_url || '',
        };

        ingredientesResult.forEach((ing, index) => {
            const num = index + 1;
            meal[`strIngredient${num}`] = ing.ingrediente;
            meal[`strMeasure${num}`] = ing.medida;
        });

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

app.post('/api/recetas', async (req, res) => {
    try {
        const { nombre, categoria, area, imagen_url, instrucciones, ingredientes } = req.body;

        await db.run('BEGIN TRANSACTION');

        const recetaResult = await db.run(`
      INSERT INTO recetas (nombre, categoria, area, imagen_url, instrucciones)
      VALUES (?, ?, ?, ?, ?)
    `, [nombre, categoria, area, imagen_url, instrucciones]);

        const recetaId = recetaResult.lastID;

        if (ingredientes && ingredientes.length > 0) {
            const stmt = await db.prepare(`
        INSERT INTO ingredientes (receta_id, ingrediente, medida)
        VALUES (?, ?, ?)
      `);
            for (const ing of ingredientes) {
                await stmt.run(recetaId, ing.ingrediente, ing.medida);
            }
            await stmt.finalize();
        }

        await db.run('COMMIT');

        res.status(201).json({
            message: 'Receta creada exitosamente',
            id: recetaId
        });
    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Error al crear receta:', error);
        res.status(500).json({ error: 'Error al crear receta' });
    }
});

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
});

async function startServer() {
    try {
        db = await open({
            filename: DB_FILE,
            driver: sqlite3.Database
        });

        console.log('Conectado a la base de datos SQLite.');

        app.listen(PORT, () => {
            console.log(`API de Recetas escuchando en http://localhost:${PORT}`);
            console.log(`Documentación disponible en http://localhost:${PORT}/`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
    }
}

startServer();

process.on('SIGTERM', async () => {
    console.log('Cerrando servidor...');
    if (db) {
        await db.close();
    }
    process.exit(0);
});