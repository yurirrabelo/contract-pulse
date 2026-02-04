# Talent Allocation Hub - API Specification

## Overview

This document provides the complete API specification for the Talent Allocation Hub backend, including all endpoints, request/response schemas, and field mappings.

---

## Base URL

```
/api/v1
```

---

## Authentication

All endpoints require JWT authentication via Bearer token:

```
Authorization: Bearer <token>
```

---

## Standard Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### List Response

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "per_page": 20
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

---

## 1. Clients

**Table:** `clients`

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | uuid | auto | Primary key |
| `name` | string | yes | Company name |
| `cnpj` | string | yes | Brazilian tax ID |
| `contact` | string | yes | Contact info |
| `created_at` | timestamp | auto | Creation date |

---

### GET /clients

List all clients.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `per_page` | integer | 20 | Items per page |
| `search` | string | - | Search by name or CNPJ |

**Request:**

```http
GET /api/v1/clients?page=1&per_page=20&search=tech
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "TechCorp Brasil",
      "cnpj": "12.345.678/0001-90",
      "contact": "contato@techcorp.com.br",
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Inovação Tech Ltda",
      "cnpj": "98.765.432/0001-10",
      "contact": "(11) 99999-8888",
      "created_at": "2024-02-20T14:45:00Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "per_page": 20
  }
}
```

---

### GET /clients/:id

Get client by ID.

**Request:**

```http
GET /api/v1/clients/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "TechCorp Brasil",
    "cnpj": "12.345.678/0001-90",
    "contact": "contato@techcorp.com.br",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response (404 Not Found):**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Client not found"
  }
}
```

---

### POST /clients

Create a new client.

**Request:**

```http
POST /api/v1/clients
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Nova Empresa S.A.",
  "cnpj": "11.222.333/0001-44",
  "contact": "comercial@novaempresa.com.br"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "name": "Nova Empresa S.A.",
    "cnpj": "11.222.333/0001-44",
    "contact": "comercial@novaempresa.com.br",
    "created_at": "2024-03-10T09:00:00Z"
  }
}
```

**Response (422 Validation Error):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "cnpj", "reason": "CNPJ already exists" },
      { "field": "name", "reason": "Name is required" }
    ]
  }
}
```

---

### PUT /clients/:id

Update a client.

**Request:**

```http
PUT /api/v1/clients/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "TechCorp Brasil Atualizado",
  "contact": "novo-contato@techcorp.com.br"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "TechCorp Brasil Atualizado",
    "cnpj": "12.345.678/0001-90",
    "contact": "novo-contato@techcorp.com.br",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### DELETE /clients/:id

Delete a client.

**Request:**

```http
DELETE /api/v1/clients/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Client deleted successfully"
  }
}
```

**Response (409 Conflict):**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete client with active contracts",
    "details": {
      "active_contracts": 3
    }
  }
}
```

---

## 2. Contracts

**Table:** `contracts`

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | uuid | auto | Primary key |
| `client_id` | uuid | yes | FK to clients |
| `contract_number` | string | yes | Unique contract number |
| `project_name` | string | no | Project name |
| `type` | enum | yes | 'staffing' or 'factory' |
| `start_date` | date | yes | Contract start |
| `end_date` | date | yes | Contract end |
| `monthly_value` | decimal | yes | Monthly revenue |
| `created_at` | timestamp | auto | Creation date |

### Enums

```typescript
type ContractType = 'staffing' | 'factory';
type ContractStatus = 'active' | 'expiring_30' | 'expiring_60' | 'expiring_90' | 'expired';
```

---

### GET /contracts

List all contracts.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `per_page` | integer | 20 | Items per page |
| `client_id` | uuid | - | Filter by client |
| `type` | string | - | Filter by type |
| `status` | string | - | Filter by status |

**Request:**

```http
GET /api/v1/contracts?type=staffing&status=active
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "client_id": "550e8400-e29b-41d4-a716-446655440001",
      "contract_number": "CTR-2024-001",
      "project_name": "Sistema de Gestão",
      "type": "staffing",
      "start_date": "2024-01-01",
      "end_date": "2024-12-31",
      "monthly_value": 50000.00,
      "created_at": "2024-01-05T08:00:00Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "per_page": 20
  }
}
```

---

### GET /contracts/:id

Get contract by ID.

**Request:**

```http
GET /api/v1/contracts/660e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "client_id": "550e8400-e29b-41d4-a716-446655440001",
    "contract_number": "CTR-2024-001",
    "project_name": "Sistema de Gestão",
    "type": "staffing",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "monthly_value": 50000.00,
    "created_at": "2024-01-05T08:00:00Z"
  }
}
```

---

### GET /contracts/:id/details

Get contract with full details (client, positions, status).

**Request:**

```http
GET /api/v1/contracts/660e8400-e29b-41d4-a716-446655440001/details
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "client_id": "550e8400-e29b-41d4-a716-446655440001",
    "contract_number": "CTR-2024-001",
    "project_name": "Sistema de Gestão",
    "type": "staffing",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "monthly_value": 50000.00,
    "created_at": "2024-01-05T08:00:00Z",
    "status": "active",
    "days_until_expiration": 180,
    "client": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "TechCorp Brasil",
      "cnpj": "12.345.678/0001-90",
      "contact": "contato@techcorp.com.br"
    },
    "positions": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440001",
        "title": "Desenvolvedor Full Stack Senior",
        "stack_id": "880e8400-e29b-41d4-a716-446655440001",
        "status": "filled",
        "allocation_percentage": 100
      },
      {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "title": "QA Analyst",
        "stack_id": "880e8400-e29b-41d4-a716-446655440002",
        "status": "open",
        "allocation_percentage": 100
      }
    ]
  }
}
```

---

### POST /contracts

Create a new contract with positions.

**Request:**

```http
POST /api/v1/contracts
Authorization: Bearer <token>
Content-Type: application/json

{
  "client_id": "550e8400-e29b-41d4-a716-446655440001",
  "contract_number": "CTR-2024-010",
  "project_name": "Novo Projeto Mobile",
  "type": "staffing",
  "start_date": "2024-04-01",
  "end_date": "2025-03-31",
  "monthly_value": 75000.00,
  "positions": [
    {
      "title": "Mobile Developer Senior",
      "stack_id": "880e8400-e29b-41d4-a716-446655440003",
      "seniority_id": "990e8400-e29b-41d4-a716-446655440001",
      "allocation_percentage": 100
    },
    {
      "title": "UX Designer",
      "stack_id": "880e8400-e29b-41d4-a716-446655440004",
      "allocation_percentage": 50
    }
  ]
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440010",
    "client_id": "550e8400-e29b-41d4-a716-446655440001",
    "contract_number": "CTR-2024-010",
    "project_name": "Novo Projeto Mobile",
    "type": "staffing",
    "start_date": "2024-04-01",
    "end_date": "2025-03-31",
    "monthly_value": 75000.00,
    "created_at": "2024-03-15T10:00:00Z",
    "positions": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440010",
        "title": "Mobile Developer Senior",
        "stack_id": "880e8400-e29b-41d4-a716-446655440003",
        "seniority_id": "990e8400-e29b-41d4-a716-446655440001",
        "status": "open",
        "start_date": "2024-04-01",
        "end_date": "2025-03-31",
        "allocation_percentage": 100,
        "created_at": "2024-03-15T10:00:00Z"
      },
      {
        "id": "770e8400-e29b-41d4-a716-446655440011",
        "title": "UX Designer",
        "stack_id": "880e8400-e29b-41d4-a716-446655440004",
        "seniority_id": null,
        "status": "open",
        "start_date": "2024-04-01",
        "end_date": "2025-03-31",
        "allocation_percentage": 50,
        "created_at": "2024-03-15T10:00:00Z"
      }
    ]
  }
}
```

---

### PUT /contracts/:id

Update a contract.

**Request:**

```http
PUT /api/v1/contracts/660e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
Content-Type: application/json

