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

## Entities & Endpoints

### 1. Clients

**Table:** `clients`

#### Schema

```json
{
  "id": "uuid",
  "name": "string",
  "cnpj": "string",
  "contact": "string",
  "created_at": "timestamp"
}
```

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/clients` | List all clients |
| GET | `/clients/:id` | Get client by ID |
| POST | `/clients` | Create client |
| PUT | `/clients/:id` | Update client |
| DELETE | `/clients/:id` | Delete client |

#### Request Body (POST/PUT)

```json
{
  "name": "string (required)",
  "cnpj": "string (required)",
  "contact": "string (required)"
}
```

---

### 2. Contracts

**Table:** `contracts`

#### Schema

```json
{
  "id": "uuid",
  "client_id": "uuid (FK: clients.id)",
  "contract_number": "string",
  "project_name": "string | null",
  "type": "enum('staffing', 'factory')",
  "start_date": "date",
  "end_date": "date",
  "monthly_value": "decimal",
  "created_at": "timestamp"
}
```

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contracts` | List all contracts |
| GET | `/contracts/:id` | Get contract by ID |
| GET | `/contracts/:id/details` | Get contract with positions and client |
| POST | `/contracts` | Create contract |
| PUT | `/contracts/:id` | Update contract |
| DELETE | `/contracts/:id` | Delete contract |
| GET | `/contracts/expiring/:days` | Get contracts expiring in X days |

#### Request Body (POST/PUT)

```json
{
  "client_id": "uuid (required)",
  "contract_number": "string (required)",
  "project_name": "string | null",
  "type": "staffing | factory (required)",
  "start_date": "YYYY-MM-DD (required)",
  "end_date": "YYYY-MM-DD (required)",
  "monthly_value": "number (required)"
}
```

#### Enums

```typescript
type ContractType = 'staffing' | 'factory';
type ContractStatus = 'active' | 'expiring_30' | 'expiring_60' | 'expiring_90' | 'expired';
```

---

### 3. Stack Categories

**Table:** `stack_categories`

#### Schema

```json
{
  "id": "uuid",
  "name": "string",
  "description": "string | null",
  "created_at": "timestamp"
}
```

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stack-categories` | List all categories |
| GET | `/stack-categories/:id` | Get category by ID |
| POST | `/stack-categories` | Create category |
| PUT | `/stack-categories/:id` | Update category |
| DELETE | `/stack-categories/:id` | Delete category |

#### Request Body (POST/PUT)

```json
{
  "name": "string (required)",
  "description": "string | null"
}
```

---

### 4. Stacks

**Table:** `stacks`

#### Schema

```json
{
  "id": "uuid",
  "name": "string",
  "category_id": "uuid (FK: stack_categories.id)",
  "created_at": "timestamp"
}
```

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stacks` | List all stacks |
| GET | `/stacks/:id` | Get stack by ID |
| GET | `/stacks/category/:categoryId` | Get stacks by category |
| POST | `/stacks` | Create stack |
| PUT | `/stacks/:id` | Update stack |
| DELETE | `/stacks/:id` | Delete stack |

#### Request Body (POST/PUT)

```json
{
  "name": "string (required)",
  "category_id": "uuid (required)"
}
```

---

### 5. General Seniorities

**Table:** `general_seniorities`

System-wide seniority levels (e.g., A1-C5).

#### Schema

```json
{
  "id": "uuid",
  "name": "string",
  "level": "integer",
  "description": "string | null",
  "created_at": "timestamp"
}
```

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/general-seniorities` | List all (ordered by level) |
| GET | `/general-seniorities/:id` | Get by ID |
| POST | `/general-seniorities` | Create seniority |
| PUT | `/general-seniorities/:id` | Update seniority |
| PUT | `/general-seniorities/reorder` | Batch reorder levels |
| DELETE | `/general-seniorities/:id` | Delete seniority |

#### Request Body (POST/PUT)

```json
{
  "name": "string (required)",
  "level": "integer (required)",
  "description": "string | null"
}
```

#### Reorder Request Body

```json
{
  "items": [
    { "id": "uuid", "level": 1 },
    { "id": "uuid", "level": 2 }
  ]
}
```

---

### 6. Seniorities (Per Stack Category)

**Table:** `seniorities`

Category-specific seniority levels.

#### Schema

```json
{
  "id": "uuid",
  "name": "string",
  "level": "integer",
  "category_id": "uuid (FK: stack_categories.id)",
  "description": "string | null",
  "created_at": "timestamp"
}
```

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/seniorities` | List all seniorities |
| GET | `/seniorities/:id` | Get by ID |
| GET | `/seniorities/category/:categoryId` | Get by category |
| POST | `/seniorities` | Create seniority |
| PUT | `/seniorities/:id` | Update seniority |
| DELETE | `/seniorities/:id` | Delete seniority |

