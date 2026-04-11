import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, FlaskConical, MonitorPlay } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { useSchedule } from "@/contexts/ScheduleContext";
import type { Room } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type FormMode = 'hidden' | 'add' | 'edit';

export default function SalasPage() {
  const { rooms, addRoom, updateRoom, deleteRoom } = useSchedule();

  const [formMode,  setFormMode]  = useState<FormMode>('hidden');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name,     setName]     = useState('');
  const [building, setBuilding] = useState('');
  const [capacity, setCapacity] = useState('');
  const [type,     setType]     = useState<Room['type']>('theoretical');

  const resetForm = () => { setName(''); setBuilding(''); setCapacity(''); setType('theoretical'); };

  const openAdd = () => { resetForm(); setEditingId(null); setFormMode('add'); };

  const openEdit = (r: Room) => {
    setName(r.name); setBuilding(r.building); setCapacity(String(r.capacity)); setType(r.type);
    setEditingId(r.id);
    setFormMode('edit');
  };

  const closeForm = () => { setFormMode('hidden'); setEditingId(null); };

  const handleSave = () => {
    if (!name.trim()) { toast.error('Nome é obrigatório'); return; }
    const cap = parseInt(capacity, 10);
    if (!cap || cap < 1) { toast.error('Capacidade inválida'); return; }
    const data = { name: name.trim(), building: building.trim(), capacity: cap, type };
    if (formMode === 'edit' && editingId) {
      updateRoom({ id: editingId, ...data });
      toast.success('Sala atualizada');
    } else {
      addRoom(data);
      toast.success('Sala adicionada');
    }
    closeForm();
  };

  const handleDelete = (r: Room) => {
    deleteRoom(r.id);
    toast.success(`${r.name} removida`);
    if (editingId === r.id) closeForm();
  };

  const labs  = rooms.filter(r => r.type === 'laboratory').length;
  const salas = rooms.filter(r => r.type === 'theoretical').length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Salas</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {salas} teórica(s) · {labs} laboratório(s)
            </p>
          </div>
          {formMode === 'hidden' && (
            <Button onClick={openAdd} className="gap-1.5">
              <Plus className="w-4 h-4" /> Nova Sala
            </Button>
          )}
        </div>

        {/* Inline form */}
        {formMode !== 'hidden' && (
          <Card className="border-primary/30 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                {formMode === 'add' ? 'Nova Sala' : 'Editar Sala'}
              </CardTitle>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={closeForm}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nome da sala *</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Sala 101" />
                </div>
                <div className="space-y-1.5">
                  <Label>Bloco / Prédio</Label>
                  <Input value={building} onChange={e => setBuilding(e.target.value)} placeholder="Bloco A" />
                </div>
                <div className="space-y-1.5">
                  <Label>Capacidade *</Label>
                  <Input type="number" min={1} value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="40" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <Select value={type} onValueChange={v => setType(v as Room['type'])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="theoretical">Sala Teórica</SelectItem>
                      <SelectItem value="laboratory">Laboratório</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={closeForm}>Cancelar</Button>
                <Button onClick={handleSave} className="gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  {formMode === 'add' ? 'Adicionar' : 'Salvar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="hidden sm:table-cell">Bloco</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead className="w-20 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map(r => (
                <TableRow key={r.id} className={editingId === r.id ? 'bg-primary/5' : ''}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>
                    {r.type === 'laboratory' ? (
                      <Badge variant="outline" className="gap-1 text-violet-700 border-violet-300 bg-violet-50">
                        <FlaskConical className="w-3 h-3" /> Laboratório
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-sky-700 border-sky-300 bg-sky-50">
                        <MonitorPlay className="w-3 h-3" /> Teórica
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{r.building || '—'}</TableCell>
                  <TableCell className="text-sm">{r.capacity} alunos</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon" variant="ghost" className="h-7 w-7 mr-1"
                      onClick={() => editingId === r.id ? closeForm() : openEdit(r)}
                    >
                      {editingId === r.id ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                    </Button>
                    <Button
                      size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(r)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rooms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-sm">
                    Nenhuma sala cadastrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
