# Talent Allocation Hub - API Specification

## Overview

Complete API specification for the Talent Allocation Hub backend, with all fields in **camelCase** format.

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
    "perPage": 20
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
    "details": [
      { "field": "email", "reason": "Invalid email format" }
    ]
  }
}
```

---

## Enums

### ContractType
```typescript
type ContractType = "staffing" | "fabrica";
```

### ContractStatus (computed)
```typescript
type ContractStatus = "active" | "expiring30" | "expiring60" | "expiring90" | "expired";
```

### PositionStatus
```typescript
type PositionStatus = "open" | "filled";
```

### ProfessionalStatus (computed from allocations)
```typescript
type ProfessionalStatus = "allocated" | "idle" | "partial" | "vacation" | "notice";
```

### ProfessionalWorkMode
```typescript
type ProfessionalWorkMode = "allocation" | "factory" | "both";
```

### FactoryProjectStatus
```typescript
type FactoryProjectStatus = "planned" | "inProgress" | "finished" | "paused";
```

### FactoryRole
```typescript
type FactoryRole = "dev" | "qa" | "po" | "pm" | "techLead" | "architect" | "scrumMaster" | "ux" | "other";
```

---

## 1. Clients

### GET /clients

List all clients with summary data.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | integer | 1 | Page number |
| perPage | integer | 20 | Items per page |
| search | string | - | Search by name or CNPJ |

**Request:**
```http
GET /api/v1/clients?page=1&perPage=20&search=tech
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "TechCorp Brasil",
      "cnpj": "12.345.678/0001-90",
      "contact": "contato@techcorp.com.br",
      "createdAt": "2024-01-15T10:30:00Z",
      "activeContracts": 3,
      "totalPositions": 10,
      "filledPositions": 8
    }
  ],
  "meta": { "total": 45, "page": 1, "perPage": 20 }
}
```

---

### GET /clients/:id

**Request:**
```http
GET /api/v1/clients/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "TechCorp Brasil",
    "cnpj": "12.345.678/0001-90",
    "contact": "contato@techcorp.com.br",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### POST /clients

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

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nova Empresa S.A.",
    "cnpj": "11.222.333/0001-44",
    "contact": "comercial@novaempresa.com.br",
    "createdAt": "2024-03-10T09:00:00Z"
  }
}
```

---

### PUT /clients/:id

**Request:**
```http
PUT /api/v1/clients/uuid
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "TechCorp Brasil Atualizado",
  "contact": "novo-contato@techcorp.com.br"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "TechCorp Brasil Atualizado",
    "cnpj": "12.345.678/0001-90",
    "contact": "novo-contato@techcorp.com.br",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### DELETE /clients/:id

**Request:**
```http
DELETE /api/v1/clients/uuid
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": { "message": "Client deleted successfully" }
}
```

