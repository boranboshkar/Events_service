import { Request, Response } from 'express';
import { Event } from '../models/eventModel.js';
import mongoose from 'mongoose';

export const addCommentToEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {userId, username} = req.query; 
    const { content } = req.body; 

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $push: { comments: { user: userId, content, date: new Date(),username:username } } },
      { new: true }
    );

    if (updatedEvent) {
      res.status(200).json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found.' });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred.' });
    }
  }
};
// TODO: check the sort
export const getCommentsForEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let { page, size } = req.query;

    const pageNum = page ? parseInt(page as string, 10) : 1;
    const sizeNum = size ? parseInt(size as string, 10) : 10;
    const skip = (pageNum - 1) * sizeNum;

    const events = await Event.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      { $unwind: "$comments" },
      { $sort: { "comments.date": 1 } }, 
      { $skip: skip },
      { $limit: sizeNum },
      { $group: {
        _id: "$_id",
        totalComments: { $sum: 1 },
        comments: { $push: "$comments" }
      }}
    ]);

    if (events.length > 0) {
      res.json({
        page: pageNum,
        size: sizeNum,
        totalComments: events[0].totalComments,
        comments: events[0].comments,
      });
    } else {
      res.status(404).json({ message: 'Event not found or no comments for this page.' });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred.' });
    }
  }
};