{
  "project_name": "Sistema de Gestão v2",
  "monthly_value": 55000.00
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "client_id": "550e8400-e29b-41d4-a716-446655440001",
    "contract_number": "CTR-2024-001",
    "project_name": "Sistema de Gestão v2",
    "type": "staffing",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "monthly_value": 55000.00,
    "created_at": "2024-01-05T08:00:00Z"
  }
}
```

---

### DELETE /contracts/:id

Delete a contract.

**Request:**

```http
DELETE /api/v1/contracts/660e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Contract and associated positions deleted successfully",
    "deleted_positions": 3
  }
}
```

---

### GET /contracts/expiring/:days

Get contracts expiring within X days.

**Request:**

```http
GET /api/v1/contracts/expiring/30
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "days": 30,
    "contracts": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440005",
        "contract_number": "CTR-2024-005",
        "project_name": "Projeto Alpha",
        "client_name": "Cliente ABC",
        "end_date": "2024-04-15",
        "days_until_expiration": 25,
        "monthly_value": 40000.00,
        "positions_count": 4,
        "filled_positions": 3
      }
    ],
    "summary": {
      "total_contracts": 3,
      "clients_affected": 2,
      "professionals_involved": 8,
      "total_monthly_value": 120000.00
    }
  }
}
```

---

## 3. Stack Categories

**Table:** `stack_categories`

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | uuid | auto | Primary key |
| `name` | string | yes | Category name |
| `description` | string | no | Description |
| `created_at` | timestamp | auto | Creation date |

---

### GET /stack-categories

List all categories.

**Request:**

```http
GET /api/v1/stack-categories
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440001",
      "name": "Backend",
      "description": "Tecnologias de backend e APIs",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440002",
      "name": "Frontend",
      "description": "Tecnologias de interface de usuário",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440003",
      "name": "Mobile",
      "description": "Desenvolvimento mobile nativo e híbrido",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440004",
      "name": "DevOps",
      "description": "Infraestrutura e automação",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440005",
      "name": "Data",
      "description": "Dados, BI e Machine Learning",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /stack-categories

Create a category.

**Request:**

```http
POST /api/v1/stack-categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "QA & Testing",
  "description": "Qualidade e automação de testes"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440006",
    "name": "QA & Testing",
    "description": "Qualidade e automação de testes",
    "created_at": "2024-03-15T12:00:00Z"
  }
}
```

---

### PUT /stack-categories/:id

Update a category.

**Request:**

```http
PUT /api/v1/stack-categories/aa0e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Backend & APIs",
  "description": "Tecnologias server-side e APIs REST/GraphQL"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440001",
    "name": "Backend & APIs",
    "description": "Tecnologias server-side e APIs REST/GraphQL",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### DELETE /stack-categories/:id

Delete a category.

**Request:**

```http
DELETE /api/v1/stack-categories/aa0e8400-e29b-41d4-a716-446655440006
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Stack category deleted successfully"
  }
}
```

**Response (409 Conflict):**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete category with existing stacks",
    "details": {
      "stacks_count": 5
    }
  }
}
```

---

## 4. Stacks

**Table:** `stacks`

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | uuid | auto | Primary key |
| `name` | string | yes | Stack name |
| `category_id` | uuid | yes | FK to stack_categories |
| `created_at` | timestamp | auto | Creation date |

---

### GET /stacks

List all stacks.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `category_id` | uuid | Filter by category |

**Request:**

```http
GET /api/v1/stacks?category_id=aa0e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440001",
      "name": "Node.js",
      "category_id": "aa0e8400-e29b-41d4-a716-446655440001",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "880e8400-e29b-41d4-a716-446655440002",
      "name": "Python",
      "category_id": "aa0e8400-e29b-41d4-a716-446655440001",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "Java",
      "category_id": "aa0e8400-e29b-41d4-a716-446655440001",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "880e8400-e29b-41d4-a716-446655440004",
      "name": ".NET",
      "category_id": "aa0e8400-e29b-41d4-a716-446655440001",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /stacks

Create a stack.

**Request:**

```http
POST /api/v1/stacks
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Go",
  "category_id": "aa0e8400-e29b-41d4-a716-446655440001"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440010",
    "name": "Go",
    "category_id": "aa0e8400-e29b-41d4-a716-446655440001",
    "created_at": "2024-03-15T14:00:00Z"
  }
}
```

---

### PUT /stacks/:id

Update a stack.

**Request:**

```http
PUT /api/v1/stacks/880e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Node.js / TypeScript"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440001",
    "name": "Node.js / TypeScript",
    "category_id": "aa0e8400-e29b-41d4-a716-446655440001",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### DELETE /stacks/:id

Delete a stack.

**Request:**

```http
DELETE /api/v1/stacks/880e8400-e29b-41d4-a716-446655440010
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Stack deleted successfully"
  }
}
```

---

## 5. General Seniorities

**Table:** `general_seniorities`

System-wide seniority levels (e.g., A1-C5).

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | uuid | auto | Primary key |
| `name` | string | yes | Level name (e.g., "A1") |
| `level` | integer | yes | Order (1 = lowest) |
| `description` | string | no | Description |
| `created_at` | timestamp | auto | Creation date |

---

### GET /general-seniorities

List all seniorities ordered by level.

**Request:**

```http
GET /api/v1/general-seniorities
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440001",
      "name": "A1",
      "level": 1,
      "description": "Trainee / Estagiário",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440002",
      "name": "A2",
      "level": 2,
      "description": "Junior I",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440003",
      "name": "B1",
      "level": 3,
      "description": "Pleno I",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440004",
      "name": "B2",
      "level": 4,
      "description": "Pleno II",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440005",
      "name": "C1",
      "level": 5,
      "description": "Senior I",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /general-seniorities

Create a seniority level.

**Request:**

```http
POST /api/v1/general-seniorities
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "C5",
  "level": 10,
  "description": "Principal / Staff Engineer"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "bb0e8400-e29b-41d4-a716-446655440010",
    "name": "C5",
    "level": 10,
    "description": "Principal / Staff Engineer",
    "created_at": "2024-03-15T15:00:00Z"
  }
}
```

---

### PUT /general-seniorities/reorder

Batch reorder seniority levels.

**Request:**

```http
PUT /api/v1/general-seniorities/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    { "id": "bb0e8400-e29b-41d4-a716-446655440001", "level": 1 },
    { "id": "bb0e8400-e29b-41d4-a716-446655440002", "level": 2 },
    { "id": "bb0e8400-e29b-41d4-a716-446655440003", "level": 3 },
    { "id": "bb0e8400-e29b-41d4-a716-446655440004", "level": 4 },
    { "id": "bb0e8400-e29b-41d4-a716-446655440005", "level": 5 }
  ]
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Seniority levels reordered successfully",
    "updated_count": 5
  }
}
```

---

### PUT /general-seniorities/:id

Update a seniority level.

**Request:**

```http
PUT /api/v1/general-seniorities/bb0e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "A1",
  "description": "Trainee / Estagiário (até 1 ano)"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "bb0e8400-e29b-41d4-a716-446655440001",
    "name": "A1",
    "level": 1,
    "description": "Trainee / Estagiário (até 1 ano)",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### DELETE /general-seniorities/:id