**Response (409 - has active contracts):**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete client with active contracts",
    "details": { "activeContracts": 3 }
  }
}
```

---

## 2. Contracts

### GET /contracts

List all contracts with computed status.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | integer | 1 | Page number |
| perPage | integer | 20 | Items per page |
| clientId | uuid | - | Filter by client |
| type | string | - | "staffing" or "fabrica" |
| status | string | - | Filter by computed status |
| search | string | - | Search by contractNumber, projectName, clientName |

**Request:**
```http
GET /api/v1/contracts?type=staffing&status=active
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "clientId": "uuid",
      "contractNumber": "CTR-2024-001",
      "projectName": "Sistema de Gestão",
      "type": "staffing",
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "createdAt": "2024-01-05T08:00:00Z",
      "status": "active",
      "daysUntilExpiration": 180,
      "client": {
        "id": "uuid",
        "name": "TechCorp Brasil"
      },
      "totalPositions": 5,
      "filledPositions": 3
    }
  ],
  "meta": { "total": 25, "page": 1, "perPage": 20 }
}
```

---

### GET /contracts/:id

**Request:**
```http
GET /api/v1/contracts/uuid
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "clientId": "uuid",
    "contractNumber": "CTR-2024-001",
    "projectName": "Sistema de Gestão",
    "type": "staffing",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "createdAt": "2024-01-05T08:00:00Z",
    "status": "active",
    "daysUntilExpiration": 180,
    "client": {
      "id": "uuid",
      "name": "TechCorp Brasil",
      "cnpj": "12.345.678/0001-90",
      "contact": "contato@techcorp.com.br"
    },
    "positions": [
      {
        "id": "uuid",
        "title": "Desenvolvedor Full Stack Senior",
        "stackId": "uuid",
        "stackName": "React",
        "status": "filled",
        "startDate": "2024-01-01",
        "endDate": "2024-12-31",
        "allocationPercentage": 100,
        "professional": {
          "id": "uuid",
          "name": "João Silva"
        }
      }
    ]
  }
}
```

---

### POST /contracts

Create contract with positions (positions are required).

**Request:**
```http
POST /api/v1/contracts
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientId": "uuid",
  "contractNumber": "CTR-2024-010",
  "projectName": "Novo Projeto Mobile",
  "type": "staffing",
  "startDate": "2024-04-01",
  "endDate": "2025-03-31",
  "positions": [
    {
      "title": "Mobile Developer Senior",
      "stackId": "uuid",
      "seniorityId": "uuid",
      "allocationPercentage": 100
    },
    {
      "title": "UX Designer",
      "stackId": "uuid",
      "allocationPercentage": 50
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "clientId": "uuid",
    "contractNumber": "CTR-2024-010",
    "projectName": "Novo Projeto Mobile",
    "type": "staffing",
    "startDate": "2024-04-01",
    "endDate": "2025-03-31",
    "createdAt": "2024-03-15T10:00:00Z",
    "positions": [
      {
        "id": "uuid",
        "title": "Mobile Developer Senior",
        "stackId": "uuid",
        "seniorityId": "uuid",
        "status": "open",
        "startDate": "2024-04-01",
        "endDate": "2025-03-31",
        "allocationPercentage": 100
      },
      {
        "id": "uuid",
        "title": "UX Designer",
        "stackId": "uuid",
        "status": "open",
        "startDate": "2024-04-01",
        "endDate": "2025-03-31",
        "allocationPercentage": 50
      }
    ]
  }
}
```

**Response (422 - no positions):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "At least one position is required"
  }
}
```

---

### DELETE /contracts/:id

**Request:**
```http
DELETE /api/v1/contracts/uuid
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": { "message": "Contract and associated positions deleted successfully" }
}
```

---

## 3. Positions

### GET /positions

List all positions with contract and allocation details.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | integer | 1 | Page number |
| perPage | integer | 20 | Items per page |
| contractId | uuid | - | Filter by contract |
| status | string | - | "open" or "filled" |
| stackId | uuid | - | Filter by stack |
| search | string | - | Search by title, clientName, projectName, stackName |

**Request:**
```http
GET /api/v1/positions?status=open
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "contractId": "uuid",
      "title": "Desenvolvedor Full Stack Senior",
      "stackId": "uuid",
      "seniorityId": "uuid",
      "status": "open",
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "allocationPercentage": 100,
      "createdAt": "2024-01-05T08:00:00Z",
      "contract": {
        "id": "uuid",
        "contractNumber": "CTR-2024-001",
        "projectName": "Sistema de Gestão"
      },
      "client": {
        "id": "uuid",
        "name": "TechCorp Brasil"
      },
      "stack": {
        "id": "uuid",
        "name": "React"
      },
      "professional": null
    }
  ],
  "meta": { "total": 50, "page": 1, "perPage": 20 }
}
```

---

### PUT /positions/:id

Update position details.

**Request:**
```http
PUT /api/v1/positions/uuid
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Senior Developer",
  "stackId": "uuid",
  "allocationPercentage": 100
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "contractId": "uuid",
    "title": "Senior Developer",
    "stackId": "uuid",
    "status": "open",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "allocationPercentage": 100,
    "createdAt": "2024-01-05T08:00:00Z"
  }
}
```

---

### DELETE /positions/:id

**Request:**
```http
DELETE /api/v1/positions/uuid
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": { "message": "Position deleted successfully" }
}
```

---

## 4. Allocations (Staffing)

### POST /allocations

Assign a professional to a position.

**Request:**
```http
POST /api/v1/allocations
Authorization: Bearer <token>
Content-Type: application/json

{
  "professionalId": "uuid",
  "positionId": "uuid",
  "startDate": "2024-01-15",
  "endDate": "2024-12-31",
  "allocationPercentage": 100
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "professionalId": "uuid",
    "positionId": "uuid",
    "startDate": "2024-01-15",
    "endDate": "2024-12-31",
    "allocationPercentage": 100,
    "createdAt": "2024-01-15T08:00:00Z"
  }
}
```

