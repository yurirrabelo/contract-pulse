import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Seniority } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Pencil, Trash2, Award, Search } from 'lucide-react';

export default function Seniorities() {
  const { 
    seniorities,
    stackCategories,
    getStackCategoryById,
    addSeniority, 
    updateSeniority, 
    deleteSeniority 
  } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSeniority, setEditingSeniority] = useState<Seniority | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    level: 1,
    categoryId: '',
    description: '',
  });

  const filteredSeniorities = seniorities.filter((seniority) => {
    const matchesSearch = seniority.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || seniority.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Sort by category and level
  const sortedSeniorities = [...filteredSeniorities].sort((a, b) => {
    if (a.categoryId !== b.categoryId) {
      return a.categoryId.localeCompare(b.categoryId);
    }
    return a.level - b.level;
  });

  const handleOpenDialog = (seniority?: Seniority) => {
    if (seniority) {
      setEditingSeniority(seniority);
      setFormData({
        name: seniority.name,
        level: seniority.level,
        categoryId: seniority.categoryId,
        description: seniority.description || '',
      });
    } else {
      setEditingSeniority(null);
      setFormData({
        name: '',
        level: 1,
        categoryId: stackCategories[0]?.id || '',
        description: '',
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

    if (editingSeniority) {
      updateSeniority(editingSeniority.id, formData);
      toast({ title: 'Senioridade atualizada', description: 'As informações foram salvas.' });
    } else {
      addSeniority(formData);
      toast({ title: 'Senioridade criada', description: 'A nova senioridade foi adicionada.' });
    }

    setIsDialogOpen(false);
    setEditingSeniority(null);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteSeniority(deleteId);
      toast({ title: 'Senioridade excluída', description: 'A senioridade foi removida.' });
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Senioridades</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os níveis de senioridade por categoria (Hero Journey)
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Senioridade
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSeniority ? 'Editar Senioridade' : 'Nova Senioridade'}
              </DialogTitle>
              <DialogDescription>
                {editingSeniority
                  ? 'Atualize as informações da senioridade.'
                  : 'Preencha os dados para criar uma nova senioridade.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Júnior, Pleno, Sênior, Especialista"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
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
                <div className="space-y-2">
                  <Label htmlFor="level">Nível (ordenação)</Label>
                  <Input
                    id="level"
                    type="number"
                    min="1"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Usado para ordenar as senioridades (1 = menor, crescente)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição do nível (opcional)"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{editingSeniority ? 'Salvar' : 'Criar'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nível</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSeniorities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Award className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm || categoryFilter !== 'all'
                          ? 'Nenhuma senioridade encontrada'
                          : 'Nenhuma senioridade cadastrada'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedSeniorities.map((seniority) => {
                  const category = getStackCategoryById(seniority.categoryId);
                  return (
                    <TableRow key={seniority.id}>
                      <TableCell>
                        <Badge variant="outline">{seniority.level}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{seniority.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{category?.name || '-'}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {seniority.description || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(seniority)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(seniority.id)}>
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir senioridade?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A senioridade será removida permanentemente.
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
