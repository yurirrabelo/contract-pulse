import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AllocationTimelineEntry, ContractType } from '@/types';
import { differenceInDays, format, parseISO, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Filter } from 'lucide-react';

interface AllocationTimelineProps {
  allocations: AllocationTimelineEntry[];
}

const categoryColors: Record<string, string> = {
  development: 'bg-primary',
  qa: 'bg-warning',
  management: 'bg-info',
};

const typeColors: Record<ContractType, string> = {
  staffing: 'bg-success',
  fabrica: 'bg-purple-500',
};

export function AllocationTimeline({ allocations }: AllocationTimelineProps) {
  const [monthsToShow, setMonthsToShow] = useState<number>(3);
  const [typeFilter, setTypeFilter] = useState<'all' | ContractType>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');

  const filteredAllocations = useMemo(() => {
    return allocations.filter(a => {
      if (typeFilter !== 'all' && a.contractType !== typeFilter) return false;
      if (categoryFilter !== 'all' && a.stackCategory !== categoryFilter) return false;
      return true;
    });
  }, [allocations, typeFilter, categoryFilter]);

  const timelineData = useMemo(() => {
    const today = new Date();
    const startDate = startOfMonth(today);
    const endDate = endOfMonth(addMonths(today, monthsToShow - 1));
    
    const totalDays = differenceInDays(endDate, startDate) + 1;
    
    // Group by professional
    const groupedByProfessional = filteredAllocations.reduce((acc, allocation) => {
      if (!acc[allocation.professionalId]) {
        acc[allocation.professionalId] = {
          name: allocation.professionalName,
          allocations: [],
        };
      }
      acc[allocation.professionalId].allocations.push(allocation);
      return acc;
    }, {} as Record<string, { name: string; allocations: AllocationTimelineEntry[] }>);

    // Generate months headers
    const months: { label: string; days: number; startDay: number }[] = [];
    let currentDate = startDate;
    let dayOffset = 0;
    
    while (currentDate <= endDate) {
      const monthEnd = endOfMonth(currentDate);
      const effectiveEnd = monthEnd > endDate ? endDate : monthEnd;
      const daysInRange = differenceInDays(effectiveEnd, currentDate) + 1;
      
      months.push({
        label: format(currentDate, 'MMMM yyyy', { locale: ptBR }),
        days: daysInRange,
        startDay: dayOffset,
      });
      
      dayOffset += daysInRange;
      currentDate = startOfMonth(addMonths(currentDate, 1));
    }

    return {
      startDate,
      endDate,
      totalDays,
      months,
      professionals: Object.entries(groupedByProfessional).map(([id, data]) => ({
        id,
        name: data.name,
        allocations: data.allocations.map(a => {
          const allocStart = parseISO(a.startDate);
          const allocEnd = parseISO(a.endDate);
          
          const effectiveStart = allocStart < startDate ? startDate : allocStart;
          const effectiveEnd = allocEnd > endDate ? endDate : allocEnd;
          
          const startOffset = Math.max(0, differenceInDays(effectiveStart, startDate));
          const duration = Math.max(1, differenceInDays(effectiveEnd, effectiveStart) + 1);
          
          return {
            ...a,
            startOffset,
            duration,
            isVisible: effectiveStart <= endDate && effectiveEnd >= startDate,
          };
        }).filter(a => a.isVisible),
      })),
    };
  }, [filteredAllocations, monthsToShow]);

  if (allocations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline de Alocações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhuma alocação encontrada
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline de Alocações
          </CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'all' | ContractType)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="staffing">Staffing</SelectItem>
                <SelectItem value="fabrica">Fábrica</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas áreas</SelectItem>
                <SelectItem value="development">Desenvolvimento</SelectItem>
                <SelectItem value="qa">QA</SelectItem>
                <SelectItem value="management">Gestão</SelectItem>
              </SelectContent>
            </Select>
            <Select value={monthsToShow.toString()} onValueChange={(v) => setMonthsToShow(parseInt(v))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 meses</SelectItem>
                <SelectItem value="6">6 meses</SelectItem>
                <SelectItem value="12">12 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded ${typeColors.staffing}`}></div>
            <span className="text-muted-foreground">Staffing</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded ${typeColors.fabrica}`}></div>
            <span className="text-muted-foreground">Fábrica</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {/* Header with months */}
          <div className="flex border-b border-border pb-2 mb-2 min-w-[800px]">
            <div className="w-48 flex-shrink-0 font-medium text-sm text-muted-foreground">
              Profissional
            </div>
            <div className="flex-1 flex">
              {timelineData.months.map((month, idx) => (
                <div
                  key={idx}
                  className="text-center text-sm font-medium capitalize border-l border-border first:border-l-0 px-1"
                  style={{ width: `${(month.days / timelineData.totalDays) * 100}%` }}
                >
                  {month.label}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline rows */}
          <div className="space-y-1 min-w-[800px]">
            {timelineData.professionals.map((professional) => (
              <div key={professional.id} className="flex items-center h-10 hover:bg-muted/30 rounded">
                <div className="w-48 flex-shrink-0 text-sm font-medium truncate pr-2">
                  {professional.name}
                </div>
                <div className="flex-1 relative h-6 bg-muted/20 rounded">
                  {professional.allocations.map((allocation, idx) => (
                    <div
                      key={idx}
                      className={`absolute h-full rounded flex items-center justify-center text-xs text-white font-medium overflow-hidden cursor-pointer transition-opacity hover:opacity-80 ${typeColors[allocation.contractType]}`}
                      style={{
                        left: `${(allocation.startOffset / timelineData.totalDays) * 100}%`,
                        width: `${Math.max((allocation.duration / timelineData.totalDays) * 100, 2)}%`,
                      }}
                      title={`${allocation.positionTitle} - ${allocation.clientName} (${allocation.allocationPercentage}%)`}
                    >
                      <span className="truncate px-1">
                        {allocation.stackName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {timelineData.professionals.length === 0 && (
            <p className="text-muted-foreground text-center py-4 text-sm">
              Nenhuma alocação visível no período selecionado
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}