Delete a seniority level.

**Request:**

```http
DELETE /api/v1/general-seniorities/bb0e8400-e29b-41d4-a716-446655440010
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "General seniority deleted successfully"
  }
}
```

---

## 6. Seniorities (Per Stack Category)

**Table:** `seniorities`

Category-specific seniority levels.

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | uuid | auto | Primary key |
| `name` | string | yes | Seniority name |
| `level` | integer | yes | Order within category |
| `category_id` | uuid | yes | FK to stack_categories |
| `description` | string | no | Description |
| `created_at` | timestamp | auto | Creation date |

---

### GET /seniorities

List all seniorities.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `category_id` | uuid | Filter by category |

**Request:**

```http
GET /api/v1/seniorities?category_id=aa0e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440001",
      "name": "Junior",
      "level": 1,
      "category_id": "aa0e8400-e29b-41d4-a716-446655440001",
      "description": "0-2 anos de experiência",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "990e8400-e29b-41d4-a716-446655440002",
      "name": "Pleno",
      "level": 2,
      "category_id": "aa0e8400-e29b-41d4-a716-446655440001",
      "description": "2-5 anos de experiência",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "990e8400-e29b-41d4-a716-446655440003",
      "name": "Senior",
      "level": 3,
      "category_id": "aa0e8400-e29b-41d4-a716-446655440001",
      "description": "5+ anos de experiência",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /seniorities

Create a seniority.

**Request:**

```http
POST /api/v1/seniorities
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Especialista",
  "level": 4,
  "category_id": "aa0e8400-e29b-41d4-a716-446655440001",
  "description": "8+ anos, referência técnica"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "name": "Especialista",
    "level": 4,
    "category_id": "aa0e8400-e29b-41d4-a716-446655440001",
    "description": "8+ anos, referência técnica",
    "created_at": "2024-03-15T16:00:00Z"
  }
}
```

---

## 7. Professionals

**Table:** `professionals`

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | uuid | auto | Primary key |
| `name` | string | yes | Full name |
| `email` | string | no | Email address |
| `general_seniority_id` | uuid | no | FK to general_seniorities |
| `status` | enum | yes | Current status |
| `work_mode` | enum | yes | Work mode |
| `leader_id` | uuid | no | FK to professionals (self-ref) |
| `total_years_experience` | integer | no | Total years of experience |
| `created_at` | timestamp | auto | Creation date |

**Related Table:** `professional_stack_experiences`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | uuid | auto | Primary key |
| `professional_id` | uuid | yes | FK to professionals |
| `stack_id` | uuid | yes | FK to stacks |
| `years_experience` | integer | yes | Years in this stack |

### Enums

```typescript
type ProfessionalStatus = 'allocated' | 'idle' | 'partial' | 'vacation' | 'notice';
type ProfessionalWorkMode = 'allocation' | 'factory' | 'both';
```

---

### GET /professionals

List all professionals.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | integer | Page number |
| `per_page` | integer | Items per page |
| `status` | string | Filter by status |
| `work_mode` | string | Filter by work mode |
| `leader_id` | uuid | Filter by leader |
| `stack_id` | uuid | Filter by stack experience |
| `general_seniority_id` | uuid | Filter by seniority |
| `search` | string | Search by name or email |

**Request:**

```http
GET /api/v1/professionals?status=idle&work_mode=allocation
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "cc0e8400-e29b-41d4-a716-446655440001",
      "name": "João Silva",
      "email": "joao.silva@email.com",
      "general_seniority_id": "bb0e8400-e29b-41d4-a716-446655440003",
      "status": "idle",
      "work_mode": "allocation",
      "leader_id": "cc0e8400-e29b-41d4-a716-446655440010",
      "total_years_experience": 5,
      "created_at": "2024-01-10T09:00:00Z",
      "stack_experiences": [
        {
          "stack_id": "880e8400-e29b-41d4-a716-446655440001",
          "stack_name": "Node.js",
          "years_experience": 3
        },
        {
          "stack_id": "880e8400-e29b-41d4-a716-446655440005",
          "stack_name": "React",
          "years_experience": 4
        }
      ]
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "per_page": 20
  }
}
```

---

### GET /professionals/:id

Get professional by ID.

**Request:**

```http
GET /api/v1/professionals/cc0e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "cc0e8400-e29b-41d4-a716-446655440001",
    "name": "João Silva",
    "email": "joao.silva@email.com",
    "general_seniority_id": "bb0e8400-e29b-41d4-a716-446655440003",
    "status": "allocated",
    "work_mode": "allocation",
    "leader_id": "cc0e8400-e29b-41d4-a716-446655440010",
    "total_years_experience": 5,
    "created_at": "2024-01-10T09:00:00Z",
    "stack_experiences": [
      {
        "stack_id": "880e8400-e29b-41d4-a716-446655440001",
        "stack_name": "Node.js",
        "years_experience": 3
      },
      {
        "stack_id": "880e8400-e29b-41d4-a716-446655440005",
        "stack_name": "React",
        "years_experience": 4
      }
    ]
  }
}
```

---

### GET /professionals/:id/details

Get professional with full details including allocations.

**Request:**

```http
GET /api/v1/professionals/cc0e8400-e29b-41d4-a716-446655440001/details
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "cc0e8400-e29b-41d4-a716-446655440001",
    "name": "João Silva",
    "email": "joao.silva@email.com",
    "general_seniority_id": "bb0e8400-e29b-41d4-a716-446655440003",
    "general_seniority": {
      "id": "bb0e8400-e29b-41d4-a716-446655440003",
      "name": "B1",
      "level": 3,
      "description": "Pleno I"
    },
    "status": "allocated",
    "work_mode": "allocation",
    "leader_id": "cc0e8400-e29b-41d4-a716-446655440010",
    "leader": {
      "id": "cc0e8400-e29b-41d4-a716-446655440010",
      "name": "Maria Santos"
    },
    "total_years_experience": 5,
    "created_at": "2024-01-10T09:00:00Z",
    "stack_experiences": [
      {
        "stack_id": "880e8400-e29b-41d4-a716-446655440001",
        "stack_name": "Node.js",
        "category_name": "Backend",
        "years_experience": 3
      }
    ],
    "current_allocation": {
      "total_percentage": 100,
      "staffing_allocations": [
        {
          "id": "dd0e8400-e29b-41d4-a716-446655440001",
          "position_id": "770e8400-e29b-41d4-a716-446655440001",
          "position_title": "Desenvolvedor Full Stack Senior",
          "client_name": "TechCorp Brasil",
          "project_name": "Sistema de Gestão",
          "start_date": "2024-01-15",
          "end_date": "2024-12-31",
          "allocation_percentage": 100
        }
      ],
      "factory_allocations": []
    },
    "allocation_history": [
      {
        "id": "dd0e8400-e29b-41d4-a716-446655440000",
        "type": "staffing",
        "client_name": "Outro Cliente",
        "project_name": "Projeto Antigo",
        "start_date": "2023-06-01",
        "end_date": "2024-01-10",
        "allocation_percentage": 100
      }
    ]
  }
}
```

---

### GET /professionals/available

Get professionals available for allocation.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `min_availability` | integer | Minimum % available (default: 1) |
| `stack_id` | uuid | Filter by stack |
| `work_mode` | string | Filter by work mode |

**Request:**

```http
GET /api/v1/professionals/available?min_availability=50&stack_id=880e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "cc0e8400-e29b-41d4-a716-446655440005",
      "name": "Pedro Almeida",
      "status": "partial",
      "current_allocation_percentage": 50,
      "available_percentage": 50,
      "stack_experiences": [
        {
          "stack_id": "880e8400-e29b-41d4-a716-446655440001",
          "stack_name": "Node.js",
          "years_experience": 4
        }
      ],
      "general_seniority": {
        "name": "B2",
        "level": 4
      }
    },
    {
      "id": "cc0e8400-e29b-41d4-a716-446655440006",
      "name": "Ana Costa",
      "status": "idle",
      "current_allocation_percentage": 0,
      "available_percentage": 100,
      "stack_experiences": [
        {
          "stack_id": "880e8400-e29b-41d4-a716-446655440001",
          "stack_name": "Node.js",
          "years_experience": 2
        }
      ],
      "general_seniority": {
        "name": "A2",
        "level": 2
      }
    }
  ]
}
```

---

### POST /professionals

Create a professional.

**Request:**

```http
POST /api/v1/professionals
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Carlos Mendes",
  "email": "carlos.mendes@email.com",
  "general_seniority_id": "bb0e8400-e29b-41d4-a716-446655440002",
  "status": "idle",
  "work_mode": "both",
  "leader_id": "cc0e8400-e29b-41d4-a716-446655440010",
  "total_years_experience": 3,
  "stack_experiences": [
    {
      "stack_id": "880e8400-e29b-41d4-a716-446655440002",
      "years_experience": 2
    },
    {
      "stack_id": "880e8400-e29b-41d4-a716-446655440005",
      "years_experience": 3
    }
  ]
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "cc0e8400-e29b-41d4-a716-446655440020",
    "name": "Carlos Mendes",
    "email": "carlos.mendes@email.com",
    "general_seniority_id": "bb0e8400-e29b-41d4-a716-446655440002",
    "status": "idle",
    "work_mode": "both",
    "leader_id": "cc0e8400-e29b-41d4-a716-446655440010",
    "total_years_experience": 3,
    "created_at": "2024-03-15T17:00:00Z",
    "stack_experiences": [
      {
        "stack_id": "880e8400-e29b-41d4-a716-446655440002",
        "stack_name": "Python",
        "years_experience": 2
      },
      {
        "stack_id": "880e8400-e29b-41d4-a716-446655440005",
        "stack_name": "React",
        "years_experience": 3
      }
    ]
  }
}
```

---

### PUT /professionals/:id

Update a professional.

**Request:**

```http
PUT /api/v1/professionals/cc0e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
Content-Type: application/json

