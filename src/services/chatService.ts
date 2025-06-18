import { Server as SocketIOServer, Socket } from 'socket.io';
import Message from '../models/message';
import { corsOptionsSocket } from '../config/constants';

export class ChatService {
    private io: SocketIOServer;
    private activeUsers = new Map<string, Socket>();

    constructor(server: any) {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: corsOptionsSocket, // Adjust in production
                methods: ["GET", "POST"],
                credentials: true,
            }
        });
        this.setupConnection();
    }

    private setupConnection() {
        this.io.on('connection', (socket: Socket) => {
            let username = '';

            // Handle join event
            socket.on('join', async (sender: string) => {
                username = sender;
                this.activeUsers.set(username, socket);
                this.broadcastUserList();
                this.sendMessageHistory(socket);
            });

            // Handle new messages
            socket.on('message', async (data: { content: string, sender: string }) => {
                const newMessage = new Message({
                    username: data.sender,
                    content: data.content,
                    room: 'public'
                });
                await newMessage.save();
                this.io.emit('new-message', newMessage);
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                this.activeUsers.delete(username);
                this.broadcastUserList();
            });
        });
    }

    private async sendMessageHistory(socket: Socket) {
        const messages = await Message.find({ room: 'public' })
            .sort({ timestamp: -1 })
            .limit(50)
            .lean();
        socket.emit('message-history', messages.reverse());
    }

    private broadcastUserList() {
        const userList = Array.from(this.activeUsers.keys());
        this.io.emit('user-list', userList);
    }
}