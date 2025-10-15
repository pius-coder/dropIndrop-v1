# Enhanced API Logger Guide

## Features

### Development Logger (`logger.ts`)

**Visual, detailed logging for development:**

#### Request Logging
```
================================================================================
📖 GET /api/articles
📝 Request ID: req_1705315200000_abc123
🕐 Time: 2024-01-15T10:30:00.000Z
🔍 Query: { category: "electronique", limit: "10" }
👤 User: John Doe (john@example.com) - ADMIN
```

#### Response Logging
```
🟢 Response: 200 ⚡ 42ms - 1.2 KB
================================================================================
```

#### Error Logging
```
🔴 Response: 404 ⏱️ 15ms
❌ Error: {
  error: "Not Found",
  message: "Article introuvable",
  details: { id: "abc123" }
}
================================================================================
```

### Features:
- ✅ **Request ID** - Unique identifier for tracing
- ✅ **Method emoji** - Visual indication (📖 GET, ➕ POST, etc.)
- ✅ **Query params** - Logged if present
- ✅ **Request body** - For POST/PUT/PATCH (sanitized)
- ✅ **User info** - If authenticated
- ✅ **Duration** - With performance indicator
  - ⚡ < 100ms (Fast)
  - ⏱️ 100-500ms (Normal)
  - 🐌 500-1000ms (Slow)
  - 🔥 > 1000ms (Very slow)
- ✅ **Status emoji** - Color-coded (🟢 2xx, 🟡 4xx, 🔴 5xx)
- ✅ **Response size** - In human-readable format
- ✅ **Error details** - Full error object for debugging
- ✅ **Sensitive data sanitization** - Auto-redacts passwords, tokens

---

## Production Logger (`logger-structured.ts`)

**JSON-formatted logs for log aggregation:**

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1705315200000_abc123",
  "level": "info",
  "method": "GET",
  "path": "/api/articles",
  "query": {
    "category": "electronique"
  },
  "status": 200,
  "duration": 42,
  "userId": "admin-id",
  "userRole": "ADMIN"
}
```

**Error Log:**
```json
{
  "timestamp": "2024-01-15T10:30:05.000Z",
  "requestId": "req_1705315205000_xyz789",
  "level": "error",
  "method": "POST",
  "path": "/api/articles",
  "status": 500,
  "duration": 150,
  "userId": "admin-id",
  "userRole": "ADMIN",
  "error": {
    "name": "DatabaseError",
    "message": "Connection timeout",
    "stack": "Error: Connection timeout\n  at ..."
  }
}
```

### Features:
- ✅ JSON format (parseable by log systems)
- ✅ Structured fields (timestamp, level, path, etc.)
- ✅ User tracking (userId, userRole)
- ✅ Error stack traces (dev only)
- ✅ Performance metrics (duration)
- ✅ Request correlation (requestId)

---

## Usage

### Development
```typescript
import { logger } from "@/lib/api/middleware";

app.use("*", logger);
```

**Output:**
```
================================================================================
📖 GET /api/articles/123
📝 Request ID: req_1705315200000_abc123
🕐 Time: 2024-01-15T10:30:00.000Z
👤 User: Admin User (admin@example.com) - SUPER_ADMIN
🟢 Response: 200 ⚡ 25ms - 450 B
================================================================================
```

### Production
```typescript
import { structuredLogger } from "@/lib/api/middleware/logger-structured";

app.use("*", structuredLogger);
```

**Output:**
```json
{"timestamp":"2024-01-15T10:30:00.000Z","requestId":"req_...","level":"info","method":"GET","path":"/api/articles/123","status":200,"duration":25,"userId":"admin-id","userRole":"SUPER_ADMIN"}
```

### Smart Logger (Auto-switch)
```typescript
import { smartLogger } from "@/lib/api/middleware/logger-structured";

