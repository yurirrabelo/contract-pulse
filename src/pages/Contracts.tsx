import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Contract } from '@/types';
import { formatDate, formatCurrency, getContractStatus, getDaysUntil } from '@/lib/storage';
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
import { Plus, Pencil, Trash2, FileText, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
  active: { label: 'Ativo', variant: 'default' as const, className: 'bg-success text-success-foreground' },
  expiring_30: { label: '30 dias', variant: 'destructive' as const, className: '' },
  expiring_60: { label: '60 dias', variant: 'default' as const, className: 'bg-warning text-warning-foreground' },
  expiring_90: { label: '90 dias', variant: 'default' as const, className: 'bg-info text-info-foreground' },
  expired: { label: 'Encerrado', variant: 'secondary' as const, className: '' },
};

export default function Contracts() {
  const { 
    contracts, 
    clients, 
    getClientById, 
    getPositionsByContract,
    addContract, 
    updateContract, 
    deleteContract 
  } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    clientId: '',
    contractNumber: '',
    startDate: '',
    endDate: '',
    monthlyValue: '',
  });

  const filteredContracts = contracts.filter((contract) => {
    const client = getClientById(contract.clientId);
    const matchesSearch = 
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    const status = getContractStatus(contract.endDate);
    return matchesSearch && status === statusFilter;
  });

  const handleOpenDialog = (contract?: Contract) => {
    if (contract) {
      setEditingContract(contract);
      setFormData({
        clientId: contract.clientId,
        contractNumber: contract.contractNumber,
        startDate: contract.startDate,
        endDate: contract.endDate,
        monthlyValue: contract.monthlyValue.toString(),
      });
    } else {
      setEditingContract(null);
      setFormData({
        clientId: '',
        contractNumber: '',
        startDate: '',
        endDate: '',
        monthlyValue: '',
      });
    }
    setIsDialogOpen(true);
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

    const contractData = {
      clientId: formData.clientId,
      contractNumber: formData.contractNumber,
      startDate: formData.startDate,
      endDate: formData.endDate,
      monthlyValue: parseFloat(formData.monthlyValue) || 0,
    };

    if (editingContract) {
      updateContract(editingContract.id, contractData);
      toast({
        title: 'Contrato atualizado',
        description: 'As informações foram salvas com sucesso.',
      });
    } else {
      addContract(contractData);
      toast({
        title: 'Contrato criado',
        description: 'O novo contrato foi adicionado com sucesso.',
      });
    }

    setIsDialogOpen(false);
    setEditingContract(null);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contratos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os contratos de alocação
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingContract ? 'Editar Contrato' : 'Novo Contrato'}
              </DialogTitle>
              <DialogDescription>
                {editingContract
                  ? 'Atualize as informações do contrato.'
                  : 'Preencha os dados para cadastrar um novo contrato.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente *</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, clientId: value })
                    }
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
                  <Label htmlFor="contractNumber">Número do Contrato *</Label>
                  <Input
                    id="contractNumber"
                    value={formData.contractNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, contractNumber: e.target.value })
                    }
                    placeholder="CTR-2024-001"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data de Início *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data de Fim *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyValue">Valor Mensal (R$)</Label>
                  <Input
                    id="monthlyValue"
                    type="number"
                    value={formData.monthlyValue}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyValue: e.target.value })
                    }
                    placeholder="0.00"
                  />
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
                  {editingContract ? 'Salvar' : 'Criar'}
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
            placeholder="Buscar por número ou cliente..."
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
                <TableHead>Cliente</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Valor Mensal</TableHead>
                <TableHead className="text-center">Vagas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
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
                      <TableCell>{client?.name || '-'}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(contract.startDate)}</div>
                          <div className="text-muted-foreground">
                            até {formatDate(contract.endDate)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(contract.monthlyValue)}
                      </TableCell>
                      <TableCell className="text-center">
                        {positions.filter(p => p.status === 'filled').length}/{positions.length}
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
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(contract)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(contract.id)}
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
            <AlertDialogTitle>Excluir contrato?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O contrato será removido
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
