import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Mail, Building2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

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
    onChange({
      ...value,
      [day]: current.includes(periodId)
        ? current.filter(p => p !== periodId)
        : [...current, periodId],
    });
  };

  const toggleDay = (day: DayOfWeek) => {
    const all = TIME_PERIODS.map(p => p.id);
    const current = value[day] ?? [];
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
              {DAYS_OF_WEEK.map(d => (
                <td key={d.key} className="text-center py-1">
                  <Checkbox
                    checked={(value[d.key] ?? []).includes(period.id)}
                    onCheckedChange={() => toggle(d.key, period.id)}
                    className="h-4 w-4"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function emptyAvailability(): Record<DayOfWeek, string[]> {
  return { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [] };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type FormMode = 'hidden' | 'add' | 'edit';

export default function ProfessoresPage() {
  const { professors, subjects, addProfessor, updateProfessor, deleteProfessor } = useSchedule();

  const [formMode,  setFormMode]  = useState<FormMode>('hidden');
  const [editingId, setEditingId] = useState<string | null>(null);

  // form fields
  const [name,         setName]         = useState('');
  const [email,        setEmail]        = useState('');
  const [department,   setDepartment]   = useState('');
  const [subjectIds,   setSubjectIds]   = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<DayOfWeek, string[]>>(emptyAvailability());

  const openAdd = () => {
    setName(''); setEmail(''); setDepartment('');
    setSubjectIds([]); setAvailability(emptyAvailability());
    setEditingId(null);
    setFormMode('add');
  };

  const openEdit = (p: Professor) => {
    setName(p.name); setEmail(p.email); setDepartment(p.department);
    setSubjectIds([...p.subjectIds]); setAvailability({ ...p.availability });
    setEditingId(p.id);
    setFormMode('edit');
  };

  const closeForm = () => { setFormMode('hidden'); setEditingId(null); };

  const handleSave = () => {
    if (!name.trim()) { toast.error('Nome é obrigatório'); return; }
    const data = {
      name: name.trim(), email: email.trim(),
      department: department.trim(), subjectIds, availability,
    };
    if (formMode === 'edit' && editingId) {
      updateProfessor({ id: editingId, ...data });
      toast.success('Professor atualizado');
    } else {
      addProfessor(data);
      toast.success('Professor adicionado');
    }
    closeForm();
  };

  const handleDelete = (p: Professor) => {
    deleteProfessor(p.id);
    toast.success(`${p.name} removido`);
    if (editingId === p.id) closeForm();
  };

  const toggleSubject = (id: string) =>
    setSubjectIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const availCount = (p: Professor) =>
    Object.values(p.availability).reduce((a, s) => a + s.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Professores</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{professors.length} professor(es)</p>
          </div>
          {formMode === 'hidden' && (
            <Button onClick={openAdd} className="gap-1.5">
              <Plus className="w-4 h-4" /> Novo Professor
            </Button>
          )}
        </div>

        {/* Inline form */}
        {formMode !== 'hidden' && (
          <Card className="border-primary/30 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                {formMode === 'add' ? 'Novo Professor' : 'Editar Professor'}
              </CardTitle>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={closeForm}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nome completo *</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Dr. João Silva" />
                </div>
                <div className="space-y-1.5">
                  <Label>E-mail</Label>
                  <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="joao@univ.edu.br" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Departamento</Label>
                <Input value={department} onChange={e => setDepartment(e.target.value)} placeholder="Computação" />
              </div>

              {/* Subjects */}
              <div className="space-y-2">
                <Label>Disciplinas que leciona</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto border rounded-md p-2">
                  {subjects.map(s => (
                    <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={subjectIds.includes(s.id)}
                        onCheckedChange={() => toggleSubject(s.id)}
                      />
                      <span className="leading-tight truncate">{s.code} — {s.name}</span>
                    </label>
                  ))}
                  {subjects.length === 0 && (
                    <p className="text-xs text-muted-foreground col-span-2">Cadastre disciplinas primeiro.</p>
                  )}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <Label>
                  Disponibilidade semanal{' '}
                  <span className="text-muted-foreground text-xs">(clique no dia para marcar/desmarcar todos)</span>
                </Label>
                <div className="border rounded-md p-3 bg-muted/30">
                  <AvailabilityMatrix value={availability} onChange={setAvailability} />
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
                <TableHead className="hidden md:table-cell">Departamento</TableHead>
                <TableHead>Disciplinas</TableHead>
                <TableHead className="hidden sm:table-cell">Disponib.</TableHead>
                <TableHead className="w-20 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professors.map(p => (
                <TableRow
                  key={p.id}
                  className={editingId === p.id ? 'bg-primary/5' : ''}
                >
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
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.subjectIds.slice(0, 3).map(sid => {
                        const s = subjects.find(x => x.id === sid);
                        return s ? <Badge key={sid} variant="secondary" className="text-xs">{s.code}</Badge> : null;
                      })}
                      {p.subjectIds.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{p.subjectIds.length - 3}</Badge>
                      )}
                      {p.subjectIds.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">
                    <span className={availCount(p) === 0 ? 'text-destructive' : 'text-emerald-600'}>
                      {availCount(p)} slots
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon" variant="ghost" className="h-7 w-7 mr-1"
                      onClick={() => editingId === p.id ? closeForm() : openEdit(p)}
                    >
                      {editingId === p.id ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                    </Button>
                    <Button
                      size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(p)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {professors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-sm">
                    Nenhum professor cadastrado. Clique em <strong>Novo Professor</strong> para começar.
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
