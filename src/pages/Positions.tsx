import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Position } from '@/types';
import { formatDate } from '@/lib/storage';
import { isAllocationActive } from '@/lib/allocation';
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
import { Pencil, Trash2, Briefcase, Search, UserPlus, UserMinus } from 'lucide-react';

export default function Positions() {
  const { 
    positions, 
    contracts, 
    stacks,
    professionals,
    allocations,
    getContractById, 
    getClientById,
    getStackById,
    getProfessionalById,
    updatePosition, 
    deletePosition,
    addAllocation,
    deleteAllocation,
    updateProfessional,
  } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredPositions = positions.filter((position) => {
    const contract = getContractById(position.contractId);
    const client = contract ? getClientById(contract.clientId) : null;
    const stack = getStackById(position.stackId);
    
    const matchesSearch = 
      position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stack?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract?.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && position.status === statusFilter;
  });

  // Get allocation for a position
  const getPositionAllocation = (position: Position) => {
    return allocations.find(
      a => a.positionId === position.id && isAllocationActive(a, { position, at: new Date() })
    );
  };

  // Get available professionals (not fully allocated)
  const getAvailableProfessionals = () => {
    return professionals.filter(p => {
      // Get all current allocations for this professional
      const profAllocations = allocations.filter(a => 
        a.professionalId === p.id && 
        (!a.endDate || new Date(a.endDate) >= new Date())
      );
      const totalAllocation = profAllocations.reduce((sum, a) => sum + a.allocationPercentage, 0);
      return totalAllocation < 100 && (p.status === 'idle' || p.status === 'partial');
    });
  };

  const handleOpenAssignDialog = (position: Position) => {
    setSelectedPosition(position);
    setSelectedProfessionalId('');
    setIsAssignDialogOpen(true);
  };

  const handleAssignProfessional = () => {
    if (!selectedPosition || !selectedProfessionalId) {
      toast({ title: 'Selecione um profissional', variant: 'destructive' });
      return;
    }

    // Create allocation
    addAllocation({
      professionalId: selectedProfessionalId,
      positionId: selectedPosition.id,
      startDate: selectedPosition.startDate,
      endDate: selectedPosition.endDate,
      allocationPercentage: selectedPosition.allocationPercentage,
    });

    // Update position status to filled
    updatePosition(selectedPosition.id, { status: 'filled' });

    // Update professional status based on total allocation
    const professional = getProfessionalById(selectedProfessionalId);
    if (professional) {
      const profAllocations = allocations.filter(a => 
        a.professionalId === selectedProfessionalId && 
        (!a.endDate || new Date(a.endDate) >= new Date())
      );
      const currentAllocation = profAllocations.reduce((sum, a) => sum + a.allocationPercentage, 0);
      const newTotalAllocation = currentAllocation + selectedPosition.allocationPercentage;
      
      const newStatus = newTotalAllocation >= 100 ? 'allocated' : 'partial';
      updateProfessional(selectedProfessionalId, { status: newStatus });
    }

    toast({
      title: 'Profissional vinculado',
      description: 'O profissional foi alocado na vaga com sucesso.',
    });

    setIsAssignDialogOpen(false);
    setSelectedPosition(null);
    setSelectedProfessionalId('');
  };

  const handleUnassignProfessional = (position: Position) => {
    const allocation = getPositionAllocation(position);
    if (allocation) {
      const professionalId = allocation.professionalId;
      const allocationPercentage = allocation.allocationPercentage;
      
      // Delete the allocation
      deleteAllocation(allocation.id);
      
      // Update position status to open
      updatePosition(position.id, { status: 'open' });

      // Update professional status based on remaining allocation
      const professional = getProfessionalById(professionalId);
      if (professional) {
        const remainingAllocations = allocations.filter(a => 
          a.professionalId === professionalId && 
          a.id !== allocation.id &&
          (!a.endDate || new Date(a.endDate) >= new Date())
        );
        const remainingTotal = remainingAllocations.reduce((sum, a) => sum + a.allocationPercentage, 0);
        
        let newStatus: 'idle' | 'partial' | 'allocated' = 'idle';
        if (remainingTotal >= 100) {
          newStatus = 'allocated';
        } else if (remainingTotal > 0) {
          newStatus = 'partial';
        }
        updateProfessional(professionalId, { status: newStatus });
      }

      toast({
        title: 'Profissional desvinculado',
        description: 'A vaga está novamente aberta.',
      });
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deletePosition(deleteId);
      toast({
        title: 'Vaga excluída',
        description: 'A vaga foi removida com sucesso.',
      });
      setDeleteId(null);
    }
  };

  const availableProfessionals = getAvailableProfessionals();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Vagas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as vagas e vincule profissionais
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, cliente, projeto ou stack..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="open">Abertas</SelectItem>
            <SelectItem value="filled">Preenchidas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Positions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vaga</TableHead>
                <TableHead>Contrato / Cliente</TableHead>
                <TableHead>Stack</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Profissional</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPositions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Briefcase className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm || statusFilter !== 'all'
                          ? 'Nenhuma vaga encontrada'
                          : 'Nenhuma vaga cadastrada'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPositions.map((position) => {
                  const contract = getContractById(position.contractId);
                  const client = contract ? getClientById(contract.clientId) : null;
                  const stack = getStackById(position.stackId);
                  const allocation = getPositionAllocation(position);
                  const professional = allocation ? getProfessionalById(allocation.professionalId) : null;

                  return (
                    <TableRow key={position.id}>
                      <TableCell className="font-medium">{position.title}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-mono">{contract?.contractNumber}</div>
                          <div className="text-muted-foreground">{client?.name}</div>
                          {contract?.projectName && (
                            <div className="text-xs text-muted-foreground">{contract.projectName}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{stack?.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(position.startDate)}</div>
                          <div className="text-muted-foreground">
                            até {formatDate(position.endDate)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{position.allocationPercentage}%</TableCell>
                      <TableCell>
                        <Badge 
                          variant={position.status === 'filled' ? 'default' : 'secondary'}
                          className={position.status === 'filled' ? 'bg-success text-success-foreground' : ''}
                        >
                          {position.status === 'filled' ? 'Preenchida' : 'Aberta'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {professional ? (
                          <div className="text-sm font-medium">{professional.name}</div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {position.status === 'open' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenAssignDialog(position)}
                              className="gap-1"
                            >
                              <UserPlus className="h-4 w-4" />
                              Vincular
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUnassignProfessional(position)}
                              title="Desvincular profissional"
                            >
                              <UserMinus className="h-4 w-4 text-warning" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(position.id)}
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

      {/* Assign Professional Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular Profissional</DialogTitle>
            <DialogDescription>
              {selectedPosition && (
                <>Selecione um profissional para a vaga <strong>{selectedPosition.title}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {availableProfessionals.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Não há profissionais disponíveis para alocação.
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Profissional</Label>
                <Select value={selectedProfessionalId || 'none'} onValueChange={(v) => setSelectedProfessionalId(v === 'none' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Selecione</SelectItem>
                    {availableProfessionals.map((prof) => {
                      const profAllocations = allocations.filter(a => 
                        a.professionalId === prof.id && 
                        (!a.endDate || new Date(a.endDate) >= new Date())
                      );
                      const currentAllocation = profAllocations.reduce((sum, a) => sum + a.allocationPercentage, 0);
                      
                      return (
                        <SelectItem key={prof.id} value={prof.id}>
                          {prof.name} ({100 - currentAllocation}% disponível)
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignProfessional} disabled={!selectedProfessionalId}>
              Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir vaga?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A vaga e sua alocação serão removidas permanentemente.
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
