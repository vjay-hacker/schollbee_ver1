# SchoolBee Core API Documentation (v1)

This document describes the API endpoints, schemas, authorization levels, and request headers for the SchoolBee SaaS platform.

## Request Headers

Every request to the API (except public authentication routes) must include the following headers:

| Header | Value | Description |
|---|---|---|
| `Authorization` | `Bearer <JWT_TOKEN>` | Supabase auth token returned during login |
| `X-School-Id` | `<UUID>` | School tenant id context (required for RLS evaluation) |
| `Content-Type` | `application/json` | Request payload format |

---

## Authentication Endpoints

### 1. User Login
Authenticates users with email and password using Supabase Auth.

- **URL**: `/api/v1/auth/login`
- **Method**: `POST`
- **Rate Limit**: 20 requests per 15 minutes
- **Request Body**:
  ```json
  {
    "email": "vjay@schoolbee.com",
    "password": "super-secure-password"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "c1f72922-8356-42ea-a4e9-fc9197670877",
        "email": "vjay@schoolbee.com",
        "user_metadata": {
          "first_name": "Vjay",
          "last_name": "Doe"
        }
      },
      "session": {
        "accessToken": "eyJhbGciOi...",
        "refreshToken": "ref-...",
        "expiresIn": 3600
      }
    },
    "meta": {
      "timestamp": "2026-07-18T19:00:00.000Z"
    }
  }
  ```

---

## Students Endpoints

### 1. Retrieve Students List
Fetches all students linked to the active school tenant.

- **URL**: `/api/v1/students`
- **Method**: `GET`
- **Required Roles**: `school_admin`, `teacher`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "e0e29b19-c1f3-4cb5-829d-fc9197670999",
        "school_id": "a9a29d10-8b1b-43fb-a89e-fc9197670777",
        "first_name": "Alice",
        "last_name": "Doe",
        "admission_number": "SB1029",
        "date_of_birth": "2016-05-14",
        "gender": "female",
        "class_id": "b1b2a922-38d1-42ab-a4e9-fc9197670800",
        "classes": {
          "name": "Class 5-A"
        }
      }
    ]
  }
  ```

---

## Attendance Endpoints

### 1. Mark Class Attendance
Saves or updates daily attendance metrics for a specific class section.

- **URL**: `/api/v1/attendance`
- **Method**: `POST`
- **Required Roles**: `school_admin`, `teacher`
- **Request Body**:
  ```json
  {
    "classId": "b1b2a922-38d1-42ab-a4e9-fc9197670800",
    "sectionId": "d1d2b922-38d1-42ab-a4e9-fc9197670811",
    "date": "2026-07-18",
    "records": [
      {
        "studentId": "e0e29b19-c1f3-4cb5-829d-fc9197670999",
        "status": "present",
        "notes": "Arrived on time"
      }
    ]
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "sessionId": "a0a29d10-8b1b-43fb-a89e-fc9197670aa1"
    }
  }
  ```
