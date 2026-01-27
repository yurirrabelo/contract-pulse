import { Client, Contract, Stack, Position, Professional, Allocation, User } from '@/types';
import { generateId } from '@/lib/storage';

// Helper to create dates relative to today
const daysFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

// Seed Stacks
export const seedStacks: Stack[] = [
  { id: 'stack-1', name: 'React Developer', category: 'development', createdAt: daysAgo(365) },
  { id: 'stack-2', name: 'Node.js Developer', category: 'development', createdAt: daysAgo(365) },
  { id: 'stack-3', name: 'Python Developer', category: 'development', createdAt: daysAgo(365) },
  { id: 'stack-4', name: 'Java Developer', category: 'development', createdAt: daysAgo(365) },
  { id: 'stack-5', name: 'DevOps Engineer', category: 'development', createdAt: daysAgo(365) },
  { id: 'stack-6', name: 'QA Analyst', category: 'qa', createdAt: daysAgo(365) },
  { id: 'stack-7', name: 'QA Automation', category: 'qa', createdAt: daysAgo(365) },
  { id: 'stack-8', name: 'Product Owner', category: 'management', createdAt: daysAgo(365) },
  { id: 'stack-9', name: 'Project Manager', category: 'management', createdAt: daysAgo(365) },
  { id: 'stack-10', name: 'Scrum Master', category: 'management', createdAt: daysAgo(365) },
  { id: 'stack-11', name: 'Tech Lead', category: 'development', createdAt: daysAgo(365) },
  { id: 'stack-12', name: 'Full Stack Developer', category: 'development', createdAt: daysAgo(365) },
  { id: 'stack-13', name: 'Software Architect', category: 'development', createdAt: daysAgo(365) },
  { id: 'stack-14', name: 'UX Designer', category: 'development', createdAt: daysAgo(365) },
];

// Seed Clients
export const seedClients: Client[] = [
  { id: 'client-1', name: 'Banco Itaú', cnpj: '60.701.190/0001-04', contact: 'joao.silva@itau.com.br', createdAt: daysAgo(300) },
  { id: 'client-2', name: 'Magazine Luiza', cnpj: '47.960.950/0001-21', contact: 'maria.santos@magalu.com.br', createdAt: daysAgo(280) },
  { id: 'client-3', name: 'Petrobras', cnpj: '33.000.167/0001-01', contact: 'carlos.oliveira@petrobras.com.br', createdAt: daysAgo(260) },
  { id: 'client-4', name: 'Ambev', cnpj: '07.526.557/0001-00', contact: 'ana.costa@ambev.com.br', createdAt: daysAgo(240) },
  { id: 'client-5', name: 'Vale S.A.', cnpj: '33.592.510/0001-54', contact: 'pedro.lima@vale.com', createdAt: daysAgo(220) },
  { id: 'client-6', name: 'Embraer', cnpj: '07.689.002/0001-89', contact: 'lucia.ferreira@embraer.com.br', createdAt: daysAgo(200) },
  { id: 'client-7', name: 'Natura', cnpj: '71.673.990/0001-77', contact: 'roberto.alves@natura.net', createdAt: daysAgo(180) },
  { id: 'client-8', name: 'Premiersoft (Interno)', cnpj: '00.000.000/0001-00', contact: 'interno@premiersoft.com.br', createdAt: daysAgo(400) },
];

