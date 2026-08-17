# CollabX API Response Standards

This document establishes the guidelines and response standards for APIs developed for CollabX. All feature modules (Auth, Creator, Brand, Admin) must follow these formats to ensure consistency between the backend and front-end teams.

## 1. Standard Success Response Format

All successful API responses must return a `2xx` HTTP status code and match the following JSON structure:

```json
{
    "success": true,
    "message": "Operation completed successfully.",
    "data": {}
}
```

- **`success`**: A boolean flag (`true`) indicating the operation succeeded.
- **`message`**: A developer/user-friendly summary of the completed operation.
- **`data`**: The response payload (object or array). If there is no data to return, default to an empty object `{}`.

---

## 2. Standard Error Response Format

All failed API responses must return a `4xx` or `5xx` HTTP status code and match the following JSON structure:

```json
{
    "success": false,
    "message": "Something went wrong.",
    "error": {
        "code": "ERROR_CODE"
    }
}
```

- **`success`**: A boolean flag (`false`) indicating the operation failed.
- **`message`**: A user-friendly error message description. Do not leak raw database errors or stack traces in production.
- **`error.code`**: A standardized string constant (in `UPPER_SNAKE_CASE`) used by the front-end to identify and categorize error cases programmatically (e.g., `UNAUTHORIZED`, `VALIDATION_ERROR`, `USER_NOT_FOUND`).

---

## 3. HTTP Status Code Table

Always use appropriate HTTP status codes based on the situation:

| Status Code | Label | Description |
| :--- | :--- | :--- |
| **200** | Success | Request completed successfully. |
| **201** | Resource Created | New resource was successfully created (e.g. user signup, post creation). |
| **400** | Bad Request | Request contains invalid syntax or inputs that can't be processed. |
| **401** | Unauthorized | Authentication is required or has failed. |
| **403** | Forbidden | Client does not have access rights to the content (authorization failure). |
| **404** | Not Found | Requested resource could not be found. |
| **409** | Conflict | The request conflicts with current state of server (e.g. duplicate email). |
| **422** | Validation Error | Request payload syntactically correct but semantically incorrect (validation fail). |
| **500** | Internal Server Error | Generic error message when server encounters an unexpected condition. |

---

## 4. Usage Guidelines

The backend provides a shared utility to easily construct these responses:
- File path: [apiResponse.js](file:///c:/Users/Dell/OneDrive/Documents/Ra%20Mo%20Project/CollabX/starting/backend/src/utils/apiResponse.js)

### Importing the utility:
```javascript
const { successResponse, errorResponse } = require('../../utils/apiResponse'); // Path depends on controller location
```

### Sending a Success Response:
```javascript
// Signature: successResponse(res, statusCode, message, data)
return successResponse(res, 200, 'User profile fetched successfully.', { user });
```

### Sending an Error Response:
```javascript
// Signature: errorResponse(res, statusCode, message, errorCode)
return errorResponse(res, 404, 'User not found.', 'USER_NOT_FOUND');
```

---

## 5. Examples

### Success Response Example (fetching data)
**HTTP Status:** `200 OK`
```json
{
  "success": true,
  "message": "Brand settings updated successfully.",
  "data": {
    "brandId": "br_987654",
    "name": "Acme Corp",
    "theme": "dark"
  }
}
```

### Error Response Example (authentication failure)
**HTTP Status:** `401 Unauthorized`
```json
{
  "success": false,
  "message": "Invalid email or password.",
  "error": {
    "code": "INVALID_CREDENTIALS"
  }
}
```
