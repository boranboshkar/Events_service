import express from 'express';
import { getEvents, createEvent, getEventById, updateEvent } from '../controllers/eventController.js';
import commentRouter from './commentRoutes.js';
import ticketRouter from './ticketRoutes.js';

export const eventRouter = express.Router();

// Event routes
eventRouter.get('/', getEvents);
eventRouter.post('/', createEvent);
eventRouter.get('/:id', getEventById);
eventRouter.put('/:id', updateEvent);

//comment routes
eventRouter.use('/:id/comments', commentRouter);

// tickets
eventRouter.use('/:id/tickets', ticketRouter);
