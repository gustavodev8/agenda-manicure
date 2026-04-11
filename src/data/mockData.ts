import type { Professor, Room, Subject, ClassGroup } from '@/types';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#ef4444', '#14b8a6', '#f97316', '#84cc16',
  '#06b6d4', '#a855f7',
];

export const mockSubjects: Subject[] = [
  { id: 's1',  name: 'Cálculo I',                 code: 'MAT101', weeklyHours: 4, sessionsPerWeek: 2, semester: 1, requiresLab: false, color: COLORS[0]  },
  { id: 's2',  name: 'Álgebra Linear',             code: 'MAT102', weeklyHours: 4, sessionsPerWeek: 2, semester: 1, requiresLab: false, color: COLORS[1]  },
  { id: 's3',  name: 'Programação I',              code: 'CC101',  weeklyHours: 4, sessionsPerWeek: 2, semester: 1, requiresLab: true,  color: COLORS[2]  },
  { id: 's4',  name: 'Lógica de Programação',      code: 'CC102',  weeklyHours: 2, sessionsPerWeek: 1, semester: 1, requiresLab: false, color: COLORS[3]  },
  { id: 's5',  name: 'Banco de Dados I',           code: 'CC201',  weeklyHours: 4, sessionsPerWeek: 2, semester: 2, requiresLab: true,  color: COLORS[4]  },
  { id: 's6',  name: 'Estruturas de Dados',        code: 'CC202',  weeklyHours: 4, sessionsPerWeek: 2, semester: 2, requiresLab: false, color: COLORS[5]  },
  { id: 's7',  name: 'Redes de Computadores',      code: 'CC301',  weeklyHours: 4, sessionsPerWeek: 2, semester: 3, requiresLab: true,  color: COLORS[6]  },
  { id: 's8',  name: 'Engenharia de Software',     code: 'CC302',  weeklyHours: 4, sessionsPerWeek: 2, semester: 3, requiresLab: false, color: COLORS[7]  },
  { id: 's9',  name: 'Inteligência Artificial',    code: 'CC401',  weeklyHours: 4, sessionsPerWeek: 2, semester: 4, requiresLab: true,  color: COLORS[8]  },
  { id: 's10', name: 'Programação Web',            code: 'CC402',  weeklyHours: 4, sessionsPerWeek: 2, semester: 4, requiresLab: true,  color: COLORS[9]  },
  { id: 's11', name: 'Sistemas Operacionais',      code: 'CC303',  weeklyHours: 4, sessionsPerWeek: 2, semester: 3, requiresLab: false, color: COLORS[10] },
  { id: 's12', name: 'Compiladores',               code: 'CC403',  weeklyHours: 4, sessionsPerWeek: 2, semester: 4, requiresLab: false, color: COLORS[11] },
];

