import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FactoryIdleForecast } from '@/types';
import { TrendingDown, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FactoryOccupancyCardProps {
  forecasts: FactoryIdleForecast[];
  totalProfessionals: number;
}

const periodConfig = {
  30: { label: '30 dias', bgClass: 'bg-danger/10', textClass: 'text-danger' },
  60: { label: '60 dias', bgClass: 'bg-warning/10', textClass: 'text-warning' },
  90: { label: '90 dias', bgClass: 'bg-info/10', textClass: 'text-info' },
};

export function FactoryOccupancyCard({ forecasts, totalProfessionals }: FactoryOccupancyCardProps) {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Previsão de Ocupação (Fábrica)
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
            const allocated = forecast.currentAllocated - forecast.predictedIdle;
            return (
              <div key={forecast.period} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Em {config.label}</span>
                  <span className={cn('font-medium', config.textClass)}>
                    {Math.max(0, allocated)} / {totalProfessionals} alocados
                  </span>
                </div>
                <Progress value={forecast.occupancyRate} className="h-2" />
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-success">
                {forecasts[0]?.currentAllocated || 0}
              </p>
              <p className="text-xs text-muted-foreground">Alocados agora</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-danger">
                {forecasts[2]?.predictedIdle || 0}
              </p>
              <p className="text-xs text-muted-foreground">Ociosos em 90 dias</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
