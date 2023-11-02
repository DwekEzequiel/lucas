const express = require("express");
const mysql = require("mysql2");

const app = express();

// Configura la conexión a la base de datos
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "burguertic",
});

// Middleware para analizar datos JSON en las solicitudes
app.use(express.json());

// Endpoint para crear un pedido (POST /pedido)
app.post("/pedido", (req, res) => {
    const productos = req.body.productos;
    const fecha = new Date();
    const idUsuario = 1; // Usuario de prueba (debes modificarlo según tus necesidades)

    // Crear el pedido en la tabla "pedidos"
    const insertPedidoQuery = "INSERT INTO pedidos (fecha, estado, id_usuario) VALUES (?, ?, ?)";
    connection.query(insertPedidoQuery, [fecha, "pendiente", idUsuario], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            const idPedido = result.insertId;

            // Crear registros en la tabla "pedidos_platos" para cada producto
            const insertPlatoQuery = "INSERT INTO pedidos_platos (id_pedido, id_plato, cantidad) VALUES (?, ?, ?)";
            productos.forEach((producto) => {
                connection.query(insertPlatoQuery, [idPedido, producto.id, producto.cantidad], (err) => {
                    if (err) {
                        res.status(500).send(err);
                    }
                });
            });

            res.status(200).send({ id: idPedido });
        }
    });
});

// Endpoint para obtener todos los pedidos de un usuario (GET /pedidos/:id)
app.get("/pedidos/:id", (req, res) => {
    const idUsuario = req.params.id;

    // Consulta para obtener los pedidos y sus platos
    const query = `
        SELECT
            p.id,
            p.fecha,
            p.estado,
            p.id_usuario,
            pp.id_plato,
            pl.nombre,
            pl.precio,
            pp.cantidad
        FROM pedidos p
        INNER JOIN pedidos_platos pp ON p.id = pp.id_pedido
        INNER JOIN platos pl ON pp.id_plato = pl.id
        WHERE p.id_usuario = ?
    `;

    connection.query(query, [idUsuario], (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            const pedidos = [];
            let currentPedido = null;

            rows.forEach((row) => {
                if (!currentPedido || currentPedido.id !== row.id) {
                    currentPedido = {
                        id: row.id,
                        fecha: row.fecha,
                        estado: row.estado,
                        idUsuario: row.id_usuario,
                        platos: [],
                    };
                    pedidos.push(currentPedido);
                }

                currentPedido.platos.push({
                    id: row.id_plato,
                    nombre: row.nombre,
                    precio: row.precio,
                    cantidad: row.cantidad,
                });
            });

            res.status(200).send(pedidos);
        }
    });
});



// Inicia el servidor
app.listen(3000, () => {
    console.log("Servidor escuchando en el puerto 3000");
});
