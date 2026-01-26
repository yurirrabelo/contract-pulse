import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientSummary } from '@/types';
import { formatCurrency } from '@/lib/storage';
import { Building2 } from 'lucide-react';

interface ClientOverviewCardProps {
  clientSummaries: ClientSummary[];
}

export function ClientOverviewCard({ clientSummaries }: ClientOverviewCardProps) {
  const sortedClients = [...clientSummaries]
    .filter(c => c.totalMonthlyValue > 0)
    .sort((a, b) => b.totalMonthlyValue - a.totalMonthlyValue)
    .slice(0, 5);

  const maxValue = sortedClients[0]?.totalMonthlyValue || 1;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Top Clientes por Receita
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedClients.map((summary, index) => (
            <div key={summary.client.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-5">
                    {index + 1}.
                  </span>
                  <div>
                    <p className="font-medium">{summary.client.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {summary.activeContracts} {summary.activeContracts === 1 ? 'contrato' : 'contratos'} •{' '}
                      {summary.filledPositions}/{summary.totalPositions} vagas
                    </p>
                  </div>
                </div>
                <span className="font-bold">{formatCurrency(summary.totalMonthlyValue)}</span>
              </div>
              <div className="ml-8">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(summary.totalMonthlyValue / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}

          {sortedClients.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              Nenhum cliente com contratos ativos
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
