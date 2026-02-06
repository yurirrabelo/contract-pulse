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

# Schemas

## Enums

```typescript
// Contract type
type ContractType = "staffing" | "fabrica";

// Contract status (computed from endDate)
type ContractStatus = "active" | "expiring30" | "expiring60" | "expiring90" | "expired";

// Position status
type PositionStatus = "open" | "filled";

// Professional status (computed from allocations)
type ProfessionalStatus = "allocated" | "idle" | "partial" | "vacation" | "notice";

// Professional work mode
type ProfessionalWorkMode = "allocation" | "factory" | "both";

// Factory project status
type FactoryProjectStatus = "planned" | "inProgress" | "finished" | "paused";

// Factory role
type FactoryRole = "dev" | "qa" | "po" | "pm" | "techLead" | "architect" | "scrumMaster" | "ux" | "other";
```

---

## Base Entity Schemas

### Client

```typescript
interface Client {
  id: string;                    // UUID
  name: string;                  // Required, max 255 chars
  cnpj: string;                  // Required, unique, format XX.XXX.XXX/XXXX-XX
  contact: string;               // Required, email format
  createdAt: string;             // ISO 8601 datetime
}

interface ClientWithSummary extends Client {
  activeContracts: number;       // Computed: count of active contracts
  totalPositions: number;        // Computed: sum of positions in active contracts
  filledPositions: number;       // Computed: sum of filled positions in active contracts
}
```

### Contract

```typescript
interface Contract {
  id: string;                    // UUID
  clientId: string;              // UUID, required, FK to Client
  contractNumber: string;        // Required, unique, max 50 chars
  projectName?: string;          // Optional, max 255 chars
  type: ContractType;            // Required: "staffing" | "fabrica"
  startDate: string;             // Required, ISO 8601 date (YYYY-MM-DD)
  endDate: string;               // Required, ISO 8601 date (YYYY-MM-DD)
  createdAt: string;             // ISO 8601 datetime
}

interface ContractWithDetails extends Contract {
  status: ContractStatus;        // Computed from endDate
  daysUntilExpiration: number;   // Computed: days until endDate
  client: ClientRef;             // Nested client reference
  totalPositions: number;        // Computed: count of positions
  filledPositions: number;       // Computed: count of filled positions
  positions?: PositionWithDetails[]; // Optional: full position list
}

interface ClientRef {
  id: string;
  name: string;
  cnpj?: string;
  contact?: string;
}
```

### Position

```typescript
interface Position {
  id: string;                    // UUID
  contractId: string;            // UUID, required, FK to Contract
  title: string;                 // Required, max 255 chars
  stackId: string;               // UUID, required, FK to Stack
  seniorityId?: string;          // UUID, optional, FK to Seniority
  status: PositionStatus;        // "open" | "filled"
  startDate: string;             // ISO 8601 date
  endDate: string;               // ISO 8601 date
  allocationPercentage: number;  // Required, 1-100
  createdAt: string;             // ISO 8601 datetime
}

interface PositionWithDetails extends Position {
  contract: ContractRef;         // Nested contract reference
  client: ClientRef;             // Nested client reference
  stack: StackRef;               // Nested stack reference
  seniority?: SeniorityRef;      // Nested seniority reference
  professional?: ProfessionalRef; // Null if status = "open"
}

interface ContractRef {
  id: string;
  contractNumber: string;
  projectName?: string;
}

interface StackRef {
  id: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
}

interface SeniorityRef {
  id: string;
  name: string;
  level: number;
}

interface ProfessionalRef {
  id: string;
  name: string;
}
```

### Allocation (Staffing)

```typescript
interface Allocation {
  id: string;                    // UUID
  professionalId: string;        // UUID, required, FK to Professional
  positionId: string;            // UUID, required, FK to Position
  startDate: string;             // Required, ISO 8601 date
  endDate?: string;              // Optional, ISO 8601 date (null = ongoing)
  allocationPercentage: number;  // Required, 1-100
  createdAt: string;             // ISO 8601 datetime
}

interface AllocationWithDetails extends Allocation {
  professional: ProfessionalRef;
  position: PositionRef;
  client: ClientRef;
  contract: ContractRef;
  stack: StackRef;
}

interface PositionRef {
  id: string;
  title: string;
}
```

### Professional

```typescript
interface StackExperience {
  stackId: string;               // UUID, FK to Stack
  yearsExperience: number;       // Min 1 (< 2 years normalized to 1)
}

interface StackExperienceWithDetails extends StackExperience {
  stackName: string;
  categoryName: string;
}

interface Professional {
  id: string;                    // UUID
  name: string;                  // Required, max 255 chars
  email?: string;                // Optional, email format
  generalSeniorityId?: string;   // UUID, optional, FK to GeneralSeniority
  stackExperiences: StackExperience[]; // Array of stack experiences
  status: ProfessionalStatus;    // Computed from allocations
  workMode: ProfessionalWorkMode; // Required: "allocation" | "factory" | "both"
  leaderId?: string;             // UUID, optional, FK to Professional
  createdAt: string;             // ISO 8601 datetime
}

interface ProfessionalWithDetails extends Professional {
  generalSeniority?: GeneralSeniorityRef;
  stackExperiences: StackExperienceWithDetails[];
  leader?: ProfessionalRef;
  totalAllocationPercentage: number; // Computed: sum of active allocations
  currentAllocation?: CurrentAllocationInfo; // Current staffing allocation
  allocations: AllocationInfo[];      // All staffing allocations
  factoryAllocations: FactoryAllocationInfo[]; // All factory allocations
}

interface GeneralSeniorityRef {
  id: string;
  name: string;
  level: number;
}

interface CurrentAllocationInfo {
  positionId: string;
  positionTitle: string;
  clientName: string;
  projectName: string;
  allocationPercentage: number;
  endDate: string;
}

interface AllocationInfo {
  id: string;
  positionId: string;
  positionTitle: string;
  clientName: string;
  projectName: string;
  contractType: ContractType;
  startDate: string;
  endDate: string;
  allocationPercentage: number;
}

interface FactoryAllocationInfo {
  id: string;
  projectId: string;
  projectName: string;
  role: FactoryRole;
  stackName: string;
  startDate: string;
  endDate: string;
  allocationPercentage: number;
}
```

### Stack Category

```typescript
interface StackCategory {
  id: string;                    // UUID
  name: string;                  // Required, unique, max 100 chars
  description?: string;          // Optional, max 500 chars
  createdAt: string;             // ISO 8601 datetime
}

interface StackCategoryWithCount extends StackCategory {
  stackCount: number;            // Computed: count of stacks in category
}
```

### Stack