**Response (409 - allocation conflict):**
```json
{
  "success": false,
  "error": {
    "code": "ALLOCATION_CONFLICT",
    "message": "Professional allocation would exceed 100%",
    "details": {
      "currentAllocation": 80,
      "requestedAllocation": 50,
      "totalAllocation": 130,
      "conflicts": [
        {
          "positionId": "uuid",
          "positionTitle": "Backend Developer",
          "clientName": "Other Client",
          "allocationPercentage": 80,
          "startDate": "2024-01-01",
          "endDate": "2024-06-30"
        }
      ]
    }
  }
}
```

---

### DELETE /allocations/:id

Unassign a professional from a position.

**Request:**
```http
DELETE /api/v1/allocations/uuid
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": { "message": "Allocation removed successfully" }
}
```

---

## 5. Professionals

### GET /professionals

List all professionals with computed status.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | integer | 1 | Page number |
| perPage | integer | 20 | Items per page |
| stackId | uuid | - | Filter by stack experience |
| generalSeniorityId | uuid | - | Filter by seniority |
| status | string | - | "allocated", "idle", "partial" |
| workMode | string | - | "allocation", "factory", "both" |
| search | string | - | Search by name or stackName |

**Request:**
```http
GET /api/v1/professionals?status=idle
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@email.com",
      "generalSeniorityId": "uuid",
      "generalSeniority": {
        "id": "uuid",
        "name": "B2",
        "level": 4
      },
      "stackExperiences": [
        {
          "stackId": "uuid",
          "stackName": "React",
          "categoryName": "Frontend",
          "yearsExperience": 5
        },
        {
          "stackId": "uuid",
          "stackName": "Node.js",
          "categoryName": "Backend",
          "yearsExperience": 3
        }
      ],
      "status": "allocated",
      "workMode": "both",
      "leaderId": "uuid",
      "leader": {
        "id": "uuid",
        "name": "Maria Santos"
      },
      "totalAllocationPercentage": 100,
      "createdAt": "2024-01-10T08:00:00Z",
      "currentAllocation": {
        "positionId": "uuid",
        "positionTitle": "Senior Developer",
        "clientName": "TechCorp Brasil",
        "projectName": "Sistema de Gestão",
        "allocationPercentage": 100,
        "endDate": "2024-12-31"
      }
    }
  ],
  "meta": { "total": 100, "page": 1, "perPage": 20 }
}
```

---

### GET /professionals/:id

**Request:**
```http
GET /api/v1/professionals/uuid
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@email.com",
    "generalSeniorityId": "uuid",
    "generalSeniority": {
      "id": "uuid",
      "name": "B2",
      "level": 4
    },
    "stackExperiences": [
      {
        "stackId": "uuid",
        "stackName": "React",
        "categoryName": "Frontend",
        "yearsExperience": 5
      }
    ],
    "status": "allocated",
    "workMode": "both",
    "leaderId": "uuid",
    "createdAt": "2024-01-10T08:00:00Z",
    "allocations": [
      {
        "id": "uuid",
        "positionId": "uuid",
        "positionTitle": "Senior Developer",
        "clientName": "TechCorp Brasil",
        "projectName": "Sistema de Gestão",
        "contractType": "staffing",
        "startDate": "2024-01-15",
        "endDate": "2024-12-31",
        "allocationPercentage": 100
      }
    ],
    "factoryAllocations": [
      {
        "id": "uuid",
        "projectId": "uuid",
        "projectName": "App Mobile",
        "role": "dev",
        "stackName": "React Native",
        "startDate": "2024-02-01",
        "endDate": "2024-06-30",
        "allocationPercentage": 50
      }
    ]
  }
}
```

---

### POST /professionals

**Request:**
```http
POST /api/v1/professionals
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Carlos Souza",
  "email": "carlos@email.com",
  "generalSeniorityId": "uuid",
  "stackExperiences": [
    { "stackId": "uuid", "yearsExperience": 3 },
    { "stackId": "uuid", "yearsExperience": 2 }
  ],
  "workMode": "both",
  "leaderId": "uuid"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Carlos Souza",
    "email": "carlos@email.com",
    "generalSeniorityId": "uuid",
    "stackExperiences": [
      { "stackId": "uuid", "yearsExperience": 3 },
      { "stackId": "uuid", "yearsExperience": 2 }
    ],
    "status": "idle",
    "workMode": "both",
    "leaderId": "uuid",
    "createdAt": "2024-03-15T09:00:00Z"
  }
}
```

