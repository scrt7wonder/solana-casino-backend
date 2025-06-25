"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const http_1 = __importDefault(require("http"));
const constants_1 = require("./config/constants");
const db_1 = require("./config/db");
const socketController_1 = require("./controllers/socketController");
const start = () => {
    // Connect to the MongoDB database
    (0, db_1.connectDB)();
    const server = http_1.default.createServer(app_1.default);
    // Initialize Socket.IO Chat Service
    new socketController_1.SocketController(server);
    // Start the Express server to listen on the specified port
    server.listen(constants_1.PORT, () => {
        console.log(`server is listening on ${constants_1.PORT}`);
    });
};
start();