{
  "general_seniority_id": "bb0e8400-e29b-41d4-a716-446655440004",
  "status": "vacation",
  "stack_experiences": [
    {
      "stack_id": "880e8400-e29b-41d4-a716-446655440001",
      "years_experience": 4
    },
    {
      "stack_id": "880e8400-e29b-41d4-a716-446655440005",
      "years_experience": 5
    }
  ]
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "cc0e8400-e29b-41d4-a716-446655440001",
    "name": "João Silva",
    "email": "joao.silva@email.com",
    "general_seniority_id": "bb0e8400-e29b-41d4-a716-446655440004",
    "status": "vacation",
    "work_mode": "allocation",
    "leader_id": "cc0e8400-e29b-41d4-a716-446655440010",
    "total_years_experience": 5,
    "created_at": "2024-01-10T09:00:00Z",
    "stack_experiences": [
      {
        "stack_id": "880e8400-e29b-41d4-a716-446655440001",
        "stack_name": "Node.js",
        "years_experience": 4
      },
      {
        "stack_id": "880e8400-e29b-41d4-a716-446655440005",
        "stack_name": "React",
        "years_experience": 5
      }
    ]
  }
}
```

---

### DELETE /professionals/:id

Delete a professional.

**Request:**

```http
DELETE /api/v1/professionals/cc0e8400-e29b-41d4-a716-446655440020
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Professional deleted successfully"
  }
}
```

**Response (409 Conflict):**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete professional with active allocations",
    "details": {
      "active_allocations": 2
    }
  }
}
```

---

## 8. Positions (Vacancies)

**Table:** `positions`

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | uuid | auto | Primary key |
| `contract_id` | uuid | yes | FK to contracts |
| `title` | string | yes | Position title |
| `stack_id` | uuid | yes | FK to stacks |
| `seniority_id` | uuid | no | FK to seniorities |
| `status` | enum | yes | 'open' or 'filled' |
| `start_date` | date | yes | Position start |
| `end_date` | date | yes | Position end |
| `allocation_percentage` | integer | yes | Required % (1-100) |
| `created_at` | timestamp | auto | Creation date |

### Enums

```typescript
type PositionStatus = 'open' | 'filled';
```

---

### GET /positions

List all positions.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `contract_id` | uuid | Filter by contract |
| `status` | string | Filter by status |
| `stack_id` | uuid | Filter by stack |

**Request:**

```http
GET /api/v1/positions?status=open
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "contract_id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "Desenvolvedor Full Stack Senior",
      "stack_id": "880e8400-e29b-41d4-a716-446655440001",
      "seniority_id": "990e8400-e29b-41d4-a716-446655440003",
      "status": "open",
      "start_date": "2024-04-01",
      "end_date": "2024-12-31",
      "allocation_percentage": 100,
      "created_at": "2024-03-01T10:00:00Z"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "per_page": 20
  }
}
```

---

### GET /positions/:id

Get position by ID with details.

**Request:**

```http
GET /api/v1/positions/770e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440001",
    "contract_id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Desenvolvedor Full Stack Senior",
    "stack_id": "880e8400-e29b-41d4-a716-446655440001",
    "seniority_id": "990e8400-e29b-41d4-a716-446655440003",
    "status": "filled",
    "start_date": "2024-01-15",
    "end_date": "2024-12-31",
    "allocation_percentage": 100,
    "created_at": "2024-01-05T08:00:00Z",
    "contract": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "contract_number": "CTR-2024-001",
      "project_name": "Sistema de Gestão"
    },
    "client": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "TechCorp Brasil"
    },
    "stack": {
      "id": "880e8400-e29b-41d4-a716-446655440001",
      "name": "Node.js",
      "category_name": "Backend"
    },
    "seniority": {
      "id": "990e8400-e29b-41d4-a716-446655440003",
      "name": "Senior"
    },
    "current_allocation": {
      "id": "dd0e8400-e29b-41d4-a716-446655440001",
      "professional_id": "cc0e8400-e29b-41d4-a716-446655440001",
      "professional_name": "João Silva",
      "start_date": "2024-01-15",
      "end_date": "2024-12-31",
      "allocation_percentage": 100
    }
  }
}
```

