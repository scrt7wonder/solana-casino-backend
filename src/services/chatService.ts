import { Server, Namespace, Socket } from 'socket.io';
import Message from '../models/message';
import cron from 'node-cron'
import { EChatEvent, ESOCKET_NAMESPACE } from '../types/socket';
import logger from '../utils/logger';

export class ChatService {
    private socketServer: Namespace
    private activeUsers = new Map<string, Socket>();

    constructor(socketServer: Server) {
        this.socketServer = socketServer.of(ESOCKET_NAMESPACE.chat)
        this.setupConnection();
    }

    private setupConnection() {
        this.socketServer.on('connection', (socket: Socket) => {
            let id = '';
            this._start(socket);

            // Handle join event
            socket.on(EChatEvent.JOIN, async (sender: string) => {
                id = sender;
                this.activeUsers.set(id, socket);
                this.broadcastUserList();
                this.sendMessageHistory(socket);
            });

            socket.on(EChatEvent.MESSAGE, async (data: { content: string, sender: string }) => {
                console.log("🚀 ~ ChatService ~ socket.on ~ data.sender:", data.sender)
                const message = await Message.createMessage(data.sender, data.content);

                this.socketServer.emit(EChatEvent.NEW_MESSAGE, message);
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                this.activeUsers.delete(id);
                this.broadcastUserList();
            });
        });
    }

    private async sendMessageHistory(socket: Socket) {
        const messages = await Message.find({ room: 'public' })
            .sort({ timestamp: -1 })
            .populate({
                path: 'user_id',
                select: 'username avatar email'
            })
            .limit(50)
            .lean();
        socket.emit(EChatEvent.MESSAGE_HISTORY, messages.reverse());
    }

    private broadcastUserList() {
        const userList = Array.from(this.activeUsers.keys());
        this.socketServer.emit('user-list', userList);
    }

    private _start(socket: Socket) {
        try {
            cron.schedule('*/1 * * * * *', () => {
                this.sendMessageHistory(socket);
            })
        } catch (error) {
            logger.error(`Error starting socket server: ${error}`)
        }
    }
}