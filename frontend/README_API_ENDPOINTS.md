# FastAPI Backend - Required Endpoints

This document outlines all the API endpoints you need to implement in your FastAPI backend to support the appointment management system.

## Base URL
- Development: `http://localhost:8000/api`
- Production: `https://your-api-domain.com/api`

## Authentication
All endpoints should include proper authentication headers. The frontend will send:
```
Authorization: Bearer <jwt_token>
```

## Core Entities

### 1. Appointments

#### Get all appointments
```http
GET /appointments
```
**Query Parameters:**
- `start_date` (optional): YYYY-MM-DD format
- `end_date` (optional): YYYY-MM-DD format  
- `date` (optional): YYYY-MM-DD format for specific date

**Response:**
```json
[
  {
    "id": "string",
    "date": "2024-01-15",
    "startTime": "09:00",
    "endTime": "10:00",
    "clientName": "John Doe",
    "clientPhone": "+1234567890",
    "service": "Deep Tissue Massage",
    "reminderMethod": "whatsapp",
    "template": "appointment-reminder",
    "status": "scheduled",
    "cancellationNoticeSent": false
  }
]
```

#### Create appointment
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

#### Update appointment
```http
PUT /appointments/{id}
```

#### Delete appointment
```http
DELETE /appointments/{id}
```

#### Send reminder
```http
POST /appointments/{id}/send-reminder
```
**Response:**
```json
{
  "success": true,
  "message": "Reminder sent successfully"
}
```

#### Cancel appointment
```http
POST /appointments/{id}/cancel
```
**Response:** Updated appointment with status "canceled"

#### Send cancellation notice
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

### 2. Templates

#### Get all templates
```http
GET /templates
```
**Response:**
```json
[
  {
    "id": "string",
    "name": "Standard Reminder",
    "content": "Hi {clientName}, this is a reminder...",
    "variables": ["clientName", "service", "time"]
  }
]
```

#### Get template by ID
```http
GET /templates/{id}
```

#### Create template
```http
POST /templates
```
**Request Body:**
```json
{
  "name": "New Template",
  "content": "Template content with {variables}",
  "variables": ["clientName", "service"]
}
```

#### Update template
```http
PUT /templates/{id}
```

#### Delete template
```http
DELETE /templates/{id}
```

### 3. Services

#### Get all services
```http
GET /services
```
**Response:**
```json
[
  {
    "id": "string",
    "name": "Deep Tissue Massage",
    "duration": 60,
    "price": 120
  }
]
```

#### Get service by ID
```http
GET /services/{id}
```

#### Create service
```http
POST /services
```
**Request Body:**
```json
{
  "name": "New Service",
  "duration": 90,
  "price": 150
}
```

#### Update service
```http
PUT /services/{id}
```

#### Delete service
```http
DELETE /services/{id}
```

### 4. Clients

#### Get all clients
```http
GET /clients
```
**Response:**
```json
[
  {
    "id": "string",
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "notes": "Regular client, prefers morning appointments",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### Search clients
```http
GET /clients/search?q={query}
```
Search clients by name. Used for autocomplete in appointment creation.

#### Get client by ID
```http
GET /clients/{id}
```

#### Get client by phone
```http
GET /clients/phone/{phone}
```
Returns client if found, 404 if not found.

#### Create client
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

#### Update client
```http
PUT /clients/{id}
```

#### Delete client
```http
DELETE /clients/{id}
```

#### Get client appointments
```http
GET /clients/{id}/appointments
```
Returns appointment history for a specific client.

## Messaging Integration Endpoints

### Send WhatsApp Message
```http
POST /messaging/whatsapp/send
```
**Request Body:**
```json
{
  "to": "+1234567890",
  "message": "Your appointment reminder..."
}
```

### Send SMS
```http
POST /messaging/sms/send
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
  "message": "Your appointment reminder..."
}
```

### Send Telegram Message
```http
POST /messaging/telegram/send
```

## Error Responses

All endpoints should return consistent error responses:

```json
{
  "error": "Error message",
  "detail": "Detailed error information",
  "status_code": 400
}
```

## Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

## Database Models

### Appointment
```python
class Appointment(BaseModel):
    id: str
    date: str  # YYYY-MM-DD
    start_time: str  # HH:MM
    end_time: str  # HH:MM
    client_name: str
    client_phone: str
    service: str
    reminder_method: str  # whatsapp|telegram|sms|email
    template: str
    status: str  # not-sent|scheduled|sent|failed|canceled
    cancellation_notice_sent: bool = False
    created_at: datetime
    updated_at: datetime
```

### Template
```python
class Template(BaseModel):
    id: str
    name: str
    content: str
    variables: List[str]
    created_at: datetime
    updated_at: datetime
```

### Service
```python
class Service(BaseModel):
    id: str
    name: str
    duration: int  # minutes
    price: Optional[float]
    created_at: datetime
    updated_at: datetime
```

### Client
```python
class Client(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
```

## Additional Notes

1. **Authentication**: Implement JWT-based authentication
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **Validation**: Use Pydantic models for request/response validation
4. **Database**: Use PostgreSQL or SQLite
5. **Messaging**: Integrate with WhatsApp Business API, Twilio, SendGrid, etc.
6. **CORS**: Enable CORS for frontend domain
7. **Logging**: Implement proper logging for debugging
8. **Error Handling**: Consistent error responses across all endpoints