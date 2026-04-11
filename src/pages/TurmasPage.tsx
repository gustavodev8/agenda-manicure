import { useState } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { useSchedule } from "@/contexts/ScheduleContext";
import type { ClassGroup } from "@/types";
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

// ─── Dialog ───────────────────────────────────────────────────────────────────

interface CGDialogProps {
  open: boolean;
  initial?: ClassGroup | null;
  onSave: (data: Omit<ClassGroup, 'id'> & { id?: string }) => void;
  onClose: () => void;
}

function ClassGroupDialog({ open, initial, onSave, onClose }: CGDialogProps) {
  const { subjects } = useSchedule();
  const [name,         setName]         = useState(initial?.name         ?? "");
  const [course,       setCourse]       = useState(initial?.course       ?? "");
  const [semester,     setSemester]     = useState(String(initial?.semester ?? "1"));
  const [studentCount, setStudentCount] = useState(String(initial?.studentCount ?? ""));
  const [subjectIds,   setSubjectIds]   = useState<string[]>(initial?.subjectIds ?? []);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setName(initial?.name ?? "");
      setCourse(initial?.course ?? "");
      setSemester(String(initial?.semester ?? "1"));
      setStudentCount(String(initial?.studentCount ?? ""));
      setSubjectIds(initial?.subjectIds ?? []);
    }
  };

  const toggleSubject = (id: string) =>
    setSubjectIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSave = () => {
    if (!name.trim()) { toast.error("Nome da turma é obrigatório"); return; }
    const count = parseInt(studentCount, 10);
    if (!count || count < 1) { toast.error("Número de alunos inválido"); return; }
    onSave({
      id: initial?.id,
      name: name.trim(),
      course: course.trim(),
      semester: parseInt(semester, 10) || 1,
      studentCount: count,
      subjectIds,
    });
  };

  // Filter subjects by semester
  const semNum = parseInt(semester, 10) || 1;
  const suggestedSubjects = subjects.filter(s => s.semester === semNum);
  const otherSubjects = subjects.filter(s => s.semester !== semNum);

  return (
    <Dialog open={open} onOpenChange={v => { handleOpen(v); if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar Turma" : "Nova Turma"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cgname">Nome da turma *</Label>
              <Input id="cgname" value={name} onChange={e => setName(e.target.value)} placeholder="ADS-1A" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cgcount">Nº de alunos *</Label>
              <Input id="cgcount" type="number" min={1} value={studentCount} onChange={e => setStudentCount(e.target.value)} placeholder="35" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cgcourse">Curso</Label>
            <Input id="cgcourse" value={course} onChange={e => setCourse(e.target.value)} placeholder="Análise e Desenvolvimento de Sistemas" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cgsem">Semestre</Label>
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger id="cgsem"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5,6,7,8].map(s => (
                  <SelectItem key={s} value={String(s)}>{s}º Semestre</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject selection */}
          <div className="space-y-2">
            <Label>Disciplinas da turma</Label>
            <div className="border rounded-md p-2 space-y-1 max-h-52 overflow-y-auto">
              {suggestedSubjects.length > 0 && (
                <>
                  <p className="text-xs font-medium text-muted-foreground px-1 pb-1">
                    Sugeridas para o {semNum}º semestre
                  </p>
                  {suggestedSubjects.map(s => (
                    <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer px-1 py-0.5 rounded hover:bg-muted/50">
                      <Checkbox
                        checked={subjectIds.includes(s.id)}
                        onCheckedChange={() => toggleSubject(s.id)}
                      />
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <span>{s.code} — {s.name}</span>
                    </label>
                  ))}
                </>
              )}
              {otherSubjects.length > 0 && (
                <>
                  <p className="text-xs font-medium text-muted-foreground px-1 pb-1 pt-2">
                    Outros semestres
                  </p>
                  {otherSubjects.map(s => (
                    <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer px-1 py-0.5 rounded hover:bg-muted/50 text-muted-foreground">
                      <Checkbox
                        checked={subjectIds.includes(s.id)}
                        onCheckedChange={() => toggleSubject(s.id)}
                      />
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <span>{s.code} — {s.name} <span className="text-xs">({s.semester}º sem.)</span></span>
                    </label>
                  ))}
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{subjectIds.length} disciplina(s) selecionada(s)</p>
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

export default function TurmasPage() {
  const { classGroups, subjects, addClassGroup, updateClassGroup, deleteClassGroup } = useSchedule();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing,    setEditing]    = useState<ClassGroup | null>(null);
  const [deleting,   setDeleting]   = useState<ClassGroup | null>(null);

  const handleSave = (data: Omit<ClassGroup, 'id'> & { id?: string }) => {
    if (data.id) {
      updateClassGroup(data as ClassGroup);
      toast.success("Turma atualizada");
    } else {
      addClassGroup(data);
      toast.success("Turma adicionada");
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
            <h1 className="text-xl font-bold">Turmas</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{classGroups.length} turma(s) cadastrada(s)</p>
          </div>
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-1.5">
            <Plus className="w-4 h-4" /> Nova Turma
          </Button>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Turma</TableHead>
                <TableHead className="hidden sm:table-cell">Curso</TableHead>
                <TableHead>Sem.</TableHead>
                <TableHead className="hidden sm:table-cell">Alunos</TableHead>
                <TableHead>Disciplinas</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classGroups.map(cg => (
                <TableRow key={cg.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="font-semibold">{cg.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                    {cg.course || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-center">{cg.semester}º</TableCell>
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
                      {cg.subjectIds.length > 4 && (
                        <Badge variant="outline" className="text-xs">+{cg.subjectIds.length - 4}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" className="h-7 w-7 mr-1" onClick={() => { setEditing(cg); setDialogOpen(true); }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleting(cg)}>
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

      <ClassGroupDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        initial={editing}
        onSave={handleSave}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
      />

      <AlertDialog open={!!deleting} onOpenChange={v => { if (!v) setDeleting(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover turma?</AlertDialogTitle>
            <AlertDialogDescription>
              A turma <strong>{deleting?.name}</strong> será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { deleteClassGroup(deleting!.id); toast.success("Turma removida"); setDeleting(null); }}
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
