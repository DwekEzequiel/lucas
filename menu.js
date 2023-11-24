const mysql = require("mysql2");
const fs = require("fs");

// Configura la conexión a la base de datos
const dbConfig = {
    host: 'aws.connect.psdb.cloud',
    user: 'uyd1z23idjdah1xqursr',
    password: 'pscale_pw_zXg1reSJEo4uW5yDxRt3o3yNsiPVwVNpfDhLcTPAmGJ',
    database: 'burgertic',
    ssl: {
        rejectUnauthorized: true
    }
  
  };
  const connection = mysql.createConnection(dbConfig);
// Lee el archivo menu.json
const menuData = JSON.parse(fs.readFileSync("menu.json", "utf8"));

// Inserta los datos del menú en la base de datos
menuData.forEach((plato) => {
    const query = "INSERT INTO platos (id, tipo, nombre, precio, descripcion) VALUES (?, ?, ?, ?, ?)";
    connection.query(query, [plato.id, plato.tipo, plato.nombre, plato.precio, plato.descripcion ], (err, results) => {
        if (err) {
            console.error("Error al insertar el plato:", err);
        }
    });
});

// Cierra la conexión a la base de datos
connection.end();
