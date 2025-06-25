"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const message_1 = __importDefault(require("../models/message"));
const node_cron_1 = __importDefault(require("node-cron"));
const socket_1 = require("../types/socket");
const logger_1 = __importDefault(require("../utils/logger"));
class ChatService {
    constructor(socketServer) {
        this.activeUsers = new Map();
        this.socketServer = socketServer.of(socket_1.ESOCKET_NAMESPACE.chat);
        this.setupConnection();
    }
    setupConnection() {
        this.socketServer.on('connection', (socket) => {
            let id = '';
            this._start(socket);
            // Handle join event
            socket.on(socket_1.EChatEvent.JOIN, async (sender) => {
                id = sender;
                this.activeUsers.set(id, socket);
                this.broadcastUserList();
                this.sendMessageHistory(socket);
            });
            socket.on(socket_1.EChatEvent.MESSAGE, async (data) => {
                console.log("🚀 ~ ChatService ~ socket.on ~ data.sender:", data.sender);
                const message = await message_1.default.createMessage(data.sender, data.content);
                this.socketServer.emit(socket_1.EChatEvent.NEW_MESSAGE, message);
            });
            // Handle disconnection
            socket.on('disconnect', () => {
                this.activeUsers.delete(id);
                this.broadcastUserList();
            });
        });
    }
    async sendMessageHistory(socket) {
        const messages = await message_1.default.find({ room: 'public' })
            .sort({ timestamp: -1 })
            .populate({
            path: 'user_id',
            select: 'username avatar email created_at'
        })
            .limit(50)
            .lean();
        socket.emit(socket_1.EChatEvent.MESSAGE_HISTORY, messages.reverse());
    }
    broadcastUserList() {
        const userList = Array.from(this.activeUsers.keys());
        this.socketServer.emit('user-list', userList);
    }
    _start(socket) {
        try {
            node_cron_1.default.schedule('*/1 * * * * *', () => {
                this.sendMessageHistory(socket);
            });
        }
        catch (error) {
            logger_1.default.error(`Error starting socket server: ${error}`);
        }
    }
}
exports.ChatService = ChatService;
