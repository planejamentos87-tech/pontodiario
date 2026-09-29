/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ScheduleSlot, DayOfWeek, TurnoType } from '../types';
import { Sparkles, CalendarRange, Edit3, CheckCircle2 } from 'lucide-react';

interface FullGridProps {
  slots: ScheduleSlot[];
  onSelectSlot: (slot: ScheduleSlot) => void;
  activeTurno: TurnoType;
  filterTurma: 'Todos' | '2º INT' | '3º INT';
  searchQuery: string;
}

const DAYS: DayOfWeek[] = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

const TIME_SLOTS_MATUTINO = [
  '07:00 - 07:50',
  '07:50 - 08:40',
  '08:40 - 09:30',
  '09:50 - 10:40',
  '10:40 - 11:30'
];

const TIME_SLOTS_VESPERTINO = [
  '12:30 - 13:20',
  '13:20 - 14:10',
  '14:10 - 15:00',
  '15:00 - 15:50'
];

export default function FullGrid({
  slots,
  onSelectSlot,
  activeTurno,
  filterTurma,
  searchQuery
}: FullGridProps) {
  const times = activeTurno === 'Matutino' ? TIME_SLOTS_MATUTINO : TIME_SLOTS_VESPERTINO;
  const periodsCount = times.length;

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-purple-900 dark:border-purple-800 rounded-none shadow-[3px_3px_0px_0px_rgba(88,28,135,1)] dark:shadow-none overflow-hidden transition-colors">
      {/* Mobile grid warning helper */}
      <div className="md:hidden bg-purple-50 dark:bg-purple-950/20 border-b-2 border-purple-900 dark:border-purple-800 p-3 flex items-center justify-between font-bold">
        <span className="text-[11px] text-purple-900 dark:text-purple-300 uppercase tracking-widest font-mono flex items-center gap-1.5 animate-pulse">
          <CalendarRange size={13} />
          Deslize para ver o quadro completo de TI!
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] table-fixed border-collapse">
          <thead>
            <tr className="bg-purple-900 dark:bg-purple-955 text-white border-b-2 border-purple-950 dark:border-purple-900">
              <th className="w-24 text-center py-4 text-xs font-black uppercase tracking-widest border-r border-purple-950 dark:border-purple-900/60 font-mono">Dia</th>
              <th className="w-32 text-center py-4 text-xs font-black uppercase tracking-widest border-r border-purple-950 dark:border-purple-900/60 font-mono">Horário</th>
              <th className="text-center py-4 text-xs font-black uppercase tracking-widest border-r border-purple-950 dark:border-purple-900/60 font-mono">2º INT</th>
              <th className="text-center py-4 text-xs font-black uppercase tracking-widest font-mono">3º INT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-900 dark:divide-purple-800 text-sm">
            {DAYS.map((day) => {
              return times.map((time, timeIndex) => {
                // Find slots for this day and time
                const rowSlots = slots.filter(
                  (s) => s.day === day && s.time === time && s.turno === activeTurno
                );

                const slot2Int = rowSlots.find((s) => s.turma === '2º INT');
                const slot3Int = rowSlots.find((s) => s.turma === '3º INT');

                return (
                  <tr key={`${day}-${timeIndex}`} className="hover:bg-purple-50/10 dark:hover:bg-purple-950/10 transition-colors">
                    {/* Render Day Column (Only once per day using rowSpan) */}
                    {timeIndex === 0 && (
                      <td
                        rowSpan={periodsCount}
                        className="align-middle text-center bg-purple-950 dark:bg-slate-950 border-r-2 border-b border-purple-900 dark:border-purple-800 font-serif italic text-white text-base py-4 select-none"
                      >
                        <div className="writing-mode-vertical uppercase tracking-widest text-center py-2 select-none whitespace-nowrap font-bold">
                          {day}
                        </div>
                      </td>
                    )}

                    {/* Time Slot Column */}
                    <td className="align-middle text-center py-3 px-3 font-mono text-xs font-black text-purple-950 dark:text-purple-300 border-r border-purple-900 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/10">
                      {time}
                    </td>

                    {/* 2º INT Slot Column */}
                    <td className="p-1 border-r border-purple-900 dark:border-purple-800 bg-white dark:bg-slate-900">
                      {slot2Int ? (
                        <SlotCell
                          slot={slot2Int}
                          onSelect={onSelectSlot}
                          filterTurma={filterTurma}
                          searchQuery={searchQuery}
                        />
                      ) : (
                        <div className="h-[52px] bg-purple-50/10 dark:bg-purple-950/5 rounded-none border border-dashed border-purple-200 dark:border-purple-900/30" />
                      )}
                    </td>

                    {/* 3º INT Slot Column */}
                    <td className="p-1 bg-white dark:bg-slate-900">
                      {slot3Int ? (
                        <SlotCell
                          slot={slot3Int}
                          onSelect={onSelectSlot}
                          filterTurma={filterTurma}
                          searchQuery={searchQuery}
                        />
                      ) : (
                        <div className="h-[52px] bg-purple-50/10 dark:bg-purple-950/5 rounded-none border border-dashed border-purple-200 dark:border-purple-900/30" />
                      )}
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface SlotCellProps {
  slot: ScheduleSlot;
  onSelect: (slot: ScheduleSlot) => void;
  filterTurma: 'Todos' | '2º INT' | '3º INT';
  searchQuery: string;
}

function SlotCell({ slot, onSelect, filterTurma, searchQuery }: SlotCellProps) {
  // Determine if highlighted by filters and search query
  const queryLower = searchQuery.toLowerCase().trim();
  const matchesSearch =
    queryLower === '' ||
    slot.materia.toLowerCase().includes(queryLower) ||
    slot.turma.toLowerCase().includes(queryLower) ||
    (slot.notes && slot.notes.toLowerCase().includes(queryLower));

  const matchesTurma = filterTurma === 'Todos' || slot.turma === filterTurma;

  const isActive = matchesSearch && matchesTurma;

  // Let's check styling
  const isTeacher = slot.isTeacher;

  // Click handler
  const handleClick = () => {
    onSelect(slot);
  };

  // Base styling for purple teacher boxes or normal high-school ones
  const cellBgClass = isTeacher
    ? 'bg-purple-900 hover:bg-purple-800 text-white border-2 border-purple-950 dark:border-purple-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-none hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px]'
    : slot.color || 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-750';

  return (
    <div
      onClick={handleClick}
      className={`relative h-[56px] rounded-none p-2 flex flex-col justify-between cursor-pointer transition-all ${cellBgClass} ${
        !isActive ? 'opacity-20 hover:opacity-50 blur-[0.5px]' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <span
          className={`font-sans font-black text-[12px] tracking-tight uppercase ${
            isTeacher ? 'text-white' : 'text-purple-950 dark:text-purple-305'
          } truncate pr-1`}
        >
          {slot.materia}
        </span>
        {isTeacher && (
          <div className="flex gap-1 items-center shrink-0">
            {slot.completed ? (
              <CheckCircle2 size={11} className="text-emerald-300 fill-emerald-800" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-none bg-purple-200 rotate-45 animate-pulse"></span>
            )}
            <Sparkles size={10} className="text-purple-200" />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-auto font-mono">
        <span
          className={`text-[8.5px] font-black uppercase rounded-none border px-1 ${
            isTeacher
              ? 'bg-purple-950/80 text-purple-200 border-purple-950 dark:border-purple-900'
              : 'bg-purple-900/10 text-purple-900 dark:text-purple-300 border-purple-200/50 dark:border-purple-800/60'
          }`}
        >
          {slot.turma}
        </span>

        {/* Indicator if custom notes exist on slot */}
        {(slot.notes || slot.aiPlan) && (
          <span
            className={`text-[9px] font-bold flex items-center gap-0.5 uppercase ${
              isTeacher ? 'text-purple-200' : 'text-purple-900'
            }`}
          >
            <Edit3 size={8} />
            Plano
          </span>
        )}
      </div>
    </div>
  );
}
