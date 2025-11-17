const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const SQL_INIT = `
DROP TABLE IF EXISTS ingredientes;
DROP TABLE IF EXISTS recetas;
DROP TABLE IF EXISTS idx_recetas_nombre;
DROP TABLE IF EXISTS idx_ingredientes_receta;


CREATE TABLE recetas (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    nombre TEXT NOT NULL,
    categoria TEXT,
    area TEXT,
    imagen_url TEXT,
    instrucciones TEXT,
    video_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ingredientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receta_id INTEGER REFERENCES recetas(id) ON DELETE CASCADE,
    ingrediente TEXT,
    medida TEXT
);


INSERT INTO recetas (nombre, categoria, area, imagen_url, instrucciones) VALUES
('Spaghetti Carbonara', 'Pasta', 'Italian', 
 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg',
 'Cocinar la pasta según las instrucciones del paquete. Mientras tanto, freír el bacon hasta que esté crujiente. Batir huevos con queso parmesano. Mezclar la pasta caliente con el bacon y agregar la mezcla de huevo, revolviendo rápidamente. Servir inmediatamente con pimienta negra.'),

('Tacos al Pastor', 'Mexican', 'Mexican',
 'https://www.themealdb.com/images/media/meals/zuqryr1520946374.jpg',
 'Marinar la carne de cerdo con especias y piña. Asar a la parrilla hasta que esté dorada. Cortar en trozos pequeños. Servir en tortillas de maíz con cebolla, cilantro y piña fresca.'),

('Pad Thai', 'Noodles', 'Thai',
 'https://www.themealdb.com/images/media/meals/wvtsxu1548070488.jpg',
 'Remojar los fideos de arroz en agua tibia. Saltear ajo y proteína elegida. Agregar fideos, salsa de tamarindo, salsa de pescado y azúcar. Añadir huevo y mezclar. Servir con brotes de soja, cacahuetes y lima.');

INSERT INTO ingredientes (receta_id, ingrediente, medida) VALUES
((SELECT id FROM recetas WHERE nombre = 'Spaghetti Carbonara'), 'Spaghetti', '400g'),
((SELECT id FROM recetas WHERE nombre = 'Spaghetti Carbonara'), 'Bacon', '200g'),
((SELECT id FROM recetas WHERE nombre = 'Spaghetti Carbonara'), 'Huevos', '4 unidades'),
((SELECT id FROM recetas WHERE nombre = 'Spaghetti Carbonara'), 'Queso Parmesano', '100g'),
((SELECT id FROM recetas WHERE nombre = 'Spaghetti Carbonara'), 'Pimienta negra', 'Al gusto'),

((SELECT id FROM recetas WHERE nombre = 'Tacos al Pastor'), 'Carne de cerdo', '500g'),
((SELECT id FROM recetas WHERE nombre = 'Tacos al Pastor'), 'Piña', '200g'),
((SELECT id FROM recetas WHERE nombre = 'Tacos al Pastor'), 'Tortillas de maíz', '12 unidades'),
((SELECT id FROM recetas WHERE nombre = 'Tacos al Pastor'), 'Cebolla', '1 unidad'),
((SELECT id FROM recetas WHERE nombre = 'Tacos al Pastor'), 'Cilantro', '1 manojo'),

((SELECT id FROM recetas WHERE nombre = 'Pad Thai'), 'Fideos de arroz', '200g'),
((SELECT id FROM recetas WHERE nombre = 'Pad Thai'), 'Camarones', '300g'),
((SELECT id FROM recetas WHERE nombre = 'Pad Thai'), 'Huevos', '2 unidades'),
((SELECT id FROM recetas WHERE nombre = 'Pad Thai'), 'Cacahuetes', '50g'),
((SELECT id FROM recetas WHERE nombre = 'Pad Thai'), 'Salsa de pescado', '3 cucharadas');


CREATE INDEX idx_recetas_nombre ON recetas(nombre);
CREATE INDEX idx_ingredientes_receta ON ingredientes(receta_id);
`;

async function initializeDatabase() {
    try {
        console.log("Conectando a la base de datos 'recetas.db'...");
        const db = await open({
            filename: './recetas.db',
            driver: sqlite3.Database
        });

        console.log("Ejecutando script de inicialización SQL...");
        await db.exec(SQL_INIT);

        console.log("Base de datos 'recetas.db' creada y poblada exitosamente.");
        await db.close();
    } catch (error) {
        console.error("Error al inicializar la base de datos:", error);
    }
}

initializeDatabase();