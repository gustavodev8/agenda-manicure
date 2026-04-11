import { useState } from "react";
import { Plus, Pencil, Trash2, FlaskConical, MonitorPlay } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { useSchedule } from "@/contexts/ScheduleContext";
import type { Room } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ─── Dialog ───────────────────────────────────────────────────────────────────

interface RoomDialogProps {
  open: boolean;
  initial?: Room | null;
  onSave: (data: Omit<Room, 'id'> & { id?: string }) => void;
  onClose: () => void;
}

function RoomDialog({ open, initial, onSave, onClose }: RoomDialogProps) {
  const [name,     setName]     = useState(initial?.name     ?? "");
  const [building, setBuilding] = useState(initial?.building ?? "");
  const [capacity, setCapacity] = useState(String(initial?.capacity ?? ""));
  const [type,     setType]     = useState<Room['type']>(initial?.type ?? "theoretical");

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setName(initial?.name ?? "");
      setBuilding(initial?.building ?? "");
      setCapacity(String(initial?.capacity ?? ""));
      setType(initial?.type ?? "theoretical");
    }
  };

  const handleSave = () => {
    if (!name.trim()) { toast.error("Nome é obrigatório"); return; }
    const cap = parseInt(capacity, 10);
    if (!cap || cap < 1) { toast.error("Capacidade deve ser um número positivo"); return; }
    onSave({ id: initial?.id, name: name.trim(), building: building.trim(), capacity: cap, type });
  };

  return (
    <Dialog open={open} onOpenChange={v => { handleOpen(v); if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar Sala" : "Nova Sala"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="rname">Nome da sala *</Label>
            <Input id="rname" value={name} onChange={e => setName(e.target.value)} placeholder="Sala 101" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="rbld">Bloco / Prédio</Label>
              <Input id="rbld" value={building} onChange={e => setBuilding(e.target.value)} placeholder="Bloco A" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rcap">Capacidade *</Label>
              <Input id="rcap" type="number" min={1} value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="40" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={v => setType(v as Room['type'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="theoretical">Sala Teórica</SelectItem>
                <SelectItem value="laboratory">Laboratório</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>{initial ? "Salvar" : "Adicionar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SalasPage() {
  const { rooms, addRoom, updateRoom, deleteRoom } = useSchedule();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing,    setEditing]    = useState<Room | null>(null);
  const [deleting,   setDeleting]   = useState<Room | null>(null);

  const labs  = rooms.filter(r => r.type === 'laboratory').length;
  const salas = rooms.filter(r => r.type === 'theoretical').length;

  const handleSave = (data: Omit<Room, 'id'> & { id?: string }) => {
    if (data.id) {
      updateRoom(data as Room);
      toast.success("Sala atualizada");
    } else {
      addRoom(data);
      toast.success("Sala adicionada");
    }
    setDialogOpen(false);
    setEditing(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Salas</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {salas} sala(s) teórica(s) · {labs} laboratório(s)
            </p>
          </div>
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-1.5">
            <Plus className="w-4 h-4" /> Nova Sala
          </Button>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Bloco</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map(r => (
                <TableRow key={r.id}>
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
                  <TableCell className="text-sm text-muted-foreground">{r.building || "—"}</TableCell>
                  <TableCell className="text-sm">{r.capacity} alunos</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" className="h-7 w-7 mr-1" onClick={() => { setEditing(r); setDialogOpen(true); }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleting(r)}>
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

      <RoomDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        initial={editing}
        onSave={handleSave}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
      />

      <AlertDialog open={!!deleting} onOpenChange={v => { if (!v) setDeleting(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover sala?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleting?.name}</strong> será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { deleteRoom(deleting!.id); toast.success("Sala removida"); setDeleting(null); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
