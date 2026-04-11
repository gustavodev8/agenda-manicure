import { useState } from "react";
import { Plus, Pencil, Trash2, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { useSchedule } from "@/contexts/ScheduleContext";
import type { Subject } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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

const PRESET_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981',
  '#3b82f6','#ef4444','#14b8a6','#f97316','#84cc16',
];

interface SubjectDialogProps {
  open: boolean;
  initial?: Subject | null;
  onSave: (data: Omit<Subject, 'id'> & { id?: string }) => void;
  onClose: () => void;
}

function SubjectDialog({ open, initial, onSave, onClose }: SubjectDialogProps) {
  const [name,        setName]        = useState(initial?.name        ?? "");
  const [code,        setCode]        = useState(initial?.code        ?? "");
  const [weeklyHours, setWeeklyHours] = useState(String(initial?.weeklyHours ?? "4"));
  const [semester,    setSemester]    = useState(String(initial?.semester    ?? "1"));
  const [requiresLab, setRequiresLab] = useState(initial?.requiresLab ?? false);
  const [color,       setColor]       = useState(initial?.color       ?? PRESET_COLORS[0]);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setName(initial?.name ?? "");
      setCode(initial?.code ?? "");
      setWeeklyHours(String(initial?.weeklyHours ?? "4"));
      setSemester(String(initial?.semester ?? "1"));
      setRequiresLab(initial?.requiresLab ?? false);
      setColor(initial?.color ?? PRESET_COLORS[0]);
    }
  };

  const handleSave = () => {
    if (!name.trim()) { toast.error("Nome é obrigatório"); return; }
    if (!code.trim()) { toast.error("Código é obrigatório"); return; }
    const wh = parseInt(weeklyHours, 10);
    if (!wh || wh < 1) { toast.error("Carga horária inválida"); return; }
    onSave({
      id: initial?.id,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      weeklyHours: wh,
      sessionsPerWeek: Math.ceil(wh / 2),
      semester: parseInt(semester, 10) || 1,
      requiresLab,
      color,
    });
  };

  return (
    <Dialog open={open} onOpenChange={v => { handleOpen(v); if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar Disciplina" : "Nova Disciplina"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="sname">Nome *</Label>
              <Input id="sname" value={name} onChange={e => setName(e.target.value)} placeholder="Cálculo I" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scode">Código *</Label>
              <Input id="scode" value={code} onChange={e => setCode(e.target.value)} placeholder="MAT101" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="shours">Horas/semana *</Label>
              <Select value={weeklyHours} onValueChange={setWeeklyHours}>
                <SelectTrigger id="shours"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2,4,6,8].map(h => (
                    <SelectItem key={h} value={String(h)}>{h}h ({Math.ceil(h/2)} aulas)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ssem">Semestre</Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger id="ssem"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8].map(s => (
                    <SelectItem key={s} value={String(s)}>{s}º Semestre</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="slab" checked={requiresLab} onCheckedChange={v => setRequiresLab(!!v)} />
            <Label htmlFor="slab" className="cursor-pointer flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-violet-500" />
              Requer laboratório
            </Label>
          </div>

          <div className="space-y-2">
            <Label>Cor na grade</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-transform"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? '#000' : 'transparent',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
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

export default function DisciplinasPage() {
  const { subjects, addSubject, updateSubject, deleteSubject } = useSchedule();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing,    setEditing]    = useState<Subject | null>(null);
  const [deleting,   setDeleting]   = useState<Subject | null>(null);

  const handleSave = (data: Omit<Subject, 'id'> & { id?: string }) => {
    if (data.id) {
      updateSubject(data as Subject);
      toast.success("Disciplina atualizada");
    } else {
      addSubject(data);
      toast.success("Disciplina adicionada");
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
            <h1 className="text-xl font-bold">Disciplinas</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{subjects.length} disciplina(s) cadastrada(s)</p>
          </div>
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-1.5">
            <Plus className="w-4 h-4" /> Nova Disciplina
          </Button>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden sm:table-cell">Semestre</TableHead>
                <TableHead className="hidden md:table-cell">Carga Horária</TableHead>
                <TableHead className="hidden md:table-cell">Tipo</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map(s => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Badge
                      className="font-mono text-white border-0"
                      style={{ backgroundColor: s.color }}
                    >
                      {s.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {s.semester}º
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {s.weeklyHours}h/sem · {s.sessionsPerWeek} aula(s)
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {s.requiresLab ? (
                      <Badge variant="outline" className="gap-1 text-violet-700 border-violet-300 bg-violet-50 text-xs">
                        <FlaskConical className="w-3 h-3" /> Lab
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Teórica</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" className="h-7 w-7 mr-1" onClick={() => { setEditing(s); setDialogOpen(true); }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleting(s)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {subjects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                    Nenhuma disciplina cadastrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <SubjectDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        initial={editing}
        onSave={handleSave}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
      />

      <AlertDialog open={!!deleting} onOpenChange={v => { if (!v) setDeleting(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover disciplina?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleting?.name}</strong> será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { deleteSubject(deleting!.id); toast.success("Disciplina removida"); setDeleting(null); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
