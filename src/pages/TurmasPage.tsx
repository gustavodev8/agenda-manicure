import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Users } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { useSchedule } from "@/contexts/ScheduleContext";
import type { ClassGroup } from "@/types";
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

type FormMode = 'hidden' | 'add' | 'edit';

export default function TurmasPage() {
  const { classGroups, subjects, addClassGroup, updateClassGroup, deleteClassGroup } = useSchedule();

  const [formMode,  setFormMode]  = useState<FormMode>('hidden');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name,         setName]         = useState('');
  const [course,       setCourse]       = useState('');
  const [semester,     setSemester]     = useState('1');
  const [studentCount, setStudentCount] = useState('');
  const [subjectIds,   setSubjectIds]   = useState<string[]>([]);

  const resetForm = () => { setName(''); setCourse(''); setSemester('1'); setStudentCount(''); setSubjectIds([]); };

  const openAdd = () => { resetForm(); setEditingId(null); setFormMode('add'); };

  const openEdit = (cg: ClassGroup) => {
    setName(cg.name); setCourse(cg.course); setSemester(String(cg.semester));
    setStudentCount(String(cg.studentCount)); setSubjectIds([...cg.subjectIds]);
    setEditingId(cg.id);
    setFormMode('edit');
  };

  const closeForm = () => { setFormMode('hidden'); setEditingId(null); };

  const handleSave = () => {
    if (!name.trim()) { toast.error('Nome da turma é obrigatório'); return; }
    const count = parseInt(studentCount, 10);
    if (!count || count < 1) { toast.error('Número de alunos inválido'); return; }
    const data = {
      name: name.trim(), course: course.trim(),
      semester: parseInt(semester, 10) || 1,
      studentCount: count, subjectIds,
    };
    if (formMode === 'edit' && editingId) {
      updateClassGroup({ id: editingId, ...data });
      toast.success('Turma atualizada');
    } else {
      addClassGroup(data);
      toast.success('Turma adicionada');
    }
    closeForm();
  };

  const handleDelete = (cg: ClassGroup) => {
    deleteClassGroup(cg.id);
    toast.success(`Turma ${cg.name} removida`);
    if (editingId === cg.id) closeForm();
  };

  const toggleSubject = (id: string) =>
    setSubjectIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const semNum = parseInt(semester, 10) || 1;
  const suggestedSubjects = subjects.filter(s => s.semester === semNum);
  const otherSubjects     = subjects.filter(s => s.semester !== semNum);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Turmas</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{classGroups.length} turma(s)</p>
          </div>
          {formMode === 'hidden' && (
            <Button onClick={openAdd} className="gap-1.5">
              <Plus className="w-4 h-4" /> Nova Turma
            </Button>
          )}
        </div>

        {/* Inline form */}
        {formMode !== 'hidden' && (
          <Card className="border-primary/30 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                {formMode === 'add' ? 'Nova Turma' : 'Editar Turma'}
              </CardTitle>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={closeForm}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nome da turma *</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="ADS-1A" />
                </div>
                <div className="space-y-1.5">
                  <Label>Nº de alunos *</Label>
                  <Input type="number" min={1} value={studentCount} onChange={e => setStudentCount(e.target.value)} placeholder="35" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Curso</Label>
                <Input value={course} onChange={e => setCourse(e.target.value)} placeholder="Análise e Desenvolvimento de Sistemas" />
              </div>
              <div className="space-y-1.5 w-48">
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

              {/* Subject selection */}
              <div className="space-y-2">
                <Label>Disciplinas da turma <span className="text-muted-foreground text-xs">({subjectIds.length} selecionada(s))</span></Label>
                <div className="border rounded-md p-2 max-h-52 overflow-y-auto space-y-0.5">
                  {suggestedSubjects.length > 0 && (
                    <>
                      <p className="text-xs font-medium text-muted-foreground px-1 py-1">Sugeridas ({semNum}º semestre)</p>
                      {suggestedSubjects.map(s => (
                        <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer px-1 py-1 rounded hover:bg-muted/50">
                          <Checkbox checked={subjectIds.includes(s.id)} onCheckedChange={() => toggleSubject(s.id)} />
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                          <span>{s.code} — {s.name}</span>
                        </label>
                      ))}
                    </>
                  )}
                  {otherSubjects.length > 0 && (
                    <>
                      <p className="text-xs font-medium text-muted-foreground px-1 py-1 pt-2">Outros semestres</p>
                      {otherSubjects.map(s => (
                        <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer px-1 py-1 rounded hover:bg-muted/50 text-muted-foreground">
                          <Checkbox checked={subjectIds.includes(s.id)} onCheckedChange={() => toggleSubject(s.id)} />
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                          <span>{s.code} — {s.name} <span className="text-xs">({s.semester}º)</span></span>
                        </label>
                      ))}
                    </>
                  )}
                  {subjects.length === 0 && (
                    <p className="text-xs text-muted-foreground px-1 py-1">Cadastre disciplinas primeiro.</p>
                  )}
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
                <TableHead>Turma</TableHead>
                <TableHead className="hidden sm:table-cell">Curso</TableHead>
                <TableHead className="text-center">Sem.</TableHead>
                <TableHead className="hidden sm:table-cell">Alunos</TableHead>
                <TableHead>Disciplinas</TableHead>
                <TableHead className="w-20 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classGroups.map(cg => (
                <TableRow key={cg.id} className={editingId === cg.id ? 'bg-primary/5' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="font-semibold">{cg.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground max-w-[180px] truncate">
                    {cg.course || '—'}
                  </TableCell>
                  <TableCell className="text-center text-sm">{cg.semester}º</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">{cg.studentCount}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {cg.subjectIds.slice(0, 4).map(sid => {
                        const s = subjects.find(x => x.id === sid);
                        return s ? (
                          <span
                            key={sid}
                            className="inline-block px-1.5 py-0.5 rounded text-white text-xs font-medium"
                            style={{ backgroundColor: s.color }}
                          >
                            {s.code}
                          </span>
                        ) : null;
                      })}
                      {cg.subjectIds.length > 4 && <Badge variant="outline" className="text-xs">+{cg.subjectIds.length - 4}</Badge>}
                      {cg.subjectIds.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon" variant="ghost" className="h-7 w-7 mr-1"
                      onClick={() => editingId === cg.id ? closeForm() : openEdit(cg)}
                    >
                      {editingId === cg.id ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                    </Button>
                    <Button
                      size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(cg)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {classGroups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                    Nenhuma turma cadastrada.
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