// Seed Contracts - mix of Staffing and Fábrica
export const seedContracts: Contract[] = [
  // STAFFING - Expiring in ~30 days
  { id: 'contract-1', clientId: 'client-1', contractNumber: 'CTR-2024-001', projectName: 'App Mobile Banking', type: 'staffing', startDate: daysAgo(335), endDate: daysFromNow(25), monthlyValue: 85000, createdAt: daysAgo(335) },
  { id: 'contract-2', clientId: 'client-2', contractNumber: 'CTR-2024-002', projectName: 'E-commerce Platform', type: 'staffing', startDate: daysAgo(320), endDate: daysFromNow(15), monthlyValue: 42000, createdAt: daysAgo(320) },
  
  // FÁBRICA - Expiring in ~60 days
  { id: 'contract-3', clientId: 'client-3', contractNumber: 'CTR-2024-003', projectName: 'Sistema de Gestão de Poços', type: 'fabrica', startDate: daysAgo(300), endDate: daysFromNow(55), monthlyValue: 120000, createdAt: daysAgo(300) },
  { id: 'contract-4', clientId: 'client-1', contractNumber: 'CTR-2024-004', projectName: 'Portal do Cliente', type: 'staffing', startDate: daysAgo(280), endDate: daysFromNow(45), monthlyValue: 65000, createdAt: daysAgo(280) },
  
  // FÁBRICA - Expiring in ~90 days  
  { id: 'contract-5', clientId: 'client-4', contractNumber: 'CTR-2024-005', projectName: 'Sistema de Logística', type: 'fabrica', startDate: daysAgo(260), endDate: daysFromNow(85), monthlyValue: 95000, createdAt: daysAgo(260) },
  { id: 'contract-6', clientId: 'client-5', contractNumber: 'CTR-2024-006', projectName: 'Dashboard Operacional', type: 'staffing', startDate: daysAgo(240), endDate: daysFromNow(75), monthlyValue: 78000, createdAt: daysAgo(240) },
  { id: 'contract-7', clientId: 'client-6', contractNumber: 'CTR-2024-007', projectName: 'IoT Aeronaves', type: 'fabrica', startDate: daysAgo(220), endDate: daysFromNow(70), monthlyValue: 55000, createdAt: daysAgo(220) },
  
  // Active contracts (>90 days)
  { id: 'contract-8', clientId: 'client-7', contractNumber: 'CTR-2024-008', projectName: 'App Consultora', type: 'staffing', startDate: daysAgo(200), endDate: daysFromNow(165), monthlyValue: 48000, createdAt: daysAgo(200) },
  { id: 'contract-9', clientId: 'client-2', contractNumber: 'CTR-2024-009', projectName: 'Marketplace B2B', type: 'fabrica', startDate: daysAgo(180), endDate: daysFromNow(185), monthlyValue: 72000, createdAt: daysAgo(180) },
  { id: 'contract-10', clientId: 'client-3', contractNumber: 'CTR-2024-010', projectName: 'Sistema de Manutenção', type: 'fabrica', startDate: daysAgo(160), endDate: daysFromNow(205), monthlyValue: 88000, createdAt: daysAgo(160) },
  { id: 'contract-11', clientId: 'client-4', contractNumber: 'CTR-2024-011', projectName: 'Portal RH', type: 'staffing', startDate: daysAgo(140), endDate: daysFromNow(225), monthlyValue: 62000, createdAt: daysAgo(140) },
  
  // Projeto Interno Fábrica
  { id: 'contract-12', clientId: 'client-8', contractNumber: 'INT-2024-001', projectName: 'Plataforma Interna', type: 'fabrica', startDate: daysAgo(100), endDate: daysFromNow(265), monthlyValue: 0, createdAt: daysAgo(100) },
  
  // Expired contracts
  { id: 'contract-13', clientId: 'client-5', contractNumber: 'CTR-2023-001', projectName: 'Sistema Legado', type: 'staffing', startDate: daysAgo(400), endDate: daysAgo(35), monthlyValue: 45000, createdAt: daysAgo(400) },
];

