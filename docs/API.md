# API Documentation

## Base URL

**Local Development:** `http://localhost:7071/api/v1`  
**Production:** `https://<your-function-app>.azurewebsites.net/api/v1`

## Endpoints

### GET /appointments

Retrieve appointments within a specified date range.

#### Query Parameters

| Parameter | Type   | Required | Description                    | Format     |
|-----------|--------|----------|--------------------------------|------------|
| from      | string | Yes      | Start date for the range       | YYYY-MM-DD |
| to        | string | Yes      | End date for the range         | YYYY-MM-DD |

#### Example Request

```bash
curl "http://localhost:7071/api/v1/appointments?from=2025-12-01&to=2025-12-31"
```

#### Example Response

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "partitionKey": "20251220",
    "rowKey": "550e8400-e29b-41d4-a716-446655440000",
    "startUtc": "2025-12-20T14:00:00Z",
    "endUtc": "2025-12-20T18:00:00Z",
    "customerName": "John Doe",
    "email": "john@example.com",
    "phone": "(555) 123-4567",
    "serviceType": "Deep Clean",
    "notes": "Please bring cleaning supplies",
    "status": "Requested",
    "createdUtc": "2025-12-15T10:30:00Z"
  }
]
```

#### Response Codes

- `200 OK` - Success
- `400 Bad Request` - Missing or invalid parameters
- `500 Internal Server Error` - Server error

---

### POST /appointments

Create a new appointment request.

#### Request Body

| Field        | Type   | Required | Description                           |
|--------------|--------|----------|---------------------------------------|
| customerName | string | Yes      | Customer's full name                  |
| email        | string | Yes      | Customer's email address              |
| phone        | string | Yes      | Customer's phone number               |
| serviceType  | string | Yes      | Type of service requested             |
| startUtc     | string | Yes      | Appointment start time (ISO 8601)     |
| endUtc       | string | Yes      | Appointment end time (ISO 8601)       |
| notes        | string | No       | Additional notes or special requests  |

#### Service Types

- `Standard Cleaning` - Regular maintenance cleaning (2 hours)
- `Deep Clean` - Thorough detailed cleaning (4 hours)
- `Move-Out Cleaning` - Complete cleaning for moving (6 hours)

#### Example Request

```bash
curl -X POST http://localhost:7071/api/v1/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "email": "john@example.com",
    "phone": "(555) 123-4567",
    "serviceType": "Deep Clean",
    "startUtc": "2025-12-20T14:00:00Z",
    "endUtc": "2025-12-20T18:00:00Z",
    "notes": "Please bring eco-friendly cleaning supplies"
  }'
```

#### Example Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Appointment created successfully"
}
```

#### Response Codes

- `201 Created` - Appointment created successfully
- `400 Bad Request` - Invalid request body or validation error
- `500 Internal Server Error` - Server error

#### Validation Rules

1. **Required Fields**: All required fields must be present and non-empty
2. **Date Format**: Dates must be valid ISO 8601 format
3. **Date Logic**: 
   - End time must be after start time
   - Cannot book appointments in the past (more than 30 minutes ago)
4. **Email**: Must be valid email format
5. **Phone**: Any format accepted

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Or a simple text error message for validation errors.

---

## Data Model

### Appointment Entity (Table Storage)

Appointments are stored in Azure Table Storage with the following schema:

| Field         | Type     | Description                                    |
|---------------|----------|------------------------------------------------|
| PartitionKey  | string   | Date in yyyyMMdd format (for efficient queries)|
| RowKey        | string   | GUID (unique appointment identifier)           |
| StartUtc      | DateTime | Appointment start time in UTC                  |
| EndUtc        | DateTime | Appointment end time in UTC                    |
| CustomerName  | string   | Customer's full name                           |
| Email         | string   | Customer's email address                       |
| Phone         | string   | Customer's phone number                        |
| ServiceType   | string   | Type of service requested                      |
| Notes         | string   | Additional notes (optional)                    |
| Status        | string   | Appointment status (default: "Requested")      |
| CreatedUtc    | DateTime | When the appointment was created               |

### Partition Strategy

Appointments are partitioned by date (yyyyMMdd) to:
- Enable efficient date range queries
- Distribute load across partitions
- Optimize for the most common query pattern (appointments by date)

---

## CORS

CORS is enabled for all origins (`*`) in both local development and production environments.

For production, consider restricting CORS to specific origins:
- Static Web App URL
- Any other trusted frontend domains

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting in production using:
- Azure API Management
- Azure Front Door
- Custom middleware

---

## Authentication

The current MVP has no authentication (`AuthorizationLevel.Anonymous`).

For production, consider implementing:
- Azure AD authentication
- API keys
- OAuth 2.0
- Custom authentication middleware
