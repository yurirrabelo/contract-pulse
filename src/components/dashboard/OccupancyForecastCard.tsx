import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { OccupancyForecast } from '@/types';
import { Users, AlertTriangle, TrendingDown, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OccupancyForecastCardProps {
  forecasts: OccupancyForecast[];
  totalProfessionals: number;
}

const periodConfig = {
  30: { label: '30 dias', variant: 'destructive' as const, bgClass: 'bg-danger/10', textClass: 'text-danger' },
  60: { label: '60 dias', variant: 'default' as const, bgClass: 'bg-warning/10', textClass: 'text-warning' },
  90: { label: '90 dias', variant: 'secondary' as const, bgClass: 'bg-info/10', textClass: 'text-info' },
};

export function OccupancyForecastCard({ forecasts, totalProfessionals }: OccupancyForecastCardProps) {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Previsão de Ocupação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Forecast cards */}
        <div className="grid grid-cols-3 gap-4">
          {forecasts.map((forecast) => {
            const config = periodConfig[forecast.period];
            return (
              <div
                key={forecast.period}
                className={cn(
                  'p-4 rounded-lg text-center',
                  config.bgClass
                )}
              >
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{config.label}</span>
                </div>
                <div className={cn('text-3xl font-bold', config.textClass)}>
                  {forecast.occupancyRate.toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ocupação prevista
                </p>
                {forecast.predictedIdle > 0 && (
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-warning" />
                    <span className="text-xs text-warning">
                      {forecast.predictedIdle} ficarão ociosos
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Current vs Forecast comparison */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Comparativo de Ocupação
          </h4>
          
          {forecasts.map((forecast) => {
            const config = periodConfig[forecast.period];
            return (
              <div key={forecast.period} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Em {config.label}</span>
                  <span className={cn('font-medium', config.textClass)}>
                    {forecast.currentAllocated - forecast.predictedIdle} / {totalProfessionals} alocados
                  </span>
                </div>
                <Progress value={forecast.occupancyRate} className="h-2" />
              </div>
            );
          })}
        </div>

        {/* Professionals at risk */}
        {forecasts[0]?.predictedIdleProfessionals.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Profissionais com alocação encerrando em 30 dias
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {forecasts[0].predictedIdleProfessionals.slice(0, 5).map((prof) => (
                <div
                  key={prof.professionalId}
                  className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm"
                >
                  <div>
                    <p className="font-medium">{prof.professionalName}</p>
                    <p className="text-xs text-muted-foreground">
                      {prof.stackName} • {prof.currentClientName}
                    </p>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {prof.daysUntilIdle}d
                  </Badge>
                </div>
              ))}
              {forecasts[0].predictedIdleProfessionals.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{forecasts[0].predictedIdleProfessionals.length - 5} profissionais
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}