---

### PUT /professionals/:id

**Request:**
```http
PUT /api/v1/professionals/uuid
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Carlos Souza Jr.",
  "email": "carlos.jr@email.com",
  "generalSeniorityId": "uuid",
  "stackExperiences": [
    { "stackId": "uuid", "yearsExperience": 4 }
  ],
  "workMode": "allocation",
  "leaderId": null
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Carlos Souza Jr.",
    "email": "carlos.jr@email.com",
    "generalSeniorityId": "uuid",
    "stackExperiences": [
      { "stackId": "uuid", "yearsExperience": 4 }
    ],
    "status": "idle",
    "workMode": "allocation",
    "leaderId": null,
    "createdAt": "2024-03-15T09:00:00Z"
  }
}
```

---

### DELETE /professionals/:id

**Request:**
```http
DELETE /api/v1/professionals/uuid
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": { "message": "Professional deleted successfully" }
}
```

---

## 6. Stack Categories

### GET /stackCategories

**Request:**
```http
GET /api/v1/stackCategories
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Desenvolvimento",
      "description": "Stacks de desenvolvimento de software",
      "createdAt": "2024-01-01T00:00:00Z",
      "stackCount": 15
    },
    {
      "id": "uuid",
      "name": "QA",
      "description": "Ferramentas de qualidade",
      "createdAt": "2024-01-01T00:00:00Z",
      "stackCount": 5
    }
  ]
}
```

---

### POST /stackCategories

**Request:**
```http
POST /api/v1/stackCategories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "DevOps",
  "description": "Infraestrutura e automação"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "DevOps",
    "description": "Infraestrutura e automação",
    "createdAt": "2024-03-15T09:00:00Z"
  }
}
```

---

### PUT /stackCategories/:id

**Request:**
```http
PUT /api/v1/stackCategories/uuid
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "DevOps & Cloud",
  "description": "Infraestrutura, automação e cloud"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "DevOps & Cloud",
    "description": "Infraestrutura, automação e cloud",
    "createdAt": "2024-03-15T09:00:00Z"
  }
}
```

---

### DELETE /stackCategories/:id

**Request:**
```http
DELETE /api/v1/stackCategories/uuid
Authorization: Bearer <token>
```

**Response (409 - has stacks):**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete category with associated stacks",
    "details": { "stackCount": 5 }
  }
}
```

---

## 7. Stacks

### GET /stacks

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| categoryId | uuid | - | Filter by category |
| search | string | - | Search by name |

**Request:**
```http
GET /api/v1/stacks?categoryId=uuid
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "React",
      "categoryId": "uuid",
      "categoryName": "Frontend",
      "createdAt": "2024-01-01T00:00:00Z",
      "professionalCount": 25,
      "positionCount": 10,
      "filledPositions": 8
    }
  ]
}
```

---

### POST /stacks

**Request:**
```http
POST /api/v1/stacks
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Vue.js",
  "categoryId": "uuid"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Vue.js",
    "categoryId": "uuid",
    "createdAt": "2024-03-15T09:00:00Z"
  }
}
```

---

### PUT /stacks/:id

**Request:**
```http
PUT /api/v1/stacks/uuid
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Vue.js 3",
  "categoryId": "uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Vue.js 3",
    "categoryId": "uuid",
    "createdAt": "2024-03-15T09:00:00Z"
  }
}
```

---

### DELETE /stacks/:id

**Request:**
```http
DELETE /api/v1/stacks/uuid
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": { "message": "Stack deleted successfully" }
}
```

---

## 8. General Seniorities

### GET /generalSeniorities

Returns ordered list by level.

**Request:**
```http
GET /api/v1/generalSeniorities
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "A1",
      "level": 1,
      "description": "Estagiário",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid",
      "name": "A2",
      "level": 2,
      "description": "Junior 1",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid",
      "name": "B1",
      "level": 3,
      "description": "Pleno 1",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /generalSeniorities

**Request:**
```http
POST /api/v1/generalSeniorities
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "C5",
  "level": 10,
  "description": "Principal Engineer"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "C5",
    "level": 10,
    "description": "Principal Engineer",
    "createdAt": "2024-03-15T09:00:00Z"
  }
}
```

---

### PUT /generalSeniorities/:id

