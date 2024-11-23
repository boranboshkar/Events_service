import { Request, Response } from 'express';
import { Event } from '../models/eventModel.js';
import mongoose from 'mongoose';
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    let { page, size } = req.query;
    const pageNum = page ? parseInt(page as string, 10) : 1;
    const sizeNum = size ? parseInt(size as string, 10) : 10;
    const skip = (pageNum - 1) * sizeNum;
    const events = await Event.find()
                              .skip(skip)
                              .limit(sizeNum);

    const totalEvents = await Event.countDocuments();
    res.json({
      total: totalEvents,
      page: pageNum,
      size: sizeNum,
      data: events,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const getEventById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const event = await Event.findById(id);
      
      if (event) {
        res.json(event);
      } else {
        res.status(404).json({ message: 'Event not found' });
      }
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  };

  export const createEvent = async (req: Request, res: Response): Promise<void> => {
    const { permission} = req.query;
    if (permission !== 'A' && permission !== 'M') {
      res.status(403).json({ message: 'You do not have permission to create an event' });
      return;
    }
    try {
      const event = new Event(req.body);
      const savedEvent = await event.save();
      res.status(201).json(savedEvent);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        const validationErrors = Object.values(error.errors).map((err: any) => err.message);
        res.status(400).json({ message: 'Validation error', errors: validationErrors });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  };

  export const updateEvent = async (req: Request, res: Response): Promise<void> => {
    const { permission} = req.query;
    if (permission !== 'A' && permission !== 'M') {
      res.status(403).json({ message: 'You do not have permission to update an event' });
      return;
    }
    try {
        const { id } = req.params;
        const validateBody = Object.keys(req.body).every((key) => key==='startDate' || key==='endDate'
        
        );
        if (!validateBody){
          res.status(400).json({message:'Invalid request body'})
        }
        const { startDate, endDate } = req.body;

        // Convert to Date objects for comparison
        const startDateObj = startDate ? new Date(startDate) : null;
        const endDateObj = endDate ? new Date(endDate) : null;
        const now = new Date();

        // Validate: startDate >= now and endDate > startDate
        if (startDateObj && isNaN(startDateObj.getTime())) {
             res.status(400).json({ message: 'Invalid startDate format' });
        }
        if (endDateObj && isNaN(endDateObj.getTime())) {
             res.status(400).json({ message: 'Invalid endDate format' });
        }
        if (startDateObj && startDateObj < now) {
            
           res.status(400).json({ message: 'startDate must be greater than or equal to the current date and time.' });
        }
        if (startDateObj && endDateObj && endDateObj <= startDateObj) {
            
           res.status(400).json({ message: 'endDate must be greater than startDate.' });
        }

        // Proceed with update if validations pass
        let updateData = {};
        if (startDateObj) updateData['startDate'] = startDateObj;
        if (endDateObj) updateData['endDate'] = endDateObj;

        if (Object.keys(updateData).length > 0) {
            const updatedEvent = await Event.findByIdAndUpdate(id, { $set: updateData }, { new: true });

            if (updatedEvent) {
                res.status(200).json(updatedEvent);
            } else {
                res.status(404).json({ message: 'Event not found' });
            }
        } else {
            res.status(400).json({ message: 'No valid date fields provided for update' });
        }
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};
