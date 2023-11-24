const express = require('express');
const cors = require("cors");
const app = express();
const mysql = require('mysql2');

app.use(cors());
app.use(express.json());
const PORT = 9000;
const bcrypt = require('bcrypt');  



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




connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conexión exitosa a la base de datos');
  }
});


//--------MENU COMPLETO-----------------
app.get('/menu', (_, res) => {
    connection.query('SELECT * FROM platos', (err, rows) => {
        if (err) {
            console.error("Error consultando: " + err);
            return;
        }
        res.status(200).json(rows);
    });
});

//---------BUSCO PLATO EN MENU CON ID 
app.get('/menu/:id', (req, res) => {
    connection.query('SELECT * FROM platos WHERE id = ?', [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).json(err);
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Plato no encontrado' });
        }
        res.status(200).json(rows[0]);
    });
});

//--------MUESTRO COMBOS-------------
app.get('/combos', (_, res) => {
    connection.query('SELECT * FROM platos WHERE tipo = ?', ['combo'], (err, rows) => {
        if (err) {
            return res.status(500).json(err);
            
        }
        res.status(200).json(rows);
    });
});

//--------MUESTRO PLATOS PRINCIPALES-----------
app.get('/principales', (_, res) => {
    connection.query('SELECT * FROM platos where tipo = ?',['principal'],(err,rows)=>{
        if(err){
            return res.status(500).json(err);
            
        }
        res.status(200).json(rows);
    });
});

//-------MUESTRO POSTRES----------
app.get('/postres', (_, res) => {
    connection.query('SELECT * FROM platos where tipo = ?',['postre'],(err,rows)=>{
        if(err){
            return res.status(500).json(err);
        }
        res.status(200).json(rows);
    });
});

//---------MUESTRO PRECIO TOTAL DE LOS PLATOS INDICADOS--------

app.post('/pedido', (req, res) => {
  const { productos } = req.body;
  //preguntar a nacho
  const idusuario = req.headers.authorization;

  if (!Array.isArray(productos) || productos.length === 0) {
     return res.status(400).json('La solicitud debe incluir un array de platos o al menos un plato');
    }
    connection.query('SELECT * FROM platos', (err, rows) => {
      if (err) {
        console.error('Error consultando: ' + err);
        return res.status(500).json({
          msg: 'Error al consultar los platos en la base de datos',
        });
      }

    const menu = rows.map((row) => ({
    id: row.id,
            
}));

      for (let i = 0; i < productos.length; i++) {
        const plato = menu.find((p) => p.id === productos[i].id);
        if (!plato) {
              return res.status(400).json('El id del plato no es válido');
          }
          }
      
      
        connection.query(
            'INSERT INTO pedidos (id_usuario, fecha,estado) VALUES (?, ?,?)',
            [idusuario, new Date(),"pendiente"],
            (err, response) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  msg: 'Error al crear el pedido' + err,
                });
              }
      
              const pedidoID = response.insertId;
              for (let i = 0; i < productos.length; i++) {
                connection.query(
                  'INSERT INTO pedidos_platos (id_pedido, id_plato, cantidad) VALUES (?, ?, ?)',
                  [pedidoID, productos[i].id, productos[i].cantidad],
                  (err) => {
                    if (err) {
                      console.error('Error al insertar plato en el pedido: ' + err);
                    }
                  }
                );
              }
      
              res.status(200).json({
                id: pedidoID,
              });
            }
          );
        });
      });

//------------MUESTRO PEDIDOS DEL USUARIO-----------------   
app.get("/pedidos", (req, res) => {
  const id = req.headers.authorization;
    
    connection.query("SELECT pedidos.*, platos.*, pedidos_platos.id_pedido, pedidos_platos.cantidad FROM pedidos INNER JOIN pedidos_platos ON pedidos.id = pedidos_platos.id_pedido INNER JOIN platos ON pedidos_platos.id_plato=platos.id WHERE pedidos.id_usuario=?", id, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    if(result.length === 0 || !result) {
      return res.status(200).json([]);
     }
     else {
     let pedidos = [];
     result.forEach((row) => {
     if (!pedidos.find((p) => p.id === row.id_pedido)){
      pedidos.push({
      "id": row.id_pedido,
      "fecha": row.fecha,
      "estado": row.estado,
       "id_usuario": row.id_usuario,
        "platos": [
         {
            "id": row.id,
            "nombre": row.nombre,
            "precio": row.precio,
            "cantidad": row.cantidad
                            }
                        ]
                    })
      } else {
       const agregarPedido = pedidos.find((p) => p.id === row.id_pedido);
        agregarPedido.platos.push({
           "id": row.id,
           "nombre": row.nombre,
            "precio": row.precio,
              "cantidad": row.cantidad});
                    pedidos = pedidos.filter((p) => p.id !== row.id_pedido);
                    pedidos.push(agregarPedido);
                }
            });
            res.json(pedidos);
        }
    });
});

//--------REGISTER------------- ok
app.post("/usuarios", (req, res) => {
  const {nombre, apellido, email, password} = req.body;
  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json("Faltan datos obligatorios");
  }

  try{
    const hashedPassword = bcrypt.hashSync(password, 10);

    connection.query("SELECT * FROM usuarios WHERE email = ?", email, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length > 0) {
        return res.status(409).json("El usuario ya existe");
      }
      const insertQuery = "INSERT INTO usuarios(nombre,apellido,email,password) VALUES (?,?,?,?)";
      connection.query(insertQuery, [nombre, apellido, email, hashedPassword], (err,result) => {
      if(err){
        return res.status(500).json("No se pudo insertar correctamente", err); 
      }
      const userId = result.insertId;
      return res.status(200).json({id: userId});
        
        
      });
  });
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});

//--------LOGIN-------------- ok
app.post("/login", (req, res) => {
const { email, password } = req.body;
if (!email || !password) {
  return res.status(400).json("Faltan datos obligatorios");
}
connection.query("SELECT * FROM usuarios WHERE email = ?", email, (err, result) => {
  if (err) {
    return res.status(500).json(err);
  }
  if(result.length === 0 || !result) {
    return res.status(401).json({ error: 'Usuario no encontrado' });
   }
  const usuario = result[0];
  if (!bcrypt.compareSync(password, usuario.password)) {
    return res.status(401).json("Usuario o contraseña incorrectos");
  }
  return res.status(200).json({ 
  id: usuario.id,
  nombre: usuario.nombre,
  apellido: usuario.apellido,
  email: usuario.email, 

  });
});
});

    

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});