// Seed Positions with allocation percentages and varied dates
export const seedPositions: Position[] = [
  // Contract 1 - App Mobile Banking (Staffing)
  { id: 'pos-1', contractId: 'contract-1', title: 'Senior React Developer', stackId: 'stack-1', status: 'filled', startDate: daysAgo(335), endDate: daysFromNow(25), allocationPercentage: 100, createdAt: daysAgo(335) },
  { id: 'pos-2', contractId: 'contract-1', title: 'Tech Lead', stackId: 'stack-11', status: 'filled', startDate: daysAgo(335), endDate: daysFromNow(25), allocationPercentage: 100, createdAt: daysAgo(335) },
  { id: 'pos-3', contractId: 'contract-1', title: 'QA Analyst', stackId: 'stack-6', status: 'filled', startDate: daysAgo(200), endDate: daysFromNow(25), allocationPercentage: 100, createdAt: daysAgo(200) },
  
  // Contract 2 - E-commerce (Staffing)
  { id: 'pos-4', contractId: 'contract-2', title: 'Full Stack Developer', stackId: 'stack-12', status: 'filled', startDate: daysAgo(320), endDate: daysFromNow(15), allocationPercentage: 100, createdAt: daysAgo(320) },
  { id: 'pos-5', contractId: 'contract-2', title: 'DevOps Engineer', stackId: 'stack-5', status: 'filled', startDate: daysAgo(320), endDate: daysFromNow(15), allocationPercentage: 50, createdAt: daysAgo(320) },
  
  // Contract 3 - Sistema de Poços (Fábrica) - Different roles with different timeframes
  { id: 'pos-6', contractId: 'contract-3', title: 'Software Architect', stackId: 'stack-13', status: 'filled', startDate: daysAgo(300), endDate: daysAgo(150), allocationPercentage: 100, createdAt: daysAgo(300) },
  { id: 'pos-7', contractId: 'contract-3', title: 'Product Owner', stackId: 'stack-8', status: 'filled', startDate: daysAgo(300), endDate: daysFromNow(55), allocationPercentage: 50, createdAt: daysAgo(300) },
  { id: 'pos-8', contractId: 'contract-3', title: 'Java Developer', stackId: 'stack-4', status: 'filled', startDate: daysAgo(280), endDate: daysFromNow(55), allocationPercentage: 100, createdAt: daysAgo(280) },
  { id: 'pos-9', contractId: 'contract-3', title: 'Python Developer', stackId: 'stack-3', status: 'filled', startDate: daysAgo(280), endDate: daysFromNow(55), allocationPercentage: 100, createdAt: daysAgo(280) },
  { id: 'pos-10', contractId: 'contract-3', title: 'QA Automation', stackId: 'stack-7', status: 'filled', startDate: daysAgo(200), endDate: daysFromNow(55), allocationPercentage: 100, createdAt: daysAgo(200) },
  { id: 'pos-11', contractId: 'contract-3', title: 'Scrum Master', stackId: 'stack-10', status: 'filled', startDate: daysAgo(300), endDate: daysFromNow(55), allocationPercentage: 50, createdAt: daysAgo(300) },
  
  // Contract 4 - Portal do Cliente (Staffing)
  { id: 'pos-12', contractId: 'contract-4', title: 'React Developer', stackId: 'stack-1', status: 'filled', startDate: daysAgo(280), endDate: daysFromNow(45), allocationPercentage: 100, createdAt: daysAgo(280) },
  { id: 'pos-13', contractId: 'contract-4', title: 'QA Automation', stackId: 'stack-7', status: 'open', startDate: daysAgo(280), endDate: daysFromNow(45), allocationPercentage: 100, createdAt: daysAgo(280) },
  
  // Contract 5 - Sistema de Logística (Fábrica)
  { id: 'pos-14', contractId: 'contract-5', title: 'Product Owner', stackId: 'stack-8', status: 'filled', startDate: daysAgo(260), endDate: daysFromNow(85), allocationPercentage: 100, createdAt: daysAgo(260) },
  { id: 'pos-15', contractId: 'contract-5', title: 'React Developer', stackId: 'stack-1', status: 'filled', startDate: daysAgo(240), endDate: daysFromNow(85), allocationPercentage: 100, createdAt: daysAgo(240) },
  { id: 'pos-16', contractId: 'contract-5', title: 'Node.js Developer', stackId: 'stack-2', status: 'filled', startDate: daysAgo(240), endDate: daysFromNow(85), allocationPercentage: 100, createdAt: daysAgo(240) },
  { id: 'pos-17', contractId: 'contract-5', title: 'QA Analyst', stackId: 'stack-6', status: 'filled', startDate: daysAgo(180), endDate: daysFromNow(85), allocationPercentage: 100, createdAt: daysAgo(180) },
  
  // Contract 6 - Dashboard Operacional (Staffing)
  { id: 'pos-18', contractId: 'contract-6', title: 'DevOps Engineer', stackId: 'stack-5', status: 'filled', startDate: daysAgo(240), endDate: daysFromNow(75), allocationPercentage: 50, createdAt: daysAgo(240) },
  { id: 'pos-19', contractId: 'contract-6', title: 'Full Stack Developer', stackId: 'stack-12', status: 'open', startDate: daysAgo(240), endDate: daysFromNow(75), allocationPercentage: 100, createdAt: daysAgo(240) },
  
  // Contract 7 - IoT Aeronaves (Fábrica)
  { id: 'pos-20', contractId: 'contract-7', title: 'Java Developer', stackId: 'stack-4', status: 'filled', startDate: daysAgo(220), endDate: daysFromNow(70), allocationPercentage: 100, createdAt: daysAgo(220) },
  { id: 'pos-21', contractId: 'contract-7', title: 'Project Manager', stackId: 'stack-9', status: 'filled', startDate: daysAgo(220), endDate: daysFromNow(70), allocationPercentage: 100, createdAt: daysAgo(220) },
  
  // Contract 8 - App Consultora (Staffing)
  { id: 'pos-22', contractId: 'contract-8', title: 'Python Developer', stackId: 'stack-3', status: 'filled', startDate: daysAgo(200), endDate: daysFromNow(165), allocationPercentage: 100, createdAt: daysAgo(200) },
  { id: 'pos-23', contractId: 'contract-8', title: 'QA Analyst', stackId: 'stack-6', status: 'filled', startDate: daysAgo(200), endDate: daysFromNow(165), allocationPercentage: 100, createdAt: daysAgo(200) },
  
  // Contract 9 - Marketplace B2B (Fábrica)
  { id: 'pos-24', contractId: 'contract-9', title: 'Tech Lead', stackId: 'stack-11', status: 'filled', startDate: daysAgo(180), endDate: daysFromNow(185), allocationPercentage: 100, createdAt: daysAgo(180) },
  { id: 'pos-25', contractId: 'contract-9', title: 'React Developer', stackId: 'stack-1', status: 'filled', startDate: daysAgo(180), endDate: daysFromNow(185), allocationPercentage: 100, createdAt: daysAgo(180) },
  { id: 'pos-26', contractId: 'contract-9', title: 'Node.js Developer', stackId: 'stack-2', status: 'open', startDate: daysAgo(180), endDate: daysFromNow(185), allocationPercentage: 100, createdAt: daysAgo(180) },
  
  // Contract 10 - Sistema de Manutenção (Fábrica)
  { id: 'pos-27', contractId: 'contract-10', title: 'Java Developer', stackId: 'stack-4', status: 'filled', startDate: daysAgo(160), endDate: daysFromNow(205), allocationPercentage: 100, createdAt: daysAgo(160) },
  { id: 'pos-28', contractId: 'contract-10', title: 'DevOps Engineer', stackId: 'stack-5', status: 'filled', startDate: daysAgo(160), endDate: daysFromNow(205), allocationPercentage: 100, createdAt: daysAgo(160) },
  { id: 'pos-29', contractId: 'contract-10', title: 'QA Automation', stackId: 'stack-7', status: 'filled', startDate: daysAgo(160), endDate: daysFromNow(205), allocationPercentage: 100, createdAt: daysAgo(160) },
  
  // Contract 11 - Portal RH (Staffing)
  { id: 'pos-30', contractId: 'contract-11', title: 'Full Stack Developer', stackId: 'stack-12', status: 'filled', startDate: daysAgo(140), endDate: daysFromNow(225), allocationPercentage: 100, createdAt: daysAgo(140) },
  { id: 'pos-31', contractId: 'contract-11', title: 'Product Owner', stackId: 'stack-8', status: 'filled', startDate: daysAgo(140), endDate: daysFromNow(225), allocationPercentage: 100, createdAt: daysAgo(140) },

  // Contract 12 - Plataforma Interna (Fábrica Interna)
  { id: 'pos-32', contractId: 'contract-12', title: 'UX Designer', stackId: 'stack-14', status: 'filled', startDate: daysAgo(100), endDate: daysFromNow(50), allocationPercentage: 50, createdAt: daysAgo(100) },
  { id: 'pos-33', contractId: 'contract-12', title: 'React Developer', stackId: 'stack-1', status: 'filled', startDate: daysAgo(80), endDate: daysFromNow(265), allocationPercentage: 100, createdAt: daysAgo(80) },
];

