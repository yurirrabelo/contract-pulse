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

export interface Contract {
  id: string;
  clientId: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  monthlyValue: number;
  createdAt: string;
}

export type StackCategory = 'development' | 'qa' | 'management';

export interface Stack {
  id: string;
  name: string;
  category: StackCategory;
  createdAt: string;
}

export type PositionStatus = 'open' | 'filled';

export interface Position {
  id: string;
  contractId: string;
  title: string;
  stackId: string;
  status: PositionStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface Professional {
  id: string;
  name: string;
  primaryStackId: string;
  secondaryStackIds: string[];
  createdAt: string;
}

export interface Allocation {
  id: string;
  professionalId: string;
  positionId: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

// Computed/derived types for dashboard
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
  category: StackCategory;
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
