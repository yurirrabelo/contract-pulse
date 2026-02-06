import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Stack } from '@/types';
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
import { Plus, Pencil, Trash2, Layers, Search } from 'lucide-react';

export default function Stacks() {
  const { 
    stacks, 
    stackCategories,
    stackDistributions,
    getStackCategoryById,
    addStack, 
    updateStack, 
    deleteStack 
  } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStack, setEditingStack] = useState<Stack | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
  });

  const filteredStacks = stacks.filter((stack) => {
    const matchesSearch = stack.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (categoryFilter === 'all') return matchesSearch;
    return matchesSearch && stack.categoryId === categoryFilter;
  });

  const getStackDistribution = (stackId: string) => {
    return stackDistributions.find((d) => d.stackId === stackId);
  };

  const handleOpenDialog = (stack?: Stack) => {
    if (stack) {
      setEditingStack(stack);
      setFormData({
        name: stack.name,
        categoryId: stack.categoryId,
      });
    } else {
      setEditingStack(null);
      setFormData({
        name: '',
        categoryId: stackCategories[0]?.id || '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.categoryId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Nome e categoria são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    if (editingStack) {
      updateStack(editingStack.id, formData);
      toast({
        title: 'Stack atualizada',
        description: 'As informações foram salvas com sucesso.',
      });
    } else {
      addStack(formData);
      toast({
        title: 'Stack criada',
        description: 'A nova stack foi adicionada com sucesso.',
      });
    }

    setIsDialogOpen(false);
    setEditingStack(null);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteStack(deleteId);
      toast({
        title: 'Stack excluída',
        description: 'A stack foi removida com sucesso.',
      });
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Stacks</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as stacks e tecnologias disponíveis
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Stack
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingStack ? 'Editar Stack' : 'Nova Stack'}
              </DialogTitle>
              <DialogDescription>
                {editingStack
                  ? 'Atualize as informações da stack.'
                  : 'Preencha os dados para cadastrar uma nova stack.'}
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
                    placeholder="Ex: React, Node.js, Python"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoryId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {stackCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  {editingStack ? 'Salvar' : 'Criar'}
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
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {stackCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stacks Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stack</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-center">Profissionais</TableHead>
                <TableHead className="text-center">Vagas</TableHead>
                <TableHead className="text-center">Taxa de Ocupação</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Layers className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm || categoryFilter !== 'all'
                          ? 'Nenhuma stack encontrada'
                          : 'Nenhuma stack cadastrada'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStacks.map((stack) => {
                  const distribution = getStackDistribution(stack.id);
                  const category = getStackCategoryById(stack.categoryId);
                  const occupancyRate = distribution && distribution.positionCount > 0
                    ? ((distribution.filledPositions / distribution.positionCount) * 100).toFixed(0)
                    : '0';

                  return (
                    <TableRow key={stack.id}>
                      <TableCell className="font-medium">{stack.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {category?.name || 'Sem categoria'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {distribution?.professionalCount || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        {distribution?.filledPositions || 0}/{distribution?.positionCount || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${occupancyRate}%` }}
                            />
                          </div>
                          <span className="text-sm">{occupancyRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(stack)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(stack.id)}
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
            <AlertDialogTitle>Excluir stack?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A stack será removida
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
