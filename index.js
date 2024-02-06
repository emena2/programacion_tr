const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Contador de personas en cola
let cola = 0;
let turnoActual = 1;

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
	// Enviar información inicial al cliente
	socket.emit('init', { colaActual: cola });

	// Tomar un turno
	socket.on('tomarTurno', (nombre) => {
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
	});
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
	console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
