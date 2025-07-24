import { Server as SocketIOServer, Socket } from 'socket.io';
import { corsOptionsSocket } from '../config/constants';
import logger from '../utils/logger';
import { ChatService } from '../services/chatService';
import { GameService } from '../services/gameService';

export class SocketController {
    private io: SocketIOServer;

    constructor(server: any) {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: corsOptionsSocket, // Adjust in production
                credentials: true,
            }
        });
        this.createSocket();
    }

    private createSocket() {
        try {
            new ChatService(this.io);
            new GameService(this.io);
        } catch (error) {
            logger.error(`Error starting socket server: ${error}`)
        }
    }
}