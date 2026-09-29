/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScheduleSlot, TurnoType, DayOfWeek } from './types';
import { INITIAL_SLOTS } from './data';
import FullGrid from './components/FullGrid';
import MySchedule from './components/MySchedule';
import PlanningModal from './components/PlanningModal';
import CalendarView, { SPECIAL_DATES_2026 } from './components/CalendarView';
import StorageManager from './components/StorageManager';
import ModuleReport from './components/ModuleReport';
import { 
  Clock, Search, Calendar, Sparkles, Download, Upload, RotateCcw, 
  Info, Laptop, Smartphone, AlertTriangle, CloudRain, ShieldCheck, CheckSquare,
  Database, HardDrive, Server, ShieldAlert, KeyRound, HelpCircle, Save, Sun, Moon,
  FileText
} from 'lucide-react';

export default function App() {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [viewMode, setViewMode] = useState<'MeuHorario' | 'Completo' | 'Calendario' | 'RelatorioModulo' | 'Armazenamento'>('RelatorioModulo'); // Default to RelatorioModulo to immediately show the requested report!
  const [activeTurno, setActiveTurno] = useState<TurnoType>('Vespertino');
  const [filterTurma, setFilterTurma] = useState<'Todos' | '2º INT' | '3º INT'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());
  const [isMobileSimulated, setIsMobileSimulated] = useState<boolean>(false);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobileScreen(window.innerWidth < 1024);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('agenda_professor_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('agenda_professor_theme', theme);
  }, [theme]);



  const handleDisciplineClick = (disc: string) => {
    if (disc === 'Todas') {
      setSearchQuery('');
    } else {
      setSearchQuery(disc);
    }
  };

  // Auto-dismiss status messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Realtime clock update in Portuguese
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 15000); // Update every 15s is plenty for clock and friendly load
    return () => clearInterval(timer);
  }, []);

  // Fetch from Express API
  const fetchSchedule = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/schedule');
      if (!res.ok) throw new Error('Não foi possível ler os e-mails/arquivos do servidor.');
      const data = await res.json();
      setSlots(data);
    } catch (err) {
      console.warn('Erro ao conectar com servidor API, utilizando salvamento local (offline):', err);
      // Fallback to localStorage or default
      const saved = localStorage.getItem('agenda_professor_slots');
      if (saved) {
        setSlots(JSON.parse(saved));
      } else {
        setSlots(INITIAL_SLOTS);
      }
      setMessage({
        text: 'Visualizando em modo offline. O salvamento local de segurança está ativado.',
        type: 'info'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sync to Express API and localStorage
  const syncSchedule = async (newSlots: ScheduleSlot[]) => {
    setSlots(newSlots);
    localStorage.setItem('agenda_professor_slots', JSON.stringify(newSlots));
    
    setIsSyncing(true);
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSlots),
      });
      if (!res.ok) throw new Error('Falha ao sincronizar com servidor.');
    } catch (err) {
      console.warn('Falha na sincronização online. Dados salvos localmente no navegador:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  // Save selected edited slot
  const handleSaveSlot = (updatedSlot: ScheduleSlot) => {
    const updated = slots.map(s => s.id === updatedSlot.id ? updatedSlot : s);
    syncSchedule(updated);
    setMessage({ text: 'Cronograma e Plano de Aula atualizados com sucesso!', type: 'success' });
  };

  // Check off complete from list
  const handleToggleComplete = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening modal on clicking complete checkbox!
    const updated = slots.map(s => {
      if (s.id === slotId) {
        return { ...s, completed: !s.completed };
      }
      return s;
    });
    syncSchedule(updated);
    const target = updated.find(s => s.id === slotId);
    if (target) {
      setMessage({ 
        text: target.completed 
          ? `Aula de ${target.materia} marcada como ministrada!` 
          : `Aula de ${target.materia} reaberta.`, 
        type: 'success' 
      });
    }
  };

  // Revert all data to original seeds from pictures
  const handleResetData = () => {
    if (window.confirm('Atenção: Isso irá apagar todas as anotações, planos de aulas e marcações atuais para retornar ao cronograma original das imagens. Deseja continuar?')) {
      syncSchedule(INITIAL_SLOTS);
      setMessage({ text: 'Cronograma restaurado com sucesso para os horários das fotos!', type: 'info' });
    }
  };

  // File download backup
  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(slots, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "agenda_professor_informatica.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setMessage({ text: 'Backup exportado! Seu arquivo JSON foi baixado.', type: 'success' });
  };

  // File upload importer
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && 'isTeacher' in parsed[0]) {
          syncSchedule(parsed);
          setMessage({ text: 'Backup importado com sucesso! Seus horários foram carregados.', type: 'success' });
        } else {
          throw new Error('Formato inválido. O arquivo JSON deve ser um backup válido deste aplicativo.');
        }
      } catch (err: any) {
        setMessage({ text: 'Erro ao carregar o backup: ' + err.message, type: 'error' });
      }
    };
    fileReader.readAsText(files[0]);
    e.target.value = ''; // Reset input
  };

  // Format date helper in pt-BR
  const formatFullDate = (date: Date) => {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${dayName}, ${dayNum} de ${monthName} de ${year} - ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  // Get current day name to match "Segunda", "Terça", etc.
  const getCurrentDayPT = (): DayOfWeek => {
    const dayIndex = currentDateTime.getDay();
    const map: { [index: number]: DayOfWeek } = {
      1: 'Segunda',
      2: 'Terça',
      3: 'Quarta',
      4: 'Quinta',
      5: 'Sexta',
    };
    return map[dayIndex] || 'Segunda'; // Fallback to Monday if weekend
  };

  const currentDay = getCurrentDayPT();

  // Quantify accomplishments
  const totalTeacherClasses = slots.filter(s => s.isTeacher).length;
  const doneClasses = slots.filter(s => s.isTeacher && s.completed).length;

  // Format the current date to 'YYYY-MM-DD'
  const y = currentDateTime.getFullYear();
  const m = (currentDateTime.getMonth() + 1).toString().padStart(2, '0');
  const d = currentDateTime.getDate().toString().padStart(2, '0');
  const dateStr = `${y}-${m}-${d}`;
  const todaySpecial = SPECIAL_DATES_2026[dateStr];

  if (isMobileScreen || isMobileSimulated) {
    const renderMobileScreenContent = () => {
      return (
        <div className={`flex-1 bg-slate-50 dark:bg-slate-900 dark:text-slate-100 flex flex-col relative text-[11px] scrollbar-none transition-colors duration-200 ${
          isMobileScreen ? 'min-h-screen w-full pb-24 font-sans' : 'absolute inset-0 pb-16 font-sans'
        }`}>
          
          {/* App native mobile style header */}
          <div className="bg-purple-900 dark:bg-purple-955 text-white px-4 py-3 shrink-0 flex justify-between items-center z-10 border-b border-purple-950 dark:border-purple-900 select-none">
            <div>
              <span className="text-[7.5px] font-black tracking-widest text-purple-200 dark:text-purple-300 uppercase font-mono block">E.E. MARIA BARBOSA LEITE</span>
              <h1 className="text-sm font-serif italic font-bold text-white leading-none mt-0.5">Agenda de Horários</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Theme toggle for mobile */}
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-1.5 shrink-0 bg-purple-950/45 border border-purple-800/80 hover:bg-purple-900/70 text-white cursor-pointer active:scale-95 flex items-center justify-center min-w-[32px] min-h-[32px]"
                title="Alterar Tema"
              >
                {theme === 'light' ? <Moon size={11} className="text-white" /> : <Sun size={11} className="text-amber-400 fill-amber-300" />}
              </button>

              {/* If on PC simulating mobile, allow return to full panel */}
              {!isMobileScreen && isMobileSimulated && (
                <button
                  onClick={() => setIsMobileSimulated(false)}
                  className="p-1.5 shrink-0 bg-purple-950 border border-purple-800 rounded-none text-white font-mono text-[8.5px] font-black uppercase cursor-pointer min-h-[32px]"
                  title="Voltar para painel computador"
                >
                  💻 Desktop
                </button>
              )}

              {/* Status indicator */}
              <div className="bg-purple-955/70 border border-purple-800 px-2 py-1.5 font-mono text-[8.5px] text-purple-200 flex items-center gap-1 select-none">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="hidden xs:inline">Salvo</span>
              </div>
            </div>
          </div>

          {/* Compact Search & Filter Toolbar inside mobile viewport */}
          <div className="bg-white dark:bg-slate-850 border-b border-purple-900/10 dark:border-purple-800/40 p-3 space-y-2.5 shadow-xs shrink-0 font-sans">
            
            <div className="flex items-center justify-between gap-2">
              {/* Turno selector - 44px hit height container */}
              <div className="flex bg-slate-100/90 dark:bg-slate-800 p-0.5 border border-purple-200/50 dark:border-purple-800/60 rounded-none w-1/2">
                <button
                  onClick={() => setActiveTurno('Matutino')}
                  className={`flex-1 py-1.5 uppercase font-mono font-black tracking-wider text-[9px] min-h-[36px] flex items-center justify-center transition-all cursor-pointer ${
                    activeTurno === 'Matutino' ? 'bg-purple-900 text-white' : 'text-purple-955 dark:text-purple-300 hover:bg-purple-100/60'
                  }`}
                >
                  Matur.
                </button>
                <button
                  onClick={() => setActiveTurno('Vespertino')}
                  className={`flex-1 py-1.5 uppercase font-mono font-black tracking-wider text-[9px] min-h-[36px] flex items-center justify-center transition-all cursor-pointer ${
                    activeTurno === 'Vespertino' ? 'bg-purple-900 text-white shadow-3xs' : 'text-purple-955 dark:text-purple-305 hover:bg-purple-100/60'
                  }`}
                >
                  Vesper.
                </button>
              </div>

              {/* Turma selector */}
              <div className="flex bg-slate-100/90 dark:bg-slate-800 p-0.5 border border-purple-200/50 dark:border-purple-800/60 rounded-none w-1/2">
                {(['Todos', '2º INT', '3º INT'] as const).map((turma) => (
                  <button
                    key={turma}
                    onClick={() => setFilterTurma(turma)}
                    className={`flex-1 py-1.5 font-mono font-black uppercase text-[8px] min-h-[36px] flex items-center justify-center transition-all cursor-pointer ${
                      filterTurma === turma ? 'bg-purple-900 text-white' : 'text-purple-900 dark:text-purple-350 hover:bg-purple-105'
                    }`}
                  >
                    {turma === 'Todos' ? 'Todas' : turma.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Search bar inside mobile view - touch target compliant */}
            <div className="relative font-mono">
              <Search className="absolute left-2.5 top-3 text-purple-900 dark:text-purple-400" size={12} />
              <input
                type="text"
                placeholder="Buscar matéria, sala ou dia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-[10.5px] bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-750 pl-8 pr-10 py-2 border border-purple-950/60 dark:border-purple-800 text-slate-900 dark:text-slate-105 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none font-bold"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-0.5 w-[32px] h-[32px] flex items-center justify-center text-slate-400 hover:text-purple-900 font-bold text-base cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>

            {/* Horizontal category rollers */}
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-black uppercase text-purple-905 dark:text-purple-355 font-mono">Pills:</span>
              <div className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1 py-0.5 no-scrollbar">
                {['Todas', 'POO JAVA', 'WEB II', 'WEB JAVA', 'HTML/CSS', 'LAB. WEB', 'ARQ. COMPUT', 'SIST. OPERAC', 'SOFTWARE'].map((disc) => {
                  const isActive = (disc === 'Todas' && searchQuery === '') || (disc !== 'Todas' && searchQuery === disc);
                  return (
                    <button
                      key={disc}
                      onClick={() => handleDisciplineClick(disc)}
                      className={`inline-block py-1 px-2.5 text-[8.5px] font-mono font-bold uppercase transition-all rounded-full border shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-purple-950 dark:bg-purple-800 text-white border-purple-950 dark:border-purple-800'
                          : 'bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-305 border-purple-200 dark:border-purple-800 hover:bg-purple-50'
                      }`}
                    >
                      {disc}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notification Banner inside Mobile */}
          {message && (
            <div className="mx-3 mt-3 p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-805 text-emerald-950 dark:text-emerald-100 text-[10px] font-sans font-bold animate-in fade-in slide-in-from-top-1 shrink-0">
              {message.text}
            </div>
          )}

          {/* Scrollable View Containment inside mobile layout */}
          <div className="p-3 flex-1 overflow-y-auto no-scrollbar">
            {isLoading ? (
              <div className="py-24 text-center max-w-xs mx-auto space-y-3">
                <span className="h-7 w-7 rounded-full border-2 border-purple-600 border-t-transparent animate-spin inline-block"></span>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">Carregando horários...</p>
              </div>
            ) : viewMode === 'Calendario' ? (
              <div className="space-y-4 font-sans animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-850 p-3 shadow-xs border border-purple-900/10 dark:border-purple-800/40 text-[10px]">
                  <p className="font-bold text-purple-955 dark:text-purple-305 uppercase tracking-wide font-mono text-[8.5px] mb-1">MÓDULO CALENDÁRIO 2026:</p>
                  <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-sans">Toque nos dias destacados para planejar lições pedagógicas.</p>
                </div>
                <CalendarView slots={slots} onSelectSlot={setSelectedSlot} />
              </div>
            ) : viewMode === 'MeuHorario' ? (
              <div className="space-y-4 font-sans">
                <MySchedule slots={slots} onSelectSlot={setSelectedSlot} onToggleComplete={handleToggleComplete} searchQuery={searchQuery} />
              </div>
            ) : viewMode === 'Completo' ? (
              <div className="space-y-4 overflow-x-auto font-sans">
                <div className="bg-white dark:bg-slate-850 p-3 shadow-xs border border-purple-900/10 dark:border-purple-800/40 text-[9px] text-slate-650 dark:text-slate-350 font-sans transition-colors duration-200">
                  Arraste horizontalmente para conferir a grade geral de Informática Maria Barbosa Leite de 2026.
                </div>
                <FullGrid slots={slots} onSelectSlot={setSelectedSlot} activeTurno={activeTurno} filterTurma={filterTurma} searchQuery={searchQuery} />
              </div>
            ) : viewMode === 'RelatorioModulo' ? (
              <div className="space-y-4 font-sans animate-in fade-in duration-200">
                <ModuleReport slots={slots} />
              </div>
            ) : (
              <div className="space-y-4 font-sans">
                <StorageManager 
                  slots={slots}
                  isSyncing={isSyncing}
                  onSyncWithServer={fetchSchedule}
                  onResetData={handleResetData}
                  onDownloadBackup={handleDownloadBackup}
                  onImportBackup={handleImportBackup}
                />
              </div>
            )}
          </div>

          {/* Sticky bottom navigation for mobile screen list */}
          <div className={`${
            isMobileScreen 
              ? 'fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 pb-safe shadow-xl' 
              : 'absolute bottom-5 inset-x-4 h-14 bg-white/95 dark:bg-slate-800/95 rounded-2xl border border-slate-250 dark:border-slate-700 shadow-xl'
          } flex justify-around items-center py-1 z-30 text-[9px] font-sans font-bold select-none transition-all duration-200`}>
            <button 
              onClick={() => setViewMode('Calendario')}
              className={`flex flex-col items-center gap-1 flex-1 py-1.5 transition-colors cursor-pointer min-h-[44px] ${viewMode === 'Calendario' ? 'text-purple-900 dark:text-purple-350 scale-105 font-black' : 'text-slate-400 dark:text-slate-500 hover:text-purple-750'}`}
            >
              <Calendar size={14} />
              <span>Calendário</span>
            </button>
            <button 
              onClick={() => setViewMode('RelatorioModulo')}
              className={`flex flex-col items-center gap-1 flex-1 py-1.5 transition-colors cursor-pointer min-h-[44px] ${viewMode === 'RelatorioModulo' ? 'text-purple-900 dark:text-purple-350 scale-105 font-black' : 'text-slate-400 dark:text-slate-500 hover:text-purple-750'}`}
            >
              <FileText size={14} />
              <span>Módulo</span>
            </button>
            <button 
              onClick={() => setViewMode('MeuHorario')}
              className={`flex flex-col items-center gap-1 flex-1 py-1.5 transition-colors cursor-pointer min-h-[44px] ${viewMode === 'MeuHorario' ? 'text-purple-900 dark:text-purple-350 scale-105 font-black' : 'text-slate-400 dark:text-slate-500 hover:text-purple-750'}`}
            >
              <Smartphone size={14} />
              <span>Meu Dia</span>
            </button>
            <button 
              onClick={() => setViewMode('Completo')}
              className={`flex flex-col items-center gap-1 flex-1 py-1.5 transition-colors cursor-pointer min-h-[44px] ${viewMode === 'Completo' ? 'text-purple-900 dark:text-purple-350 scale-105 font-black' : 'text-slate-400 dark:text-slate-500 hover:text-purple-750'}`}
            >
              <Laptop size={14} />
              <span>Grade</span>
            </button>
            <button 
              onClick={() => setViewMode('Armazenamento')}
              className={`flex flex-col items-center gap-1 flex-1 py-1.5 transition-colors cursor-pointer min-h-[44px] ${viewMode === 'Armazenamento' ? 'text-purple-900 dark:text-purple-355 scale-105 font-black' : 'text-slate-400 dark:text-slate-500 hover:text-purple-750'}`}
            >
              <Database size={14} />
              <span>Backup</span>
            </button>
          </div>
        </div>
      );
    };

    // If we are physically on a mobile device (detected via viewport size), present the responsive layout in full screen (no chassis nested frame)
    if (isMobileScreen) {
      return (
        <div id="app-root" className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-purple-100 selection:text-purple-900 relative">
          {renderMobileScreenContent()}
          
          {selectedSlot && (
            <PlanningModal
              slot={selectedSlot}
              onClose={() => setSelectedSlot(null)}
              onSave={handleSaveSlot}
            />
          )}
        </div>
      );
    }

    // Otherwise, we are simulating cellular environment on a PC browser, so render the beautiful black container frame!
    return (
      <div id="app-root" className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-purple-100 selection:text-purple-900 font-sans transition-colors duration-200">
        
        {/* Helper status top control bar for desktop to interact with physical phone simulator */}
        <div className="w-full max-w-[415px] bg-white dark:bg-slate-900 border-2 border-purple-900 dark:border-purple-800 p-3 mb-4 flex justify-between items-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-none font-mono text-[10px]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-sans font-black uppercase text-purple-900 dark:text-purple-305 text-[10px]">SIMULADOR CELULAR</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
              className="p-1 border border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-slate-800 cursor-pointer rounded-none active:scale-95"
            >
              {theme === 'light' ? <Moon size={11} /> : <Sun size={11} className="text-amber-500 fill-amber-300" />}
            </button>
            <button
              onClick={() => setIsMobileSimulated(false)}
              className="px-2.5 py-1 bg-purple-900 text-white font-bold uppercase transition-all hover:bg-purple-950 cursor-pointer text-[10px]"
            >
              💻 Painel Completo
            </button>
          </div>
        </div>

        {/* The physical simulator chassis */}
        <div className="relative w-full max-w-[415px] h-[815px] bg-neutral-950 rounded-[48px] border-[12px] border-neutral-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] flex flex-col overflow-hidden select-text">
          
          {/* Screen Glare reflection overlay */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/10 z-30 rounded-[34px]" />
          
          {/* Phone top speaker & notch camera block */}
          <div className="absolute top-0 inset-x-0 h-6 bg-neutral-950 flex items-center justify-center z-40 rounded-b-xl select-none">
            <div className="w-24 h-3 bg-black rounded-full flex items-center justify-between px-3 text-[10px] text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 border border-zinc-850 animate-pulse"></span>
              <span className="w-8 h-0.5 bg-zinc-850 rounded-full"></span>
            </div>
          </div>

          {/* Simulated Native OS status bar inside phone */}
          <div className="h-9 bg-purple-950 flex justify-between px-6 text-[10px] text-white/95 font-semibold items-end pb-1.5 shrink-0 z-30 select-none">
            <span>{currentDateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-purple-200">
              <span>5G</span>
              <span>📶</span>
              <span className="text-[8.5px]">94%🔋</span>
            </div>
          </div>

          {/* Render the inside mobile viewport dynamically */}
          {renderMobileScreenContent()}

          {/* Virtual Home Swipe Bar */}
          <div className="absolute bottom-1 inset-x-0 h-4 flex items-center justify-center shrink-0 z-30 select-none bg-neutral-950">
            <div className="w-24 h-1 bg-zinc-650 rounded-full"></div>
          </div>

        </div>

        {selectedSlot && (
          <PlanningModal
            slot={selectedSlot}
            onClose={() => setSelectedSlot(null)}
            onSave={handleSaveSlot}
          />
        )}

      </div>
    );
  }

  return (
    <div id="app-root" className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-purple-100 selection:text-purple-900 bg-slate-50 dark:bg-transparent transition-colors duration-200">
      
      {/* Header Section in Editorial Aesthetic - Compressed & Clean */}
      <header className="border-b-2 border-purple-900 dark:border-purple-850 bg-white dark:bg-slate-900 shrink-0 shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-900 text-white shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <Laptop size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-black uppercase tracking-wider text-purple-900 dark:text-purple-300 bg-purple-50 dark:bg-slate-800 px-1.5 py-0.5 border border-purple-105 dark:border-purple-900">
                  Ensino Técnico TI
                </span>
                {isSyncing && (
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono animate-pulse flex items-center gap-1 font-bold">
                    ● Sincronizado
                  </span>
                )}
              </div>
              <h1 className="font-sans text-xl sm:text-2xl font-black tracking-tight uppercase text-purple-900 dark:text-purple-300 leading-none mt-0.5">
                Agenda do Professor de Informática
              </h1>
            </div>
          </div>

          {/* Time & Clock & Theme Switcher - Sleek inline bar */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-mono self-start sm:self-center">
            
            <div className="flex items-center gap-1.5 text-xs text-slate-550 dark:text-slate-305 bg-slate-50 dark:bg-slate-850 border border-purple-100 dark:border-purple-900 px-2.5 py-1 rounded-none">
              <Clock size={13} className="text-purple-900 dark:text-purple-300" />
              <span>{formatFullDate(currentDateTime)}</span>
            </div>

            {/* Accent Theme Switcher Selector */}
            <button
              id="theme-toggle"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title={theme === 'light' ? 'Ativar modo noturno escuro' : 'Ativar modo claro'}
              className="flex items-center gap-1.5 py-1 px-2.5 border border-purple-300 dark:border-purple-905 bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-slate-700 transition-all font-black uppercase tracking-wider cursor-pointer active:scale-95 text-[9px] select-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:shadow-none"
            >
              {theme === 'light' ? (
                <>
                  <Moon size={11} className="text-purple-900" />
                  <span>Escuro</span>
                </>
              ) : (
                <>
                  <Sun size={11} className="text-amber-500 fill-amber-300" />
                  <span>Claro</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 sm:px-6 lg:px-8 space-y-4">
        
        {/* Today Holiday / Recess Alert */}
        {todaySpecial && ['FN', 'FM', 'R', 'F'].includes(todaySpecial.type) && (
          <div className={`p-4 rounded-none border-2 flex items-center gap-4 ${
            todaySpecial.type === 'FN' || todaySpecial.type === 'FM'
              ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-900 dark:border-rose-800 text-rose-950 dark:text-rose-200 shadow-[2px_2px_0px_0px_rgba(159,18,57,1)]'
              : todaySpecial.type === 'R'
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-900 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 shadow-[2px_2px_0px_0px_rgba(6,78,59,1)]'
              : 'bg-zinc-800 dark:bg-zinc-900 border-zinc-950 dark:border-zinc-850 text-white dark:text-slate-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
          }`}>
            <AlertTriangle className="shrink-0 animate-bounce" size={20} />
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest block mb-0.5 font-mono">
                {todaySpecial.type === 'FN' || todaySpecial.type === 'FM' ? 'Feriado Hoje' : todaySpecial.type === 'R' ? 'Recesso Hoje' : 'Férias Ativas'}
              </span>
              <h2 className="text-sm font-black text-purple-950 dark:text-purple-200 font-sans uppercase">
                {todaySpecial.name}
              </h2>
            </div>
          </div>
        )}

        {/* Status Messaging Bar */}
        {message && (
          <div className={`p-3 rounded-none border flex items-start gap-2 text-[11px] font-mono transition-all duration-300 ${
            message.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900 text-emerald-850 dark:text-emerald-200 font-bold' 
              : message.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-305 dark:border-rose-900 text-rose-850 dark:text-rose-200 font-bold'
              : 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-305 dark:border-indigo-900 text-indigo-850 dark:text-indigo-200 font-bold'
          }`}>
            <ShieldCheck size={14} className="shrink-0 mt-0.5" />
            <p className="leading-relaxed">{message.text}</p>
          </div>
        )}

        {/* Compact & High Density Workspace Bar (Only Navigation & Essential Filters) */}
        <div id="workspace-controls" className="bg-white dark:bg-slate-900 border-2 border-purple-900 dark:border-purple-800 p-2 sm:p-2.5 shadow-[1.5px_1.5px_0px_0px_rgba(88,28,135,1)] dark:shadow-none space-y-2 transition-colors duration-200">
          
          {/* Main Navigation and Mode selection in a single tight row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            
            {/* Direct navigation menus requested (Calendario, Cronograma, Tabela, Backup) */}
            <div className="flex flex-wrap items-center gap-1 font-mono">
              <button
                id="btn-nav-calendar"
                onClick={() => setViewMode('Calendario')}
                className={`flex items-center gap-1.5 py-1 px-2.5 border transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer active:scale-95 ${
                  viewMode === 'Calendario'
                    ? 'bg-purple-900 text-white border-purple-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-slate-700'
                }`}
              >
                <Calendar size={12} />
                Calendário
              </button>
              <button
                id="btn-nav-module-report"
                onClick={() => setViewMode('RelatorioModulo')}
                className={`flex items-center gap-1.5 py-1 px-2.5 border transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer active:scale-95 ${
                  viewMode === 'RelatorioModulo'
                    ? 'bg-purple-900 text-white border-purple-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-slate-700'
                }`}
              >
                <FileText size={12} />
                Relatório Módulo
              </button>
              <button
                id="btn-nav-schedule"
                onClick={() => setViewMode('MeuHorario')}
                className={`flex items-center gap-1.5 py-1 px-2.5 border transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer active:scale-95 ${
                  viewMode === 'MeuHorario'
                    ? 'bg-purple-900 text-white border-purple-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-305 border-purple-300 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-slate-700'
                }`}
              >
                <Smartphone size={12} />
                Cronograma
              </button>
              <button
                id="btn-nav-table"
                onClick={() => setViewMode('Completo')}
                className={`flex items-center gap-1.5 py-1 px-2.5 border transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer active:scale-95 ${
                  viewMode === 'Completo'
                    ? 'bg-purple-900 text-white border-purple-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-305 border-purple-300 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-slate-700'
                }`}
              >
                <Laptop size={12} />
                Tabela
              </button>
              <button
                id="btn-nav-backup"
                onClick={() => setViewMode('Armazenamento')}
                className={`flex items-center gap-1.5 py-1 px-2.5 border transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer active:scale-95 ${
                  viewMode === 'Armazenamento'
                    ? 'bg-purple-900 text-white border-purple-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-305 border-purple-300 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-slate-700'
                }`}
              >
                <Database size={12} />
                Backup
              </button>
            </div>

            {/* Turnos selector, statistics & assistance toggles */}
            <div className="flex items-center justify-between lg:justify-end gap-2.5 font-mono text-[9px] w-full lg:w-auto">
              
              {/* Turno toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-850 border border-purple-200 dark:border-purple-800 p-0.5">
                <button
                  id="btn-turno-matutino"
                  onClick={() => setActiveTurno('Matutino')}
                  className={`py-0.5 px-2 uppercase font-black tracking-wider transition-all cursor-pointer ${
                    activeTurno === 'Matutino' ? 'bg-purple-900 text-white shadow-3xs' : 'text-purple-950 dark:text-purple-300 hover:bg-purple-200/40 dark:hover:bg-slate-750'
                  }`}
                >
                  Matutino
                </button>
                <button
                  id="btn-turno-vespertino"
                  onClick={() => setActiveTurno('Vespertino')}
                  className={`py-0.5 px-2 uppercase font-black tracking-wider transition-all cursor-pointer ${
                    activeTurno === 'Vespertino' ? 'bg-purple-900 text-white shadow-3xs' : 'text-purple-950 dark:text-purple-300 hover:bg-purple-200/40 dark:hover:bg-slate-750'
                  }`}
                >
                  Vespertino
                </button>
              </div>

              {/* Mobile simulation button */}
              <button
                id="btn-simulate-mobile"
                onClick={() => setIsMobileSimulated(!isMobileSimulated)}
                className={`py-0.5 px-2 border uppercase font-black tracking-widest transition-all cursor-pointer flex items-center gap-1 ${
                  isMobileSimulated
                    ? 'bg-purple-800 border-purple-950 text-white'
                    : 'bg-white dark:bg-slate-800 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-slate-700'
                }`}
              >
                <Smartphone size={10} />
                <span>Celular</span>
              </button>

            </div>
          </div>

          {/* Interactive Disciplines Filter Bar ("barra com as disciplinas") */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-purple-50/30 dark:bg-purple-950/20 p-1.5 border border-purple-100/60 dark:border-purple-900/40">
            <div className="flex items-center gap-1 text-[9px] font-mono font-black text-purple-950 dark:text-purple-300 select-none">
              <span className="p-0.5 bg-purple-100 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300">
                <Laptop size={10} />
              </span>
              <span>FILTRAR DISCIPLINA:</span>
            </div>
            
            <div className="flex flex-wrap gap-0.5 sm:justify-end">
              {['Todas', 'POO JAVA', 'WEB II', 'WEB JAVA', 'HTML/CSS', 'LAB. WEB', 'ARQ. COMPUT', 'SIST. OPERAC', 'SOFTWARE'].map((disc) => {
                const isActive = (disc === 'Todas' && searchQuery === '') || (disc !== 'Todas' && searchQuery === disc);
                return (
                  <button
                    key={disc}
                    id={`filter-${disc.replace(/\s+/g, '-').replace(/\./g, '')}`}
                    onClick={() => handleDisciplineClick(disc)}
                    className={`py-0.5 px-1.5 text-[8.5px] font-mono font-bold uppercase transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-purple-950 text-white border-purple-950'
                        : 'bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-300 border-purple-250 dark:border-purple-900 hover:bg-purple-100/30'
                    }`}
                  >
                    {disc}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Quick Search & Filters Input Toolbar */}
        <div id="quick-filters-bar" className="bg-white dark:bg-slate-900 border-2 border-purple-900 dark:border-purple-800 p-2 flex flex-col md:flex-row md:items-center justify-between gap-2.5 shadow-[1.5px_1.5px_0px_0px_rgba(88,28,135,1)] dark:shadow-none transition-colors duration-200">
          
          {/* Left search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 text-purple-900 dark:text-purple-300" size={13} strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Pesquisar por disciplina, sala, dia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 focus:bg-white dark:focus:bg-slate-750 pl-8 pr-3 py-1.5 rounded-none border border-purple-900 dark:border-purple-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-900 transition-all font-bold"
            />
          </div>

          {/* Right Filters, Reset & Backup */}
          <div className="flex items-center flex-wrap gap-2 md:justify-end font-mono">
            
            {/* Turma filter toggle */}
            <div className="flex bg-purple-50 dark:bg-slate-800 border border-purple-900 dark:border-purple-800 p-0.5 rounded-none">
              {['Todos', '2º INT', '3º INT'].map((turma) => (
                <button
                  key={turma}
                  onClick={() => setFilterTurma(turma as any)}
                  className={`py-1 px-2 rounded-none text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    filterTurma === turma ? 'bg-purple-900 text-white shadow-3xs' : 'text-purple-900 dark:text-purple-300 hover:bg-purple-100/60 dark:hover:bg-slate-700/60'
                  }`}
                >
                  {turma === 'Todos' ? 'Todas Turmas' : turma}
                </button>
              ))}
            </div>

            <div className="h-4 w-[1px] bg-purple-300 dark:bg-purple-800 hidden sm:block mx-1"></div>

            {/* Reset Seed Button */}
            <button
              onClick={handleResetData}
              title="Restaurar a grade inicial das imagens"
              className="p-2 border border-purple-900 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-purple-900 dark:text-purple-300 rounded-none transition-all cursor-pointer bg-white dark:bg-slate-850 text-xs font-mono font-bold flex items-center gap-1.5"
            >
              <RotateCcw size={12} />
              <span className="hidden lg:inline uppercase text-[9px] font-black">Resetar</span>
            </button>

            {/* Export JSON backup anchor */}
            <button
              onClick={handleDownloadBackup}
              title="Baixar arquivo de Backup JSON"
              className="p-2 border border-purple-900 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-purple-900 dark:text-purple-300 rounded-none transition-all cursor-pointer bg-white dark:bg-slate-850 text-xs font-mono font-bold flex items-center gap-1.5"
            >
              <Download size={12} />
              <span className="hidden lg:inline uppercase text-[9px] font-black">Exportar</span>
            </button>

            {/* Import JSON button */}
            <label className="p-2 border border-purple-900 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-purple-900 dark:text-purple-300 rounded-none transition-all cursor-pointer flex items-center justify-center bg-white dark:bg-slate-850 text-xs font-mono font-bold gap-1.5">
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
              <Upload size={12} />
              <span className="hidden lg:inline uppercase text-[9px] font-black">Importar</span>
            </label>

          </div>
        </div>

        {/* Conditional rendering according to Selected ViewMode */}
        {isLoading ? (
          <div className="py-16 text-center max-w-xs mx-auto space-y-3">
            <span className="h-7 w-7 rounded-full border-2 border-purple-600 border-t-transparent animate-spin inline-block"></span>
            <p className="text-[11px] font-bold text-slate-500 font-mono">Buscando cronograma e dados sincronizados...</p>
          </div>
        ) : viewMode === 'Calendario' ? (
          <div className="animate-in fade-in duration-300">
            <CalendarView
              slots={slots}
              onSelectSlot={setSelectedSlot}
            />
          </div>
        ) : viewMode === 'RelatorioModulo' ? (
          <div className="animate-in fade-in duration-300">
            <ModuleReport slots={slots} />
          </div>
        ) : viewMode === 'MeuHorario' ? (
          <div className="animate-in fade-in duration-300">
            <MySchedule
              slots={slots}
              onSelectSlot={setSelectedSlot}
              onToggleComplete={handleToggleComplete}
              searchQuery={searchQuery}
            />
          </div>
        ) : viewMode === 'Completo' ? (
          <div className="animate-in fade-in duration-300">
            <FullGrid
              slots={slots}
              onSelectSlot={setSelectedSlot}
              activeTurno={activeTurno}
              filterTurma={filterTurma}
              searchQuery={searchQuery}
            />
          </div>
        ) : (
          <div className="animate-in fade-in duration-300 font-sans">
            <StorageManager
              slots={slots}
              isSyncing={isSyncing}
              onSyncWithServer={fetchSchedule}
              onResetData={handleResetData}
              onDownloadBackup={handleDownloadBackup}
              onImportBackup={handleImportBackup}
            />
          </div>
        )}

      </main>

      {/* Persistent Footer in Editorial style */}
      <footer className="bg-purple-900 text-white py-6 shrink-0 text-center text-[10px] font-mono border-t-2 border-purple-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 select-none uppercase tracking-[0.2em] font-bold">
          <p>© 2026 - EDUCAÇÃO TÉCNICA À DISPOSIÇÃO DO PROFESSOR DE TI.</p>
          <p className="font-mono text-purple-200">v2.0.4-stable // 2026</p>
        </div>
      </footer>

      {/* Editor Modal Drawer */}
      {selectedSlot && (
        <PlanningModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onSave={handleSaveSlot}
        />
      )}

    </div>
  );
}
