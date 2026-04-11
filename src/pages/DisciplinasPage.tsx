import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { useSchedule } from "@/contexts/ScheduleContext";
import type { Subject } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const PRESET_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981',
  '#3b82f6','#ef4444','#14b8a6','#f97316','#84cc16',
];

type FormMode = 'hidden' | 'add' | 'edit';

export default function DisciplinasPage() {
  const { subjects, addSubject, updateSubject, deleteSubject } = useSchedule();

  const [formMode,  setFormMode]  = useState<FormMode>('hidden');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name,        setName]        = useState('');
  const [code,        setCode]        = useState('');
  const [weeklyHours, setWeeklyHours] = useState('4');
  const [semester,    setSemester]    = useState('1');
  const [requiresLab, setRequiresLab] = useState(false);
  const [color,       setColor]       = useState(PRESET_COLORS[0]);

  const resetForm = () => {
    setName(''); setCode(''); setWeeklyHours('4'); setSemester('1');
    setRequiresLab(false); setColor(PRESET_COLORS[0]);
  };

  const openAdd = () => { resetForm(); setEditingId(null); setFormMode('add'); };

  const openEdit = (s: Subject) => {
    setName(s.name); setCode(s.code); setWeeklyHours(String(s.weeklyHours));
    setSemester(String(s.semester)); setRequiresLab(s.requiresLab); setColor(s.color);
    setEditingId(s.id);
    setFormMode('edit');
  };

  const closeForm = () => { setFormMode('hidden'); setEditingId(null); };

  const handleSave = () => {
    if (!name.trim()) { toast.error('Nome é obrigatório'); return; }
    if (!code.trim()) { toast.error('Código é obrigatório'); return; }
    const wh = parseInt(weeklyHours, 10);
    if (!wh || wh < 1) { toast.error('Carga horária inválida'); return; }
    const data = {
      name: name.trim(), code: code.trim().toUpperCase(),
      weeklyHours: wh, sessionsPerWeek: Math.ceil(wh / 2),
      semester: parseInt(semester, 10) || 1, requiresLab, color,
    };
    if (formMode === 'edit' && editingId) {
      updateSubject({ id: editingId, ...data });
      toast.success('Disciplina atualizada');
    } else {
      addSubject(data);
      toast.success('Disciplina adicionada');
    }
    closeForm();
  };

  const handleDelete = (s: Subject) => {
    deleteSubject(s.id);
    toast.success(`${s.name} removida`);
    if (editingId === s.id) closeForm();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Disciplinas</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{subjects.length} disciplina(s)</p>
          </div>
          {formMode === 'hidden' && (
            <Button onClick={openAdd} className="gap-1.5">
              <Plus className="w-4 h-4" /> Nova Disciplina
            </Button>
          )}
        </div>

        {/* Inline form */}
        {formMode !== 'hidden' && (
          <Card className="border-primary/30 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                {formMode === 'add' ? 'Nova Disciplina' : 'Editar Disciplina'}
              </CardTitle>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={closeForm}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Nome *</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Cálculo I" />
                </div>
                <div className="space-y-1.5">
                  <Label>Código *</Label>
                  <Input value={code} onChange={e => setCode(e.target.value)} placeholder="MAT101" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Horas/semana *</Label>
                  <Select value={weeklyHours} onValueChange={setWeeklyHours}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[2,4,6,8].map(h => (
                        <SelectItem key={h} value={String(h)}>{h}h ({Math.ceil(h/2)} aula(s))</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Semestre</Label>
                  <Select value={semester} onValueChange={setSemester}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                <label htmlFor="slab" className="text-sm cursor-pointer flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-violet-500" />
                  Requer laboratório
                </label>
              </div>

              <div className="space-y-2">
                <Label>Cor na grade</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c} type="button" onClick={() => setColor(c)}
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
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden sm:table-cell">Semestre</TableHead>
                <TableHead className="hidden md:table-cell">Carga</TableHead>
                <TableHead className="hidden md:table-cell">Tipo</TableHead>
                <TableHead className="w-20 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map(s => (
                <TableRow key={s.id} className={editingId === s.id ? 'bg-primary/5' : ''}>
                  <TableCell>
                    <Badge className="font-mono text-white border-0" style={{ backgroundColor: s.color }}>
                      {s.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{s.semester}º</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{s.weeklyHours}h · {s.sessionsPerWeek} aula(s)</TableCell>
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
                    <Button
                      size="icon" variant="ghost" className="h-7 w-7 mr-1"
                      onClick={() => editingId === s.id ? closeForm() : openEdit(s)}
                    >
                      {editingId === s.id ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                    </Button>
                    <Button
                      size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(s)}
                    >
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
    </div>
  );
}
