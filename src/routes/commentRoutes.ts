import express from 'express';
import { addCommentToEvent, getCommentsForEvent } from '../controllers/commentController.js';

const commentRouter = express.Router({ mergeParams: true });

// Routes for comments on an event
commentRouter.post('/', addCommentToEvent);
commentRouter.get('/', getCommentsForEvent);

export default commentRouter;
