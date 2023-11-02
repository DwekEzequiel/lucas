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
                const pedidos = [];
                let currentPedido = null;

                rows.forEach((row) => {
                    if (!currentPedido || currentPedido.id !== row.id) {
                        currentPedido = {
                            id: row.id,
                            fecha: row.fecha,
                            state: row.estado,
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
        }
    });
});