```typescript
interface Stack {
  id: string;                    // UUID
  name: string;                  // Required, max 100 chars
  categoryId: string;            // UUID, required, FK to StackCategory
  createdAt: string;             // ISO 8601 datetime
}

interface StackWithDetails extends Stack {
  categoryName: string;          // From category
  professionalCount: number;     // Computed: professionals with this stack
  positionCount: number;         // Computed: positions requiring this stack
  filledPositions: number;       // Computed: filled positions with this stack
}
```

### General Seniority

```typescript
interface GeneralSeniority {
  id: string;                    // UUID
  name: string;                  // Required, unique, max 50 chars (e.g., "A1", "B2", "C5")
  level: number;                 // Required, unique, for ordering (1 = lowest)
  description?: string;          // Optional, max 255 chars
  createdAt: string;             // ISO 8601 datetime
}
```

### Factory Project

```typescript
interface FactoryProject {
  id: string;                    // UUID
  name: string;                  // Required, max 255 chars
  clientId?: string;             // UUID, optional, FK to Client
  description: string;           // Required, max 2000 chars
  startDate: string;             // Required, ISO 8601 date
  endDate: string;               // Required, ISO 8601 date
  status: FactoryProjectStatus;  // Required
  progressPercentage: number;    // 0-100, can be manual or calculated
  createdAt: string;             // ISO 8601 datetime
}

interface FactoryProjectWithDetails extends FactoryProject {
  client?: ClientRef;            // Nested client reference
  totalMembers: number;          // Computed: count of allocations
  daysRemaining: number;         // Computed: days until endDate
  daysElapsed: number;           // Computed: days since startDate
  totalDays: number;             // Computed: total project duration
  calculatedProgress: number;    // Computed: daysElapsed / totalDays * 100
  allocations: FactoryAllocationWithDetails[];
}
```

### Factory Allocation

```typescript
interface FactoryAllocation {
  id: string;                    // UUID
  projectId: string;             // UUID, required, FK to FactoryProject
  professionalId: string;        // UUID, required, FK to Professional
  role: FactoryRole;             // Required
  stackId: string;               // UUID, required, FK to Stack
  startDate: string;             // Required, ISO 8601 date
  endDate: string;               // Required, ISO 8601 date
  allocationPercentage: number;  // Required, 1-100
  createdAt: string;             // ISO 8601 datetime
}

interface FactoryAllocationWithDetails extends FactoryAllocation {
  professional: ProfessionalWithSeniority;
  stack: StackRef;
  professionalName?: string;     // Shortcut field
  stackName?: string;            // Shortcut field
}

interface ProfessionalWithSeniority {
  id: string;
  name: string;
  generalSeniority?: GeneralSeniorityRef;
}
```

---

## Dashboard Schemas

### Dashboard Metrics

```typescript
interface DashboardMetrics {
  totalContracts: number;
  activeContracts: number;
  staffingContracts: number;
  fabricaContracts: number;
  totalClients: number;
  totalProfessionals: number;
  totalPositions: number;
  filledPositions: number;
  openPositions: number;
}
```

### Occupancy Forecast

```typescript
interface OccupancyForecast {
  period: 30 | 60 | 90;
  currentAllocated: number;      // Currently allocated professionals
  predictedIdle: number;         // Predicted to become idle
  occupancyRate: number;         // Percentage (0-100)
  predictedIdleProfessionals: IdleProfessionalForecast[];
}

interface IdleProfessionalForecast {
  professionalId: string;
  professionalName: string;
  stackName: string;
  currentClientName: string;
  currentProjectName: string;
  allocationEndDate: string;
  daysUntilIdle: number;
}
```

### Allocation Timeline

```typescript
interface AllocationTimelineEntry {
  id: string;
  professionalId: string;
  professionalName: string;
  positionTitle: string;
  stackName: string;
  categoryName: string;
  clientName: string;
  projectName: string;
  contractType: ContractType;
  startDate: string;
  endDate: string;
  allocationPercentage: number;
}
```

### Stack Distribution

```typescript
interface StackDistribution {
  stackId: string;
  stackName: string;
  categoryId: string;
  categoryName: string;
  professionalCount: number;
  positionCount: number;
  filledPositions: number;
}
```

### Team View

```typescript
interface TeamView {
  contractId: string;
  contractNumber: string;
  projectName: string;
  clientName: string;
  contractType: ContractType;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  daysUntilExpiration: number;
  totalPositions: number;
  filledPositions: number;
  members: TeamMember[];
}

interface TeamMember {
  professionalId: string;
  professionalName: string;
  positionTitle: string;
  stackName: string;
  categoryName: string;
  startDate: string;
  endDate: string;
  allocationPercentage: number;
}
```

---

## Factory Dashboard Schemas

### Factory Metrics

```typescript
interface FactoryMetrics {
  totalProjects: number;
  activeProjects: number;
  plannedProjects: number;
  finishedProjects: number;
  pausedProjects: number;
  totalFactoryProfessionals: number;
  currentOccupancyRate: number;
  occupancy30Days: number;
  occupancy60Days: number;
  occupancy90Days: number;
}
```

### Factory Idle Forecast

```typescript
interface FactoryIdleForecast {
  period: 30 | 60 | 90;
  currentAllocated: number;
  predictedIdle: number;
  occupancyRate: number;
  idleProfessionals: FactoryIdleProfessional[];
}

interface FactoryIdleProfessional {
  professionalId: string;
  professionalName: string;
  stackName: string;
  currentProjectName: string;
  allocationEndDate: string;
  daysUntilIdle: number;
}
```

### Factory Gantt

```typescript
interface FactoryGanttEntry {
  id: string;
  type: "project" | "professional";
  name: string;
  projectId?: string;            // Only for type = "professional"
  projectName?: string;          // Only for type = "professional"
  role?: FactoryRole;            // Only for type = "professional"
  stackName?: string;            // Only for type = "professional"
  startDate: string;
  endDate: string;
  progress?: number;             // Only for type = "project"
  status?: FactoryProjectStatus; // Only for type = "project"
}
```

---

# Endpoints

## 1. Clients

### GET /clients

List all clients with summary data.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | integer | 1 | Page number |
| perPage | integer | 20 | Items per page |
| search | string | - | Search by name or CNPJ |

**Request Schema:**
```typescript
interface GetClientsRequest {
  page?: number;
  perPage?: number;
  search?: string;
}
```

**Response Schema:**
```typescript
interface GetClientsResponse {
  success: true;
  data: ClientWithSummary[];
  meta: {
    total: number;
    page: number;
    perPage: number;
  };
}
```

**Example Request:**
```http
GET /api/v1/clients?page=1&perPage=20&search=tech
Authorization: Bearer <token>
```

**Example Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
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

Get a single client by ID.

**Request Schema:**
```typescript
interface GetClientByIdRequest {
  id: string; // UUID path parameter
}
```

**Response Schema:**
```typescript
interface GetClientByIdResponse {
  success: true;
  data: Client;
}
```

