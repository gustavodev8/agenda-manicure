export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export interface DayMeta {
  key: DayOfWeek;
  label: string;
  short: string;
}

export const DAYS_OF_WEEK: DayMeta[] = [
  { key: 'monday',    label: 'Segunda-feira', short: 'Seg' },
  { key: 'tuesday',  label: 'Terça-feira',   short: 'Ter' },
  { key: 'wednesday',label: 'Quarta-feira',  short: 'Qua' },
  { key: 'thursday', label: 'Quinta-feira',  short: 'Qui' },
  { key: 'friday',   label: 'Sexta-feira',   short: 'Sex' },
];

export interface TimePeriod {
  id: string;
  start: string;
  end: string;
  label: string;
  shift: 'morning' | 'afternoon' | 'evening';
}

export const TIME_PERIODS: TimePeriod[] = [
  { id: 'p1', start: '07:00', end: '09:00', label: '07:00–09:00', shift: 'morning'   },
  { id: 'p2', start: '09:00', end: '11:00', label: '09:00–11:00', shift: 'morning'   },
  { id: 'p3', start: '11:00', end: '13:00', label: '11:00–13:00', shift: 'morning'   },
  { id: 'p4', start: '13:00', end: '15:00', label: '13:00–15:00', shift: 'afternoon' },
  { id: 'p5', start: '15:00', end: '17:00', label: '15:00–17:00', shift: 'afternoon' },
  { id: 'p6', start: '17:00', end: '19:00', label: '17:00–19:00', shift: 'afternoon' },
  { id: 'p7', start: '19:00', end: '21:00', label: '19:00–21:00', shift: 'evening'   },
  { id: 'p8', start: '21:00', end: '23:00', label: '21:00–23:00', shift: 'evening'   },
];

// ─── Domain entities ──────────────────────────────────────────────────────────

export interface Professor {
  id: string;
  name: string;
  email: string;
  department: string;
  subjectIds: string[];
  /** Which time periods the professor is available on each day */
  availability: Record<DayOfWeek, string[]>;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  type: 'theoretical' | 'laboratory';
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  weeklyHours: number;
  /** Number of 2-hour sessions needed per week */
  sessionsPerWeek: number;
  semester: number;
  requiresLab: boolean;
  color: string;
}

export interface ClassGroup {
  id: string;
  /** e.g. "ADS-1A" */
  name: string;
  course: string;
  semester: number;
  studentCount: number;
  subjectIds: string[];
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export interface ScheduleEntry {
  id: string;
  subjectId: string;
  professorId: string;
  roomId: string;
  classGroupId: string;
  day: DayOfWeek;
  periodId: string;
}

export type ConflictType = 'professor' | 'room' | 'class' | 'availability';

export interface ScheduleConflict {
  type: ConflictType;
  entryIds: string[];
  message: string;
}

export interface ConflictReport {
  hasConflicts: boolean;
  conflicts: ScheduleConflict[];
  conflictingEntryIds: Set<string>;
}

export interface GenerationResult {
  entries: ScheduleEntry[];
  unscheduled: Array<{
    classGroupId: string;
    subjectId: string;
    sessionsNeeded: number;
    sessionsScheduled: number;
    reason: string;
  }>;
  conflictReport: ConflictReport;
}
