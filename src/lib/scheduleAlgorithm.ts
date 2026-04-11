import type {
  Professor,
  Room,
  Subject,
  ClassGroup,
  ScheduleEntry,
  ConflictReport,
  GenerationResult,
  DayOfWeek,
} from '@/types';
import { DAYS_OF_WEEK, TIME_PERIODS } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slotKey(day: DayOfWeek, periodId: string): string {
  return `${day}:${periodId}`;
}

function getOrCreate<V>(map: Map<string, V>, key: string, factory: () => V): V {
  if (!map.has(key)) map.set(key, factory());
  return map.get(key)!;
}

// ─── validateSchedule ─────────────────────────────────────────────────────────

/**
 * Hard Rule 1: professor never in two places at once.
 * Hard Rule 2: room never has two classes at once.
 * Hard Rule 3: class group never has two subjects at once.
 */
export function validateSchedule(entries: ScheduleEntry[]): ConflictReport {
  const conflicts: ConflictReport['conflicts'] = [];
  const conflictingEntryIds = new Set<string>();

  // Group entries by time slot
  const bySlot = new Map<string, ScheduleEntry[]>();
  for (const e of entries) {
    const key = slotKey(e.day, e.periodId);
    getOrCreate(bySlot, key, () => []).push(e);
  }

  for (const slotEntries of bySlot.values()) {
    const professorSeen = new Map<string, string>();
    const roomSeen      = new Map<string, string>();
    const classSeen     = new Map<string, string>();

    for (const entry of slotEntries) {
      // Professor conflict
      if (professorSeen.has(entry.professorId)) {
        const other = professorSeen.get(entry.professorId)!;
        conflicts.push({ type: 'professor', entryIds: [other, entry.id], message: `Professor duplicado no horário ${slotKey(entry.day, entry.periodId)}` });
        conflictingEntryIds.add(other);
        conflictingEntryIds.add(entry.id);
      } else {
        professorSeen.set(entry.professorId, entry.id);
      }

      // Room conflict
      if (roomSeen.has(entry.roomId)) {
        const other = roomSeen.get(entry.roomId)!;
        conflicts.push({ type: 'room', entryIds: [other, entry.id], message: `Sala duplicada no horário ${slotKey(entry.day, entry.periodId)}` });
        conflictingEntryIds.add(other);
        conflictingEntryIds.add(entry.id);
      } else {
        roomSeen.set(entry.roomId, entry.id);
      }

      // Class group conflict
      if (classSeen.has(entry.classGroupId)) {
        const other = classSeen.get(entry.classGroupId)!;
        conflicts.push({ type: 'class', entryIds: [other, entry.id], message: `Turma duplicada no horário ${slotKey(entry.day, entry.periodId)}` });
        conflictingEntryIds.add(other);
        conflictingEntryIds.add(entry.id);
      } else {
        classSeen.set(entry.classGroupId, entry.id);
      }
    }
  }

  return { hasConflicts: conflicts.length > 0, conflicts, conflictingEntryIds };
}

// ─── generateSchedule ─────────────────────────────────────────────────────────

/**
 * Greedy constraint-satisfaction scheduler.
 * Iterates class groups (by semester order) × subjects × candidate time slots
 * and places each session in the first slot that satisfies all hard rules.
 */
export function generateSchedule(
  professors: Professor[],
  rooms: Room[],
  subjects: Subject[],
  classGroups: ClassGroup[],
): GenerationResult {
  const entries: ScheduleEntry[] = [];
  const unscheduled: GenerationResult['unscheduled'] = [];

  const profSlots  = new Map<string, Set<string>>(); // professorId   → Set<slotKey>
  const roomSlots  = new Map<string, Set<string>>(); // roomId        → Set<slotKey>
  const classSlots = new Map<string, Set<string>>(); // classGroupId  → Set<slotKey>

  // All possible slots in week order
  const allSlots = DAYS_OF_WEEK.flatMap(d =>
    TIME_PERIODS.map(p => ({ day: d.key as DayOfWeek, periodId: p.id, key: slotKey(d.key as DayOfWeek, p.id) }))
  );

  // Priority: earlier semesters scheduled first
  const sorted = [...classGroups].sort((a, b) => a.semester - b.semester);

  for (const cg of sorted) {
    for (const subjectId of cg.subjectIds) {
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) continue;

      const needed = subject.sessionsPerWeek;
      let placed = 0;

      const eligible = professors.filter(p => p.subjectIds.includes(subjectId));
      if (eligible.length === 0) {
        unscheduled.push({ classGroupId: cg.id, subjectId, sessionsNeeded: needed, sessionsScheduled: 0, reason: 'Sem professor habilitado para esta disciplina' });
        continue;
      }

      const cgSet = getOrCreate(classSlots, cg.id, () => new Set<string>());

      for (const slot of allSlots) {
        if (placed >= needed) break;
        if (cgSet.has(slot.key)) continue; // turma já ocupada neste slot

        // Find professor available here
        let chosenProf: Professor | null = null;
        for (const prof of eligible) {
          if (!prof.availability[slot.day]?.includes(slot.periodId)) continue;
          const ps = getOrCreate(profSlots, prof.id, () => new Set<string>());
          if (ps.has(slot.key)) continue;
          chosenProf = prof;
          break;
        }
        if (!chosenProf) continue;

        // Find suitable room
        let chosenRoom: Room | null = null;
        for (const room of rooms) {
          if (subject.requiresLab && room.type !== 'laboratory') continue;
          if (room.capacity < cg.studentCount) continue;
          const rs = getOrCreate(roomSlots, room.id, () => new Set<string>());
          if (rs.has(slot.key)) continue;
          chosenRoom = room;
          break;
        }
        if (!chosenRoom) continue;

        // Commit entry
        const entry: ScheduleEntry = {
          id: `${cg.id}-${subjectId}-${placed + 1}-${slot.key}`,
          subjectId,
          professorId: chosenProf.id,
          roomId:      chosenRoom.id,
          classGroupId: cg.id,
          day:      slot.day,
          periodId: slot.periodId,
        };
        entries.push(entry);

        getOrCreate(profSlots,  chosenProf.id, () => new Set<string>()).add(slot.key);
        getOrCreate(roomSlots,  chosenRoom.id, () => new Set<string>()).add(slot.key);
        cgSet.add(slot.key);
        placed++;
      }

      if (placed < needed) {
        unscheduled.push({
          classGroupId: cg.id,
          subjectId,
          sessionsNeeded: needed,
          sessionsScheduled: placed,
          reason: placed === 0
            ? 'Nenhum horário compatível encontrado (professor + sala + disponibilidade)'
            : `Somente ${placed}/${needed} sessões puderam ser alocadas`,
        });
      }
    }
  }

  return { entries, unscheduled, conflictReport: validateSchedule(entries) };
}
