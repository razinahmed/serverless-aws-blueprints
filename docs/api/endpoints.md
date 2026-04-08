# API Gateway Endpoints

Base URL: `https://{api-id}.execute-api.{region}.amazonaws.com/{stage}`

All endpoints except `/auth/login` require a valid JWT in the `Authorization: Bearer <token>` header.

## Authentication

### POST `/auth/login`

Authenticates a user and returns a JWT.

**Request body:**
```json
{ "email": "user@example.com", "password": "SecurePass1!" }
```

**Response 200:**
```json
{ "token": "eyJhbGciOi...", "expiresIn": 3600 }
```

## Items (CRUD)

### POST `/items`

Creates a new item in DynamoDB.

**Request body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Item name |
| `price` | number | Yes | Price in USD |
| `category` | string | No | Category label |

**Response 201:**
```json
{ "id": "uuid-1234", "name": "Widget", "price": 29.99, "category": "tools", "createdAt": "2025-03-15T10:00:00Z" }
```

### GET `/items/:id`

Retrieves a single item by its ID.

**Response 200:**
```json
{ "id": "uuid-1234", "name": "Widget", "price": 29.99, "category": "tools", "createdAt": "2025-03-15T10:00:00Z" }
```

**Response 404:** `{ "error": "Item not found" }`

### GET `/items`

Lists items with optional pagination.

| Parameter | In | Type | Default | Description |
|-----------|------|------|---------|-------------|
| `limit` | query | number | 20 | Max items per page |
| `nextToken` | query | string | - | Pagination cursor from previous response |
| `category` | query | string | - | Filter by category |

**Response 200:**
```json
{ "items": [...], "nextToken": "eyJpZCI6..." }
```

### PUT `/items/:id`

Updates an existing item. Accepts same body as POST.

**Response 200:** Updated item object

### DELETE `/items/:id`

Deletes an item.

**Response 204:** No content

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Validation error (missing/invalid fields) |
| 401 | Missing or expired JWT |
| 404 | Resource not found |
| 500 | Internal server error (DynamoDB failure, etc.) |
