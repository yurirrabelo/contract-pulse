import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FactoryGanttEntry, FactoryProjectStatus } from '@/types';
import { differenceInDays, format, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Filter, FolderKanban, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FactoryGanttChartProps {
  entries: FactoryGanttEntry[];
}

const statusColors: Record<FactoryProjectStatus, string> = {
  planned: 'bg-info',
  in_progress: 'bg-success',
  finished: 'bg-muted-foreground',
  paused: 'bg-warning',
};

const typeColors = {
  project: 'bg-primary',
  professional: 'bg-accent-foreground',
};

export function FactoryGanttChart({ entries }: FactoryGanttChartProps) {
  const [monthsToShow, setMonthsToShow] = useState<number>(6);
  const [viewMode, setViewMode] = useState<'projects' | 'professionals' | 'all'>('all');

  const filteredEntries = useMemo(() => {
    if (viewMode === 'all') return entries;
    return entries.filter(e => e.type === (viewMode === 'projects' ? 'project' : 'professional'));
  }, [entries, viewMode]);

  const timelineData = useMemo(() => {
    const today = new Date();
    const startDate = startOfMonth(today);
    const endDate = endOfMonth(addMonths(today, monthsToShow - 1));
    const totalDays = differenceInDays(endDate, startDate) + 1;

    // Generate months headers
    const months: { label: string; days: number; startDay: number }[] = [];
    let currentDate = startDate;
    let dayOffset = 0;

    while (currentDate <= endDate) {
      const monthEnd = endOfMonth(currentDate);
      const effectiveEnd = monthEnd > endDate ? endDate : monthEnd;
      const daysInRange = differenceInDays(effectiveEnd, currentDate) + 1;

      months.push({
        label: format(currentDate, 'MMM yyyy', { locale: ptBR }),
        days: daysInRange,
        startDay: dayOffset,
      });

      dayOffset += daysInRange;
      currentDate = startOfMonth(addMonths(currentDate, 1));
    }

    // Group entries
    const projectEntries = filteredEntries.filter(e => e.type === 'project');
    const professionalEntries = filteredEntries.filter(e => e.type === 'professional');

    // Process entries with positioning
    const processEntries = (items: FactoryGanttEntry[]) => {
      return items.map(entry => {
        const entryStart = new Date(entry.startDate);
        const entryEnd = new Date(entry.endDate);

        const effectiveStart = entryStart < startDate ? startDate : entryStart;
        const effectiveEnd = entryEnd > endDate ? endDate : entryEnd;

        const startOffset = Math.max(0, differenceInDays(effectiveStart, startDate));
        const duration = Math.max(1, differenceInDays(effectiveEnd, effectiveStart) + 1);
        const isVisible = effectiveStart <= endDate && effectiveEnd >= startDate;

        return {
          ...entry,
          startOffset,
          duration,
          isVisible,
        };
      }).filter(e => e.isVisible);
    };

    return {
      startDate,
      endDate,
      totalDays,
      months,
      projects: processEntries(projectEntries),
      professionals: processEntries(professionalEntries),
    };
  }, [filteredEntries, monthsToShow]);

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cronograma de Projetos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhum projeto ou alocação encontrada
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
            Cronograma de Projetos (Gantt)
          </CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="projects">Projetos</SelectItem>
                <SelectItem value="professionals">Profissionais</SelectItem>
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
            <div className="w-3 h-3 rounded bg-primary"></div>
            <span className="text-muted-foreground">Projeto</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded bg-success"></div>
            <span className="text-muted-foreground">Em Andamento</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded bg-info"></div>
            <span className="text-muted-foreground">Planejado</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded bg-warning"></div>
            <span className="text-muted-foreground">Pausado</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {/* Header with months */}
          <div className="flex border-b border-border pb-2 mb-2 min-w-[900px]">
            <div className="w-56 flex-shrink-0 font-medium text-sm text-muted-foreground">
              Nome
            </div>
            <div className="flex-1 flex">
              {timelineData.months.map((month, idx) => (
                <div
                  key={idx}
                  className="text-center text-xs font-medium capitalize border-l border-border first:border-l-0 px-1"
                  style={{ width: `${(month.days / timelineData.totalDays) * 100}%` }}
                >
                  {month.label}
                </div>
              ))}
            </div>
          </div>

          {/* Projects Section */}
          {timelineData.projects.length > 0 && (viewMode === 'all' || viewMode === 'projects') && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
                <FolderKanban className="h-4 w-4" />
                Projetos
              </div>
              <div className="space-y-1 min-w-[900px]">
                {timelineData.projects.map((entry) => (
                  <div key={entry.id} className="flex items-center h-8 hover:bg-muted/30 rounded">
                    <div className="w-56 flex-shrink-0 text-sm font-medium truncate pr-2 flex items-center gap-2">
                      {entry.status && (
                        <Badge variant="outline" className="text-xs">
                          {entry.progress?.toFixed(0)}%
                        </Badge>
                      )}
                      <span className="truncate">{entry.name}</span>
                    </div>
                    <div className="flex-1 relative h-5 bg-muted/20 rounded">
                      <div
                        className={cn(
                          'absolute h-full rounded flex items-center justify-center text-xs text-white font-medium overflow-hidden cursor-pointer transition-opacity hover:opacity-80',
                          entry.status ? statusColors[entry.status] : 'bg-primary'
                        )}
                        style={{
                          left: `${(entry.startOffset / timelineData.totalDays) * 100}%`,
                          width: `${Math.max((entry.duration / timelineData.totalDays) * 100, 2)}%`,
                        }}
                        title={`${entry.name} (${entry.progress?.toFixed(0) || 0}%)`}
                      >
                        {entry.duration > 30 && (
                          <span className="truncate px-1">{entry.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professionals Section */}
          {timelineData.professionals.length > 0 && (viewMode === 'all' || viewMode === 'professionals') && (
            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
                <Users className="h-4 w-4" />
                Profissionais
              </div>
              <div className="space-y-1 min-w-[900px]">
                {timelineData.professionals.map((entry, idx) => (
                  <div key={`${entry.id}-${idx}`} className="flex items-center h-8 hover:bg-muted/30 rounded">
                    <div className="w-56 flex-shrink-0 text-sm truncate pr-2">
                      <span className="font-medium">{entry.name}</span>
                      {entry.role && (
                        <span className="text-muted-foreground text-xs ml-1">({entry.role})</span>
                      )}
                    </div>
                    <div className="flex-1 relative h-5 bg-muted/20 rounded">
                      <div
                        className="absolute h-full rounded bg-accent flex items-center justify-center text-xs font-medium overflow-hidden cursor-pointer transition-opacity hover:opacity-80"
                        style={{
                          left: `${(entry.startOffset / timelineData.totalDays) * 100}%`,
                          width: `${Math.max((entry.duration / timelineData.totalDays) * 100, 2)}%`,
                        }}
                        title={`${entry.name} - ${entry.projectName || ''} (${entry.stackName || ''})`}
                      >
                        {entry.duration > 20 && (
                          <span className="truncate px-1 text-accent-foreground">
                            {entry.projectName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredEntries.length === 0 && (
            <p className="text-muted-foreground text-center py-4 text-sm">
              Nenhum item visível no período selecionado
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