---

### POST /positions

Create a position.

**Request:**

```http
POST /api/v1/positions
Authorization: Bearer <token>
Content-Type: application/json

{
  "contract_id": "660e8400-e29b-41d4-a716-446655440001",
  "title": "DevOps Engineer",
  "stack_id": "880e8400-e29b-41d4-a716-446655440006",
  "seniority_id": "990e8400-e29b-41d4-a716-446655440002",
  "start_date": "2024-05-01",
  "end_date": "2024-12-31",
  "allocation_percentage": 50
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440020",
    "contract_id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "DevOps Engineer",
    "stack_id": "880e8400-e29b-41d4-a716-446655440006",
    "seniority_id": "990e8400-e29b-41d4-a716-446655440002",
    "status": "open",
    "start_date": "2024-05-01",
    "end_date": "2024-12-31",
    "allocation_percentage": 50,
    "created_at": "2024-03-15T18:00:00Z"
  }
}
```

---

### PUT /positions/:id

Update a position.

**Request:**

```http
PUT /api/v1/positions/770e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Senior Full Stack Developer",
  "allocation_percentage": 80
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440001",
    "contract_id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Senior Full Stack Developer",
    "stack_id": "880e8400-e29b-41d4-a716-446655440001",
    "seniority_id": "990e8400-e29b-41d4-a716-446655440003",
    "status": "filled",
    "start_date": "2024-01-15",
    "end_date": "2024-12-31",
    "allocation_percentage": 80,
    "created_at": "2024-01-05T08:00:00Z"
  }
}
```

---

### DELETE /positions/:id

Delete a position.

**Request:**

```http
DELETE /api/v1/positions/770e8400-e29b-41d4-a716-446655440020
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Position deleted successfully",
    "deleted_allocations": 0
  }
}
```

---

## 9. Allocations (Staffing)

**Table:** `allocations`

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | uuid | auto | Primary key |
| `professional_id` | uuid | yes | FK to professionals |
| `position_id` | uuid | yes | FK to positions |
| `start_date` | date | yes | Allocation start |
| `end_date` | date | no | Allocation end |
| `allocation_percentage` | integer | yes | Allocation % |
| `created_at` | timestamp | auto | Creation date |

---

### GET /allocations

List all allocations.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `professional_id` | uuid | Filter by professional |
| `position_id` | uuid | Filter by position |
| `active` | boolean | Filter active only |

**Request:**

```http
GET /api/v1/allocations?active=true
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "dd0e8400-e29b-41d4-a716-446655440001",
      "professional_id": "cc0e8400-e29b-41d4-a716-446655440001",
      "position_id": "770e8400-e29b-41d4-a716-446655440001",
      "start_date": "2024-01-15",
      "end_date": "2024-12-31",
      "allocation_percentage": 100,
      "created_at": "2024-01-15T09:00:00Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "per_page": 20
  }
}
```

---

### POST /allocations

Create an allocation (assign professional to position).

**Request:**

```http
POST /api/v1/allocations
Authorization: Bearer <token>
Content-Type: application/json

{
  "professional_id": "cc0e8400-e29b-41d4-a716-446655440005",
  "position_id": "770e8400-e29b-41d4-a716-446655440002",
  "start_date": "2024-04-01",
  "end_date": "2024-12-31",
  "allocation_percentage": 100
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "dd0e8400-e29b-41d4-a716-446655440010",
    "professional_id": "cc0e8400-e29b-41d4-a716-446655440005",
    "position_id": "770e8400-e29b-41d4-a716-446655440002",
    "start_date": "2024-04-01",
    "end_date": "2024-12-31",
    "allocation_percentage": 100,
    "created_at": "2024-03-15T19:00:00Z"
  },
  "side_effects": {
    "position_status_updated": "filled",
    "professional_status_updated": "allocated"
  }
}
```

**Response (422 Validation Error - Conflict):**

```json
{
  "success": false,
  "error": {
    "code": "ALLOCATION_CONFLICT",
    "message": "Allocation would exceed 100% capacity",
    "details": {
      "professional_id": "cc0e8400-e29b-41d4-a716-446655440005",
      "current_allocation": 50,
      "requested_allocation": 100,
      "total_would_be": 150,
      "conflicting_allocations": [
        {
          "id": "dd0e8400-e29b-41d4-a716-446655440005",
          "position_title": "Backend Developer",
          "client_name": "Outro Cliente",
          "allocation_percentage": 50,
          "period": "2024-03-01 to 2024-09-30"
        }
      ]
    }
  }
}
```

---

### POST /allocations (with override)

Force allocation with conflict override.

**Request:**

```http
POST /api/v1/allocations
Authorization: Bearer <token>
Content-Type: application/json

{
  "professional_id": "cc0e8400-e29b-41d4-a716-446655440005",
  "position_id": "770e8400-e29b-41d4-a716-446655440002",
  "start_date": "2024-04-01",
  "end_date": "2024-12-31",
  "allocation_percentage": 100,
  "override_conflict": true,
  "override_justification": "Demanda urgente do cliente, profissional trabalhará horas extras"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "dd0e8400-e29b-41d4-a716-446655440010",
    "professional_id": "cc0e8400-e29b-41d4-a716-446655440005",
    "position_id": "770e8400-e29b-41d4-a716-446655440002",
    "start_date": "2024-04-01",
    "end_date": "2024-12-31",
    "allocation_percentage": 100,
    "created_at": "2024-03-15T19:00:00Z"
  },
  "warning": {
    "message": "Allocation created with override. Total allocation is 150%",
    "override_logged": true
  }
}
```

---

### PUT /allocations/:id

Update an allocation.

**Request:**

```http
PUT /api/v1/allocations/dd0e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
Content-Type: application/json

{
  "end_date": "2024-06-30",
  "allocation_percentage": 80
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "dd0e8400-e29b-41d4-a716-446655440001",
    "professional_id": "cc0e8400-e29b-41d4-a716-446655440001",
    "position_id": "770e8400-e29b-41d4-a716-446655440001",
    "start_date": "2024-01-15",
    "end_date": "2024-06-30",
    "allocation_percentage": 80,
    "created_at": "2024-01-15T09:00:00Z"
  },
  "side_effects": {
    "professional_status_updated": "partial"
  }
}
```

---

### DELETE /allocations/:id

Delete an allocation (unassign professional).

**Request:**

```http
DELETE /api/v1/allocations/dd0e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Allocation deleted successfully"
  },
  "side_effects": {
    "position_status_updated": "open",
    "professional_status_updated": "idle"
  }
}
```

---

## 10. Factory Projects

**Table:** `factory_projects`

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | uuid | auto | Primary key |
| `name` | string | yes | Project name |
| `client_id` | uuid | no | FK to clients |
| `description` | string | yes | Description |
| `start_date` | date | yes | Project start |
| `end_date` | date | yes | Project end |
| `status` | enum | yes | Project status |
| `progress_percentage` | integer | yes | Progress (0-100) |
| `created_at` | timestamp | auto | Creation date |

