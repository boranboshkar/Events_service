import express from 'express';
import {
  reserveTickets,
  sellTickets,
  returnTickets,
  releaseTickets,
} from '../controllers/ticketController.js';

const ticketRouter = express.Router({ mergeParams: true });

// Adjusted routes without the '/:id' part, as it's inherited from the parent router
ticketRouter.post('/reserve', reserveTickets);
ticketRouter.post('/sell', sellTickets);
ticketRouter.post('/return', returnTickets);
ticketRouter.post('/release', releaseTickets);

export default ticketRouter;
