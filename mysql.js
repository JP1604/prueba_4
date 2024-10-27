let mysql2 = require("mysql2");
const express = require('express');  // Importar express
const app = express();
const port = 3007;  // Cambié el puerto a 3000

// Crear conexión a MySQL
let conexion = mysql2.createConnection({
    host: "localhost",
    port: 3306,
    database: "car",
    user: "root",
    password: "root"
});

conexion.connect(function(err){
    if(err){
        console.error("Error connecting: ", err);
    } else {
        console.log("Conexión exitosa");
    }
});

// Ruta para la gráfica de barras (ventas por marca)
app.get('/api/cars', (req, res) => {
    const query = `
        SELECT make, COUNT(*) AS total_sold 
        FROM car.car_prices_limited 
        GROUP BY make 
        ORDER BY total_sold DESC
    `;
    conexion.query(query, function(error, lista) {
        if (error) {
            throw error;
        } else {
            res.json(lista);  // Enviar los datos como respuesta JSON
        }
    });
});

// Ruta para la gráfica de líneas (ventas por año)
app.get('/api/lineas', (req, res) => {
    const query = `
        SELECT year, COUNT(*) AS total_sold
        FROM car_prices_limited
        WHERE year REGEXP '^[0-9]+$'
        GROUP BY year
        ORDER BY year DESC
    `;
    conexion.query(query, function(error, results) {
        if (error) {
            res.status(500).send("Error en la base de datos");
            throw error;
        }
        res.json(results); // Enviar los datos en formato JSON
    });
});

// Nueva ruta para el diagrama circular de colores de los carros
app.get('/api/colors', (req, res) => {
    const query = `
        SELECT 
            CASE 
                WHEN color IN ('black', 'white', 'silver', 'gray', 'blue', 'red', 'green') THEN color
                ELSE 'otros'
            END AS color_group,
            COUNT(*) AS total_sold
        FROM car_prices_limited
        WHERE color IN ('black', 'white', 'silver', 'gray', 'blue', 'red', 'green', 'yellow', 'purple')
        GROUP BY color_group
        ORDER BY total_sold DESC;
    `;
    conexion.query(query, function(error, results) {
        if (error) {
            res.status(500).send("Error en la base de datos");
            throw error;
        }
        res.json(results); // Enviar los datos en formato JSON
    });
});

// Ruta para el gráfico de barras horizontales (top 20 marcas más caras)
app.get('/api/top_marcas_caras', (req, res) => {
    const query = `
        SELECT make, AVG(sellingprice) AS average_price
        FROM car_prices_limited
        GROUP BY make
        ORDER BY average_price DESC
        LIMIT 20;
    `;
    conexion.query(query, function(error, results) {
        if (error) {
            res.status(500).send("Error en la base de datos");
            throw error;
        }
        res.json(results); // Enviar los datos en formato JSON
    });
});

// Nueva ruta para la gráfica circular de transmisión (automática y manual)
app.get('/api/transmission', (req, res) => {
    const query = `
        SELECT transmission, COUNT(*) AS total_sold
        FROM car_prices_limited
        WHERE transmission IN ('automatic', 'manual')
        GROUP BY transmission
        ORDER BY total_sold DESC;
    `;
    conexion.query(query, function(error, results) {
        if (error) {
            res.status(500).send("Error en la base de datos");
            throw error;
        }
        res.json(results); // Enviar los datos en formato JSON
    });
});

// Servir el archivo estático index.html desde una carpeta "public"
app.use(express.static('public'));

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
