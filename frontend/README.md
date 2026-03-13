# Appointment Management System - FastAPI Backend

A comprehensive appointment management system with messaging capabilities for appointment reminders and notifications.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Authentication](#authentication)
- [Setup Instructions](#setup-instructions)
- [Database Schema](#database-schema)
- [Messaging Integration](#messaging-integration)
- [Error Handling](#error-handling)

## Overview

This FastAPI backend provides a complete appointment management solution with the following features:

- **Appointment Management**: Create, read, update, delete appointments
- **Client Management**: Store and manage client information with search capabilities
- **Service Management**: Define services with duration and pricing
- **Template Management**: Create reusable message templates
- **Multi-channel Messaging**: WhatsApp, SMS, Email, and Telegram notifications
- **Automated Reminders**: Send appointment reminders and cancellation notices

## Technology Stack

- **Framework**: FastAPI (Python 3.8+)
- **Database**: PostgreSQL or SQLite
- **Authentication**: JWT-based authentication
- **Messaging**: WhatsApp Business API, Twilio, SendGrid, Telegram Bot API
- **Validation**: Pydantic models
- **ORM**: SQLAlchemy (recommended)

## API Endpoints

### Base URL
- **Development**: `http://localhost:8000/api`
- **Production**: `https://your-api-domain.com/api`

### Authentication
All endpoints require JWT authentication header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Appointments API

### Get All Appointments
```http
GET /appointments
```

**Query Parameters:**
- `start_date` (optional): Filter from date (YYYY-MM-DD)
- `end_date` (optional): Filter to date (YYYY-MM-DD)
- `date` (optional): Filter by specific date (YYYY-MM-DD)

**Response:**
```json
[
  {
    "id": "uuid",
    "date": "2024-01-15",
    "startTime": "09:00",
    "endTime": "10:00",
    "clientName": "John Doe",
    "clientPhone": "+1234567890",
    "service": "Deep Tissue Massage",
    "reminderMethod": "whatsapp",
    "template": "appointment-reminder",
    "status": "scheduled",
    "cancellationNoticeSent": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### Create Appointment
```http
POST /appointments
```

**Request Body:**
```json
{
  "date": "2024-01-15",
  "startTime": "09:00",
  "endTime": "10:00",
  "clientName": "John Doe",
  "clientPhone": "+1234567890",
  "service": "Deep Tissue Massage",
  "reminderMethod": "whatsapp",
  "template": "appointment-reminder",
  "status": "scheduled"
}
```

### Update Appointment
```http
PUT /appointments/{id}
```

**Request Body:** Same as create, all fields optional

### Delete Appointment
```http
DELETE /appointments/{id}
```

**Response:** `204 No Content`

### Send Appointment Reminder
```http
POST /appointments/{id}/send-reminder
```

**Response:**
```json
{
  "success": true,
  "message": "Reminder sent successfully via WhatsApp"
}
```

### Cancel Appointment
```http
POST /appointments/{id}/cancel
```

**Response:** Updated appointment with status "canceled"

### Send Cancellation Notice
```http
POST /appointments/{id}/send-cancellation
```

**Response:**
```json
{
  "success": true,
  "message": "Cancellation notice sent successfully"
}
```

---

## 2. Clients API

### Get All Clients
```http
GET /clients
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "notes": "Regular client, prefers morning appointments",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### Search Clients
```http
GET /clients/search?q={query}
```

**Use Case:** Autocomplete in appointment creation
**Response:** Array of matching clients

### Get Client by ID
```http
GET /clients/{id}
```

### Get Client by Phone
```http
GET /clients/phone/{phone}
```

**Note:** Returns 404 if client not found

### Create Client
```http
POST /clients
```

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "notes": "Prefers morning appointments"
}
```

### Update Client
```http
PUT /clients/{id}
```

### Delete Client
```http
DELETE /clients/{id}
```

### Get Client Appointments
```http
GET /clients/{id}/appointments
```

**Response:** Array of appointments for the client

---

## 3. Services API

### Get All Services
```http
GET /services
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Deep Tissue Massage",
    "duration": 60,
    "price": 120.00,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### Get Service by ID
```http
GET /services/{id}
```

### Create Service
```http
POST /services
```

**Request Body:**
```json
{
  "name": "Swedish Massage",
  "duration": 90,
  "price": 150.00
}
```

### Update Service
```http
PUT /services/{id}
```

### Delete Service
```http
DELETE /services/{id}
```

---

## 4. Templates API

### Get All Templates
```http
GET /templates
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Standard Reminder",
    "content": "Hi {clientName}, this is a reminder for your {service} appointment tomorrow at {time}. Please confirm by replying YES.",
    "variables": ["clientName", "service", "time"],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### Get Template by ID
```http
GET /templates/{id}
```

### Create Template
```http
POST /templates
```

**Request Body:**
```json
{
  "name": "Cancellation Notice",
  "content": "Hi {clientName}, your {service} appointment on {date} has been cancelled. Please call us to reschedule.",
  "variables": ["clientName", "service", "date"]
}
```

### Update Template
```http
PUT /templates/{id}
```

### Delete Template
```http
DELETE /templates/{id}
```

---

## 5. Messaging API

### Send WhatsApp Message
```http
POST /messaging/whatsapp/send
```

**Request Body:**
```json
{
  "to": "+1234567890",
  "message": "Your appointment reminder message here..."
}
```

### Send SMS
```http
POST /messaging/sms/send
```

**Request Body:**
```json
{
  "to": "+1234567890",
  "message": "Your appointment reminder message here..."
}
```

### Send Email
```http
POST /messaging/email/send
```

**Request Body:**
```json
{
  "to": "client@example.com",
  "subject": "Appointment Reminder",
  "message": "Your appointment reminder message here..."
}
```

### Send Telegram Message
```http
POST /messaging/telegram/send
```

**Request Body:**
```json
{
  "to": "@username_or_chat_id",
  "message": "Your appointment reminder message here..."
}
```

---

## Data Models

### Appointment Model
```python
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class Appointment(BaseModel):
    id: str
    date: str  # YYYY-MM-DD format
    start_time: str  # HH:MM format
    end_time: str  # HH:MM format
    client_name: str
    client_phone: str
    service: str
    reminder_method: str  # whatsapp|telegram|sms|email
    template: str
    status: str  # not-sent|scheduled|sent|failed|canceled
    cancellation_notice_sent: bool = False
    created_at: datetime
    updated_at: datetime

class AppointmentCreate(BaseModel):
    date: str
    start_time: str
    end_time: str
    client_name: str
    client_phone: str
    service: str
    reminder_method: str
    template: str
    status: str = "scheduled"

class AppointmentUpdate(BaseModel):
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    client_name: Optional[str] = None
    client_phone: Optional[str] = None
    service: Optional[str] = None
    reminder_method: Optional[str] = None
    template: Optional[str] = None
    status: Optional[str] = None
```

### Client Model
```python
class Client(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class ClientCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    notes: Optional[str] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None
```

### Service Model
```python
class Service(BaseModel):
    id: str
    name: str
    duration: int  # minutes
    price: Optional[float] = None
    created_at: datetime
    updated_at: datetime

class ServiceCreate(BaseModel):
    name: str
    duration: int
    price: Optional[float] = None

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    duration: Optional[int] = None
    price: Optional[float] = None
```

### Template Model
```python
from typing import List

class Template(BaseModel):
    id: str
    name: str
    content: str
    variables: List[str]
    created_at: datetime
    updated_at: datetime

class TemplateCreate(BaseModel):
    name: str
    content: str
    variables: List[str]

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None
    variables: Optional[List[str]] = None
```

---

## Authentication

Implement JWT-based authentication with the following endpoints:

```http
POST /auth/login
POST /auth/register
POST /auth/refresh
POST /auth/logout
```

**Login Request:**
```json
{
  "username": "admin",
  "password": "secure_password"
}
```

**Login Response:**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

## Database Schema

### Required Tables

1. **appointments**
   - id (UUID, Primary Key)
   - date (DATE)
   - start_time (TIME)
   - end_time (TIME)
   - client_name (VARCHAR)
   - client_phone (VARCHAR)
   - service (VARCHAR)
   - reminder_method (ENUM)
   - template (VARCHAR)
   - status (ENUM)
   - cancellation_notice_sent (BOOLEAN)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

2. **clients**
   - id (UUID, Primary Key)
   - name (VARCHAR)
   - phone (VARCHAR, Unique)
   - email (VARCHAR, Optional)
   - notes (TEXT, Optional)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

3. **services**
   - id (UUID, Primary Key)
   - name (VARCHAR)
   - duration (INTEGER)
   - price (DECIMAL, Optional)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

4. **templates**
   - id (UUID, Primary Key)
   - name (VARCHAR)
   - content (TEXT)
   - variables (JSON)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

5. **users** (for authentication)
   - id (UUID, Primary Key)
   - username (VARCHAR, Unique)
   - password_hash (VARCHAR)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

---

## Messaging Integration

### WhatsApp Business API
- Integrate with WhatsApp Business API
- Handle webhook for message status updates
- Support message templates

### Twilio (SMS)
- Use Twilio API for SMS messaging
- Handle delivery status callbacks

### SendGrid (Email)
- Integrate SendGrid for email notifications
- Support HTML templates

### Telegram Bot API
- Create Telegram Bot
- Handle message sending via Bot API

---

## Setup Instructions

### 1. Install Dependencies
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic python-jwt bcrypt python-multipart
```

### 2. Environment Variables
Create `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost/appointment_db
JWT_SECRET_KEY=your_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30

# Messaging API Keys
WHATSAPP_API_KEY=your_whatsapp_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
SENDGRID_API_KEY=your_sendgrid_key
TELEGRAM_BOT_TOKEN=your_telegram_token
```

### 3. Database Migration
```python
# Create database tables
from sqlalchemy import create_engine
from your_models import Base

engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)
```

### 4. Run the Application
```bash
uvicorn main:app --reload --port 8000
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "error": "Error message",
  "detail": "Detailed error information",
  "status_code": 400
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `204`: No Content
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

### Error Examples

**Validation Error (422):**
```json
{
  "error": "Validation failed",
  "detail": [
    {
      "loc": ["body", "phone"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ],
  "status_code": 422
}
```

**Not Found (404):**
```json
{
  "error": "Client not found",
  "detail": "Client with ID 'uuid' does not exist",
  "status_code": 404
}
```

---

## Implementation Checklist

- [ ] Set up FastAPI project structure
- [ ] Implement database models with SQLAlchemy
- [ ] Create Pydantic schemas for validation
- [ ] Implement JWT authentication
- [ ] Build all CRUD endpoints for appointments
- [ ] Build all CRUD endpoints for clients
- [ ] Build all CRUD endpoints for services
- [ ] Build all CRUD endpoints for templates
- [ ] Implement messaging integration (WhatsApp)
- [ ] Implement messaging integration (SMS)
- [ ] Implement messaging integration (Email)
- [ ] Implement messaging integration (Telegram)
- [ ] Add proper error handling and logging
- [ ] Implement rate limiting
- [ ] Add CORS configuration
- [ ] Write API documentation with FastAPI/OpenAPI
- [ ] Set up database migrations
- [ ] Configure environment variables
- [ ] Add input validation and sanitization
- [ ] Implement automated testing
- [ ] Set up deployment configuration

---

## Additional Features (Optional)

- **Recurring Appointments**: Support for weekly/monthly recurring appointments
- **Calendar Sync**: Integration with Google Calendar, Outlook
- **Payment Integration**: Stripe/PayPal integration for service payments
- **Analytics**: Appointment statistics and reporting
- **Multi-tenant**: Support multiple businesses/users
- **File Uploads**: Client profile pictures, documents
- **Notifications**: Push notifications for mobile apps
- **Backup**: Automated database backups

---

## License

This project is licensed under the MIT License.