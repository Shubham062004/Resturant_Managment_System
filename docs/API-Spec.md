# RESTful API Specification

This document details communication standards, request/response formats, security parameters, and modular endpoint outlines for the Oven Xpress API.

---

## 1. Global API Standards

### API Versioning & Endpoints

- All base endpoints reside under `/api/v1/*`.
- All content payloads are strictly JSON formatted.

### Global Header Specifications

- Request Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <jwt_access_token>`
- Response Headers:
  - `Content-Type: application/json`

### Standard Response Envelope

All API endpoints return standard, structured payloads:

#### Successful Responses

```json
{
  "success": true,
  "data": {},
  "message": "Resource retrieved successfully"
}
```

#### Error Responses

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Provided input fields are invalid",
    "details": [
      {
        "field": "email",
        "issue": "Invalid email address format"
      }
    ]
  }
}
```

---

## 2. Core API Scaffolding Skeletons

### A. Authentication Module (`/api/v1/auth`)

#### 1. Server Login

- **Method**: `POST`
- **Route**: `/api/v1/auth/login`
- **Request Payload**:

```json
{
  "email": "staff@ovenxpress.com",
  "password": "strongpassword123"
}
```

- **Success Response (200 OK)**:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_7d7a8d9a...",
      "name": "Alex Mercer",
      "email": "staff@ovenxpress.com",
      "role": "SERVER"
    }
  },
  "message": "Authentication successful"
}
```

#### 2. Staff Registration (Admin Hook)

- **Method**: `POST`
- **Route**: `/api/v1/auth/register`
- **Request Payload**:

```json
{
  "name": "Jane Cook",
  "email": "jane.cook@ovenxpress.com",
  "password": "anothersecurepassword1!",
  "role": "KITCHEN"
}
```

- **Success Response (201 Created)**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_a8d7f8a7...",
      "name": "Jane Cook",
      "email": "jane.cook@ovenxpress.com",
      "role": "KITCHEN"
    }
  },
  "message": "Staff member registered successfully"
}
```

### B. Table Module (`/api/v1/tables`)

#### 1. Retrieve Occupancy Grid

- **Method**: `GET`
- **Route**: `/api/v1/tables`
- **Success Response (200 OK)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "tbl_e8a9b7a...",
      "number": "Table 12",
      "capacity": 4,
      "status": "OCCUPIED"
    }
  ]
}
```