### Enums

```typescript
type FactoryProjectStatus = 'planned' | 'in_progress' | 'finished' | 'paused';
```

---

### GET /factory-projects

List all factory projects.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by status |
| `client_id` | uuid | Filter by client |

**Request:**

```http
GET /api/v1/factory-projects?status=in_progress
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "ee0e8400-e29b-41d4-a716-446655440001",
      "name": "App Mobile Financeiro",
      "client_id": "550e8400-e29b-41d4-a716-446655440002",
      "description": "Desenvolvimento de aplicativo mobile para gestão financeira",
      "start_date": "2024-02-01",
      "end_date": "2024-08-31",
      "status": "in_progress",
      "progress_percentage": 45,
      "created_at": "2024-01-20T10:00:00Z"
    }
  ],
  "meta": {
    "total": 8,
    "page": 1,
    "per_page": 20
  }
}
```

---

### GET /factory-projects/:id/details

Get project with full details.

**Request:**

```http
GET /api/v1/factory-projects/ee0e8400-e29b-41d4-a716-446655440001/details
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "ee0e8400-e29b-41d4-a716-446655440001",
    "name": "App Mobile Financeiro",
    "client_id": "550e8400-e29b-41d4-a716-446655440002",
    "description": "Desenvolvimento de aplicativo mobile para gestão financeira",
    "start_date": "2024-02-01",
    "end_date": "2024-08-31",
    "status": "in_progress",
    "progress_percentage": 45,
    "created_at": "2024-01-20T10:00:00Z",
    "client": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "FinTech Solutions"
    },
    "days_remaining": 120,
    "days_elapsed": 90,
    "total_days": 210,
    "calculated_progress": 43,
    "total_members": 5,
    "allocations": [
      {
        "id": "ff0e8400-e29b-41d4-a716-446655440001",
        "professional_id": "cc0e8400-e29b-41d4-a716-446655440002",
        "professional_name": "Maria Santos",
        "role": "tech_lead",
        "stack_id": "880e8400-e29b-41d4-a716-446655440003",
        "stack_name": "React Native",
        "start_date": "2024-02-01",
        "end_date": "2024-08-31",
        "allocation_percentage": 100
      },
      {
        "id": "ff0e8400-e29b-41d4-a716-446655440002",
        "professional_id": "cc0e8400-e29b-41d4-a716-446655440003",
        "professional_name": "Lucas Oliveira",
        "role": "dev",
        "stack_id": "880e8400-e29b-41d4-a716-446655440003",
        "stack_name": "React Native",
        "start_date": "2024-02-15",
        "end_date": "2024-08-31",
        "allocation_percentage": 100
      }
    ]
  }
}
```

---

### POST /factory-projects

Create a factory project.

**Request:**

```http
POST /api/v1/factory-projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sistema ERP",
  "client_id": "550e8400-e29b-41d4-a716-446655440003",
  "description": "Desenvolvimento de sistema ERP completo",
  "start_date": "2024-05-01",
  "end_date": "2025-04-30",
  "status": "planned",
  "progress_percentage": 0
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "ee0e8400-e29b-41d4-a716-446655440010",
    "name": "Sistema ERP",
    "client_id": "550e8400-e29b-41d4-a716-446655440003",
    "description": "Desenvolvimento de sistema ERP completo",
    "start_date": "2024-05-01",
    "end_date": "2025-04-30",
    "status": "planned",
    "progress_percentage": 0,
    "created_at": "2024-03-15T20:00:00Z"
  }
}
```

---

### PUT /factory-projects/:id

Update a factory project.

**Request:**

```http
PUT /api/v1/factory-projects/ee0e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress",
  "progress_percentage": 50
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "ee0e8400-e29b-41d4-a716-446655440001",
    "name": "App Mobile Financeiro",
    "client_id": "550e8400-e29b-41d4-a716-446655440002",
    "description": "Desenvolvimento de aplicativo mobile para gestão financeira",
    "start_date": "2024-02-01",
    "end_date": "2024-08-31",
    "status": "in_progress",
    "progress_percentage": 50,
    "created_at": "2024-01-20T10:00:00Z"
  }
}
```

---

### DELETE /factory-projects/:id

Delete a factory project.

**Request:**

```http
DELETE /api/v1/factory-projects/ee0e8400-e29b-41d4-a716-446655440010
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Factory project deleted successfully",
    "deleted_allocations": 0
  }
}
```

---

## 11. Factory Allocations

**Table:** `factory_allocations`

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | uuid | auto | Primary key |
| `project_id` | uuid | yes | FK to factory_projects |
| `professional_id` | uuid | yes | FK to professionals |
| `role` | enum | yes | Role in project |
| `stack_id` | uuid | yes | FK to stacks |
| `start_date` | date | yes | Allocation start |
| `end_date` | date | yes | Allocation end |
| `allocation_percentage` | integer | yes | Allocation % |
| `created_at` | timestamp | auto | Creation date |

### Enums

```typescript
type FactoryRole = 'dev' | 'qa' | 'po' | 'pm' | 'tech_lead' | 'architect' | 'scrum_master' | 'ux' | 'other';
```

---

### GET /factory-allocations

List all factory allocations.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `project_id` | uuid | Filter by project |
| `professional_id` | uuid | Filter by professional |

**Request:**

```http
GET /api/v1/factory-allocations?project_id=ee0e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "ff0e8400-e29b-41d4-a716-446655440001",
      "project_id": "ee0e8400-e29b-41d4-a716-446655440001",
      "professional_id": "cc0e8400-e29b-41d4-a716-446655440002",
      "role": "tech_lead",
      "stack_id": "880e8400-e29b-41d4-a716-446655440003",
      "start_date": "2024-02-01",
      "end_date": "2024-08-31",
      "allocation_percentage": 100,
      "created_at": "2024-01-25T10:00:00Z"
    }
  ]
}
```

---

### POST /factory-allocations

Create a factory allocation.

**Request:**

```http
POST /api/v1/factory-allocations
Authorization: Bearer <token>
Content-Type: application/json

{
  "project_id": "ee0e8400-e29b-41d4-a716-446655440001",
  "professional_id": "cc0e8400-e29b-41d4-a716-446655440004",
  "role": "qa",
  "stack_id": "880e8400-e29b-41d4-a716-446655440007",
  "start_date": "2024-04-01",
  "end_date": "2024-08-31",
  "allocation_percentage": 50
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "ff0e8400-e29b-41d4-a716-446655440010",
    "project_id": "ee0e8400-e29b-41d4-a716-446655440001",
    "professional_id": "cc0e8400-e29b-41d4-a716-446655440004",
    "role": "qa",
    "stack_id": "880e8400-e29b-41d4-a716-446655440007",
    "start_date": "2024-04-01",
    "end_date": "2024-08-31",
    "allocation_percentage": 50,
    "created_at": "2024-03-15T21:00:00Z"
  },
  "side_effects": {
    "professional_status_updated": "partial"
  }
}
```

---

### PUT /factory-allocations/:id