export const mockProfessors: Professor[] = [
  {
    id: 'p1',
    name: 'Dr. Ana Rodrigues',
    email: 'ana.rodrigues@univ.edu.br',
    department: 'Matemática',
    subjectIds: ['s1', 's2'],
    availability: {
      monday:    ['p1', 'p2', 'p3'],
      tuesday:   ['p1', 'p2', 'p4', 'p5'],
      wednesday: ['p2', 'p3'],
      thursday:  ['p1', 'p2', 'p3', 'p4'],
      friday:    ['p2', 'p3', 'p4'],
    },
  },
  {
    id: 'p2',
    name: 'Prof. Carlos Lima',
    email: 'carlos.lima@univ.edu.br',
    department: 'Computação',
    subjectIds: ['s3', 's4'],
    availability: {
      monday:    ['p2', 'p3', 'p4', 'p5'],
      tuesday:   ['p2', 'p3', 'p4'],
      wednesday: ['p3', 'p4', 'p5', 'p6'],
      thursday:  ['p2', 'p3'],
      friday:    ['p3', 'p4', 'p5'],
    },
  },
  {
    id: 'p3',
    name: 'Profa. Mariana Costa',
    email: 'mariana.costa@univ.edu.br',
    department: 'Computação',
    subjectIds: ['s5', 's6'],
    availability: {
      monday:    ['p1', 'p2', 'p5', 'p6'],
      tuesday:   ['p1', 'p4', 'p5', 'p6'],
      wednesday: ['p1', 'p2', 'p5'],
      thursday:  ['p4', 'p5', 'p6'],
      friday:    ['p1', 'p2', 'p5', 'p6'],
    },
  },
  {
    id: 'p4',
    name: 'Dr. Roberto Santos',
    email: 'roberto.santos@univ.edu.br',
    department: 'Redes',
    subjectIds: ['s7', 's8', 's11'],
    availability: {
      monday:    ['p3', 'p4', 'p7', 'p8'],
      tuesday:   ['p3', 'p4', 'p7', 'p8'],
      wednesday: ['p3', 'p4'],
      thursday:  ['p3', 'p4', 'p7', 'p8'],
      friday:    ['p3', 'p4', 'p7', 'p8'],
    },
  },
  {
    id: 'p5',
    name: 'Profa. Júlia Fernandes',
    email: 'julia.fernandes@univ.edu.br',
    department: 'Computação',
    subjectIds: ['s9', 's10', 's12'],
    availability: {
      monday:    ['p2', 'p3', 'p4', 'p5'],
      tuesday:   ['p2', 'p3', 'p4', 'p5'],
      wednesday: ['p2', 'p3', 'p4', 'p5'],
      thursday:  ['p2', 'p3', 'p4', 'p5'],
      friday:    ['p2', 'p3', 'p4', 'p5'],
    },
  },
];

export const mockRooms: Room[] = [
  { id: 'r1', name: 'Sala 101',     building: 'Bloco A', capacity: 40, type: 'theoretical' },
  { id: 'r2', name: 'Sala 102',     building: 'Bloco A', capacity: 40, type: 'theoretical' },
  { id: 'r3', name: 'Sala 103',     building: 'Bloco A', capacity: 30, type: 'theoretical' },
  { id: 'r4', name: 'Sala 201',     building: 'Bloco B', capacity: 50, type: 'theoretical' },
  { id: 'r5', name: 'Sala 202',     building: 'Bloco B', capacity: 50, type: 'theoretical' },
  { id: 'r6', name: 'Lab. Inf. 1',  building: 'Bloco C', capacity: 30, type: 'laboratory'  },
  { id: 'r7', name: 'Lab. Inf. 2',  building: 'Bloco C', capacity: 30, type: 'laboratory'  },
  { id: 'r8', name: 'Lab. Redes',   building: 'Bloco C', capacity: 20, type: 'laboratory'  },
];

export const mockClassGroups: ClassGroup[] = [
  {
    id: 'cg1',
    name: 'ADS-1A',
    course: 'Análise e Desenvolvimento de Sistemas',
    semester: 1,
    studentCount: 35,
    subjectIds: ['s1', 's2', 's3', 's4'],
  },
  {
    id: 'cg2',
    name: 'ADS-1B',
    course: 'Análise e Desenvolvimento de Sistemas',
    semester: 1,
    studentCount: 38,
    subjectIds: ['s1', 's2', 's3', 's4'],
  },
  {
    id: 'cg3',
    name: 'ADS-2A',
    course: 'Análise e Desenvolvimento de Sistemas',
    semester: 2,
    studentCount: 32,
    subjectIds: ['s5', 's6'],
  },
  {
    id: 'cg4',
    name: 'CC-3A',
    course: 'Ciência da Computação',
    semester: 3,
    studentCount: 28,
    subjectIds: ['s7', 's8', 's11'],
  },
  {
    id: 'cg5',
    name: 'CC-4A',
    course: 'Ciência da Computação',
    semester: 4,
    studentCount: 25,
    subjectIds: ['s9', 's10', 's12'],
  },
];
