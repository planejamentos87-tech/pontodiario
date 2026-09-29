/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScheduleSlot } from './types';

export const INITIAL_SLOTS: ScheduleSlot[] = [
  // ==========================================
  // SEGUNDA - MATUTINO
  // ==========================================
  {
    id: 'seg-m1-2int',
    day: 'Segunda',
    turno: 'Matutino',
    time: '07:00 - 07:50',
    turma: '2º INT',
    materia: 'PORTUGUÊS',
    isTeacher: false,
    color: 'bg-indigo-100 text-indigo-900 border-indigo-200'
  },
  {
    id: 'seg-m1-3int',
    day: 'Segunda',
    turno: 'Matutino',
    time: '07:00 - 07:50',
    turma: '3º INT',
    materia: 'REDE COMPU',
    isTeacher: false,
    color: 'bg-emerald-800 text-emerald-100 border-emerald-900'
  },
  {
    id: 'seg-m2-2int',
    day: 'Segunda',
    turno: 'Matutino',
    time: '07:50 - 08:40',
    turma: '2º INT',
    materia: 'PORTUGUÊS',
    isTeacher: false,
    color: 'bg-indigo-100 text-indigo-900 border-indigo-200'
  },
  {
    id: 'seg-m2-3int',
    day: 'Segunda',
    turno: 'Matutino',
    time: '07:50 - 08:40',
    turma: '3º INT',
    materia: 'GEOGRAFIA',
    isTeacher: false,
    color: 'bg-amber-100 text-amber-900 border-amber-200'
  },
  {
    id: 'seg-m3-2int',
    day: 'Segunda',
    turno: 'Matutino',
    time: '08:40 - 09:30',
    turma: '2º INT',
    materia: 'HISTÓRIA',
    isTeacher: false,
    color: 'bg-lime-400 text-lime-955 border-lime-500'
  },
  {
    id: 'seg-m3-3int',
    day: 'Segunda',
    turno: 'Matutino',
    time: '08:40 - 09:30',
    turma: '3º INT',
    materia: 'REDE COMPU',
    isTeacher: false,
    color: 'bg-emerald-800 text-emerald-100 border-emerald-900'
  },
  {
    id: 'seg-m4-2int',
    day: 'Segunda',
    turno: 'Matutino',
    time: '09:50 - 10:40',
    turma: '2º INT',
    materia: 'LÓG. PROGRAM.',
    isTeacher: false,
    color: 'bg-emerald-950 text-emerald-100 border-emerald-900'
  },
  {
    id: 'seg-m4-3int',
    day: 'Segunda',
    turno: 'Matutino',
    time: '09:50 - 10:40',
    turma: '3º INT',
    materia: 'INGLÊS',
    isTeacher: false,
    color: 'bg-cyan-900 text-cyan-100 border-cyan-950'
  },
  {
    id: 'seg-m5-2int',
    day: 'Segunda',
    turno: 'Matutino',
    time: '10:40 - 11:30',
    turma: '2º INT',
    materia: 'POO JAVA',
    isTeacher: true,
    color: 'bg-purple-700 text-white border-purple-800 shadow-purple-200 shadow-sm'
  },
  {
    id: 'seg-m5-3int',
    day: 'Segunda',
    turno: 'Matutino',
    time: '10:40 - 11:30',
    turma: '3º INT',
    materia: 'PORTUGUÊS',
    isTeacher: false,
    color: 'bg-indigo-100 text-indigo-900 border-indigo-200'
  },

  // ==========================================
  // TERÇA - MATUTINO
  // ==========================================
  {
    id: 'ter-m1-2int',
    day: 'Terça',
    turno: 'Matutino',
    time: '07:00 - 07:50',
    turma: '2º INT',
    materia: 'FISICA',
    isTeacher: false,
    color: 'bg-rose-500 text-white border-rose-600'
  },
  {
    id: 'ter-m1-3int',
    day: 'Terça',
    turno: 'Matutino',
    time: '07:00 - 07:50',
    turma: '3º INT',
    materia: 'HISTÓRIA',
    isTeacher: false,
    color: 'bg-blue-900 text-blue-100 border-blue-950'
  },
  {
    id: 'ter-m2-2int',
    day: 'Terça',
    turno: 'Matutino',
    time: '07:50 - 08:40',
    turma: '2º INT',
    materia: 'GEOGRAFIA',
    isTeacher: false,
    color: 'bg-amber-100 text-amber-900 border-amber-200'
  },
  {
    id: 'ter-m2-3int',
    day: 'Terça',
    turno: 'Matutino',
    time: '07:50 - 08:40',
    turma: '3º INT',
    materia: 'PORTUGUÊS',
    isTeacher: false,
    color: 'bg-indigo-100 text-indigo-900 border-indigo-200'
  },
  {
    id: 'ter-m3-2int',
    day: 'Terça',
    turno: 'Matutino',
    time: '08:40 - 09:30',
    turma: '2º INT',
    materia: 'MATEMÁTICA',
    isTeacher: false,
    color: 'bg-zinc-800 text-zinc-100 border-zinc-900'
  },
  {
    id: 'ter-m3-3int',
    day: 'Terça',
    turno: 'Matutino',
    time: '08:40 - 09:30',
    turma: '3º INT',
    materia: 'FISICA',
    isTeacher: false,
    color: 'bg-rose-500 text-white border-rose-600'
  },
  {
    id: 'ter-m4-2int',
    day: 'Terça',
    turno: 'Matutino',
    time: '09:50 - 10:40',
    turma: '2º INT',
    materia: 'BIOLOGIA',
    isTeacher: false,
    color: 'bg-indigo-200 text-indigo-900 border-indigo-300'
  },
  {
    id: 'ter-m4-3int',
    day: 'Terça',
    turno: 'Matutino',
    time: '09:50 - 10:40',
    turma: '3º INT',
    materia: 'PORTUGUÊS',
    isTeacher: false,
    color: 'bg-indigo-100 text-indigo-900 border-indigo-200'
  },
  {
    id: 'ter-m5-2int',
    day: 'Terça',
    turno: 'Matutino',
    time: '10:40 - 11:30',
    turma: '2º INT',
    materia: 'PORTUGUÊS',
    isTeacher: false,
    color: 'bg-indigo-100 text-indigo-900 border-indigo-200'
  },
  {
    id: 'ter-m5-3int',
    day: 'Terça',
    turno: 'Matutino',
    time: '10:40 - 11:30',
    turma: '3º INT',
    materia: 'MATEMÁTICA',
    isTeacher: false,
    color: 'bg-zinc-800 text-zinc-100 border-zinc-900'
  },

  // ==========================================
  // QUARTA - MATUTINO
  // ==========================================
  {
    id: 'qua-m1-2int',
    day: 'Quarta',
    turno: 'Matutino',
    time: '07:00 - 07:50',
    turma: '2º INT',
    materia: 'PROJ VIDA',
    isTeacher: false,
    color: 'bg-cyan-900 text-cyan-100 border-cyan-950'
  },
  {
    id: 'qua-m1-3int',
    day: 'Quarta',
    turno: 'Matutino',
    time: '07:00 - 07:50',
    turma: '3º INT',
    materia: 'MATEMÁTICA',
    isTeacher: false,
    color: 'bg-zinc-800 text-zinc-100 border-zinc-900'
  },
  {
    id: 'qua-m2-2int',
    day: 'Quarta',
    turno: 'Matutino',
    time: '07:50 - 08:40',
    turma: '2º INT',
    materia: 'MATEMÁTICA',
    isTeacher: false,
    color: 'bg-zinc-800 text-zinc-100 border-zinc-900'
  },
  {
    id: 'qua-m2-3int',
    day: 'Quarta',
    turno: 'Matutino',
    time: '07:50 - 08:40',
    turma: '3º INT',
    materia: 'PORTUGUÊS',
    isTeacher: false,
    color: 'bg-indigo-100 text-indigo-900 border-indigo-200'
  },
  {
    id: 'qua-m3-2int',
    day: 'Quarta',
    turno: 'Matutino',
    time: '08:40 - 09:30',
    turma: '2º INT',
    materia: 'PORTUGUÊS',
    isTeacher: false,
    color: 'bg-indigo-100 text-indigo-900 border-indigo-200'
  },
  {
    id: 'qua-m3-3int',
    day: 'Quarta',
    turno: 'Matutino',
    time: '08:40 - 09:30',
    turma: '3º INT',
    materia: 'BIOLOGIA',
    isTeacher: false,
    color: 'bg-red-700 text-white border-red-800'
  },
  {
    id: 'qua-m4-2int',
    day: 'Quarta',
    turno: 'Matutino',
    time: '09:50 - 10:40',
    turma: '2º INT',
    materia: 'FISICA',
    isTeacher: false,
    color: 'bg-rose-500 text-white border-rose-600'
  },
  {
    id: 'qua-m4-3int',
    day: 'Quarta',
    turno: 'Matutino',
    time: '09:50 - 10:40',
    turma: '3º INT',
    materia: 'GEOGRAFIA',
    isTeacher: false,
    color: 'bg-amber-100 text-amber-900 border-amber-200'
  },
  {
    id: 'qua-m5-2int',
    day: 'Quarta',
    turno: 'Matutino',
    time: '10:40 - 11:30',
    turma: '2º INT',
    materia: 'ED. FÍSICA',
    isTeacher: false,
    color: 'bg-red-600 text-white border-red-700'
  },
  {
    id: 'qua-m5-3int',
    day: 'Quarta',
    turno: 'Matutino',
    time: '10:40 - 11:30',
    turma: '3º INT',
    materia: 'MATEMÁTICA',
    isTeacher: false,
    color: 'bg-zinc-800 text-zinc-100 border-zinc-900'
  },

  // ==========================================
  // QUINTA - MATUTINO
  // ==========================================
  {
    id: 'qui-m1-2int',
    day: 'Quinta',
    turno: 'Matutino',
    time: '07:00 - 07:50',
    turma: '2º INT',
    materia: 'SOCIOLOGIA',
    isTeacher: false,
    color: 'bg-orange-950 text-orange-100 border-orange-900'
  },
  {
    id: 'qui-m1-3int',
    day: 'Quinta',
    turno: 'Matutino',
    time: '07:00 - 07:50',
    turma: '3º INT',
    materia: 'HADWARE',
    isTeacher: false,
    color: 'bg-emerald-800 text-emerald-100 border-emerald-900'
  },
  {
    id: 'qui-m2-2int',
    day: 'Quinta',
    turno: 'Matutino',
    time: '07:50 - 08:40',
    turma: '2º INT',
    materia: 'QUIMICA',
    isTeacher: false,
    color: 'bg-yellow-750 text-white border-yellow-800'
  },
  {
    id: 'qui-m2-3int',
    day: 'Quinta',
    turno: 'Matutino',
    time: '07:50 - 08:40',
    turma: '3º INT',
    materia: 'FILOSOFIA',
    isTeacher: false,
    color: 'bg-amber-400 text-amber-955 border-amber-500'
  },
  {
    id: 'qui-m3-2int',
    day: 'Quinta',
    turno: 'Matutino',
    time: '08:40 - 09:30',
    turma: '2º INT',
    materia: 'PORTUGUÊS',
    isTeacher: false,
    color: 'bg-indigo-100 text-indigo-900 border-indigo-200'
  },
  {
    id: 'qui-m3-3int',
    day: 'Quinta',
    turno: 'Matutino',
    time: '08:40 - 09:30',
    turma: '3º INT',
    materia: 'MATEMÁTICA',
    isTeacher: false,
    color: 'bg-zinc-800 text-zinc-100 border-zinc-900'
  },
  {
    id: 'qui-m4-2int',
    day: 'Quinta',
    turno: 'Matutino',
    time: '09:50 - 10:40',
    turma: '2º INT',
    materia: 'FILOSOFIA',
    isTeacher: false,
    color: 'bg-amber-400 text-amber-955 border-amber-500'
  },
  {
    id: 'qui-m4-3int',
    day: 'Quinta',
    turno: 'Matutino',
    time: '09:50 - 10:40',
    turma: '3º INT',
    materia: 'SOCIOLOGIA',
    isTeacher: false,
    color: 'bg-orange-950 text-orange-100 border-orange-900'
  },
  {
    id: 'qui-m5-2int',
    day: 'Quinta',
    turno: 'Matutino',
    time: '10:40 - 11:30',
    turma: '2º INT',
    materia: 'QUIMICA',
    isTeacher: false,
    color: 'bg-yellow-750 text-white border-yellow-800'
  },
  {
    id: 'qui-m5-3int',
    day: 'Quinta',
    turno: 'Matutino',
    time: '10:40 - 11:30',
    turma: '3º INT',
    materia: 'PORTUGUÊS',
    isTeacher: false,
    color: 'bg-indigo-100 text-indigo-900 border-indigo-200'
  },

  // ==========================================
  // SEXTA - MATUTINO
  // ==========================================
  {
    id: 'sex-m1-2int',
    day: 'Sexta',
    turno: 'Matutino',
    time: '07:00 - 07:50',
    turma: '2º INT',
    materia: 'MATEMÁTICA',
    isTeacher: false,
    color: 'bg-zinc-800 text-zinc-100 border-zinc-900'
  },
  {
    id: 'sex-m1-3int',
    day: 'Sexta',
    turno: 'Matutino',
    time: '07:00 - 07:50',
    turma: '3º INT',
    materia: 'REDE COMPU',
    isTeacher: false,
    color: 'bg-emerald-800 text-emerald-100 border-emerald-900'
  },
  {
    id: 'sex-m2-2int',
    day: 'Sexta',
    turno: 'Matutino',
    time: '07:50 - 08:40',
    turma: '2º INT',
    materia: 'HISTÓRIA',
    isTeacher: false,
    color: 'bg-lime-400 text-lime-955 border-lime-500'
  },
  {
    id: 'sex-m2-3int',
    day: 'Sexta',
    turno: 'Matutino',
    time: '07:50 - 08:40',
    turma: '3º INT',
    materia: 'HADWARE',
    isTeacher: false,
    color: 'bg-emerald-800 text-emerald-100 border-emerald-900'
  },
  {
    id: 'sex-m3-2int',
    day: 'Sexta',
    turno: 'Matutino',
    time: '08:40 - 09:30',
    turma: '2º INT',
    materia: 'ROBÓTICA',
    isTeacher: false,
    color: 'bg-amber-400 text-amber-955 border-amber-500'
  },
  {
    id: 'sex-m3-3int',
    day: 'Sexta',
    turno: 'Matutino',
    time: '08:40 - 09:30',
    turma: '3º INT',
    materia: 'HISTÓRIA',
    isTeacher: false,
    color: 'bg-blue-900 text-blue-100 border-blue-950'
  },
  {
    id: 'sex-m4-2int',
    day: 'Sexta',
    turno: 'Matutino',
    time: '09:50 - 10:40',
    turma: '2º INT',
    materia: 'SIST. OPERAC',
    isTeacher: true,
    color: 'bg-purple-700 text-white border-purple-800 shadow-purple-200 shadow-sm'
  },
  {
    id: 'sex-m4-3int',
    day: 'Sexta',
    turno: 'Matutino',
    time: '09:50 - 10:40',
    turma: '3º INT',
    materia: 'QUIMICA',
    isTeacher: false,
    color: 'bg-yellow-750 text-white border-yellow-800'
  },
  {
    id: 'sex-m5-2int',
    day: 'Sexta',
    turno: 'Matutino',
    time: '10:40 - 11:30',
    turma: '2º INT',
    materia: 'INGLÊS',
    isTeacher: false,
    color: 'bg-cyan-900 text-cyan-100 border-cyan-950'
  },
  {
    id: 'sex-m5-3int',
    day: 'Sexta',
    turno: 'Matutino',
    time: '10:40 - 11:30',
    turma: '3º INT',
    materia: 'SOFTWARE',
    isTeacher: true,
    color: 'bg-purple-700 text-white border-purple-800 shadow-purple-200 shadow-sm'
  },

  // ==========================================
  // SEGUNDA - VESPERTINO
  // ==========================================
  {
    id: 'seg-v1-2int',
    day: 'Segunda',
    turno: 'Vespertino',
    time: '12:30 - 13:20',
    turma: '2º INT',
    materia: 'ASTRONOMIA',
    isTeacher: false,
    color: 'bg-red-750 text-white border-red-800'
  },
  {
    id: 'seg-v1-3int',
    day: 'Segunda',
    turno: 'Vespertino',
    time: '12:30 - 13:20',
    turma: '3º INT',
    materia: 'WEB II',
    isTeacher: true,
    color: 'bg-purple-700 text-white border-purple-800 shadow-purple-200 shadow-sm'
  },
  {
    id: 'seg-v2-2int',
    day: 'Segunda',
    turno: 'Vespertino',
    time: '13:20 - 14:10',
    turma: '2º INT',
    materia: 'HTML/CSS',
    isTeacher: true,
    color: 'bg-purple-700 text-white border-purple-800 shadow-purple-200 shadow-sm'
  },
  {
    id: 'seg-v2-3int',
    day: 'Segunda',
    turno: 'Vespertino',
    time: '13:20 - 14:10',
    turma: '3º INT',
    materia: 'EST. ORIENT',
    isTeacher: false,
    color: 'bg-amber-450 text-amber-955 border-amber-500'
  },
  {
    id: 'seg-v3-2int',
    day: 'Segunda',
    turno: 'Vespertino',
    time: '14:10 - 15:00',
    turma: '2º INT',
    materia: 'GEOGRAFIA',
    isTeacher: false,
    color: 'bg-amber-100 text-amber-900 border-amber-200'
  },
  {
    id: 'seg-v3-3int',
    day: 'Segunda',
    turno: 'Vespertino',
    time: '14:10 - 15:00',
    turma: '3º INT',
    materia: 'PROJ VIDA',
    isTeacher: false,
    color: 'bg-cyan-900 text-cyan-100 border-cyan-950'
  },
  {
    id: 'seg-v4-2int',
    day: 'Segunda',
    turno: 'Vespertino',
    time: '15:00 - 15:50',
    turma: '2º INT',
    materia: 'ARQ. COMPUT',
    isTeacher: true,
    color: 'bg-purple-700 text-white border-purple-800 shadow-purple-200 shadow-sm'
  },
  {
    id: 'seg-v4-3int',
    day: 'Segunda',
    turno: 'Vespertino',
    time: '15:00 - 15:50',
    turma: '3º INT',
    materia: 'BANCOS DADOS',
    isTeacher: false, // In image 2, this is orange: not the teacher's purple subject
    color: 'bg-orange-400 text-white border-orange-500'
  },

  // ==========================================
  // TERÇA - VESPERTINO
  // ==========================================
  {
    id: 'ter-v1-2int',
    day: 'Terça',
    turno: 'Vespertino',
    time: '12:30 - 13:20',
    turma: '2º INT',
    materia: 'MATEMÁTICA',
    isTeacher: false,
    color: 'bg-zinc-800 text-zinc-100 border-zinc-900'
  },
  {
    id: 'ter-v1-3int',
    day: 'Terça',
    turno: 'Vespertino',
    time: '12:30 - 13:20',
    turma: '3º INT',
    materia: 'ASTRONOMIA',
    isTeacher: false,
    color: 'bg-red-750 text-white border-red-800'
  },
  {
    id: 'ter-v2-2int',
    day: 'Terça',
    turno: 'Vespertino',
    time: '13:20 - 14:10',
    turma: '2º INT',
    materia: 'ASTRONOMIA',
    isTeacher: false,
    color: 'bg-red-750 text-white border-red-800'
  },
  {
    id: 'ter-v2-3int',
    day: 'Terça',
    turno: 'Vespertino',
    time: '13:20 - 14:10',
    turma: '3º INT',
    materia: 'EST. ORIENT',
    isTeacher: false,
    color: 'bg-amber-450 text-amber-955 border-amber-500'
  },
  {
    id: 'ter-v3-2int',
    day: 'Terça',
    turno: 'Vespertino',
    time: '14:10 - 15:00',
    turma: '2º INT',
    materia: 'PRÁT. EXPERIME',
    isTeacher: false,
    color: 'bg-indigo-200 text-indigo-900 border-indigo-300'
  },
  {
    id: 'ter-v3-3int',
    day: 'Terça',
    turno: 'Vespertino',
    time: '14:10 - 15:00',
    turma: '3º INT',
    materia: 'DESING',
    isTeacher: false,
    color: 'bg-amber-400 text-amber-955 border-amber-50 border-amber-500'
  },
  {
    id: 'ter-v4-2int',
    day: 'Terça',
    turno: 'Vespertino',
    time: '15:00 - 15:50',
    turma: '2º INT',
    materia: 'EST. ORIENT',
    isTeacher: false,
    color: 'bg-amber-450 text-amber-955 border-amber-500'
  },
  {
    id: 'ter-v4-3int',
    day: 'Terça',
    turno: 'Vespertino',
    time: '15:00 - 15:50',
    turma: '3º INT',
    materia: 'PRAT. PROFISSI',
    isTeacher: false,
    color: 'bg-blue-600 text-white border-blue-700'
  },

  // ==========================================
  // QUARTA - VESPERTINO
  // ==========================================
  {
    id: 'qua-v1-2int',
    day: 'Quarta',
    turno: 'Vespertino',
    time: '12:30 - 13:20',
    turma: '2º INT',
    materia: 'POO JAVA',
    isTeacher: true,
    color: 'bg-purple-700 text-white border-purple-800 shadow-purple-200 shadow-sm'
  },
  {
    id: 'qua-v1-3int',
    day: 'Quarta',
    turno: 'Vespertino',
    time: '12:30 - 13:20',
    turma: '3º INT',
    materia: 'EST. ORIENT',
    isTeacher: false,
    color: 'bg-amber-450 text-amber-955 border-amber-500'
  },
  {
    id: 'qua-v2-2int',
    day: 'Quarta',
    turno: 'Vespertino',
    time: '13:20 - 14:10',
    turma: '2º INT',
    materia: 'EST. ORIENT',
    isTeacher: false,
    color: 'bg-amber-450 text-amber-955 border-amber-500'
  },
  {
    id: 'qua-v2-3int',
    day: 'Quarta',
    turno: 'Vespertino',
    time: '13:20 - 14:10',
    turma: '3º INT',
    materia: 'SOFTWARE',
    isTeacher: true,
    color: 'bg-purple-700 text-white border-purple-800 shadow-purple-200 shadow-sm'
  },
  {
    id: 'qua-v3-2int',
    day: 'Quarta',
    turno: 'Vespertino',
    time: '14:10 - 15:00',
    turma: '2º INT',
    materia: 'MATEMÁTICA',
    isTeacher: false,
    color: 'bg-zinc-800 text-zinc-100 border-zinc-900'
  },
  {
    id: 'qua-v3-3int',
    day: 'Quarta',
    turno: 'Vespertino',
    time: '14:10 - 15:00',
    turma: '3º INT',
    materia: 'WEB II',
    isTeacher: true,
    color: 'bg-purple-700 text-white border-purple-800 shadow-purple-200 shadow-sm'
  },
  {
    id: 'qua-v4-2int',
    day: 'Quarta',
    turno: 'Vespertino',
    time: '15:00 - 15:50',
    turma: '2º INT',
    materia: 'SIST. OPERA',
    isTeacher: true,
    color: 'bg-purple-700 text-white border-purple-800 shadow-purple-200 shadow-sm'
  },
  {
    id: 'qua-v4-3int',
    day: 'Quarta',
    turno: 'Vespertino',
    time: '15:00 - 15:50',
    turma: '3º INT',
    materia: 'MATEMÁTICA',
    isTeacher: false,
    color: 'bg-zinc-800 text-zinc-100 border-zinc-900'
  },

  // ==========================================
  // QUINTA - VESPERTINO
  // ==========================================
  {
    id: 'qui-v1-2int',
    day: 'Quinta',
    turno: 'Vespertino',
    time: '12:30 - 13:20',
    turma: '2º INT',
    materia: 'ARQ. COMPUT',
    isTeacher: true,
    color: 'bg-purple-700 text-white border-purple-800 shadow-purple-200 shadow-sm'
  },
  {
    id: 'qui-v1-3int',
    day: 'Quinta',
    turno: 'Vespertino',
    time: '12:30 - 13:20',
    turma: '3º INT',
    materia: 'PROJ VIDA',
    isTeacher: false,
    color: 'bg-cyan-900 text-cyan-100 border-cyan-950'
  },
  {
    id: 'qui-v2-2int',
    day: 'Quinta',
    turno: 'Vespertino',
    time: '13:20 - 14:10',
    turma: '2º INT',
    materia: 'ARTE',
    isTeacher: false,
    color: 'bg-yellow-950 text-yellow-105 border-yellow-900'
  },
  {
    id: 'qui-v2-3int',
    day: 'Quinta',
    turno: 'Vespertino',
    time: '13:20 - 14:10',
    turma: '3º INT',
    materia: 'LAB. WEB',
    isTeacher: true,
    color: 'bg-purple-700 text-white border-purple-800 shadow-purple-200 shadow-sm'
  },
  {
    id: 'qui-v3-2int',
    day: 'Quinta',
    turno: 'Vespertino',
    time: '14:10 - 15:00',
    turma: '2º INT',
    materia: 'PRÁT. EXPERIME',
    isTeacher: false,
    color: 'bg-indigo-200 text-indigo-900 border-indigo-300'
  },
  {
    id: 'qui-v3-3int',
    day: 'Quinta',
    turno: 'Vespertino',
    time: '14:10 - 15:00',
    turma: '3º INT',
    materia: 'ED. FÍSICA',
    isTeacher: false,
    color: 'bg-red-650 text-white border-red-700'
  },
  {
    id: 'qui-v4-2int',
    day: 'Quinta',
    turno: 'Vespertino',
    time: '15:00 - 15:50',
    turma: '2º INT',
    materia: 'WEB JAVA',
    isTeacher: true,
    color: 'bg-purple-700 text-white border-purple-800 shadow-purple-200 shadow-sm'
  },
  {
    id: 'qui-v4-3int',
    day: 'Quinta',
    turno: 'Vespertino',
    time: '15:00 - 15:50',
    turma: '3º INT',
    materia: 'ARTE',
    isTeacher: false,
    color: 'bg-yellow-950 text-yellow-105 border-yellow-900'
  },

  // ==========================================
  // SEXTA - VESPERTINO
  // ==========================================
  {
    id: 'sex-v1-2int',
    day: 'Sexta',
    turno: 'Vespertino',
    time: '12:30 - 13:20',
    turma: '2º INT',
    materia: 'GEST. TEMPO',
    isTeacher: false,
    color: 'bg-amber-450 text-amber-955 border-amber-500'
  },
  {
    id: 'sex-v1-3int',
    day: 'Sexta',
    turno: 'Vespertino',
    time: '12:30 - 13:20',
    turma: '3º INT',
    materia: 'PRAT. PROFISSI',
    isTeacher: false,
    color: 'bg-blue-600 text-white border-blue-700'
  },
  {
    id: 'sex-v2-2int',
    day: 'Sexta',
    turno: 'Vespertino',
    time: '13:20 - 14:10',
    turma: '2º INT',
    materia: 'WEB JAVA',
    isTeacher: true,
    color: 'bg-purple-700 text-white border-purple-800 shadow-purple-200 shadow-sm'
  },
  {
    id: 'sex-v2-3int',
    day: 'Sexta',
    turno: 'Vespertino',
    time: '13:20 - 14:10',
    turma: '3º INT',
    materia: 'PRAT. PROFISSI',
    isTeacher: false,
    color: 'bg-blue-600 text-white border-blue-700'
  },
  {
    id: 'sex-v3-2int',
    day: 'Sexta',
    turno: 'Vespertino',
    time: '14:10 - 15:00',
    turma: '2º INT',
    materia: 'PROJ VIDA',
    isTeacher: false,
    color: 'bg-cyan-900 text-cyan-100 border-cyan-950'
  },
  {
    id: 'sex-v3-3int',
    day: 'Sexta',
    turno: 'Vespertino',
    time: '14:10 - 15:00',
    turma: '3º INT',
    materia: 'LAB. WEB',
    isTeacher: true,
    color: 'bg-purple-700 text-white border-purple-800 shadow-purple-200 shadow-sm'
  },
  {
    id: 'sex-v4-2int',
    day: 'Sexta',
    turno: 'Vespertino',
    time: '15:00 - 15:50',
    turma: '2º INT',
    materia: 'POO JAVA',
    isTeacher: true,
    color: 'bg-purple-700 text-white border-purple-800 shadow-purple-200 shadow-sm'
  },
  {
    id: 'sex-v4-3int',
    day: 'Sexta',
    turno: 'Vespertino',
    time: '15:00 - 15:50',
    turma: '3º INT',
    materia: 'BANCOS DADOS',
    isTeacher: false,
    color: 'bg-orange-400 text-white border-orange-500'
  }
];