// Uses pretty logger in dev, structured in prod
app.use("*", smartLogger);
```

---

## Method Emojis

| Method | Emoji | Description |
|--------|-------|-------------|
| GET | 📖 | Read |
| POST | ➕ | Create |
| PUT | ✏️ | Update (full) |
| PATCH | 🔧 | Update (partial) |
| DELETE | 🗑️ | Delete |
| Other | 📡 | Other operations |

---

## Status Emojis

| Status Range | Emoji | Description |
|--------------|-------|-------------|
| 2xx | 🟢 | Success |
| 3xx | 🔵 | Redirect |
| 4xx | 🟡 | Client error |
| 5xx | 🔴 | Server error |

---

## Performance Indicators

| Duration | Emoji | Description |
|----------|-------|-------------|
| < 100ms | ⚡ | Fast |
| 100-500ms | ⏱️ | Normal |
| 500-1000ms | 🐌 | Slow |
| > 1000ms | 🔥 | Very slow |

---

## Sensitive Data Sanitization

**Auto-redacts:**
- `password`
- `token`
- `secret`
- `authorization`
- `apiKey`

**Before:**
```json
{
  "email": "user@example.com",
  "password": "secretpass123"
}
```

**After:**
```
{
  email: "user@example.com",
  password: "***REDACTED***"
}
```

---

## Log Aggregation Integration

### Datadog
```typescript
// Add Datadog metadata
const logEntry = {
  ...baseLog,
  dd: {
    service: "drop-in-drop-api",
    env: process.env.NODE_ENV,
    version: "1.0.0"
  }
};
```

### CloudWatch
```typescript
// CloudWatch automatically parses JSON logs
// Just output structured JSON
```

### Logtail (Better Stack)
```typescript
import { Logtail } from "@logtail/node";

const logtail = new Logtail(process.env.LOGTAIL_TOKEN);
logtail.info("API Request", logEntry);
```

---

## Examples

### Successful Request
```
================================================================================
📖 GET /api/articles
📝 Request ID: req_1705315200000_abc123
🕐 Time: 2024-01-15T10:30:00.000Z
🔍 Query: { category: "electronique", limit: "20" }
👤 User: Jean Mballa (jean@dropindrop.cm) - ADMIN
🟢 Response: 200 ⚡ 35ms - 1.8 KB
================================================================================
```

### POST Request with Body
```
================================================================================
➕ POST /api/articles
📝 Request ID: req_1705315205000_xyz789
🕐 Time: 2024-01-15T10:30:05.000Z
📦 Body: {
  name: "iPhone 15 Pro",
  price: 850000,
  stock: 10,
  categoryId: "cat-123"
}
👤 User: Admin User (admin@dropindrop.cm) - SUPER_ADMIN
🟢 Response: 201 ⏱️ 125ms - 650 B
================================================================================
```

### Error Response
```
================================================================================
🗑️ DELETE /api/articles/nonexistent
📝 Request ID: req_1705315210000_def456
🕐 Time: 2024-01-15T10:30:10.000Z
👤 User: Admin User (admin@dropindrop.cm) - ADMIN
🟡 Response: 404 ⏱️ 18ms
❌ Error: {
  error: "Not Found",
  message: "Article introuvable"
}
================================================================================
```

### Slow Request
```
================================================================================
📖 GET /api/reports/analytics
📝 Request ID: req_1705315215000_ghi789
🕐 Time: 2024-01-15T10:30:15.000Z
👤 User: Manager User (manager@dropindrop.cm) - ADMIN
🟢 Response: 200 🔥 1245ms - 15.3 KB
================================================================================
```

---

## Configuration

### Environment Variables
```bash
# .env
NODE_ENV="development"  # Use pretty logger
NODE_ENV="production"   # Use structured logger
```

### Custom Log Levels
```typescript
// Add custom log levels
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error"
}
```

---

## Best Practices

### DO ✅
- Use structured logger in production
- Keep request IDs for tracing
- Sanitize sensitive data
- Log errors with full details (dev only)
- Track performance metrics

### DON'T ❌
- Log passwords or tokens
- Log huge payloads (limit size)
- Use console.log directly in routes
- Log credit card numbers
- Include stack traces in production

---

## Performance Impact

**Development Logger:**
- ~2-5ms overhead per request
- Readable output for debugging

**Structured Logger:**
- ~0.5-1ms overhead per request
- Optimized for production
- Machine-parseable

---

## Summary

✅ Enhanced development logger with emojis & colors  
✅ Structured JSON logger for production  
✅ Request ID tracking  
✅ User information logging  
✅ Performance indicators  
✅ Sensitive data sanitization  
✅ Error details  
✅ Query & body logging  
✅ Response size tracking  
✅ Auto-switch based on environment  
