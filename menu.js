const mysql = require("mysql2");
const fs = require("fs");

// Configura la conexión a la base de datos
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "burguertic",
});

// Lee el archivo menu.json
const menuData = JSON.parse(fs.readFileSync("menu.json", "utf8"));

// Inserta los datos del menú en la base de datos
menuData.platos.forEach((plato) => {
    const query = "INSERT INTO platos (nombre, precio) VALUES (?, ?)";
    connection.query(query, [plato.nombre, plato.precio], (err, results) => {
        if (err) {
            console.error("Error al insertar el plato:", err);
        }
    });
});

// Cierra la conexión a la base de datos
connection.end();
