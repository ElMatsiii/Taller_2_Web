// api_nestjs/init_db.js
//
// Este script puebla la base de datos 'db.sqlite' de NestJS
// con entrenadores de ejemplo.
//
// Ejecútalo con: node init_db.js
// ----------------------------------------------------

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// UUIDs de ejemplo (puedes generarlos en cualquier web de 'uuid generator')
const ID_ASH = 'a1b2c3d4-e5f6-4a9b-8c7d-1e2f3a4b5c6d';
const ID_MISTY = 'b1c2d3e4-f5a6-4b8c-9d7e-2f3a4b5c6d7e';
const ID_BROCK = 'c1d2e3f4-a5b6-4c8d-9e7f-3a4b5c6d7e8f';

// Nota: Usamos SQL puro. Los nombres de columna son los de la Entidad.
const SQL_INIT = `
    -- Borramos la tabla si existe para empezar de cero
    DROP TABLE IF EXISTS trainers;
    
    -- Volvemos a crear la tabla (schema de nuestra Entity)
    CREATE TABLE trainers (
        id VARCHAR PRIMARY KEY,
        name VARCHAR(100) UNIQUE,
        team TEXT -- simple-json se guarda como TEXT
    );
    
    -- Insertamos los datos
    INSERT INTO trainers (id, name, team) VALUES
    (
        '${ID_ASH}',
        'Ash Ketchum',
        '["pikachu", "charizard", "bulbasaur"]'
    ),
    (
        '${ID_MISTY}',
        'Misty',
        '["staryu", "psyduck"]'
    ),
    (
        '${ID_BROCK}',
        'Brock',
        '["onix", "geodude", "vulpix"]'
    );
    `;

async function initializeDatabase() {
    try {
        console.log("Conectando a la base de datos 'db.sqlite' de NestJS...");
        const db = await open({
            filename: './db.sqlite', // <-- El archivo de NestJS
            driver: sqlite3.Database
        });

        console.log("Ejecutando script de inicialización SQL para Trainers...");
        await db.exec(SQL_INIT);

        console.log("Base de datos 'db.sqlite' poblada exitosamente.");

        console.log("\n--- Entrenadores Creados ---");
        const trainers = await db.all("SELECT * FROM trainers");
        console.table(trainers.map(t => ({...t, team: JSON.parse(t.team)})));
        // Nota: parseamos el JSON solo para mostrarlo bonito en la tabla

        await db.close();
    } catch (error) {
        console.error("Error al inicializar la base de datos:", error);
    }
}

initializeDatabase();