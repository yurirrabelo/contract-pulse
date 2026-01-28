import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FactoryIdleForecast } from '@/types';
import { AlertTriangle, UserX, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface FactoryIdleAlertsCardProps {
  forecasts: FactoryIdleForecast[];
}

const periodConfig = {
  30: { label: '30 dias', variant: 'destructive' as const },
  60: { label: '60 dias', variant: 'default' as const },
  90: { label: '90 dias', variant: 'secondary' as const },
};

export function FactoryIdleAlertsCard({ forecasts }: FactoryIdleAlertsCardProps) {
  const allIdleProfessionals = forecasts.flatMap(f => 
    f.idleProfessionals.map(p => ({ ...p, period: f.period }))
  );

  // Remove duplicates, keep the earliest period
  const uniqueProfessionals = Array.from(
    allIdleProfessionals.reduce((map, p) => {
      if (!map.has(p.professionalId) || map.get(p.professionalId)!.period > p.period) {
        map.set(p.professionalId, p);
      }
      return map;
    }, new Map<string, typeof allIdleProfessionals[0]>())
  ).map(([_, p]) => p);

  uniqueProfessionals.sort((a, b) => a.daysUntilIdle - b.daysUntilIdle);

  const criticalCount = uniqueProfessionals.filter(p => p.period === 30).length;
  const warningCount = uniqueProfessionals.filter(p => p.period === 60).length;
  const infoCount = uniqueProfessionals.filter(p => p.period === 90).length;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Alertas de Ociosidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary badges */}
        <div className="flex gap-2">
          {criticalCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <UserX className="h-3 w-3" />
              {criticalCount} em 30 dias
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="default" className="gap-1">
              <UserX className="h-3 w-3" />
              {warningCount} em 60 dias
            </Badge>
          )}
          {infoCount > 0 && (
            <Badge variant="secondary" className="gap-1">
              <UserX className="h-3 w-3" />
              {infoCount} em 90 dias
            </Badge>
          )}
        </div>

        {/* Professional list */}
        {uniqueProfessionals.length === 0 ? (
          <div className="text-center py-6">
            <UserX className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Nenhum profissional com previsão de ociosidade nos próximos 90 dias
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uniqueProfessionals.slice(0, 10).map((prof) => {
              const config = periodConfig[prof.period as 30 | 60 | 90];
              return (
                <div
                  key={prof.professionalId}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg',
                    prof.period === 30 
                      ? 'bg-danger/10' 
                      : prof.period === 60 
                        ? 'bg-warning/10' 
                        : 'bg-muted/50'
                  )}
                >
                  <div>
                    <p className="font-medium text-sm">{prof.professionalName}</p>
                    <p className="text-xs text-muted-foreground">
                      {prof.stackName} • {prof.currentProjectName}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={config.variant} className="text-xs">
                      {prof.daysUntilIdle}d
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(prof.allocationEndDate)}
                    </p>
                  </div>
                </div>
              );
            })}
            {uniqueProfessionals.length > 10 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{uniqueProfessionals.length - 10} profissionais
              </p>
            )}
          </div>
        )}

        {/* Action hint */}
        {uniqueProfessionals.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              💡 Considere alocar estes profissionais em novos projetos ou indicar para vendas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