**Request:**
```http
PUT /api/v1/generalSeniorities/uuid
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "C5",
  "level": 10,
  "description": "Distinguished Engineer"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "C5",
    "level": 10,
    "description": "Distinguished Engineer",
    "createdAt": "2024-03-15T09:00:00Z"
  }
}
```

---

### PUT /generalSeniorities/reorder

Bulk update levels for drag-and-drop reordering.

**Request:**
```http
PUT /api/v1/generalSeniorities/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    { "id": "uuid", "level": 1 },
    { "id": "uuid", "level": 2 },
    { "id": "uuid", "level": 3 }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { "message": "Order updated successfully" }
}
```

---

### DELETE /generalSeniorities/:id

**Request:**
```http
DELETE /api/v1/generalSeniorities/uuid
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": { "message": "Seniority deleted successfully" }
}
```

---

## 9. Teams View

### GET /teams

Returns contracts with team composition (members allocated).

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| type | string | - | "staffing" or "fabrica" |
| status | string | - | Contract status filter |
| search | string | - | Search by projectName, clientName, professionalName |

**Request:**
```http
GET /api/v1/teams?type=staffing
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "contractId": "uuid",
      "contractNumber": "CTR-2024-001",
      "projectName": "Sistema de Gestão",
      "clientName": "TechCorp Brasil",
      "contractType": "staffing",
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "status": "active",
      "daysUntilExpiration": 180,
      "totalPositions": 5,
      "filledPositions": 4,
      "members": [
        {
          "professionalId": "uuid",
          "professionalName": "João Silva",
          "positionTitle": "Senior Developer",
          "stackName": "React",
          "categoryName": "Frontend",
          "startDate": "2024-01-15",
          "endDate": "2024-12-31",
          "allocationPercentage": 100
        }
      ]
    }
  ]
}
```

---

## 10. Factory Projects

### GET /factoryProjects

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| status | string | - | "planned", "inProgress", "finished", "paused" |
| search | string | - | Search by name, description, clientName |

**Request:**
```http
GET /api/v1/factoryProjects?status=inProgress
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "App Mobile Banking",
      "clientId": "uuid",
      "client": {
        "id": "uuid",
        "name": "Banco XYZ"
      },
      "description": "Aplicativo mobile para transações bancárias",
      "startDate": "2024-02-01",
      "endDate": "2024-08-31",
      "status": "inProgress",
      "progressPercentage": 45,
      "createdAt": "2024-01-20T10:00:00Z",
      "totalMembers": 6,
      "daysRemaining": 120,
      "daysElapsed": 60,
      "totalDays": 180,
      "calculatedProgress": 33,
      "allocations": [
        {
          "id": "uuid",
          "professionalId": "uuid",
          "professionalName": "Carlos Dev",
          "role": "dev",
          "stackId": "uuid",
          "stackName": "React Native",
          "startDate": "2024-02-01",
          "endDate": "2024-08-31",
          "allocationPercentage": 100
        }
      ]
    }
  ]
}
```

---

### GET /factoryProjects/:id

**Request:**
```http
GET /api/v1/factoryProjects/uuid
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "App Mobile Banking",
    "clientId": "uuid",
    "client": {
      "id": "uuid",
      "name": "Banco XYZ"
    },
    "description": "Aplicativo mobile para transações bancárias",
    "startDate": "2024-02-01",
    "endDate": "2024-08-31",
    "status": "inProgress",
    "progressPercentage": 45,
    "createdAt": "2024-01-20T10:00:00Z",
    "allocations": [
      {
        "id": "uuid",
        "professionalId": "uuid",
        "professional": {
          "id": "uuid",
          "name": "Carlos Dev",
          "generalSeniority": { "id": "uuid", "name": "B2" }
        },
        "role": "dev",
        "stackId": "uuid",
        "stack": { "id": "uuid", "name": "React Native" },
        "startDate": "2024-02-01",
        "endDate": "2024-08-31",
        "allocationPercentage": 100
      }
    ]
  }
}
```

---

### POST /factoryProjects

**Request:**
```http
POST /api/v1/factoryProjects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sistema ERP",
  "clientId": "uuid",
  "description": "Sistema de gestão empresarial",
  "startDate": "2024-04-01",
  "endDate": "2024-12-31",
  "status": "planned",
  "progressPercentage": 0
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Sistema ERP",
    "clientId": "uuid",
    "description": "Sistema de gestão empresarial",
    "startDate": "2024-04-01",
    "endDate": "2024-12-31",
    "status": "planned",
    "progressPercentage": 0,
    "createdAt": "2024-03-15T09:00:00Z"
  }
}
```

