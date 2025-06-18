import express from 'express';
import cors from 'cors';
import bodyParser from "body-parser";
import morgan from 'morgan';
import historyRoutes from './routes/historyRoutes';
import authRoutes from './routes/authRoutes';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
// Parse incoming JSON requests using body-parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Routes
// Define a route to check if the backend server is running
app.get("/", async (req: any, res: any) => {
    res.send("Backend Server is Running now!");
});

app.use('/api/auth', authRoutes);
app.use('/api/game', historyRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
