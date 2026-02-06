import { useState, useRef } from 'react';
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
import { Plus, Pencil, Trash2, Award, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

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
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

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

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const draggedItem = sortedSeniorities.find(s => s.id === draggedId);
    const targetItem = sortedSeniorities.find(s => s.id === targetId);
    
    if (!draggedItem || !targetItem) return;

    const draggedIndex = sortedSeniorities.findIndex(s => s.id === draggedId);
    const targetIndex = sortedSeniorities.findIndex(s => s.id === targetId);

    // Reorder all items
    const newOrder = [...sortedSeniorities];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    // Update levels for all affected items
    newOrder.forEach((item, index) => {
      if (item.level !== index + 1) {
        updateGeneralSeniority(item.id, { level: index + 1 });
      }
    });

    toast({ title: 'Ordem atualizada' });
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // Move up/down with buttons
  const handleMoveUp = (id: string) => {
    const index = sortedSeniorities.findIndex(s => s.id === id);
    if (index <= 0) return;
    
    const current = sortedSeniorities[index];
    const previous = sortedSeniorities[index - 1];
    
    updateGeneralSeniority(current.id, { level: previous.level });
    updateGeneralSeniority(previous.id, { level: current.level });
    toast({ title: 'Ordem atualizada' });
  };

  const handleMoveDown = (id: string) => {
    const index = sortedSeniorities.findIndex(s => s.id === id);
    if (index >= sortedSeniorities.length - 1) return;
    
    const current = sortedSeniorities[index];
    const next = sortedSeniorities[index + 1];
    
    updateGeneralSeniority(current.id, { level: next.level });
    updateGeneralSeniority(next.id, { level: current.level });
    toast({ title: 'Ordem atualizada' });
  };

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


      {/* Full Table View with Drag & Drop */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Ordem de Progressão
          </CardTitle>
          <CardDescription>
            Arraste para reordenar. Itens no topo são os níveis mais baixos (iniciantes), itens na base são os mais altos (experientes).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead className="w-16">Nível</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-[140px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSeniorities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Award className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Nenhuma senioridade cadastrada</p>
                  </TableCell>
                </TableRow>
              ) : (
                sortedSeniorities.map((sen, index) => (
                  <TableRow 
                    key={sen.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, sen.id)}
                    onDragOver={(e) => handleDragOver(e, sen.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, sen.id)}
                    onDragEnd={handleDragEnd}
                    className={`cursor-grab active:cursor-grabbing transition-colors ${
                      draggedId === sen.id ? 'opacity-50' : ''
                    } ${
                      dragOverId === sen.id ? 'bg-primary/10 border-primary' : ''
                    }`}
                  >
                    <TableCell className="text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">{sen.level}</TableCell>
                    <TableCell className="font-medium">
                      <Badge variant="secondary">{sen.name}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{sen.description || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleMoveUp(sen.id)}
                          disabled={index === 0}
                          title="Mover para cima (menor senioridade)"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleMoveDown(sen.id)}
                          disabled={index === sortedSeniorities.length - 1}
                          title="Mover para baixo (maior senioridade)"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
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
