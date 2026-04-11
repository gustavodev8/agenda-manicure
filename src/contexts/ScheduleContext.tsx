import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Professor, Room, Subject, ClassGroup, ScheduleEntry, ConflictReport } from '@/types';
import { mockProfessors, mockRooms, mockSubjects, mockClassGroups } from '@/data/mockData';
import { validateSchedule } from '@/lib/scheduleAlgorithm';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScheduleContextValue {
  professors:  Professor[];
  rooms:       Room[];
  subjects:    Subject[];
  classGroups: ClassGroup[];

  entries:        ScheduleEntry[];
  conflictReport: ConflictReport;

  // Professor CRUD
  addProfessor:    (p: Omit<Professor, 'id'>) => void;
  updateProfessor: (p: Professor) => void;
  deleteProfessor: (id: string) => void;

  // Room CRUD
  addRoom:    (r: Omit<Room, 'id'>) => void;
  updateRoom: (r: Room) => void;
  deleteRoom: (id: string) => void;

  // Subject CRUD
  addSubject:    (s: Omit<Subject, 'id'>) => void;
  updateSubject: (s: Subject) => void;
  deleteSubject: (id: string) => void;

  // ClassGroup CRUD
  addClassGroup:    (cg: Omit<ClassGroup, 'id'>) => void;
  updateClassGroup: (cg: ClassGroup) => void;
  deleteClassGroup: (id: string) => void;

  // Schedule entries
  addEntry:    (e: Omit<ScheduleEntry, 'id'>) => void;
  updateEntry: (e: ScheduleEntry) => void;
  removeEntry: (id: string) => void;
  clearSchedule: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

let _counter = 1000;
function nextId(prefix: string) { return `${prefix}-${++_counter}`; }

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [professors,  setProfessors]  = useState<Professor[]>(mockProfessors);
  const [rooms,       setRooms]       = useState<Room[]>(mockRooms);
  const [subjects,    setSubjects]    = useState<Subject[]>(mockSubjects);
  const [classGroups, setClassGroups] = useState<ClassGroup[]>(mockClassGroups);
  const [entries,     setEntries]     = useState<ScheduleEntry[]>([]);

  // ── Professor ──
  const addProfessor    = useCallback((p: Omit<Professor, 'id'>) =>
    setProfessors(prev => [...prev, { ...p, id: nextId('p') }]), []);
  const updateProfessor = useCallback((p: Professor) =>
    setProfessors(prev => prev.map(x => x.id === p.id ? p : x)), []);
  const deleteProfessor = useCallback((id: string) =>
    setProfessors(prev => prev.filter(x => x.id !== id)), []);

  // ── Room ──
  const addRoom    = useCallback((r: Omit<Room, 'id'>) =>
    setRooms(prev => [...prev, { ...r, id: nextId('r') }]), []);
  const updateRoom = useCallback((r: Room) =>
    setRooms(prev => prev.map(x => x.id === r.id ? r : x)), []);
  const deleteRoom = useCallback((id: string) =>
    setRooms(prev => prev.filter(x => x.id !== id)), []);

  // ── Subject ──
  const addSubject    = useCallback((s: Omit<Subject, 'id'>) =>
    setSubjects(prev => [...prev, { ...s, id: nextId('s') }]), []);
  const updateSubject = useCallback((s: Subject) =>
    setSubjects(prev => prev.map(x => x.id === s.id ? s : x)), []);
  const deleteSubject = useCallback((id: string) =>
    setSubjects(prev => prev.filter(x => x.id !== id)), []);

  // ── ClassGroup ──
  const addClassGroup    = useCallback((cg: Omit<ClassGroup, 'id'>) =>
    setClassGroups(prev => [...prev, { ...cg, id: nextId('cg') }]), []);
  const updateClassGroup = useCallback((cg: ClassGroup) =>
    setClassGroups(prev => prev.map(x => x.id === cg.id ? cg : x)), []);
  const deleteClassGroup = useCallback((id: string) =>
    setClassGroups(prev => prev.filter(x => x.id !== id)), []);

  // ── Entries ──
  const addEntry = useCallback((e: Omit<ScheduleEntry, 'id'>) =>
    setEntries(prev => [...prev, { ...e, id: nextId('e') }]), []);
  const updateEntry = useCallback((e: ScheduleEntry) =>
    setEntries(prev => prev.map(x => x.id === e.id ? e : x)), []);
  const removeEntry = useCallback((id: string) =>
    setEntries(prev => prev.filter(x => x.id !== id)), []);
  const clearSchedule = useCallback(() => setEntries([]), []);

  const conflictReport = useMemo(() => validateSchedule(entries), [entries]);

  const value: ScheduleContextValue = {
    professors, rooms, subjects, classGroups,
    entries, conflictReport,
    addProfessor, updateProfessor, deleteProfessor,
    addRoom, updateRoom, deleteRoom,
    addSubject, updateSubject, deleteSubject,
    addClassGroup, updateClassGroup, deleteClassGroup,
    addEntry, updateEntry, removeEntry, clearSchedule,
  };

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule(): ScheduleContextValue {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used inside <ScheduleProvider>');
  return ctx;
}
