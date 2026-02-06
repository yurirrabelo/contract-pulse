import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StackDistribution } from '@/types';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface StackDistributionChartProps {
  distributions: StackDistribution[];
}

const COLORS = [
  'hsl(221, 83%, 53%)',
  'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(280, 67%, 54%)',
  'hsl(199, 89%, 48%)',
  'hsl(340, 82%, 52%)',
  'hsl(170, 77%, 38%)',
  'hsl(47, 100%, 50%)',
  'hsl(262, 47%, 47%)',
];

const CATEGORY_LABELS = {
  development: 'Desenvolvimento',
  qa: 'QA',
  management: 'Gestão',
};

export function StackDistributionChart({ distributions }: StackDistributionChartProps) {
  const professionalData = distributions
    .filter(d => d.professionalCount > 0)
    .map(d => ({
      name: d.stackName,
      value: d.professionalCount,
      category: d.category,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const categoryData = distributions.reduce((acc, d) => {
    const category = CATEGORY_LABELS[d.category];
    const existing = acc.find(item => item.name === category);
    if (existing) {
      existing.value += d.professionalCount;
    } else {
      acc.push({ name: category, value: d.professionalCount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">Distribuição por Stack</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* By Stack */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-4">Por Stack</h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={professionalData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {professionalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                    formatter={(value: number) => [`${value} profissionais`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {professionalData.slice(0, 4).map((item, index) => (
                <div key={item.name} className="flex items-center gap-1 text-xs">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="truncate max-w-[80px]">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By Category */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-4">Por Categoria</h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                    formatter={(value: number) => [`${value} profissionais`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
