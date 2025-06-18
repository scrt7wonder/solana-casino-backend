import app from './app';
import http from "http";
import { PORT } from './config/constants';
import { connectDB } from './config/db';
import { ChatService } from './services/chatService';

// Connect to the MongoDB database
connectDB();

const server = http.createServer(app);

// Initialize Socket.IO Chat Service
new ChatService(server);

// Start the Express server to listen on the specified port
server.listen(PORT, () => {
    console.log(`server is listening on ${PORT}`);
});