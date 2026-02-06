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
  FactoryProject,
  FactoryAllocation,
  FactoryProjectWithDetails,
  FactoryAllocationWithDetails,
  FactoryDashboardMetrics,
  FactoryIdleForecast,
  FactoryIdleProfessional,
  FactoryGanttEntry,
} from '@/types';
import { saveToStorage, loadFromStorage, generateId, getContractStatus, getDaysUntil } from '@/lib/storage';
import {
  seedClients,
  seedContracts,
  seedStacks,
  seedPositions,
  seedProfessionals,
  seedAllocations,
  seedFactoryProjects,
  seedFactoryAllocations,
} from '@/data/seedData';

interface DataContextType {
  // Data
  clients: Client[];
  contracts: Contract[];
  stacks: Stack[];
  positions: Position[];
  professionals: Professional[];
  allocations: Allocation[];
  factoryProjects: FactoryProject[];
  factoryAllocations: FactoryAllocation[];

  // Computed
  contractsWithDetails: ContractWithDetails[];
  dashboardMetrics: DashboardMetrics;
  expiringContractsGroups: ExpiringContractsGroup[];
  stackDistributions: StackDistribution[];
  clientSummaries: ClientSummary[];
  allocationTimeline: AllocationTimelineEntry[];
  teamViews: TeamView[];
  occupancyForecasts: OccupancyForecast[];
  
  // Factory computed
  factoryProjectsWithDetails: FactoryProjectWithDetails[];
  factoryMetrics: FactoryDashboardMetrics;
  factoryIdleForecasts: FactoryIdleForecast[];
  factoryGanttData: FactoryGanttEntry[];

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

  // Factory CRUD
  addFactoryProject: (project: Omit<FactoryProject, 'id' | 'createdAt'>) => FactoryProject;
  updateFactoryProject: (id: string, project: Partial<FactoryProject>) => void;
  deleteFactoryProject: (id: string) => void;

  addFactoryAllocation: (allocation: Omit<FactoryAllocation, 'id' | 'createdAt'>) => FactoryAllocation;
  updateFactoryAllocation: (id: string, allocation: Partial<FactoryAllocation>) => void;
  deleteFactoryAllocation: (id: string) => void;

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
  const [factoryProjects, setFactoryProjects] = useState<FactoryProject[]>([]);
  const [factoryAllocations, setFactoryAllocations] = useState<FactoryAllocation[]>([]);

  // Load data from storage on mount
  useEffect(() => {
    setClients(loadFromStorage('clients', seedClients));
    setContracts(loadFromStorage('contracts', seedContracts));
    setStacks(loadFromStorage('stacks', seedStacks));
    setPositions(loadFromStorage('positions', seedPositions));
    setProfessionals(loadFromStorage('professionals', seedProfessionals));
    setAllocations(loadFromStorage('allocations', seedAllocations));
    setFactoryProjects(loadFromStorage('factoryProjects', seedFactoryProjects));
    setFactoryAllocations(loadFromStorage('factoryAllocations', seedFactoryAllocations));
  }, []);

  // Persist to storage on changes
  useEffect(() => { if (clients.length) saveToStorage('clients', clients); }, [clients]);
  useEffect(() => { if (contracts.length) saveToStorage('contracts', contracts); }, [contracts]);
  useEffect(() => { if (stacks.length) saveToStorage('stacks', stacks); }, [stacks]);
  useEffect(() => { if (positions.length) saveToStorage('positions', positions); }, [positions]);
  useEffect(() => { if (professionals.length) saveToStorage('professionals', professionals); }, [professionals]);
  useEffect(() => { if (allocations.length) saveToStorage('allocations', allocations); }, [allocations]);
  useEffect(() => { if (factoryProjects.length) saveToStorage('factoryProjects', factoryProjects); }, [factoryProjects]);
  useEffect(() => { if (factoryAllocations.length) saveToStorage('factoryAllocations', factoryAllocations); }, [factoryAllocations]);

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

