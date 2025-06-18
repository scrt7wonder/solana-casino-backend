import { Server as SocketIOServer, Socket } from 'socket.io';
import Message from '../models/message';
import { corsOptionsSocket } from '../config/constants';
import mongoose from 'mongoose';
import { EChatEvent } from '../types/socket';

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
            let id = '';

            // Handle join event
            socket.on(EChatEvent.JOIN, async (sender: string) => {
                id = sender;
                this.activeUsers.set(id, socket);
                this.broadcastUserList();
                this.sendMessageHistory(socket);
            });

            socket.on(EChatEvent.MESSAGE, async (data: { content: string, sender: string }) => {
                const senderObjectId = new mongoose.Types.ObjectId(data.sender);
                const message = await Message.createMessage(senderObjectId, data.content);
                const updateNewMsg = {
                    user: message.user_id.username,
                    content: message.content,
                    avatar: message.user_id.avatar,
                    time: message.timestamp,
                }
                this.io.emit(EChatEvent.NEW_MESSAGE, updateNewMsg);
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
            .limit(50)
            .lean();
        socket.emit(EChatEvent.MESSAGE_HISTORY, messages.reverse());
    }

    private broadcastUserList() {
        const userList = Array.from(this.activeUsers.keys());
        this.io.emit('user-list', userList);
    }
}