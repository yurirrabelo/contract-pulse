import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Client,
  Contract,
  Stack,
  Position,
  Professional,
  Allocation,
  ContractWithDetails,
  DashboardMetrics,
  ExpiringContractsGroup,
  StackDistribution,
  ClientSummary,
  AllocationTimelineEntry,
  TeamView,
  OccupancyForecast,
  ProfessionalIdleForecast,
} from '@/types';
import { saveToStorage, loadFromStorage, generateId, getContractStatus, getDaysUntil } from '@/lib/storage';
import {
  seedClients,
  seedContracts,
  seedStacks,
  seedPositions,
  seedProfessionals,
  seedAllocations,
} from '@/data/seedData';

interface DataContextType {
  // Data
  clients: Client[];
  contracts: Contract[];
  stacks: Stack[];
  positions: Position[];
  professionals: Professional[];
  allocations: Allocation[];

  // Computed
  contractsWithDetails: ContractWithDetails[];
  dashboardMetrics: DashboardMetrics;
  expiringContractsGroups: ExpiringContractsGroup[];
  stackDistributions: StackDistribution[];
  clientSummaries: ClientSummary[];
  allocationTimeline: AllocationTimelineEntry[];
  teamViews: TeamView[];
  occupancyForecasts: OccupancyForecast[];

  // CRUD Operations
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addContract: (contract: Omit<Contract, 'id' | 'createdAt'>) => Contract;
  updateContract: (id: string, contract: Partial<Contract>) => void;
  deleteContract: (id: string) => void;

  addStack: (stack: Omit<Stack, 'id' | 'createdAt'>) => Stack;
  updateStack: (id: string, stack: Partial<Stack>) => void;
  deleteStack: (id: string) => void;

  addPosition: (position: Omit<Position, 'id' | 'createdAt'>) => Position;
  updatePosition: (id: string, position: Partial<Position>) => void;
  deletePosition: (id: string) => void;

  addProfessional: (professional: Omit<Professional, 'id' | 'createdAt'>) => Professional;
  updateProfessional: (id: string, professional: Partial<Professional>) => void;
  deleteProfessional: (id: string) => void;

  addAllocation: (allocation: Omit<Allocation, 'id' | 'createdAt'>) => Allocation;
  updateAllocation: (id: string, allocation: Partial<Allocation>) => void;
  deleteAllocation: (id: string) => void;