**Example Request:**
```http
GET /api/v1/clients/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
```

**Example Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "TechCorp Brasil",
    "cnpj": "12.345.678/0001-90",
    "contact": "contato@techcorp.com.br",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### POST /clients

Create a new client.

**Request Schema:**
```typescript
interface CreateClientRequest {
  name: string;      // Required, max 255 chars
  cnpj: string;      // Required, unique, format XX.XXX.XXX/XXXX-XX
  contact: string;   // Required, email format
}
```

**Response Schema:**
```typescript
interface CreateClientResponse {
  success: true;
  data: Client;
}
```

**Example Request:**
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

**Example Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Nova Empresa S.A.",
    "cnpj": "11.222.333/0001-44",
    "contact": "comercial@novaempresa.com.br",
    "createdAt": "2024-03-10T09:00:00Z"
  }
}
```

---

### PUT /clients/:id

Update an existing client.

**Request Schema:**
```typescript
interface UpdateClientRequest {
  name?: string;     // Max 255 chars
  cnpj?: string;     // Format XX.XXX.XXX/XXXX-XX
  contact?: string;  // Email format
}
```

**Response Schema:**
```typescript
interface UpdateClientResponse {
  success: true;
  data: Client;
}
```

**Example Request:**
```http
PUT /api/v1/clients/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "TechCorp Brasil Atualizado",
  "contact": "novo-contato@techcorp.com.br"
}
```

**Example Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "TechCorp Brasil Atualizado",
    "cnpj": "12.345.678/0001-90",
    "contact": "novo-contato@techcorp.com.br",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### DELETE /clients/:id

Delete a client.

**Request Schema:**
```typescript
interface DeleteClientRequest {
  id: string; // UUID path parameter
}
```

**Response Schema:**
```typescript
interface DeleteClientResponse {
  success: true;
  data: { message: string };
}
```

**Example Request:**
```http
DELETE /api/v1/clients/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
```

**Example Response (200):**
```json
{
  "success": true,
  "data": { "message": "Client deleted successfully" }
}
```

**Example Response (409 - has active contracts):**
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

**Request Schema:**
```typescript
interface GetContractsRequest {
  page?: number;
  perPage?: number;
  clientId?: string;
  type?: ContractType;
  status?: ContractStatus;
  search?: string;
}
```

**Response Schema:**
```typescript
interface GetContractsResponse {
  success: true;
  data: ContractWithDetails[];
  meta: {
    total: number;
    page: number;
    perPage: number;
  };
}
```

**Example Request:**
```http
GET /api/v1/contracts?type=staffing&status=active
Authorization: Bearer <token>
```

**Example Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "clientId": "550e8400-e29b-41d4-a716-446655440001",
      "contractNumber": "CTR-2024-001",
      "projectName": "Sistema de Gestão",
      "type": "staffing",
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "createdAt": "2024-01-05T08:00:00Z",
      "status": "active",
      "daysUntilExpiration": 180,
      "client": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
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

Get a single contract with full details including positions.

**Request Schema:**
```typescript
interface GetContractByIdRequest {
  id: string; // UUID path parameter
}
```

**Response Schema:**
```typescript
interface GetContractByIdResponse {
  success: true;
  data: ContractWithDetails & {
    client: Client;
    positions: PositionWithDetails[];
  };
}
```

**Example Request:**
```http
GET /api/v1/contracts/550e8400-e29b-41d4-a716-446655440010
Authorization: Bearer <token>
```

**Example Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "clientId": "550e8400-e29b-41d4-a716-446655440001",
    "contractNumber": "CTR-2024-001",
    "projectName": "Sistema de Gestão",
    "type": "staffing",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "createdAt": "2024-01-05T08:00:00Z",
    "status": "active",
    "daysUntilExpiration": 180,
    "client": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "TechCorp Brasil",
      "cnpj": "12.345.678/0001-90",
      "contact": "contato@techcorp.com.br"
    },
    "totalPositions": 5,
    "filledPositions": 3,
    "positions": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440020",
        "contractId": "550e8400-e29b-41d4-a716-446655440010",
        "title": "Desenvolvedor Full Stack Senior",
        "stackId": "550e8400-e29b-41d4-a716-446655440030",
        "seniorityId": "550e8400-e29b-41d4-a716-446655440040",
        "status": "filled",
        "startDate": "2024-01-01",
        "endDate": "2024-12-31",
        "allocationPercentage": 100,
        "createdAt": "2024-01-05T08:00:00Z",
        "stack": {
          "id": "550e8400-e29b-41d4-a716-446655440030",
          "name": "React",
          "categoryName": "Frontend"
        },
        "professional": {
          "id": "550e8400-e29b-41d4-a716-446655440050",
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

**Request Schema:**
```typescript
interface CreateContractRequest {
  clientId: string;              // Required, UUID
  contractNumber: string;        // Required, unique
  projectName?: string;          // Optional
  type: ContractType;            // Required
  startDate: string;             // Required, ISO 8601 date
  endDate: string;               // Required, ISO 8601 date
  positions: CreatePositionInput[]; // Required, min 1
}

interface CreatePositionInput {
  title: string;                 // Required
  stackId: string;               // Required, UUID
  seniorityId?: string;          // Optional, UUID
  allocationPercentage: number;  // Required, 1-100
}
```

**Response Schema:**
```typescript
interface CreateContractResponse {
  success: true;
  data: Contract & {
    positions: Position[];
  };
}
```

**Example Request:**
```http
POST /api/v1/contracts
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientId": "550e8400-e29b-41d4-a716-446655440001",
  "contractNumber": "CTR-2024-010",
  "projectName": "Novo Projeto Mobile",
  "type": "staffing",
  "startDate": "2024-04-01",
  "endDate": "2025-03-31",
  "positions": [
    {
      "title": "Mobile Developer Senior",
      "stackId": "550e8400-e29b-41d4-a716-446655440030",
      "seniorityId": "550e8400-e29b-41d4-a716-446655440040",
      "allocationPercentage": 100
    },
    {
      "title": "UX Designer",
      "stackId": "550e8400-e29b-41d4-a716-446655440031",
      "allocationPercentage": 50
    }
  ]
}
```

**Example Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440011",
    "clientId": "550e8400-e29b-41d4-a716-446655440001",
    "contractNumber": "CTR-2024-010",
    "projectName": "Novo Projeto Mobile",
    "type": "staffing",
    "startDate": "2024-04-01",
    "endDate": "2025-03-31",
    "createdAt": "2024-03-15T10:00:00Z",
    "positions": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440021",
        "contractId": "550e8400-e29b-41d4-a716-446655440011",
        "title": "Mobile Developer Senior",
        "stackId": "550e8400-e29b-41d4-a716-446655440030",
        "seniorityId": "550e8400-e29b-41d4-a716-446655440040",
        "status": "open",
        "startDate": "2024-04-01",
        "endDate": "2025-03-31",
        "allocationPercentage": 100,
        "createdAt": "2024-03-15T10:00:00Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440022",
        "contractId": "550e8400-e29b-41d4-a716-446655440011",
        "title": "UX Designer",
        "stackId": "550e8400-e29b-41d4-a716-446655440031",
        "seniorityId": null,
        "status": "open",
        "startDate": "2024-04-01",
        "endDate": "2025-03-31",
        "allocationPercentage": 50,
        "createdAt": "2024-03-15T10:00:00Z"
      }
    ]
  }
}
```

