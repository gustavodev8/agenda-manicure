import type {
  ScheduleEntry,
  ConflictReport,
  DayOfWeek,
} from '@/types';

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
    const key = `${e.day}:${e.periodId}`;
    if (!bySlot.has(key)) bySlot.set(key, []);
    bySlot.get(key)!.push(e);
  }

  for (const slotEntries of bySlot.values()) {
    const professorSeen = new Map<string, string>();
    const roomSeen      = new Map<string, string>();
    const classSeen     = new Map<string, string>();

    for (const entry of slotEntries) {
      if (professorSeen.has(entry.professorId)) {
        const other = professorSeen.get(entry.professorId)!;
        conflicts.push({ type: 'professor', entryIds: [other, entry.id], message: `Professor duplicado — ${entry.day} ${entry.periodId}` });
        conflictingEntryIds.add(other);
        conflictingEntryIds.add(entry.id);
      } else {
        professorSeen.set(entry.professorId, entry.id);
      }

      if (roomSeen.has(entry.roomId)) {
        const other = roomSeen.get(entry.roomId)!;
        conflicts.push({ type: 'room', entryIds: [other, entry.id], message: `Sala duplicada — ${entry.day} ${entry.periodId}` });
        conflictingEntryIds.add(other);
        conflictingEntryIds.add(entry.id);
      } else {
        roomSeen.set(entry.roomId, entry.id);
      }

      if (classSeen.has(entry.classGroupId)) {
        const other = classSeen.get(entry.classGroupId)!;
        conflicts.push({ type: 'class', entryIds: [other, entry.id], message: `Turma duplicada — ${entry.day} ${entry.periodId}` });
        conflictingEntryIds.add(other);
        conflictingEntryIds.add(entry.id);
      } else {
        classSeen.set(entry.classGroupId, entry.id);
      }
    }
  }

  return { hasConflicts: conflicts.length > 0, conflicts, conflictingEntryIds };
}

/** Check whether a move/add would cause a conflict before committing it. */
export function wouldConflict(
  entries: ScheduleEntry[],
  candidate: Omit<ScheduleEntry, 'id'> & { id?: string },
): boolean {
  const hypothetical: ScheduleEntry[] = [
    ...entries.filter(e => e.id !== candidate.id),
    { id: candidate.id ?? '__candidate__', ...candidate } as ScheduleEntry,
  ];
  const report = validateSchedule(hypothetical);
  return report.conflictingEntryIds.has(candidate.id ?? '__candidate__');
}
