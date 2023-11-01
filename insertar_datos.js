const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "burguertic",
});

connection.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        const menu = require("./menu.json");

        for (const plato of menu) {
            const query = `
                INSERT INTO platos (id, nombre, descripción, precio, tipo)
                VALUES (${plato.id}, "${plato.nombre}", "${plato.descripción}", ${plato.precio}, "${plato.tipo}")
            `;

            connection.query(query, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(`Plato ${plato.id} insertado correctamente.`);
                }
            });
        }

        connection.close();
    }
});
