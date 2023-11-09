const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 9000;


const dbConfig = {
    host: 'aws.connect.psdb.cloud',
    user: 'ybv0gmoyhwt1xj9yl5tz',
    password: 'pscale_pw_yU4TPCiVkaG5xLP19jF04fxOiHW02hxYRy9QkC7AImu',
    database: 'burgertic',
    ssl: {
        rejectUnauthorized: true
    }

  };
  const db = mysql.createConnection(dbConfig);




  db.connect((err) => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err);
    } else {
      console.log('Conexión exitosa a la base de datos');
    }
  });

// Ruta para crear un pedido
app.post('/pedido', (req, res) => {
  const { productos } = req.body;

  // Insertar el pedido en la tabla "pedidos" y obtener el ID generado
  db.query('INSERT INTO pedidos (id_usuario) VALUES (?)', [1], (err, result) => {
    if (err) {
      console.error('Error al crear el pedido:', err);
      res.status(500).json({ error: 'Error al crear el pedido' });
    } else {
      const pedidoId = result.insertId;

      // Inserto cada producto en la tabla "pedidos_platos"
      productos.forEach((producto) => {
        db.query(
          'INSERT INTO pedidos_platos (id_pedido, id_plato, cantidad) VALUES (?, ?, ?)',
          [pedidoId, producto.id, producto.cantidad],
          (err) => {
            if (err) {
              console.error('Error al insertar producto:', err);
              res.status(500).json({ error: 'Error al insertar producto' });
            }
          }
        );
      });

      res.status(201).json({ id: pedidoId });
    }
  });
});


// Ruta para obtener todos los pedidos de un usuario
app.get('/pedidos/:id', (req, res) => {
    const userId = req.params.id;
  
    // Consulta SQL para obtener los pedidos del usuario
    const query = `
      SELECT
        pedidos.id AS pedido_id,
        pedidos.fecha,
        pedidos.estado,
        pedidos.id_usuario,
        platos.id AS plato_id,
        platos.nombre AS plato_nombre,
        platos.precio,
        pedidos_platos.cantidad
      FROM pedidos
      INNER JOIN pedidos_platos ON pedidos.id = pedidos_platos.id_pedido
      INNER JOIN platos ON pedidos_platos.id_plato = platos.id
      WHERE pedidos.id_usuario = ?
    `;
  
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error al obtener los pedidos:', err);
        res.status(500).json({ error: 'Error al obtener los pedidos' });
      } else {
        const pedidos = [];
  
        // Procesa los resultados para crear la estructura deseada
        results.forEach((row) => {
          const pedidoExistente = pedidos.find((p) => p.id === row.pedido_id);
  
          if (pedidoExistente) {
            // El pedido ya existe en la lista, agrega el plato al pedido existente
            pedidoExistente.platos.push({
              id: row.plato_id,
              nombre: row.plato_nombre,
              precio: row.precio,
              cantidad: row.cantidad,
            });
          } else {
            // Crea un nuevo pedido y agrega el plato
            const nuevoPedido = {
              id: row.pedido_id,
              fecha: row.fecha,
              estado: row.estado,
              id_usuario: row.id_usuario,
              platos: [
                {
                  id: row.plato_id,
                  nombre: row.plato_nombre,
                  precio: row.precio,
                  cantidad: row.cantidad,
                },
              ],
            };
            pedidos.push(nuevoPedido);
          }
        });
  
        res.json(pedidos);
      }
    });
  });

  app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
  });
