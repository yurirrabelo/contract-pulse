import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface OccupancyRateCardProps {
  totalPositions: number;
  filledPositions: number;
  openPositions: number;
}

export function OccupancyRateCard({
  totalPositions,
  filledPositions,
  openPositions,
}: OccupancyRateCardProps) {
  const occupancyRate = totalPositions > 0 ? (filledPositions / totalPositions) * 100 : 0;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">Taxa de Ocupação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary">
              {occupancyRate.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              de vagas preenchidas
            </p>
          </div>

          <Progress value={occupancyRate} className="h-3" />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{totalPositions}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="p-3 rounded-lg bg-success/10">
              <p className="text-2xl font-bold text-success">{filledPositions}</p>
              <p className="text-xs text-muted-foreground">Preenchidas</p>
            </div>
            <div className="p-3 rounded-lg bg-warning/10">
              <p className="text-2xl font-bold text-warning">{openPositions}</p>
              <p className="text-xs text-muted-foreground">Abertas</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