#### Request Body (POST/PUT)

```json
{
  "name": "string (required)",
  "level": "integer (required)",
  "category_id": "uuid (required)",
  "description": "string | null"
}
```

---

### 7. Professionals

**Table:** `professionals`

#### Schema

```json
{
  "id": "uuid",
  "name": "string",
  "email": "string | null",
  "general_seniority_id": "uuid | null (FK: general_seniorities.id)",
  "status": "enum('allocated', 'idle', 'partial', 'vacation', 'notice')",
  "work_mode": "enum('allocation', 'factory', 'both')",
  "leader_id": "uuid | null (FK: professionals.id)",
  "total_years_experience": "integer | null",
  "created_at": "timestamp"
}
```

**Related Table:** `professional_stack_experiences`

```json
{
  "id": "uuid",
  "professional_id": "uuid (FK: professionals.id)",
  "stack_id": "uuid (FK: stacks.id)",
  "years_experience": "integer"
}
```

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/professionals` | List all professionals |
| GET | `/professionals/:id` | Get professional by ID |
| GET | `/professionals/:id/details` | Get with allocations & stacks |
| GET | `/professionals/available` | Get available professionals |
| GET | `/professionals/by-leader/:leaderId` | Get by leader |
| GET | `/professionals/by-stack/:stackId` | Get by stack |
| GET | `/professionals/by-status/:status` | Get by status |
| POST | `/professionals` | Create professional |
| PUT | `/professionals/:id` | Update professional |
| DELETE | `/professionals/:id` | Delete professional |

#### Request Body (POST/PUT)

```json
{
  "name": "string (required)",
  "email": "string | null",
  "general_seniority_id": "uuid | null",
  "status": "allocated | idle | partial | vacation | notice (required)",
  "work_mode": "allocation | factory | both (required)",
  "leader_id": "uuid | null",
  "total_years_experience": "integer | null",
  "stack_experiences": [
    {
      "stack_id": "uuid (required)",
      "years_experience": "integer (required)"
    }
  ]
}
```

#### Enums

```typescript
type ProfessionalStatus = 'allocated' | 'idle' | 'partial' | 'vacation' | 'notice';
type ProfessionalWorkMode = 'allocation' | 'factory' | 'both';
```

---

### 8. Positions (Vacancies)

**Table:** `positions`

#### Schema

```json
{
  "id": "uuid",
  "contract_id": "uuid (FK: contracts.id)",
  "title": "string",
  "stack_id": "uuid (FK: stacks.id)",
  "seniority_id": "uuid | null (FK: seniorities.id)",
  "status": "enum('open', 'filled')",
  "start_date": "date",
  "end_date": "date",
  "allocation_percentage": "integer",
  "created_at": "timestamp"
}
```

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/positions` | List all positions |
| GET | `/positions/:id` | Get position by ID |
| GET | `/positions/contract/:contractId` | Get by contract |
| GET | `/positions/open` | Get open positions |
| GET | `/positions/filled` | Get filled positions |
| POST | `/positions` | Create position |
| PUT | `/positions/:id` | Update position |
| DELETE | `/positions/:id` | Delete position |

#### Request Body (POST/PUT)

```json
{
  "contract_id": "uuid (required)",
  "title": "string (required)",
  "stack_id": "uuid (required)",
  "seniority_id": "uuid | null",
  "status": "open | filled (required)",
  "start_date": "YYYY-MM-DD (required)",
  "end_date": "YYYY-MM-DD (required)",
  "allocation_percentage": "integer 1-100 (required)"
}
```

#### Enums

```typescript
type PositionStatus = 'open' | 'filled';
```

---

### 9. Allocations (Staffing)

**Table:** `allocations`

#### Schema

