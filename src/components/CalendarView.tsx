/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScheduleSlot, DayOfWeek, TurnoType } from '../types';
import { 
  Calendar as CalendarIcon, Info, Sparkles, CheckCircle2, 
  HelpCircle, ChevronLeft, ChevronRight, AlertTriangle, BookOpen, Clock, PenTool, ClipboardList, CheckSquare, Download
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface CalendarViewProps {
  slots: ScheduleSlot[];
  onSelectSlot: (slot: ScheduleSlot) => void;
}

// Special dates representation
export interface SpecialDate {
  type: 'FN' | 'FM' | 'R' | 'F' | 'SL' | 'IT' | 'TT' | 'DE';
  name: string;
}

// Special calendar markers for 2026
export const SPECIAL_DATES_2026: Record<string, SpecialDate> = {
  // January
  '2026-01-01': { type: 'FN', name: 'Confraternização Universal' },
  // Jan 2 to Jan 31: Vacation
  ...Array.from({ length: 30 }, (_, i) => {
    const day = (i + 2).toString().padStart(2, '0');
    return { [`2026-01-${day}`]: { type: 'F' as const, name: 'Férias Escolares' } };
  }).reduce((acc, curr) => ({ ...acc, ...curr }), {}),

  // February
  '2026-02-04': { type: 'IT', name: 'Início do 1º Trimestre Letivo de 2026' },
  '2026-02-16': { type: 'R', name: 'Recesso de Carnaval' },
  '2026-02-17': { type: 'R', name: 'Recesso de Carnaval (Terça-feira)' },
  '2026-02-18': { type: 'R', name: 'Recesso de Cinzas' },

  // March
  '2026-03-02': { type: 'R', name: 'Recesso Escolar' },
  '2026-03-03': { type: 'FM', name: 'Aniversário de Varzelândia - Feriado Municipal' },

  // April
  '2026-04-02': { type: 'R', name: 'Recesso (Quinta-Feira Santa)' },
  '2026-04-03': { type: 'FN', name: 'Sexta-Feira Santa' },
  '2026-04-11': { type: 'SL', name: 'Sábado Letivo (Mobilização das Famílias)' },
  '2026-04-20': { type: 'R', name: 'Recesso de Tiradentes' },
  '2026-04-21': { type: 'FN', name: 'Feriado de Tiradentes' },

  // May
  '2026-05-01': { type: 'FN', name: 'Dia do Trabalho' },
  '2026-05-20': { type: 'TT', name: 'Término do 1º Trimestre Letivo' },
  '2026-05-21': { type: 'IT', name: 'Início do 2º Trimestre Letivo' },

  // June
  '2026-06-04': { type: 'R', name: 'Corpus Christi' },
  '2026-06-05': { type: 'R', name: 'Recesso de Corpus Christi (Emenda)' },
  '2026-06-27': { type: 'SL', name: 'Sábado Letivo (Festa Junina / Pedagógico)' },

  // July Recess and Férias
  ...Array.from({ length: 12 }, (_, i) => {
    const day = (i + 20).toString().padStart(2, '0');
    return { [`2026-07-${day}`]: { type: 'R' as const, name: 'Recesso Escolar de Julho' } };
  }).reduce((acc, curr) => ({ ...acc, ...curr }), {}),

  // August
  '2026-08-15': { type: 'FM', name: 'Feriado de Nossa Senhora da Glória (Padroeira)' },

  // September
  '2026-09-07': { type: 'FN', name: 'Independência do Brasil' },
  '2026-09-09': { type: 'TT', name: 'Término do 2º Trimestre Letivo' },
  '2026-09-10': { type: 'IT', name: 'Início do 3º Trimestre Letivo' },
  '2026-09-12': { type: 'SL', name: 'Sábado Letivo' },

  // October
  '2026-10-12': { type: 'FN', name: 'Nossa Senhora Aparecida' },
  '2026-10-13': { type: 'R', name: 'Recesso (Semana da Criança)' },
  '2026-10-14': { type: 'R', name: 'Recesso (Semana da Criança)' },
  '2026-10-15': { type: 'R', name: 'Recesso (Semana da Criança)' },
  '2026-10-16': { type: 'R', name: 'Recesso (Semana da Criança)' },
  '2026-10-24': { type: 'SL', name: 'Sábado Letivo (Mostra de Trabalhos)' },
  '2026-10-28': { type: 'FM', name: 'Dia do Servidor Público (Recesso)' },

  // November
  '2026-11-02': { type: 'FN', name: 'Finados' },
  '2026-11-14': { type: 'SL', name: 'Sábado Letivo' },
  '2026-11-15': { type: 'FN', name: 'Proclamação da República' },
  '2026-11-20': { type: 'FN', name: 'Dia da Consciência Negra' },

  // December
  '2026-12-18': { type: 'TT', name: 'Término do 3º Trimestre / Encerramento do Ano Letivo' },
  '2026-12-21': { type: 'DE', name: 'Dia Escolar (Fechamento e Conselhos)' },
  '2026-12-22': { type: 'DE', name: 'Dia Escolar (Fechamento e Conselhos)' },
  '2026-12-23': { type: 'DE', name: 'Dia Escolar (Fechamento e Conselhos)' },
  '2026-12-24': { type: 'R', name: 'Recesso de Natal' },
  '2026-12-25': { type: 'FN', name: 'Natal' },
  '2026-12-28': { type: 'R', name: 'Recesso Escolar de Fim de Ano' },
  '2026-12-29': { type: 'R', name: 'Recesso Escolar de Fim de Ano' },
  '2026-12-30': { type: 'R', name: 'Recesso Escolar de Fim de Ano' },
  '2026-12-31': { type: 'R', name: 'Recesso Escolar de Fim de Ano' },
};

// Help map Day Index to Portuguese Week Name
export const WEEKDAYS_MAP_PT: Record<number, DayOfWeek> = {
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
};

export const WEEKDAYS_FULL_PT = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
];

