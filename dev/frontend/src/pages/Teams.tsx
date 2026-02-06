import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { TeamView, ContractType } from '@/types';
import { formatDate, getDaysUntil, getContractStatus } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Search, 
  Building2, 
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronUp,
  Factory,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const statusConfig = {
  active: { label: 'Ativo', className: 'bg-success text-success-foreground' },
  expiring_30: { label: '30 dias', className: 'bg-danger text-danger-foreground' },
  expiring_60: { label: '60 dias', className: 'bg-warning text-warning-foreground' },
  expiring_90: { label: '90 dias', className: 'bg-info text-info-foreground' },
  expired: { label: 'Encerrado', className: 'bg-muted text-muted-foreground' },
};

// Dynamic category labels will be fetched from context

export default function Teams() {
  const { teamViews, contracts, stackCategories } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ContractType>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  const filteredTeams = useMemo(() => {
    return teamViews.filter((team) => {
      const matchesSearch =
        team.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.members.some(m => 
          m.professionalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.stackName.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesType = typeFilter === 'all' || team.contractType === typeFilter;
      const matchesStatus = statusFilter === 'all' || team.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [teamViews, searchTerm, typeFilter, statusFilter]);

  const staffingTeams = filteredTeams.filter(t => t.contractType === 'staffing');
  const fabricaTeams = filteredTeams.filter(t => t.contractType === 'fabrica');

  const toggleTeam = (contractId: string) => {
    setExpandedTeams(prev => {
      const next = new Set(prev);
      if (next.has(contractId)) {
        next.delete(contractId);
      } else {
        next.add(contractId);
      }
      return next;
    });
  };

  const renderTeamCard = (team: TeamView) => {
    const isExpanded = expandedTeams.has(team.contractId);
    const config = statusConfig[team.status];
    const occupancyRate = team.totalPositions > 0 
      ? (team.filledPositions / team.totalPositions) * 100 
      : 0;

    // Group members by category name for timeline-like view
    const membersByCategory = team.members.reduce((acc, member) => {
      const categoryKey = member.categoryName || 'Outros';
      if (!acc[categoryKey]) {
        acc[categoryKey] = [];
      }
      acc[categoryKey].push(member);
      return acc;
    }, {} as Record<string, typeof team.members>);

    return (
      <Card key={team.contractId} className="animate-fade-in">
        <Collapsible open={isExpanded} onOpenChange={() => toggleTeam(team.contractId)}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{team.projectName}</CardTitle>
                    <Badge variant={team.contractType === 'staffing' ? 'default' : 'secondary'}>
                      {team.contractType === 'staffing' ? 'Staffing' : 'Fábrica'}
                    </Badge>
                    <Badge className={config.className}>
                      {config.label}
                      {team.status !== 'expired' && team.status !== 'active' && (
                        <span className="ml-1">({team.daysUntilExpiration}d)</span>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {team.clientName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(team.startDate)} - {formatDate(team.endDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {team.filledPositions}/{team.totalPositions} vagas
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold">{occupancyRate.toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">ocupação</div>
                  </div>
                  {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="border-t">
              <div className="pt-4 space-y-4">
                {/* Team composition by category */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Composição do Time</h4>
                  
                  {Object.keys(membersByCategory).map((categoryName) => {
                    const members = membersByCategory[categoryName] || [];
                    if (members.length === 0) return null;
                    
                    return (
                      <div key={categoryName} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {categoryName}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {members.length} profissional(is)
                          </span>
                        </div>
                        <div className="grid gap-2 pl-4">
                          {members.map((member, idx) => (
                            <div
                              key={`${member.professionalId}-${idx}`}
                              className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm"
                            >
                              <div className="flex items-center gap-3">
                                <UserCheck className="h-4 w-4 text-success" />
                                <div>
                                  <p className="font-medium">{member.professionalName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {member.positionTitle} • {member.stackName}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right text-xs">
                                <Badge variant="outline">{member.allocationPercentage}%</Badge>
                                <p className="text-muted-foreground mt-1">
                                  {formatDate(member.startDate)} - {formatDate(member.endDate)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {team.members.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum profissional alocado
                    </p>
                  )}
                </div>

                {/* Timeline visualization */}
                {team.members.length > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="text-sm font-medium">Timeline de Alocação</h4>
                    <div className="space-y-1">
                      {team.members.map((member, idx) => {
                        const teamStart = new Date(team.startDate).getTime();
                        const teamEnd = new Date(team.endDate).getTime();
                        const memberStart = new Date(member.startDate).getTime();
                        const memberEnd = new Date(member.endDate).getTime();
                        
                        const totalDuration = teamEnd - teamStart;
                        const startOffset = ((memberStart - teamStart) / totalDuration) * 100;
                        const duration = ((memberEnd - memberStart) / totalDuration) * 100;
                        
                        const categoryColor = 
                          member.categoryName?.toLowerCase().includes('gestão') ? 'bg-info' :
                          member.categoryName?.toLowerCase().includes('qa') ? 'bg-warning' : 'bg-primary';
                        
                        return (
                          <div key={`${member.professionalId}-${idx}`} className="flex items-center gap-2 h-6">
                            <div className="w-32 text-xs truncate" title={member.professionalName}>
                              {member.professionalName}
                            </div>
                            <div className="flex-1 relative h-4 bg-muted/30 rounded">
                              <div
                                className={cn('absolute h-full rounded', categoryColor)}
                                style={{
                                  left: `${Math.max(0, startOffset)}%`,
                                  width: `${Math.min(100 - startOffset, duration)}%`,
                                }}
                                title={`${member.positionTitle}: ${formatDate(member.startDate)} - ${formatDate(member.endDate)}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatDate(team.startDate)}</span>
                      <span>{formatDate(team.endDate)}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Times & Projetos</h1>
        <p className="text-muted-foreground mt-1">
          Visualize os profissionais alocados por projeto (Staffing e Fábrica)
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por projeto, cliente ou profissional..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'all' | ContractType)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="staffing">Staffing</SelectItem>
            <SelectItem value="fabrica">Fábrica</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="expiring_30">Vencendo em 30 dias</SelectItem>
            <SelectItem value="expiring_60">Vencendo em 60 dias</SelectItem>
            <SelectItem value="expiring_90">Vencendo em 90 dias</SelectItem>
            <SelectItem value="expired">Encerrado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{staffingTeams.length}</p>
                <p className="text-xs text-muted-foreground">Projetos Staffing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Factory className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{fabricaTeams.length}</p>
                <p className="text-xs text-muted-foreground">Projetos Fábrica</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {filteredTeams.reduce((sum, t) => sum + t.filledPositions, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Profissionais Alocados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {filteredTeams.filter(t => ['expiring_30', 'expiring_60', 'expiring_90'].includes(t.status)).length}
                </p>
                <p className="text-xs text-muted-foreground">Vencendo em 90 dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams by type */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            Todos ({filteredTeams.length})
          </TabsTrigger>
          <TabsTrigger value="staffing">
            Staffing ({staffingTeams.length})
          </TabsTrigger>
          <TabsTrigger value="fabrica">
            Fábrica ({fabricaTeams.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredTeams.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum time encontrado</p>
              </CardContent>
            </Card>
          ) : (
            filteredTeams.map(renderTeamCard)
          )}
        </TabsContent>

        <TabsContent value="staffing" className="space-y-4">
          {staffingTeams.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum projeto Staffing encontrado</p>
              </CardContent>
            </Card>
          ) : (
            staffingTeams.map(renderTeamCard)
          )}
        </TabsContent>

        <TabsContent value="fabrica" className="space-y-4">
          {fabricaTeams.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Factory className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum projeto Fábrica encontrado</p>
              </CardContent>
            </Card>
          ) : (
            fabricaTeams.map(renderTeamCard)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}