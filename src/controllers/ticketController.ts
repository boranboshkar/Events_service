import { Request, Response } from 'express';
import { Event } from '../models/eventModel.js';

export const reserveTickets = async (req: Request, res: Response): Promise<void> => {
  const eventId = req.params.id;
  const { ticketCategoryId, quantity } = req.body;

  try {
      // Attempt an atomic update with the condition embedded in the query
      const updatedEvent = await Event.findOneAndUpdate(
          { 
              "_id": eventId, 
              "ticketCategories": {
                  $elemMatch: {
                      "_id": ticketCategoryId,
                      "quantityAvailable": { $gte: quantity }
                  }
              }
          },
          {
              $inc: {
                  "ticketCategories.$.quantityAvailable": -quantity,
                  "ticketCategories.$.quantityReserved": quantity
              }
          },
          { new: true }
      );

      // Check if the update was successful (i.e., if the document was found and updated)
      if (updatedEvent) {
          // Optionally, further verify the update correctness here
           res.status(200).json(updatedEvent);
      } else {
          // The operation was not performed likely because the condition was not met
           res.status(404).json({ message: "Event or ticket category not found, or not enough tickets available." });
      }
  } catch (error) {
      console.log(error);
      res.status(500).json({ message: "An error occurred while reserving tickets." });
  }
};


  export const sellTickets = async (req: Request, res: Response): Promise<void> => {
    const eventId = req.params.id
    const {ticketCategoryId, quantity } = req.body;
    try {
      const event = await Event.findOneAndUpdate(
        { 
          "_id": eventId, 
          "ticketCategories": {
              $elemMatch: {
                  "_id": ticketCategoryId,
                  "quantityReserved": { $gte: quantity }
              }
          }
      },
        { $inc: { "ticketCategories.$.quantityReserved": -quantity, "ticketCategories.$.quantitySold": quantity } },
        { new: true }
      );
  
      if (!event) {
         res.status(404).json({ message: "Event or ticket category not found, or not enough tickets reserved." });
      }
  else{
      res.status(200).json(event);  
  }
    } catch (error) {
      res.status(500).json({ message: "An error occurred while selling tickets." });
    }
  };
  

  export const returnTickets = async (req: Request, res: Response): Promise<void> => {
    const eventId = req.params.id
    const {ticketCategoryId, quantity } = req.body;
  
  
    try {
      const event = await Event.findOneAndUpdate(
        { 
          "_id": eventId, 
          "ticketCategories": {
              $elemMatch: {
                  "_id": ticketCategoryId,
                  "quantitySold": { $gte: quantity }
              }
          }
      },
      { $inc: { "ticketCategories.$.quantitySold": -quantity, "ticketCategories.$.quantityAvailable": quantity } },
        { new: true }
      );
  
      if (!event) {
        res.status(404).json({ message: "Event or ticket category not found, or invalid quantity of tickets to return." });
      }
  
      else{
        res.status(200).json(event);  
    }
    } catch (error) {
      res.status(500).json({ message: "An error occurred while returning tickets." });
    }
  };
  

  export const releaseTickets = async (req: Request, res: Response): Promise<void> => {
    const eventId = req.params.id
    const {ticketCategoryId, quantity } = req.body;
  
    try {
      const event = await Event.findOneAndUpdate(
        { 
          "_id": eventId, 
          "ticketCategories": {
              $elemMatch: {
                  "_id": ticketCategoryId,
                  "quantityReserved": { $gte: quantity }
              }
          }
      },
        { $inc: { "ticketCategories.$.quantityReserved": -quantity, "ticketCategories.$.quantityAvailable": quantity } },
        { new: true }
      );
  
      if (!event) {
        res.status(404).json({ message: "Event or ticket category not found, or not enough tickets reserved for release." });
      }
  
      else{
        res.status(200).json(event);  
    }
    } catch (error) {
      res.status(500).json({ message: "An error occurred while releasing tickets." });
    }
  };
  