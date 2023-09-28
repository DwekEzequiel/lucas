const express = require("express");
const app = express();
const menu = require('./menu.json');

const cors = require("cors");
app.use(cors());

app.use(express.json());

app.get("/menu", (req, res) => {
    if (!menu) {
        res.status(404).json({ msg: 'Menú no encontrado.' })
    } else {
        res.json(menu);
    }
});

app.get("/menu/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const plato = menu.find((menu) => menu.id === id)
    if (!plato) {
        res.status(404).json({ msg: 'Plato no encontrado.' })
    }
    res.json(plato);
});

app.get("/combos", (req, res) => {
    const combos = menu.filter((menu) => menu.tipo === "combo");
    if (!combos) {
        res.status(404).json({ msg: 'No se encontraron combos.' })
    } else {
        res.json(combos);
    }
});

app.get("/principales", (req, res) => {
    const principales = menu.filter((menu) => menu.tipo === "principal");
    if (!principales) {
        res.status(404).json({ msg: 'No se encontraron menús.' })
    } else {
        res.json(principales);
    }
});

app.get("/postres", (req, res) => {
    const postres = menu.filter((menu) => menu.tipo === "postre");
    if (!postres) {
        res.status(404).json({ msg: 'No se encontraron postres.' })
    } else {
        res.json(postres);
    }
});

// Endpoint POST /pedido
// Endpoint POST /pedido
app.post('/pedido', (req, res) => {
    const { productos } = req.body;

    if (!productos || !Array.isArray(productos)) {
        return res.status(400).json({ error: 'Se requiere un array de productos en el cuerpo de la petición.' });
    }

    let total = 0;

    for (const producto of productos) {
        const plato = menu.find((menu) => menu.id === parseInt(producto.id));
        if (plato) {
            total += parseInt(plato.precio) * parseInt(producto.cantidad);
        }
    }

    res.json({
        msg: 'Pedido recibido',
        precio: total,
    });
});



// Puerto en el que escuchará el servidor
const puerto = 3000;

// Iniciar el servidor
app.listen(puerto, () => {
    console.log(`Servidor escuchando en el puerto ${puerto}`);
});