---

### PUT /factoryProjects/:id

**Request:**
```http
PUT /api/v1/factoryProjects/uuid
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sistema ERP v2",
  "status": "inProgress",
  "progressPercentage": 10
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Sistema ERP v2",
    "clientId": "uuid",
    "description": "Sistema de gestão empresarial",
    "startDate": "2024-04-01",
    "endDate": "2024-12-31",
    "status": "inProgress",
    "progressPercentage": 10,
    "createdAt": "2024-03-15T09:00:00Z"
  }
}
```

---

### DELETE /factoryProjects/:id

**Request:**
```http
DELETE /api/v1/factoryProjects/uuid
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": { "message": "Factory project and allocations deleted successfully" }
}
```

---

## 11. Factory Allocations

### POST /factoryAllocations

**Request:**
```http
POST /api/v1/factoryAllocations
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "uuid",
  "professionalId": "uuid",
  "role": "dev",
  "stackId": "uuid",
  "startDate": "2024-04-01",
  "endDate": "2024-12-31",
  "allocationPercentage": 100
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "professionalId": "uuid",
    "role": "dev",
    "stackId": "uuid",
    "startDate": "2024-04-01",
    "endDate": "2024-12-31",
    "allocationPercentage": 100,
    "createdAt": "2024-03-15T09:00:00Z"
  }
}
```

---

### PUT /factoryAllocations/:id

**Request:**
```http
PUT /api/v1/factoryAllocations/uuid
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "techLead",
  "allocationPercentage": 50,
  "endDate": "2024-10-31"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "professionalId": "uuid",
    "role": "techLead",
    "stackId": "uuid",
    "startDate": "2024-04-01",
    "endDate": "2024-10-31",
    "allocationPercentage": 50,
    "createdAt": "2024-03-15T09:00:00Z"
  }
}
```

---

### DELETE /factoryAllocations/:id

**Request:**
```http
DELETE /api/v1/factoryAllocations/uuid
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": { "message": "Factory allocation removed successfully" }
}
```

---

## 12. Dashboard (Staffing)

### GET /dashboard/metrics

**Request:**
```http
GET /api/v1/dashboard/metrics
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalContracts": 25,
    "activeContracts": 20,
    "staffingContracts": 15,
    "fabricaContracts": 5,
    "totalClients": 12,
    "totalProfessionals": 100,
    "totalPositions": 80,
    "filledPositions": 65,
    "openPositions": 15
  }
}
```

---

### GET /dashboard/occupancyForecast

**Request:**
```http
GET /api/v1/dashboard/occupancyForecast
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "period": 30,
      "currentAllocated": 65,
      "predictedIdle": 5,
      "occupancyRate": 85.5,
      "predictedIdleProfessionals": [
        {
          "professionalId": "uuid",
          "professionalName": "João Silva",
          "stackName": "React",
          "currentClientName": "TechCorp",
          "currentProjectName": "Sistema de Gestão",
          "allocationEndDate": "2024-04-15",
          "daysUntilIdle": 15
        }
      ]
    },
    {
      "period": 60,
      "currentAllocated": 65,
      "predictedIdle": 12,
      "occupancyRate": 76.2,
      "predictedIdleProfessionals": []
    },
    {
      "period": 90,
      "currentAllocated": 65,
      "predictedIdle": 18,
      "occupancyRate": 69.1,
      "predictedIdleProfessionals": []
    }
  ]
}
```

---

### GET /dashboard/allocationTimeline

**Request:**
```http
GET /api/v1/dashboard/allocationTimeline
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "professionalId": "uuid",
      "professionalName": "João Silva",
      "positionTitle": "Senior Developer",
      "stackName": "React",
      "categoryName": "Frontend",
      "clientName": "TechCorp Brasil",
      "projectName": "Sistema de Gestão",
      "contractType": "staffing",
      "startDate": "2024-01-15",
      "endDate": "2024-12-31",
      "allocationPercentage": 100
    }
  ]
}
```

---

### GET /dashboard/stackDistribution

**Request:**
```http
GET /api/v1/dashboard/stackDistribution
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "stackId": "uuid",
      "stackName": "React",
      "categoryId": "uuid",
      "categoryName": "Frontend",
      "professionalCount": 25,
      "positionCount": 20,
      "filledPositions": 18
    }
  ]
}
```