**Example Response (422 - no positions):**
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

Delete a contract and all associated positions.

**Request Schema:**
```typescript
interface DeleteContractRequest {
  id: string; // UUID path parameter
}
```

**Response Schema:**
```typescript
interface DeleteContractResponse {
  success: true;
  data: { message: string };
}
```

**Example Request:**
```http
DELETE /api/v1/contracts/550e8400-e29b-41d4-a716-446655440010
Authorization: Bearer <token>
```

**Example Response (200):**
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

**Request Schema:**
```typescript
interface GetPositionsRequest {
  page?: number;
  perPage?: number;
  contractId?: string;
  status?: PositionStatus;
  stackId?: string;
  search?: string;
}
```

**Response Schema:**
```typescript
interface GetPositionsResponse {
  success: true;
  data: PositionWithDetails[];
  meta: {
    total: number;
    page: number;
    perPage: number;
  };
}
```

**Example Request:**
```http
GET /api/v1/positions?status=open
Authorization: Bearer <token>
```

**Example Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "contractId": "550e8400-e29b-41d4-a716-446655440010",
      "title": "Desenvolvedor Full Stack Senior",
      "stackId": "550e8400-e29b-41d4-a716-446655440030",
      "seniorityId": "550e8400-e29b-41d4-a716-446655440040",
      "status": "open",
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "allocationPercentage": 100,
      "createdAt": "2024-01-05T08:00:00Z",
      "contract": {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "contractNumber": "CTR-2024-001",
        "projectName": "Sistema de Gestão"
      },
      "client": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "TechCorp Brasil"
      },
      "stack": {
        "id": "550e8400-e29b-41d4-a716-446655440030",
        "name": "React",
        "categoryName": "Frontend"
      },
      "seniority": {
        "id": "550e8400-e29b-41d4-a716-446655440040",
        "name": "B2",
        "level": 4
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

**Request Schema:**
```typescript
interface UpdatePositionRequest {
  title?: string;
  stackId?: string;
  seniorityId?: string | null;
  allocationPercentage?: number;
}
```

**Response Schema:**
```typescript
interface UpdatePositionResponse {
  success: true;
  data: Position;
}
```

**Example Request:**
```http
PUT /api/v1/positions/550e8400-e29b-41d4-a716-446655440020
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Senior Developer",
  "stackId": "550e8400-e29b-41d4-a716-446655440030",
  "allocationPercentage": 100
}
```

**Example Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "contractId": "550e8400-e29b-41d4-a716-446655440010",
    "title": "Senior Developer",
    "stackId": "550e8400-e29b-41d4-a716-446655440030",
    "seniorityId": "550e8400-e29b-41d4-a716-446655440040",
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

Delete a position.

**Request Schema:**
```typescript
interface DeletePositionRequest {
  id: string; // UUID path parameter
}
```

**Response Schema:**
```typescript
interface DeletePositionResponse {
  success: true;
  data: { message: string };
}
```

**Example Request:**
```http
DELETE /api/v1/positions/550e8400-e29b-41d4-a716-446655440020
Authorization: Bearer <token>
```

**Example Response (200):**
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

**Request Schema:**
```typescript
interface CreateAllocationRequest {
  professionalId: string;        // Required, UUID
  positionId: string;            // Required, UUID
  startDate: string;             // Required, ISO 8601 date
  endDate?: string;              // Optional, ISO 8601 date
  allocationPercentage: number;  // Required, 1-100
}
```

**Response Schema:**
```typescript
interface CreateAllocationResponse {
  success: true;
  data: Allocation;
}
```

**Example Request:**
```http
POST /api/v1/allocations
Authorization: Bearer <token>
Content-Type: application/json

{
  "professionalId": "550e8400-e29b-41d4-a716-446655440050",
  "positionId": "550e8400-e29b-41d4-a716-446655440020",
  "startDate": "2024-01-15",
  "endDate": "2024-12-31",
  "allocationPercentage": 100
}
```

**Example Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440060",
    "professionalId": "550e8400-e29b-41d4-a716-446655440050",
    "positionId": "550e8400-e29b-41d4-a716-446655440020",
    "startDate": "2024-01-15",
    "endDate": "2024-12-31",
    "allocationPercentage": 100,
    "createdAt": "2024-01-15T08:00:00Z"
  }
}
```

**Example Response (409 - allocation conflict):**
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
          "positionId": "550e8400-e29b-41d4-a716-446655440021",
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

**Request Schema:**
```typescript
interface DeleteAllocationRequest {
  id: string; // UUID path parameter
}
```

**Response Schema:**
```typescript
interface DeleteAllocationResponse {
  success: true;
  data: { message: string };
}
```

**Example Request:**
```http
DELETE /api/v1/allocations/550e8400-e29b-41d4-a716-446655440060
Authorization: Bearer <token>
```

**Example Response (200):**
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
| leaderId | uuid | - | Filter by leader |
| search | string | - | Search by name or stackName |

**Request Schema:**
```typescript
interface GetProfessionalsRequest {
  page?: number;
  perPage?: number;
  stackId?: string;
  generalSeniorityId?: string;
  status?: ProfessionalStatus;
  workMode?: ProfessionalWorkMode;
  leaderId?: string;
  search?: string;
}
```

**Response Schema:**
```typescript
interface GetProfessionalsResponse {
  success: true;
  data: ProfessionalListItem[];
  meta: {
    total: number;
    page: number;
    perPage: number;
  };
}