      const endingAllocations = allocations.filter(a => {
        if (!a.endDate) {
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

      const uniqueProfessionals = Array.from(
        new Map(predictedIdleProfessionals.map(p => [p.professionalId, p])).values()
      );

      uniqueProfessionals.sort((a, b) => a.daysUntilIdle - b.daysUntilIdle);

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

  // ============================================
  // FACTORY COMPUTED VALUES
  // ============================================

  // Factory Projects with Details
  const factoryProjectsWithDetails = useMemo<FactoryProjectWithDetails[]>(() => {
    const today = new Date();
    
    return factoryProjects.map(project => {
      const client = project.clientId ? getClientById(project.clientId) : undefined;
      const projectAllocations = factoryAllocations
        .filter(a => a.projectId === project.id)
        .map(a => {
          const professional = getProfessionalById(a.professionalId);
          const stack = getStackById(a.stackId);
          if (!professional || !stack) return null;
          return { ...a, professional, stack } as FactoryAllocationWithDetails;
        })
        .filter(Boolean) as FactoryAllocationWithDetails[];

      const startDate = new Date(project.startDate);
      const endDate = new Date(project.endDate);
      const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      const daysElapsed = Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
      const calculatedProgress = Math.min(100, (daysElapsed / totalDays) * 100);

      return {
        ...project,
        client,
        allocations: projectAllocations,
        totalMembers: projectAllocations.length,
        daysRemaining,
        daysElapsed,
        totalDays,
        calculatedProgress,
      };
    });
  }, [factoryProjects, factoryAllocations, getClientById, getProfessionalById, getStackById]);

  // Factory Dashboard Metrics
  const factoryMetrics = useMemo<FactoryDashboardMetrics>(() => {
    const today = new Date();
    const activeProjects = factoryProjectsWithDetails.filter(p => p.status === 'in_progress');
    const plannedProjects = factoryProjectsWithDetails.filter(p => p.status === 'planned');
    const finishedProjects = factoryProjectsWithDetails.filter(p => p.status === 'finished');
    const pausedProjects = factoryProjectsWithDetails.filter(p => p.status === 'paused');

    // Get factory-eligible professionals
    const factoryProfessionals = professionals.filter(
      p => p.workMode === 'factory' || p.workMode === 'both'
    );

    // Currently allocated in factory
    const currentlyAllocated = new Set(
      factoryAllocations
        .filter(a => {
          const start = new Date(a.startDate);
          const end = new Date(a.endDate);
          return start <= today && end >= today;
        })
        .map(a => a.professionalId)
    );

    const currentOccupancyRate = factoryProfessionals.length > 0
      ? (currentlyAllocated.size / factoryProfessionals.length) * 100
      : 0;

    // Calculate future occupancy
    const calcOccupancy = (days: number) => {
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + days);
      
      const allocatedAtDate = new Set(
        factoryAllocations
          .filter(a => {
            const start = new Date(a.startDate);
            const end = new Date(a.endDate);
            return start <= futureDate && end >= futureDate;
          })
          .map(a => a.professionalId)
      );

      return factoryProfessionals.length > 0
        ? (allocatedAtDate.size / factoryProfessionals.length) * 100
        : 0;
    };

    return {
      totalProjects: factoryProjects.length,
      activeProjects: activeProjects.length,
      plannedProjects: plannedProjects.length,
      finishedProjects: finishedProjects.length,
      pausedProjects: pausedProjects.length,
      totalFactoryProfessionals: currentlyAllocated.size,
      currentOccupancyRate,
      occupancy30Days: calcOccupancy(30),
      occupancy60Days: calcOccupancy(60),
      occupancy90Days: calcOccupancy(90),
    };
  }, [factoryProjectsWithDetails, factoryProjects, factoryAllocations, professionals]);

  // Factory Idle Forecasts
  const factoryIdleForecasts = useMemo<FactoryIdleForecast[]>(() => {
    const today = new Date();
    const forecasts: FactoryIdleForecast[] = [];

    const factoryProfessionals = professionals.filter(
      p => p.workMode === 'factory' || p.workMode === 'both'
    );

    [30, 60, 90].forEach((days) => {
      const cutoffDate = new Date(today);
      cutoffDate.setDate(cutoffDate.getDate() + days);

      // Find allocations ending within this period
      const endingAllocations = factoryAllocations.filter(a => {
        const endDate = new Date(a.endDate);
        return endDate <= cutoffDate && endDate >= today;
      });

      const idleProfessionals: FactoryIdleProfessional[] = endingAllocations.map(a => {
        const professional = getProfessionalById(a.professionalId);
        const project = factoryProjects.find(p => p.id === a.projectId);
        const stack = professional ? getStackById(professional.primaryStackId) : null;
        
        const daysUntilIdle = Math.ceil((new Date(a.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        return {
          professionalId: a.professionalId,
          professionalName: professional?.name || '',
          stackName: stack?.name || '',
          currentProjectName: project?.name || '',
          allocationEndDate: a.endDate,
          daysUntilIdle,
        };
      }).filter(p => p.professionalName);

      // Remove duplicates
      const uniqueProfessionals = Array.from(
        new Map(idleProfessionals.map(p => [p.professionalId, p])).values()
      );

      uniqueProfessionals.sort((a, b) => a.daysUntilIdle - b.daysUntilIdle);

      // Current allocated count
      const currentAllocated = new Set(
        factoryAllocations
          .filter(a => {
            const start = new Date(a.startDate);
            const end = new Date(a.endDate);
            return start <= today && end >= today;
          })
          .map(a => a.professionalId)
      ).size;

      const predictedIdle = uniqueProfessionals.length;
      const occupancyRate = factoryProfessionals.length > 0
        ? ((currentAllocated - predictedIdle) / factoryProfessionals.length) * 100
        : 0;

      forecasts.push({
        period: days as 30 | 60 | 90,
        currentAllocated,
        predictedIdle,
        idleProfessionals: uniqueProfessionals,
        occupancyRate: Math.max(0, occupancyRate),
      });
    });

    return forecasts;
  }, [factoryAllocations, factoryProjects, professionals, getProfessionalById, getStackById]);

  // Factory Gantt Data
  const factoryGanttData = useMemo<FactoryGanttEntry[]>(() => {
    const entries: FactoryGanttEntry[] = [];

    // Add projects
    factoryProjectsWithDetails.forEach(project => {
      entries.push({
        id: project.id,
        type: 'project',
        name: project.name,
        startDate: project.startDate,
        endDate: project.endDate,
        progress: project.progressPercentage,
        status: project.status,
      });

      // Add professionals for this project
      project.allocations.forEach(alloc => {
        entries.push({
          id: `${alloc.id}-${project.id}`,
          type: 'professional',
          name: alloc.professional.name,
          projectId: project.id,
          projectName: project.name,
          role: alloc.role,
          stackName: alloc.stack.name,
          startDate: alloc.startDate,
          endDate: alloc.endDate,
        });
      });
    });

    return entries;
  }, [factoryProjectsWithDetails]);

  // ============================================
  // CRUD OPERATIONS
  // ============================================

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

  // Factory CRUD
  const addFactoryProject = useCallback((project: Omit<FactoryProject, 'id' | 'createdAt'>) => {
    const newProject: FactoryProject = {
      ...project,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setFactoryProjects(prev => [...prev, newProject]);
    return newProject;
  }, []);

  const updateFactoryProject = useCallback((id: string, updates: Partial<FactoryProject>) => {
    setFactoryProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteFactoryProject = useCallback((id: string) => {
    setFactoryProjects(prev => prev.filter(p => p.id !== id));
    // Also delete related allocations
    setFactoryAllocations(prev => prev.filter(a => a.projectId !== id));
  }, []);

  const addFactoryAllocation = useCallback((allocation: Omit<FactoryAllocation, 'id' | 'createdAt'>) => {
    const newAllocation: FactoryAllocation = {
      ...allocation,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setFactoryAllocations(prev => [...prev, newAllocation]);
    return newAllocation;
  }, []);

  const updateFactoryAllocation = useCallback((id: string, updates: Partial<FactoryAllocation>) => {
    setFactoryAllocations(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const deleteFactoryAllocation = useCallback((id: string) => {
    setFactoryAllocations(prev => prev.filter(a => a.id !== id));
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
        factoryProjects,
        factoryAllocations,
        contractsWithDetails,
        dashboardMetrics,
        expiringContractsGroups,
        stackDistributions,
        clientSummaries,
        allocationTimeline,
        teamViews,
        occupancyForecasts,
        factoryProjectsWithDetails,
        factoryMetrics,
        factoryIdleForecasts,
        factoryGanttData,
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
        addFactoryProject,
        updateFactoryProject,
        deleteFactoryProject,
        addFactoryAllocation,
        updateFactoryAllocation,
        deleteFactoryAllocation,
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
