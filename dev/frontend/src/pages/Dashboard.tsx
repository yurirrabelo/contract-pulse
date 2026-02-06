import { useData } from "@/contexts/DataContext";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ExpirationAlertCard } from "@/components/dashboard/ExpirationAlertCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { StackDistributionChart } from "@/components/dashboard/StackDistributionChart";
import { OccupancyRateCard } from "@/components/dashboard/OccupancyRateCard";
import { ClientOverviewCard } from "@/components/dashboard/ClientOverviewCard";
import { AllocationTimeline } from "@/components/dashboard/AllocationTimeline";
import { OccupancyForecastCard } from "@/components/dashboard/OccupancyForecastCard";
import { formatCurrency } from "@/lib/storage";
import {
  FileText,
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  AlertCircle,
  Factory,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const {
    dashboardMetrics,
    expiringContractsGroups,
    stackDistributions,
    clientSummaries,
    allocationTimeline,
    occupancyForecasts,
    contracts,
    professionals,
  } = useData();

  const staffingContracts = contracts.filter(
    (c) => c.type === "staffing",
  ).length;
  const fabricaContracts = contracts.filter((c) => c.type === "fabrica").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral dos contratos e análise de risco financeiro
        </p>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Contratos Ativos"
          value={dashboardMetrics.activeContracts}
          subtitle={
            <div className="flex gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                <Briefcase className="h-3 w-3 mr-1" />
                {staffingContracts} Staffing
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Factory className="h-3 w-3 mr-1" />
                {fabricaContracts} Fábrica
              </Badge>
            </div>
          }
          icon={FileText}
          variant="primary"
        />
        <MetricCard
          title="Clientes"
          value={dashboardMetrics.totalClients}
          icon={Building2}
          variant="default"
        />
        <MetricCard
          title="Profissionais"
          value={dashboardMetrics.totalProfessionals}
          icon={Users}
          variant="default"
        />
        <MetricCard
          title="Vagas"
          value={`${dashboardMetrics.filledPositions}/${dashboardMetrics.totalPositions}`}
          subtitle="preenchidas"
          icon={Briefcase}
          variant="default"
        />
        {/* <MetricCard
          title="Receita Mensal"
          value={formatCurrency(dashboardMetrics.monthlyRevenue)}
          icon={TrendingUp}
          variant="success"
        /> */}
      </div>

      {/* Expiration Alerts - Main Focus */}
      {/* <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-danger" />
          <h2 className="text-xl font-semibold">Alertas de Vencimento</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {expiringContractsGroups.map((group) => (
            <ExpirationAlertCard key={group.days} group={group} />
          ))}
        </div>
      </div> */}

      {/* Revenue Analysis
      <RevenueChart
        monthlyRevenue={dashboardMetrics.monthlyRevenue}
        revenueAtRisk30={dashboardMetrics.revenueAtRisk30}
        revenueAtRisk60={dashboardMetrics.revenueAtRisk60}
        revenueAtRisk90={dashboardMetrics.revenueAtRisk90}
      /> */}

      {/* Occupancy Forecast - NEW */}
      <div className="grid md:grid-cols-2 gap-6">
        <OccupancyForecastCard
          forecasts={occupancyForecasts}
          totalProfessionals={professionals.length}
        />
        <OccupancyRateCard
          totalPositions={dashboardMetrics.totalPositions}
          filledPositions={dashboardMetrics.filledPositions}
          openPositions={dashboardMetrics.openPositions}
        />
      </div>

      {/* Analytics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stack Distribution */}
        <div className="lg:col-span-3">
          <StackDistributionChart distributions={stackDistributions} />
        </div>
      </div>

      {/* Allocation Timeline - NEW */}
      <AllocationTimeline allocations={allocationTimeline} />

      {/* Client Overview */}
      {/* <ClientOverviewCard clientSummaries={clientSummaries} /> */}
    </div>
  );
}
