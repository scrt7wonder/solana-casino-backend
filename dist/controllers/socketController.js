"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketController = void 0;
const socket_io_1 = require("socket.io");
const constants_1 = require("../config/constants");
const logger_1 = __importDefault(require("../utils/logger"));
const chatService_1 = require("../services/chatService");
const gameService_1 = require("../services/gameService");
class SocketController {
    constructor(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: constants_1.corsOptionsSocket, // Adjust in production
                credentials: true,
            }
        });
        this.createSocket();
    }
    createSocket() {
        try {
            console.log("chat");
            new chatService_1.ChatService(this.io);
            new gameService_1.GameService(this.io);
        }
        catch (error) {
            logger_1.default.error(`Error starting socket server: ${error}`);
        }
    }
}
exports.SocketController = SocketController;
