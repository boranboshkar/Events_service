import * as amqp from 'amqplib';
import { sellTickets, returnTickets } from './controllers/ticketController.js'; 
import { Request, Response } from 'express';

export const consumeOrderUpdates = async () => {
  try {
    const conn = await amqp.connect(process.env.AMQP_URL);
    const channel = await conn.createChannel();

    const exchange = 'order_status_exchange';
    await channel.assertExchange(exchange, 'topic', { durable: true });

    const queue = 'events_service_queue';
    await channel.assertQueue(queue, { durable: true });

    await channel.bindQueue(queue, exchange, 'order.paid');
    await channel.bindQueue(queue, exchange, 'order.refunded');

    console.log(" [*] Waiting for order status updates. To exit press CTRL+C");

    await channel.consume(queue, async (msg) => {
      if (msg && msg.content) {
        const { orderId, status, eventId, ticketCategoryId, quantity } = JSON.parse(msg.content.toString());
        console.log(`Received message: ${msg.content.toString()}`);

        const req = ({
          params: { id: eventId },
          body: { ticketCategoryId, quantity }
        } as unknown) as Request;

        const res = {
          status: (statusCode: number) => ({
            json: (data: any) => console.log(`Response: ${statusCode}`, data)
          }),
          send: (data: any) => console.log(data)
        } as Response;
  

        if (status === 'Paid') {
          console.log(`Processing ticket sale for Event ID ${eventId}`);
          await sellTickets(req, res);
        } 
        else if (status === 'Refunded') {
          console.log(`Processing ticket return for Event ID ${eventId}`);
          await returnTickets(req, res);
        }

        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("Error in consumer:", error);
  }
};
