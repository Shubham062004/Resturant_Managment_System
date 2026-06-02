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

### A. Authentication Module (`/api/v1/auth`)

#### 1. Server Register

- **Method**: `POST`
- **Route**: `/api/v1/auth/register`
- **Request Payload**:

```json
{
  "email": "jane.cook@ovenxpress.com",
  "phone": "+1234567890",
  "firstName": "Jane",
  "lastName": "Cook",
  "password": "anothersecurepassword1!",
  "role": "KITCHEN_STAFF"
}
```

- **Success Response (201 Created)**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_a8d7f8a7...",
      "firstName": "Jane",
      "lastName": "Cook",
      "email": "jane.cook@ovenxpress.com",
      "role": "KITCHEN_STAFF"
    }
  },
  "message": "Registration successful. A verification link has been sent to your email."
}
```

#### 2. Server Login

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
- _Sets Cookie_: `refreshToken=<token_string>; HttpOnly; Secure; SameSite=Lax`

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_7d7a8d9a...",
      "firstName": "Alex",
      "lastName": "Mercer",
      "email": "staff@ovenxpress.com",
      "role": "CASHIER",
      "avatar": null
    }
  },
  "message": "Authentication successful"
}
```

#### 3. Refresh Access Token (Rotation)

- **Method**: `POST`
- **Route**: `/api/v1/auth/refresh`
- **Request Header**: Sends `refreshToken` cookie.
- **Success Response (200 OK)**:
- _Sets Cookie_: `refreshToken=<new_token_string>; HttpOnly; Secure; SameSite=Lax`

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Access token refreshed successfully."
}
```

#### 4. Single Device Logout

- **Method**: `POST`
- **Route**: `/api/v1/auth/logout`
- **Success Response (200 OK)**:
- _Clears Cookie_: `refreshToken`

```json
{
  "success": true,
  "data": null,
  "message": "Logged out successfully from this device."
}
```

#### 5. All Devices Logout

- **Method**: `POST`
- **Route**: `/api/v1/auth/logout-all`
- **Headers**: `Authorization: Bearer <access_token>`
- **Success Response (200 OK)**:
- _Clears Cookie_: `refreshToken`

```json
{
  "success": true,
  "data": null,
  "message": "Successfully logged out of all devices and active sessions."
}
```

#### 6. Google OAuth Login/Register

- **Method**: `POST`
- **Route**: `/api/v1/auth/google`
- **Request Payload**:

```json
{
  "token": "google-identity-id-token"
}
```

- **Success Response (200 OK)**:
- _Sets Cookie_: `refreshToken=<token_string>; HttpOnly; Secure; SameSite=Lax`

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": "usr_google...",
      "firstName": "Google",
      "lastName": "User",
      "email": "google.user@ovenxpress.com",
      "role": "CUSTOMER",
      "avatar": "https://lh3.googleusercontent.com/..."
    }
  },
  "message": "Google login successful."
}
```

#### 7. Forgot Password (Request Link)

- **Method**: `POST`
- **Route**: `/api/v1/auth/forgot-password`
- **Request Payload**:

```json
{
  "email": "staff@ovenxpress.com"
}
```

- **Success Response (200 OK)**:

```json
{
  "success": true,
  "data": null,
  "message": "If a user matches this email address, a password reset link has been dispatched."
}
```

#### 8. Reset Password (Perform Update)

- **Method**: `POST`
- **Route**: `/api/v1/auth/reset-password`
- **Request Payload**:

```json
{
  "token": "reset-token-hex",
  "password": "newSecurePassword123"
}
```

- **Success Response (200 OK)**:

```json
{
  "success": true,
  "data": null,
  "message": "Password has been updated successfully. Please log in with your new credentials."
}
```

#### 9. Verify Email Token

- **Method**: `POST`
- **Route**: `/api/v1/auth/verify-email`
- **Request Payload**:

```json
{
  "token": "verification-token-hex"
}
```

- **Success Response (200 OK)**:

```json
{
  "success": true,
  "data": null,
  "message": "Your email address has been verified successfully."
}
```

#### 10. Resend Verification Link

- **Method**: `POST`
- **Route**: `/api/v1/auth/resend-verification`
- **Request Payload**:

```json
{
  "email": "staff@ovenxpress.com"
}
```

- **Success Response (200 OK)**:

```json
{
  "success": true,
  "data": null,
  "message": "Verification link resent successfully."
}
```

#### 11. Send OTP

- **Method**: `POST`
- **Route**: `/api/v1/auth/send-otp`
- **Request Payload**:

```json
{
  "email": "staff@ovenxpress.com",
  "type": "EMAIL_VERIFICATION"
}
```

- **Success Response (200 OK)**:

```json
{
  "success": true,
  "data": null,
  "message": "OTP code successfully dispatched to your email address."
}
```

#### 12. Verify OTP

- **Method**: `POST`
- **Route**: `/api/v1/auth/verify-otp`
- **Request Payload**:

```json
{
  "email": "staff@ovenxpress.com",
  "code": "123456",
  "type": "EMAIL_VERIFICATION"
}
```

- **Success Response (200 OK)**:

```json
{
  "success": true,
  "data": null,
  "message": "OTP verification successful."
}
```

#### 13. Get Current User Session (Me)

- **Method**: `GET`
- **Route**: `/api/v1/auth/me`
- **Headers**: `Authorization: Bearer <access_token>`
- **Success Response (200 OK)**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_7d7a...",
      "email": "staff@ovenxpress.com",
      "phone": "+1234567890",
      "firstName": "Alex",
      "lastName": "Mercer",
      "avatar": null,
      "role": "CASHIER",
      "isEmailVerified": true,
      "isPhoneVerified": false,
      "isActive": true,
      "createdAt": "2026-06-02T13:00:00.000Z"
    }
  },
  "message": "Profile retrieved successfully."
}
```

### B. User Management Module (`/api/v1/users`)

#### 1. Update Profile & Upload Avatar

- **Method**: `PATCH`
- **Route**: `/api/v1/users/profile`
- **Headers**: `Authorization: Bearer <access_token>`, `Content-Type: multipart/form-data`
- **Request Body (Multipart)**:
  - `firstName` (string, optional)
  - `lastName` (string, optional)
  - `phone` (string, optional)
  - `avatar` (binary file, optional)
- **Success Response (200 OK)**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_7d7a...",
      "firstName": "Alex",
      "lastName": "Mercer-Revised",
      "email": "staff@ovenxpress.com",
      "phone": "+1987654321",
      "avatar": "/uploads/avatars/avatar-123456.png",
      "role": "CASHIER",
      "isEmailVerified": true,
      "isPhoneVerified": false,
      "isActive": true
    }
  },
  "message": "Your profile has been updated successfully."
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