interface ProfessionalListItem {
  id: string;
  name: string;
  email?: string;
  generalSeniorityId?: string;
  generalSeniority?: GeneralSeniorityRef;
  stackExperiences: StackExperienceWithDetails[];
  status: ProfessionalStatus;
  workMode: ProfessionalWorkMode;
  leaderId?: string;
  leader?: ProfessionalRef;
  totalAllocationPercentage: number;
  createdAt: string;
  currentAllocation?: CurrentAllocationInfo;
}
```

**Example Request:**
```http
GET /api/v1/professionals?status=idle
Authorization: Bearer <token>
```

**Example Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440050",
      "name": "João Silva",
      "email": "joao@email.com",
      "generalSeniorityId": "550e8400-e29b-41d4-a716-446655440040",
      "generalSeniority": {
        "id": "550e8400-e29b-41d4-a716-446655440040",
        "name": "B2",
        "level": 4
      },
      "stackExperiences": [
        {
          "stackId": "550e8400-e29b-41d4-a716-446655440030",
          "stackName": "React",
          "categoryName": "Frontend",
          "yearsExperience": 5
        },
        {
          "stackId": "550e8400-e29b-41d4-a716-446655440031",
          "stackName": "Node.js",
          "categoryName": "Backend",
          "yearsExperience": 3
        }
      ],
      "status": "allocated",
      "workMode": "both",
      "leaderId": "550e8400-e29b-41d4-a716-446655440051",
      "leader": {
        "id": "550e8400-e29b-41d4-a716-446655440051",
        "name": "Maria Santos"
      },
      "totalAllocationPercentage": 100,
      "createdAt": "2024-01-10T08:00:00Z",
      "currentAllocation": {
        "positionId": "550e8400-e29b-41d4-a716-446655440020",
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

Get a single professional with full details.

**Request Schema:**
```typescript
interface GetProfessionalByIdRequest {
  id: string; // UUID path parameter
}
```

**Response Schema:**
```typescript
interface GetProfessionalByIdResponse {
  success: true;
  data: ProfessionalWithDetails;
}
```

**Example Request:**
```http
GET /api/v1/professionals/550e8400-e29b-41d4-a716-446655440050
Authorization: Bearer <token>
```

**Example Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440050",
    "name": "João Silva",
    "email": "joao@email.com",
    "generalSeniorityId": "550e8400-e29b-41d4-a716-446655440040",
    "generalSeniority": {
      "id": "550e8400-e29b-41d4-a716-446655440040",
      "name": "B2",
      "level": 4
    },
    "stackExperiences": [
      {
        "stackId": "550e8400-e29b-41d4-a716-446655440030",
        "stackName": "React",
        "categoryName": "Frontend",
        "yearsExperience": 5
      }
    ],
    "status": "allocated",
    "workMode": "both",
    "leaderId": "550e8400-e29b-41d4-a716-446655440051",
    "totalAllocationPercentage": 100,
    "createdAt": "2024-01-10T08:00:00Z",
    "allocations": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440060",
        "positionId": "550e8400-e29b-41d4-a716-446655440020",
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
        "id": "550e8400-e29b-41d4-a716-446655440070",
        "projectId": "550e8400-e29b-41d4-a716-446655440080",
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

Create a new professional.

**Request Schema:**
```typescript
interface CreateProfessionalRequest {
  name: string;                  // Required
  email?: string;                // Optional
  generalSeniorityId?: string;   // Optional, UUID
  stackExperiences: StackExperience[]; // Required, min 1
  workMode: ProfessionalWorkMode; // Required
  leaderId?: string;             // Optional, UUID
}
```

**Response Schema:**
```typescript
interface CreateProfessionalResponse {
  success: true;
  data: Professional;
}
```

**Example Request:**
```http
POST /api/v1/professionals
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Carlos Souza",
  "email": "carlos@email.com",
  "generalSeniorityId": "550e8400-e29b-41d4-a716-446655440040",
  "stackExperiences": [
    { "stackId": "550e8400-e29b-41d4-a716-446655440030", "yearsExperience": 3 },
    { "stackId": "550e8400-e29b-41d4-a716-446655440031", "yearsExperience": 2 }
  ],
  "workMode": "both",
  "leaderId": "550e8400-e29b-41d4-a716-446655440051"
}
```

**Example Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440052",
    "name": "Carlos Souza",
    "email": "carlos@email.com",
    "generalSeniorityId": "550e8400-e29b-41d4-a716-446655440040",
    "stackExperiences": [
      { "stackId": "550e8400-e29b-41d4-a716-446655440030", "yearsExperience": 3 },
      { "stackId": "550e8400-e29b-41d4-a716-446655440031", "yearsExperience": 2 }
    ],
    "status": "idle",
    "workMode": "both",
    "leaderId": "550e8400-e29b-41d4-a716-446655440051",
    "createdAt": "2024-03-15T09:00:00Z"
  }
}
```

---

### PUT /professionals/:id

Update an existing professional.

**Request Schema:**
```typescript
interface UpdateProfessionalRequest {
  name?: string;
  email?: string | null;
  generalSeniorityId?: string | null;
  stackExperiences?: StackExperience[];
  workMode?: ProfessionalWorkMode;
  leaderId?: string | null;
}
```

**Response Schema:**
```typescript
interface UpdateProfessionalResponse {
  success: true;
  data: Professional;
}
```

**Example Request:**
```http
PUT /api/v1/professionals/550e8400-e29b-41d4-a716-446655440052
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Carlos Souza Jr.",
  "email": "carlos.jr@email.com",
  "generalSeniorityId": "550e8400-e29b-41d4-a716-446655440041",
  "stackExperiences": [
    { "stackId": "550e8400-e29b-41d4-a716-446655440030", "yearsExperience": 4 }
  ],
  "workMode": "allocation",
  "leaderId": null
}
```

**Example Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440052",
    "name": "Carlos Souza Jr.",
    "email": "carlos.jr@email.com",
    "generalSeniorityId": "550e8400-e29b-41d4-a716-446655440041",
    "stackExperiences": [
      { "stackId": "550e8400-e29b-41d4-a716-446655440030", "yearsExperience": 4 }
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

Delete a professional.

**Request Schema:**
```typescript
interface DeleteProfessionalRequest {
  id: string; // UUID path parameter
}
```

**Response Schema:**
```typescript
interface DeleteProfessionalResponse {
  success: true;
  data: { message: string };
}
```

**Example Request:**
```http
DELETE /api/v1/professionals/550e8400-e29b-41d4-a716-446655440052
Authorization: Bearer <token>
```

**Example Response (200):**
```json
{
  "success": true,
  "data": { "message": "Professional deleted successfully" }
}
```

---

## 6. Stack Categories

### GET /stackCategories

List all stack categories.

**Request Schema:**
```typescript
interface GetStackCategoriesRequest {
  search?: string;
}
```

**Response Schema:**
```typescript
interface GetStackCategoriesResponse {
  success: true;
  data: StackCategoryWithCount[];
}
```

**Example Request:**
```http
GET /api/v1/stackCategories
Authorization: Bearer <token>
```

**Example Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "name": "Desenvolvimento",
      "description": "Stacks de desenvolvimento de software",
      "createdAt": "2024-01-01T00:00:00Z",
      "stackCount": 15
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440101",
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

Create a new stack category.

**Request Schema:**
```typescript
interface CreateStackCategoryRequest {
  name: string;         // Required, unique
  description?: string; // Optional
}
```

**Response Schema:**
```typescript
interface CreateStackCategoryResponse {
  success: true;
  data: StackCategory;
}
```

**Example Request:**
```http
POST /api/v1/stackCategories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "DevOps",
  "description": "Infraestrutura e automação"
}
```

**Example Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440102",
    "name": "DevOps",
    "description": "Infraestrutura e automação",
    "createdAt": "2024-03-15T09:00:00Z"
  }
}
```

---

### PUT /stackCategories/:id

Update a stack category.

**Request Schema:**
```typescript
interface UpdateStackCategoryRequest {
  name?: string;
  description?: string | null;
}
```

**Response Schema:**
```typescript
interface UpdateStackCategoryResponse {
  success: true;
  data: StackCategory;
}
```

**Example Request:**
```http
PUT /api/v1/stackCategories/550e8400-e29b-41d4-a716-446655440102
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "DevOps & Cloud",
  "description": "Infraestrutura, automação e cloud"
}
```

**Example Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440102",
    "name": "DevOps & Cloud",
    "description": "Infraestrutura, automação e cloud",
    "createdAt": "2024-03-15T09:00:00Z"
  }
}
```