// Seed Professionals with status
export const seedProfessionals: Professional[] = [
  { id: 'prof-1', name: 'Ana Beatriz Silva', primaryStackId: 'stack-1', secondaryStackIds: ['stack-12'], status: 'allocated', createdAt: daysAgo(350) },
  { id: 'prof-2', name: 'Carlos Eduardo Santos', primaryStackId: 'stack-11', secondaryStackIds: ['stack-1', 'stack-2'], status: 'allocated', createdAt: daysAgo(340) },
  { id: 'prof-3', name: 'Maria Fernanda Costa', primaryStackId: 'stack-6', secondaryStackIds: ['stack-7'], status: 'allocated', createdAt: daysAgo(330) },
  { id: 'prof-4', name: 'João Pedro Oliveira', primaryStackId: 'stack-12', secondaryStackIds: ['stack-1', 'stack-2'], status: 'allocated', createdAt: daysAgo(320) },
  { id: 'prof-5', name: 'Luciana Almeida', primaryStackId: 'stack-5', secondaryStackIds: [], status: 'partial', createdAt: daysAgo(310) },
  { id: 'prof-6', name: 'Roberto Lima', primaryStackId: 'stack-4', secondaryStackIds: ['stack-3'], status: 'allocated', createdAt: daysAgo(300) },
  { id: 'prof-7', name: 'Fernanda Rodrigues', primaryStackId: 'stack-3', secondaryStackIds: ['stack-2'], status: 'allocated', createdAt: daysAgo(290) },
  { id: 'prof-8', name: 'Marcos Vinícius', primaryStackId: 'stack-2', secondaryStackIds: ['stack-1'], status: 'allocated', createdAt: daysAgo(280) },
  { id: 'prof-9', name: 'Patricia Souza', primaryStackId: 'stack-10', secondaryStackIds: ['stack-9'], status: 'partial', createdAt: daysAgo(270) },
  { id: 'prof-10', name: 'Ricardo Mendes', primaryStackId: 'stack-1', secondaryStackIds: [], status: 'allocated', createdAt: daysAgo(260) },
  { id: 'prof-11', name: 'Camila Ferreira', primaryStackId: 'stack-8', secondaryStackIds: ['stack-9'], status: 'partial', createdAt: daysAgo(250) },
  { id: 'prof-12', name: 'Bruno Carvalho', primaryStackId: 'stack-2', secondaryStackIds: ['stack-5'], status: 'allocated', createdAt: daysAgo(240) },
  { id: 'prof-13', name: 'Juliana Martins', primaryStackId: 'stack-5', secondaryStackIds: [], status: 'allocated', createdAt: daysAgo(230) },
  { id: 'prof-14', name: 'André Nascimento', primaryStackId: 'stack-4', secondaryStackIds: [], status: 'allocated', createdAt: daysAgo(220) },
  { id: 'prof-15', name: 'Tatiana Ribeiro', primaryStackId: 'stack-9', secondaryStackIds: ['stack-8'], status: 'allocated', createdAt: daysAgo(210) },
  { id: 'prof-16', name: 'Felipe Gomes', primaryStackId: 'stack-3', secondaryStackIds: [], status: 'allocated', createdAt: daysAgo(200) },
  { id: 'prof-17', name: 'Amanda Dias', primaryStackId: 'stack-6', secondaryStackIds: ['stack-7'], status: 'allocated', createdAt: daysAgo(190) },
  { id: 'prof-18', name: 'Gustavo Pereira', primaryStackId: 'stack-11', secondaryStackIds: ['stack-1'], status: 'allocated', createdAt: daysAgo(180) },
  { id: 'prof-19', name: 'Renata Castro', primaryStackId: 'stack-1', secondaryStackIds: ['stack-12'], status: 'allocated', createdAt: daysAgo(170) },
  { id: 'prof-20', name: 'Diego Barbosa', primaryStackId: 'stack-4', secondaryStackIds: [], status: 'allocated', createdAt: daysAgo(160) },
  { id: 'prof-21', name: 'Isabela Moreira', primaryStackId: 'stack-5', secondaryStackIds: [], status: 'allocated', createdAt: daysAgo(150) },
  { id: 'prof-22', name: 'Thiago Araújo', primaryStackId: 'stack-7', secondaryStackIds: ['stack-6'], status: 'allocated', createdAt: daysAgo(140) },
  { id: 'prof-23', name: 'Vanessa Lopes', primaryStackId: 'stack-12', secondaryStackIds: [], status: 'allocated', createdAt: daysAgo(130) },
  { id: 'prof-24', name: 'Leonardo Cardoso', primaryStackId: 'stack-8', secondaryStackIds: [], status: 'allocated', createdAt: daysAgo(120) },
  { id: 'prof-25', name: 'Mariana Santos', primaryStackId: 'stack-13', secondaryStackIds: ['stack-11'], status: 'idle', createdAt: daysAgo(110) },
  { id: 'prof-26', name: 'Paulo Henrique', primaryStackId: 'stack-14', secondaryStackIds: [], status: 'partial', createdAt: daysAgo(100) },
  { id: 'prof-27', name: 'Carla Mendonça', primaryStackId: 'stack-1', secondaryStackIds: [], status: 'allocated', createdAt: daysAgo(90) },
  { id: 'prof-28', name: 'Eduardo Freitas', primaryStackId: 'stack-6', secondaryStackIds: [], status: 'idle', createdAt: daysAgo(80) },
];