---

## 13. Factory Dashboard

### GET /factory/metrics

**Request:**
```http
GET /api/v1/factory/metrics
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalProjects": 10,
    "activeProjects": 5,
    "plannedProjects": 3,
    "finishedProjects": 2,
    "pausedProjects": 0,
    "totalFactoryProfessionals": 35,
    "currentOccupancyRate": 78.5,
    "occupancy30Days": 72.0,
    "occupancy60Days": 65.5,
    "occupancy90Days": 60.0
  }
}
```

---

### GET /factory/idleForecasts

**Request:**
```http
GET /api/v1/factory/idleForecasts
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "period": 30,
      "currentAllocated": 28,
      "predictedIdle": 5,
      "occupancyRate": 80.0,
      "idleProfessionals": [
        {
          "professionalId": "uuid",
          "professionalName": "Carlos Dev",
          "stackName": "React Native",
          "currentProjectName": "App Mobile",
          "allocationEndDate": "2024-04-20",
          "daysUntilIdle": 10
        }
      ]
    }
  ]
}
```

---

### GET /factory/gantt

Gantt chart data for factory projects and professionals.

**Request:**
```http
GET /api/v1/factory/gantt
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "project",
      "name": "App Mobile Banking",
      "startDate": "2024-02-01",
      "endDate": "2024-08-31",
      "progress": 45,
      "status": "inProgress"
    },
    {
      "id": "uuid",
      "type": "professional",
      "name": "Carlos Dev",
      "projectId": "uuid",
      "projectName": "App Mobile Banking",
      "role": "dev",
      "stackName": "React Native",
      "startDate": "2024-02-01",
      "endDate": "2024-08-31"
    }
  ]
}
```

---

## Business Rules

### Professional Status Derivation

The professional status is **computed** based on active allocations:

```typescript
function deriveProfessionalStatus(
  staffingAllocations: Allocation[],
  factoryAllocations: FactoryAllocation[]
): ProfessionalStatus {
  const today = new Date();
  
  const activeStaffing = staffingAllocations.filter(a => 
    new Date(a.startDate) <= today && 
    (!a.endDate || new Date(a.endDate) >= today)
  );
  
  const activeFactory = factoryAllocations.filter(a => 
    new Date(a.startDate) <= today && 
    new Date(a.endDate) >= today
  );
  
  const totalPercentage = 
    activeStaffing.reduce((sum, a) => sum + a.allocationPercentage, 0) +
    activeFactory.reduce((sum, a) => sum + a.allocationPercentage, 0);
  
  if (totalPercentage >= 100) return "allocated";
  if (totalPercentage > 0) return "partial";
  return "idle";
}
```

### Position Status Sync

When an allocation is created/deleted, the position status should be updated:
- Create allocation → position.status = "filled"
- Delete allocation → position.status = "open"

### Contract Status Computation

```typescript
function getContractStatus(endDate: string): ContractStatus {
  const days = differenceInDays(new Date(endDate), new Date());
  
  if (days < 0) return "expired";
  if (days <= 30) return "expiring30";
  if (days <= 60) return "expiring60";
  if (days <= 90) return "expiring90";
  return "active";
}
```

### Allocation Conflict Validation

Before creating an allocation, validate that the professional's total allocation doesn't exceed 100%:

```typescript
function validateAllocation(
  professionalId: string,
  newAllocation: { startDate: string; endDate: string; allocationPercentage: number },
  existingAllocations: Allocation[]
): { valid: boolean; conflicts: Allocation[]; totalPercentage: number } {
  const overlapping = existingAllocations.filter(a => 
    a.professionalId === professionalId &&
    datesOverlap(a.startDate, a.endDate, newAllocation.startDate, newAllocation.endDate)
  );
  
  const currentTotal = overlapping.reduce((sum, a) => sum + a.allocationPercentage, 0);
  const newTotal = currentTotal + newAllocation.allocationPercentage;
  
  return {
    valid: newTotal <= 100,
    conflicts: overlapping,
    totalPercentage: newTotal
  };
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 422 | Request validation failed |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Operation conflicts with existing data |
| ALLOCATION_CONFLICT | 409 | Allocation exceeds 100% capacity |
| UNAUTHORIZED | 401 | Invalid or missing authentication |
| FORBIDDEN | 403 | Insufficient permissions |
