import { 
  Client, 
  Contract, 
  Stack, 
  Position, 
  Professional, 
  Allocation, 
  User, 
  FactoryProject, 
  FactoryAllocation,
  StackCategory,
  Seniority,
  ProfessionalStackExperience
} from '@/types';

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

// Seed Stack Categories (Dynamic)
export const seedStackCategories: StackCategory[] = [
  { id: 'cat-1', name: 'Desenvolvimento', description: 'Stacks de desenvolvimento de software', createdAt: daysAgo(400) },
  { id: 'cat-2', name: 'QA', description: 'Stacks de qualidade e testes', createdAt: daysAgo(400) },
  { id: 'cat-3', name: 'Gestão', description: 'Stacks de gestão de projetos e produtos', createdAt: daysAgo(400) },
  { id: 'cat-4', name: 'Data', description: 'Stacks de dados e analytics', createdAt: daysAgo(400) },
  { id: 'cat-5', name: 'Design', description: 'Stacks de design e UX', createdAt: daysAgo(400) },
];

// Seed Seniorities (Hero Journey)
export const seedSeniorities: Seniority[] = [
  // Desenvolvimento
  { id: 'sen-1', name: 'Trainee', level: 1, categoryId: 'cat-1', description: 'Em treinamento', createdAt: daysAgo(400) },
  { id: 'sen-2', name: 'Júnior', level: 2, categoryId: 'cat-1', description: '0-2 anos de experiência', createdAt: daysAgo(400) },
  { id: 'sen-3', name: 'Pleno', level: 3, categoryId: 'cat-1', description: '2-5 anos de experiência', createdAt: daysAgo(400) },
  { id: 'sen-4', name: 'Sênior', level: 4, categoryId: 'cat-1', description: '5+ anos de experiência', createdAt: daysAgo(400) },
  { id: 'sen-5', name: 'Especialista', level: 5, categoryId: 'cat-1', description: 'Expert na área', createdAt: daysAgo(400) },
  // QA
  { id: 'sen-6', name: 'Júnior', level: 1, categoryId: 'cat-2', description: '0-2 anos de experiência', createdAt: daysAgo(400) },
  { id: 'sen-7', name: 'Pleno', level: 2, categoryId: 'cat-2', description: '2-5 anos de experiência', createdAt: daysAgo(400) },
  { id: 'sen-8', name: 'Sênior', level: 3, categoryId: 'cat-2', description: '5+ anos de experiência', createdAt: daysAgo(400) },
  // Gestão
  { id: 'sen-9', name: 'Júnior', level: 1, categoryId: 'cat-3', description: '0-3 anos de experiência', createdAt: daysAgo(400) },
  { id: 'sen-10', name: 'Pleno', level: 2, categoryId: 'cat-3', description: '3-6 anos de experiência', createdAt: daysAgo(400) },
  { id: 'sen-11', name: 'Sênior', level: 3, categoryId: 'cat-3', description: '6+ anos de experiência', createdAt: daysAgo(400) },
  // Data
  { id: 'sen-12', name: 'Júnior', level: 1, categoryId: 'cat-4', description: '0-2 anos de experiência', createdAt: daysAgo(400) },
  { id: 'sen-13', name: 'Pleno', level: 2, categoryId: 'cat-4', description: '2-5 anos de experiência', createdAt: daysAgo(400) },
  { id: 'sen-14', name: 'Sênior', level: 3, categoryId: 'cat-4', description: '5+ anos de experiência', createdAt: daysAgo(400) },
  // Design
  { id: 'sen-15', name: 'Júnior', level: 1, categoryId: 'cat-5', description: '0-2 anos de experiência', createdAt: daysAgo(400) },
  { id: 'sen-16', name: 'Pleno', level: 2, categoryId: 'cat-5', description: '2-4 anos de experiência', createdAt: daysAgo(400) },
  { id: 'sen-17', name: 'Sênior', level: 3, categoryId: 'cat-5', description: '4+ anos de experiência', createdAt: daysAgo(400) },
];

