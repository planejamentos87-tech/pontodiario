/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ScheduleSlot } from '../types';
import { Clock, BookOpen, GraduationCap, Calendar, CheckSquare } from 'lucide-react';

interface DashboardStatsProps {
  slots: ScheduleSlot[];
  onSelectSlot: (slot: ScheduleSlot) => void;
  activeTurno: 'Matutino' | 'Vespertino';
  setActiveTurno: (turno: 'Matutino' | 'Vespertino') => void;
  currentDay: string;
}

export default function DashboardStats({
  slots,
  onSelectSlot,
  activeTurno,
  setActiveTurno,
  currentDay
}: DashboardStatsProps) {
  // Compute stats
  const teacherSlots = slots.filter(s => s.isTeacher);
  const totalClasses = teacherSlots.length;
  const totalHours = Math.round(totalClasses * 50 / 60 * 10) / 10; // 50 mins each
  
  const completedClasses = teacherSlots.filter(s => s.completed).length;
  const completionPercentage = totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0;

  // Find unique teacher disciplines
  const uniqueDisciplines = Array.from(new Set(teacherSlots.map(s => s.materia)));

  // Try to find if there is an active class right now
  // We'll calculate based on standard school hours or mock the active one based on current selection
  const upcomingToday = teacherSlots.filter(s => s.day === currentDay && !s.completed);
  const nextClass = upcomingToday.length > 0 ? upcomingToday[0] : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Turno Selector & Status Card - Editorial Dark Slate style */}
        <div className="bg-purple-950 border-2 border-purple-900 text-white rounded-none p-5 shadow-[3px_3px_0px_0px_rgba(88,28,135,1)] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">Turno Letivo</span>
              <span className="h-2.5 w-2.5 rounded-none bg-purple-400 rotate-45"></span>
            </div>
            <div className="flex bg-purple-900/60 border border-purple-800 p-1 rounded-none font-mono">
              <button
                onClick={() => setActiveTurno('Matutino')}
                className={`flex-1 text-center py-1.5 px-2 rounded-none text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTurno === 'Matutino'
                    ? 'bg-purple-300 text-purple-950 font-black'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                Matutino
              </button>
              <button
                onClick={() => setActiveTurno('Vespertino')}
                className={`flex-1 text-center py-1.5 px-2 rounded-none text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTurno === 'Vespertino'
                    ? 'bg-purple-300 text-purple-950 font-black'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                Vespertino
              </button>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-purple-800">
            <p className="text-[11px] font-mono text-purple-200">Períodos: <strong className="text-white font-bold font-sans">{activeTurno === 'Matutino' ? '5 (07:00 às 11:30)' : '4 (12:30 às 15:50)'}</strong></p>
          </div>
        </div>

        {/* Stats - Aulas Card in Crisp Editorial Theme */}
        <div className="bg-white border-2 border-purple-900 rounded-none p-5 shadow-[3px_3px_0px_0px_rgba(88,28,135,1)] flex flex-col justify-between hover:scale-[1.01] transition-transform">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black text-purple-950 uppercase tracking-widest mb-1.5">Aulas Semanais</p>
              <h3 className="text-4xl font-black tracking-tight text-purple-900 font-sans">{totalClasses}</h3>
            </div>
            <div className="p-2 border border-purple-900 bg-purple-50 text-purple-900">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-[11px] text-slate-600 font-serif italic gap-2 border-t border-purple-100 pt-3">
            <Clock size={13} className="text-purple-900 not-italic shrink-0" />
            <span>Contabilizando ~{totalHours}h de carga direta</span>
          </div>
        </div>

        {/* Stats - Progresso Card in Crisp Editorial Theme */}
        <div className="bg-white border-2 border-purple-900 rounded-none p-5 shadow-[3px_3px_0px_0px_rgba(88,28,135,1)] flex flex-col justify-between hover:scale-[1.01] transition-transform">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black text-purple-950 uppercase tracking-widest mb-1.5">Progresso Semanal</p>
              <h3 className="text-4xl font-black tracking-tight text-purple-900 font-sans">{completionPercentage}%</h3>
            </div>
            <div className="p-2 border border-purple-900 bg-purple-50 text-purple-900">
              <CheckSquare size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 h-3 border border-purple-900 rounded-none overflow-hidden">
              <div 
                className="bg-purple-900 h-full rounded-none transition-all duration-500" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-2 flex justify-between font-bold">
              <span>{completedClasses} de {totalClasses}</span>
              <span>{totalClasses - completedClasses} restantes</span>
            </p>
          </div>
        </div>

        {/* Upcoming / Active Class Card in Crisp Editorial Theme */}
        <div className="bg-white border-2 border-purple-900 rounded-none p-5 shadow-[3px_3px_0px_0px_rgba(88,28,135,1)] flex flex-col justify-between hover:scale-[1.01] transition-transform">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black text-purple-950 uppercase tracking-widest mb-1.5">Próxima Atividade</p>
              {nextClass ? (
                <h4 className="text-base font-serif italic font-bold text-purple-900 truncate max-w-[170px]" title={nextClass.materia}>
                  {nextClass.materia}
                </h4>
              ) : (
                <h4 className="text-xs font-serif italic text-slate-500">
                  Livre hoje! 🎉
                </h4>
              )}
            </div>
            <div className="p-2 border border-purple-900 bg-purple-50 text-purple-900">
              <GraduationCap size={18} />
            </div>
          </div>
          {nextClass ? (
            <div 
              onClick={() => onSelectSlot(nextClass)}
              className="mt-3 p-2 bg-purple-50 hover:bg-purple-100/50 rounded-none border border-purple-900 cursor-pointer transition-all flex flex-col gap-0.5"
            >
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-purple-950 font-mono">
                <span>{nextClass.day} • {nextClass.turma}</span>
                <span className="text-purple-900 text-[10px]">{nextClass.time}</span>
              </div>
              <span className="text-[10px] font-serif italic text-slate-500 mt-1">Toque para planejar</span>
            </div>
          ) : (
            <div className="mt-4 flex items-center text-[11px] text-slate-550 font-serif italic gap-2 border-t border-purple-100 pt-3">
              <Calendar size={13} className="text-purple-900 not-italic shrink-0" />
              <span>Fim de semana ou recesso</span>
            </div>
          )}
        </div>
      </div>
  );
}
