-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('STAFFING', 'FACTORY');

-- CreateEnum
CREATE TYPE "PositionStatus" AS ENUM ('OPEN', 'FILLED');

-- CreateEnum
CREATE TYPE "ProfessionalStatus" AS ENUM ('ALLOCATED', 'IDLE', 'PARTIAL', 'VACATION', 'NOTICE');

-- CreateEnum
CREATE TYPE "ProfessionalWorkMode" AS ENUM ('ALLOCATION', 'FACTORY', 'BOTH');

-- CreateEnum
CREATE TYPE "FactoryProjectStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'FINISHED', 'PAUSED');

-- CreateEnum
CREATE TYPE "FactoryRole" AS ENUM ('DEV', 'QA', 'PO', 'PM', 'TECH_LEAD', 'ARCHITECT', 'SCRUM_MASTER', 'UX', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "contract_number" TEXT NOT NULL,
    "project_name" TEXT,
    "type" "ContractType" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "client_id" TEXT,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stack_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stack_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stacks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seniorities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "category_id" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seniorities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "general_seniorities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "general_seniorities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "stack_id" TEXT NOT NULL,
    "seniority_id" TEXT,
    "status" "PositionStatus" NOT NULL DEFAULT 'OPEN',
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "allocation_percentage" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professionals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "general_seniority_id" TEXT,
    "status" "ProfessionalStatus" NOT NULL DEFAULT 'IDLE',
    "work_mode" "ProfessionalWorkMode" NOT NULL,
    "leader_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "professionals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professional_stack_experiences" (
    "id" TEXT NOT NULL,
    "professional_id" TEXT NOT NULL,
    "stack_id" TEXT NOT NULL,

    CONSTRAINT "professional_stack_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocations" (
    "id" TEXT NOT NULL,
    "professional_id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "allocation_percentage" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factory_projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "client_id" TEXT,
    "description" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "FactoryProjectStatus" NOT NULL DEFAULT 'PLANNED',
    "progress_percentage" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "factory_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factory_allocations" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "professional_id" TEXT NOT NULL,
    "role" "FactoryRole" NOT NULL,
    "stack_id" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "allocation_percentage" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "factory_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_cnpj_key" ON "clients"("cnpj");

-- CreateIndex
CREATE INDEX "clients_name_idx" ON "clients"("name");

-- CreateIndex
CREATE INDEX "clients_cnpj_idx" ON "clients"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_contract_number_key" ON "contracts"("contract_number");

-- CreateIndex
CREATE INDEX "contracts_client_id_idx" ON "contracts"("client_id");

-- CreateIndex
CREATE INDEX "contracts_type_idx" ON "contracts"("type");

-- CreateIndex
CREATE INDEX "contracts_end_date_idx" ON "contracts"("end_date");

-- CreateIndex
CREATE INDEX "contracts_start_date_end_date_idx" ON "contracts"("start_date", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "stack_categories_name_key" ON "stack_categories"("name");

-- CreateIndex
CREATE INDEX "stacks_category_id_idx" ON "stacks"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "stacks_name_category_id_key" ON "stacks"("name", "category_id");

-- CreateIndex
CREATE INDEX "seniorities_category_id_idx" ON "seniorities"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "seniorities_name_category_id_key" ON "seniorities"("name", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "seniorities_level_category_id_key" ON "seniorities"("level", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "general_seniorities_name_key" ON "general_seniorities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "general_seniorities_level_key" ON "general_seniorities"("level");

-- CreateIndex
CREATE INDEX "general_seniorities_level_idx" ON "general_seniorities"("level");

-- CreateIndex
CREATE INDEX "positions_contract_id_idx" ON "positions"("contract_id");

-- CreateIndex
CREATE INDEX "positions_stack_id_idx" ON "positions"("stack_id");

-- CreateIndex
CREATE INDEX "positions_seniority_id_idx" ON "positions"("seniority_id");

-- CreateIndex
CREATE INDEX "positions_status_idx" ON "positions"("status");

-- CreateIndex
CREATE INDEX "positions_start_date_end_date_idx" ON "positions"("start_date", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "professionals_email_key" ON "professionals"("email");

-- CreateIndex
CREATE INDEX "professionals_general_seniority_id_idx" ON "professionals"("general_seniority_id");

-- CreateIndex
CREATE INDEX "professionals_leader_id_idx" ON "professionals"("leader_id");

-- CreateIndex
CREATE INDEX "professionals_status_idx" ON "professionals"("status");

-- CreateIndex
CREATE INDEX "professionals_work_mode_idx" ON "professionals"("work_mode");

-- CreateIndex
CREATE INDEX "professionals_name_idx" ON "professionals"("name");

-- CreateIndex
CREATE INDEX "professional_stack_experiences_stack_id_idx" ON "professional_stack_experiences"("stack_id");

-- CreateIndex
CREATE UNIQUE INDEX "professional_stack_experiences_professional_id_stack_id_key" ON "professional_stack_experiences"("professional_id", "stack_id");

-- CreateIndex
CREATE INDEX "allocations_professional_id_idx" ON "allocations"("professional_id");

-- CreateIndex
CREATE INDEX "allocations_position_id_idx" ON "allocations"("position_id");

-- CreateIndex
CREATE INDEX "allocations_start_date_end_date_idx" ON "allocations"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "allocations_professional_id_start_date_end_date_idx" ON "allocations"("professional_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "factory_projects_client_id_idx" ON "factory_projects"("client_id");

-- CreateIndex
CREATE INDEX "factory_projects_status_idx" ON "factory_projects"("status");

-- CreateIndex
CREATE INDEX "factory_projects_start_date_end_date_idx" ON "factory_projects"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "factory_allocations_project_id_idx" ON "factory_allocations"("project_id");

-- CreateIndex
CREATE INDEX "factory_allocations_professional_id_idx" ON "factory_allocations"("professional_id");

-- CreateIndex
CREATE INDEX "factory_allocations_stack_id_idx" ON "factory_allocations"("stack_id");

-- CreateIndex
CREATE INDEX "factory_allocations_start_date_end_date_idx" ON "factory_allocations"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "factory_allocations_professional_id_start_date_end_date_idx" ON "factory_allocations"("professional_id", "start_date", "end_date");

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stacks" ADD CONSTRAINT "stacks_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "stack_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seniorities" ADD CONSTRAINT "seniorities_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "stack_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_stack_id_fkey" FOREIGN KEY ("stack_id") REFERENCES "stacks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_seniority_id_fkey" FOREIGN KEY ("seniority_id") REFERENCES "seniorities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_general_seniority_id_fkey" FOREIGN KEY ("general_seniority_id") REFERENCES "general_seniorities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "professionals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_stack_experiences" ADD CONSTRAINT "professional_stack_experiences_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_stack_experiences" ADD CONSTRAINT "professional_stack_experiences_stack_id_fkey" FOREIGN KEY ("stack_id") REFERENCES "stacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factory_projects" ADD CONSTRAINT "factory_projects_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factory_allocations" ADD CONSTRAINT "factory_allocations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "factory_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factory_allocations" ADD CONSTRAINT "factory_allocations_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factory_allocations" ADD CONSTRAINT "factory_allocations_stack_id_fkey" FOREIGN KEY ("stack_id") REFERENCES "stacks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
