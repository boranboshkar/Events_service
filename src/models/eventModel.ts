import mongoose, { Schema, Document } from 'mongoose';

interface TicketCategory {
  name: string;
  price: number;
  quantityAvailable: number;
  quantityReserved: number;
  quantitySold: number;
}

interface Comment {
  user: Schema.Types.ObjectId;
  content: string;
  date: Date;
}

export interface EventDocument extends Document {
  name: string;
  description: string;
  min_price: number;
  image: string;
  startDate: Date;
  endDate: Date;
  location: string;
  category: string;
  ticketCategories: TicketCategory[];
  comments: Comment[];
}

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    min_price: { type: Number, required: true },
    image: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    ticketCategories: [{
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantityAvailable: { type: Number, required: true },
      quantityReserved: { type: Number, default: 0 },
      quantitySold: { type: Number, default: 0 }
    }],
    comments: [{
      user: { type: mongoose.Schema.Types.ObjectId},
      username: {type: String},
      content: { type: String },
      date: { type: Date, default: Date.now }
    }]
  });

eventSchema.pre('save', async function(this: EventDocument, next) {
    const minPrice = Math.min(...this.ticketCategories.map(tc => tc.price));
    this.min_price = minPrice;
    next();
  });

  eventSchema.post('findOneAndUpdate', async function(doc: EventDocument) {
    try {
        
        if (doc && doc.ticketCategories) {
            console.log('Document found, updating min_price');
            const minPrice = Math.min(...doc.ticketCategories.map(tc => tc.price));
            doc.min_price = minPrice;
            await doc.save();
            console.log('min_price updated successfully');
        } else {
            console.log('Document or ticketCategories not found');
        }
    } catch (error) {
        console.error("Error updating min_price:", error);
        throw new Error("Error updating min_price: " + error.message);
    }
});


export const Event = mongoose.model<EventDocument>('Event', eventSchema);
