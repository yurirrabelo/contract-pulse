import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Contract, Position } from '@/types';
import { formatDate, getContractStatus, getDaysUntil } from '@/lib/storage';
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
import { Plus, Trash2, FileText, Search, X, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
  active: { label: 'Ativo', variant: 'default' as const, className: 'bg-success text-success-foreground' },
  expiring_30: { label: '30 dias', variant: 'destructive' as const, className: '' },
  expiring_60: { label: '60 dias', variant: 'default' as const, className: 'bg-warning text-warning-foreground' },
  expiring_90: { label: '90 dias', variant: 'default' as const, className: 'bg-info text-info-foreground' },
  expired: { label: 'Encerrado', variant: 'secondary' as const, className: '' },
};

interface PositionFormData {
  title: string;
  stackId: string;
  allocationPercentage: number;
}

export default function Contracts() {
  const { 
    contracts, 
    clients, 
    stacks,
    getClientById, 
    getPositionsByContract,
    addContract, 
    deleteContract,
    addPosition,
  } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    clientId: '',
    contractNumber: '',
    projectName: '',
    type: 'staffing' as 'staffing' | 'fabrica',
    startDate: '',
    endDate: '',
    monthlyValue: '',
  });

  // Positions to be created with the contract
  const [newPositions, setNewPositions] = useState<PositionFormData[]>([]);
  const [tempPosition, setTempPosition] = useState<PositionFormData>({
    title: '',
    stackId: '',
    allocationPercentage: 100,
  });

  const filteredContracts = contracts.filter((contract) => {
    const client = getClientById(contract.clientId);
    const matchesSearch = 
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    const status = getContractStatus(contract.endDate);
    return matchesSearch && status === statusFilter;
  });

  const handleOpenDialog = () => {
    setFormData({
      clientId: '',
      contractNumber: '',
      projectName: '',
      type: 'staffing',
      startDate: '',
      endDate: '',
      monthlyValue: '',
    });
    setNewPositions([]);
    setTempPosition({ title: '', stackId: '', allocationPercentage: 100 });
    setIsDialogOpen(true);
  };

  const addPositionToList = () => {
    if (!tempPosition.title || !tempPosition.stackId) {
      toast({ title: 'Preencha título e stack da vaga', variant: 'destructive' });
      return;
    }
    setNewPositions([...newPositions, { ...tempPosition }]);
    setTempPosition({ title: '', stackId: '', allocationPercentage: 100 });
  };

  const removePositionFromList = (index: number) => {
    setNewPositions(newPositions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId || !formData.contractNumber || !formData.startDate || !formData.endDate) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    if (newPositions.length === 0) {
      toast({
        title: 'Vagas obrigatórias',
        description: 'Adicione pelo menos uma vaga ao contrato.',
        variant: 'destructive',
      });
      return;
    }

    // Create the contract
    const contractData = {
      clientId: formData.clientId,
      contractNumber: formData.contractNumber,
      projectName: formData.projectName,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      monthlyValue: parseFloat(formData.monthlyValue) || 0,
    };

    const newContract = addContract(contractData);

    // Create all positions for this contract
    newPositions.forEach((pos) => {
      addPosition({
        contractId: newContract.id,
        title: pos.title,
        stackId: pos.stackId,
        status: 'open',
        startDate: formData.startDate,
        endDate: formData.endDate,
        allocationPercentage: pos.allocationPercentage,
      });
    });

    toast({
      title: 'Contrato criado',
      description: `Contrato criado com ${newPositions.length} vaga(s).`,
    });

    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteContract(deleteId);
      toast({
        title: 'Contrato excluído',
        description: 'O contrato foi removido com sucesso.',
      });
      setDeleteId(null);
    }
  };

  const getStackName = (stackId: string) => stacks.find(s => s.id === stackId)?.name || '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contratos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os contratos de alocação e fábrica
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Contrato</DialogTitle>
              <DialogDescription>
                Preencha os dados do contrato e adicione as vagas. Para contratos de alocação, não será possível editar após a criação.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6 py-4">
                {/* Contract Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Dados do Contrato</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client">Cliente *</Label>
                      <Select
                        value={formData.clientId}
                        onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: 'staffing' | 'fabrica') => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="staffing">Staffing (Alocação)</SelectItem>
                          <SelectItem value="fabrica">Fábrica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contractNumber">Número do Contrato *</Label>
                      <Input
                        id="contractNumber"
                        value={formData.contractNumber}
                        onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                        placeholder="CTR-2024-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projectName">Nome do Projeto</Label>
                      <Input
                        id="projectName"
                        value={formData.projectName}
                        onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                        placeholder="Nome do projeto"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Data de Início *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">Data de Fim *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Positions Section */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">Vagas do Contrato *</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Título da vaga"
                      value={tempPosition.title}
                      onChange={(e) => setTempPosition({ ...tempPosition, title: e.target.value })}
                      className="flex-1"
                    />
                    <Select 
                      value={tempPosition.stackId || 'none'} 
                      onValueChange={(v) => setTempPosition({ ...tempPosition, stackId: v === 'none' ? '' : v })}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Stack" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Selecione</SelectItem>
                        {stacks.map((stack) => (
                          <SelectItem key={stack.id} value={stack.id}>{stack.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="%"
                      value={tempPosition.allocationPercentage}
                      onChange={(e) => setTempPosition({ ...tempPosition, allocationPercentage: parseInt(e.target.value) || 100 })}
                      className="w-20"
                    />
                    <Button type="button" variant="outline" onClick={addPositionToList}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {newPositions.length > 0 ? (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Vaga</TableHead>
                            <TableHead>Stack</TableHead>
                            <TableHead className="w-20">%</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {newPositions.map((pos, index) => (
                            <TableRow key={index}>
                              <TableCell>{pos.title}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{getStackName(pos.stackId)}</Badge>
                              </TableCell>
                              <TableCell>{pos.allocationPercentage}%</TableCell>
                              <TableCell>
                                <Button 
                                  type="button"
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => removePositionFromList(index)}
                                >
                                  <X className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground border rounded-lg">
                      Adicione pelo menos uma vaga para criar o contrato
                    </div>
                  )}
                </div>

                {formData.type === 'staffing' && (
                  <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
                    <strong>Atenção:</strong> Contratos de Staffing não podem ser editados após a criação. 
                    Para alterações, será necessário criar um novo contrato.
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={newPositions.length === 0}>
                  Criar Contrato
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
            placeholder="Buscar por número, cliente ou projeto..."
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
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="expiring_30">Vencendo em 30 dias</SelectItem>
            <SelectItem value="expiring_60">Vencendo em 60 dias</SelectItem>
            <SelectItem value="expiring_90">Vencendo em 90 dias</SelectItem>
            <SelectItem value="expired">Encerrado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contracts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contrato</TableHead>
                <TableHead>Cliente / Projeto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Período</TableHead>
                <TableHead className="text-center">Vagas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm || statusFilter !== 'all'
                          ? 'Nenhum contrato encontrado'
                          : 'Nenhum contrato cadastrado'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredContracts.map((contract) => {
                  const client = getClientById(contract.clientId);
                  const positions = getPositionsByContract(contract.id);
                  const status = getContractStatus(contract.endDate);
                  const daysUntil = getDaysUntil(contract.endDate);
                  const config = statusConfig[status];

                  return (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium font-mono">
                        {contract.contractNumber}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{client?.name || '-'}</div>
                          {contract.projectName && (
                            <div className="text-muted-foreground">{contract.projectName}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {contract.type === 'staffing' ? 'Staffing' : 'Fábrica'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(contract.startDate)}</div>
                          <div className="text-muted-foreground">
                            até {formatDate(contract.endDate)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">
                          {positions.filter(p => p.status === 'filled').length}/{positions.length}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={config.variant}
                          className={cn(config.className)}
                        >
                          {config.label}
                          {status !== 'expired' && status !== 'active' && (
                            <span className="ml-1">({daysUntil}d)</span>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(contract.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
            <AlertDialogTitle>Excluir contrato?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O contrato e todas as suas vagas serão removidos permanentemente.
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
