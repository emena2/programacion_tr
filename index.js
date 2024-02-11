const express = require('express');
const http = require('http');
var semaphore = require('semaphore')(2);
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Contador de personas en cola
let cola = 0;
let turnoActual = 1;

//Lectura archivo html - con esto es posible captar el nombre que el usuario escribe
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
	// Enviar información inicial al cliente
	socket.emit('init', { colaActual: cola });
	// Tomar un turno (aquí se implementa el semáforo, permitiendo que sólo dos personas a la vez puedan ingresar a la cola)

	socket.on('tomarTurno', (nombre) => {
		semaphore.take(() => {
			console.log('Añadiendo usuarios a la cola, espere...');
			if (nombre.trim() !== '') {
				cola++;
				const turnoUsuario = turnoActual++;

				// Emitir eventos a todos los clientes conectados
				io.emit('actualizarTurno', {
					colaActual: cola,
					turnoUsuario: turnoUsuario,
				});

				console.log(`Nuevo turno: ${turnoUsuario} - ${nombre}`);
			}
			setTimeout(() => {
				console.log('Añadido a la cola!');
				semaphore.leave();
			}, 5000);
		});
	});
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
	console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
