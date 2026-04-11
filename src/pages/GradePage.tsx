import { useState, useMemo, useCallback } from "react";
import { Sparkles, AlertTriangle, CheckCircle2, Trash2, Info } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { useSchedule } from "@/contexts/ScheduleContext";
import type { ScheduleEntry, DayOfWeek } from "@/types";
import { DAYS_OF_WEEK, TIME_PERIODS } from "@/types";
import { validateSchedule } from "@/lib/scheduleAlgorithm";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── EntryCard ────────────────────────────────────────────────────────────────

interface EntryCardProps {
  entry: ScheduleEntry;
  isConflict: boolean;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
}

function EntryCard({ entry, isConflict, isDragging, onDragStart, onDragEnd }: EntryCardProps) {
  const { professors, rooms, subjects, classGroups } = useSchedule();
  const subject  = subjects.find(s => s.id === entry.subjectId);
  const prof     = professors.find(p => p.id === entry.professorId);
  const room     = rooms.find(r => r.id === entry.roomId);
  const cg       = classGroups.find(c => c.id === entry.classGroupId);

  const profShort = prof
    ? prof.name.split(' ').filter((_, i, arr) => i === 0 || i === arr.length - 1).join(' ')
    : "—";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          draggable
          onDragStart={e => onDragStart(e, entry.id)}
          onDragEnd={onDragEnd}
          className={cn(
            "rounded p-1.5 mb-1 text-xs cursor-grab active:cursor-grabbing select-none transition-opacity",
            isDragging && "opacity-40",
            isConflict
              ? "border-2 border-destructive bg-destructive/10 text-destructive-foreground"
              : "border-l-[3px] text-foreground",
          )}
          style={!isConflict ? {
            borderLeftColor: subject?.color ?? '#6366f1',
            backgroundColor: `${subject?.color ?? '#6366f1'}18`,
          } : {}}
        >
          <div className="font-semibold truncate leading-tight">
            {subject?.code ?? "?"}
          </div>
          <div className="truncate text-muted-foreground leading-tight mt-0.5">{profShort}</div>
          <div className="truncate text-muted-foreground leading-tight">{room?.name ?? "?"}</div>
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

// ─── GradePage ────────────────────────────────────────────────────────────────

type ViewFilter = 'all' | 'class' | 'professor' | 'room';

export default function GradePage() {
  const {
    professors, rooms, subjects, classGroups,
    entries, conflictReport,
    runGenerate, updateEntry, clearSchedule,
  } = useSchedule();

  // ── Filter state ──
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [selectedId,  setSelectedId]  = useState<string>('');

  // ── Drag state ──
  const [draggingId,  setDraggingId]  = useState<string | null>(null);
  const [dropTarget,  setDropTarget]  = useState<string | null>(null); // "day:periodId"

  // ── Derived: filtered entries ──
  const filteredEntries = useMemo(() => {
    if (viewFilter === 'all' || !selectedId) return entries;
    switch (viewFilter) {
      case 'class':     return entries.filter(e => e.classGroupId === selectedId);
      case 'professor': return entries.filter(e => e.professorId  === selectedId);
      case 'room':      return entries.filter(e => e.roomId       === selectedId);
    }
  }, [entries, viewFilter, selectedId]);

  // ── Build grid map: "day:periodId" → ScheduleEntry[] ──
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

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, day: DayOfWeek, periodId: string) => {
    e.preventDefault();
    const entryId = e.dataTransfer.getData('entryId');
    if (!entryId) return;

    const original = entries.find(x => x.id === entryId);
    if (!original || (original.day === day && original.periodId === periodId)) {
      setDraggingId(null);
      setDropTarget(null);
      return;
    }

    const updated: ScheduleEntry = { ...original, day, periodId };
    const newEntries = entries.map(x => x.id === entryId ? updated : x);
    const report = validateSchedule(newEntries);

    if (report.conflictingEntryIds.has(entryId)) {
      toast.error('Conflito detectado!', {
        description: report.conflicts
          .filter(c => c.entryIds.includes(entryId))
          .map(c => c.message)
          .join(' · '),
      });
    } else {
      toast.success('Horário atualizado');
    }

    updateEntry(updated);
    setDraggingId(null);
    setDropTarget(null);
  }, [entries, updateEntry]);

  // ── Generate ──
  const handleGenerate = () => {
    const result = runGenerate();
    const msg = result.unscheduled.length > 0
      ? `${result.entries.length} aulas geradas · ${result.unscheduled.length} não alocada(s)`
      : `${result.entries.length} aulas geradas com sucesso!`;
    if (result.conflictReport.hasConflicts) {
      toast.warning(msg, { description: `${result.conflictReport.conflicts.length} conflito(s) detectado(s)` });
    } else {
      toast.success(msg);
    }
  };

  // ── Select options ──
  const selectOptions = useMemo(() => {
    switch (viewFilter) {
      case 'class':     return classGroups.map(c => ({ id: c.id, label: c.name }));
      case 'professor': return professors.map(p => ({ id: p.id, label: p.name }));
      case 'room':      return rooms.map(r => ({ id: r.id, label: r.name }));
      default: return [];
    }
  }, [viewFilter, classGroups, professors, rooms]);

  const hasEntries = entries.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-full px-4 py-6 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Grade Horária</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {hasEntries ? `${entries.length} aulas alocadas` : 'Sem grade gerada'}
              {conflictReport.hasConflicts && (
                <span className="ml-2 text-destructive font-medium">
                  · {conflictReport.conflicts.length} conflito(s)
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {hasEntries && (
              <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => { clearSchedule(); toast.info("Grade limpa"); }}>
                <Trash2 className="w-3.5 h-3.5" /> Limpar
              </Button>
            )}
            <Button onClick={handleGenerate} className="gap-1.5 shadow-sm">
              <Sparkles className="w-4 h-4" />
              {hasEntries ? "Regerar Grade" : "Gerar Grade"}
            </Button>
          </div>
        </div>

        {/* Conflict summary */}
        {conflictReport.hasConflicts && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-destructive">
                {conflictReport.conflicts.length} conflito(s) na grade atual
              </p>
              <ul className="text-xs text-destructive/80 list-disc list-inside space-y-0.5">
                {conflictReport.conflicts.slice(0, 5).map((c, i) => (
                  <li key={i}>{c.message}</li>
                ))}
                {conflictReport.conflicts.length > 5 && (
                  <li>... e mais {conflictReport.conflicts.length - 5} conflito(s)</li>
                )}
              </ul>
            </div>
          </div>
        )}
        {hasEntries && !conflictReport.hasConflicts && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50/50 px-4 py-2.5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-sm text-emerald-700">Grade sem conflitos. Todas as restrições estão satisfeitas.</p>
          </div>
        )}

        {/* Filter bar */}
        {hasEntries && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Visualizar por:</span>
            <div className="flex items-center gap-1.5 bg-muted p-0.5 rounded-md">
              {(['all', 'class', 'professor', 'room'] as ViewFilter[]).map(v => (
                <button
                  key={v}
                  onClick={() => { setViewFilter(v); setSelectedId(''); }}
                  className={cn(
                    "px-3 py-1 rounded text-sm transition-colors",
                    viewFilter === v
                      ? "bg-background shadow text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {{ all: 'Todos', class: 'Turma', professor: 'Professor', room: 'Sala' }[v]}
                </button>
              ))}
            </div>
            {viewFilter !== 'all' && (
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger className="w-48 h-8 text-sm">
                  <SelectValue placeholder={`Selecionar ${viewFilter === 'class' ? 'turma' : viewFilter === 'professor' ? 'professor' : 'sala'}`} />
                </SelectTrigger>
                <SelectContent>
                  {selectOptions.map(o => (
                    <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Legend */}
        {hasEntries && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground items-center">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3" />
              Arraste as aulas para reposicioná-las
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded border-2 border-destructive bg-destructive/10" />
              Conflito
            </span>
            {subjects.slice(0, 5).map(s => (
              <span key={s.id} className="flex items-center gap-1">
                <span
                  className="inline-block w-3 h-3 rounded"
                  style={{ backgroundColor: s.color }}
                />
                {s.code}
              </span>
            ))}
          </div>
        )}

        {/* Calendar grid */}
        {!hasEntries ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Nenhuma grade gerada</h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              Clique em <strong>Gerar Grade</strong> para o sistema alocar automaticamente
              as disciplinas respeitando as restrições de professores, salas e horários.
            </p>
            <Button onClick={handleGenerate} className="gap-2 mt-2">
              <Sparkles className="w-4 h-4" /> Gerar Grade
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="w-28 py-2 px-3 text-left text-xs font-medium text-muted-foreground">
                    Horário
                  </th>
                  {DAYS_OF_WEEK.map(d => (
                    <th key={d.key} className="py-2 px-2 text-center text-xs font-semibold text-foreground">
                      <span className="hidden sm:inline">{d.label}</span>
                      <span className="sm:hidden">{d.short}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_PERIODS.map((period, pIdx) => (
                  <tr
                    key={period.id}
                    className={cn(
                      "border-b last:border-0",
                      period.shift === 'morning'   && "bg-sky-50/30",
                      period.shift === 'afternoon' && "bg-background",
                      period.shift === 'evening'   && "bg-indigo-50/20",
                    )}
                  >
                    {/* Time label */}
                    <td className="py-2 px-3 text-xs text-muted-foreground whitespace-nowrap align-top">
                      <div className="font-medium">{period.label}</div>
                      <div className="capitalize text-[10px] opacity-70">{
                        { morning: 'Manhã', afternoon: 'Tarde', evening: 'Noite' }[period.shift]
                      }</div>
                    </td>

                    {/* Day cells */}
                    {DAYS_OF_WEEK.map(day => {
                      const cellKey   = `${day.key}:${period.id}`;
                      const cellEntries = gridMap.get(cellKey) ?? [];
                      const isTarget  = dropTarget === cellKey;
                      const isDragSrc = draggingId != null && cellEntries.some(e => e.id === draggingId);

                      return (
                        <td
                          key={day.key}
                          className={cn(
                            "border-l align-top p-1 min-h-[72px] min-w-[110px] transition-colors",
                            isTarget && "bg-primary/10 ring-inset ring-1 ring-primary",
                            !isTarget && draggingId && cellEntries.length === 0 && "hover:bg-muted/40",
                          )}
                          onDragOver={e => handleDragOver(e, day.key, period.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={e => handleDrop(e, day.key, period.id)}
                        >
                          {cellEntries.map(entry => (
                            <EntryCard
                              key={entry.id}
                              entry={entry}
                              isConflict={conflictReport.conflictingEntryIds.has(entry.id)}
                              isDragging={entry.id === draggingId}
                              onDragStart={handleDragStart}
                              onDragEnd={handleDragEnd}
                            />
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