// Seed Allocations with allocation percentages
export const seedAllocations: Allocation[] = [
  // Contract 1 - App Mobile Banking
  { id: 'alloc-1', professionalId: 'prof-1', positionId: 'pos-1', startDate: daysAgo(335), endDate: daysFromNow(25), allocationPercentage: 100, createdAt: daysAgo(335) },
  { id: 'alloc-2', professionalId: 'prof-2', positionId: 'pos-2', startDate: daysAgo(335), endDate: daysFromNow(25), allocationPercentage: 100, createdAt: daysAgo(335) },
  { id: 'alloc-3', professionalId: 'prof-3', positionId: 'pos-3', startDate: daysAgo(200), endDate: daysFromNow(25), allocationPercentage: 100, createdAt: daysAgo(200) },
  
  // Contract 2 - E-commerce
  { id: 'alloc-4', professionalId: 'prof-4', positionId: 'pos-4', startDate: daysAgo(320), endDate: daysFromNow(15), allocationPercentage: 100, createdAt: daysAgo(320) },
  { id: 'alloc-5', professionalId: 'prof-5', positionId: 'pos-5', startDate: daysAgo(320), endDate: daysFromNow(15), allocationPercentage: 50, createdAt: daysAgo(320) },
  
  // Contract 3 - Sistema de Poços (Fábrica) - Note architect left early
  { id: 'alloc-6', professionalId: 'prof-25', positionId: 'pos-6', startDate: daysAgo(300), endDate: daysAgo(150), allocationPercentage: 100, createdAt: daysAgo(300) },
  { id: 'alloc-7', professionalId: 'prof-11', positionId: 'pos-7', startDate: daysAgo(300), endDate: daysFromNow(55), allocationPercentage: 50, createdAt: daysAgo(300) },
  { id: 'alloc-8', professionalId: 'prof-6', positionId: 'pos-8', startDate: daysAgo(280), endDate: daysFromNow(55), allocationPercentage: 100, createdAt: daysAgo(280) },
  { id: 'alloc-9', professionalId: 'prof-7', positionId: 'pos-9', startDate: daysAgo(280), endDate: daysFromNow(55), allocationPercentage: 100, createdAt: daysAgo(280) },
  { id: 'alloc-10', professionalId: 'prof-22', positionId: 'pos-10', startDate: daysAgo(200), endDate: daysFromNow(55), allocationPercentage: 100, createdAt: daysAgo(200) },
  { id: 'alloc-11', professionalId: 'prof-9', positionId: 'pos-11', startDate: daysAgo(300), endDate: daysFromNow(55), allocationPercentage: 50, createdAt: daysAgo(300) },
  
  // Contract 4 - Portal do Cliente
  { id: 'alloc-12', professionalId: 'prof-10', positionId: 'pos-12', startDate: daysAgo(280), endDate: daysFromNow(45), allocationPercentage: 100, createdAt: daysAgo(280) },
  
  // Contract 5 - Sistema de Logística (Fábrica)
  { id: 'alloc-13', professionalId: 'prof-11', positionId: 'pos-14', startDate: daysAgo(260), endDate: daysFromNow(85), allocationPercentage: 50, createdAt: daysAgo(260) },
  { id: 'alloc-14', professionalId: 'prof-19', positionId: 'pos-15', startDate: daysAgo(240), endDate: daysFromNow(85), allocationPercentage: 100, createdAt: daysAgo(240) },
  { id: 'alloc-15', professionalId: 'prof-12', positionId: 'pos-16', startDate: daysAgo(240), endDate: daysFromNow(85), allocationPercentage: 100, createdAt: daysAgo(240) },
  { id: 'alloc-16', professionalId: 'prof-17', positionId: 'pos-17', startDate: daysAgo(180), endDate: daysFromNow(85), allocationPercentage: 100, createdAt: daysAgo(180) },
  
  // Contract 6 - Dashboard Operacional
  { id: 'alloc-17', professionalId: 'prof-5', positionId: 'pos-18', startDate: daysAgo(240), endDate: daysFromNow(75), allocationPercentage: 50, createdAt: daysAgo(240) },
  
  // Contract 7 - IoT Aeronaves (Fábrica)
  { id: 'alloc-18', professionalId: 'prof-14', positionId: 'pos-20', startDate: daysAgo(220), endDate: daysFromNow(70), allocationPercentage: 100, createdAt: daysAgo(220) },
  { id: 'alloc-19', professionalId: 'prof-15', positionId: 'pos-21', startDate: daysAgo(220), endDate: daysFromNow(70), allocationPercentage: 100, createdAt: daysAgo(220) },
  
  // Contract 8 - App Consultora
  { id: 'alloc-20', professionalId: 'prof-16', positionId: 'pos-22', startDate: daysAgo(200), endDate: daysFromNow(165), allocationPercentage: 100, createdAt: daysAgo(200) },
  { id: 'alloc-21', professionalId: 'prof-3', positionId: 'pos-23', startDate: daysAgo(200), endDate: daysFromNow(165), allocationPercentage: 100, createdAt: daysAgo(200) },
  
  // Contract 9 - Marketplace B2B (Fábrica)
  { id: 'alloc-22', professionalId: 'prof-18', positionId: 'pos-24', startDate: daysAgo(180), endDate: daysFromNow(185), allocationPercentage: 100, createdAt: daysAgo(180) },
  { id: 'alloc-23', professionalId: 'prof-27', positionId: 'pos-25', startDate: daysAgo(90), endDate: daysFromNow(185), allocationPercentage: 100, createdAt: daysAgo(90) },
  
  // Contract 10 - Sistema de Manutenção (Fábrica)
  { id: 'alloc-24', professionalId: 'prof-20', positionId: 'pos-27', startDate: daysAgo(160), endDate: daysFromNow(205), allocationPercentage: 100, createdAt: daysAgo(160) },
  { id: 'alloc-25', professionalId: 'prof-21', positionId: 'pos-28', startDate: daysAgo(160), endDate: daysFromNow(205), allocationPercentage: 100, createdAt: daysAgo(160) },
  { id: 'alloc-26', professionalId: 'prof-8', positionId: 'pos-29', startDate: daysAgo(160), endDate: daysFromNow(205), allocationPercentage: 100, createdAt: daysAgo(160) },
  
  // Contract 11 - Portal RH
  { id: 'alloc-27', professionalId: 'prof-23', positionId: 'pos-30', startDate: daysAgo(140), endDate: daysFromNow(225), allocationPercentage: 100, createdAt: daysAgo(140) },
  { id: 'alloc-28', professionalId: 'prof-24', positionId: 'pos-31', startDate: daysAgo(140), endDate: daysFromNow(225), allocationPercentage: 100, createdAt: daysAgo(140) },
  
  // Contract 12 - Plataforma Interna
  { id: 'alloc-29', professionalId: 'prof-26', positionId: 'pos-32', startDate: daysAgo(100), endDate: daysFromNow(50), allocationPercentage: 50, createdAt: daysAgo(100) },
  { id: 'alloc-30', professionalId: 'prof-13', positionId: 'pos-33', startDate: daysAgo(80), endDate: daysFromNow(265), allocationPercentage: 100, createdAt: daysAgo(80) },
];

// Default demo user
export const seedUsers: User[] = [
  { id: 'user-1', email: 'admin@gestaocontratos.com', name: 'Administrador', createdAt: daysAgo(365) },
];