```json
{
  "id": "uuid",
  "professional_id": "uuid (FK: professionals.id)",
  "position_id": "uuid (FK: positions.id)",
  "start_date": "date",
  "end_date": "date | null",
  "allocation_percentage": "integer",
  "created_at": "timestamp"
}
```

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/allocations` | List all allocations |
| GET | `/allocations/:id` | Get allocation by ID |
| GET | `/allocations/professional/:professionalId` | Get by professional |
| GET | `/allocations/position/:positionId` | Get by position |
| GET | `/allocations/active` | Get active allocations |
| POST | `/allocations` | Create allocation |
| PUT | `/allocations/:id` | Update allocation |
| DELETE | `/allocations/:id` | Delete allocation |

#### Request Body (POST/PUT)

```json
{
  "professional_id": "uuid (required)",
  "position_id": "uuid (required)",
  "start_date": "YYYY-MM-DD (required)",
  "end_date": "YYYY-MM-DD | null",
  "allocation_percentage": "integer 1-100 (required)"
}
```

---

### 10. Factory Projects

**Table:** `factory_projects`

#### Schema

```json
{
  "id": "uuid",
  "name": "string",
  "client_id": "uuid | null (FK: clients.id)",
  "description": "string",
  "start_date": "date",
  "end_date": "date",
  "status": "enum('planned', 'in_progress', 'finished', 'paused')",
  "progress_percentage": "integer",
  "created_at": "timestamp"
}
```

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/factory-projects` | List all projects |
| GET | `/factory-projects/:id` | Get project by ID |
| GET | `/factory-projects/:id/details` | Get with allocations |
| GET | `/factory-projects/by-status/:status` | Get by status |
| GET | `/factory-projects/client/:clientId` | Get by client |
| POST | `/factory-projects` | Create project |
| PUT | `/factory-projects/:id` | Update project |
| DELETE | `/factory-projects/:id` | Delete project |

#### Request Body (POST/PUT)

```json
{
  "name": "string (required)",
  "client_id": "uuid | null",
  "description": "string (required)",
  "start_date": "YYYY-MM-DD (required)",
  "end_date": "YYYY-MM-DD (required)",
  "status": "planned | in_progress | finished | paused (required)",
  "progress_percentage": "integer 0-100 (required)"
}
```

#### Enums

```typescript
type FactoryProjectStatus = 'planned' | 'in_progress' | 'finished' | 'paused';
```

---

### 11. Factory Allocations

**Table:** `factory_allocations`

#### Schema

