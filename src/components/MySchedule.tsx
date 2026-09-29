/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ScheduleSlot, DayOfWeek } from '../types';
import { Calendar, Clock, BookOpen, GraduationCap, FileText, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';

interface MyScheduleProps {
  slots: ScheduleSlot[];
  onSelectSlot: (slot: ScheduleSlot) => void;
  onToggleComplete: (slotId: string, e: React.MouseEvent) => void;
  searchQuery: string;
}

const DAYS_ORDERED: DayOfWeek[] = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

export default function MySchedule({
  slots,
  onSelectSlot,
  onToggleComplete,
  searchQuery
}: MyScheduleProps) {
  // Filter for teacher slots only (representing the purple ones)
  const teacherSlots = slots.filter(s => s.isTeacher);

  // Filter slots with user search query if any
  const filteredTeacherSlots = teacherSlots.filter(s => {
    const query = searchQuery.toLowerCase().trim();
    if (query === '') return true;
    return (
      s.materia.toLowerCase().includes(query) ||
      s.turma.toLowerCase().includes(query) ||
      s.day.toLowerCase().includes(query) ||
      s.turno.toLowerCase().includes(query) ||
      (s.notes && s.notes.toLowerCase().includes(query))
    );
  });

  // Group by Day
  const groupedByDay = DAYS_ORDERED.map(day => {
    const daySlots = filteredTeacherSlots.filter(s => s.day === day);
    // Sort day slots: Matutino slots first, then Vespertino slots, ordered by time.
    const sortedSlots = [...daySlots].sort((a, b) => {
      if (a.turno !== b.turno) {
        return a.turno === 'Matutino' ? -1 : 1;
      }
      return a.time.localeCompare(b.time);
    });

    return {
      day,
      slots: sortedSlots
    };
  }).filter(group => group.slots.length > 0);

  return (
    <div className="space-y-6">
      {groupedByDay.length === 0 ? (
        <div className="bg-purple-50/40 dark:bg-purple-950/10 border-2 border-purple-900 dark:border-purple-800 rounded-none p-8 text-center max-w-md mx-auto shadow-[3px_3px_0px_0px_rgba(88,28,135,1)] dark:shadow-none font-sans">
          <BookOpen className="mx-auto text-purple-900 dark:text-purple-300 mb-3" size={28} />
          <h4 className="text-sm font-black uppercase tracking-widest text-purple-950 dark:text-purple-300">Nenhuma aula encontrada</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-serif italic">
            {searchQuery 
              ? 'Tente remover os filtros de busca para visualizar seu cronograma completo.' 
              : 'Nenhum horário roxo configurado. Edite a tabela completa para marcar suas disciplinas.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groupedByDay.map(group => (
            <div key={group.day} className="bg-white dark:bg-slate-900 border-2 border-purple-900 dark:border-purple-800 rounded-none shadow-[3px_3px_0px_0px_rgba(88,28,135,1)] dark:shadow-none overflow-hidden transition-colors duration-200">
              {/* Day Header Banner - Editorial */}
              <div className="bg-purple-900 dark:bg-purple-955 px-5 py-3.5 flex justify-between items-center text-white select-none border-b border-purple-950 dark:border-purple-900">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-purple-350 dark:text-purple-300" />
                  <h3 className="text-sm font-serif italic font-bold tracking-wide">{group.day}-Feira</h3>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest font-mono bg-purple-950 dark:bg-purple-900 text-purple-200 px-2.5 py-1 rounded-none font-bold">
                  {group.slots.length} {group.slots.length === 1 ? 'Aula' : 'Aulas'}
                </span>
              </div>

              {/* Class list for this day */}
              <div className="divide-y divide-purple-100 dark:divide-purple-950">
                {group.slots.map(slot => (
                  <div
                    key={slot.id}
                    onClick={() => onSelectSlot(slot)}
                    className={`block p-4 hover:bg-purple-50/20 dark:hover:bg-purple-950/20 transition-all cursor-pointer relative group ${
                      slot.completed ? 'bg-emerald-50/25 dark:bg-emerald-950/10' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[9px] font-black font-mono px-2 py-0.5 rounded-none border uppercase ${
                            slot.turno === 'Matutino' 
                              ? 'bg-sky-50 dark:bg-sky-950/30 text-sky-850 dark:text-sky-300 border-sky-200 dark:border-sky-900' 
                              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-850 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                          }`}>
                            {slot.turno}
                          </span>
                          <span className="text-[9px] font-mono font-black text-purple-950 dark:text-purple-300 bg-purple-50/80 dark:bg-purple-950/30 border border-purple-900/20 dark:border-purple-800/30 px-2 py-0.5 rounded-none">
                            {slot.turma}
                          </span>
                          {slot.completed && (
                            <span className="text-[9px] font-black text-emerald-950 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-900/30 dark:border-emerald-800/30 px-2 py-0.5 rounded-none flex items-center gap-0.5 uppercase tracking-wide">
                              <CheckCircle2 size={10} />
                              Concluída
                            </span>
                          )}
                        </div>

                        {/* Subject name */}
                        <h4 className={`text-base font-black tracking-tight transition-colors ${
                          slot.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-purple-950 dark:text-purple-250 group-hover:text-purple-900 dark:group-hover:text-purple-350'
                        }`}>
                          {slot.materia}
                        </h4>

                        {/* Period & clock times */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-550 dark:text-slate-400 font-mono font-bold">
                          <Clock size={12} className="text-purple-900 dark:text-purple-300" />
                          <span>{slot.time} (50 MIN)</span>
                        </div>

                        {/* Extra descriptors */}
                        {(slot.notes || slot.aiPlan) && (
                          <div className="mt-2 text-xs text-slate-700 dark:text-slate-300 bg-purple-50/30 dark:bg-purple-950/20 p-2.5 rounded-none border-l-2 border-purple-900 dark:border-purple-750 flex items-start gap-1.5 animate-in fade-in duration-200">
                            <FileText size={11} className="text-purple-900 dark:text-purple-350 mt-0.5 shrink-0" />
                            <p className="truncate text-[11px] font-medium">
                              {slot.notes ? slot.notes : 'Plano de Aula Gerado com IA'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right actions */}
                      <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                        {/* Checkbox triggers parent to check off */}
                        <button
                          onClick={(e) => onToggleComplete(slot.id, e)}
                          title={slot.completed ? "Reabrir aula" : "Marcar como ministrada"}
                          className={`p-2 rounded-none border-2 transition-all cursor-pointer ${
                            slot.completed
                              ? 'bg-purple-900 dark:bg-purple-800 border-purple-950 dark:border-purple-900 text-white'
                              : 'bg-white dark:bg-slate-800 border-purple-900 dark:border-purple-800 text-purple-900 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <CheckCircle2 size={15} />
                        </button>
                        <ChevronRight className="text-purple-300 dark:text-purple-700 group-hover:text-purple-900 dark:group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all mt-auto" size={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
