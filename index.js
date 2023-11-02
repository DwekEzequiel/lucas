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
        // Endpoint para crear un pedido
        app.post("/pedido", (req, res) => {
            const productos = req.body.productos;

            const fecha = new Date();
            const idUsuario = req.body.idUsuario;

            // Creamos el pedido
            const query = `
                INSERT INTO pedidos (fecha, id_usuario)
                VALUES (?, ?)
            `;
            connection.query(query, [fecha, idUsuario], (err, rows) => {
                if (err) {
                    res.status(500).send(err);
                } else {
                    const idPedido = rows.insertId;

                    // Creamos los registros de pedidos_platos
                    for (const producto of productos) {
                        const query = `
                            INSERT INTO pedidos_platos (id_pedido, id_plato, cantidad)
                            VALUES (?, ?, ?)
                        `;
                        connection.query(query, [idPedido, producto.id, producto.cantidad], (err, rows) => {
                            if (err) {
                                res.status(500).send(err);
                            } else {
                                res.status(200).send({
                                    id: idPedido,
                                    state: "pendiente",
                                });
                            }
                        });
                    }
                }
            });
        });

        // Endpoint para obtener todos los pedidos de un usuario
        app.get("/pedidos/:id", (req, res) => {
            const idUsuario = req.params.id;

            const query = `
                SELECT
                    p.id,
                    p.fecha,
                    p.estado,
                    p.id_usuario,
                    pp.id_plato,
                    pp.nombre,
                    pp.precio,
                    pp.cantidad
                FROM pedidos p
                INNER JOIN pedidos_platos pp ON p.id = pp.id_pedido
                WHERE p.id_usuario = ?
            `;
            connection.query(query, [idUsuario], (err, rows) => {
                if (err) {
                    res.status(500).send(err);
                } else {
                    if (rows.length === 0) {
                        res.status(404).send("No se encontraron pedidos para el usuario especificado");
                    } else {
                        const pedidos = rows.map((pedido) => ({
                            id: pedido.id,
                            fecha: pedido.fecha,
                            state: pedido.estado,
                            idUsuario: pedido.id_usuario,
                            platos: pedido.platos.map((plato) => ({
                                id: plato.id_plato,
                                nombre: plato.nombre,
                                precio: plato.precio,
                                cantidad: plato.cantidad,
                            }),
                        ))};

                        