export const TEACHER_SUBJECT_INFOS = [
  { name: 'POO JAVA', code: 'POO-JAVA', description: 'Programação Orientada a Objetos com Java', totalAulas: 3 },
  { name: 'SIST. OPERAC', code: 'SO', description: 'Sistemas Operacionais (instalação, gerenciamento e CLI)', totalAulas: 2 },
  { name: 'SOFTWARE', code: 'SW', description: 'Desenvolvimento e Engenharia de Software', totalAulas: 2 },
  { name: 'WEB II', code: 'WEB2', description: 'Desenvolvimento Web Avançado (APIs, Frameworks e Backend)', totalAulas: 2 },
  { name: 'HTML/CSS', code: 'HTML-CSS', description: 'Fundamentos de Desenvolvimento Web e Design Responsivo', totalAulas: 1 },
  { name: 'ARQ. COMPUT', code: 'ARQ', description: 'Arquitetura e Organização de Computadores', totalAulas: 2 },
  { name: 'LAB. WEB', code: 'LAB-WEB', description: 'Laboratório de Práticas de Desenvolvimento Web', totalAulas: 2 },
  { name: 'WEB JAVA', code: 'WEB-JAVA', description: 'Desenvolvimento de Aplicações Web Corporativas com Java (Servlets/Spring Boot)', totalAulas: 2 }
];
