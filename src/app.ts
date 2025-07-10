import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import historyRoutes from './routes/historyRoutes';
import roundRoutes from './routes/roundRoutes';
import referralRoutes from './routes/referralRoutes';
import authRoutes from './routes/authRoutes';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { errorHandler } from './middlewares/errorHandler';
import { ALLOW_HOSTS } from './config/constants';

const app = express();

// CORS Configuration
const corsOptions = {
    origin: ALLOW_HOSTS,
    credentials: true, // Required when using credentials (cookies, auth headers)
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Middlewares
app.use(cors(corsOptions));
app.use(morgan('dev'));

// Parse incoming JSON requests using body-parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
// Define a route to check if the backend server is running
app.get("/", async (req: any, res: any) => {
    res.send("Backend Server is Running now!");
});

app.use('/api/auth', authRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/game', historyRoutes);
app.use('/api/round', roundRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