```json
{
  "id": "uuid",
  "project_id": "uuid (FK: factory_projects.id)",
  "professional_id": "uuid (FK: professionals.id)",
  "role": "enum('dev', 'qa', 'po', 'pm', 'tech_lead', 'architect', 'scrum_master', 'ux', 'other')",
  "stack_id": "uuid (FK: stacks.id)",
  "start_date": "date",
  "end_date": "date",
  "allocation_percentage": "integer",
  "created_at": "timestamp"
}
```

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/factory-allocations` | List all allocations |
| GET | `/factory-allocations/:id` | Get allocation by ID |
| GET | `/factory-allocations/project/:projectId` | Get by project |
| GET | `/factory-allocations/professional/:professionalId` | Get by professional |
| POST | `/factory-allocations` | Create allocation |
| PUT | `/factory-allocations/:id` | Update allocation |
| DELETE | `/factory-allocations/:id` | Delete allocation |

#### Request Body (POST/PUT)

```json
{
  "project_id": "uuid (required)",
  "professional_id": "uuid (required)",
  "role": "dev | qa | po | pm | tech_lead | architect | scrum_master | ux | other (required)",
  "stack_id": "uuid (required)",
  "start_date": "YYYY-MM-DD (required)",
  "end_date": "YYYY-MM-DD (required)",
  "allocation_percentage": "integer 1-100 (required)"
}
```

#### Enums

```typescript
type FactoryRole = 'dev' | 'qa' | 'po' | 'pm' | 'tech_lead' | 'architect' | 'scrum_master' | 'ux' | 'other';
```

---

## Computed Endpoints (Dashboard/Analytics)

### Dashboard Metrics

#### GET `/dashboard/metrics`

Returns aggregated metrics.

**Response:**

```json
{
  "total_contracts": "integer",
  "active_contracts": "integer",
  "total_clients": "integer",
  "total_professionals": "integer",
  "total_positions": "integer",
  "filled_positions": "integer",
  "open_positions": "integer",
  "monthly_revenue": "decimal",
  "revenue_at_risk_30": "decimal",
  "revenue_at_risk_60": "decimal",
  "revenue_at_risk_90": "decimal"
}
```

---

### Occupancy Forecasts

#### GET `/dashboard/occupancy-forecast`

Returns professionals predicted to become idle.

**Query Params:**
- `period`: `30 | 60 | 90` (required)

**Response:**

```json
{
  "period": 30,
  "current_allocated": "integer",
  "predicted_idle": "integer",
  "occupancy_rate": "decimal",
  "idle_professionals": [
    {
      "professional_id": "uuid",
      "professional_name": "string",
      "stack_name": "string",
      "current_client_name": "string",
      "current_project_name": "string",
      "allocation_end_date": "YYYY-MM-DD",
      "days_until_idle": "integer"
    }
  ]
}
```

---

### Expiring Contracts

#### GET `/dashboard/expiring-contracts`

**Query Params:**
- `days`: `30 | 60 | 90` (required)

**Response:**

```json
{
  "days": 30,
  "contracts": [...],
  "clients_affected": "integer",
  "professionals_involved": "integer",
  "total_monthly_value": "decimal"
}
```

---

### Stack Distributions

#### GET `/dashboard/stack-distributions`

**Response:**

```json
[
  {
    "stack_id": "uuid",
    "stack_name": "string",
    "category_id": "uuid",
    "category_name": "string",
    "professional_count": "integer",
    "position_count": "integer",
    "filled_positions": "integer"
  }
]
```

---

### Client Summaries

#### GET `/dashboard/client-summaries`

**Response:**

```json
[
  {
    "client": { ... },
    "active_contracts": "integer",
    "total_positions": "integer",
    "filled_positions": "integer",
    "total_monthly_value": "decimal"
  }
]
```

---

### Leader Metrics

#### GET `/dashboard/leader-metrics`

**Response:**

```json
[
  {
    "leader_id": "uuid",
    "leader_name": "string",
    "total_professionals": "integer",
    "allocated_professionals": "integer",
    "idle_professionals": "integer",
    "professionals": [...]
  }
]
```

---

### Team Views

#### GET `/teams`

Returns teams organized by contract.

**Response:**

```json
[
  {
    "contract_id": "uuid",
    "contract_number": "string",
    "project_name": "string",
    "client_name": "string",
    "contract_type": "staffing | factory",
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD",
    "status": "active | expiring_30 | expiring_60 | expiring_90 | expired",
    "days_until_expiration": "integer",
    "total_positions": "integer",
    "filled_positions": "integer",
    "members": [
      {
        "professional_id": "uuid",
        "professional_name": "string",
        "position_title": "string",
        "stack_name": "string",
        "category_name": "string",
        "start_date": "YYYY-MM-DD",
        "end_date": "YYYY-MM-DD",
        "allocation_percentage": "integer"
      }
    ]
  }
]
```

---

### Allocation Timeline (Gantt)

#### GET `/dashboard/allocation-timeline`

**Response:**

```json
[
  {
    "id": "uuid",
    "professional_id": "uuid",
    "professional_name": "string",
    "position_title": "string",
    "stack_name": "string",
    "category_name": "string",
    "client_name": "string",
    "project_name": "string",
    "contract_type": "staffing | factory",
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD",
    "allocation_percentage": "integer"
  }
]
```

---

## Factory Dashboard Endpoints

### Factory Metrics

#### GET `/factory/metrics`

**Response:**

```json
{
  "total_projects": "integer",
  "active_projects": "integer",
  "planned_projects": "integer",
  "finished_projects": "integer",
  "paused_projects": "integer",
  "total_factory_professionals": "integer",
  "current_occupancy_rate": "decimal",
  "occupancy_30_days": "decimal",
  "occupancy_60_days": "decimal",
  "occupancy_90_days": "decimal"
}
```

---

### Factory Idle Forecasts

#### GET `/factory/idle-forecast`

**Query Params:**
- `period`: `30 | 60 | 90` (required)

**Response:**

```json
{
  "period": 30,
  "current_allocated": "integer",
  "predicted_idle": "integer",
  "occupancy_rate": "decimal",
  "idle_professionals": [
    {
      "professional_id": "uuid",
      "professional_name": "string",
      "stack_name": "string",
      "current_project_name": "string",
      "allocation_end_date": "YYYY-MM-DD",
      "days_until_idle": "integer"
    }
  ]
}
```

---

### Factory Gantt Data

#### GET `/factory/gantt`

**Response:**

```json
[
  {
    "id": "uuid",
    "type": "project | professional",
    "name": "string",
    "project_id": "uuid | null",
    "project_name": "string | null",
    "role": "string | null",
    "stack_name": "string | null",
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD",
    "progress": "integer | null",
    "status": "planned | in_progress | finished | paused | null"
  }
]
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

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {} | null
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Invalid request body |
| `CONFLICT` | 409 | Resource already exists |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Notes

1. **Status derivado**: O campo `status` do Professional é calculado automaticamente no backend com base na soma das alocações ativas. Status `vacation` e `notice` podem ser setados manualmente.

2. **Soft delete**: Considere implementar soft delete (campo `deleted_at`) para manter histórico.

3. **Validações de conflito**: Endpoint de criação de alocação deve validar se a soma das alocações do profissional não ultrapassa 100%.

4. **Índices sugeridos**:
   - `contracts(client_id, end_date)`
   - `positions(contract_id, status)`
   - `allocations(professional_id, end_date)`
   - `professionals(leader_id, status)`
   - `factory_allocations(project_id, professional_id)`
