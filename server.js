//Importante leer el README

async function serverMain() {
    
    //Constantes que seteo tanto del lado del server como del cliente ya que deben coincidir.
    //Quizás convenga hacerlas variables de entorno (en un .env)
    const CHATMSG = 'chat_msg'
    const PRODMSG = 'prod_msg'

    try {

        //Importo clase Contenedor e instancio uno para mensajes de chat y otro para productos
        const Contenedor = require('./class/class_Contenedor')
        const contenedorProd = new Contenedor('./datos/productos.txt')
        const contenedorChat = new Contenedor('./datos/mensajes.txt')

        //Importo y configuro Express y Socket.io
        const express = require('express');
        const app = express();
        const { createServer } = require("http");
        const { Server } = require("socket.io");
        const httpServer = createServer(app);
        const io = new Server(httpServer);

        //Seteo Static
        const STATICPATH = '/static'
        app.use(STATICPATH, express.static(__dirname + '/public'));

        //Configuro Middleware de manejo de errores
        const mwError = (err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({ error: err });
        }
        app.use(mwError)

        //Renderizo mi index.html en la ruta base de mi app
        app.get('/', (req, res) => {
            try {
                res.sendFile(__dirname + '/public/index.html');

            } catch (error) {
                res.status(500).json({ error: error });
            }
        });

        //Instancio array de productos y mensajes de chat según lo que haya en los .txt
        const mensajes = await contenedorChat.getAll()
        const productos = await contenedorProd.getAll()

        //Gestiono conexión de un cliente
        io.on('connection', (socket) => {

            console.log('Client connected:', socket.id);

            //Envío al nuevo socket los productos y mensajes de chat registrados al momento (en este caso uno por uno)
            for (const p of productos) {
                socket.emit(PRODMSG, p)
            }
            for (const m of mensajes) {
                socket.emit(CHATMSG, m)
            }

            //Recibo, guardo y retransmito Productos
            socket.on(PRODMSG, async (data) => {
                try {
                    //Guardo la data como viene del front, en realidad habría que hacerle validaciones antes...
                    let newId = await contenedorProd.save(data)
                    if (newId) {
                        const prod = { ...data, id: newId }
                        productos.push(prod)
                        io.sockets.emit(PRODMSG, prod);
                    } else {
                        throw 'Error al guardar nuevo producto'
                    }
                } catch (error) {
                    console.log(error);
                }
            });

            //Recibo, guardo y retransmito Mensajes de Chat
            socket.on(CHATMSG, async (data) => {
                try {
                    //Guardo la data como viene del front, en realidad habría que hacerle validaciones antes...
                    let newId = await contenedorChat.save(data)
                    if (newId) {
                        mensajes.push(data)
                        io.sockets.emit(CHATMSG, data);
                    } else {
                        throw 'Error al guardar nuevo Mensaje de Chat'
                    }
                } catch (error) {
                    console.log(error);
                }
            });

            socket.on('disconnect', () => console.log('Disconnected!', socket.id));
        });

        //Socket.io Error logging
        io.engine.on("connection_error", (err) => {
            console.log(err.req);      // the request object
            console.log(err.code);     // the error code, for example 1
            console.log(err.message);  // the error message, for example "Session ID unknown"
            console.log(err.context);  // some additional error context
        });

        //Pongo a escuchar al server
        try {
            const PORT = process.env.PORT || 8080;
            httpServer.listen(PORT, () => console.log(`Socket.IO server running. PORT: ${httpServer.address().port}`));

        } catch (error) {
            //Si falla el listen al puerto estipulado pruebo que se me asigne automáticamente otro puerto libre...
            httpServer.listen(0, () => console.log(`Socket.IO server running. PORT: ${httpServer.address().port}`));
        }

        //Server Error handling
        httpServer.on("error", error => {
            console.log('Error en el servidor:', error);
        })

    } catch (error) {
        console.log('Error en el hilo principal:', error);
    }
}
serverMain()