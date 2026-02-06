import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Professional } from '@/types';
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
    allocations,
    positions,
    getStackById,
    getPositionById,
    getContractById,
    getClientById,
    getProfessionalAllocation,
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
    primaryStackId: '',
    secondaryStackIds: [] as string[],
    status: 'idle' as 'allocated' | 'idle' | 'partial' | 'vacation' | 'notice',
    workMode: 'both' as 'allocation' | 'factory' | 'both',
  });

  const filteredProfessionals = professionals.filter((professional) => {
    const stack = getStackById(professional.primaryStackId);
    
    const matchesSearch = 
      professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stack?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (stackFilter === 'all') return matchesSearch;
    return matchesSearch && (
      professional.primaryStackId === stackFilter ||
      professional.secondaryStackIds.includes(stackFilter)
    );
  });

  const handleOpenDialog = (professional?: Professional) => {
    if (professional) {
      setEditingProfessional(professional);
      setFormData({
        name: professional.name,
        primaryStackId: professional.primaryStackId,
        secondaryStackIds: professional.secondaryStackIds,
        status: professional.status || 'idle',
        workMode: professional.workMode || 'both',
      });
    } else {
      setEditingProfessional(null);
      setFormData({
        name: '',
        primaryStackId: '',
        secondaryStackIds: [],
        status: 'idle',
        workMode: 'both',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.primaryStackId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Nome e stack principal são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    if (editingProfessional) {
      updateProfessional(editingProfessional.id, formData);
      toast({
        title: 'Profissional atualizado',
        description: 'As informações foram salvas com sucesso.',
      });
    } else {
      addProfessional(formData);
      toast({
        title: 'Profissional criado',
        description: 'O novo profissional foi adicionado com sucesso.',
      });
    }

    setIsDialogOpen(false);
    setEditingProfessional(null);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteProfessional(deleteId);
      toast({
        title: 'Profissional excluído',
        description: 'O profissional foi removido com sucesso.',
      });
      setDeleteId(null);
    }
  };

  const addSecondaryStack = (stackId: string) => {
    if (stackId && !formData.secondaryStackIds.includes(stackId) && stackId !== formData.primaryStackId) {
      setFormData({
        ...formData,
        secondaryStackIds: [...formData.secondaryStackIds, stackId],
      });
    }
  };

  const removeSecondaryStack = (stackId: string) => {
    setFormData({
      ...formData,
      secondaryStackIds: formData.secondaryStackIds.filter(id => id !== stackId),
    });
  };

  const getAllocationInfo = (professionalId: string) => {
    const allocation = getProfessionalAllocation(professionalId);
    if (!allocation) return null;

    const position = getPositionById(allocation.positionId);
    if (!position) return null;

    const contract = getContractById(position.contractId);
    const client = contract ? getClientById(contract.clientId) : null;

    return {
      position,
      contract,
      client,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Profissionais</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os profissionais alocados
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Profissional
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}
              </DialogTitle>
              <DialogDescription>
                {editingProfessional
                  ? 'Atualize as informações do profissional.'
                  : 'Preencha os dados para cadastrar um novo profissional.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryStack">Stack Principal *</Label>
                  <Select
                    value={formData.primaryStackId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, primaryStackId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma stack" />
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
                <div className="space-y-2">
                  <Label>Stacks Secundárias</Label>
                  <Select onValueChange={addSecondaryStack}>
                    <SelectTrigger>
                      <SelectValue placeholder="Adicionar stack secundária" />
                    </SelectTrigger>
                    <SelectContent>
                      {stacks
                        .filter(s => s.id !== formData.primaryStackId && !formData.secondaryStackIds.includes(s.id))
                        .map((stack) => (
                          <SelectItem key={stack.id} value={stack.id}>
                            {stack.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {formData.secondaryStackIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.secondaryStackIds.map((stackId) => {
                        const stack = getStackById(stackId);
                        return (
                          <Badge key={stackId} variant="secondary" className="gap-1">
                            {stack?.name}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeSecondaryStack(stackId)}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProfessional ? 'Salvar' : 'Criar'}
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
            placeholder="Buscar por nome ou stack..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={stackFilter} onValueChange={setStackFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por stack" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as stacks</SelectItem>
            {stacks.map((stack) => (
              <SelectItem key={stack.id} value={stack.id}>
                {stack.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Professionals Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profissional</TableHead>
                <TableHead>Stack Principal</TableHead>
                <TableHead>Stacks Secundárias</TableHead>
                <TableHead>Alocação Atual</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfessionals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <UserCircle className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm || stackFilter !== 'all'
                          ? 'Nenhum profissional encontrado'
                          : 'Nenhum profissional cadastrado'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfessionals.map((professional) => {
                  const primaryStack = getStackById(professional.primaryStackId);
                  const allocationInfo = getAllocationInfo(professional.id);

                  return (
                    <TableRow key={professional.id}>
                      <TableCell className="font-medium">{professional.name}</TableCell>
                      <TableCell>
                        <Badge>{primaryStack?.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {professional.secondaryStackIds.length > 0 ? (
                            professional.secondaryStackIds.map((stackId) => {
                              const stack = getStackById(stackId);
                              return (
                                <Badge key={stackId} variant="outline">
                                  {stack?.name}
                                </Badge>
                              );
                            })
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {allocationInfo ? (
                          <div className="text-sm">
                            <div className="font-medium">{allocationInfo.position.title}</div>
                            <div className="text-muted-foreground">
                              {allocationInfo.client?.name}
                            </div>
                          </div>
                        ) : (
                          <Badge variant="secondary">Não alocado</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(professional)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(professional.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir profissional?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O profissional será removido
              permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
