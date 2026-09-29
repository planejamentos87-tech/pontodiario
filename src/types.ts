/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DayOfWeek = 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta';
export type TurnoType = 'Matutino' | 'Vespertino';
export type TurmaType = '2º INT' | '3º INT';

export interface ScheduleSlot {
  id: string;
  day: DayOfWeek;
  turno: TurnoType;
  time: string;
  turma: TurmaType;
  materia: string;
  isTeacher: boolean; // Indicates if this belongs to the purple disciplines
  color: string; // Theme color representation
  notes?: string; // Teacher planning notes
  aiPlan?: string; // AI Generated Lesson Plan
  completed?: boolean; // To check off this class
  periodicity?: 'diario' | 'quinzenal' | 'trimestral'; // Selected plan duration/format
}

export interface DaySchedule {
  day: DayOfWeek;
  slots: ScheduleSlot[];
}

export interface TeacherSubject {
  name: string;
  code: string;
  description: string;
  totalAulas: number;
}