Update a factory allocation.

**Request:**

```http
PUT /api/v1/factory-allocations/ff0e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "architect",
  "allocation_percentage": 80
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "ff0e8400-e29b-41d4-a716-446655440001",
    "project_id": "ee0e8400-e29b-41d4-a716-446655440001",
    "professional_id": "cc0e8400-e29b-41d4-a716-446655440002",
    "role": "architect",
    "stack_id": "880e8400-e29b-41d4-a716-446655440003",
    "start_date": "2024-02-01",
    "end_date": "2024-08-31",
    "allocation_percentage": 80,
    "created_at": "2024-01-25T10:00:00Z"
  }
}
```

---

### DELETE /factory-allocations/:id

Delete a factory allocation.

**Request:**

```http
DELETE /api/v1/factory-allocations/ff0e8400-e29b-41d4-a716-446655440010
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Factory allocation deleted successfully"
  },
  "side_effects": {
    "professional_status_updated": "idle"
  }
}
```

---

## 12. Dashboard Endpoints

### GET /dashboard/metrics

Get aggregated dashboard metrics.

**Request:**

```http
GET /api/v1/dashboard/metrics
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total_contracts": 45,
    "active_contracts": 38,
    "total_clients": 22,
    "total_professionals": 85,
    "total_positions": 120,
    "filled_positions": 98,
    "open_positions": 22,
    "monthly_revenue": 850000.00,
    "revenue_at_risk_30": 75000.00,
    "revenue_at_risk_60": 150000.00,
    "revenue_at_risk_90": 225000.00
  }
}
```

---

### GET /dashboard/occupancy-forecast

Get occupancy forecast for a period.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `period` | integer | yes | 30, 60, or 90 days |

**Request:**

```http
GET /api/v1/dashboard/occupancy-forecast?period=30
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "period": 30,
    "current_allocated": 72,
    "predicted_idle": 8,
    "occupancy_rate": 88.2,
    "idle_professionals": [
      {
        "professional_id": "cc0e8400-e29b-41d4-a716-446655440001",
        "professional_name": "João Silva",
        "stack_name": "Node.js",
        "current_client_name": "TechCorp Brasil",
        "current_project_name": "Sistema de Gestão",
        "allocation_end_date": "2024-04-15",
        "days_until_idle": 25
      },
      {
        "professional_id": "cc0e8400-e29b-41d4-a716-446655440005",
        "professional_name": "Pedro Almeida",
        "stack_name": "React",
        "current_client_name": "FinTech Solutions",
        "current_project_name": "Portal Web",
        "allocation_end_date": "2024-04-10",
        "days_until_idle": 20
      }
    ]
  }
}
```

---

### GET /dashboard/expiring-contracts

Get expiring contracts summary.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `days` | integer | yes | 30, 60, or 90 days |

**Request:**

```http
GET /api/v1/dashboard/expiring-contracts?days=60
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "days": 60,
    "contracts": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440005",
        "contract_number": "CTR-2024-005",
        "project_name": "Projeto Alpha",
        "type": "staffing",
        "client": {
          "id": "550e8400-e29b-41d4-a716-446655440003",
          "name": "Cliente ABC"
        },
        "end_date": "2024-05-15",
        "days_until_expiration": 45,
        "monthly_value": 40000.00,
        "positions_count": 4,
        "filled_positions": 3
      }
    ],
    "summary": {
      "total_contracts": 5,
      "clients_affected": 4,
      "professionals_involved": 12,
      "total_monthly_value": 180000.00
    }
  }
}
```

---

### GET /dashboard/stack-distributions

Get professionals and positions distribution by stack.

**Request:**

```http
GET /api/v1/dashboard/stack-distributions
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "stack_id": "880e8400-e29b-41d4-a716-446655440001",
      "stack_name": "Node.js",
      "category_id": "aa0e8400-e29b-41d4-a716-446655440001",
      "category_name": "Backend",
      "professional_count": 15,
      "position_count": 18,
      "filled_positions": 14
    },
    {
      "stack_id": "880e8400-e29b-41d4-a716-446655440005",
      "stack_name": "React",
      "category_id": "aa0e8400-e29b-41d4-a716-446655440002",
      "category_name": "Frontend",
      "professional_count": 20,
      "position_count": 25,
      "filled_positions": 22
    }
  ]
}
```

---

### GET /dashboard/client-summaries

Get summary for each client.

**Request:**

```http
GET /api/v1/dashboard/client-summaries
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "client": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "TechCorp Brasil",
        "cnpj": "12.345.678/0001-90",
        "contact": "contato@techcorp.com.br"
      },
      "active_contracts": 3,
      "total_positions": 12,
      "filled_positions": 10,
      "total_monthly_value": 150000.00
    }
  ]
}
```

---

### GET /dashboard/leader-metrics

Get metrics grouped by leader.

**Request:**

```http
GET /api/v1/dashboard/leader-metrics
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "leader_id": "cc0e8400-e29b-41d4-a716-446655440010",
      "leader_name": "Maria Santos",
      "total_professionals": 8,
      "allocated_professionals": 6,
      "idle_professionals": 2,
      "professionals": [
        {
          "id": "cc0e8400-e29b-41d4-a716-446655440001",
          "name": "João Silva",
          "status": "allocated"
        },
        {
          "id": "cc0e8400-e29b-41d4-a716-446655440005",
          "name": "Pedro Almeida",
          "status": "idle"
        }
      ]
    }
  ]
}
```

---

### GET /dashboard/allocation-timeline

Get allocation timeline for Gantt visualization.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `start_date` | date | Filter start date |
| `end_date` | date | Filter end date |
| `professional_id` | uuid | Filter by professional |
| `client_id` | uuid | Filter by client |

**Request:**

```http
GET /api/v1/dashboard/allocation-timeline?start_date=2024-01-01&end_date=2024-12-31
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "dd0e8400-e29b-41d4-a716-446655440001",
      "professional_id": "cc0e8400-e29b-41d4-a716-446655440001",
      "professional_name": "João Silva",
      "position_title": "Desenvolvedor Full Stack Senior",
      "stack_name": "Node.js",
      "category_name": "Backend",
      "client_name": "TechCorp Brasil",
      "project_name": "Sistema de Gestão",
      "contract_type": "staffing",
      "start_date": "2024-01-15",
      "end_date": "2024-12-31",
      "allocation_percentage": 100
    }
  ]
}
```

---

### GET /teams

Get team views organized by contract.

**Request:**

```http
GET /api/v1/teams
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "contract_id": "660e8400-e29b-41d4-a716-446655440001",
      "contract_number": "CTR-2024-001",
      "project_name": "Sistema de Gestão",
      "client_name": "TechCorp Brasil",
      "contract_type": "staffing",
      "start_date": "2024-01-01",
      "end_date": "2024-12-31",
      "status": "active",
      "days_until_expiration": 180,
      "total_positions": 5,
      "filled_positions": 4,
      "members": [
        {
          "professional_id": "cc0e8400-e29b-41d4-a716-446655440001",
          "professional_name": "João Silva",
          "position_title": "Desenvolvedor Full Stack Senior",
          "stack_name": "Node.js",
          "category_name": "Backend",
          "start_date": "2024-01-15",
          "end_date": "2024-12-31",
          "allocation_percentage": 100
        }
      ]
    }
  ]
}
```

