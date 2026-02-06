import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { FactoryProject, FactoryProjectStatus, FactoryAllocation, FactoryRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/storage';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  FolderKanban,
  Users,
  Calendar,
  PlayCircle,
  CheckCircle,
  Pause,
  Clock,
  UserPlus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig: Record<FactoryProjectStatus, { label: string; icon: any; className: string }> = {
  planned: { label: 'Planejado', icon: Calendar, className: 'bg-info text-info-foreground' },
  in_progress: { label: 'Em Andamento', icon: PlayCircle, className: 'bg-success text-success-foreground' },
  finished: { label: 'Finalizado', icon: CheckCircle, className: 'bg-muted text-muted-foreground' },
  paused: { label: 'Pausado', icon: Pause, className: 'bg-warning text-warning-foreground' },
};

const roleLabels: Record<FactoryRole, string> = {
  dev: 'Desenvolvedor',
  qa: 'QA',
  po: 'Product Owner',
  pm: 'Project Manager',
  tech_lead: 'Tech Lead',
  architect: 'Arquiteto',
  scrum_master: 'Scrum Master',
  ux: 'UX Designer',
  other: 'Outro',
};

export default function FactoryProjects() {
  const {
    factoryProjectsWithDetails,
    clients,
    professionals,
    stacks,
    getClientById,
    getStackById,
    getProfessionalById,
    addFactoryProject,
    updateFactoryProject,
    deleteFactoryProject,
    addFactoryAllocation,
    updateFactoryAllocation,
    deleteFactoryAllocation,
  } = useData();

  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<FactoryProject | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [editingAllocation, setEditingAllocation] = useState<FactoryAllocation | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [deleteAllocationId, setDeleteAllocationId] = useState<string | null>(null);

  // Project form
  const [projectForm, setProjectForm] = useState({
    name: '',
    clientId: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'planned' as FactoryProjectStatus,
    progressPercentage: 0,
  });

  // Allocation form
  const [allocationForm, setAllocationForm] = useState({
    professionalId: '',
    role: 'dev' as FactoryRole,
    stackId: '',
    startDate: '',
    endDate: '',
    allocationPercentage: 100,
  });

  const filteredProjects = useMemo(() => {
    return factoryProjectsWithDetails.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [factoryProjectsWithDetails, searchTerm, statusFilter]);

  // Factory-eligible professionals
  const factoryProfessionals = professionals.filter(
    p => p.workMode === 'factory' || p.workMode === 'both'
  );

  const handleOpenProjectDialog = (project?: FactoryProject) => {
    if (project) {
      setEditingProject(project);
      setProjectForm({
        name: project.name,
        clientId: project.clientId || '',
        description: project.description,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
        progressPercentage: project.progressPercentage,
      });
    } else {
      setEditingProject(null);
      setProjectForm({
        name: '',
        clientId: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'planned',
        progressPercentage: 0,
      });
    }
    setIsProjectDialogOpen(true);
  };

  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectForm.name || !projectForm.startDate || !projectForm.endDate) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Nome, data de início e data de fim são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    const projectData = {
      name: projectForm.name,
      clientId: projectForm.clientId || undefined,
      description: projectForm.description,
      startDate: projectForm.startDate,
      endDate: projectForm.endDate,
      status: projectForm.status,
      progressPercentage: projectForm.progressPercentage,
    };

    if (editingProject) {
      updateFactoryProject(editingProject.id, projectData);
      toast({ title: 'Projeto atualizado', description: 'As informações foram salvas.' });
    } else {
      addFactoryProject(projectData);
      toast({ title: 'Projeto criado', description: 'O projeto foi criado com sucesso.' });
    }

    setIsProjectDialogOpen(false);
  };

  const handleDeleteProject = () => {
    if (deleteProjectId) {
      deleteFactoryProject(deleteProjectId);
      toast({ title: 'Projeto excluído', description: 'O projeto foi removido.' });
      setDeleteProjectId(null);
    }
  };

  const handleOpenAllocationDialog = (projectId: string, allocation?: FactoryAllocation) => {
    setSelectedProjectId(projectId);
    if (allocation) {
      setEditingAllocation(allocation);
      setAllocationForm({
        professionalId: allocation.professionalId,
        role: allocation.role,
        stackId: allocation.stackId,
        startDate: allocation.startDate,
        endDate: allocation.endDate,
        allocationPercentage: allocation.allocationPercentage,
      });
    } else {
      setEditingAllocation(null);
      const project = factoryProjectsWithDetails.find(p => p.id === projectId);
      setAllocationForm({
        professionalId: '',
        role: 'dev',
        stackId: '',
        startDate: project?.startDate || '',
        endDate: project?.endDate || '',
        allocationPercentage: 100,
      });
    }
    setIsAllocationDialogOpen(true);
  };

  const handleSubmitAllocation = (e: React.FormEvent) => {
    e.preventDefault();

    if (!allocationForm.professionalId || !allocationForm.startDate || !allocationForm.endDate || !selectedProjectId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Profissional, datas e stack são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    const allocationData = {
      projectId: selectedProjectId,
      professionalId: allocationForm.professionalId,
      role: allocationForm.role,
      stackId: allocationForm.stackId,
      startDate: allocationForm.startDate,
      endDate: allocationForm.endDate,
      allocationPercentage: allocationForm.allocationPercentage,
    };

    if (editingAllocation) {
      updateFactoryAllocation(editingAllocation.id, allocationData);
      toast({ title: 'Alocação atualizada', description: 'As informações foram salvas.' });
    } else {
      addFactoryAllocation(allocationData);
      toast({ title: 'Profissional alocado', description: 'Alocação criada com sucesso.' });
    }

    setIsAllocationDialogOpen(false);
  };

  const handleDeleteAllocation = () => {
    if (deleteAllocationId) {
      deleteFactoryAllocation(deleteAllocationId);
      toast({ title: 'Alocação removida', description: 'O profissional foi removido do projeto.' });
      setDeleteAllocationId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projetos de Fábrica</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os projetos da fábrica de software
          </p>
        </div>
        <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenProjectDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
              </DialogTitle>
              <DialogDescription>
                {editingProject
                  ? 'Atualize as informações do projeto.'
                  : 'Preencha os dados para criar um novo projeto.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitProject}>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Projeto *</Label>
                  <Input
                    id="name"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    placeholder="Nome do projeto"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente</Label>
                  <Select
                    value={projectForm.clientId}
                    onValueChange={(value) => setProjectForm({ ...projectForm, clientId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    placeholder="Descrição do projeto"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data de Início *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={projectForm.startDate}
                      onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data de Fim *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={projectForm.endDate}
                      onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={projectForm.status}
                    onValueChange={(value: FactoryProjectStatus) =>
                      setProjectForm({ ...projectForm, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planejado</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="finished">Finalizado</SelectItem>
                      <SelectItem value="paused">Pausado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Progresso: {projectForm.progressPercentage}%</Label>
                  <Slider
                    value={[projectForm.progressPercentage]}
                    onValueChange={([value]) =>
                      setProjectForm({ ...projectForm, progressPercentage: value })
                    }
                    max={100}
                    step={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsProjectDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProject ? 'Salvar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, descrição ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="planned">Planejado</SelectItem>
            <SelectItem value="in_progress">Em Andamento</SelectItem>
            <SelectItem value="finished">Finalizado</SelectItem>
            <SelectItem value="paused">Pausado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum projeto encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map((project) => {
            const config = statusConfig[project.status];
            const StatusIcon = config.icon;

            return (
              <Card key={project.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <Badge className={config.className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      {project.client && (
                        <p className="text-sm text-muted-foreground">{project.client.name}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenProjectDialog(project)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteProjectId(project.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.description && (
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {project.totalMembers} profissional(is)
                    </span>
                    <span className="text-muted-foreground">
                      {project.daysRemaining > 0 
                        ? `${project.daysRemaining} dias restantes`
                        : 'Prazo encerrado'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{project.progressPercentage}%</span>
                    </div>
                    <Progress value={project.progressPercentage} className="h-2" />
                  </div>

                  {/* Team */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Equipe</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAllocationDialog(project.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                    {project.allocations.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhum profissional alocado</p>
                    ) : (
                      <div className="grid gap-2">
                        {project.allocations.map((alloc) => (
                          <div
                            key={alloc.id}
                            className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium">{alloc.professional.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {roleLabels[alloc.role]} • {alloc.stack.name}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{alloc.allocationPercentage}%</Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(alloc.startDate)} - {formatDate(alloc.endDate)}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleOpenAllocationDialog(project.id, alloc)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => setDeleteAllocationId(alloc.id)}
                              >
                                <X className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Allocation Dialog */}
      <Dialog open={isAllocationDialogOpen} onOpenChange={setIsAllocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAllocation ? 'Editar Alocação' : 'Alocar Profissional'}
            </DialogTitle>
            <DialogDescription>
              {editingAllocation
                ? 'Atualize as informações da alocação.'
                : 'Adicione um profissional ao projeto.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAllocation}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Profissional *</Label>
                <Select
                  value={allocationForm.professionalId}
                  onValueChange={(value) =>
                    setAllocationForm({ ...allocationForm, professionalId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {factoryProfessionals.map((prof) => (
                      <SelectItem key={prof.id} value={prof.id}>
                        {prof.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Papel</Label>
                  <Select
                    value={allocationForm.role}
                    onValueChange={(value: FactoryRole) =>
                      setAllocationForm({ ...allocationForm, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Stack</Label>
                  <Select
                    value={allocationForm.stackId}
                    onValueChange={(value) =>
                      setAllocationForm({ ...allocationForm, stackId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {stacks.map((stack) => (
                        <SelectItem key={stack.id} value={stack.id}>
                          {stack.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Início *</Label>
                  <Input
                    type="date"
                    value={allocationForm.startDate}
                    onChange={(e) =>
                      setAllocationForm({ ...allocationForm, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Fim *</Label>
                  <Input
                    type="date"
                    value={allocationForm.endDate}
                    onChange={(e) =>
                      setAllocationForm({ ...allocationForm, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>% Alocação: {allocationForm.allocationPercentage}%</Label>
                <Slider
                  value={[allocationForm.allocationPercentage]}
                  onValueChange={([value]) =>
                    setAllocationForm({ ...allocationForm, allocationPercentage: value })
                  }
                  max={100}
                  min={10}
                  step={10}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAllocationDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingAllocation ? 'Salvar' : 'Alocar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirmation */}
      <AlertDialog open={!!deleteProjectId} onOpenChange={() => setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O projeto e todas as alocações serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Allocation Confirmation */}
      <AlertDialog open={!!deleteAllocationId} onOpenChange={() => setDeleteAllocationId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover profissional?</AlertDialogTitle>
            <AlertDialogDescription>
              O profissional será removido deste projeto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllocation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
