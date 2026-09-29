/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ScheduleSlot } from '../types';
import { 
  X, Sparkles, BookOpen, Clock, FileText, CheckCircle2, 
  ArrowRight, Loader2, RefreshCw, PenTool, CheckSquare, MessageSquare, ClipboardList, Download,
  Check, CheckCircle, Printer
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface PlanningModalProps {
  slot: ScheduleSlot | null;
  onClose: () => void;
  onSave: (updatedSlot: ScheduleSlot) => void;
}

const ACADEMIC_JOKES = [
  "Iniciando compilador de planos pedagógicos...",
  "Importando pacotes de didática para TI...",
  "Removendo bugs do plano de aula...",
  "Consultando o Stack Overflow dos professores de Java...",
  "Formatando exemplos práticos livres de erros de sintaxe...",
  "Garantindo que todos os exemplos rodem no VS Code dos estudantes...",
  "Limpando o cache de dispersão dos alunos do fundo..."
];

export default function PlanningModal({ slot, onClose, onSave }: PlanningModalProps) {
  const [materia, setMateria] = useState('');
  const [notes, setNotes] = useState('');
  const [topic, setTopic] = useState('');
  const [aiPlan, setAiPlan] = useState('');
  const [completed, setCompleted] = useState(false);
  const [periodicity, setPeriodicity] = useState<'diario' | 'quinzenal' | 'trimestral'>('diario');
  const [isGenerating, setIsGenerating] = useState(false);
  const [jokeIndex, setJokeIndex] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);



  // Sync state with selected slot
  useEffect(() => {
    if (slot) {
      setMateria(slot.materia || '');
      setNotes(slot.notes || '');
      setAiPlan(slot.aiPlan || '');
      setCompleted(!!slot.completed);
      setPeriodicity(slot.periodicity || 'diario');
      setTopic('');
      setApiError(null);
    }
  }, [slot]);



  // Fun technical joke rotator during loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setJokeIndex((prev) => (prev + 1) % ACADEMIC_JOKES.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  if (!slot) return null;

  const handleGenerateAiPlan = async () => {
    setIsGenerating(true);
    setApiError(null);
    try {
      const response = await fetch('/api/gemini/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: materia,
          topic: topic.trim() || (periodicity === 'diario' ? 'Fundamentos Práticos e Laboratório de Fixação' : 'Planejamento e Desenvolvimento Técnico'),
          turma: slot.turma,
          notes: notes,
          periodicity: periodicity
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na resposta do servidor.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAiPlan(data.plan || '');
    } catch (err: any) {
      console.error('Erro ao chamar IA:', err);
      setApiError(err.message || 'Houve um erro de rede ao tentar conectar com a IA Gemini.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyChanges = () => {
    onSave({
      ...slot,
      materia: materia.trim().toUpperCase() || slot.materia,
      notes: notes.trim(),
      aiPlan: aiPlan,
      completed: completed,
      periodicity: periodicity
    });
    onClose();
  };



  const handleExportSimplifiedPdf = (mode: 'download' | 'print' = 'download') => {
    let titleOfPeriodicity = 'PLANO DE AULA SIMPLIFICADO';
    let prefix = 'Plano_Simplificado';
    if (periodicity === 'quinzenal') {
      titleOfPeriodicity = 'PLANO DE ENSINO QUINZENAL SIMPLIFICADO';
      prefix = 'Plano_Quinzenal_Simplificado';
    } else if (periodicity === 'trimestral') {
      titleOfPeriodicity = 'PLANO TRIMESTRAL SIMPLIFICADO';
      prefix = 'Plano_Trimestral_Simplificado';
    }

    const currentDateStr = new Date().toLocaleDateString('pt-BR');

    const printContentHtml = `
      <div style="padding: 24px 30px; font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; background: #ffffff; width: 100%; box-sizing: border-box;">
        <div style="border-bottom: 2.5px solid #4c1d95; padding-bottom: 10px; margin-bottom: 18px; text-align: center;">
          <div style="color: #4c1d95; font-size: 11px; font-family: monospace; letter-spacing: 2px; text-transform: uppercase; font-weight: 900; margin-bottom: 2px;">
            Escola Estadual Maria Barbosa Leite
          </div>
          <div style="color: #6b21a8; font-size: 9.5px; font-family: monospace; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">
            Curso Técnico em Informática • Varzelândia/MG
          </div>
          <h1 style="color: #1e1b4b; font-size: 18px; font-family: Georgia, serif; font-style: italic; margin: 6px 0 4px 0; font-weight: bold; text-transform: uppercase;">
            ${titleOfPeriodicity}
          </h1>
          <span style="color: #64748b; font-size: 8.5px; font-family: monospace;">
            Resolução SEE Nº 5.222/2026 • Emissão: ${currentDateStr}
          </span>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 10px; border: 1px solid #cbd5e1;">
          <tbody>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: bold; width: 22%; color: #334155;">Componente / Disciplina:</td>
              <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #1e1b4b; width: 38%;">${materia.toUpperCase() || 'NÃO INFORMADA'}</td>
              <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: bold; width: 15%; color: #334155;">Turma:</td>
              <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #1e1b4b; width: 25%;">${slot.turma}</td>
            </tr>
            <tr>
              <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #334155;">Horário & Turno:</td>
              <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${slot.day}-Feira • ${slot.time} (${slot.turno})</td>
              <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #334155;">Situação:</td>
              <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: bold; color: ${completed ? '#047857' : '#b45309'};">
                ${completed ? 'Concluída ✅' : 'Planejada 📝'}
              </td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #334155;">Tema / Foco Previsto:</td>
              <td colspan="3" style="padding: 6px 10px; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 600;">
                ${topic.trim() || 'Práticas Técnicas e Conteúdos Curriculares'}
              </td>
            </tr>
          </tbody>
        </table>

        ${notes.trim() ? `
          <div style="margin-bottom: 16px;">
            <div style="font-size: 9.5px; font-weight: bold; font-family: monospace; text-transform: uppercase; color: #4c1d95; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 6px;">
              Anotações e Observações do Docente
            </div>
            <div style="background-color: #fffbe0; border: 1px solid #fde68a; padding: 10px 12px; font-size: 10px; color: #334155; line-height: 1.5; border-radius: 4px;">
              ${notes.trim()}
            </div>
          </div>
        ` : ''}

        <div style="margin-bottom: 20px;">
          <div style="font-size: 9.5px; font-weight: bold; font-family: monospace; text-transform: uppercase; color: #4c1d95; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 8px;">
            Roteiro Pedagógico e Atividades Didáticas
          </div>
          <div style="white-space: pre-wrap; font-family: 'Courier New', Courier, monospace; font-size: 9.5px; line-height: 1.55; color: #1e293b; background-color: #fafafa; border: 1px solid #e2e8f0; padding: 14px; border-radius: 4px;">
            ${aiPlan || "Nenhum roteiro detalhado gerado para este horário."}
          </div>
        </div>

        <div style="margin-top: 40px; display: flex; justify-content: space-between; gap: 20px;">
          <div style="width: 46%; text-align: center; border-top: 1px solid #64748b; padding-top: 6px; font-size: 8.5px; color: #475569; font-family: sans-serif;">
            <strong>Assinatura do(a) Professor(a)</strong><br>
            Curso Técnico em Informática
          </div>
          <div style="width: 46%; text-align: center; border-top: 1px solid #64748b; padding-top: 6px; font-size: 8.5px; color: #475569; font-family: sans-serif;">
            <strong>Supervisão Pedagógica</strong><br>
            E.E. Maria Barbosa Leite
          </div>
        </div>

        <div style="margin-top: 25px; padding-top: 10px; border-top: 1px dashed #cbd5e1; text-align: center; font-size: 8px; color: #94a3b8; font-family: monospace;">
          Documento simplificado para impressão • Sistema de Gestão Pedagógica E.E. Maria Barbosa Leite
        </div>
      </div>
    `;

    if (mode === 'print') {
      const printWindow = window.open('', '_blank', 'width=850,height=900');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${titleOfPeriodicity} - ${materia.toUpperCase()}</title>
              <style>
                @page { size: A4; margin: 12mm; }
                body { margin: 0; padding: 0; background: #ffffff; }
              </style>
            </head>
            <body>
              ${printContentHtml}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 300);
        return;
      }
    }

    // Direct PDF export via html2pdf
    const div = document.createElement('div');
    div.innerHTML = printContentHtml;
    document.body.appendChild(div);

    const opt = {
      margin:       8,
      filename:     `${prefix}_${(materia || 'AULA').toUpperCase().replace(/\s+/g, '_')}_${slot.turma.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    try {
      const pdfExporter = (html2pdf as any)?.default || html2pdf;
      if (typeof pdfExporter === 'function') {
        pdfExporter().from(div).set(opt).save().then(() => {
          if (div.parentNode) div.parentNode.removeChild(div);
        });
      } else {
        window.print();
        if (div.parentNode) div.parentNode.removeChild(div);
      }
    } catch (err) {
      console.warn("Falha ao exportar PDF via html2pdf, acionando impressão nativa:", err);
      if (div.parentNode) div.parentNode.removeChild(div);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-none w-full max-w-3xl shadow-[5px_5px_0px_0px_rgba(88,28,135,1)] dark:shadow-none border-2 border-purple-900 dark:border-purple-800 flex flex-col max-h-[90vh] transition-colors">
        
        {/* Modal Header */}
        <div className="bg-purple-950 text-white px-6 py-4.5 rounded-none flex items-center justify-between shrink-0 border-b border-purple-900">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-none border ${slot.isTeacher ? 'bg-purple-900 border-purple-700 text-purple-200' : 'bg-purple-900/30 border-purple-900 text-purple-350'}`}>
              <BookOpen size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase font-mono font-black tracking-widest text-purple-300">{slot.day}-Feira</span>
                <span className="text-purple-700 font-bold">•</span>
                <span className="text-[9px] uppercase font-mono font-black tracking-widest text-purple-200">{slot.time} ({slot.turno})</span>
              </div>
              <h2 className="text-base font-serif italic text-purple-100 font-bold">Planejamento de Aula</h2>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-purple-300 hover:text-white p-1 hover:bg-white/10 rounded-none transition-colors border border-purple-900 hover:border-purple-300 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* Quick Context Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-purple-50/40 dark:bg-purple-950/20 p-4 rounded-none border border-purple-900 dark:border-purple-800 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:shadow-none">
            <div>
              <span className="text-[9px] font-black text-purple-900 dark:text-purple-300 uppercase tracking-widest block font-mono">Turma</span>
              <span className="text-xs font-bold font-mono text-purple-950 dark:text-purple-200">{slot.turma} (Informática)</span>
            </div>
            <div>
              <span className="text-[9px] font-black text-purple-900 dark:text-purple-300 uppercase tracking-widest block font-mono">Disciplina</span>
              <input
                type="text"
                value={materia}
                onChange={(e) => setMateria(e.target.value)}
                className="text-xs font-black uppercase text-purple-900 dark:text-purple-300 bg-transparent border-b-2 border-purple-900/10 hover:border-purple-900 dark:hover:border-purple-400 focus:border-purple-950 focus:outline-none w-full py-0.5"
                title="Clique para editar o nome da disciplina"
              />
            </div>
            <div className="flex items-center md:justify-end">
              <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-800 px-3 py-1.5 rounded-none border border-purple-900 dark:border-purple-850 shadow-[1px_1px_0px_0px_rgba(88,28,135,1)] dark:shadow-none hover:bg-purple-50 dark:hover:bg-slate-750 transition-all select-none">
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={(e) => setCompleted(e.target.checked)}
                  className="rounded-none text-purple-900 dark:text-purple-400 focus:ring-0 focus:ring-offset-0 border-purple-900 dark:border-purple-800 h-4 w-4 shrink-0"
                />
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-950 dark:text-purple-300 flex items-center gap-1 font-mono">
                  <CheckSquare size={12} className="text-purple-900 dark:text-purple-400" />
                  Concluída?
                </span>
              </label>
            </div>
          </div>

          {/* Form and Planning section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Hand: Local notes and Planning Input */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black font-mono text-purple-950 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <PenTool size={12} className="text-purple-900" />
                  Anotações de Classe
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Alunos devem entregar o Exercício Prático de Polimorfismo. Avisar sobre a prova..."
                  className="w-full text-xs text-slate-800 p-3 rounded-none border-2 border-purple-900 min-h-[120px] focus:outline-none focus:border-purple-950 focus:ring-0 font-medium"
                />
              </div>

              {/* Gemini AI assistant launcher */}
              <div className="p-4 rounded-none bg-purple-50/50 border-2 border-purple-900 space-y-3 shadow-[2px_2px_0px_0px_rgba(88,28,135,0.4)]">
                <div className="flex items-center gap-2 text-purple-950 justify-between">
                  <span className="text-[10px] uppercase font-black tracking-wider flex items-center gap-1">
                    <Sparkles size={13} className="text-purple-900 fill-purple-200" />
                    Assistente de Planejamento Gemini
                  </span>
                  <span className="text-[9px] bg-purple-900 text-white font-black px-1.5 py-0.5 rounded-none font-mono uppercase">AI</span>
                </div>
                <p className="text-[11px] text-slate-700/95 leading-relaxed font-serif italic">
                  {periodicity === 'diario' && 'Gere um plano de aula diário completo estruturado com objetivos técnicos, cronograma de 50m, códigos-fonte e desafios de laboratório.'}
                  {periodicity === 'quinzenal' && 'Gere um plano pedagógico quinzenal (15 dias) estruturado para cobrir as temáticas de forma progressiva com atividades teóricas e práticas.'}
                  {periodicity === 'trimestral' && 'Elabore um plano trimestral de curso em conformidade com as regras pedagógicas de MG para acompanhar a evolução letiva.'}
                </p>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-purple-900/80 block uppercase tracking-wider font-mono">Periodicidade do Planejamento:</label>
                  <div className="grid grid-cols-3 gap-1 bg-white p-0.5 border border-purple-900">
                    <button
                      type="button"
                      onClick={() => setPeriodicity('diario')}
                      className={`text-[9.5px] py-1 font-mono uppercase font-black tracking-wider transition-all cursor-pointer ${
                        periodicity === 'diario'
                          ? 'bg-purple-900 text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-transparent text-purple-950 hover:bg-purple-50'
                      }`}
                    >
                      Diário
                    </button>
                    <button
                      type="button"
                      onClick={() => setPeriodicity('quinzenal')}
                      className={`text-[9.5px] py-1 font-mono uppercase font-black tracking-wider transition-all cursor-pointer ${
                        periodicity === 'quinzenal'
                          ? 'bg-purple-900 text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-transparent text-purple-950 hover:bg-purple-50'
                      }`}
                    >
                      Quinzenal
                    </button>
                    <button
                      type="button"
                      onClick={() => setPeriodicity('trimestral')}
                      className={`text-[9.5px] py-1 font-mono uppercase font-black tracking-wider transition-all cursor-pointer ${
                        periodicity === 'trimestral'
                          ? 'bg-purple-900 text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-transparent text-purple-950 hover:bg-purple-50'
                      }`}
                    >
                      Trimestral
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-purple-900/80 block uppercase tracking-wider font-mono">
                    {periodicity === 'diario' ? 'Quadro-Tema Previsto:' : periodicity === 'quinzenal' ? 'Foco da Quinzena:' : 'Tema Geral do Trimestre:'}
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={periodicity === 'diario' ? 'Ex: Polimorfismo, Tags de Formulários, Threads...' : periodicity === 'quinzenal' ? 'Ex: Desenvolvimento Web Completo e Banco de Dados...' : 'Ex: Programação Orientada a Objetos Avançada...'}
                    className="w-full text-xs p-2.5 rounded-none border border-purple-900 focus:outline-none focus:border-purple-950 focus:ring-0 bg-white font-medium"
                  />
                </div>

                <button
                  type="button"
                  disabled={isGenerating || !materia}
                  onClick={handleGenerateAiPlan}
                  className="w-full bg-purple-900 hover:bg-purple-950 text-white font-bold text-[10px] tracking-widest py-2 px-4 rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] uppercase font-mono flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Construindo Plano...
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      GERAR PLANO TÉCNICO GEMINI
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Hand: AI Output Display */}
            <div className="border-2 border-purple-900 rounded-none overflow-hidden flex flex-col bg-purple-50/20 min-h-[300px]">
              <div className="bg-purple-950 px-4 py-2 border-b border-purple-900 flex justify-between items-center shrink-0">
                <span className="text-[9px] font-black text-purple-200 font-mono uppercase tracking-widest flex items-center gap-1.5">
                  <ClipboardList size={13} className="text-purple-300" />
                  Plano Estruturado
                </span>
                {aiPlan && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleExportSimplifiedPdf('print')}
                      className="text-[9px] text-purple-200 font-black hover:text-white uppercase font-mono flex items-center gap-1 bg-purple-900/80 hover:bg-purple-900 px-2 py-0.5 border border-purple-700 transition-colors cursor-pointer"
                      title="Imprimir plano direto em formato simplificado"
                    >
                      <Printer size={11} />
                      Imprimir
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportSimplifiedPdf('download')}
                      className="text-[9px] text-purple-200 font-black hover:text-white uppercase font-mono flex items-center gap-1 bg-purple-900/80 hover:bg-purple-900 px-2 py-0.5 border border-purple-700 transition-colors cursor-pointer"
                      title="Salvar PDF simplificado para impressão"
                    >
                      <Download size={11} />
                      PDF Simplificado
                    </button>
                    <button
                      type="button"
                      onClick={() => { if(window.confirm('Quer limpar o plano gerado?')) setAiPlan('') }}
                      className="text-[9px] text-purple-300 font-black hover:text-red-300 uppercase font-mono ml-1 border-l border-purple-800 pl-2 cursor-pointer"
                      title="Limpar plano"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 overflow-y-auto text-xs text-slate-800 select-text leading-relaxed font-mono bg-white">
                {isGenerating ? (
                  <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-3">
                    <Loader2 size={24} className="text-purple-950 animate-spin" />
                    <p className="text-[10px] font-black text-purple-900 uppercase tracking-widest font-mono">IA Processando...</p>
                    <p className="text-[11px] text-slate-500 max-w-xs animate-pulse font-serif italic">
                      "{ACADEMIC_JOKES[jokeIndex]}"
                    </p>
                  </div>
                ) : apiError ? (
                  <div className="text-center p-4 bg-purple-50 border border-purple-900 rounded-none text-purple-950 space-y-2">
                    <p className="font-black text-[10px] uppercase tracking-wider text-purple-900 font-mono">Erro ao Planejar</p>
                    <p className="text-[11px] leading-relaxed">{apiError}</p>
                    <button
                      type="button"
                      onClick={handleGenerateAiPlan}
                      className="text-[10px] font-black uppercase tracking-widest text-purple-900 hover:underline flex items-center justify-center gap-1 mx-auto mt-2"
                    >
                      <RefreshCw size={11} />
                      Tentar Novamente
                    </button>
                  </div>
                ) : aiPlan ? (
                  <div ref={pdfRef} className="prose prose-sm max-w-none text-[11px] whitespace-pre-wrap select-text font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 p-2">
                    {aiPlan}
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center text-center p-6 text-slate-400 dark:text-slate-505 font-sans">
                    <MessageSquare size={28} className="text-purple-900/30 dark:text-purple-500/10 mb-2" />
                    <p className="font-black text-[10px] uppercase tracking-widest text-purple-950 dark:text-purple-305">Sem Plano de IA Ativo</p>
                    <p className="text-[11px] mt-1.5 font-serif italic text-slate-500 dark:text-slate-400 max-w-[210px] leading-relaxed">
                      Insira o assunto e clique no botão esquerdo para obter o roteiro pedagógico instantâneo.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-purple-50 dark:bg-slate-950 border-t-2 border-purple-900 dark:border-purple-800 px-6 py-4 rounded-none flex items-center justify-between shrink-0 font-mono transition-colors flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExportSimplifiedPdf('print')}
              className="px-3 py-1.5 border border-purple-900 dark:border-purple-700 bg-purple-900 text-white hover:bg-purple-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              title="Imprimir plano de aula simplificado"
            >
              <Printer size={12} />
              Imprimir Plano
            </button>
            <button
              type="button"
              onClick={() => handleExportSimplifiedPdf('download')}
              className="px-3 py-1.5 border border-purple-900 dark:border-purple-700 bg-white dark:bg-slate-800 text-purple-950 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-slate-700 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
              title="Baixar PDF simplificado"
            >
              <Download size={12} />
              PDF Simplificado
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-purple-900 dark:border-purple-800 rounded-none text-[10px] font-black uppercase tracking-widest text-purple-900 dark:text-purple-300 bg-white dark:bg-slate-800 hover:bg-purple-100/60 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApplyChanges}
              className="px-5 py-2 bg-purple-900 dark:bg-purple-800 border border-purple-950 dark:border-purple-900 hover:bg-purple-950 dark:hover:bg-purple-950 text-white rounded-none text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:shadow-none"
            >
              Aplicar e Salvar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