---

## 13. Factory Dashboard Endpoints

### GET /factory/metrics

Get factory dashboard metrics.

**Request:**

```http
GET /api/v1/factory/metrics
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total_projects": 12,
    "active_projects": 5,
    "planned_projects": 3,
    "finished_projects": 3,
    "paused_projects": 1,
    "total_factory_professionals": 35,
    "current_occupancy_rate": 82.5,
    "occupancy_30_days": 78.0,
    "occupancy_60_days": 72.5,
    "occupancy_90_days": 68.0
  }
}
```

---

### GET /factory/idle-forecast

Get factory idle forecast.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `period` | integer | yes | 30, 60, or 90 days |

**Request:**

```http
GET /api/v1/factory/idle-forecast?period=30
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "period": 30,
    "current_allocated": 28,
    "predicted_idle": 5,
    "occupancy_rate": 82.1,
    "idle_professionals": [
      {
        "professional_id": "cc0e8400-e29b-41d4-a716-446655440002",
        "professional_name": "Maria Santos",
        "stack_name": "React Native",
        "current_project_name": "App Mobile Financeiro",
        "allocation_end_date": "2024-04-20",
        "days_until_idle": 28
      }
    ]
  }
}
```

---

### GET /factory/gantt

Get factory Gantt data.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `start_date` | date | Filter start date |
| `end_date` | date | Filter end date |
| `status` | string | Filter by project status |

**Request:**

```http
GET /api/v1/factory/gantt?status=in_progress
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "ee0e8400-e29b-41d4-a716-446655440001",
      "type": "project",
      "name": "App Mobile Financeiro",
      "project_id": null,
      "project_name": null,
      "role": null,
      "stack_name": null,
      "start_date": "2024-02-01",
      "end_date": "2024-08-31",
      "progress": 45,
      "status": "in_progress"
    },
    {
      "id": "ff0e8400-e29b-41d4-a716-446655440001",
      "type": "professional",
      "name": "Maria Santos",
      "project_id": "ee0e8400-e29b-41d4-a716-446655440001",
      "project_name": "App Mobile Financeiro",
      "role": "tech_lead",
      "stack_name": "React Native",
      "start_date": "2024-02-01",
      "end_date": "2024-08-31",
      "progress": null,
      "status": null
    }
  ]
}
```

---

## Field Mapping: Frontend (camelCase) → Backend (snake_case)

| Frontend | Backend |
|----------|---------|
| `id` | `id` |
| `clientId` | `client_id` |
| `contractId` | `contract_id` |
| `contractNumber` | `contract_number` |
| `projectName` | `project_name` |
| `startDate` | `start_date` |
| `endDate` | `end_date` |
| `monthlyValue` | `monthly_value` |
| `createdAt` | `created_at` |
| `stackId` | `stack_id` |
| `categoryId` | `category_id` |
| `seniorityId` | `seniority_id` |
| `generalSeniorityId` | `general_seniority_id` |
| `positionId` | `position_id` |
| `professionalId` | `professional_id` |
| `leaderId` | `leader_id` |
| `allocationPercentage` | `allocation_percentage` |
| `workMode` | `work_mode` |
| `totalYearsExperience` | `total_years_experience` |
| `yearsExperience` | `years_experience` |
| `stackExperiences` | `stack_experiences` |
| `progressPercentage` | `progress_percentage` |
| `daysUntilExpiration` | `days_until_expiration` |
| `daysUntilIdle` | `days_until_idle` |
| `daysRemaining` | `days_remaining` |
| `daysElapsed` | `days_elapsed` |
| `totalDays` | `total_days` |
| `calculatedProgress` | `calculated_progress` |
| `currentAllocated` | `current_allocated` |
| `predictedIdle` | `predicted_idle` |
| `occupancyRate` | `occupancy_rate` |

---

## Error Codes Reference

| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Invalid request body |
| `CONFLICT` | 409 | Resource conflict (duplicate, dependencies) |
| `ALLOCATION_CONFLICT` | 422 | Allocation would exceed 100% |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Business Rules

### Professional Status Derivation

The `status` field is automatically calculated based on active allocations:

```
if total_allocation >= 100%: status = 'allocated'
else if total_allocation > 0%: status = 'partial'
else: status = 'idle'
```

Exception: `vacation` and `notice` statuses can be set manually and take precedence.

### Allocation Conflict Validation

When creating an allocation, validate:

```
current_allocations = sum of active allocation percentages for professional
if (current_allocations + new_allocation > 100):
  if override_conflict is true:
    create allocation with warning
    log override with justification
  else:
    return ALLOCATION_CONFLICT error with details
```

### Position Status Sync

- When allocation is created → position.status = 'filled'
- When allocation is deleted → position.status = 'open'

### Cascade Deletes

- Delete Client → Error if has contracts
- Delete Contract → Delete associated positions and allocations
- Delete Position → Delete associated allocations
- Delete Professional → Error if has active allocations
- Delete Stack Category → Error if has stacks
- Delete Stack → Error if has positions or professional experiences

---

## Suggested Database Indexes

```sql
-- Clients
CREATE INDEX idx_clients_name ON clients(name);

-- Contracts
CREATE INDEX idx_contracts_client_id ON contracts(client_id);
CREATE INDEX idx_contracts_end_date ON contracts(end_date);
CREATE INDEX idx_contracts_type ON contracts(type);

-- Positions
CREATE INDEX idx_positions_contract_id ON positions(contract_id);
CREATE INDEX idx_positions_status ON positions(status);
CREATE INDEX idx_positions_stack_id ON positions(stack_id);

-- Professionals
CREATE INDEX idx_professionals_leader_id ON professionals(leader_id);
CREATE INDEX idx_professionals_status ON professionals(status);
CREATE INDEX idx_professionals_work_mode ON professionals(work_mode);
CREATE INDEX idx_professionals_general_seniority_id ON professionals(general_seniority_id);

-- Professional Stack Experiences
CREATE INDEX idx_prof_stack_exp_professional_id ON professional_stack_experiences(professional_id);
CREATE INDEX idx_prof_stack_exp_stack_id ON professional_stack_experiences(stack_id);

-- Allocations
CREATE INDEX idx_allocations_professional_id ON allocations(professional_id);
CREATE INDEX idx_allocations_position_id ON allocations(position_id);
CREATE INDEX idx_allocations_end_date ON allocations(end_date);

-- Factory Projects
CREATE INDEX idx_factory_projects_client_id ON factory_projects(client_id);
CREATE INDEX idx_factory_projects_status ON factory_projects(status);

-- Factory Allocations
CREATE INDEX idx_factory_alloc_project_id ON factory_allocations(project_id);
CREATE INDEX idx_factory_alloc_professional_id ON factory_allocations(professional_id);
CREATE INDEX idx_factory_alloc_end_date ON factory_allocations(end_date);

-- Stacks
CREATE INDEX idx_stacks_category_id ON stacks(category_id);

-- Seniorities
CREATE INDEX idx_seniorities_category_id ON seniorities(category_id);

-- General Seniorities
CREATE INDEX idx_general_seniorities_level ON general_seniorities(level);
```
