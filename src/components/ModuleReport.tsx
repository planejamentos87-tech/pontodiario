/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { ScheduleSlot, DayOfWeek } from '../types';
import { SPECIAL_DATES_2026 } from './CalendarView';
import { 
  Printer, Download, FileText, CheckCircle2, AlertTriangle, 
  Clock, Calendar as CalendarIcon, CheckSquare, Square, 
  Copy, Check, Filter, Info, ShieldCheck, 
  ArrowUpDown, ChevronRight, BookOpen, UserCheck, Sparkles, Pin
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface ModuleReportProps {
  slots: ScheduleSlot[];
}

export interface FixedSlotDefinition {
  dayOfWeek: DayOfWeek;
  dayIndex: number; // 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex
  startTime: string;
  endTime: string;
  durationLabel: string;
  hoursDec: number;
  type: 'modulo_terca' | 'janela_modulo';
  title: string;
  details: string;
  availableRange?: string;
}

export const FIXED_MODULE_SCHEDULES: FixedSlotDefinition[] = [
  {
    dayOfWeek: 'Terça',
    dayIndex: 2,
    startTime: '14:10',
    endTime: '16:00',
    durationLabel: '2 horas',
    hoursDec: 2,
    type: 'modulo_terca',
    title: 'Módulo Oficial de Terça-feira (2h)',
    details: 'Módulo presencial fixo na escola das 14:10 às 16:00 (2 horas para assinatura no diário)',
    availableRange: '14:10 às 16:00'
  },
  {
    dayOfWeek: 'Quarta',
    dayIndex: 3,
    startTime: '09:50',
    endTime: '10:40',
    durationLabel: '50 min (1 h/a)',
    hoursDec: 0.83,
    type: 'janela_modulo',
    title: 'Janela de Módulo de Quarta-feira',
    details: 'Janela matutina para trabalho de módulo e planejamento (fixada das 09:50 às 10:40)',
    availableRange: '09:50 às 10:40'
  },
  {
    dayOfWeek: 'Quinta',
    dayIndex: 4,
    startTime: '10:40',
    endTime: '11:30',
    durationLabel: '50 min (1 h/a)',
    hoursDec: 0.83,
    type: 'janela_modulo',
    title: 'Janela de Módulo de Quinta-feira',
    details: 'Janela matutina para trabalho de módulo e planejamento (fixada das 10:40 às 11:30)',
    availableRange: '10:40 às 11:30'
  },
  {
    dayOfWeek: 'Segunda',
    dayIndex: 1,
    startTime: '14:10',
    endTime: '15:00',
    durationLabel: '50 min (1 h/a)',
    hoursDec: 0.83,
    type: 'janela_modulo',
    title: 'Janela de Módulo de Segunda-feira',
    details: 'Janela vespertina de módulo entre as disciplinas de HTML/CSS e Arquitetura',
    availableRange: '14:10 às 15:00'
  },
  {
    dayOfWeek: 'Sexta',
    dayIndex: 5,
    startTime: '12:30',
    endTime: '13:20',
    durationLabel: '50 min (1 h/a)',
    hoursDec: 0.83,
    type: 'janela_modulo',
    title: 'Janela de Módulo de Sexta-feira',
    details: 'Janela vespertina de módulo no início do turno da tarde',
    availableRange: '12:30 às 13:20'
  }
];

export interface ModuleDiaryEntry {
  id: string; // unique key
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: DayOfWeek;
  formattedDate: string; // DD/MM/YYYY
  startTime: string; // e.g. '11:30'
  endTime: string; // e.g. '13:30'
  durationLabel: string;
  hoursDec: number;
  availableWindow: string; // '11:30 às 16:00'
  activity: string;
  slotType: 'modulo_terca' | 'janela_modulo';
  slotTitle: string;
  isSpecialDay: boolean;
  specialDayInfo?: { type: string; name: string };
  isSigned: boolean;
  notes?: string;
}

const DEFAULT_ACTIVITIES: Record<string, string[]> = {
  Terça: [
    'Módulo Oficial: Planejamento pedagógico, alinhamento curricular e elaboração de planos de aula',
    'Módulo Oficial: Preparação de projetos práticos e manutenção dos laboratórios de informática',
    'Módulo Oficial: Atendimento e orientação pedagógica aos estudantes do curso técnico',
    'Módulo Oficial: Lançamento de notas, frequências e registros no diário escolar digital',
    'Módulo Oficial: Reunião pedagógica com a coordenação e equipe de gestão escolar'
  ],
  Quarta: [
    'Janela de Módulo (09:50-10:40): Preparação de ambiente de programação para as aulas da tarde',
    'Janela de Módulo (09:50-10:40): Revisão de código e exercícios práticos de Java / Software',
    'Janela de Módulo (09:50-10:40): Registro de frequência e acompanhamento pedagógico'
  ],
  Quinta: [
    'Janela de Módulo (10:40-11:30): Configuração de ambientes virtuais e bancos de dados para o laboratório',
    'Janela de Módulo (10:40-11:30): Planejamento das atividades de Arquitetura de Computadores e Web Java',
    'Janela de Módulo (10:40-11:30): Organização de materiais didáticos e apoio individual'
  ],
  Segunda: [
    'Janela de Módulo (14:10-15:00): Organização de conteúdo web e preparação de laboratório',
    'Janela de Módulo (14:10-15:00): Planejamento pedagógico e alinhamento curricular'
  ],
  Sexta: [
    'Janela de Módulo (12:30-13:20): Fechamento semanal das atividades e diário de classe',
    'Janela de Módulo (12:30-13:20): Revisão dos projetos práticos dos estudantes de TI'
  ]
};

export default function ModuleReport({ slots }: ModuleReportProps) {
  // Navigation inside the Module Report
  const [activeTab, setActiveTab] = useState<'folha' | 'semanal' | 'impressao'>('folha');

  // Filters
  const [selectedDayFilter, setSelectedDayFilter] = useState<'todos' | 'Terça' | 'Quarta' | 'Quinta' | 'Segunda' | 'Sexta'>('todos');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [filterOnlyLetivos, setFilterOnlyLetivos] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Local storage for signatures and custom activities
  const [signatures, setSignatures] = useState<Record<string, { isSigned: boolean; activity?: string; notes?: string }>>(() => {
    try {
      const saved = localStorage.getItem('agenda_modulo_signatures_v2');
      if (saved) return JSON.parse(saved);
      // Fallback to v1 if present
      const oldSaved = localStorage.getItem('agenda_modulo_signatures');
      return oldSaved ? JSON.parse(oldSaved) : {};
    } catch {
      return {};
    }
  });

  const saveSignatures = (newSignatures: Record<string, { isSigned: boolean; activity?: string; notes?: string }>) => {
    setSignatures(newSignatures);
    localStorage.setItem('agenda_modulo_signatures_v2', JSON.stringify(newSignatures));
  };

  const handleToggleSign = (entryId: string) => {
    const current = signatures[entryId] || { isSigned: false };
    const updated = {
      ...signatures,
      [entryId]: {
        ...current,
        isSigned: !current.isSigned
      }
    };
    saveSignatures(updated);
  };

  const handleUpdateActivity = (entryId: string, activity: string) => {
    const current = signatures[entryId] || { isSigned: false };
    const updated = {
      ...signatures,
      [entryId]: {
        ...current,
        activity
      }
    };
    saveSignatures(updated);
  };

  // Generate chronological Module and Window entries from Feb 1, 2026 to current date
  const moduleEntries = useMemo(() => {
    const entries: ModuleDiaryEntry[] = [];
    const startDate = new Date(2026, 1, 1); // 2026-02-01
    const today = new Date(); // Current date (2026-09-29 or now)
    
    const currentCursor = new Date(startDate);

    while (currentCursor <= today) {
      const dayOfWeekIndex = currentCursor.getDay(); // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab
      
      // Match any of our fixed module slot definitions
      const matchingSlotDefs = FIXED_MODULE_SCHEDULES.filter(s => s.dayIndex === dayOfWeekIndex);

      if (matchingSlotDefs.length > 0) {
        const y = currentCursor.getFullYear();
        const m = (currentCursor.getMonth() + 1).toString().padStart(2, '0');
        const d = currentCursor.getDate().toString().padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;
        const formattedDate = `${d}/${m}/${y}`;
        
        const special = SPECIAL_DATES_2026[dateStr];
        const isHolidayOrRecess = special && ['FN', 'FM', 'R', 'F'].includes(special.type);

        matchingSlotDefs.forEach((slotDef) => {
          const entryId = `${dateStr}_${slotDef.dayOfWeek}_${slotDef.startTime.replace(':', '')}`;
          const userSig = signatures[entryId] || signatures[dateStr]; // backwards compat
          
          const defaultList = DEFAULT_ACTIVITIES[slotDef.dayOfWeek] || DEFAULT_ACTIVITIES['Terça'];
          const defaultActivity = isHolidayOrRecess
            ? `Módulo dispensado / compensado devido a: ${special.name}`
            : defaultList[entries.length % defaultList.length];

          entries.push({
            id: entryId,
            dateStr,
            dayOfWeek: slotDef.dayOfWeek,
            formattedDate,
            startTime: slotDef.startTime,
            endTime: slotDef.endTime,
            durationLabel: slotDef.durationLabel,
            hoursDec: slotDef.hoursDec,
            availableWindow: slotDef.availableRange || `${slotDef.startTime} às ${slotDef.endTime}`,
            activity: userSig?.activity || defaultActivity,
            slotType: slotDef.type,
            slotTitle: slotDef.title,
            isSpecialDay: Boolean(special),
            specialDayInfo: special,
            isSigned: Boolean(userSig?.isSigned),
            notes: userSig?.notes || ''
          });
        });
      }

      currentCursor.setDate(currentCursor.getDate() + 1);
    }

    // Sort chronologically ascending
    return entries.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  }, [signatures]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return moduleEntries.filter(entry => {
      // Day filter
      if (selectedDayFilter !== 'todos' && entry.dayOfWeek !== selectedDayFilter) {
        return false;
      }
      // Month filter
      if (selectedMonth !== 'all') {
        const entryMonth = entry.dateStr.split('-')[1];
        if (entryMonth !== selectedMonth) return false;
      }
      // Only letivos filter
      if (filterOnlyLetivos) {
        if (entry.specialDayInfo && ['FN', 'FM', 'R', 'F'].includes(entry.specialDayInfo.type)) {
          return false;
        }
      }
      return true;
    });
  }, [moduleEntries, selectedDayFilter, selectedMonth, filterOnlyLetivos]);

  // Comprehensive Statistics
  const stats = useMemo(() => {
    const totalEntries = moduleEntries.length;
    const letivoEntries = moduleEntries.filter(e => !(e.specialDayInfo && ['FN', 'FM', 'R', 'F'].includes(e.specialDayInfo.type)));
    const signedCount = moduleEntries.filter(e => e.isSigned).length;
    
    // Tuesdays specifically (2 hours each)
    const tuesdays = moduleEntries.filter(e => e.dayOfWeek === 'Terça');
    const letivoTuesdays = tuesdays.filter(e => !(e.specialDayInfo && ['FN', 'FM', 'R', 'F'].includes(e.specialDayInfo.type)));
    const tuesdayHours = letivoTuesdays.length * 2;

    // Wednesdays (09:50-10:40)
    const wednesdays = moduleEntries.filter(e => e.dayOfWeek === 'Quarta');
    const letivoWednesdays = wednesdays.filter(e => !(e.specialDayInfo && ['FN', 'FM', 'R', 'F'].includes(e.specialDayInfo.type)));

    // Thursdays (10:40-11:30)
    const thursdays = moduleEntries.filter(e => e.dayOfWeek === 'Quinta');
    const letivoThursdays = thursdays.filter(e => !(e.specialDayInfo && ['FN', 'FM', 'R', 'F'].includes(e.specialDayInfo.type)));

    return {
      totalEntries,
      letivoEntriesCount: letivoEntries.length,
      signedCount,
      letivoTuesdaysCount: letivoTuesdays.length,
      tuesdayHours,
      letivoWednesdaysCount: letivoWednesdays.length,
      letivoThursdaysCount: letivoThursdays.length
    };
  }, [moduleEntries]);

  // Weekly classes and free slots analysis
  const weeklyAnalysis = useMemo(() => {
    const days: DayOfWeek[] = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
    
    return days.map(day => {
      const daySlots = slots.filter(s => s.day === day);
      const teacherClasses = daySlots.filter(s => s.isTeacher);
      
      let moduleWindow = '';
      let freeWindows: { time: string; label: string; isFixedSignature: boolean }[] = [];
      let summary = '';

      if (day === 'Segunda') {
        freeWindows = [
          { time: '07:00 - 10:40', label: 'Manhã livre antes da 5ª aula (POO Java)', isFixedSignature: false },
          { time: '14:10 - 15:00', label: 'Janela de Módulo / Planejamento Vespertino', isFixedSignature: true }
        ];
        summary = '4 aulas ministradas + 1 janela de módulo vespertina fixa das 14:10 às 15:00.';
      } else if (day === 'Terça') {
        moduleWindow = '14:10 às 16:00 (Período de Módulo na Escola • 2 horas regulamentares)';
        freeWindows = [
          { time: '07:00 - 14:10', label: 'Sem aulas em sala de aula', isFixedSignature: false },
          { time: '14:10 - 16:00', label: 'HORÁRIO OFICIAL DE MÓDULO (2h para Assinatura)', isFixedSignature: true }
        ];
        summary = 'Dia oficial de dedicação ao Módulo Pedagógico (2 horas presenciais fixadas das 14:10 às 16:00 para assinatura no diário).';
      } else if (day === 'Quarta') {
        freeWindows = [
          { time: '07:00 - 09:50', label: 'Manhã livre antes da janela', isFixedSignature: false },
          { time: '09:50 - 10:40', label: 'HORÁRIO FIXO DE JANELA DE MÓDULO (Para Assinatura no Diário)', isFixedSignature: true },
          { time: '10:40 - 11:30', label: 'Intervalo de transição para o turno da tarde', isFixedSignature: false }
        ];
        summary = 'Janela de módulo fixa de 09:50 a 10:40 + 4 aulas consecutivas à tarde (12:30 às 15:50).';
      } else if (day === 'Quinta') {
        freeWindows = [
          { time: '07:00 - 10:40', label: 'Manhã livre antes da janela', isFixedSignature: false },
          { time: '10:40 - 11:30', label: 'HORÁRIO FIXO DE JANELA DE MÓDULO (Para Assinatura no Diário)', isFixedSignature: true },
          { time: '14:10 - 15:00', label: 'Janela de Módulo Vespertina (entre Lab. Web e Web Java)', isFixedSignature: false }
        ];
        summary = 'Janela de módulo matutina fixa de 10:40 a 11:30 + 3 aulas à tarde (12:30 às 15:50) + janela às 14:10.';
      } else if (day === 'Sexta') {
        freeWindows = [
          { time: '07:00 - 09:50', label: 'Manhã livre antes das 2 primeiras aulas', isFixedSignature: false },
          { time: '12:30 - 13:20', label: 'Janela de Módulo Vespertina (início do turno da tarde)', isFixedSignature: true }
        ];
        summary = '5 aulas ministradas (2 de manhã + 3 à tarde) + 1 janela de módulo às 12:30.';
      }

      return {
        day,
        totalClasses: teacherClasses.length,
        classes: teacherClasses,
        moduleWindow,
        freeWindows,
        summary
      };
    });
  }, [slots]);

  // Copy table to clipboard
  const handleCopyTable = () => {
    const lines = [
      'RELATÓRIO DE MÓDULO E JANELAS - E.E. MARIA BARBOSA LEITE',
      'Data\tDia\tHorário de Início\tHorário de Término\tCarga Horária\tMódulo / Janela\tAtividade Realizada\tSituação Escolar\tAssinatura',
      ...filteredEntries.map(e => 
        `${e.formattedDate}\t${e.dayOfWeek}\t${e.startTime}\t${e.endTime}\t${e.durationLabel}\t${e.slotTitle}\t${e.activity}\t${e.specialDayInfo?.name || 'Dia Letivo Normal'}\t${e.isSigned ? 'Assinado' : 'Pendente'}`
      )
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    });
  };

  // Direct print function
  const handlePrint = () => {
    window.print();
  };

  // Export PDF via html2pdf
  const handleExportPDF = () => {
    const element = document.getElementById('printable-module-report');
    if (!element) return;

    const opt = {
      margin:       [8, 8, 8, 8],
      filename:     `Relatorio_Modulo_Janelas_Diario_Professor_TI_${new Date().getFullYear()}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    try {
      const pdfExporter = (html2pdf as any)?.default || html2pdf;
      if (typeof pdfExporter === 'function') {
        pdfExporter().from(element).set(opt).save();
      } else {
        window.print();
      }
    } catch (err) {
      console.warn('Erro ao exportar via html2pdf, disparando impressão nativa:', err);
      window.print();
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner Card: Report Title and Header */}
      <div className="bg-white dark:bg-slate-900 border-2 border-purple-900 dark:border-purple-800 p-5 shadow-[2px_2px_0px_0px_rgba(88,28,135,1)] dark:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 font-mono font-black text-[10px] px-2 py-0.5 border border-purple-200 dark:border-purple-800 uppercase tracking-widest">
                Documento Oficial de Registro & Diário
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                Resolução SEE/MG • Ano Letivo 2026
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-purple-950 dark:text-purple-100 uppercase tracking-tight font-sans">
              Relatório de Módulo e Janelas da Semana para Assinatura
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Quadro consolidado de todas as aulas da semana transformando os horários vagos e janelas em horários oficiais de módulo e trabalho escolar com os <strong>horários de início e término rigorosamente fixados</strong> para assinatura no diário.
            </p>
          </div>

          {/* Quick Print and Export Action Buttons */}
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-900 text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-purple-950 transition-all cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:scale-95"
            >
              <Printer size={14} />
              <span>Imprimir Relatório</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-300 border border-purple-900 dark:border-purple-800 font-mono font-bold text-xs uppercase tracking-wider hover:bg-purple-50 dark:hover:bg-slate-750 transition-all cursor-pointer active:scale-95"
            >
              <Download size={14} />
              <span>Exportar PDF</span>
            </button>
            <button
              onClick={handleCopyTable}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-mono font-bold text-xs uppercase hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer active:scale-95"
            >
              {copiedNotification ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copiedNotification ? 'Copiado!' : 'Copiar Dados'}</span>
            </button>
          </div>
        </div>

        {/* HIGHLIGHT: EXACT FIXED SIGNATURE SCHEDULES IN ACCORDANCE WITH USER REQUEST */}
        <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-300 dark:border-purple-800 font-mono">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-purple-950 dark:text-purple-200 mb-2">
            <Pin size={13} className="text-purple-900 dark:text-purple-400 rotate-45" />
            <span>Horários de Assinatura Fixados para o Módulo & Janelas Escolares:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-[11px]">
            
            {/* Terça */}
            <div className="bg-white dark:bg-slate-850 p-2 border-l-4 border-emerald-600 dark:border-emerald-500 shadow-2xs">
              <div className="flex justify-between items-center">
                <span className="font-black text-emerald-950 dark:text-emerald-300 uppercase">Terça-feira (Oficial)</span>
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 text-[9px] px-1 font-bold">2 Horas</span>
              </div>
              <div className="text-emerald-900 dark:text-emerald-200 font-black text-xs mt-0.5">
                Início: 14:10 | Término: 16:00
              </div>
              <span className="text-[9.5px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Horário fixo corrigido: 14:10 às 16:00 para assinatura no diário
              </span>
            </div>

            {/* Quarta */}
            <div className="bg-white dark:bg-slate-850 p-2 border-l-4 border-amber-500 dark:border-amber-400 shadow-2xs">
              <div className="flex justify-between items-center">
                <span className="font-black text-amber-950 dark:text-amber-300 uppercase">Quarta-feira (Janela)</span>
                <span className="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-[9px] px-1 font-bold">50 min</span>
              </div>
              <div className="text-amber-900 dark:text-amber-200 font-black text-xs mt-0.5">
                Início: 09:50 | Término: 10:40
              </div>
              <span className="text-[9.5px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Janela matutina de módulo antes das aulas da tarde
              </span>
            </div>

            {/* Quinta */}
            <div className="bg-white dark:bg-slate-850 p-2 border-l-4 border-purple-600 dark:border-purple-400 shadow-2xs">
              <div className="flex justify-between items-center">
                <span className="font-black text-purple-950 dark:text-purple-300 uppercase">Quinta-feira (Janela)</span>
                <span className="bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 text-[9px] px-1 font-bold">50 min</span>
              </div>
              <div className="text-purple-900 dark:text-purple-200 font-black text-xs mt-0.5">
                Início: 10:40 | Término: 11:30
              </div>
              <span className="text-[9.5px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Janela matutina de módulo (+ janela vespertina 14:10-15:00)
              </span>
            </div>

            {/* Segunda */}
            <div className="bg-white dark:bg-slate-850 p-2 border-l-4 border-indigo-500 dark:border-indigo-400 shadow-2xs">
              <div className="flex justify-between items-center">
                <span className="font-black text-indigo-950 dark:text-indigo-300 uppercase">Segunda-feira (Janela)</span>
                <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300 text-[9px] px-1 font-bold">50 min</span>
              </div>
              <div className="text-indigo-900 dark:text-indigo-200 font-black text-xs mt-0.5">
                Início: 14:10 | Término: 15:00
              </div>
              <span className="text-[9.5px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Janela vespertina de módulo (entre HTML/CSS e Arq. Comput)
              </span>
            </div>

            {/* Sexta */}
            <div className="bg-white dark:bg-slate-850 p-2 border-l-4 border-cyan-600 dark:border-cyan-400 shadow-2xs">
              <div className="flex justify-between items-center">
                <span className="font-black text-cyan-950 dark:text-cyan-300 uppercase">Sexta-feira (Janela)</span>
                <span className="bg-cyan-100 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-300 text-[9px] px-1 font-bold">50 min</span>
              </div>
              <div className="text-cyan-900 dark:text-cyan-200 font-black text-xs mt-0.5">
                Início: 12:30 | Término: 13:20
              </div>
              <span className="text-[9.5px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Janela vespertina de módulo (início do turno da tarde)
              </span>
            </div>

            {/* Totals */}
            <div className="bg-purple-950 text-white p-2 flex flex-col justify-center">
              <span className="text-[9px] uppercase font-bold text-purple-200">Período de Execução</span>
              <span className="font-black text-xs mt-0.5">Fevereiro a {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
              <span className="text-[9px] text-purple-300 mt-0.5">{stats.letivoEntriesCount} registros letivos gerados</span>
            </div>

          </div>
        </div>

      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b-2 border-purple-900 dark:border-purple-800 gap-2 font-mono text-xs select-none">
        <button
          onClick={() => setActiveTab('folha')}
          className={`py-2 px-4 font-black uppercase tracking-wider transition-all cursor-pointer border-t-2 border-x-2 -mb-[2px] ${
            activeTab === 'folha'
              ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-300 border-slate-300 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-slate-750'
          }`}
        >
          📋 Folha de Assinatura do Diário (Fev até Hoje)
        </button>

        <button
          onClick={() => setActiveTab('semanal')}
          className={`py-2 px-4 font-black uppercase tracking-wider transition-all cursor-pointer border-t-2 border-x-2 -mb-[2px] ${
            activeTab === 'semanal'
              ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-300 border-slate-300 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-slate-750'
          }`}
        >
          ⏱️ Quadro Semanal: Aulas x Horários do Módulo e Janelas
        </button>

        <button
          onClick={() => setActiveTab('impressao')}
          className={`py-2 px-4 font-black uppercase tracking-wider transition-all cursor-pointer border-t-2 border-x-2 -mb-[2px] ${
            activeTab === 'impressao'
              ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-300 border-slate-300 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-slate-750'
          }`}
        >
          🖨️ Prévia de Impressão Oficial (A4)
        </button>
      </div>

      {/* TAB 1: FOLHA DE ASSINATURA DO DIÁRIO */}
      {activeTab === 'folha' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Controls Bar: Day filter, Month filter, Letivo filter */}
          <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 p-3 space-y-3 shadow-xs font-mono">
            
            {/* Top row: Day of week filter buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className="font-bold text-purple-950 dark:text-purple-300 uppercase mr-1 flex items-center gap-1">
                <Filter size={11} />
                Visualizar no Diário:
              </span>
              {[
                { label: 'Todos os Horários de Módulo e Janelas', val: 'todos' },
                { label: 'Terça (Módulo 14:10 - 16:00)', val: 'Terça' },
                { label: 'Quarta (Janela 09:50 - 10:40)', val: 'Quarta' },
                { label: 'Quinta (Janela 10:40 - 11:30)', val: 'Quinta' },
                { label: 'Segunda (Janela 14:10 - 15:00)', val: 'Segunda' },
                { label: 'Sexta (Janela 12:30 - 13:20)', val: 'Sexta' }
              ].map(item => (
                <button
                  key={item.val}
                  onClick={() => setSelectedDayFilter(item.val as any)}
                  className={`py-1 px-2.5 border font-bold uppercase transition-all cursor-pointer ${
                    selectedDayFilter === item.val
                      ? 'bg-purple-900 text-white border-purple-950 font-black shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-250 dark:border-slate-700 hover:bg-purple-100/40'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Bottom row: Month picker and checkbox */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px]">
              
              <div className="flex items-center flex-wrap gap-1">
                <span className="font-bold text-slate-500 dark:text-slate-400 mr-1 uppercase">Mês:</span>
                {[
                  { label: 'Todos', val: 'all' },
                  { label: 'Fev', val: '02' },
                  { label: 'Mar', val: '03' },
                  { label: 'Abr', val: '04' },
                  { label: 'Mai', val: '05' },
                  { label: 'Jun', val: '06' },
                  { label: 'Jul', val: '07' },
                  { label: 'Ago', val: '08' },
                  { label: 'Set', val: '09' }
                ].map(item => (
                  <button
                    key={item.val}
                    onClick={() => setSelectedMonth(item.val)}
                    className={`py-0.5 px-2 border font-bold uppercase transition-all cursor-pointer ${
                      selectedMonth === item.val
                        ? 'bg-purple-900 text-white border-purple-950 font-black'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-250 dark:border-slate-700 hover:bg-purple-100/40'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-bold shrink-0">
                <input
                  type="checkbox"
                  checked={filterOnlyLetivos}
                  onChange={(e) => setFilterOnlyLetivos(e.target.checked)}
                  className="rounded border-purple-300 text-purple-900 focus:ring-purple-900"
                />
                <span>Ocultar feriados e recessos</span>
              </label>

            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-slate-900 border-2 border-purple-900 dark:border-purple-800 shadow-[1px_1px_0px_0px_rgba(88,28,135,1)] dark:shadow-none overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-purple-950 text-white font-mono text-[10px] uppercase tracking-wider border-b border-purple-900">
                  <th className="py-2.5 px-3 w-10 text-center">Status</th>
                  <th className="py-2.5 px-3 w-28">Data</th>
                  <th className="py-2.5 px-3 w-24">Dia</th>
                  <th className="py-2.5 px-3 w-36">Horário de Assinatura</th>
                  <th className="py-2.5 px-3 w-28">Tipo de Horário</th>
                  <th className="py-2.5 px-3">Atividade de Módulo Realizada / Registro no Diário</th>
                  <th className="py-2.5 px-3 w-36">Situação Escolar</th>
                  <th className="py-2.5 px-3 w-28 text-center">Rubrica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-mono">
                      Nenhum registro encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => {
                    const isHoliday = entry.specialDayInfo && ['FN', 'FM', 'R', 'F'].includes(entry.specialDayInfo.type);
                    const isTuesday = entry.dayOfWeek === 'Terça';

                    return (
                      <tr 
                        key={entry.id}
                        className={`transition-colors font-sans ${
                          entry.isSigned 
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20' 
                            : isHoliday 
                            ? 'bg-amber-50/50 dark:bg-amber-950/20 opacity-75' 
                            : isTuesday 
                            ? 'bg-purple-50/30 dark:bg-purple-950/15 hover:bg-purple-50/60' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        {/* Checkbox for signing */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => handleToggleSign(entry.id)}
                            title={entry.isSigned ? 'Desmarcar assinatura' : 'Marcar como rubricado no diário'}
                            className="text-purple-900 dark:text-purple-300 hover:scale-110 transition-transform cursor-pointer"
                          >
                            {entry.isSigned ? (
                              <CheckSquare size={17} className="text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Square size={17} className="text-slate-400 dark:text-slate-600" />
                            )}
                          </button>
                        </td>

                        {/* Date */}
                        <td className="py-2.5 px-3 font-mono font-black text-purple-950 dark:text-purple-200 whitespace-nowrap">
                          {entry.formattedDate}
                        </td>

                        {/* Weekday */}
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 dark:text-slate-300 font-bold">
                          {entry.dayOfWeek}-feira
                        </td>

                        {/* Fixed Signature Hours */}
                        <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                          {isHoliday ? (
                            <span className="text-slate-400 italic">Dispensado</span>
                          ) : (
                            <span className={`px-2 py-0.5 border font-bold text-[11px] ${
                              isTuesday
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                : 'bg-purple-50 dark:bg-purple-950 text-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                            }`}>
                              {entry.startTime} às {entry.endTime}
                            </span>
                          )}
                        </td>

                        {/* Slot Type */}
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[10px]">
                          <span className={`px-1.5 py-0.5 border font-bold uppercase ${
                            isTuesday 
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300'
                          }`}>
                            {isTuesday ? 'Módulo (2h)' : `Janela (${entry.durationLabel})`}
                          </span>
                        </td>

                        {/* Activity Description */}
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={entry.activity}
                            disabled={isHoliday}
                            onChange={(e) => handleUpdateActivity(entry.id, e.target.value)}
                            className={`w-full text-[11px] px-2 py-1 border rounded-none focus:outline-none transition-colors ${
                              isHoliday 
                                ? 'bg-transparent border-transparent text-slate-500 italic' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-purple-900 dark:focus:border-purple-500 text-slate-800 dark:text-slate-200'
                            }`}
                            placeholder="Descreva a atividade do módulo / trabalho escolar..."
                          />
                        </td>

                        {/* School Calendar Situation */}
                        <td className="py-2.5 px-3">
                          {entry.specialDayInfo ? (
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 font-bold uppercase rounded-none border ${
                                isHoliday 
                                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 border-rose-250 dark:border-rose-900' 
                                  : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border-indigo-250 dark:border-indigo-900'
                              }`}>
                                {entry.specialDayInfo.type}
                              </span>
                              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium truncate max-w-[130px]" title={entry.specialDayInfo.name}>
                                {entry.specialDayInfo.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-mono font-bold flex items-center gap-1">
                              <CheckCircle2 size={11} />
                              Letivo Normal
                            </span>
                          )}
                        </td>

                        {/* Signature Column */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {entry.isSigned ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 border border-emerald-300 dark:border-emerald-800">
                              <Check size={11} strokeWidth={3} />
                              Rubricado
                            </span>
                          ) : isHoliday ? (
                            <span className="text-[10px] font-mono text-slate-400 italic">
                              Não se aplica
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-purple-900/60 dark:text-purple-400/60 border-b border-dotted border-purple-900/40 dark:border-purple-400/40 pb-0.5">
                              _________________
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Notice about fixed hours */}
          <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 p-3 text-xs text-purple-950 dark:text-purple-300 flex items-start gap-2.5">
            <Info size={16} className="shrink-0 mt-0.5 text-purple-900 dark:text-purple-400" />
            <div className="leading-relaxed">
              <strong>Horários de Assinatura no Diário Fixados com Sucesso:</strong> Terça-feira (14:10 às 16:00), Quarta-feira (janela das 09:50 às 10:40), Quinta-feira (janela das 10:40 às 11:30), Segunda-feira (janela das 14:10 às 15:00) e Sexta-feira (janela das 12:30 às 13:20). Todos os horários estão sincronizados com as datas do calendário letivo desde o início de fevereiro até hoje para comprovação oficial.
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: QUADRO SEMANAL - AULAS X HORÁRIOS DO MÓDULO E JANELAS */}
      {activeTab === 'semanal' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          <div className="bg-white dark:bg-slate-900 border-2 border-purple-900 dark:border-purple-800 p-4 shadow-[1.5px_1.5px_0px_0px_rgba(88,28,135,1)] dark:shadow-none">
            <h2 className="text-base font-black text-purple-950 dark:text-purple-100 uppercase tracking-tight font-sans mb-1">
              Quadro Semanal: Todas as Aulas Ministradas vs. Horários de Módulo e Janelas
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              Demonstrativo completo de cada dia da semana com horários de início e término das aulas e a conversão de todos os horários vagos em <strong>horários oficiais de módulo e trabalho escolar na escola</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {weeklyAnalysis.map((item) => {
                const isTuesday = item.day === 'Terça';

                return (
                  <div 
                    key={item.day}
                    className={`border-2 flex flex-col justify-between ${
                      isTuesday 
                        ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-[2px_2px_0px_0px_rgba(5,150,105,1)]' 
                        : 'border-purple-900 dark:border-purple-800 bg-white dark:bg-slate-850'
                    }`}
                  >
                    {/* Day Header */}
                    <div className={`p-2.5 border-b font-mono ${
                      isTuesday 
                        ? 'bg-emerald-700 text-white border-emerald-800' 
                        : 'bg-purple-900 text-white border-purple-950'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs uppercase">{item.day}-feira</span>
                        <span className="text-[9px] font-bold bg-white/20 px-1.5 py-0.5 rounded-none">
                          {isTuesday ? 'MÓDULO 2H' : `${item.totalClasses} Aulas`}
                        </span>
                      </div>
                    </div>

                    {/* Classes Content */}
                    <div className="p-3 space-y-3 flex-1">
                      
                      {/* Classes Section */}
                      <div>
                        <span className="text-[9px] font-mono font-black uppercase text-purple-900 dark:text-purple-300 block mb-1">
                          Aulas em Sala:
                        </span>
                        {item.classes.length === 0 ? (
                          <div className="p-2 bg-emerald-100/60 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 font-bold">
                            Sem aulas em sala.
                            <span className="block text-[9.5px] font-normal mt-0.5">
                              Dia 100% dedicado ao Módulo Pedagógico na escola (2 horas regulamentares).
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {item.classes.map((cls, idx) => (
                              <div key={idx} className="p-1.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-[10px]">
                                <div className="flex justify-between font-mono font-bold text-purple-950 dark:text-purple-200">
                                  <span>{cls.time}</span>
                                  <span className="bg-purple-200 dark:bg-purple-800 px-1 text-[8.5px]">{cls.turma}</span>
                                </div>
                                <div className="font-bold text-purple-900 dark:text-purple-300 mt-0.5 uppercase truncate" title={cls.materia}>
                                  {cls.materia}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Free Windows transformed into Module Section */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                        <span className="text-[9px] font-mono font-black uppercase text-amber-900 dark:text-amber-400 block mb-1">
                          Horários do Módulo / Assinatura:
                        </span>
                        <div className="space-y-1.5">
                          {item.freeWindows.map((fw, idx) => (
                            <div key={idx} className={`p-1.5 border text-[9.5px] leading-tight ${
                              fw.isFixedSignature
                                ? 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-400 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 font-bold shadow-3xs'
                                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium'
                            }`}>
                              <div className="font-mono font-black text-purple-950 dark:text-purple-200 text-[10px]">
                                {fw.time}
                              </div>
                              <div className="mt-0.5">{fw.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Footer Summary of the Day */}
                    <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-[9.5px] text-slate-600 dark:text-slate-400 font-sans leading-tight">
                      {item.summary}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Consolidated Summary Table of All Classes and Module Times */}
          <div className="bg-white dark:bg-slate-900 border-2 border-purple-900 dark:border-purple-800 p-4 shadow-[1.5px_1.5px_0px_0px_rgba(88,28,135,1)] dark:shadow-none">
            <h3 className="text-sm font-black text-purple-950 dark:text-purple-100 uppercase tracking-tight font-sans mb-3 flex items-center gap-1.5">
              <Clock size={16} className="text-purple-900 dark:text-purple-400" />
              Tabela Síntese: Horários de Início, Término e Janelas de Módulo
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[10px] uppercase border-b border-slate-300 dark:border-slate-700">
                    <th className="py-2.5 px-3">Dia da Semana</th>
                    <th className="py-2.5 px-3">Aulas Ministradas</th>
                    <th className="py-2.5 px-3">Horário Fixo de Módulo (Assinatura)</th>
                    <th className="py-2.5 px-3">Janela de Permanência / Escola</th>
                    <th className="py-2.5 px-3">Finalidade no Diário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans">
                  
                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold text-purple-950 dark:text-purple-200">Segunda-feira</td>
                    <td className="py-2.5 px-3 text-[11px]">
                      10:40-11:30 (POO Java) • 12:30-13:20 (Web II) • 13:20-14:10 (HTML/CSS) • 15:00-15:50 (Arq. Comput)
                    </td>
                    <td className="py-2.5 px-3 text-[11px] font-mono text-purple-950 dark:text-purple-200 font-bold bg-purple-50/50 dark:bg-purple-950/20">
                      14:10 às 15:00 (50 min)
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600 dark:text-slate-400">Entre 2ª e 4ª aula vespertina</td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-700 dark:text-slate-300">Janela de Módulo / Planejamento</td>
                  </tr>

                  <tr className="bg-emerald-50/50 dark:bg-emerald-950/25">
                    <td className="py-2.5 px-3 font-mono font-black text-emerald-950 dark:text-emerald-300">
                      Terça-feira (OFICIAL)
                    </td>
                    <td className="py-2.5 px-3 text-[11px] italic text-emerald-800 dark:text-emerald-400 font-bold">
                      Sem aulas em sala
                    </td>
                    <td className="py-2.5 px-3 text-[11px] font-mono font-black text-emerald-950 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/40">
                      14:10 às 16:00 (2 Horas Fixo)
                    </td>
                    <td className="py-2.5 px-3 text-[11px] font-mono font-bold text-emerald-900 dark:text-emerald-300">
                      14:10 às 16:00 (Horário oficial corrigido)
                    </td>
                    <td className="py-2.5 px-3 text-[11px] font-bold text-emerald-950 dark:text-emerald-200">
                      Horário Oficial de Assinatura do Módulo (2h)
                    </td>
                  </tr>

                  <tr className="bg-amber-50/40 dark:bg-amber-950/20">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-950 dark:text-amber-300">Quarta-feira</td>
                    <td className="py-2.5 px-3 text-[11px]">
                      12:30-13:20 (POO Java) • 13:20-14:10 (Software) • 14:10-15:00 (Web II) • 15:00-15:50 (Sist. Operac)
                    </td>
                    <td className="py-2.5 px-3 text-[11px] font-mono text-amber-950 dark:text-amber-200 font-black bg-amber-100 dark:bg-amber-900/40">
                      09:50 às 10:40 (50 min Fixo)
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600 dark:text-slate-400">Janela matutina pré-vespertino</td>
                    <td className="py-2.5 px-3 text-[11px] font-bold text-amber-950 dark:text-amber-200">
                      Horário Fixo de Módulo / Janela no Diário
                    </td>
                  </tr>

                  <tr className="bg-purple-50/40 dark:bg-purple-950/20">
                    <td className="py-2.5 px-3 font-mono font-bold text-purple-950 dark:text-purple-300">Quinta-feira</td>
                    <td className="py-2.5 px-3 text-[11px]">
                      12:30-13:20 (Arq. Comput) • 13:20-14:10 (Lab. Web) • 15:00-15:50 (Web Java)
                    </td>
                    <td className="py-2.5 px-3 text-[11px] font-mono text-purple-950 dark:text-purple-200 font-black bg-purple-100 dark:bg-purple-900/40">
                      10:40 às 11:30 (50 min Fixo)
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600 dark:text-slate-400">
                      Matutino (10:40-11:30) e Vespertino (14:10-15:00)
                    </td>
                    <td className="py-2.5 px-3 text-[11px] font-bold text-purple-950 dark:text-purple-200">
                      Horário Fixo de Módulo / Janela no Diário
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold text-purple-950 dark:text-purple-200">Sexta-feira</td>
                    <td className="py-2.5 px-3 text-[11px]">
                      09:50-10:40 (SO) • 10:40-11:30 (Software) • 13:20-14:10 (Web Java) • 14:10-15:00 (Lab. Web) • 15:00-15:50 (POO Java)
                    </td>
                    <td className="py-2.5 px-3 text-[11px] font-mono text-purple-950 dark:text-purple-200 font-bold bg-purple-50/50 dark:bg-purple-950/20">
                      12:30 às 13:20 (50 min)
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600 dark:text-slate-400">Início do turno vespertino</td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-700 dark:text-slate-300">Janela de Módulo / Fechamento Semanal</td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: PRÉVIA DE IMPRESSÃO OFICIAL (A4 FORMAT) */}
      {activeTab === 'impressao' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 p-3">
            <div className="flex items-center gap-2">
              <Printer size={16} className="text-purple-900 dark:text-purple-300" />
              <span className="text-xs font-mono font-bold text-purple-950 dark:text-purple-200">
                Layout oficial com os horários fixados de assinatura, pronto para impressão e anexo ao Diário de Classe.
              </span>
            </div>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-purple-900 text-white font-mono font-bold text-xs uppercase hover:bg-purple-950 cursor-pointer shadow-xs"
            >
              Imprimir Agora
            </button>
          </div>

          {/* Printable Container with styling for standard paper */}
          <div 
            id="printable-module-report"
            className="bg-white text-slate-900 p-8 border border-slate-300 shadow-lg max-w-4xl mx-auto font-sans"
            style={{ minHeight: '1100px' }}
          >
            {/* Header Document */}
            <div className="border-b-2 border-purple-950 pb-4 mb-5 text-center">
              <p className="text-[10px] font-mono font-black uppercase text-purple-950 tracking-widest">
                Governo do Estado de Minas Gerais • Secretaria de Estado de Educação (SEE/MG)
              </p>
              <h2 className="text-lg font-black uppercase text-purple-950 tracking-tight mt-1 font-sans">
                Escola Estadual Maria Barbosa Leite • Varzelândia/MG
              </h2>
              <p className="text-xs font-mono font-bold uppercase text-purple-800 tracking-wider mt-0.5">
                Curso Técnico em Informática Integrado ao Ensino Médio
              </p>
              <h1 className="text-base font-serif font-black uppercase text-slate-900 mt-2 bg-purple-50 py-1.5 border border-purple-200">
                Folha Oficial de Cumprimento de Módulo e Janelas Pedagógicas
              </h1>
              <p className="text-[9px] font-mono text-slate-600 mt-1">
                Documento de comprovação para assinatura e anexo ao Diário de Classe • Exercício Letivo 2026
              </p>
            </div>

            {/* Docente and Schedule Info with Fixed Times */}
            <div className="border border-slate-300 p-3 bg-slate-50 mb-5 font-sans text-[10.5px]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Cargo / Componente:</strong> Professor de Educação Básica (TI)</p>
                  <p><strong>Turmas Atendidas:</strong> 2º Ano INT e 3º Ano INT (Informática)</p>
                  <p><strong>Total de Aulas Semanais:</strong> 16 Aulas Ministradas</p>
                </div>
                <div>
                  <p><strong>Terça-feira (Módulo Oficial):</strong> 14:10 às 16:00 (2 horas • Fixado para assinatura)</p>
                  <p><strong>Quarta-feira (Janela de Módulo):</strong> 09:50 às 10:40 (Fixada para assinatura)</p>
                  <p><strong>Quinta-feira (Janela de Módulo):</strong> 10:40 às 11:30 (Fixada para assinatura)</p>
                </div>
              </div>
            </div>

            {/* Quadro Resumo das Aulas e Janelas com os Horários Fixos */}
            <div className="mb-5">
              <h3 className="text-xs font-mono font-black uppercase text-purple-950 border-b border-purple-300 pb-1 mb-2">
                1. Horários Semanais Fixados para Assinatura no Diário
              </h3>
              <table className="w-full text-left border-collapse text-[10px] border border-slate-300">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-mono uppercase">
                    <th className="p-1.5 border border-slate-300 w-24">Dia</th>
                    <th className="p-1.5 border border-slate-300">Aulas Ministradas em Sala</th>
                    <th className="p-1.5 border border-slate-300 w-44">Horário Fixo para Assinatura</th>
                    <th className="p-1.5 border border-slate-300 w-36">Carga / Modalidade</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-1.5 border border-slate-300 font-bold">Segunda</td>
                    <td className="p-1.5 border border-slate-300">10:40-11:30 • 12:30-13:20 • 13:20-14:10 • 15:00-15:50</td>
                    <td className="p-1.5 border border-slate-300 font-mono font-bold">14:10 às 15:00</td>
                    <td className="p-1.5 border border-slate-300">Janela de Módulo (50 min)</td>
                  </tr>
                  <tr className="bg-purple-50/70 font-medium">
                    <td className="p-1.5 border border-slate-300 font-black text-purple-950">Terça</td>
                    <td className="p-1.5 border border-slate-300 italic font-bold">Sem aulas em sala de aula</td>
                    <td className="p-1.5 border border-slate-300 font-mono font-black text-purple-950">14:10 às 16:00</td>
                    <td className="p-1.5 border border-slate-300 font-bold text-purple-950">Módulo Oficial (2h)</td>
                  </tr>
                  <tr className="bg-amber-50/60 font-medium">
                    <td className="p-1.5 border border-slate-300 font-bold">Quarta</td>
                    <td className="p-1.5 border border-slate-300">12:30-13:20 • 13:20-14:10 • 14:10-15:00 • 15:00-15:50</td>
                    <td className="p-1.5 border border-slate-300 font-mono font-bold text-amber-950">09:50 às 10:40</td>
                    <td className="p-1.5 border border-slate-300 font-bold">Janela de Módulo (50 min)</td>
                  </tr>
                  <tr className="bg-purple-50/60 font-medium">
                    <td className="p-1.5 border border-slate-300 font-bold">Quinta</td>
                    <td className="p-1.5 border border-slate-300">12:30-13:20 • 13:20-14:10 • 15:00-15:50</td>
                    <td className="p-1.5 border border-slate-300 font-mono font-bold text-purple-950">10:40 às 11:30</td>
                    <td className="p-1.5 border border-slate-300 font-bold">Janela de Módulo (50 min)</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border border-slate-300 font-bold">Sexta</td>
                    <td className="p-1.5 border border-slate-300">09:50-10:40 • 10:40-11:30 • 13:20-14:10 • 14:10-15:00 • 15:00-15:50</td>
                    <td className="p-1.5 border border-slate-300 font-mono font-bold">12:30 às 13:20</td>
                    <td className="p-1.5 border border-slate-300">Janela de Módulo (50 min)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Folha Cronológica de Assinaturas */}
            <div className="mb-6">
              <h3 className="text-xs font-mono font-black uppercase text-purple-950 border-b border-purple-300 pb-1 mb-2">
                2. Registro Cronológico para Assinatura (Fevereiro a {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })})
              </h3>
              <table className="w-full text-left border-collapse text-[9.5px] border border-slate-300">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-mono uppercase">
                    <th className="p-1 border border-slate-300 w-16">Data</th>
                    <th className="p-1 border border-slate-300 w-14">Dia</th>
                    <th className="p-1 border border-slate-300 w-24">Horário Fixo</th>
                    <th className="p-1 border border-slate-300 w-12 text-center">Carga</th>
                    <th className="p-1 border border-slate-300">Atividade Realizada / Registro</th>
                    <th className="p-1 border border-slate-300 w-28">Situação</th>
                    <th className="p-1 border border-slate-300 w-24 text-center">Rubrica</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((e) => {
                    const isHoliday = e.specialDayInfo && ['FN', 'FM', 'R', 'F'].includes(e.specialDayInfo.type);

                    return (
                      <tr key={e.id} className={isHoliday ? 'bg-slate-100 text-slate-500' : ''}>
                        <td className="p-1 border border-slate-300 font-mono font-bold">{e.formattedDate}</td>
                        <td className="p-1 border border-slate-300 font-mono">{e.dayOfWeek}</td>
                        <td className="p-1 border border-slate-300 font-mono font-bold">
                          {isHoliday ? '-' : `${e.startTime} - ${e.endTime}`}
                        </td>
                        <td className="p-1 border border-slate-300 font-mono text-center">
                          {isHoliday ? '0h' : e.durationLabel}
                        </td>
                        <td className="p-1 border border-slate-300 text-[9px] leading-tight">
                          {e.activity}
                        </td>
                        <td className="p-1 border border-slate-300 text-[8.5px]">
                          {e.specialDayInfo ? e.specialDayInfo.name : 'Dia Letivo Normal'}
                        </td>
                        <td className="p-1 border border-slate-300 text-center font-mono">
                          {isHoliday ? '---' : e.isSigned ? 'Rubricado [OK]' : '_________________'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Formal Signatures Block */}
            <div className="mt-8 pt-6 border-t border-slate-400 grid grid-cols-2 gap-8 text-center text-xs font-sans">
              <div>
                <div className="w-56 mx-auto border-t border-slate-800 pt-1.5">
                  <p className="font-bold">Assinatura do(a) Professor(a)</p>
                  <p className="text-[10px] text-slate-600 font-mono">Curso Técnico em Informática</p>
                </div>
              </div>
              <div>
                <div className="w-56 mx-auto border-t border-slate-800 pt-1.5">
                  <p className="font-bold">Especialista / Direção Escolar</p>
                  <p className="text-[10px] text-slate-600 font-mono">E.E. Maria Barbosa Leite • SEE/MG</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-[8.5px] font-mono text-slate-500 border-t border-dashed border-slate-300 pt-2">
              Emitido em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')} • Sistema de Gestão Pedagógica Escola Estadual Maria Barbosa Leite
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