---

### DELETE /stackCategories/:id

Delete a stack category.

**Request Schema:**
```typescript
interface DeleteStackCategoryRequest {
  id: string; // UUID path parameter
}
```

**Response Schema:**
```typescript
interface DeleteStackCategoryResponse {
  success: true;
  data: { message: string };
}
```

**Example Request:**
```http
DELETE /api/v1/stackCategories/550e8400-e29b-41d4-a716-446655440102
Authorization: Bearer <token>
```

**Example Response (200):**
```json
{
  "success": true,
  "data": { "message": "Stack category deleted successfully" }
}
```

**Example Response (409 - has stacks):**
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

List all stacks.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| categoryId | uuid | - | Filter by category |
| search | string | - | Search by name |

**Request Schema:**
```typescript
interface GetStacksRequest {
  categoryId?: string;
  search?: string;
}
```

**Response Schema:**
```typescript
interface GetStacksResponse {
  success: true;
  data: StackWithDetails[];
}
```

**Example Request:**
```http
GET /api/v1/stacks?categoryId=550e8400-e29b-41d4-a716-446655440100
Authorization: Bearer <token>
```

**Example Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440030",
      "name": "React",
      "categoryId": "550e8400-e29b-41d4-a716-446655440100",
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

Create a new stack.

**Request Schema:**
```typescript
interface CreateStackRequest {
  name: string;      // Required
  categoryId: string; // Required, UUID
}
```

**Response Schema:**
```typescript
interface CreateStackResponse {
  success: true;
  data: Stack;
}
```

**Example Request:**
```http
POST /api/v1/stacks
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Vue.js",
  "categoryId": "550e8400-e29b-41d4-a716-446655440100"
}
```

**Example Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440032",
    "name": "Vue.js",
    "categoryId": "550e8400-e29b-41d4-a716-446655440100",
    "createdAt": "2024-03-15T09:00:00Z"
  }
}
```

---

### PUT /stacks/:id

Update a stack.

**Request Schema:**
```typescript
interface UpdateStackRequest {
  name?: string;
  categoryId?: string;
}
```

**Response Schema:**
```typescript
interface UpdateStackResponse {
  success: true;
  data: Stack;
}
```

**Example Request:**
```http
PUT /api/v1/stacks/550e8400-e29b-41d4-a716-446655440032
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Vue.js 3",
  "categoryId": "550e8400-e29b-41d4-a716-446655440100"
}
```

**Example Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440032",
    "name": "Vue.js 3",
    "categoryId": "550e8400-e29b-41d4-a716-446655440100",
    "createdAt": "2024-03-15T09:00:00Z"
  }
}
```

---

### DELETE /stacks/:id

Delete a stack.

**Request Schema:**
```typescript
interface DeleteStackRequest {
  id: string; // UUID path parameter
}
```

**Response Schema:**
```typescript
interface DeleteStackResponse {
  success: true;
  data: { message: string };
}
```

**Example Request:**
```http
DELETE /api/v1/stacks/550e8400-e29b-41d4-a716-446655440032
Authorization: Bearer <token>
```

**Example Response (200):**
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

**Request Schema:**
```typescript
interface GetGeneralSenioritiesRequest {
  // No parameters
}
```

**Response Schema:**
```typescript
interface GetGeneralSenioritiesResponse {
  success: true;
  data: GeneralSeniority[];
}
```

**Example Request:**
```http
GET /api/v1/generalSeniorities
Authorization: Bearer <token>
```

**Example Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440040",
      "name": "A1",
      "level": 1,
      "description": "Estagiário",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440041",
      "name": "A2",
      "level": 2,
      "description": "Junior 1",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440042",
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

Create a new general seniority.

**Request Schema:**
```typescript
interface CreateGeneralSeniorityRequest {
  name: string;        // Required, unique
  level: number;       // Required, unique
  description?: string; // Optional
}
```

**Response Schema:**
```typescript
interface CreateGeneralSeniorityResponse {
  success: true;
  data: GeneralSeniority;
}
```

**Example Request:**
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

