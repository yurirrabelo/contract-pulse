import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Plus, Pencil, Trash2, Award, GripVertical } from 'lucide-react';

export default function GeneralSeniorities() {
  const { 
    generalSeniorities, 
    addGeneralSeniority, 
    updateGeneralSeniority, 
    deleteGeneralSeniority 
  } = useData();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', level: 1, description: '' });

  const sortedSeniorities = [...generalSeniorities].sort((a, b) => a.level - b.level);

  const handleOpenDialog = (seniority?: typeof generalSeniorities[0]) => {
    if (seniority) {
      setEditingId(seniority.id);
      setFormData({ 
        name: seniority.name, 
        level: seniority.level, 
        description: seniority.description || '' 
      });
    } else {
      setEditingId(null);
      const maxLevel = generalSeniorities.length > 0 
        ? Math.max(...generalSeniorities.map(s => s.level)) + 1 
        : 1;
      setFormData({ name: '', level: maxLevel, description: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: 'Nome obrigatório', variant: 'destructive' });
      return;
    }

    if (editingId) {
      updateGeneralSeniority(editingId, formData);
      toast({ title: 'Senioridade atualizada' });
    } else {
      addGeneralSeniority(formData);
      toast({ title: 'Senioridade criada' });
    }
    setIsDialogOpen(false);
    setEditingId(null);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteGeneralSeniority(deleteId);
      toast({ title: 'Senioridade excluída' });
      setDeleteId(null);
    }
  };

  // Group by first character for better visualization
  const groupedSeniorities = sortedSeniorities.reduce((acc, sen) => {
    const prefix = sen.name.charAt(0).toUpperCase();
    if (!acc[prefix]) acc[prefix] = [];
    acc[prefix].push(sen);
    return acc;
  }, {} as Record<string, typeof generalSeniorities>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Senioridade Geral</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os níveis de senioridade geral dos profissionais (Hero Journey)
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
                {editingId ? 'Editar Senioridade' : 'Nova Senioridade'}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? 'Atualize as informações da senioridade.'
                  : 'Adicione um novo nível de senioridade geral.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: A1, B2, P3..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Nível (ordem)</Label>
                    <Input
                      id="level"
                      type="number"
                      min="1"
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição opcional"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{editingId ? 'Salvar' : 'Criar'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Visual Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Object.entries(groupedSeniorities).map(([prefix, seniorities]) => (
          <Card key={prefix}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="outline" className="text-lg px-3 py-1">{prefix}</Badge>
                <span className="text-muted-foreground text-sm">
                  {seniorities.length} {seniorities.length === 1 ? 'nível' : 'níveis'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {seniorities.map((sen) => (
                <div 
                  key={sen.id} 
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 group"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    <span className="font-medium">{sen.name}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenDialog(sen)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteId(sen.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Table View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Todos os Níveis
          </CardTitle>
          <CardDescription>
            Lista completa de senioridades em ordem de progressão
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Ordem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSeniorities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Award className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Nenhuma senioridade cadastrada</p>
                  </TableCell>
                </TableRow>
              ) : (
                sortedSeniorities.map((sen) => (
                  <TableRow key={sen.id}>
                    <TableCell className="font-mono text-muted-foreground">{sen.level}</TableCell>
                    <TableCell className="font-medium">
                      <Badge variant="secondary">{sen.name}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{sen.description || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(sen)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(sen.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
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
              Esta ação não pode ser desfeita. Profissionais com esta senioridade terão o campo esvaziado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
