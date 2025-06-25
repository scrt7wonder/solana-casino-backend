"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const historyRoutes_1 = __importDefault(require("./routes/historyRoutes"));
const roundRoutes_1 = __importDefault(require("./routes/roundRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const notFoundHandler_1 = require("./middlewares/notFoundHandler");
const errorHandler_1 = require("./middlewares/errorHandler");
const constants_1 = require("./config/constants");
const app = (0, express_1.default)();
// CORS Configuration
const corsOptions = {
    origin: constants_1.ALLOW_HOSTS,
    credentials: true, // Required when using credentials (cookies, auth headers)
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};
// Middlewares
app.use((0, cors_1.default)(corsOptions));
app.use((0, morgan_1.default)('dev'));
// Parse incoming JSON requests using body-parser
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// Routes
// Define a route to check if the backend server is running
app.get("/", async (req, res) => {
    res.send("Backend Server is Running now!");
});
app.use('/api/auth', authRoutes_1.default);
app.use('/api/game', historyRoutes_1.default);
app.use('/api/round', roundRoutes_1.default);
// Error handlers
app.use(notFoundHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
exports.default = app;
