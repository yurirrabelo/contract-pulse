import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/storage';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface RevenueChartProps {
  monthlyRevenue: number;
  revenueAtRisk30: number;
  revenueAtRisk60: number;
  revenueAtRisk90: number;
}

export function RevenueChart({
  monthlyRevenue,
  revenueAtRisk30,
  revenueAtRisk60,
  revenueAtRisk90,
}: RevenueChartProps) {
  const data = [
    {
      name: 'Receita Mensal',
      ativa: monthlyRevenue - revenueAtRisk90,
      risco90: revenueAtRisk90 - revenueAtRisk60,
      risco60: revenueAtRisk60 - revenueAtRisk30,
      risco30: revenueAtRisk30,
    },
  ];

  const safeRevenue = monthlyRevenue - revenueAtRisk90;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">Análise de Receita</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                type="number" 
                tickFormatter={(value) => formatCurrency(value)}
                className="text-xs"
              />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Legend />
              <Bar dataKey="ativa" name="Receita Segura" stackId="a" fill="hsl(142, 71%, 45%)" />
              <Bar dataKey="risco90" name="Risco 90 dias" stackId="a" fill="hsl(221, 83%, 53%)" />
              <Bar dataKey="risco60" name="Risco 60 dias" stackId="a" fill="hsl(38, 92%, 50%)" />
              <Bar dataKey="risco30" name="Risco 30 dias" stackId="a" fill="hsl(0, 84%, 60%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-success/10 border border-success/20">
            <p className="text-xs text-muted-foreground">Receita Segura</p>
            <p className="text-lg font-bold text-success">{formatCurrency(safeRevenue)}</p>
          </div>
          <div className="p-3 rounded-lg bg-alert-90/10 border border-alert-90/20">
            <p className="text-xs text-muted-foreground">Risco em 90 dias</p>
            <p className="text-lg font-bold" style={{ color: 'hsl(221, 83%, 53%)' }}>
              {formatCurrency(revenueAtRisk90)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-alert-60/10 border border-alert-60/20">
            <p className="text-xs text-muted-foreground">Risco em 60 dias</p>
            <p className="text-lg font-bold" style={{ color: 'hsl(38, 92%, 50%)' }}>
              {formatCurrency(revenueAtRisk60)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-alert-30/10 border border-alert-30/20">
            <p className="text-xs text-muted-foreground">Risco em 30 dias</p>
            <p className="text-lg font-bold" style={{ color: 'hsl(0, 84%, 60%)' }}>
              {formatCurrency(revenueAtRisk30)}
            </p>
          </div>
        </div>

        {revenueAtRisk90 > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
            <p className="text-sm">
              <span className="font-medium">⚠️ Insight:</span> Em 90 dias, a perspectiva é perder{' '}
              <span className="font-bold text-danger">{formatCurrency(revenueAtRisk90)}</span> caso
              os contratos não sejam renovados.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