interface DiaryRecord {
  completed?: boolean;
  notes?: string;
  aiPlan?: string;
  topic?: string;
}

export default function CalendarView({ slots, onSelectSlot }: CalendarViewProps) {
  const [currentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(4); // Default starts in May (4 is index for May in Date objects, i.e., Jan-0, May-4)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 4, 28)); // Pre-select May 28, 2026 as per our guidelines

  // Calendar Diary state saved to localStorage
  const [diary, setDiary] = useState<Record<string, Record<string, DiaryRecord>>>({});
  const [activeDiaryNotes, setActiveDiaryNotes] = useState<string>('');
  const [activeDiaryTopic, setActiveDiaryTopic] = useState<string>('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<Record<string, boolean>>({});

  // Calculations for weekday losses
  const [lossStats, setLossStats] = useState<any>(null);

  // Load diary on mount
  useEffect(() => {
    const saved = localStorage.getItem('agenda_professor_calendar_diary');
    if (saved) {
      try {
        setDiary(JSON.parse(saved));
      } catch (err) {
        console.warn('Erro ao carregar os dados do diário:', err);
      }
    }
  }, []);

  // Recalculate annual school statistics
  useEffect(() => {
    calculateAnnualStats();
  }, [slots]);

  // Save diary
  const saveDiary = (newDiary: Record<string, Record<string, DiaryRecord>>) => {
    setDiary(newDiary);
    localStorage.setItem('agenda_professor_calendar_diary', JSON.stringify(newDiary));
  };

  const calculateAnnualStats = () => {
    // We iterate from Feb 4, 2026 to Dec 18, 2026 (the official school year)
    const startDate = new Date(2026, 1, 4); // Feb 4
    const endDate = new Date(2026, 11, 18); // Dec 18

    let totalDays = 0;
    let schoolDays = 0;
    let holidays = 0;
    let recessDays = 0;
    let saturdaysLetivos = 0;

    const weekdayOccurrence: Record<string, { total: number; letivo: number; lost: number }> = {
      'Segunda': { total: 0, letivo: 0, lost: 0 },
      'Terça': { total: 0, letivo: 0, lost: 0 },
      'Quarta': { total: 0, letivo: 0, lost: 0 },
      'Quinta': { total: 0, letivo: 0, lost: 0 },
      'Sexta': { total: 0, letivo: 0, lost: 0 },
    };

    // Keep track of lost days lists to display to the teacher
    const lostDaysList: { date: string; weekday: string; event: string }[] = [];

    const tempDate = new Date(startDate);
    while (tempDate <= endDate) {
      const dateStr = formatDateKey(tempDate);
      const dayOfWeekIdx = tempDate.getDay();
      const ptDay = WEEKDAYS_MAP_PT[dayOfWeekIdx];

      const special = SPECIAL_DATES_2026[dateStr];
      const isWeekend = dayOfWeekIdx === 0 || dayOfWeekIdx === 6;

      if (ptDay) {
        weekdayOccurrence[ptDay].total += 1;
      }

      if (special) {
        if (special.type === 'FN' || special.type === 'FM') {
          holidays++;
          if (ptDay) {
            weekdayOccurrence[ptDay].lost += 1;
            lostDaysList.push({ date: formatDateReadableShort(tempDate), weekday: ptDay, event: special.name });
          }
        } else if (special.type === 'R') {
          recessDays++;
          if (ptDay) {
            weekdayOccurrence[ptDay].lost += 1;
            lostDaysList.push({ date: formatDateReadableShort(tempDate), weekday: ptDay, event: special.name });
          }
        } else if (special.type === 'SL') {
          saturdaysLetivos++;
          schoolDays++;
        }
      } else {
        if (!isWeekend) {
          schoolDays++;
          if (ptDay) {
            weekdayOccurrence[ptDay].letivo += 1;
          }
        }
      }

      totalDays++;
      tempDate.setDate(tempDate.getDate() + 1);
    }

    // Class level impact calculation
    const subjectImpact = slots
      .filter(s => s.isTeacher)
      .map(slot => {
        const letivos = weekdayOccurrence[slot.day]?.letivo || 0;
        const lost = weekdayOccurrence[slot.day]?.lost || 0;
        const totalEstimated = letivos; // Since it occurs weekly on that day
        return {
          id: slot.id,
          materia: slot.materia,
          turma: slot.turma,
          day: slot.day,
          totalEstimated,
          lost,
        };
      });

    setLossStats({
      totalDays,
      schoolDays,
      holidays,
      recessDays,
      saturdaysLetivos,
      weekdayOccurrence,
      lostDaysList: lostDaysList.slice(0, 12), // Keep it scannable
      subjectImpact,
    });
  };

  const formatDateKey = (date: Date): string => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const formatDateReadableShort = (date: Date): string => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${d}/${m}`;
  };

  const handleMonthChange = (direction: 'next' | 'prev') => {
    if (direction === 'prev') {
      if (currentMonth > 1) { // Limit from Feb (1) to Dec (11)
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth < 11) {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  // Generate Month Grid days
  const getDaysInMonthGrid = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0-Sunday to 6-Saturday
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDayOfMonth.getDate();

    const grid = [];
    
    // Pad previous month days empty or blurred
    for (let i = 0; i < startDayOfWeek; i++) {
      grid.push(null);
    }

    // Actual month days
    for (let day = 1; day <= totalDays; day++) {
      grid.push(new Date(currentYear, currentMonth, day));
    }

    return grid;
  };

  const getDayClassification = (date: Date) => {
    const dateStr = formatDateKey(date);
    const dayOfWeek = date.getDay();
    const special = SPECIAL_DATES_2026[dateStr];

    if (special) {
      return {
        type: special.type,
        name: special.name,
        colorClass: getStatusColor(special.type),
        label: getStatusLabel(special.type),
      };
    }

    // January is always Férias
    if (date.getMonth() === 0) {
      return {
        type: 'F' as const,
        name: 'Férias Escolares',
        colorClass: getStatusColor('F'),
        label: 'FÉRIAS',
      };
    }

    // Dec after 18th is school closure
    if (date.getMonth() === 11 && date.getDate() > 18) {
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return {
          type: 'W' as const,
          name: 'Fim de Semana',
          colorClass: 'bg-slate-100 text-slate-400 border-slate-200/50',
          label: 'FIM DE SEMANA',
        };
      }
      return {
        type: 'DE' as const,
        name: 'Dia Escolar / Fechamento',
        colorClass: getStatusColor('DE'),
        label: 'DIA ESCOLAR',
      };
    }

    if (dayOfWeek === 0) {
      return {
        type: 'W' as const,
        name: 'Domingo',
        colorClass: 'bg-slate-50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 border-slate-200/50 dark:border-slate-800',
        label: 'DOMINGO',
      };
    }

    if (dayOfWeek === 6) {
      return {
        type: 'W' as const,
        name: 'Sábado',
        colorClass: 'bg-slate-50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 border-slate-200/50 dark:border-slate-800',
        label: 'SÁBADO',
      };
    }

    // Trimester evaluation
    const timeValue = date.getTime();
    let trimLabel = '1º Trimestre';
    if (timeValue >= new Date(2026, 4, 21).getTime() && timeValue <= new Date(2026, 8, 9).getTime()) {
      trimLabel = '2º Trimestre';
    } else if (timeValue >= new Date(2026, 8, 10).getTime()) {
      trimLabel = '3º Trimestre';
    }

    // Ordinary Letivo Day
    return {
      type: 'L' as const,
      name: `Dia Letivo Ordinário (${trimLabel})`,
      colorClass: 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-purple-900 dark:border-purple-800 shadow-2xs hover:bg-purple-50/10 dark:hover:bg-purple-950/20 hover:border-purple-700 dark:hover:border-purple-400',
      label: 'AULA NORMAL',
    };
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'FN': return 'bg-red-500 dark:bg-red-900 text-white border-red-900 dark:border-red-950 shadow-3xs hover:bg-red-600 dark:hover:bg-red-850';
      case 'FM': return 'bg-pink-600 dark:bg-pink-905 text-white border-pink-900 dark:border-pink-950 shadow-3xs hover:bg-pink-700 dark:hover:bg-pink-800';
      case 'R': return 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-955 dark:text-emerald-300 border-emerald-900 dark:border-emerald-800 shadow-3xs hover:bg-emerald-200';
      case 'F': return 'bg-zinc-800 dark:bg-zinc-900 text-white border-zinc-955 dark:border-zinc-800 shadow-3xs hover:bg-zinc-900';
      case 'SL': return 'bg-amber-100 dark:bg-amber-955/20 text-amber-955 dark:text-amber-300 border-amber-900 dark:border-amber-800 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-amber-200 font-bold';
      case 'IT': return 'bg-purple-800 dark:bg-purple-950 text-white border-purple-950 dark:border-purple-900 ring-2 ring-purple-400 dark:ring-purple-700';
      case 'TT': return 'bg-purple-950 dark:bg-black text-purple-200 border-black';
      case 'DE': return 'bg-purple-50 dark:bg-purple-955/20 text-purple-900 dark:text-purple-300 border-purple-900 dark:border-purple-800';
      default: return 'bg-white dark:bg-slate-850 border-slate-205 dark:border-slate-800';
    }
  };

  const getStatusLabel = (type: string) => {
    switch (type) {
      case 'FN': return 'FERIADO NAC.';
      case 'FM': return 'FERIADO MUN.';
      case 'R': return 'RECESSO';
      case 'F': return 'FÉRIAS';
      case 'SL': return 'SÁB. LETIVO';
      case 'IT': return 'INI. TRIMESTRE';
      case 'TT': return 'TER. TRIMESTRE';
      case 'DE': return 'DIA ESCOLAR';
      default: return 'LETIVO';
    }
  };

  // Check if teacher actually has some of their 16 purple disciplines on a weekday
  const getTeacherSlotsForDate = (date: Date) => {
    const classification = getDayClassification(date);
    
    // No regular classes on holidays, recesses, Sundays, non-school Saturdays, or vacation
    if (['FN', 'FM', 'R', 'F', 'W', 'DE'].includes(classification.type)) {
      return [];
    }

    const dayNamePT = WEEKDAYS_MAP_PT[date.getDay()];
    if (!dayNamePT) return []; // Fallback inside weekends

    return slots.filter(s => s.day === dayNamePT && s.isTeacher);
  };

  const selectedDateKey = formatDateKey(selectedDate);
  const selectedDateClassification = getDayClassification(selectedDate);
  const selectedDayTeacherSlots = getTeacherSlotsForDate(selectedDate);

  // Toggle completion of a slot on the SELECTED DATE
  const handleToggleCalendarSlotComplete = (slotId: string) => {
    const currentRecords = diary[selectedDateKey] || {};
    const record = currentRecords[slotId] || {};
    
    const updatedRecords = {
      ...currentRecords,
      [slotId]: {
        ...record,
        completed: !record.completed,
      }
    };

    const updatedDiary = {
      ...diary,
      [selectedDateKey]: updatedRecords
    };

    saveDiary(updatedDiary);
  };

  // Save textual class record for the selected date
  const handleSaveCalendarNotes = (slotId: string, notes: string) => {
    const currentRecords = diary[selectedDateKey] || {};
    const record = currentRecords[slotId] || {};

    const updatedRecords = {
      ...currentRecords,
      [slotId]: {
        ...record,
        notes: notes,
      }
    };

    const updatedDiary = {
      ...diary,
      [selectedDateKey]: updatedRecords
    };

    saveDiary(updatedDiary);
  };

  // Generate Gemini Lesson Plan for this actual date slot
  const handleGenerateCalendarAiPlan = async (slotId: string, slotMateria: string, slotTurma: string) => {
    const record = diary[selectedDateKey]?.[slotId] || {};
    const currentTopic = record.topic || '';
    const currentNotes = record.notes || '';

    setIsGeneratingPlan(prev => ({ ...prev, [slotId]: true }));
    try {
      const response = await fetch('/api/gemini/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: slotMateria,
          topic: currentTopic || 'Plano de Aula Integrado do Dia',
          turma: slotTurma,
          notes: currentNotes,
        }),
      });

      if (!response.ok) throw new Error('API do Gemini temporariamente indisponível.');
      const data = await response.json();

      const currentRecords = diary[selectedDateKey] || {};
      const updatedRecords = {
        ...currentRecords,
        [slotId]: {
          ...record,
          aiPlan: data.plan,
        }
      };

      const updatedDiary = {
        ...diary,
        [selectedDateKey]: updatedRecords
      };

      saveDiary(updatedDiary);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao acionar a IA: ' + err.message);
    } finally {
      setIsGeneratingPlan(prev => ({ ...prev, [slotId]: false }));
    }
  };

  // Change topic for a slot on the SELECTED DATE
  const handleUpdateTopic = (slotId: string, topic: string) => {
    const currentRecords = diary[selectedDateKey] || {};
    const record = currentRecords[slotId] || {};

    const updatedRecords = {
      ...currentRecords,
      [slotId]: {
        ...record,
        topic: topic,
      }
    };

    const updatedDiary = {
      ...diary,
      [selectedDateKey]: updatedRecords
    };

    saveDiary(updatedDiary);
  };

  const handleExportCalendarPdf = (slotMateria: string, slotTurma: string, content: string, theDate: string) => {
    const div = document.createElement('div');
    // Format the markdown content roughly by preserving whitespace
    div.innerHTML = `
      <div style="padding: 30px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333;">
        <h1 style="color: #4b0082; font-size: 24px; margin-bottom: 5px;">Planejamento Diário</h1>
        <h3 style="color: #666; margin-top: 0; margin-bottom: 20px;">${slotMateria} - Turma ${slotTurma} (${theDate})</h3>
        <div style="white-space: pre-wrap; line-height: 1.6; font-size: 14px;">${content}</div>
      </div>
    `;

    const opt = {
      margin:       10,
      filename:     `Plano_Diario_${slotMateria.replace(/\s+/g, '_')}_${slotTurma}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    html2pdf().from(div).set(opt).save();
  };

  const monthsList = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const gridDays = getDaysInMonthGrid();

  return (
    <div className="space-y-6">
      
      {/* Intro Banner for Calendar */}
      <div className="bg-purple-950 border-2 border-purple-900 dark:border-purple-800 text-white rounded-none p-5 shadow-[3px_3px_0px_0px_rgba(88,28,135,1)] dark:shadow-none transition-colors">
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-purple-300" />
          <h3 className="font-serif italic text-lg text-purple-100 font-bold">Resolução SEE Nº 5.222 Integrada</h3>
        </div>
        <p className="text-xs text-purple-200 mt-2 leading-relaxed">
          Cross-referenciamos diretamente o seu cronograma de aulas semanais com o **Calendário Escolar Oficial de 2026** (E.E. Maria Barbosa Leite - Varzelândia/MG).
          Utilize o calendário para gerenciar as suas aulas data por data, planejar diários específicos e se antecipar aos recessos, feriados ou sábados de aula!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: MONTHLY GRID & MONTH CONTROLS (8 COLS) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border-2 border-purple-900 dark:border-purple-800 rounded-none p-5 shadow-[3px_3px_0px_0px_rgba(88,28,135,1)] dark:shadow-none space-y-4 transition-colors">
          
          {/* Header Month selector */}
          <div className="flex justify-between items-center bg-purple-900 dark:bg-purple-955 text-white p-2.5 rounded-none border border-black dark:border-purple-800 font-mono">
            <button 
              onClick={() => handleMonthChange('prev')}
              disabled={currentMonth <= 1} // Limit to school year starting in Feb
              className="p-1 px-2.5 bg-purple-950 dark:bg-slate-900 border border-purple-700 dark:border-purple-800 hover:bg-white hover:text-purple-900 disabled:opacity-30 disabled:hover:bg-purple-950 disabled:hover:text-white transition-all uppercase text-[10px] font-black tracking-widest cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
            >
              <ChevronLeft size={14} className="inline mr-1" />
              Anterior
            </button>
            <h4 className="text-sm font-black tracking-widest uppercase text-center font-display">
              {monthsList[currentMonth]} {currentYear}
            </h4>
            <button 
              onClick={() => handleMonthChange('next')}
              disabled={currentMonth >= 11}
              className="p-1 px-2.5 bg-purple-950 dark:bg-slate-900 border border-purple-700 dark:border-purple-800 hover:bg-white hover:text-purple-900 disabled:opacity-30 disabled:hover:bg-purple-950 disabled:hover:text-white transition-all uppercase text-[10px] font-black tracking-widest cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
            >
              Próximo
              <ChevronRight size={14} className="inline mr-1" />
            </button>
          </div>

          {/* Color Guides / Legenda conforme PDF */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono p-2.5 border border-purple-900/10 dark:border-purple-800/40 bg-purple-50/20 dark:bg-purple-955/20 transition-colors">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-5 bg-white dark:bg-slate-850 border border-purple-900 dark:border-purple-800 block flex-shrink-0"></span>
              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase">Aula Normal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-5 bg-red-500 dark:bg-red-800 border border-red-900 block flex-shrink-0"></span>
              <span className="font-bold text-slate-705 dark:text-slate-350 uppercase">Feriado Nac.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-5 bg-pink-600 dark:bg-pink-805 border border-pink-900 block flex-shrink-0"></span>
              <span className="font-bold text-slate-705 dark:text-slate-350 uppercase">Feriado Municipal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-5 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-900 block flex-shrink-0"></span>
              <span className="font-bold text-slate-705 dark:text-slate-350 uppercase">Recesso</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-5 bg-zinc-800 dark:bg-zinc-900 border border-zinc-950 block flex-shrink-0"></span>
              <span className="font-bold text-slate-705 dark:text-slate-350 uppercase">Férias Esc.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-5 bg-amber-100 dark:bg-amber-950/20 border border-amber-900 block flex-shrink-0"></span>
              <span className="font-bold text-slate-750 dark:text-slate-300 uppercase">Sáb. Letivo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 bg-purple-900 dark:bg-purple-700 rotate-45 block flex-shrink-0"></span>
              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase">MINHAS AULAS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-5 ring-2 ring-purple-600 ring-offset-1 bg-purple-100 dark:bg-purple-955/30 block flex-shrink-0"></span>
              <span className="font-bold text-slate-705 dark:text-slate-350 uppercase">Dia Selecionado</span>
            </div>
          </div>

          {/* Academic Calendar Grid of the Month */}
          <div className="grid grid-cols-7 gap-1.5 font-mono">
            {/* Week Headers */}
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((h, i) => (
              <div 
                key={i} 
                className={`text-center py-1.5 text-[11px] font-black uppercase border-b-2 border-purple-900 ${
                  i === 0 ? 'text-red-600' : i === 6 ? 'text-amber-800' : 'text-purple-950'
                }`}
              >
                {h}
              </div>
            ))}

            {/* Empty grid spaces before 1st of month */}
            {gridDays.map((gameDay, idx) => {
              if (gameDay === null) {
                return (
                  <div 
                    key={`empty-${idx}`} 
                    className="aspect-square bg-slate-50/40 border border-slate-100 rounded-none shrink-0"
                  />
                );
              }

              const classification = getDayClassification(gameDay);
              const isSelected = formatDateKey(gameDay) === selectedDateKey;
              const teacherSlotsToday = getTeacherSlotsForDate(gameDay);
              const hasTeacherClasses = teacherSlotsToday.length > 0;
              const dateRawKey = formatDateKey(gameDay);

              // Check if any class completed today
              const totalClassesTodayCount = teacherSlotsToday.length;
              const dayRecords = diary[dateRawKey] || {};
              const completedCount = Object.values(dayRecords).filter((v: any) => v.completed).length;
              const isFullyCompleted = totalClassesTodayCount > 0 && completedCount === totalClassesTodayCount;

              return (
                <button
                  key={dateRawKey}
                  type="button"
                  onClick={() => setSelectedDate(gameDay)}
                  className={`relative p-1 aspect-square rounded-none border-2 flex flex-col justify-between items-stretch transition-all select-none cursor-pointer ${classification.colorClass} ${
                    isSelected ? 'ring-2 ring-purple-600 ring-offset-2 z-10 scale-105 shadow-[4px_4px_0px_0px_rgba(88,28,135,0.4)]' : 'hover:translate-x-[-2px] hover:-translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(88,28,135,0.3)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none'
                  }`}
                >
                  {/* Day Number */}
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-black ${
                      classification.type === 'FN' || classification.type === 'FM' || gameDay.getDay() === 0
                        ? 'text-white'
                        : 'text-purple-950'
                    }`}>
                      {gameDay.getDate()}
                    </span>
                    
                    {/* Small tag/bubble for Sáb. Letivo or Special */}
                    {classification.type === 'SL' && (
                      <span className="text-[7.5px] font-black text-amber-950 border border-amber-900 px-0.5 whitespace-nowrap bg-amber-200">SL</span>
                    )}

                    {classification.type === 'IT' && (
                      <span className="text-[7px] font-black text-white bg-purple-950 p-0.5 rounded-none">INI</span>
                    )}
                    {classification.type === 'TT' && (
                      <span className="text-[7px] font-black text-white bg-purple-950 p-0.5 rounded-none">FIM</span>
                    )}
                  </div>

                  {/* Teacher Schedule Indicators */}
                  {hasTeacherClasses && (
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      {/* Purple diamond indicating their teaching day */}
                      {isFullyCompleted ? (
                        <div className="h-3 w-3 bg-emerald-700 text-white flex items-center justify-center border border-black scale-105" title="Todas ministradas!">
                          ✓
                        </div>
                      ) : (
                        <div className="h-2.5 w-2.5 bg-purple-950 hover:bg-purple-900 border border-purple-400 rotate-45 flex-shrink-0" title={`${teacherSlotsToday.length} aulas de TI marcadas`} />
                      )}
                      
                      {/* Micro text count of classes */}
                      <span className="text-[8px] font-sans font-extrabold block text-[10px] text-purple-900 uppercase">
                        {teacherSlotsToday.length}h
                      </span>
                    </div>
                  )}

                  {/* Tiny outline for current calendar date */}
                  {new Date().toDateString() === gameDay.toDateString() && (
                    <div className="absolute top-0 right-0 h-2 w-2 rounded-none bg-blue-500 animate-pulse border border-white" title="Hoje" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Info details about selected month */}
          <div className="bg-purple-50/50 p-3 border-l-2 border-purple-900 text-slate-800 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-950 block">Nota do Trimestre</span>
            <p className="text-[11px] font-serif italic text-slate-700 leading-relaxed">
              * O ano letivo oficial tem início em 04 de fevereiro e encerramento em 18 de dezembro de 2026. 
              As disciplinas roxas foram sintonizadas com base na distribuição semanal letiva.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: DATA SINTONIA PARAMS AND SELECTED DAY IN FOCUS (4 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Date Panel Card */}
          <div className="bg-white dark:bg-slate-900 border-2 border-purple-900 dark:border-purple-800 rounded-none p-5 shadow-[3px_3px_0px_0px_rgba(88,28,135,1)] dark:shadow-none transition-colors">
            <div className="border-b border-purple-200 dark:border-purple-900/60 pb-3 mb-4 select-none">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-900 dark:text-purple-300 font-mono">Selecionado no Calendário</span>
              <h4 className="text-lg font-serif italic tracking-wide text-purple-950 dark:text-purple-200 font-bold mt-1">
                {WEEKDAYS_FULL_PT[selectedDate.getDay()]}, {selectedDate.getDate()} de {monthsList[selectedDate.getMonth()]} de 2026
              </h4>
              
              {/* Type tag */}
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black font-mono border uppercase bg-purple-50 dark:bg-purple-950/25 text-purple-900 dark:text-purple-300 border-purple-900 dark:border-purple-800">
                <span className="h-2 w-2 bg-purple-900 rotate-45" />
                {selectedDateClassification.name}
              </div>
            </div>

            {/* No classes scheduled because holiday, recess, weekend, etc. */}
            {selectedDayTeacherSlots.length === 0 ? (
              selectedDate.getDay() === 2 && !['FN', 'FM', 'R', 'F', 'W'].includes(selectedDateClassification.type) ? (
                <div className="py-6 bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-600 dark:border-emerald-700 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-emerald-600 text-white font-mono font-black text-[9px] uppercase tracking-wider">
                      Módulo Oficial
                    </span>
                    <h5 className="text-xs font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
                      Dia Oficial de Módulo Pedagógico (2 Horas Fixadas)
                    </h5>
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    Você não possui aulas presenciais em sala na terça-feira. Este é o dia reservado na escola para cumprimento de <strong>2 horas de módulo</strong> (horário de assinatura fixo corrigido: <strong>14:10 às 16:00</strong>), realização de planejamentos e assinatura formal no diário escolar.
                  </p>
                  <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 p-2.5 font-mono text-[10px] space-y-1">
                    <div className="flex justify-between text-emerald-950 dark:text-emerald-300 font-bold">
                      <span>Horário Fixo para Assinatura:</span>
                      <span>14:10 às 16:00 (2h)</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Período do Módulo:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">14:10 às 16:00</span>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-purple-900 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 p-2 border border-purple-200 dark:border-purple-800">
                    💡 Consulte a aba <strong>Relatório Módulo</strong> no topo para conferir a folha cronológica completa de todas as terças e janelas da semana desde fevereiro para assinatura e impressão!
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center bg-purple-50/30 dark:bg-purple-950/10 border border-dashed border-purple-900/35 dark:border-purple-900/40 p-4 space-y-2">
                  <Info size={24} className="mx-auto text-purple-900/60 dark:text-purple-300/60" />
                  <h5 className="text-xs font-black uppercase tracking-widest text-purple-950 dark:text-purple-300">Nenhuma Aula Acadêmica</h5>
                  <p className="text-[11px] font-serif italic text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                    {['FN', 'FM', 'R', 'F'].includes(selectedDateClassification.type) 
                      ? `Aproveite o tempo de folga! O dia de hoje está classificado como: ${selectedDateClassification.name}.`
                      : `Não há horários técnicos autorais de informática configurados para este dia da semana.`}
                  </p>
                </div>
              )
            ) : (
              // Display Classes on that Date & Diaries
              <div className="space-y-4">
                {/* Notice for Wednesday and Thursday Module Windows */}
                {selectedDate.getDay() === 3 && (
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 text-[10px] font-mono font-bold flex items-center justify-between">
                    <span>📌 Janela de Módulo Fixo de Quarta-feira:</span>
                    <span className="bg-amber-100 dark:bg-amber-900 px-1.5 py-0.5">09:50 às 10:40 (50 min)</span>
                  </div>
                )}
                {selectedDate.getDay() === 4 && (
                  <div className="p-2 bg-purple-50 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-800 text-purple-950 dark:text-purple-200 text-[10px] font-mono font-bold flex items-center justify-between">
                    <span>📌 Janela de Módulo Fixo de Quinta-feira:</span>
                    <span className="bg-purple-100 dark:bg-purple-900 px-1.5 py-0.5">10:40 às 11:30 (50 min)</span>
                  </div>
                )}

                <h5 className="text-[10px] font-black uppercase tracking-widest text-purple-950 dark:text-purple-300 font-mono flex items-center gap-1">
                  <BookOpen size={12} className="text-purple-900 dark:text-purple-305" />
                  Minhas Aulas Sintonizadas ({selectedDayTeacherSlots.length})
                </h5>

                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Gerencie as entregas, presença e planos para esta data letiva:
                </p>

                <div className="divide-y divide-purple-100 dark:divide-purple-900/40">
                  {selectedDayTeacherSlots.map((slot) => {
                    const record = diary[selectedDateKey]?.[slot.id] || {};
                    const isCompleted = record.completed || false;
                    const classNotes = record.notes || '';
                    const classTopic = record.topic || '';
                    const classAiPlan = record.aiPlan || '';

                    return (
                      <div key={slot.id} className="py-3.5 space-y-3 font-sans">
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono font-black uppercase bg-purple-900 dark:bg-purple-800 text-white px-1.5 py-0.5 rounded-none">{slot.turma}</span>
                            <h6 className="text-[13px] font-black text-purple-950 dark:text-purple-300 leading-tight">{slot.materia}</h6>
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold block">{slot.time} • ({slot.turno})</span>
                          </div>

                          {/* Complete Checkbox */}
                          <button
                            onClick={() => handleToggleCalendarSlotComplete(slot.id)}
                            className={`p-2 rounded-none border-2 shrink-0 transition-all cursor-pointer ${
                              isCompleted 
                                ? 'bg-emerald-700 text-white border-emerald-950'
                                : 'bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-300 border-purple-900 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-slate-700'
                            }`}
                            title={isCompleted ? "Aula concluída!" : "Marcar como ministrada nesta data."}
                          >
                            {isCompleted ? <CheckCircle2 size={14} /> : <div className="h-3.5 w-3.5" />}
                          </button>
                        </div>

                        {/* Subject topic inputs */}
                        <div className="space-y-2 text-xs bg-purple-50/20 dark:bg-purple-955/10 p-3 border border-purple-900/10 dark:border-purple-900/30 rounded-none">
                          
                          <div>
                            <label className="text-[9px] font-black uppercase text-purple-950 dark:text-purple-300 font-mono tracking-wider block mb-1">Tema / Assunto do Diário:</label>
                            <input
                              type="text"
                              value={classTopic}
                              onChange={(e) => handleUpdateTopic(slot.id, e.target.value)}
                              placeholder="Ex: Teoria de Herança, Interface Gráfica, etc."
                              className="w-full text-xs p-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-purple-900 dark:border-purple-800 focus:outline-none focus:ring-0 font-medium"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-black uppercase text-purple-950 dark:text-purple-300 font-mono tracking-wider block mb-1">Anotações e Frequência:</label>
                            <textarea
                              value={classNotes}
                              onChange={(e) => handleSaveCalendarNotes(slot.id, e.target.value)}
                              placeholder="Ex: Aluno X faltou; Entregaram o exercício 1."
                              rows={2}
                              className="w-full text-xs p-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-purple-900 dark:border-purple-800 focus:outline-none focus:ring-0 font-medium"
                            />
                          </div>

                          {/* AI Planning directly for this specific slot date! */}
                          <div className="pt-1.5 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleGenerateCalendarAiPlan(slot.id, slot.materia, slot.turma)}
                              disabled={isGeneratingPlan[slot.id]}
                              className="flex-1 bg-purple-900 dark:bg-purple-800 hover:bg-purple-950 dark:hover:bg-purple-950 text-white font-mono uppercase text-[9px] font-black py-1.5 px-3 rounded-none tracking-widest text-center flex items-center justify-center gap-1 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer disabled:opacity-40"
                            >
                              <Sparkles size={11} />
                              {isGeneratingPlan[slot.id] ? 'Criando Roteiro...' : 'ROTEIRO PEDAGÓGICO'}
                            </button>
                          </div>

                          {/* Generated aiPlan view */}
                          {classAiPlan && (
                            <div className="mt-2 p-2.5 bg-white dark:bg-slate-900 border border-purple-900 dark:border-purple-800 text-slate-900 dark:text-slate-205 max-h-40 overflow-y-auto leading-relaxed select-text font-mono text-[10px] break-words whitespace-pre-wrap relative group">
                              <div className="flex justify-between items-center mb-1 border-b border-purple-100 dark:border-purple-950 pb-0.5">
                                <span className="font-sans font-black text-[9px] uppercase text-purple-900 dark:text-purple-300 block">Roteiro Sugerido pela IA:</span>
                                <button
                                  type="button"
                                  onClick={() => handleExportCalendarPdf(slot.materia, slot.turma, classAiPlan, selectedDateKey)}
                                  className="text-[9px] text-purple-600 dark:text-purple-400 hover:text-purple-950 dark:hover:text-purple-200 flex items-center gap-1 font-bold uppercase transition-colors"
                                  title="Exportar para PDF"
                                >
                                  <Download size={10} />
                                  PDF
                                </button>
                              </div>
                              {classAiPlan}
                            </div>
                          )}

                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* CROSS-REFERENCING (CRUZAMENTO/SINTONIA) STATS CARD */}
          {lossStats && (
            <div className="bg-white dark:bg-slate-900 border-2 border-purple-900 dark:border-purple-800 rounded-none p-5 shadow-[3px_3px_0px_0px_rgba(88,28,135,1)] dark:shadow-none text-slate-800 dark:text-slate-200 space-y-4 font-sans transition-colors">
              <h4 className="text-xs font-black uppercase tracking-widest text-purple-950 dark:text-purple-300 font-mono flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-purple-900 dark:text-purple-400 animate-pulse" />
                Confronto e Carga Letiva 2026
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs border border-purple-900/15 dark:border-purple-800 p-3 bg-purple-50/20 dark:bg-purple-955/25 font-mono">
                <div>
                  <span className="text-[10px] text-purple-900 dark:text-purple-300 font-bold block uppercase">Dias Escolares Letivos</span>
                  <span className="text-xl font-black text-purple-950 dark:text-purple-200">{lossStats.schoolDays} dias</span>
                </div>
                <div>
                  <span className="text-[10px] text-purple-900 dark:text-purple-300 font-bold block uppercase">Recessos & Feriados</span>
                  <span className="text-xl font-black text-purple-950 dark:text-purple-200">{lossStats.recessDays + lossStats.holidays} dias</span>
                </div>
              </div>

              {/* Analysis of weekday impact */}
              <div className="space-y-2 text-xs">
                <h5 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight text-[11px]">Interrupções semanais pela Resolução 2026:</h5>
                
                <div className="space-y-1.5 font-mono text-[11px]">
                  {Object.entries(lossStats.weekdayOccurrence).map(([dayName, data]: any) => (
                    <div key={dayName} className="flex justify-between items-center bg-gray-50 dark:bg-slate-850 p-1.5">
                      <span className="font-bold text-slate-600 dark:text-slate-400">{dayName}-Feiras</span>
                      <span className="font-black text-purple-950 dark:text-purple-300">
                        {data.letivo} letivas / <span className="text-red-700 dark:text-red-400 font-black">{data.lost} perdidas</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject specific totals after calendar crop */}
              <div className="space-y-2 text-xs">
                <h5 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight text-[11px]">Aulas Reais de TI Ministradas (Simulação Anual):</h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                  Considerando todos os feriados e recessos de 2026 que caem nos dias das suas disciplinas autorais:
                </p>

                <div className="max-h-52 overflow-y-auto border border-purple-900/10 dark:border-purple-800 divide-y divide-purple-100 dark:divide-purple-900/40 bg-white dark:bg-slate-900 p-1">
                  {lossStats.subjectImpact.map((item: any, i: number) => (
                    <div key={i} className="py-2 px-1 text-[11px] flex justify-between items-start font-mono gap-4">
                      <div className="space-y-0.5">
                        <span className="font-sans font-black text-purple-950 dark:text-purple-300 block">{item.materia} ({item.turma})</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-505 font-bold block uppercase">{item.day}-feira</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-black text-purple-900 dark:text-purple-405 block">{item.totalEstimated} aulas letivas</span>
                        <span className="text-[9px] font-black text-red-600 dark:text-red-400 uppercase block">{item.lost} canceladas</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