  // Helpers
  getClientById: (id: string) => Client | undefined;
  getContractById: (id: string) => Contract | undefined;
  getStackById: (id: string) => Stack | undefined;
  getPositionById: (id: string) => Position | undefined;
  getProfessionalById: (id: string) => Professional | undefined;
  getPositionsByContract: (contractId: string) => Position[];
  getAllocationsByPosition: (positionId: string) => Allocation[];
  getProfessionalAllocation: (professionalId: string) => Allocation | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);

  // Load data from storage on mount
  useEffect(() => {
    setClients(loadFromStorage('clients', seedClients));
    setContracts(loadFromStorage('contracts', seedContracts));
    setStacks(loadFromStorage('stacks', seedStacks));
    setPositions(loadFromStorage('positions', seedPositions));
    setProfessionals(loadFromStorage('professionals', seedProfessionals));
    setAllocations(loadFromStorage('allocations', seedAllocations));
  }, []);

  // Persist to storage on changes
  useEffect(() => { if (clients.length) saveToStorage('clients', clients); }, [clients]);
  useEffect(() => { if (contracts.length) saveToStorage('contracts', contracts); }, [contracts]);
  useEffect(() => { if (stacks.length) saveToStorage('stacks', stacks); }, [stacks]);
  useEffect(() => { if (positions.length) saveToStorage('positions', positions); }, [positions]);
  useEffect(() => { if (professionals.length) saveToStorage('professionals', professionals); }, [professionals]);
  useEffect(() => { if (allocations.length) saveToStorage('allocations', allocations); }, [allocations]);

  // Helpers
  const getClientById = useCallback((id: string) => clients.find(c => c.id === id), [clients]);
  const getContractById = useCallback((id: string) => contracts.find(c => c.id === id), [contracts]);
  const getStackById = useCallback((id: string) => stacks.find(s => s.id === id), [stacks]);
  const getPositionById = useCallback((id: string) => positions.find(p => p.id === id), [positions]);
  const getProfessionalById = useCallback((id: string) => professionals.find(p => p.id === id), [professionals]);
  const getPositionsByContract = useCallback((contractId: string) => positions.filter(p => p.contractId === contractId), [positions]);
  const getAllocationsByPosition = useCallback((positionId: string) => allocations.filter(a => a.positionId === positionId), [allocations]);
  const getProfessionalAllocation = useCallback((professionalId: string) => allocations.find(a => a.professionalId === professionalId && !a.endDate), [allocations]);

  // Computed: Contracts with details
  const contractsWithDetails = useMemo<ContractWithDetails[]>(() => {
    return contracts.map(contract => {
      const client = getClientById(contract.clientId);
      const contractPositions = getPositionsByContract(contract.id);
      const status = getContractStatus(contract.endDate);
      const daysUntilExpiration = getDaysUntil(contract.endDate);

      return {
        ...contract,
        client: client!,
        positions: contractPositions,
        status,
        daysUntilExpiration,
      };
    }).filter(c => c.client);
  }, [contracts, getClientById, getPositionsByContract]);

  // Computed: Dashboard metrics
  const dashboardMetrics = useMemo<DashboardMetrics>(() => {
    const activeContracts = contractsWithDetails.filter(c => c.status !== 'expired');
    const filledPositions = positions.filter(p => p.status === 'filled');
    const openPositions = positions.filter(p => p.status === 'open');

    const revenueAtRisk30 = contractsWithDetails
      .filter(c => c.status === 'expiring_30')
      .reduce((sum, c) => sum + c.monthlyValue, 0);

    const revenueAtRisk60 = contractsWithDetails
      .filter(c => c.status === 'expiring_30' || c.status === 'expiring_60')
      .reduce((sum, c) => sum + c.monthlyValue, 0);

    const revenueAtRisk90 = contractsWithDetails
      .filter(c => ['expiring_30', 'expiring_60', 'expiring_90'].includes(c.status))
      .reduce((sum, c) => sum + c.monthlyValue, 0);

    const monthlyRevenue = activeContracts.reduce((sum, c) => sum + c.monthlyValue, 0);

    return {
      totalContracts: contracts.length,
      activeContracts: activeContracts.length,
      totalClients: clients.length,
      totalProfessionals: professionals.length,
      totalPositions: positions.length,
      filledPositions: filledPositions.length,
      openPositions: openPositions.length,
      monthlyRevenue,
      revenueAtRisk30,
      revenueAtRisk60,
      revenueAtRisk90,
    };
  }, [contractsWithDetails, contracts, clients, professionals, positions]);

  // Computed: Expiring contracts groups
  const expiringContractsGroups = useMemo<ExpiringContractsGroup[]>(() => {
    const groups: ExpiringContractsGroup[] = [];

    [30, 60, 90].forEach((days) => {
      const contractsInGroup = contractsWithDetails.filter(c => {
        if (days === 30) return c.status === 'expiring_30';
        if (days === 60) return c.status === 'expiring_30' || c.status === 'expiring_60';
        return ['expiring_30', 'expiring_60', 'expiring_90'].includes(c.status);
      });

      const clientIds = new Set(contractsInGroup.map(c => c.clientId));
      const positionIds = contractsInGroup.flatMap(c => c.positions.map(p => p.id));
      const professionalIds = new Set(
        allocations
          .filter(a => positionIds.includes(a.positionId) && !a.endDate)
          .map(a => a.professionalId)
      );

      groups.push({
        days: days as 30 | 60 | 90,
        contracts: contractsInGroup,
        clientsAffected: clientIds.size,
        professionalsInvolved: professionalIds.size,
        totalMonthlyValue: contractsInGroup.reduce((sum, c) => sum + c.monthlyValue, 0),
      });
    });

    return groups;
  }, [contractsWithDetails, allocations]);

  // Computed: Stack distributions
  const stackDistributions = useMemo<StackDistribution[]>(() => {
    return stacks.map(stack => {
      const stackPositions = positions.filter(p => p.stackId === stack.id);
      const filledPositions = stackPositions.filter(p => p.status === 'filled');
      const professionalCount = professionals.filter(
        p => p.primaryStackId === stack.id || p.secondaryStackIds.includes(stack.id)
      ).length;

      return {
        stackId: stack.id,
        stackName: stack.name,
        category: stack.category,
        professionalCount,
        positionCount: stackPositions.length,
        filledPositions: filledPositions.length,
      };
    });
  }, [stacks, positions, professionals]);

  // Computed: Client summaries
  const clientSummaries = useMemo<ClientSummary[]>(() => {
    return clients.map(client => {
      const clientContracts = contractsWithDetails.filter(
        c => c.clientId === client.id && c.status !== 'expired'
      );
      const clientPositions = clientContracts.flatMap(c => c.positions);
      const filledPositions = clientPositions.filter(p => p.status === 'filled');
      const totalMonthlyValue = clientContracts.reduce((sum, c) => sum + c.monthlyValue, 0);

      return {
        client,
        activeContracts: clientContracts.length,
        totalPositions: clientPositions.length,
        filledPositions: filledPositions.length,
        totalMonthlyValue,
      };
    });
  }, [clients, contractsWithDetails]);

  // Computed: Allocation Timeline
  const allocationTimeline = useMemo<AllocationTimelineEntry[]>(() => {
    return allocations.map(allocation => {
      const professional = getProfessionalById(allocation.professionalId);
      const position = getPositionById(allocation.positionId);
      const contract = position ? getContractById(position.contractId) : null;
      const client = contract ? getClientById(contract.clientId) : null;
      const stack = position ? getStackById(position.stackId) : null;

      if (!professional || !position || !contract || !client || !stack) return null;

      return {
        id: allocation.id,
        professionalId: allocation.professionalId,
        professionalName: professional.name,
        positionTitle: position.title,
        stackName: stack.name,
        stackCategory: stack.category,
        clientName: client.name,
        projectName: contract.projectName || contract.contractNumber,
        contractType: contract.type,
        startDate: allocation.startDate,
        endDate: allocation.endDate || position.endDate,
        allocationPercentage: allocation.allocationPercentage,
      };
    }).filter(Boolean) as AllocationTimelineEntry[];
  }, [allocations, getProfessionalById, getPositionById, getContractById, getClientById, getStackById]);

  // Computed: Team Views
  const teamViews = useMemo<TeamView[]>(() => {
    return contractsWithDetails.map(contract => {
      const contractAllocations = allocations.filter(a => {
        const position = getPositionById(a.positionId);
        return position?.contractId === contract.id;
      });

      const members = contractAllocations.map(allocation => {
        const professional = getProfessionalById(allocation.professionalId);
        const position = getPositionById(allocation.positionId);
        const stack = position ? getStackById(position.stackId) : null;

        if (!professional || !position || !stack) return null;

        return {
          professionalId: allocation.professionalId,
          professionalName: professional.name,
          positionTitle: position.title,
          stackName: stack.name,
          stackCategory: stack.category,
          startDate: allocation.startDate,
          endDate: allocation.endDate || position.endDate,
          allocationPercentage: allocation.allocationPercentage,
        };
      }).filter(Boolean) as TeamView['members'];

      return {
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        projectName: contract.projectName || contract.contractNumber,
        clientName: contract.client.name,
        contractType: contract.type,
        startDate: contract.startDate,
        endDate: contract.endDate,
        status: contract.status,
        daysUntilExpiration: contract.daysUntilExpiration,
        members,
        totalPositions: contract.positions.length,
        filledPositions: contract.positions.filter(p => p.status === 'filled').length,
      };
    });
  }, [contractsWithDetails, allocations, getProfessionalById, getPositionById, getStackById]);

  // Computed: Occupancy Forecasts
  const occupancyForecasts = useMemo<OccupancyForecast[]>(() => {
    const today = new Date();
    const forecasts: OccupancyForecast[] = [];

    [30, 60, 90].forEach((days) => {
      const cutoffDate = new Date(today);
      cutoffDate.setDate(cutoffDate.getDate() + days);

      // Find allocations ending within this period
      const endingAllocations = allocations.filter(a => {
        if (!a.endDate) {
          // Check position end date
          const position = getPositionById(a.positionId);
          if (!position) return false;
          const endDate = new Date(position.endDate);
          return endDate <= cutoffDate && endDate >= today;
        }
        const endDate = new Date(a.endDate);
        return endDate <= cutoffDate && endDate >= today;
      });

      const predictedIdleProfessionals: ProfessionalIdleForecast[] = endingAllocations.map(a => {
        const professional = getProfessionalById(a.professionalId);
        const position = getPositionById(a.positionId);
        const contract = position ? getContractById(position.contractId) : null;
        const client = contract ? getClientById(contract.clientId) : null;
        const stack = professional ? getStackById(professional.primaryStackId) : null;
        
        const endDate = a.endDate || (position?.endDate || '');
        const daysUntilIdle = Math.ceil((new Date(endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        return {
          professionalId: a.professionalId,
          professionalName: professional?.name || '',
          stackName: stack?.name || '',
          currentClientName: client?.name || '',
          currentProjectName: contract?.projectName || contract?.contractNumber || '',
          allocationEndDate: endDate,
          daysUntilIdle,
        };
      }).filter(p => p.professionalName);

      // Remove duplicates (same professional might have multiple allocations)
      const uniqueProfessionals = Array.from(
        new Map(predictedIdleProfessionals.map(p => [p.professionalId, p])).values()
      );

      // Sort by days until idle
      uniqueProfessionals.sort((a, b) => a.daysUntilIdle - b.daysUntilIdle);

      // Calculate current allocated count
      const currentAllocated = new Set(
        allocations
          .filter(a => {
            const endDate = a.endDate || getPositionById(a.positionId)?.endDate;
            return endDate && new Date(endDate) >= today;
          })
          .map(a => a.professionalId)
      ).size;

      const predictedIdle = uniqueProfessionals.length;
      const occupancyRate = professionals.length > 0 
        ? ((currentAllocated - predictedIdle) / professionals.length) * 100 
        : 0;

      forecasts.push({
        period: days as 30 | 60 | 90,
        currentAllocated,
        predictedIdle,
        predictedIdleProfessionals: uniqueProfessionals,
        occupancyRate: Math.max(0, occupancyRate),
      });
    });

    return forecasts;
  }, [allocations, professionals, getProfessionalById, getPositionById, getContractById, getClientById, getStackById]);

  // CRUD Operations
  const addClient = useCallback((client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...client,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  }, []);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  }, []);

  const addContract = useCallback((contract: Omit<Contract, 'id' | 'createdAt'>) => {
    const newContract: Contract = {
      ...contract,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setContracts(prev => [...prev, newContract]);
    return newContract;
  }, []);

  const updateContract = useCallback((id: string, updates: Partial<Contract>) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteContract = useCallback((id: string) => {
    setContracts(prev => prev.filter(c => c.id !== id));
  }, []);

  const addStack = useCallback((stack: Omit<Stack, 'id' | 'createdAt'>) => {
    const newStack: Stack = {
      ...stack,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setStacks(prev => [...prev, newStack]);
    return newStack;
  }, []);

  const updateStack = useCallback((id: string, updates: Partial<Stack>) => {
    setStacks(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteStack = useCallback((id: string) => {
    setStacks(prev => prev.filter(s => s.id !== id));
  }, []);

  const addPosition = useCallback((position: Omit<Position, 'id' | 'createdAt'>) => {
    const newPosition: Position = {
      ...position,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setPositions(prev => [...prev, newPosition]);
    return newPosition;
  }, []);

  const updatePosition = useCallback((id: string, updates: Partial<Position>) => {
    setPositions(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deletePosition = useCallback((id: string) => {
    setPositions(prev => prev.filter(p => p.id !== id));
  }, []);

  const addProfessional = useCallback((professional: Omit<Professional, 'id' | 'createdAt'>) => {
    const newProfessional: Professional = {
      ...professional,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setProfessionals(prev => [...prev, newProfessional]);
    return newProfessional;
  }, []);

  const updateProfessional = useCallback((id: string, updates: Partial<Professional>) => {
    setProfessionals(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProfessional = useCallback((id: string) => {
    setProfessionals(prev => prev.filter(p => p.id !== id));
  }, []);

  const addAllocation = useCallback((allocation: Omit<Allocation, 'id' | 'createdAt'>) => {
    const newAllocation: Allocation = {
      ...allocation,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setAllocations(prev => [...prev, newAllocation]);
    return newAllocation;
  }, []);

  const updateAllocation = useCallback((id: string, updates: Partial<Allocation>) => {
    setAllocations(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const deleteAllocation = useCallback((id: string) => {
    setAllocations(prev => prev.filter(a => a.id !== id));
  }, []);

  return (
    <DataContext.Provider
      value={{
        clients,
        contracts,
        stacks,
        positions,
        professionals,
        allocations,
        contractsWithDetails,
        dashboardMetrics,
        expiringContractsGroups,
        stackDistributions,
        clientSummaries,
        allocationTimeline,
        teamViews,
        occupancyForecasts,
        addClient,
        updateClient,
        deleteClient,
        addContract,
        updateContract,
        deleteContract,
        addStack,
        updateStack,
        deleteStack,
        addPosition,
        updatePosition,
        deletePosition,
        addProfessional,
        updateProfessional,
        deleteProfessional,
        addAllocation,
        updateAllocation,
        deleteAllocation,
        getClientById,
        getContractById,
        getStackById,
        getPositionById,
        getProfessionalById,
        getPositionsByContract,
        getAllocationsByPosition,
        getProfessionalAllocation,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}