**Example Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440049",
    "name": "C5",
    "level": 10,
    "description": "Principal Engineer",
    "createdAt": "2024-03-15T09:00:00Z"
  }
}
```

---

### PUT /generalSeniorities/:id

Update a general seniority.

**Request Schema:**
```typescript
interface UpdateGeneralSeniorityRequest {
  name?: string;
  level?: number;
  description?: string | null;
}
```

**Response Schema:**
```typescript
interface UpdateGeneralSeniorityResponse {
  success: true;
  data: GeneralSeniority;
}
```

**Example Request:**
```http
PUT /api/v1/generalSeniorities/550e8400-e29b-41d4-a716-446655440049
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "C5",
  "level": 10,
  "description": "Distinguished Engineer"
}
```

**Example Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440049",
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

**Request Schema:**
```typescript
interface ReorderGeneralSenioritiesRequest {
  items: Array<{
    id: string;
    level: number;
  }>;
}
```

**Response Schema:**
```typescript
interface ReorderGeneralSenioritiesResponse {
  success: true;
  data: { message: string };
}
```

**Example Request:**
```http
PUT /api/v1/generalSeniorities/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    { "id": "550e8400-e29b-41d4-a716-446655440040", "level": 1 },
    { "id": "550e8400-e29b-41d4-a716-446655440041", "level": 2 },
    { "id": "550e8400-e29b-41d4-a716-446655440042", "level": 3 }
  ]
}
```

**Example Response (200):**
```json
{
  "success": true,
  "data": { "message": "Order updated successfully" }
}
```

---

### DELETE /generalSeniorities/:id

Delete a general seniority.

**Request Schema:**
```typescript
interface DeleteGeneralSeniorityRequest {
  id: string; // UUID path parameter
}
```

**Response Schema:**
```typescript
interface DeleteGeneralSeniorityResponse {
  success: true;
  data: { message: string };
}
```

**Example Request:**
```http
DELETE /api/v1/generalSeniorities/550e8400-e29b-41d4-a716-446655440049
Authorization: Bearer <token>
```

**Example Response (200):**
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

**Request Schema:**
```typescript
interface GetTeamsRequest {
  type?: ContractType;
  status?: ContractStatus;
  search?: string;
}
```

**Response Schema:**
```typescript
interface GetTeamsResponse {
  success: true;
  data: TeamView[];
}
```

**Example Request:**
```http
GET /api/v1/teams?type=staffing
Authorization: Bearer <token>
```

**Example Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "contractId": "550e8400-e29b-41d4-a716-446655440010",
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
          "professionalId": "550e8400-e29b-41d4-a716-446655440050",
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

List all factory projects.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| status | string | - | "planned", "inProgress", "finished", "paused" |
| search | string | - | Search by name, description, clientName |

**Request Schema:**
```typescript
interface GetFactoryProjectsRequest {
  status?: FactoryProjectStatus;
  search?: string;
}
```

**Response Schema:**
```typescript
interface GetFactoryProjectsResponse {
  success: true;
  data: FactoryProjectWithDetails[];
}
```

**Example Request:**
```http
GET /api/v1/factoryProjects?status=inProgress
Authorization: Bearer <token>
```

**Example Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440080",
      "name": "App Mobile Banking",
      "clientId": "550e8400-e29b-41d4-a716-446655440001",
      "client": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
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
          "id": "550e8400-e29b-41d4-a716-446655440070",
          "projectId": "550e8400-e29b-41d4-a716-446655440080",
          "professionalId": "550e8400-e29b-41d4-a716-446655440050",
          "professionalName": "Carlos Dev",
          "role": "dev",
          "stackId": "550e8400-e29b-41d4-a716-446655440033",
          "stackName": "React Native",
          "startDate": "2024-02-01",
          "endDate": "2024-08-31",
          "allocationPercentage": 100,
          "createdAt": "2024-01-20T10:00:00Z"
        }
      ]
    }
  ]
}
```

---

### GET /factoryProjects/:id

Get a single factory project with full details.

**Request Schema:**
```typescript
interface GetFactoryProjectByIdRequest {
  id: string; // UUID path parameter
}
```

**Response Schema:**
```typescript
interface GetFactoryProjectByIdResponse {
  success: true;
  data: FactoryProjectWithDetails;
}
```

**Example Request:**
```http
GET /api/v1/factoryProjects/550e8400-e29b-41d4-a716-446655440080
Authorization: Bearer <token>
```

**Example Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440080",
    "name": "App Mobile Banking",
    "clientId": "550e8400-e29b-41d4-a716-446655440001",
    "client": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
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
        "id": "550e8400-e29b-41d4-a716-446655440070",
        "projectId": "550e8400-e29b-41d4-a716-446655440080",
        "professionalId": "550e8400-e29b-41d4-a716-446655440050",
        "professional": {
          "id": "550e8400-e29b-41d4-a716-446655440050",
          "name": "Carlos Dev",
          "generalSeniority": { "id": "550e8400-e29b-41d4-a716-446655440040", "name": "B2" }
        },
        "role": "dev",
        "stackId": "550e8400-e29b-41d4-a716-446655440033",
        "stack": { "id": "550e8400-e29b-41d4-a716-446655440033", "name": "React Native" },
        "startDate": "2024-02-01",
        "endDate": "2024-08-31",
        "allocationPercentage": 100,
        "createdAt": "2024-01-20T10:00:00Z"
      }
    ]
  }
}
```

---

### POST /factoryProjects

Create a new factory project.

**Request Schema:**
```typescript
interface CreateFactoryProjectRequest {
  name: string;                  // Required
  clientId?: string;             // Optional, UUID
  description: string;           // Required
  startDate: string;             // Required, ISO 8601 date
  endDate: string;               // Required, ISO 8601 date
  status: FactoryProjectStatus;  // Required
  progressPercentage?: number;   // Optional, default 0
}
```

**Response Schema:**
```typescript
interface CreateFactoryProjectResponse {
  success: true;
  data: FactoryProject;
}
```

**Example Request:**
```http
POST /api/v1/factoryProjects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sistema ERP",
  "clientId": "550e8400-e29b-41d4-a716-446655440001",
  "description": "Sistema de gestão empresarial",
  "startDate": "2024-04-01",
  "endDate": "2024-12-31",
  "status": "planned",
  "progressPercentage": 0
}
```

**Example Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440081",
    "name": "Sistema ERP",
    "clientId": "550e8400-e29b-41d4-a716-446655440001",
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

Update a factory project.

**Request Schema:**
```typescript
interface UpdateFactoryProjectRequest {
  name?: string;
  clientId?: string | null;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: FactoryProjectStatus;
  progressPercentage?: number;
}
```

**Response Schema:**
```typescript
interface UpdateFactoryProjectResponse {
  success: true;
  data: FactoryProject;
}
```

**Example Request:**
```http
PUT /api/v1/factoryProjects/550e8400-e29b-41d4-a716-446655440081
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sistema ERP v2",
  "status": "inProgress",
  "progressPercentage": 10
}
```

**Example Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440081",
    "name": "Sistema ERP v2",
    "clientId": "550e8400-e29b-41d4-a716-446655440001",
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

Delete a factory project and all associated allocations.

**Request Schema:**
```typescript
interface DeleteFactoryProjectRequest {
  id: string; // UUID path parameter
}
```

**Response Schema:**
```typescript
interface DeleteFactoryProjectResponse {
  success: true;
  data: { message: string };
}
```

**Example Request:**
```http
DELETE /api/v1/factoryProjects/550e8400-e29b-41d4-a716-446655440081
Authorization: Bearer <token>
```

**Example Response (200):**
```json
{
  "success": true,
  "data": { "message": "Factory project and allocations deleted successfully" }
}
```

---

## 11. Factory Allocations

### POST /factoryAllocations

Create a factory allocation.

**Request Schema:**
```typescript
interface CreateFactoryAllocationRequest {
  projectId: string;             // Required, UUID
  professionalId: string;        // Required, UUID
  role: FactoryRole;             // Required
  stackId: string;               // Required, UUID
  startDate: string;             // Required, ISO 8601 date
  endDate: string;               // Required, ISO 8601 date
  allocationPercentage: number;  // Required, 1-100
}
```

**Response Schema:**
```typescript
interface CreateFactoryAllocationResponse {
  success: true;
  data: FactoryAllocation;
}
```

**Example Request:**
```http
POST /api/v1/factoryAllocations
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "550e8400-e29b-41d4-a716-446655440080",
  "professionalId": "550e8400-e29b-41d4-a716-446655440050",
  "role": "dev",
  "stackId": "550e8400-e29b-41d4-a716-446655440033",
  "startDate": "2024-04-01",
  "endDate": "2024-12-31",
  "allocationPercentage": 100
}
```

**Example Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440071",
    "projectId": "550e8400-e29b-41d4-a716-446655440080",
    "professionalId": "550e8400-e29b-41d4-a716-446655440050",
    "role": "dev",
    "stackId": "550e8400-e29b-41d4-a716-446655440033",
    "startDate": "2024-04-01",
    "endDate": "2024-12-31",
    "allocationPercentage": 100,
    "createdAt": "2024-03-15T09:00:00Z"
  }
}
```

