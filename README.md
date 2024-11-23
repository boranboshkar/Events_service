# Events_serviceEvents Service 🎫

A microservice for managing events and ticket inventory, including CRUD operations, comments, and ticket reservations.

Features

Event Management: Create, update, and retrieve event details.
Comments: Users can add and view comments on events.
Ticket Reservations: Locks tickets for 2 minutes during checkout to prevent double-booking.
Message Consumption: Listens to RabbitMQ for ticket-related updates.
Tech Stack

Node.js: Backend framework
MongoDB: Database for storing event and ticket data
RabbitMQ: Message broker for asynchronous updates
JWT: Authentication and authorization
API Endpoints

Method	Endpoint	Description
GET	/events	Get a list of events
GET	/events/:eventId	Get details of a specific event
POST	/events	Create a new event
POST	/tickets/reserve	Reserve tickets
POST	/comments	Add a comment to an event
Environment Variables

MONGO_URI: MongoDB connection string
JWT_SECRET: Secret key for token validation
RABBITMQ_URL: RabbitMQ connection string