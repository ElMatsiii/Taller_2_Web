// ============================================
// API EXPRESS - RECETAS
// Archivo: api-express/server.js
// ============================================

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3002;

// Configuración de PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'recetas_db',
  password: 'postgres', // CAMBIAR ESTO
  port: 5432,
});

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// ENDPOINTS
// ============================================

// 1. GET / - Health check
app.get('/', (req, res) => {
  res.json({
    message: 'API de Recetas funcionando correctamente',
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
    const result = await pool.query(`
      SELECT id, nombre, categoria, area, imagen_url, 
             LEFT(instrucciones, 200) as instrucciones_cortas
      FROM recetas
      ORDER BY nombre
    `);

    const recetas = result.rows.map(r => ({
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
    
    const result = await pool.query(`
      SELECT id, nombre, categoria, area, imagen_url, 
             LEFT(instrucciones, 200) as instrucciones_cortas
      FROM recetas
      WHERE LOWER(nombre) LIKE LOWER($1)
      ORDER BY nombre
    `, [`%${searchTerm}%`]);

    if (result.rows.length === 0) {
      return res.json({ meals: null });
    }

    const recetas = result.rows.map(r => ({
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

    // Obtener receta
    const recetaResult = await pool.query(`
      SELECT * FROM recetas WHERE id = $1
    `, [id]);

    if (recetaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    const receta = recetaResult.rows[0];

    // Obtener ingredientes
    const ingredientesResult = await pool.query(`
      SELECT ingrediente, medida FROM ingredientes
      WHERE receta_id = $1
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

    // Agregar ingredientes (formato TheMealDB: strIngredient1, strMeasure1, etc.)
    ingredientesResult.rows.forEach((ing, index) => {
      const num = index + 1;
      meal[`strIngredient${num}`] = ing.ingrediente;
      meal[`strMeasure${num}`] = ing.medida;
    });

    // Rellenar ingredientes vacíos hasta 20
    for (let i = ingredientesResult.rows.length + 1; i <= 20; i++) {
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
  const client = await pool.connect();
  try {
    const { nombre, categoria, area, imagen_url, instrucciones, ingredientes } = req.body;

    await client.query('BEGIN');

    // Insertar receta
    const recetaResult = await client.query(`
      INSERT INTO recetas (nombre, categoria, area, imagen_url, instrucciones)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [nombre, categoria, area, imagen_url, instrucciones]);

    const recetaId = recetaResult.rows[0].id;

    // Insertar ingredientes
    if (ingredientes && ingredientes.length > 0) {
      for (const ing of ingredientes) {
        await client.query(`
          INSERT INTO ingredientes (receta_id, ingrediente, medida)
          VALUES ($1, $2, $3)
        `, [recetaId, ing.ingrediente, ing.medida]);
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Receta creada exitosamente',
      id: recetaId
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear receta:', error);
    res.status(500).json({ error: 'Error al crear receta' });
  } finally {
    client.release();
  }
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🍜 API de Recetas escuchando en http://localhost:${PORT}`);
  console.log(`📚 Documentación disponible en http://localhost:${PORT}/`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('Cerrando servidor...');
  pool.end();
  process.exit(0);
});