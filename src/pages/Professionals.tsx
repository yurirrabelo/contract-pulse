import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Professional, ProfessionalStackExperience } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Plus, Pencil, Trash2, UserCircle, Search, X } from 'lucide-react';

export default function Professionals() {
  const { 
    professionals, 
    stacks,
    seniorities,
    stackCategories,
    getStackById,
    getSeniorityById,
    getStackCategoryById,
    getPositionById,
    getContractById,
    getClientById,
    getProfessionalAllocation,
    getProfessionalPrimaryStack,
    addProfessional, 
    updateProfessional, 
    deleteProfessional 
  } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [stackFilter, setStackFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    stackExperiences: [] as ProfessionalStackExperience[],
    status: 'idle' as Professional['status'],
    workMode: 'both' as Professional['workMode'],
    leaderId: '',
    totalYearsExperience: 0,
  });

  // Temp state for adding stack experience
  const [tempStackExp, setTempStackExp] = useState({
    stackId: '',
    seniorityId: '',
    yearsExperience: 1,
  });

  const filteredProfessionals = professionals.filter((professional) => {
    const primaryStack = getProfessionalPrimaryStack(professional);
    
    const matchesSearch = 
      professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      primaryStack?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (stackFilter === 'all') return matchesSearch;
    return matchesSearch && professional.stackExperiences?.some(exp => exp.stackId === stackFilter);
  });

  const handleOpenDialog = (professional?: Professional) => {
    if (professional) {
      setEditingProfessional(professional);
      setFormData({
        name: professional.name,
        email: professional.email || '',
        stackExperiences: professional.stackExperiences || [],
        status: professional.status,
        workMode: professional.workMode,
        leaderId: professional.leaderId || '',
        totalYearsExperience: professional.totalYearsExperience || 0,
      });
    } else {
      setEditingProfessional(null);
      setFormData({
        name: '',
        email: '',
        stackExperiences: [],
        status: 'idle',
        workMode: 'both',
        leaderId: '',
        totalYearsExperience: 0,
      });
    }
    setTempStackExp({ stackId: '', seniorityId: '', yearsExperience: 1 });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.stackExperiences.length === 0) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Nome e pelo menos uma experiência em stack são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    if (editingProfessional) {
      updateProfessional(editingProfessional.id, formData);
      toast({ title: 'Profissional atualizado', description: 'As informações foram salvas.' });
    } else {
      addProfessional(formData);
      toast({ title: 'Profissional criado', description: 'O novo profissional foi adicionado.' });
    }

    setIsDialogOpen(false);
    setEditingProfessional(null);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteProfessional(deleteId);
      toast({ title: 'Profissional excluído', description: 'O profissional foi removido.' });
      setDeleteId(null);
    }
  };

  const addStackExperience = () => {
    if (!tempStackExp.stackId || !tempStackExp.seniorityId) return;
    if (formData.stackExperiences.some(exp => exp.stackId === tempStackExp.stackId)) {
      toast({ title: 'Stack já adicionada', variant: 'destructive' });
      return;
    }
    setFormData({
      ...formData,
      stackExperiences: [...formData.stackExperiences, { ...tempStackExp }],
    });
    setTempStackExp({ stackId: '', seniorityId: '', yearsExperience: 1 });
  };

  const removeStackExperience = (stackId: string) => {
    setFormData({
      ...formData,
      stackExperiences: formData.stackExperiences.filter(exp => exp.stackId !== stackId),
    });
  };

  const getAllocationInfo = (professionalId: string) => {
    const allocation = getProfessionalAllocation(professionalId);
    if (!allocation) return null;
    const position = getPositionById(allocation.positionId);
    if (!position) return null;
    const contract = getContractById(position.contractId);
    const client = contract ? getClientById(contract.clientId) : null;
    return { position, contract, client };
  };

  // Get leaders (professionals without leaderId who have others reporting to them)
  const leaders = professionals.filter(p => !p.leaderId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Profissionais</h1>
          <p className="text-muted-foreground mt-1">Gerencie os profissionais</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Profissional
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}</DialogTitle>
              <DialogDescription>
                {editingProfessional ? 'Atualize as informações.' : 'Cadastre um novo profissional.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as Professional['status'] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="idle">Ocioso</SelectItem>
                        <SelectItem value="allocated">Alocado</SelectItem>
                        <SelectItem value="partial">Parcial</SelectItem>
                        <SelectItem value="vacation">Férias</SelectItem>
                        <SelectItem value="notice">Aviso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Modo de Trabalho</Label>
                    <Select value={formData.workMode} onValueChange={(v) => setFormData({ ...formData, workMode: v as Professional['workMode'] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="allocation">Alocação</SelectItem>
                        <SelectItem value="factory">Fábrica</SelectItem>
                        <SelectItem value="both">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Anos Experiência Total</Label>
                    <Input type="number" min="0" value={formData.totalYearsExperience} onChange={(e) => setFormData({ ...formData, totalYearsExperience: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Líder</Label>
                  <Select value={formData.leaderId || 'none'} onValueChange={(v) => setFormData({ ...formData, leaderId: v === 'none' ? '' : v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione um líder (opcional)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {leaders.map((leader) => (
                        <SelectItem key={leader.id} value={leader.id}>{leader.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Stack Experiences */}
                <div className="space-y-2">
                  <Label>Experiências por Stack *</Label>
                  <div className="flex gap-2">
                    <Select value={tempStackExp.stackId} onValueChange={(v) => setTempStackExp({ ...tempStackExp, stackId: v })}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="Stack" /></SelectTrigger>
                      <SelectContent>
                        {stacks.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={tempStackExp.seniorityId} onValueChange={(v) => setTempStackExp({ ...tempStackExp, seniorityId: v })}>
                      <SelectTrigger className="w-32"><SelectValue placeholder="Senioridade" /></SelectTrigger>
                      <SelectContent>
                        {seniorities.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input type="number" min="1" className="w-20" value={tempStackExp.yearsExperience} onChange={(e) => setTempStackExp({ ...tempStackExp, yearsExperience: parseInt(e.target.value) || 1 })} placeholder="Anos" />
                    <Button type="button" variant="outline" onClick={addStackExperience}>+</Button>
                  </div>
                  {formData.stackExperiences.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.stackExperiences.map((exp) => {
                        const stack = getStackById(exp.stackId);
                        const seniority = getSeniorityById(exp.seniorityId);
                        return (
                          <Badge key={exp.stackId} variant="secondary" className="gap-1">
                            {stack?.name} • {seniority?.name} • {exp.yearsExperience}a
                            <X className="h-3 w-3 cursor-pointer" onClick={() => removeStackExperience(exp.stackId)} />
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingProfessional ? 'Salvar' : 'Criar'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={stackFilter} onValueChange={setStackFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filtrar por stack" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as stacks</SelectItem>
            {stacks.map((stack) => <SelectItem key={stack.id} value={stack.id}>{stack.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profissional</TableHead>
                <TableHead>Stacks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Alocação Atual</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfessionals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <UserCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Nenhum profissional encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfessionals.map((professional) => {
                  const allocationInfo = getAllocationInfo(professional.id);
                  return (
                    <TableRow key={professional.id}>
                      <TableCell className="font-medium">{professional.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {professional.stackExperiences?.slice(0, 3).map((exp) => {
                            const stack = getStackById(exp.stackId);
                            const seniority = getSeniorityById(exp.seniorityId);
                            return <Badge key={exp.stackId} variant="outline">{stack?.name} ({seniority?.name})</Badge>;
                          })}
                          {professional.stackExperiences?.length > 3 && <Badge variant="secondary">+{professional.stackExperiences.length - 3}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={professional.status === 'allocated' ? 'default' : 'secondary'}>
                          {professional.status === 'allocated' ? 'Alocado' : professional.status === 'idle' ? 'Ocioso' : professional.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {allocationInfo ? (
                          <div className="text-sm">
                            <div className="font-medium">{allocationInfo.position.title}</div>
                            <div className="text-muted-foreground">{allocationInfo.client?.name}</div>
                          </div>
                        ) : <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(professional)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(professional.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir profissional?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
