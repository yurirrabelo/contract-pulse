// Core entity types for contract management system

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  cnpj: string;
  contact: string;
  createdAt: string;
}

export type ContractType = 'staffing' | 'fabrica';

export interface Contract {
  id: string;
  clientId: string;
  contractNumber: string;
  projectName?: string;
  type: ContractType;
  startDate: string;
  endDate: string;
  monthlyValue: number;
  createdAt: string;
}

// ============================================
// STACK CATEGORY (Dynamic)
// ============================================

export interface StackCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

// ============================================
// SENIORITY LEVELS
// ============================================

export interface Seniority {
  id: string;
  name: string;
  level: number; // For ordering (1 = Junior, 2 = Pleno, etc.)
  categoryId: string; // Category-specific seniorities
  description?: string;
  createdAt: string;
}

// ============================================
// STACKS
// ============================================

export interface Stack {
  id: string;
  name: string;
  categoryId: string; // Reference to StackCategory
  createdAt: string;
}

export type PositionStatus = 'open' | 'filled';

export interface Position {
  id: string;
  contractId: string;
  title: string;
  stackId: string;
  seniorityId?: string; // Required seniority for position
  status: PositionStatus;
  startDate: string;
  endDate: string;
  allocationPercentage: number;
  createdAt: string;
}

// ============================================
// PROFESSIONAL
// ============================================

export type ProfessionalWorkMode = 'allocation' | 'factory' | 'both';
export type ProfessionalStatus = 'allocated' | 'idle' | 'partial' | 'vacation' | 'notice';

// General Seniority (A1-C5 system)
export interface GeneralSeniority {
  id: string;
  name: string;
  level: number; // For ordering
  description?: string;
  createdAt: string;
}

// Experience per stack (simplified - only stack and years)
export interface ProfessionalStackExperience {
  stackId: string;
  yearsExperience: number; // Years in this specific stack (< 2 = 1)
}

export interface Professional {
  id: string;
  name: string;
  email?: string;
  generalSeniorityId?: string; // Reference to GeneralSeniority (A1, B2, etc.)
  stackExperiences: ProfessionalStackExperience[]; // Multiple stacks with experience time
  status: ProfessionalStatus;
  workMode: ProfessionalWorkMode;
  leaderId?: string; // Reference to another Professional
  totalYearsExperience?: number; // Total years in the field
  createdAt: string;
}

export interface Allocation {
  id: string;
  professionalId: string;
  positionId: string;
  startDate: string;
  endDate: string | null;
  allocationPercentage: number;
  createdAt: string;
}

// ============================================
// FACTORY PROJECT TYPES (Fábrica de Software)
// ============================================

export type FactoryProjectStatus = 'planned' | 'in_progress' | 'finished' | 'paused';

export interface FactoryProject {
  id: string;
  name: string;
  clientId?: string;
  description: string;
  startDate: string;
  endDate: string;
  status: FactoryProjectStatus;
  progressPercentage: number;
  createdAt: string;
}

export type FactoryRole = 'dev' | 'qa' | 'po' | 'pm' | 'tech_lead' | 'architect' | 'scrum_master' | 'ux' | 'other';

export interface FactoryAllocation {
  id: string;
  projectId: string;
  professionalId: string;
  role: FactoryRole;
  stackId: string;
  startDate: string;
  endDate: string;
  allocationPercentage: number;
  createdAt: string;
}

// ============================================
// COMPUTED / DERIVED TYPES
// ============================================

export type ContractStatus = 'active' | 'expiring_30' | 'expiring_60' | 'expiring_90' | 'expired';

export interface ContractWithDetails extends Contract {
  client: Client;
  positions: Position[];
  status: ContractStatus;
  daysUntilExpiration: number;
}

export interface DashboardMetrics {
  totalContracts: number;
  activeContracts: number;
  totalClients: number;
  totalProfessionals: number;
  totalPositions: number;
  filledPositions: number;
  openPositions: number;
  monthlyRevenue: number;
  revenueAtRisk30: number;
  revenueAtRisk60: number;
  revenueAtRisk90: number;
}

export interface ExpiringContractsGroup {
  days: 30 | 60 | 90;
  contracts: ContractWithDetails[];
  clientsAffected: number;
  professionalsInvolved: number;
  totalMonthlyValue: number;
}

export interface StackDistribution {
  stackId: string;
  stackName: string;
  categoryId: string;
  categoryName: string;
  professionalCount: number;
  positionCount: number;
  filledPositions: number;
}

export interface ClientSummary {
  client: Client;
  activeContracts: number;
  totalPositions: number;
  filledPositions: number;
  totalMonthlyValue: number;
}

// Timeline/Gantt related types
export interface AllocationTimelineEntry {
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

export interface TeamView {
  contractId: string;
  contractNumber: string;
  projectName: string;
  clientName: string;
  contractType: ContractType;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  daysUntilExpiration: number;
  members: TeamMember[];
  totalPositions: number;
  filledPositions: number;
}

export interface TeamMember {
  professionalId: string;
  professionalName: string;
  positionTitle: string;
  stackName: string;
  categoryName: string;
  startDate: string;
  endDate: string;
  allocationPercentage: number;
}

// Occupancy forecast types
export interface OccupancyForecast {
  period: 30 | 60 | 90;
  currentAllocated: number;
  predictedIdle: number;
  predictedIdleProfessionals: ProfessionalIdleForecast[];
  occupancyRate: number;
}

export interface ProfessionalIdleForecast {
  professionalId: string;
  professionalName: string;
  stackName: string;
  currentClientName: string;
  currentProjectName: string;
  allocationEndDate: string;
  daysUntilIdle: number;
}

// ============================================
// FACTORY DASHBOARD TYPES
// ============================================

export interface FactoryProjectWithDetails extends FactoryProject {
  client?: Client;
  allocations: FactoryAllocationWithDetails[];
  totalMembers: number;
  daysRemaining: number;
  daysElapsed: number;
  totalDays: number;
  calculatedProgress: number;
}

export interface FactoryAllocationWithDetails extends FactoryAllocation {
  professional: Professional;
  stack: Stack;
}

export interface FactoryDashboardMetrics {
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

export interface FactoryIdleForecast {
  period: 30 | 60 | 90;
  currentAllocated: number;
  predictedIdle: number;
  idleProfessionals: FactoryIdleProfessional[];
  occupancyRate: number;
}

export interface FactoryIdleProfessional {
  professionalId: string;
  professionalName: string;
  stackName: string;
  currentProjectName: string;
  allocationEndDate: string;
  daysUntilIdle: number;
}

export interface FactoryGanttEntry {
  id: string;
  type: 'project' | 'professional';
  name: string;
  projectId?: string;
  projectName?: string;
  role?: string;
  stackName?: string;
  startDate: string;
  endDate: string;
  progress?: number;
  status?: FactoryProjectStatus;
}

// ============================================
// LEADER METRICS
// ============================================

export interface LeaderMetrics {
  leaderId: string;
  leaderName: string;
  totalProfessionals: number;
  allocatedProfessionals: number;
  idleProfessionals: number;
  professionals: Professional[];
}
