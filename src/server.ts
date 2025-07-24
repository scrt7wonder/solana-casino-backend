import app from './app';
import http from "http";
import { PORT } from './config/constants';
import { connectDB } from './config/db';
import { SocketController } from './controllers/socketController';

const start = async () => {
    // Connect to the MongoDB database
    await connectDB();

    const server = http.createServer(app);

    // Initialize Socket.IO Chat Service
    new SocketController(server);

    // Start the Express server to listen on the specified port
    server.listen(PORT, () => {
        console.log(`server is listening on ${PORT}`);
    });
}

start()