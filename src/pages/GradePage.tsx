import { useState, useMemo, useCallback } from "react";
import { AlertTriangle, CheckCircle2, X, Plus, Info, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { useSchedule } from "@/contexts/ScheduleContext";
import type { ScheduleEntry, DayOfWeek } from "@/types";
import { DAYS_OF_WEEK, TIME_PERIODS } from "@/types";
import { validateSchedule } from "@/lib/scheduleAlgorithm";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── EntryCard ────────────────────────────────────────────────────────────────

function EntryCard({
  entry,
  isConflict,
  isDragging,
  onDragStart,
  onDragEnd,
  onRemove,
}: {
  entry: ScheduleEntry;
  isConflict: boolean;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onRemove: () => void;
}) {
  const { professors, rooms, subjects, classGroups } = useSchedule();
  const subject = subjects.find(s => s.id === entry.subjectId);
  const prof    = professors.find(p => p.id === entry.professorId);
  const room    = rooms.find(r => r.id === entry.roomId);
  const cg      = classGroups.find(c => c.id === entry.classGroupId);

  const profShort = prof
    ? [prof.name.split(' ')[0], prof.name.split(' ').at(-1)].filter(Boolean).join(' ')
    : '—';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          draggable
          onDragStart={e => onDragStart(e, entry.id)}
          onDragEnd={onDragEnd}
          className={cn(
            'relative group rounded p-1.5 mb-1 text-xs cursor-grab active:cursor-grabbing select-none transition-opacity',
            isDragging && 'opacity-40',
            isConflict
              ? 'border-2 border-destructive bg-destructive/10 text-foreground'
              : 'border-l-[3px] text-foreground',
          )}
          style={!isConflict ? {
            borderLeftColor: subject?.color ?? '#6366f1',
            backgroundColor: `${subject?.color ?? '#6366f1'}18`,
          } : {}}
        >
          {/* Remove button */}
          <button
            onClick={e => { e.stopPropagation(); onRemove(); }}
            className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity h-4 w-4 rounded flex items-center justify-center hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
          >
            <X className="w-2.5 h-2.5" />
          </button>

          <div className="font-semibold truncate leading-tight pr-4">{subject?.code ?? '?'}</div>
          <div className="truncate text-muted-foreground leading-tight mt-0.5">{profShort}</div>
          <div className="truncate text-muted-foreground leading-tight">{room?.name ?? '?'}</div>
          {isConflict && (
            <div className="flex items-center gap-0.5 mt-1 text-destructive font-medium">
              <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
              <span>Conflito</span>
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs max-w-[220px]">
        <p className="font-semibold">{subject?.name}</p>
        <p className="text-muted-foreground">Turma: {cg?.name}</p>
        <p className="text-muted-foreground">Professor: {prof?.name}</p>
        <p className="text-muted-foreground">Sala: {room?.name} — {room?.building}</p>
        {isConflict && <p className="text-destructive font-medium mt-1">⚠ Conflito detectado!</p>}
      </TooltipContent>
    </Tooltip>
  );
}

// ─── AddEntryPanel ────────────────────────────────────────────────────────────

function AddEntryPanel({
  day,
  periodId,
  onAdd,
  onCancel,
}: {
  day: DayOfWeek;
  periodId: string;
  onAdd: (data: Omit<ScheduleEntry, 'id'>) => void;
  onCancel: () => void;
}) {
  const { professors, rooms, subjects, classGroups } = useSchedule();

  const [classGroupId, setClassGroupId] = useState('');
  const [subjectId,    setSubjectId]    = useState('');
  const [professorId,  setProfessorId]  = useState('');
  const [roomId,       setRoomId]       = useState('');

  const dayMeta    = DAYS_OF_WEEK.find(d => d.key === day);
  const periodMeta = TIME_PERIODS.find(p => p.id === periodId);

  // Filter subjects by class group
  const availableSubjects = useMemo(() => {
    if (!classGroupId) return [];
    const cg = classGroups.find(c => c.id === classGroupId);
    return subjects.filter(s => cg?.subjectIds.includes(s.id));
  }, [classGroupId, classGroups, subjects]);

  // Filter professors by subject + availability for this slot
  const availableProfessors = useMemo(() => {
    if (!subjectId) return [];
    return professors.filter(p =>
      p.subjectIds.includes(subjectId) &&
      (p.availability[day] ?? []).includes(periodId)
    );
  }, [subjectId, professors, day, periodId]);

  // Filter rooms by subject lab requirement and capacity
  const availableRooms = useMemo(() => {
    if (!classGroupId) return rooms;
    const cg  = classGroups.find(c => c.id === classGroupId);
    const sub = subjects.find(s => s.id === subjectId);
    return rooms.filter(r => {
      if (sub?.requiresLab && r.type !== 'laboratory') return false;
      if (cg && r.capacity < cg.studentCount) return false;
      return true;
    });
  }, [classGroupId, subjectId, classGroups, subjects, rooms]);

  const handleAdd = () => {
    if (!classGroupId) { toast.error('Selecione a turma'); return; }
    if (!subjectId)    { toast.error('Selecione a disciplina'); return; }
    if (!professorId)  { toast.error('Selecione o professor'); return; }
    if (!roomId)       { toast.error('Selecione a sala'); return; }
    onAdd({ classGroupId, subjectId, professorId, roomId, day, periodId });
  };

  return (
    <div className="mt-4 border rounded-lg bg-card shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          Adicionar aula — {dayMeta?.label} · {periodMeta?.label}
        </h3>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Turma *</Label>
          <Select value={classGroupId} onValueChange={v => { setClassGroupId(v); setSubjectId(''); setProfessorId(''); setRoomId(''); }}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecionar…" /></SelectTrigger>
            <SelectContent>
              {classGroups.map(cg => <SelectItem key={cg.id} value={cg.id}>{cg.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Disciplina *</Label>
          <Select value={subjectId} onValueChange={v => { setSubjectId(v); setProfessorId(''); }} disabled={!classGroupId}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={classGroupId ? 'Selecionar…' : '← Turma'} /></SelectTrigger>
            <SelectContent>
              {availableSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>)}
              {availableSubjects.length === 0 && <SelectItem value="__empty__" disabled>Sem disciplinas</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Professor *</Label>
          <Select value={professorId} onValueChange={setProfessorId} disabled={!subjectId}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={subjectId ? 'Selecionar…' : '← Disciplina'} /></SelectTrigger>
            <SelectContent>
              {availableProfessors.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              {availableProfessors.length === 0 && subjectId && (
                <SelectItem value="__empty__" disabled>Sem prof. disponível neste horário</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Sala *</Label>
          <Select value={roomId} onValueChange={setRoomId} disabled={!classGroupId}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecionar…" /></SelectTrigger>
            <SelectContent>
              {availableRooms.map(r => <SelectItem key={r.id} value={r.id}>{r.name} ({r.capacity})</SelectItem>)}
              {availableRooms.length === 0 && <SelectItem value="__empty__" disabled>Sem salas disponíveis</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" onClick={handleAdd} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Adicionar aula
        </Button>
      </div>
    </div>
  );
}

// ─── GradePage ────────────────────────────────────────────────────────────────

type ViewFilter = 'all' | 'class' | 'professor' | 'room';

export default function GradePage() {
  const {
    professors, rooms, subjects, classGroups,
    entries, conflictReport,
    addEntry, updateEntry, removeEntry, clearSchedule,
  } = useSchedule();

  // ── Filter ──
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [selectedId,  setSelectedId]  = useState<string>('');

  // ── Drag state ──
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  // ── Add panel state ──
  const [addCell, setAddCell] = useState<{ day: DayOfWeek; periodId: string } | null>(null);

  // ── Filtered entries ──
  const filteredEntries = useMemo(() => {
    if (viewFilter === 'all' || !selectedId) return entries;
    switch (viewFilter) {
      case 'class':     return entries.filter(e => e.classGroupId === selectedId);
      case 'professor': return entries.filter(e => e.professorId  === selectedId);
      case 'room':      return entries.filter(e => e.roomId       === selectedId);
    }
  }, [entries, viewFilter, selectedId]);

  // ── Grid map ──
  const gridMap = useMemo(() => {
    const map = new Map<string, ScheduleEntry[]>();
    for (const e of filteredEntries) {
      const key = `${e.day}:${e.periodId}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [filteredEntries]);

  // ── Drag handlers ──
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('entryId', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
    setAddCell(null);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDropTarget(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, day: DayOfWeek, periodId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(`${day}:${periodId}`);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, day: DayOfWeek, periodId: string) => {
    e.preventDefault();
    const entryId = e.dataTransfer.getData('entryId');
    if (!entryId) return;

    const original = entries.find(x => x.id === entryId);
    if (!original || (original.day === day && original.periodId === periodId)) {
      setDraggingId(null); setDropTarget(null); return;
    }

    const updated: ScheduleEntry = { ...original, day, periodId };
    const newEntries = entries.map(x => x.id === entryId ? updated : x);
    const report = validateSchedule(newEntries);

    if (report.conflictingEntryIds.has(entryId)) {
      toast.error('Conflito detectado!', {
        description: report.conflicts
          .filter(c => c.entryIds.includes(entryId))
          .map(c => c.message).join(' · '),
      });
    } else {
      toast.success('Aula reposicionada');
    }

    updateEntry(updated);
    setDraggingId(null);
    setDropTarget(null);
  }, [entries, updateEntry]);

  // ── Add entry ──
  const handleAddEntry = useCallback((data: Omit<ScheduleEntry, 'id'>) => {
    addEntry(data);
    const sub = subjects.find(s => s.id === data.subjectId);
    toast.success(`${sub?.code ?? 'Aula'} adicionada`);
    setAddCell(null);
  }, [addEntry, subjects]);

  // ── Remove entry ──
  const handleRemove = useCallback((id: string) => {
    const entry  = entries.find(e => e.id === id);
    const sub    = subjects.find(s => s.id === entry?.subjectId);
    removeEntry(id);
    toast.success(`${sub?.code ?? 'Aula'} removida`);
  }, [entries, removeEntry, subjects]);

  // ── Select options ──
  const selectOptions = useMemo(() => {
    switch (viewFilter) {
      case 'class':     return classGroups.map(c => ({ id: c.id, label: c.name }));
      case 'professor': return professors.map(p => ({ id: p.id, label: p.name }));
      case 'room':      return rooms.map(r => ({ id: r.id, label: r.name }));
      default: return [];
    }
  }, [viewFilter, classGroups, professors, rooms]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-full px-4 py-6 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Grade Horária</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {entries.length} aula(s) na grade
              {conflictReport.hasConflicts && (
                <span className="ml-2 text-destructive font-medium">
                  · {conflictReport.conflicts.length} conflito(s)
                </span>
              )}
            </p>
          </div>
          {entries.length > 0 && (
            <Button
              variant="outline" size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={() => { clearSchedule(); toast.info('Grade limpa'); setAddCell(null); }}
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpar grade
            </Button>
          )}
        </div>

        {/* Conflict summary */}
        {conflictReport.hasConflicts && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-destructive">
                {conflictReport.conflicts.length} conflito(s) na grade
              </p>
              <ul className="text-xs text-destructive/80 list-disc list-inside">
                {conflictReport.conflicts.slice(0, 4).map((c, i) => <li key={i}>{c.message}</li>)}
                {conflictReport.conflicts.length > 4 && <li>... e mais {conflictReport.conflicts.length - 4}</li>}
              </ul>
            </div>
          </div>
        )}
        {entries.length > 0 && !conflictReport.hasConflicts && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50/50 px-4 py-2.5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-sm text-emerald-700">Grade sem conflitos.</p>
          </div>
        )}

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Visualizar por:</span>
          <div className="flex items-center gap-0.5 bg-muted p-0.5 rounded-md">
            {(['all', 'class', 'professor', 'room'] as ViewFilter[]).map(v => (
              <button
                key={v}
                onClick={() => { setViewFilter(v); setSelectedId(''); }}
                className={cn(
                  'px-3 py-1 rounded text-sm transition-colors',
                  viewFilter === v
                    ? 'bg-background shadow text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {{ all: 'Todos', class: 'Turma', professor: 'Professor', room: 'Sala' }[v]}
              </button>
            ))}
          </div>
          {viewFilter !== 'all' && (
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-48 h-8 text-sm"><SelectValue placeholder="Selecionar…" /></SelectTrigger>
              <SelectContent>
                {selectOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Hint */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Clique numa célula vazia para adicionar uma aula · Arraste para reposicionar · Passe o mouse sobre uma aula para removê-la</span>
        </div>

        {/* Calendar grid */}
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="w-28 py-2 px-3 text-left text-xs font-medium text-muted-foreground">Horário</th>
                {DAYS_OF_WEEK.map(d => (
                  <th key={d.key} className="py-2 px-2 text-center text-xs font-semibold">
                    <span className="hidden sm:inline">{d.label}</span>
                    <span className="sm:hidden">{d.short}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_PERIODS.map(period => (
                <tr
                  key={period.id}
                  className={cn(
                    'border-b last:border-0',
                    period.shift === 'morning'   && 'bg-sky-50/30',
                    period.shift === 'afternoon' && 'bg-background',
                    period.shift === 'evening'   && 'bg-indigo-50/20',
                  )}
                >
                  <td className="py-2 px-3 text-xs text-muted-foreground whitespace-nowrap align-top">
                    <div className="font-medium">{period.label}</div>
                    <div className="capitalize text-[10px] opacity-70">
                      {{ morning: 'Manhã', afternoon: 'Tarde', evening: 'Noite' }[period.shift]}
                    </div>
                  </td>

                  {DAYS_OF_WEEK.map(day => {
                    const cellKey    = `${day.key}:${period.id}`;
                    const cellEntries = gridMap.get(cellKey) ?? [];
                    const isTarget   = dropTarget === cellKey;
                    const isSelected = addCell?.day === day.key && addCell?.periodId === period.id;

                    return (
                      <td
                        key={day.key}
                        className={cn(
                          'border-l align-top p-1 min-h-[72px] min-w-[110px] transition-colors',
                          isTarget   && 'bg-primary/10 ring-inset ring-1 ring-primary',
                          isSelected && 'bg-primary/5 ring-inset ring-1 ring-primary/50',
                          !isTarget && !isSelected && cellEntries.length === 0 && 'hover:bg-muted/40 cursor-pointer',
                        )}
                        onDragOver={e => handleDragOver(e, day.key, period.id)}
                        onDragLeave={() => setDropTarget(null)}
                        onDrop={e => handleDrop(e, day.key, period.id)}
                        onClick={() => {
                          if (draggingId) return;
                          if (cellEntries.length > 0) return; // only click on empty cells
                          setAddCell(isSelected ? null : { day: day.key, periodId: period.id });
                        }}
                      >
                        {cellEntries.map(entry => (
                          <EntryCard
                            key={entry.id}
                            entry={entry}
                            isConflict={conflictReport.conflictingEntryIds.has(entry.id)}
                            isDragging={entry.id === draggingId}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onRemove={() => handleRemove(entry.id)}
                          />
                        ))}
                        {cellEntries.length === 0 && !isSelected && (
                          <div className="w-full h-full min-h-[56px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Plus className="w-4 h-4 text-muted-foreground/40" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add entry panel (below grid, no modal) */}
        {addCell && (
          <AddEntryPanel
            day={addCell.day}
            periodId={addCell.periodId}
            onAdd={handleAddEntry}
            onCancel={() => setAddCell(null)}
          />
        )}

        {/* Legend */}
        {subjects.length > 0 && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
            {subjects.slice(0, 8).map(s => (
              <span key={s.id} className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded" style={{ backgroundColor: s.color }} />
                {s.code}
              </span>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
