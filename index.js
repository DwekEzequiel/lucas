const express = require("express");
const app = express();
const mysql = require("mysql");

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
        app.get("/menu", (req, res) => {
            const query = `
                SELECT *
                FROM platos
            `;

            connection.query(query, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    res.json(result.rows);
                }
            });
        });

        app.get("/menu/:id", (req, res) => {
            const id = parseInt(req.params.id);

            const query = `
                SELECT *
                FROM platos
                WHERE id = ${id}
            `;

            connection.query(query, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    res.json(result.rows[0]);
                }
            });
        });

        app.get("/combos", (req, res) => {
            const query = `
                SELECT *
                FROM platos
                WHERE tipo = "combo"
            `;

            connection.query(query, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    res.json(result.rows);
                }
            });
        });

        app.get("/principales", (req, res) => {
            const query = `
                SELECT *
                FROM platos
                WHERE tipo = "principal"
            `;

            connection.query(query, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    res.json(result.rows);
                }
            });
        });

        app.get("/postres", (req, res) => {
            const query = `
                SELECT *
                FROM platos
                WHERE tipo = "postre"
            `;

            connection.query(query, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    res.json(result.rows);
                }
            });
        });

        app.post("/pedido", (req, res) => {
            const { productos } = req.body;

            const total = 0;

            for (const producto of productos) {
                const query = `
                    SELECT precio
                    FROM platos
                    WHERE id = ${producto.id}
                `;

                connection.query(query, (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        total += parseInt(result.rows[0].precio) * parseInt(producto.cantidad);
                    }
                });
            }

            res.json({
                msg: "Pedido recibido",
                precio: total,
            });
        });

        app.listen(3000, () => {
            console.log(`Servidor escuchando en el puerto ${3000}`);
        });
    }
});
 