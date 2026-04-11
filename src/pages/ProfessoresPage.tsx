import { useState } from "react";
import { Plus, Pencil, Trash2, Mail, Building2 } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { useSchedule } from "@/contexts/ScheduleContext";
import type { Professor, DayOfWeek } from "@/types";
import { DAYS_OF_WEEK, TIME_PERIODS } from "@/types";
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

// ─── Availability Matrix ──────────────────────────────────────────────────────

function AvailabilityMatrix({
  value,
  onChange,
}: {
  value: Record<DayOfWeek, string[]>;
  onChange: (v: Record<DayOfWeek, string[]>) => void;
}) {
  const toggle = (day: DayOfWeek, periodId: string) => {
    const current = value[day] ?? [];
    const next = current.includes(periodId)
      ? current.filter(p => p !== periodId)
      : [...current, periodId];
    onChange({ ...value, [day]: next });
  };

  const toggleDay = (day: DayOfWeek) => {
    const current = value[day] ?? [];
    const all = TIME_PERIODS.map(p => p.id);
    onChange({ ...value, [day]: current.length === all.length ? [] : all });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="py-1 pr-2 text-left text-muted-foreground font-medium w-28">Horário</th>
            {DAYS_OF_WEEK.map(d => (
              <th key={d.key} className="text-center pb-1">
                <button
                  type="button"
                  onClick={() => toggleDay(d.key)}
                  className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                  title={`Marcar/desmarcar ${d.label}`}
                >
                  {d.short}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_PERIODS.map(period => (
            <tr key={period.id} className="border-t border-border/50">
              <td className="py-1 pr-2 text-muted-foreground whitespace-nowrap">{period.label}</td>
              {DAYS_OF_WEEK.map(d => {
                const checked = (value[d.key] ?? []).includes(period.id);
                return (
                  <td key={d.key} className="text-center py-1">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggle(d.key, period.id)}
                      className="h-4 w-4"
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Empty availability ───────────────────────────────────────────────────────

function emptyAvailability(): Record<DayOfWeek, string[]> {
  return { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [] };
}

// ─── ProfessorDialog ──────────────────────────────────────────────────────────

interface ProfessorDialogProps {
  open: boolean;
  initial?: Professor | null;
  onSave: (data: Omit<Professor, 'id'> & { id?: string }) => void;
  onClose: () => void;
}

function ProfessorDialog({ open, initial, onSave, onClose }: ProfessorDialogProps) {
  const { subjects } = useSchedule();
  const [name,         setName]         = useState(initial?.name         ?? "");
  const [email,        setEmail]        = useState(initial?.email        ?? "");
  const [department,   setDepartment]   = useState(initial?.department   ?? "");
  const [subjectIds,   setSubjectIds]   = useState<string[]>(initial?.subjectIds ?? []);
  const [availability, setAvailability] = useState<Record<DayOfWeek, string[]>>(
    initial?.availability ?? emptyAvailability()
  );

  // Reset when dialog opens with new data
  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setName(initial?.name ?? "");
      setEmail(initial?.email ?? "");
      setDepartment(initial?.department ?? "");
      setSubjectIds(initial?.subjectIds ?? []);
      setAvailability(initial?.availability ?? emptyAvailability());
    }
  };

  const toggleSubject = (id: string) =>
    setSubjectIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSave = () => {
    if (!name.trim()) { toast.error("Nome é obrigatório"); return; }
    onSave({ id: initial?.id, name: name.trim(), email: email.trim(), department: department.trim(), subjectIds, availability });
  };

  return (
    <Dialog open={open} onOpenChange={v => { handleOpen(v); if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar Professor" : "Novo Professor"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pname">Nome completo *</Label>
              <Input id="pname" value={name} onChange={e => setName(e.target.value)} placeholder="Dr. João Silva" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pemail">E-mail</Label>
              <Input id="pemail" value={email} onChange={e => setEmail(e.target.value)} placeholder="joao@univ.edu.br" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pdept">Departamento</Label>
            <Input id="pdept" value={department} onChange={e => setDepartment(e.target.value)} placeholder="Computação" />
          </div>

          {/* Subjects */}
          <div className="space-y-2">
            <Label>Disciplinas que leciona</Label>
            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto border rounded-md p-2">
              {subjects.map(s => (
                <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={subjectIds.includes(s.id)}
                    onCheckedChange={() => toggleSubject(s.id)}
                  />
                  <span className="leading-tight">{s.code} — {s.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability Matrix */}
          <div className="space-y-2">
            <Label>Disponibilidade semanal <span className="text-muted-foreground text-xs">(clique no dia para marcar todos)</span></Label>
            <div className="border rounded-md p-3 bg-muted/30">
              <AvailabilityMatrix value={availability} onChange={setAvailability} />
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

export default function ProfessoresPage() {
  const { professors, subjects, addProfessor, updateProfessor, deleteProfessor } = useSchedule();
  const [dialogOpen, setDialogOpen]   = useState(false);
  const [editing,    setEditing]      = useState<Professor | null>(null);
  const [deleting,   setDeleting]     = useState<Professor | null>(null);

  const availabilityCount = (p: Professor) =>
    Object.values(p.availability).reduce((a, slots) => a + slots.length, 0);

  const handleSave = (data: Omit<Professor, 'id'> & { id?: string }) => {
    if (data.id) {
      updateProfessor(data as Professor);
      toast.success("Professor atualizado");
    } else {
      addProfessor(data);
      toast.success("Professor adicionado");
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteProfessor(deleting.id);
    toast.success("Professor removido");
    setDeleting(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Professores</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{professors.length} professor(es) cadastrado(s)</p>
          </div>
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-1.5">
            <Plus className="w-4 h-4" /> Novo Professor
          </Button>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Departamento</TableHead>
                <TableHead>Disciplinas</TableHead>
                <TableHead className="hidden sm:table-cell">Disponib.</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professors.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.name}</div>
                    {p.email && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />{p.email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {p.department ? (
                      <span className="flex items-center gap-1 text-sm">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />{p.department}
                      </span>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.subjectIds.slice(0, 3).map(sid => {
                        const s = subjects.find(x => x.id === sid);
                        return s ? (
                          <Badge key={sid} variant="secondary" className="text-xs">{s.code}</Badge>
                        ) : null;
                      })}
                      {p.subjectIds.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{p.subjectIds.length - 3}</Badge>
                      )}
                      {p.subjectIds.length === 0 && <span className="text-xs text-muted-foreground">Nenhuma</span>}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">
                    <span className={availabilityCount(p) === 0 ? "text-destructive" : "text-emerald-600"}>
                      {availabilityCount(p)} slots
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon" variant="ghost" className="h-7 w-7 mr-1"
                      onClick={() => { setEditing(p); setDialogOpen(true); }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleting(p)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {professors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-sm">
                    Nenhum professor cadastrado. Adicione o primeiro!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <ProfessorDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        initial={editing}
        onSave={handleSave}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
      />

      <AlertDialog open={!!deleting} onOpenChange={v => { if (!v) setDeleting(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover professor?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleting?.name}</strong> será removido permanentemente.
              Aulas já alocadas para este professor permanecerão na grade mas ficarão sem professor válido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
