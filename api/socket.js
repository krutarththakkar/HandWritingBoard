// api/socket.js
import { Server } from 'socket.io';
import http from 'http';

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Socket server running');
});

const io = new Server(server);
const remoteIds = new Set();

io.on('connection', (client) => {
    console.log('connection');

    client.on('join', (data) => {
        console.log('join', data);
        client.join('general');
        client.peerId = data.peerId;
        remoteIds.add(data.peerId);
        console.log(Array.from(remoteIds));
        io.to('general').emit('join', {
            newId: client.peerId,
            allIds: Array.from(remoteIds),
        });
    });

    client.on('turnOn', (data) => {
        console.log('turnOn');
        io.to('general').emit('turnOn', data);
    });

    client.on('turnOff', (data) => {
        console.log('img update');
        io.to('general').emit('turnOff', data);
    });

    client.on('disconnect', () => {
        console.log(client.peerId);
        remoteIds.delete(client.peerId);
        io.to('general').emit('exit', {
            removeId: client.peerId,
            allIds: Array.from(remoteIds),
        });
    });

    client.emit('connection');
});

// Export the server so Vercel can run it
export default (req, res) => {
    server.emit('request', req, res);
};
