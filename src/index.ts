import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import 'dotenv/config';
import { eventRouter } from './routes/eventRoutes.js';
import {validateToken} from './validateToken.js'
import { consumeOrderUpdates } from './consumer.js';
import cors from 'cors'; 
dotenv.config();

const PORT  = process.env.PORT ;

const app = express();
// app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
// MongoDB connection function, unchanged
async function connectDB() {
  try {
    console.log(process.env.DB_URI)
    await mongoose.connect(process.env.DB_URI as string, {
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

// Await the database connection right at the top level
await connectDB();
consumeOrderUpdates().catch(console.error);

app.use('/events',validateToken,eventRouter);

// Start the server without wrapping in an async function
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

