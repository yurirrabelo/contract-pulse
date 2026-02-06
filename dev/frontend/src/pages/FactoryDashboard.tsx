import { useData } from '@/contexts/DataContext';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDate, formatCurrency } from '@/lib/storage';
import {
  Factory,
  FolderKanban,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle,
  Pause,
  PlayCircle,
  Calendar,
} from 'lucide-react';
import { FactoryGanttChart } from '@/components/factory/FactoryGanttChart';
import { FactoryOccupancyCard } from '@/components/factory/FactoryOccupancyCard';
import { FactoryIdleAlertsCard } from '@/components/factory/FactoryIdleAlertsCard';

const statusConfig = {
  planned: { label: 'Planejado', icon: Calendar, className: 'bg-info text-info-foreground' },
  in_progress: { label: 'Em Andamento', icon: PlayCircle, className: 'bg-success text-success-foreground' },
  finished: { label: 'Finalizado', icon: CheckCircle, className: 'bg-muted text-muted-foreground' },
  paused: { label: 'Pausado', icon: Pause, className: 'bg-warning text-warning-foreground' },
};

export default function FactoryDashboard() {
  const {
    factoryMetrics,
    factoryProjectsWithDetails,
    factoryIdleForecasts,
    factoryGanttData,
    professionals,
  } = useData();

  const activeProjects = factoryProjectsWithDetails.filter(p => p.status === 'in_progress');
  const delayedProjects = activeProjects.filter(p => {
    const today = new Date();
    const endDate = new Date(p.endDate);
    const expectedProgress = Math.min(100, (p.daysElapsed / p.totalDays) * 100);
    return p.progressPercentage < expectedProgress - 10 && today < endDate;
  });

  // Profissionais que trabalham na fábrica
  const factoryProfessionals = professionals.filter(
    p => p.workMode === 'factory' || p.workMode === 'both'
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Factory className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Dashboard Fábrica de Software</h1>
        </div>
        <p className="text-muted-foreground">
          Visão geral dos projetos, ocupação e previsão de ociosidade
        </p>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total de Projetos"
          value={factoryMetrics.totalProjects}
          icon={FolderKanban}
          variant="primary"
        />
        <MetricCard
          title="Em Andamento"
          value={factoryMetrics.activeProjects}
          icon={PlayCircle}
          variant="success"
        />
        <MetricCard
          title="Planejados"
          value={factoryMetrics.plannedProjects}
          icon={Calendar}
          variant="default"
        />
        <MetricCard
          title="Finalizados"
          value={factoryMetrics.finishedProjects}
          icon={CheckCircle}
          variant="default"
        />
        <MetricCard
          title="Profissionais"
          value={factoryMetrics.totalFactoryProfessionals}
          subtitle={`de ${factoryProfessionals.length} disponíveis`}
          icon={Users}
          variant="default"
        />
        <MetricCard
          title="Ocupação Atual"
          value={`${factoryMetrics.currentOccupancyRate.toFixed(0)}%`}
          icon={factoryMetrics.currentOccupancyRate >= 70 ? TrendingUp : TrendingDown}
          variant={factoryMetrics.currentOccupancyRate >= 70 ? 'success' : 'warning'}
        />
      </div>

      {/* Occupancy Forecast */}
      <div className="grid md:grid-cols-2 gap-6">
        <FactoryOccupancyCard
          forecasts={factoryIdleForecasts}
          totalProfessionals={factoryProfessionals.length}
        />
        <FactoryIdleAlertsCard forecasts={factoryIdleForecasts} />
      </div>

      {/* Gantt Chart */}
      <FactoryGanttChart entries={factoryGanttData} />

      {/* Active Projects Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            Projetos em Andamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeProjects.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum projeto em andamento
            </p>
          ) : (
            <div className="space-y-4">
              {activeProjects.map((project) => {
                const config = statusConfig[project.status];
                const isDelayed = delayedProjects.some(p => p.id === project.id);
                
                return (
                  <div
                    key={project.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/30"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{project.name}</h4>
                        <Badge className={config.className}>
                          {config.label}
                        </Badge>
                        {isDelayed && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Atrasado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {project.client && (
                          <span>{project.client.name}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(project.startDate)} - {formatDate(project.endDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {project.totalMembers} profissional(is)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={project.progressPercentage} className="h-2 flex-1" />
                        <span className="text-sm font-medium w-12">
                          {project.progressPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Progresso esperado: {project.calculatedProgress.toFixed(0)}%
                        </span>
                        <span>
                          {project.daysRemaining > 0 
                            ? `${project.daysRemaining} dias restantes`
                            : 'Prazo encerrado'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delayed Projects Alert */}
      {delayedProjects.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Projetos com Atraso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {delayedProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 rounded bg-destructive/10"
                >
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Progresso: {project.progressPercentage.toFixed(0)}% (esperado: {project.calculatedProgress.toFixed(0)}%)
                    </p>
                  </div>
                  <Badge variant="destructive">
                    {(project.calculatedProgress - project.progressPercentage).toFixed(0)}% atrasado
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