// Seed Stacks (now with categoryId reference)
export const seedStacks: Stack[] = [
  { id: 'stack-1', name: 'React', categoryId: 'cat-1', createdAt: daysAgo(365) },
  { id: 'stack-2', name: 'Node.js', categoryId: 'cat-1', createdAt: daysAgo(365) },
  { id: 'stack-3', name: 'Python', categoryId: 'cat-1', createdAt: daysAgo(365) },
  { id: 'stack-4', name: 'Java', categoryId: 'cat-1', createdAt: daysAgo(365) },
  { id: 'stack-5', name: 'DevOps', categoryId: 'cat-1', createdAt: daysAgo(365) },
  { id: 'stack-6', name: 'QA Manual', categoryId: 'cat-2', createdAt: daysAgo(365) },
  { id: 'stack-7', name: 'QA Automation', categoryId: 'cat-2', createdAt: daysAgo(365) },
  { id: 'stack-8', name: 'Product Owner', categoryId: 'cat-3', createdAt: daysAgo(365) },
  { id: 'stack-9', name: 'Project Manager', categoryId: 'cat-3', createdAt: daysAgo(365) },
  { id: 'stack-10', name: 'Scrum Master', categoryId: 'cat-3', createdAt: daysAgo(365) },
  { id: 'stack-11', name: 'Tech Lead', categoryId: 'cat-1', createdAt: daysAgo(365) },
  { id: 'stack-12', name: 'Full Stack', categoryId: 'cat-1', createdAt: daysAgo(365) },
  { id: 'stack-13', name: 'Software Architect', categoryId: 'cat-1', createdAt: daysAgo(365) },
  { id: 'stack-14', name: 'UX Designer', categoryId: 'cat-5', createdAt: daysAgo(365) },
  { id: 'stack-15', name: 'Data Engineer', categoryId: 'cat-4', createdAt: daysAgo(365) },
  { id: 'stack-16', name: 'Data Analyst', categoryId: 'cat-4', createdAt: daysAgo(365) },
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

// Seed Contracts
export const seedContracts: Contract[] = [
  { id: 'contract-1', clientId: 'client-1', contractNumber: 'CTR-2024-001', projectName: 'App Mobile Banking', type: 'staffing', startDate: daysAgo(335), endDate: daysFromNow(25), monthlyValue: 85000, createdAt: daysAgo(335) },
  { id: 'contract-2', clientId: 'client-2', contractNumber: 'CTR-2024-002', projectName: 'E-commerce Platform', type: 'staffing', startDate: daysAgo(320), endDate: daysFromNow(15), monthlyValue: 42000, createdAt: daysAgo(320) },
  { id: 'contract-3', clientId: 'client-3', contractNumber: 'CTR-2024-003', projectName: 'Sistema de Gestão de Poços', type: 'fabrica', startDate: daysAgo(300), endDate: daysFromNow(55), monthlyValue: 120000, createdAt: daysAgo(300) },
  { id: 'contract-4', clientId: 'client-1', contractNumber: 'CTR-2024-004', projectName: 'Portal do Cliente', type: 'staffing', startDate: daysAgo(280), endDate: daysFromNow(45), monthlyValue: 65000, createdAt: daysAgo(280) },
  { id: 'contract-5', clientId: 'client-4', contractNumber: 'CTR-2024-005', projectName: 'Sistema de Logística', type: 'fabrica', startDate: daysAgo(260), endDate: daysFromNow(85), monthlyValue: 95000, createdAt: daysAgo(260) },
  { id: 'contract-6', clientId: 'client-5', contractNumber: 'CTR-2024-006', projectName: 'Dashboard Operacional', type: 'staffing', startDate: daysAgo(240), endDate: daysFromNow(75), monthlyValue: 78000, createdAt: daysAgo(240) },
  { id: 'contract-7', clientId: 'client-6', contractNumber: 'CTR-2024-007', projectName: 'IoT Aeronaves', type: 'fabrica', startDate: daysAgo(220), endDate: daysFromNow(70), monthlyValue: 55000, createdAt: daysAgo(220) },
  { id: 'contract-8', clientId: 'client-7', contractNumber: 'CTR-2024-008', projectName: 'App Consultora', type: 'staffing', startDate: daysAgo(200), endDate: daysFromNow(165), monthlyValue: 48000, createdAt: daysAgo(200) },
  { id: 'contract-9', clientId: 'client-2', contractNumber: 'CTR-2024-009', projectName: 'Marketplace B2B', type: 'fabrica', startDate: daysAgo(180), endDate: daysFromNow(185), monthlyValue: 72000, createdAt: daysAgo(180) },
  { id: 'contract-10', clientId: 'client-3', contractNumber: 'CTR-2024-010', projectName: 'Sistema de Manutenção', type: 'fabrica', startDate: daysAgo(160), endDate: daysFromNow(205), monthlyValue: 88000, createdAt: daysAgo(160) },
  { id: 'contract-11', clientId: 'client-4', contractNumber: 'CTR-2024-011', projectName: 'Portal RH', type: 'staffing', startDate: daysAgo(140), endDate: daysFromNow(225), monthlyValue: 62000, createdAt: daysAgo(140) },
  { id: 'contract-12', clientId: 'client-8', contractNumber: 'INT-2024-001', projectName: 'Plataforma Interna', type: 'fabrica', startDate: daysAgo(100), endDate: daysFromNow(265), monthlyValue: 0, createdAt: daysAgo(100) },
  { id: 'contract-13', clientId: 'client-5', contractNumber: 'CTR-2023-001', projectName: 'Sistema Legado', type: 'staffing', startDate: daysAgo(400), endDate: daysAgo(35), monthlyValue: 45000, createdAt: daysAgo(400) },
];

// Seed Positions
export const seedPositions: Position[] = [
  { id: 'pos-1', contractId: 'contract-1', title: 'Senior React Developer', stackId: 'stack-1', seniorityId: 'sen-4', status: 'filled', startDate: daysAgo(335), endDate: daysFromNow(25), allocationPercentage: 100, createdAt: daysAgo(335) },
  { id: 'pos-2', contractId: 'contract-1', title: 'Tech Lead', stackId: 'stack-11', seniorityId: 'sen-4', status: 'filled', startDate: daysAgo(335), endDate: daysFromNow(25), allocationPercentage: 100, createdAt: daysAgo(335) },
  { id: 'pos-3', contractId: 'contract-1', title: 'QA Analyst', stackId: 'stack-6', seniorityId: 'sen-7', status: 'filled', startDate: daysAgo(200), endDate: daysFromNow(25), allocationPercentage: 100, createdAt: daysAgo(200) },
  { id: 'pos-4', contractId: 'contract-2', title: 'Full Stack Developer', stackId: 'stack-12', seniorityId: 'sen-3', status: 'filled', startDate: daysAgo(320), endDate: daysFromNow(15), allocationPercentage: 100, createdAt: daysAgo(320) },
  { id: 'pos-5', contractId: 'contract-2', title: 'DevOps Engineer', stackId: 'stack-5', seniorityId: 'sen-3', status: 'filled', startDate: daysAgo(320), endDate: daysFromNow(15), allocationPercentage: 50, createdAt: daysAgo(320) },
  { id: 'pos-6', contractId: 'contract-3', title: 'Software Architect', stackId: 'stack-13', seniorityId: 'sen-5', status: 'filled', startDate: daysAgo(300), endDate: daysAgo(150), allocationPercentage: 100, createdAt: daysAgo(300) },
  { id: 'pos-7', contractId: 'contract-3', title: 'Product Owner', stackId: 'stack-8', seniorityId: 'sen-10', status: 'filled', startDate: daysAgo(300), endDate: daysFromNow(55), allocationPercentage: 50, createdAt: daysAgo(300) },
  { id: 'pos-8', contractId: 'contract-3', title: 'Java Developer', stackId: 'stack-4', seniorityId: 'sen-4', status: 'filled', startDate: daysAgo(280), endDate: daysFromNow(55), allocationPercentage: 100, createdAt: daysAgo(280) },
  { id: 'pos-9', contractId: 'contract-3', title: 'Python Developer', stackId: 'stack-3', seniorityId: 'sen-3', status: 'filled', startDate: daysAgo(280), endDate: daysFromNow(55), allocationPercentage: 100, createdAt: daysAgo(280) },
  { id: 'pos-10', contractId: 'contract-3', title: 'QA Automation', stackId: 'stack-7', seniorityId: 'sen-8', status: 'filled', startDate: daysAgo(200), endDate: daysFromNow(55), allocationPercentage: 100, createdAt: daysAgo(200) },
  { id: 'pos-11', contractId: 'contract-3', title: 'Scrum Master', stackId: 'stack-10', seniorityId: 'sen-10', status: 'filled', startDate: daysAgo(300), endDate: daysFromNow(55), allocationPercentage: 50, createdAt: daysAgo(300) },
  { id: 'pos-12', contractId: 'contract-4', title: 'React Developer', stackId: 'stack-1', seniorityId: 'sen-3', status: 'filled', startDate: daysAgo(280), endDate: daysFromNow(45), allocationPercentage: 100, createdAt: daysAgo(280) },
  { id: 'pos-13', contractId: 'contract-4', title: 'QA Automation', stackId: 'stack-7', seniorityId: 'sen-7', status: 'open', startDate: daysAgo(280), endDate: daysFromNow(45), allocationPercentage: 100, createdAt: daysAgo(280) },
  { id: 'pos-14', contractId: 'contract-5', title: 'Product Owner', stackId: 'stack-8', seniorityId: 'sen-11', status: 'filled', startDate: daysAgo(260), endDate: daysFromNow(85), allocationPercentage: 100, createdAt: daysAgo(260) },
  { id: 'pos-15', contractId: 'contract-5', title: 'React Developer', stackId: 'stack-1', seniorityId: 'sen-4', status: 'filled', startDate: daysAgo(240), endDate: daysFromNow(85), allocationPercentage: 100, createdAt: daysAgo(240) },
  { id: 'pos-16', contractId: 'contract-5', title: 'Node.js Developer', stackId: 'stack-2', seniorityId: 'sen-3', status: 'filled', startDate: daysAgo(240), endDate: daysFromNow(85), allocationPercentage: 100, createdAt: daysAgo(240) },
  { id: 'pos-17', contractId: 'contract-5', title: 'QA Analyst', stackId: 'stack-6', seniorityId: 'sen-7', status: 'filled', startDate: daysAgo(180), endDate: daysFromNow(85), allocationPercentage: 100, createdAt: daysAgo(180) },
  { id: 'pos-18', contractId: 'contract-6', title: 'DevOps Engineer', stackId: 'stack-5', seniorityId: 'sen-4', status: 'filled', startDate: daysAgo(240), endDate: daysFromNow(75), allocationPercentage: 50, createdAt: daysAgo(240) },
  { id: 'pos-19', contractId: 'contract-6', title: 'Full Stack Developer', stackId: 'stack-12', seniorityId: 'sen-3', status: 'open', startDate: daysAgo(240), endDate: daysFromNow(75), allocationPercentage: 100, createdAt: daysAgo(240) },
  { id: 'pos-20', contractId: 'contract-7', title: 'Java Developer', stackId: 'stack-4', seniorityId: 'sen-4', status: 'filled', startDate: daysAgo(220), endDate: daysFromNow(70), allocationPercentage: 100, createdAt: daysAgo(220) },
  { id: 'pos-21', contractId: 'contract-7', title: 'Project Manager', stackId: 'stack-9', seniorityId: 'sen-11', status: 'filled', startDate: daysAgo(220), endDate: daysFromNow(70), allocationPercentage: 100, createdAt: daysAgo(220) },
  { id: 'pos-22', contractId: 'contract-8', title: 'Python Developer', stackId: 'stack-3', seniorityId: 'sen-3', status: 'filled', startDate: daysAgo(200), endDate: daysFromNow(165), allocationPercentage: 100, createdAt: daysAgo(200) },
  { id: 'pos-23', contractId: 'contract-8', title: 'QA Analyst', stackId: 'stack-6', seniorityId: 'sen-7', status: 'filled', startDate: daysAgo(200), endDate: daysFromNow(165), allocationPercentage: 100, createdAt: daysAgo(200) },
  { id: 'pos-24', contractId: 'contract-9', title: 'Tech Lead', stackId: 'stack-11', seniorityId: 'sen-5', status: 'filled', startDate: daysAgo(180), endDate: daysFromNow(185), allocationPercentage: 100, createdAt: daysAgo(180) },
  { id: 'pos-25', contractId: 'contract-9', title: 'React Developer', stackId: 'stack-1', seniorityId: 'sen-3', status: 'filled', startDate: daysAgo(180), endDate: daysFromNow(185), allocationPercentage: 100, createdAt: daysAgo(180) },
  { id: 'pos-26', contractId: 'contract-9', title: 'Node.js Developer', stackId: 'stack-2', seniorityId: 'sen-3', status: 'open', startDate: daysAgo(180), endDate: daysFromNow(185), allocationPercentage: 100, createdAt: daysAgo(180) },
  { id: 'pos-27', contractId: 'contract-10', title: 'Java Developer', stackId: 'stack-4', seniorityId: 'sen-4', status: 'filled', startDate: daysAgo(160), endDate: daysFromNow(205), allocationPercentage: 100, createdAt: daysAgo(160) },
  { id: 'pos-28', contractId: 'contract-10', title: 'DevOps Engineer', stackId: 'stack-5', seniorityId: 'sen-4', status: 'filled', startDate: daysAgo(160), endDate: daysFromNow(205), allocationPercentage: 100, createdAt: daysAgo(160) },
  { id: 'pos-29', contractId: 'contract-10', title: 'QA Automation', stackId: 'stack-7', seniorityId: 'sen-8', status: 'filled', startDate: daysAgo(160), endDate: daysFromNow(205), allocationPercentage: 100, createdAt: daysAgo(160) },
  { id: 'pos-30', contractId: 'contract-11', title: 'Full Stack Developer', stackId: 'stack-12', seniorityId: 'sen-3', status: 'filled', startDate: daysAgo(140), endDate: daysFromNow(225), allocationPercentage: 100, createdAt: daysAgo(140) },
  { id: 'pos-31', contractId: 'contract-11', title: 'Product Owner', stackId: 'stack-8', seniorityId: 'sen-10', status: 'filled', startDate: daysAgo(140), endDate: daysFromNow(225), allocationPercentage: 100, createdAt: daysAgo(140) },
  { id: 'pos-32', contractId: 'contract-12', title: 'UX Designer', stackId: 'stack-14', seniorityId: 'sen-16', status: 'filled', startDate: daysAgo(100), endDate: daysFromNow(50), allocationPercentage: 50, createdAt: daysAgo(100) },
  { id: 'pos-33', contractId: 'contract-12', title: 'React Developer', stackId: 'stack-1', seniorityId: 'sen-3', status: 'filled', startDate: daysAgo(80), endDate: daysFromNow(265), allocationPercentage: 100, createdAt: daysAgo(80) },
];

// Leaders first (they will be referenced by others)
const leaderIds = ['prof-2', 'prof-11', 'prof-15', 'prof-18'];

// Seed Professionals with new structure
export const seedProfessionals: Professional[] = [
  // Leaders
  { id: 'prof-2', name: 'Carlos Eduardo Santos', email: 'carlos.santos@company.com', stackExperiences: [
    { stackId: 'stack-11', seniorityId: 'sen-5', yearsExperience: 8 },
    { stackId: 'stack-1', seniorityId: 'sen-4', yearsExperience: 6 },
    { stackId: 'stack-2', seniorityId: 'sen-4', yearsExperience: 5 },
  ], status: 'allocated', workMode: 'both', totalYearsExperience: 12, createdAt: daysAgo(340) },
  { id: 'prof-11', name: 'Camila Ferreira', email: 'camila.ferreira@company.com', stackExperiences: [
    { stackId: 'stack-8', seniorityId: 'sen-11', yearsExperience: 7 },
    { stackId: 'stack-9', seniorityId: 'sen-10', yearsExperience: 5 },
  ], status: 'partial', workMode: 'both', totalYearsExperience: 10, createdAt: daysAgo(250) },
  { id: 'prof-15', name: 'Tatiana Ribeiro', email: 'tatiana.ribeiro@company.com', stackExperiences: [
    { stackId: 'stack-9', seniorityId: 'sen-11', yearsExperience: 8 },
    { stackId: 'stack-8', seniorityId: 'sen-10', yearsExperience: 5 },
  ], status: 'allocated', workMode: 'factory', totalYearsExperience: 11, createdAt: daysAgo(210) },
  { id: 'prof-18', name: 'Gustavo Pereira', email: 'gustavo.pereira@company.com', stackExperiences: [
    { stackId: 'stack-11', seniorityId: 'sen-5', yearsExperience: 9 },
    { stackId: 'stack-1', seniorityId: 'sen-4', yearsExperience: 7 },
  ], status: 'allocated', workMode: 'factory', totalYearsExperience: 14, createdAt: daysAgo(180) },
  
  // Regular professionals with leaders
  { id: 'prof-1', name: 'Ana Beatriz Silva', email: 'ana.silva@company.com', stackExperiences: [
    { stackId: 'stack-1', seniorityId: 'sen-4', yearsExperience: 5 },
    { stackId: 'stack-12', seniorityId: 'sen-3', yearsExperience: 3 },
  ], status: 'allocated', workMode: 'allocation', leaderId: 'prof-2', totalYearsExperience: 7, createdAt: daysAgo(350) },
  { id: 'prof-3', name: 'Maria Fernanda Costa', email: 'maria.costa@company.com', stackExperiences: [
    { stackId: 'stack-6', seniorityId: 'sen-7', yearsExperience: 3 },
    { stackId: 'stack-7', seniorityId: 'sen-6', yearsExperience: 1 },
  ], status: 'allocated', workMode: 'allocation', leaderId: 'prof-11', totalYearsExperience: 4, createdAt: daysAgo(330) },
  { id: 'prof-4', name: 'João Pedro Oliveira', email: 'joao.oliveira@company.com', stackExperiences: [
    { stackId: 'stack-12', seniorityId: 'sen-3', yearsExperience: 4 },
    { stackId: 'stack-1', seniorityId: 'sen-3', yearsExperience: 3 },
    { stackId: 'stack-2', seniorityId: 'sen-2', yearsExperience: 1 },
  ], status: 'allocated', workMode: 'allocation', leaderId: 'prof-2', totalYearsExperience: 5, createdAt: daysAgo(320) },
  { id: 'prof-5', name: 'Luciana Almeida', email: 'luciana.almeida@company.com', stackExperiences: [
    { stackId: 'stack-5', seniorityId: 'sen-4', yearsExperience: 6 },
  ], status: 'partial', workMode: 'both', leaderId: 'prof-18', totalYearsExperience: 8, createdAt: daysAgo(310) },
  { id: 'prof-6', name: 'Roberto Lima', email: 'roberto.lima@company.com', stackExperiences: [
    { stackId: 'stack-4', seniorityId: 'sen-4', yearsExperience: 7 },
    { stackId: 'stack-3', seniorityId: 'sen-3', yearsExperience: 3 },
  ], status: 'allocated', workMode: 'factory', leaderId: 'prof-18', totalYearsExperience: 9, createdAt: daysAgo(300) },
  { id: 'prof-7', name: 'Fernanda Rodrigues', email: 'fernanda.rodrigues@company.com', stackExperiences: [
    { stackId: 'stack-3', seniorityId: 'sen-3', yearsExperience: 4 },
    { stackId: 'stack-2', seniorityId: 'sen-2', yearsExperience: 2 },
  ], status: 'allocated', workMode: 'factory', leaderId: 'prof-18', totalYearsExperience: 5, createdAt: daysAgo(290) },
  { id: 'prof-8', name: 'Marcos Vinícius', email: 'marcos.vinicius@company.com', stackExperiences: [
    { stackId: 'stack-2', seniorityId: 'sen-3', yearsExperience: 4 },
    { stackId: 'stack-1', seniorityId: 'sen-2', yearsExperience: 2 },
  ], status: 'allocated', workMode: 'factory', leaderId: 'prof-2', totalYearsExperience: 5, createdAt: daysAgo(280) },
  { id: 'prof-9', name: 'Patricia Souza', email: 'patricia.souza@company.com', stackExperiences: [
    { stackId: 'stack-10', seniorityId: 'sen-10', yearsExperience: 5 },
    { stackId: 'stack-9', seniorityId: 'sen-9', yearsExperience: 3 },
  ], status: 'partial', workMode: 'both', leaderId: 'prof-15', totalYearsExperience: 7, createdAt: daysAgo(270) },
  { id: 'prof-10', name: 'Ricardo Mendes', email: 'ricardo.mendes@company.com', stackExperiences: [
    { stackId: 'stack-1', seniorityId: 'sen-3', yearsExperience: 4 },
  ], status: 'allocated', workMode: 'allocation', leaderId: 'prof-2', totalYearsExperience: 4, createdAt: daysAgo(260) },
  { id: 'prof-12', name: 'Bruno Carvalho', email: 'bruno.carvalho@company.com', stackExperiences: [
    { stackId: 'stack-2', seniorityId: 'sen-3', yearsExperience: 4 },
    { stackId: 'stack-5', seniorityId: 'sen-2', yearsExperience: 1 },
  ], status: 'allocated', workMode: 'factory', leaderId: 'prof-18', totalYearsExperience: 5, createdAt: daysAgo(240) },
  { id: 'prof-13', name: 'Juliana Martins', email: 'juliana.martins@company.com', stackExperiences: [
    { stackId: 'stack-5', seniorityId: 'sen-4', yearsExperience: 6 },
  ], status: 'allocated', workMode: 'factory', leaderId: 'prof-18', totalYearsExperience: 7, createdAt: daysAgo(230) },
  { id: 'prof-14', name: 'André Nascimento', email: 'andre.nascimento@company.com', stackExperiences: [
    { stackId: 'stack-4', seniorityId: 'sen-4', yearsExperience: 6 },
  ], status: 'allocated', workMode: 'factory', leaderId: 'prof-18', totalYearsExperience: 8, createdAt: daysAgo(220) },
  { id: 'prof-16', name: 'Felipe Gomes', email: 'felipe.gomes@company.com', stackExperiences: [
    { stackId: 'stack-3', seniorityId: 'sen-3', yearsExperience: 4 },
  ], status: 'allocated', workMode: 'allocation', leaderId: 'prof-2', totalYearsExperience: 4, createdAt: daysAgo(200) },
  { id: 'prof-17', name: 'Amanda Dias', email: 'amanda.dias@company.com', stackExperiences: [
    { stackId: 'stack-6', seniorityId: 'sen-7', yearsExperience: 4 },
    { stackId: 'stack-7', seniorityId: 'sen-6', yearsExperience: 2 },
  ], status: 'allocated', workMode: 'factory', leaderId: 'prof-11', totalYearsExperience: 5, createdAt: daysAgo(190) },
  { id: 'prof-19', name: 'Renata Castro', email: 'renata.castro@company.com', stackExperiences: [
    { stackId: 'stack-1', seniorityId: 'sen-4', yearsExperience: 5 },
    { stackId: 'stack-12', seniorityId: 'sen-3', yearsExperience: 3 },
  ], status: 'allocated', workMode: 'factory', leaderId: 'prof-18', totalYearsExperience: 6, createdAt: daysAgo(170) },
  { id: 'prof-20', name: 'Diego Barbosa', email: 'diego.barbosa@company.com', stackExperiences: [
    { stackId: 'stack-4', seniorityId: 'sen-4', yearsExperience: 6 },
  ], status: 'allocated', workMode: 'factory', leaderId: 'prof-18', totalYearsExperience: 7, createdAt: daysAgo(160) },
  { id: 'prof-21', name: 'Isabela Moreira', email: 'isabela.moreira@company.com', stackExperiences: [
    { stackId: 'stack-5', seniorityId: 'sen-4', yearsExperience: 5 },
  ], status: 'allocated', workMode: 'factory', leaderId: 'prof-18', totalYearsExperience: 6, createdAt: daysAgo(150) },
  { id: 'prof-22', name: 'Thiago Araújo', email: 'thiago.araujo@company.com', stackExperiences: [
    { stackId: 'stack-7', seniorityId: 'sen-8', yearsExperience: 6 },
    { stackId: 'stack-6', seniorityId: 'sen-7', yearsExperience: 4 },
  ], status: 'allocated', workMode: 'factory', leaderId: 'prof-11', totalYearsExperience: 7, createdAt: daysAgo(140) },
  { id: 'prof-23', name: 'Vanessa Lopes', email: 'vanessa.lopes@company.com', stackExperiences: [
    { stackId: 'stack-12', seniorityId: 'sen-3', yearsExperience: 4 },
  ], status: 'allocated', workMode: 'allocation', leaderId: 'prof-2', totalYearsExperience: 4, createdAt: daysAgo(130) },
  { id: 'prof-24', name: 'Leonardo Cardoso', email: 'leonardo.cardoso@company.com', stackExperiences: [
    { stackId: 'stack-8', seniorityId: 'sen-10', yearsExperience: 5 },
  ], status: 'allocated', workMode: 'allocation', leaderId: 'prof-11', totalYearsExperience: 6, createdAt: daysAgo(120) },
  { id: 'prof-25', name: 'Mariana Santos', email: 'mariana.santos@company.com', stackExperiences: [
    { stackId: 'stack-13', seniorityId: 'sen-5', yearsExperience: 10 },
    { stackId: 'stack-11', seniorityId: 'sen-4', yearsExperience: 8 },
  ], status: 'idle', workMode: 'factory', leaderId: 'prof-18', totalYearsExperience: 12, createdAt: daysAgo(110) },
  { id: 'prof-26', name: 'Paulo Henrique', email: 'paulo.henrique@company.com', stackExperiences: [
    { stackId: 'stack-14', seniorityId: 'sen-16', yearsExperience: 4 },
  ], status: 'partial', workMode: 'factory', leaderId: 'prof-11', totalYearsExperience: 5, createdAt: daysAgo(100) },
  { id: 'prof-27', name: 'Carla Mendonça', email: 'carla.mendonca@company.com', stackExperiences: [
    { stackId: 'stack-1', seniorityId: 'sen-3', yearsExperience: 4 },
  ], status: 'allocated', workMode: 'allocation', leaderId: 'prof-2', totalYearsExperience: 4, createdAt: daysAgo(90) },
  { id: 'prof-28', name: 'Eduardo Freitas', email: 'eduardo.freitas@company.com', stackExperiences: [
    { stackId: 'stack-6', seniorityId: 'sen-6', yearsExperience: 1 },
  ], status: 'idle', workMode: 'factory', leaderId: 'prof-11', totalYearsExperience: 2, createdAt: daysAgo(80) },
];

// Seed Allocations
export const seedAllocations: Allocation[] = [
  { id: 'alloc-1', professionalId: 'prof-1', positionId: 'pos-1', startDate: daysAgo(335), endDate: daysFromNow(25), allocationPercentage: 100, createdAt: daysAgo(335) },
  { id: 'alloc-2', professionalId: 'prof-2', positionId: 'pos-2', startDate: daysAgo(335), endDate: daysFromNow(25), allocationPercentage: 100, createdAt: daysAgo(335) },
  { id: 'alloc-3', professionalId: 'prof-3', positionId: 'pos-3', startDate: daysAgo(200), endDate: daysFromNow(25), allocationPercentage: 100, createdAt: daysAgo(200) },
  { id: 'alloc-4', professionalId: 'prof-4', positionId: 'pos-4', startDate: daysAgo(320), endDate: daysFromNow(15), allocationPercentage: 100, createdAt: daysAgo(320) },
  { id: 'alloc-5', professionalId: 'prof-5', positionId: 'pos-5', startDate: daysAgo(320), endDate: daysFromNow(15), allocationPercentage: 50, createdAt: daysAgo(320) },
  { id: 'alloc-6', professionalId: 'prof-25', positionId: 'pos-6', startDate: daysAgo(300), endDate: daysAgo(150), allocationPercentage: 100, createdAt: daysAgo(300) },
  { id: 'alloc-7', professionalId: 'prof-11', positionId: 'pos-7', startDate: daysAgo(300), endDate: daysFromNow(55), allocationPercentage: 50, createdAt: daysAgo(300) },
  { id: 'alloc-8', professionalId: 'prof-6', positionId: 'pos-8', startDate: daysAgo(280), endDate: daysFromNow(55), allocationPercentage: 100, createdAt: daysAgo(280) },
  { id: 'alloc-9', professionalId: 'prof-7', positionId: 'pos-9', startDate: daysAgo(280), endDate: daysFromNow(55), allocationPercentage: 100, createdAt: daysAgo(280) },
  { id: 'alloc-10', professionalId: 'prof-22', positionId: 'pos-10', startDate: daysAgo(200), endDate: daysFromNow(55), allocationPercentage: 100, createdAt: daysAgo(200) },
  { id: 'alloc-11', professionalId: 'prof-9', positionId: 'pos-11', startDate: daysAgo(300), endDate: daysFromNow(55), allocationPercentage: 50, createdAt: daysAgo(300) },
  { id: 'alloc-12', professionalId: 'prof-10', positionId: 'pos-12', startDate: daysAgo(280), endDate: daysFromNow(45), allocationPercentage: 100, createdAt: daysAgo(280) },
  { id: 'alloc-13', professionalId: 'prof-11', positionId: 'pos-14', startDate: daysAgo(260), endDate: daysFromNow(85), allocationPercentage: 50, createdAt: daysAgo(260) },
  { id: 'alloc-14', professionalId: 'prof-19', positionId: 'pos-15', startDate: daysAgo(240), endDate: daysFromNow(85), allocationPercentage: 100, createdAt: daysAgo(240) },
  { id: 'alloc-15', professionalId: 'prof-12', positionId: 'pos-16', startDate: daysAgo(240), endDate: daysFromNow(85), allocationPercentage: 100, createdAt: daysAgo(240) },
  { id: 'alloc-16', professionalId: 'prof-17', positionId: 'pos-17', startDate: daysAgo(180), endDate: daysFromNow(85), allocationPercentage: 100, createdAt: daysAgo(180) },
  { id: 'alloc-17', professionalId: 'prof-5', positionId: 'pos-18', startDate: daysAgo(240), endDate: daysFromNow(75), allocationPercentage: 50, createdAt: daysAgo(240) },
  { id: 'alloc-18', professionalId: 'prof-14', positionId: 'pos-20', startDate: daysAgo(220), endDate: daysFromNow(70), allocationPercentage: 100, createdAt: daysAgo(220) },
  { id: 'alloc-19', professionalId: 'prof-15', positionId: 'pos-21', startDate: daysAgo(220), endDate: daysFromNow(70), allocationPercentage: 100, createdAt: daysAgo(220) },
  { id: 'alloc-20', professionalId: 'prof-16', positionId: 'pos-22', startDate: daysAgo(200), endDate: daysFromNow(165), allocationPercentage: 100, createdAt: daysAgo(200) },
  { id: 'alloc-21', professionalId: 'prof-3', positionId: 'pos-23', startDate: daysAgo(200), endDate: daysFromNow(165), allocationPercentage: 100, createdAt: daysAgo(200) },
  { id: 'alloc-22', professionalId: 'prof-18', positionId: 'pos-24', startDate: daysAgo(180), endDate: daysFromNow(185), allocationPercentage: 100, createdAt: daysAgo(180) },
  { id: 'alloc-23', professionalId: 'prof-27', positionId: 'pos-25', startDate: daysAgo(90), endDate: daysFromNow(185), allocationPercentage: 100, createdAt: daysAgo(90) },
  { id: 'alloc-24', professionalId: 'prof-20', positionId: 'pos-27', startDate: daysAgo(160), endDate: daysFromNow(205), allocationPercentage: 100, createdAt: daysAgo(160) },
  { id: 'alloc-25', professionalId: 'prof-21', positionId: 'pos-28', startDate: daysAgo(160), endDate: daysFromNow(205), allocationPercentage: 100, createdAt: daysAgo(160) },
  { id: 'alloc-26', professionalId: 'prof-8', positionId: 'pos-29', startDate: daysAgo(160), endDate: daysFromNow(205), allocationPercentage: 100, createdAt: daysAgo(160) },
  { id: 'alloc-27', professionalId: 'prof-23', positionId: 'pos-30', startDate: daysAgo(140), endDate: daysFromNow(225), allocationPercentage: 100, createdAt: daysAgo(140) },
  { id: 'alloc-28', professionalId: 'prof-24', positionId: 'pos-31', startDate: daysAgo(140), endDate: daysFromNow(225), allocationPercentage: 100, createdAt: daysAgo(140) },
  { id: 'alloc-29', professionalId: 'prof-26', positionId: 'pos-32', startDate: daysAgo(100), endDate: daysFromNow(50), allocationPercentage: 50, createdAt: daysAgo(100) },
  { id: 'alloc-30', professionalId: 'prof-13', positionId: 'pos-33', startDate: daysAgo(80), endDate: daysFromNow(265), allocationPercentage: 100, createdAt: daysAgo(80) },
];

// Seed Factory Projects
export const seedFactoryProjects: FactoryProject[] = [
  { id: 'fp-1', name: 'Sistema de Gestão de Poços', clientId: 'client-3', description: 'Sistema completo de gestão de poços de petróleo', startDate: daysAgo(300), endDate: daysFromNow(55), status: 'in_progress', progressPercentage: 75, createdAt: daysAgo(300) },
  { id: 'fp-2', name: 'Sistema de Logística', clientId: 'client-4', description: 'Plataforma de gestão logística integrada', startDate: daysAgo(260), endDate: daysFromNow(85), status: 'in_progress', progressPercentage: 60, createdAt: daysAgo(260) },
  { id: 'fp-3', name: 'IoT Aeronaves', clientId: 'client-6', description: 'Sistema IoT para monitoramento de aeronaves', startDate: daysAgo(220), endDate: daysFromNow(70), status: 'in_progress', progressPercentage: 55, createdAt: daysAgo(220) },
  { id: 'fp-4', name: 'Marketplace B2B', clientId: 'client-2', description: 'Plataforma B2B de marketplace', startDate: daysAgo(180), endDate: daysFromNow(185), status: 'in_progress', progressPercentage: 40, createdAt: daysAgo(180) },
  { id: 'fp-5', name: 'Sistema de Manutenção', clientId: 'client-3', description: 'Sistema de gestão de manutenção preventiva', startDate: daysAgo(160), endDate: daysFromNow(205), status: 'in_progress', progressPercentage: 35, createdAt: daysAgo(160) },
  { id: 'fp-6', name: 'Plataforma Interna', clientId: 'client-8', description: 'Plataforma interna de gestão', startDate: daysAgo(100), endDate: daysFromNow(265), status: 'in_progress', progressPercentage: 20, createdAt: daysAgo(100) },
  { id: 'fp-7', name: 'App Mobile Corporativo', clientId: 'client-1', description: 'Aplicativo mobile para uso corporativo', startDate: daysFromNow(30), endDate: daysFromNow(180), status: 'planned', progressPercentage: 0, createdAt: daysAgo(10) },
];

// Seed Factory Allocations
export const seedFactoryAllocations: FactoryAllocation[] = [
  // FP-1 Sistema de Gestão de Poços
  { id: 'fa-1', projectId: 'fp-1', professionalId: 'prof-6', role: 'dev', stackId: 'stack-4', startDate: daysAgo(280), endDate: daysFromNow(55), allocationPercentage: 100, createdAt: daysAgo(280) },
  { id: 'fa-2', projectId: 'fp-1', professionalId: 'prof-7', role: 'dev', stackId: 'stack-3', startDate: daysAgo(280), endDate: daysFromNow(55), allocationPercentage: 100, createdAt: daysAgo(280) },
  { id: 'fa-3', projectId: 'fp-1', professionalId: 'prof-22', role: 'qa', stackId: 'stack-7', startDate: daysAgo(200), endDate: daysFromNow(55), allocationPercentage: 100, createdAt: daysAgo(200) },
  { id: 'fa-4', projectId: 'fp-1', professionalId: 'prof-9', role: 'scrum_master', stackId: 'stack-10', startDate: daysAgo(300), endDate: daysFromNow(55), allocationPercentage: 50, createdAt: daysAgo(300) },
  // FP-2 Sistema de Logística
  { id: 'fa-5', projectId: 'fp-2', professionalId: 'prof-19', role: 'dev', stackId: 'stack-1', startDate: daysAgo(240), endDate: daysFromNow(85), allocationPercentage: 100, createdAt: daysAgo(240) },
  { id: 'fa-6', projectId: 'fp-2', professionalId: 'prof-12', role: 'dev', stackId: 'stack-2', startDate: daysAgo(240), endDate: daysFromNow(85), allocationPercentage: 100, createdAt: daysAgo(240) },
  { id: 'fa-7', projectId: 'fp-2', professionalId: 'prof-17', role: 'qa', stackId: 'stack-6', startDate: daysAgo(180), endDate: daysFromNow(85), allocationPercentage: 100, createdAt: daysAgo(180) },
  // FP-3 IoT Aeronaves
  { id: 'fa-8', projectId: 'fp-3', professionalId: 'prof-14', role: 'dev', stackId: 'stack-4', startDate: daysAgo(220), endDate: daysFromNow(70), allocationPercentage: 100, createdAt: daysAgo(220) },
  { id: 'fa-9', projectId: 'fp-3', professionalId: 'prof-15', role: 'pm', stackId: 'stack-9', startDate: daysAgo(220), endDate: daysFromNow(70), allocationPercentage: 100, createdAt: daysAgo(220) },
  // FP-4 Marketplace B2B
  { id: 'fa-10', projectId: 'fp-4', professionalId: 'prof-18', role: 'tech_lead', stackId: 'stack-11', startDate: daysAgo(180), endDate: daysFromNow(185), allocationPercentage: 100, createdAt: daysAgo(180) },
  // FP-5 Sistema de Manutenção
  { id: 'fa-11', projectId: 'fp-5', professionalId: 'prof-20', role: 'dev', stackId: 'stack-4', startDate: daysAgo(160), endDate: daysFromNow(205), allocationPercentage: 100, createdAt: daysAgo(160) },
  { id: 'fa-12', projectId: 'fp-5', professionalId: 'prof-21', role: 'dev', stackId: 'stack-5', startDate: daysAgo(160), endDate: daysFromNow(205), allocationPercentage: 100, createdAt: daysAgo(160) },
  { id: 'fa-13', projectId: 'fp-5', professionalId: 'prof-8', role: 'qa', stackId: 'stack-7', startDate: daysAgo(160), endDate: daysFromNow(205), allocationPercentage: 100, createdAt: daysAgo(160) },
  // FP-6 Plataforma Interna
  { id: 'fa-14', projectId: 'fp-6', professionalId: 'prof-26', role: 'ux', stackId: 'stack-14', startDate: daysAgo(100), endDate: daysFromNow(50), allocationPercentage: 50, createdAt: daysAgo(100) },
  { id: 'fa-15', projectId: 'fp-6', professionalId: 'prof-13', role: 'dev', stackId: 'stack-5', startDate: daysAgo(80), endDate: daysFromNow(265), allocationPercentage: 100, createdAt: daysAgo(80) },
];

// Default demo user
export const seedUsers: User[] = [
  { id: 'user-1', email: 'admin@gestaocontratos.com', name: 'Administrador', createdAt: daysAgo(365) },
];