---

### PUT /factoryAllocations/:id

Update a factory allocation.

**Request Schema:**
```typescript
interface UpdateFactoryAllocationRequest {
  role?: FactoryRole;
  stackId?: string;
  startDate?: string;
  endDate?: string;
  allocationPercentage?: number;
}
```

**Response Schema:**
```typescript
interface UpdateFactoryAllocationResponse {
  success: true;
  data: FactoryAllocation;
}
```

**Example Request:**
```http
PUT /api/v1/factoryAllocations/550e8400-e29b-41d4-a716-446655440071
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "techLead",
  "allocationPercentage": 50,
  "endDate": "2024-10-31"
}
```

**Example Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440071",
    "projectId": "550e8400-e29b-41d4-a716-446655440080",
    "professionalId": "550e8400-e29b-41d4-a716-446655440050",
    "role": "techLead",
    "stackId": "550e8400-e29b-41d4-a716-446655440033",
    "startDate": "2024-04-01",
    "endDate": "2024-10-31",
    "allocationPercentage": 50,
    "createdAt": "2024-03-15T09:00:00Z"
  }
}
```

---

### DELETE /factoryAllocations/:id

Delete a factory allocation.

**Request Schema:**
```typescript
interface DeleteFactoryAllocationRequest {
  id: string; // UUID path parameter
}
```

**Response Schema:**
```typescript
interface DeleteFactoryAllocationResponse {
  success: true;
  data: { message: string };
}
```

**Example Request:**
```http
DELETE /api/v1/factoryAllocations/550e8400-e29b-41d4-a716-446655440071
Authorization: Bearer <token>
```

**Example Response (200):**
```json
{
  "success": true,
  "data": { "message": "Factory allocation removed successfully" }
}
```

---

## 12. Dashboard (Staffing)

### GET /dashboard/metrics

Get staffing dashboard metrics.

**Request Schema:**
```typescript
interface GetDashboardMetricsRequest {
  // No parameters
}
```

**Response Schema:**
```typescript
interface GetDashboardMetricsResponse {
  success: true;
  data: DashboardMetrics;
}
```

**Example Request:**
```http
GET /api/v1/dashboard/metrics
Authorization: Bearer <token>
```

**Example Response (200):**
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

Get occupancy forecast for 30, 60, and 90 days.

**Request Schema:**
```typescript
interface GetOccupancyForecastRequest {
  // No parameters
}
```

**Response Schema:**
```typescript
interface GetOccupancyForecastResponse {
  success: true;
  data: OccupancyForecast[];
}
```

**Example Request:**
```http
GET /api/v1/dashboard/occupancyForecast
Authorization: Bearer <token>
```

**Example Response (200):**
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
          "professionalId": "550e8400-e29b-41d4-a716-446655440050",
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

Get allocation timeline for Gantt chart.

**Request Schema:**
```typescript
interface GetAllocationTimelineRequest {
  // No parameters
}
```

**Response Schema:**
```typescript
interface GetAllocationTimelineResponse {
  success: true;
  data: AllocationTimelineEntry[];
}
```

**Example Request:**
```http
GET /api/v1/dashboard/allocationTimeline
Authorization: Bearer <token>
```

**Example Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440060",
      "professionalId": "550e8400-e29b-41d4-a716-446655440050",
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

Get stack distribution metrics.

**Request Schema:**
```typescript
interface GetStackDistributionRequest {
  // No parameters
}
```

**Response Schema:**
```typescript
interface GetStackDistributionResponse {
  success: true;
  data: StackDistribution[];
}
```

**Example Request:**
```http
GET /api/v1/dashboard/stackDistribution
Authorization: Bearer <token>
```

**Example Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "stackId": "550e8400-e29b-41d4-a716-446655440030",
      "stackName": "React",
      "categoryId": "550e8400-e29b-41d4-a716-446655440100",
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

Get factory dashboard metrics.

**Request Schema:**
```typescript
interface GetFactoryMetricsRequest {
  // No parameters
}
```

**Response Schema:**
```typescript
interface GetFactoryMetricsResponse {
  success: true;
  data: FactoryMetrics;
}
```

**Example Request:**
```http
GET /api/v1/factory/metrics
Authorization: Bearer <token>
```

**Example Response (200):**
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

Get factory idle forecasts for 30, 60, and 90 days.

**Request Schema:**
```typescript
interface GetFactoryIdleForecastsRequest {
  // No parameters
}
```

**Response Schema:**
```typescript
interface GetFactoryIdleForecastsResponse {
  success: true;
  data: FactoryIdleForecast[];
}
```

**Example Request:**
```http
GET /api/v1/factory/idleForecasts
Authorization: Bearer <token>
```

**Example Response (200):**
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
          "professionalId": "550e8400-e29b-41d4-a716-446655440050",
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

Get Gantt chart data for factory projects and professionals.

**Request Schema:**
```typescript
interface GetFactoryGanttRequest {
  // No parameters
}
```

**Response Schema:**
```typescript
interface GetFactoryGanttResponse {
  success: true;
  data: FactoryGanttEntry[];
}
```

**Example Request:**
```http
GET /api/v1/factory/gantt
Authorization: Bearer <token>
```

**Example Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440080",
      "type": "project",
      "name": "App Mobile Banking",
      "startDate": "2024-02-01",
      "endDate": "2024-08-31",
      "progress": 45,
      "status": "inProgress"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440070",
      "type": "professional",
      "name": "Carlos Dev",
      "projectId": "550e8400-e29b-41d4-a716-446655440080",
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

# Business Rules

## Professional Status Derivation

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

## Position Status Sync

When an allocation is created/deleted, the position status should be updated:
- Create allocation → position.status = "filled"
- Delete allocation → position.status = "open"

## Contract Status Computation

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

## Allocation Conflict Validation

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

# Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 422 | Request validation failed |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Operation conflicts with existing data |
| ALLOCATION_CONFLICT | 409 | Allocation exceeds 100% capacity |
| UNAUTHORIZED | 401 | Invalid or missing authentication |
| FORBIDDEN | 403 | Insufficient permissions |
