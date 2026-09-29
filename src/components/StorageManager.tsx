/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Database, HardDrive, Server, RefreshCw, Download, Upload, 
  ShieldCheck, AlertTriangle, RotateCcw, Check, FileJson,
  Smartphone
} from 'lucide-react';
import { ScheduleSlot } from '../types';

interface StorageManagerProps {
  slots: ScheduleSlot[];
  isSyncing: boolean;
  onSyncWithServer: () => Promise<void>;
  onResetData: () => void;
  onDownloadBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function StorageManager({
  slots,
  isSyncing,
  onSyncWithServer,
  onResetData,
  onDownloadBackup,
  onImportBackup
}: StorageManagerProps) {
  const [localSyncState, setLocalSyncState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [selectedStorageTab, setSelectedStorageTab] = useState<'geral' | 'ajuda'>('geral');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert("Para salvar o app em outro dispositivo:\n\n📱 No Celular Android (Chrome) / iOS (Safari):\n1. Toque nos 'Três Pontinhos' (Chrome) ou no botão de 'Compartilhar' (Safari)\n2. Selecione 'Instalar aplicativo' ou 'Adicionar à tela de início'\n\n💻 No Computador:\n1. Clique no pequeno ícone de monitor com uma seta para baixo que aparece no lado direito da barra de endereços do seu navegador.");
      return;
    }
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Instalação de aplicativo: ${outcome}`);
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (err) {
      console.error("Falha ao rodar o instalador guiado:", err);
    }
  };

  // Compute storage insights
  const totalSlots = slots.length;
  const customNotesCount = slots.filter(s => s.notes && s.notes.trim() !== '').length;
  const aiPlansCount = slots.filter(s => s.aiPlan && s.aiPlan.trim() !== '').length;
  const totalCompleted = slots.filter(s => s.completed).length;

  const handleManualLocalSave = () => {
    setLocalSyncState('loading');
    setTimeout(() => {
      localStorage.setItem('agenda_professor_slots', JSON.stringify(slots));
      setLocalSyncState('success');
      setTimeout(() => setLocalSyncState('idle'), 3000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Quick Switcher inside storage view */}
      <div className="bg-purple-900 dark:bg-purple-955 text-white p-6 rounded-none shadow-[3px_3px_0px_0px_rgba(88,28,135,1)] dark:shadow-none border-2 border-purple-950 dark:border-purple-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-200">GERENCIADOR DE DADOS</span>
          <h2 className="text-xl font-serif italic font-black">Salvar e Sincronizar Informações</h2>
          <p className="text-xs text-purple-100 mt-1 max-w-xl">
            Escolha onde salvar suas anotações acadêmicas e os planejamentos didáticos diários gerados pelo Gemini para a Escola Maria Barbosa Leite.
          </p>
        </div>
        <div className="flex bg-purple-950 dark:bg-slate-900 border border-purple-700 dark:border-purple-800 p-1 rounded-none font-mono text-[10px]">
          <button 
            onClick={() => setSelectedStorageTab('geral')}
            className={`px-3 py-1.5 uppercase font-black cursor-pointer transition-all ${selectedStorageTab === 'geral' ? 'bg-purple-300 dark:bg-purple-800 text-purple-950 dark:text-purple-100 font-bold' : 'text-purple-200 hover:text-white'}`}
          >
            Sistemas Ativos
          </button>
          <button 
            onClick={() => setSelectedStorageTab('ajuda')}
            className={`px-3 py-1.5 uppercase font-black cursor-pointer transition-all ${selectedStorageTab === 'ajuda' ? 'bg-purple-300 dark:bg-purple-800 text-purple-950 dark:text-purple-100 font-bold' : 'text-purple-200 hover:text-white'}`}
          >
            Como Funciona?
          </button>
        </div>
      </div>

      {selectedStorageTab === 'geral' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">

          {/* Cloud Server Storage Card */}
          <div className="bg-white dark:bg-slate-900 border-2 border-purple-900 dark:border-purple-800 p-5 rounded-none shadow-[3px_3px_0px_0px_rgba(88,28,135,1)] dark:shadow-none flex flex-col justify-between transition-colors">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-sky-50 dark:bg-sky-950/20 border border-sky-350 dark:border-sky-900 text-sky-850 dark:text-sky-300">
                    <Server size={16} />
                  </span>
                  <h3 className="text-sm font-black text-purple-950 dark:text-purple-300 uppercase tracking-wider">Armazenamento em Nuvem</h3>
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" title="Servidor Cloud Ativo"></span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                Salvamento automático no arquivo do servidor (<span className="text-purple-900 dark:text-purple-300 font-bold">/data/schedule.json</span>). Seus dados ficam protegidos em seu container pessoal de nuvem.
              </p>
              
              {/* Database quick values */}
              <div className="mt-4 bg-slate-50 dark:bg-slate-800 p-3 border border-purple-105 dark:border-purple-900 space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between text-slate-550 dark:text-slate-405">
                  <span>Conexão do Servidor:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Excelente</span>
                </div>
                <div className="flex justify-between text-slate-550 dark:text-slate-405">
                  <span>Modo Gravável:</span>
                  <span className="text-purple-900 dark:text-purple-300 font-bold">Habilitado (HTTP POST)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-purple-100 dark:border-purple-950 flex flex-col gap-2">
              <button
                onClick={onSyncWithServer}
                disabled={isSyncing}
                className="w-full py-2 bg-purple-900 dark:bg-purple-800 hover:bg-purple-950 dark:hover:bg-purple-900 text-white font-mono text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-none cursor-pointer transition-all active:scale-[0.98] disabled:opacity-55"
              >
                <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
                {isSyncing ? 'Sincronizando...' : 'Sincronizar com Nuvem'}
              </button>
              <span className="text-[9px] text-center text-slate-400 dark:text-slate-500 font-mono">
                Atualiza os dados em tempo real da lousa.
              </span>
            </div>
          </div>

          {/* Local Smart Device Caching Card */}
          <div className="bg-white dark:bg-slate-900 border-2 border-purple-900 dark:border-purple-800 p-5 rounded-none shadow-[3px_3px_0px_0px_rgba(88,28,135,1)] dark:shadow-none flex flex-col justify-between transition-colors">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-900 text-amber-850 dark:text-amber-300">
                    <Database size={16} />
                  </span>
                  <h3 className="text-sm font-black text-purple-950 dark:text-purple-300 uppercase tracking-wider">Memória do Aparelho</h3>
                </div>
                <span className="text-[9px] font-black bg-amber-500 text-neutral-950 px-2 font-mono uppercase">Offline OK</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                Uma cópia de segurança é gravada localmente no navegador (<span className="text-purple-900 dark:text-purple-300 font-bold">LocalStorage</span>). Garante que você edite seus planos mesmo sem internet!
              </p>

              {/* Cache specs */}
              <div className="mt-4 bg-slate-50 dark:bg-slate-800 p-3 border border-purple-105 dark:border-purple-900 space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between text-slate-550 dark:text-slate-405">
                  <span>Anotações Locais:</span>
                  <span className="text-purple-950 dark:text-purple-250 font-bold">{customNotesCount} salvas</span>
                </div>
                <div className="flex justify-between text-slate-550 dark:text-slate-405">
                  <span>Planos IA em Cache:</span>
                  <span className="text-purple-950 dark:text-purple-250 font-bold">{aiPlansCount} roteiros</span>
                </div>
                <div className="flex justify-between text-slate-550 dark:text-slate-405">
                  <span>Aulas Concluídas:</span>
                  <span className="text-purple-950 dark:text-purple-250 font-bold">{totalCompleted} ministradas</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-purple-100 dark:border-purple-950 flex flex-col gap-2">
              <button
                onClick={handleManualLocalSave}
                disabled={localSyncState === 'loading'}
                className={`w-full py-2 text-white font-mono text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-none cursor-pointer transition-all active:scale-[0.98] ${
                  localSyncState === 'success' 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : localSyncState === 'loading'
                    ? 'bg-slate-450'
                    : 'bg-purple-900 dark:bg-purple-800 hover:bg-purple-950 dark:hover:bg-purple-900'
                }`}
              >
                {localSyncState === 'success' ? (
                  <>
                    <Check size={12} />
                    Gravado no LocalStorage!
                  </>
                ) : localSyncState === 'loading' ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    Buscando Memória...
                  </>
                ) : (
                  <>
                    <HardDrive size={12} />
                    Gravar Cópia no Celular
                  </>
                )}
              </button>
              <span className="text-[9px] text-center text-slate-400 dark:text-slate-500 font-mono">
                Dura mesmo se o celular for desligado.
              </span>
            </div>
          </div>

          {/* Backup & Hard Import Files */}
          <div className="bg-white dark:bg-slate-900 border-2 border-purple-900 dark:border-purple-800 p-5 rounded-none shadow-[3px_3px_0px_0px_rgba(88,28,135,1)] dark:shadow-none flex flex-col justify-between transition-colors">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-purple-50 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-900 text-purple-855 dark:text-purple-300">
                    <FileJson size={16} />
                  </span>
                  <h3 className="text-sm font-black text-purple-950 dark:text-purple-300 uppercase tracking-wider">Download Físico</h3>
                </div>
                <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 font-bold">JSON backup</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                Exporte todo o seu cronograma e roteiros como um único arquivo físico. Excelente para compartilhar com os coordenadores ou guardar no computador.
              </p>

              <div className="mt-4 bg-purple-50/25 dark:bg-purple-950/20 p-3 border border-dashed border-purple-300 dark:border-purple-800 rounded-none text-center">
                <p className="text-[10px] uppercase font-bold text-purple-900 dark:text-purple-300 font-mono">Total de Horários: {totalSlots} Aulas</p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-purple-100 dark:border-purple-950 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2 font-mono text-[9px] text-center">
                {/* Export file download */}
                <button
                  onClick={onDownloadBackup}
                  className="py-2 border border-purple-900 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-slate-800 text-purple-900 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 rounded-none cursor-pointer transition-all bg-white dark:bg-slate-850"
                  title="Baixar Backup JSON"
                >
                  <Download size={12} />
                  Exportar
                </button>

                {/* Import hidden trigger */}
                <label className="py-2 border border-purple-900 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-slate-800 text-purple-900 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 rounded-none cursor-pointer transition-all bg-white dark:bg-slate-850 text-center select-none">
                  <input
                    type="file"
                    accept=".json"
                    onClick={() => {}}
                    onChange={onImportBackup}
                    className="hidden"
                  />
                  <Upload size={12} />
                  Importar
                </label>
              </div>
              <span className="text-[9px] text-center text-slate-400 dark:text-slate-500 font-mono">
                Importe para restaurar suas notas.
              </span>
            </div>
          </div>

          {/* Progressive Web App (PWA) Install Card */}
          <div className="bg-white border-2 border-purple-900 p-5 rounded-none shadow-[3px_3px_0px_0px_rgba(88,28,135,1)] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-purple-50 border border-purple-300 text-purple-850">
                    <Smartphone size={16} />
                  </span>
                  <h3 className="text-sm font-black text-purple-950 uppercase tracking-wider">Instalar no Aparelho</h3>
                </div>
                {isInstallable ? (
                  <span className="text-[9px] font-black bg-amber-500 text-neutral-950 px-2 font-mono uppercase">Disponível</span>
                ) : (
                  <span className="text-[9px] font-black bg-purple-900 text-white px-2 font-mono uppercase">Ativo PWA</span>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-mono">
                Adicione este planejador à tela de início do seu celular ou área de trabalho do computador para acessar como aplicativo nativo.
              </p>

              {/* Status information */}
              <div className="mt-4 bg-slate-50 p-3 border border-purple-105 space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between text-slate-550">
                  <span>Modo Offline:</span>
                  <span className="text-purple-900 font-bold">Resiliente (PWA)</span>
                </div>
                <div className="flex justify-between text-slate-550">
                  <span>Engine Caching:</span>
                  <span className="text-purple-900 font-bold">Ativo (sw.js)</span>
                </div>
                <div className="flex justify-between text-slate-550">
                  <span>Suporte a Atalhos:</span>
                  <span className="text-purple-900 font-bold">Habilitado</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-purple-100 flex flex-col gap-2">
              <button
                onClick={handleInstallApp}
                className="w-full py-2 bg-purple-900 hover:bg-purple-950 text-white font-mono text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-none cursor-pointer transition-all active:scale-[0.98]"
              >
                <Smartphone size={11} className="inline mr-0.5" />
                Instalar Aplicativo
              </button>
              <span className="text-[9px] text-center text-slate-400 dark:text-slate-500 font-mono">
                Roda em tela cheia fora do navegador.
              </span>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border-2 border-purple-900 dark:border-purple-800 p-6 rounded-none shadow-[3px_3px_0px_0px_rgba(88,28,135,1)] dark:shadow-none space-y-4 transition-colors">
          <div className="flex items-center gap-2 border-b border-purple-100 dark:border-purple-950 pb-2">
            <ShieldCheck size={18} className="text-purple-900 dark:text-purple-305" />
            <h3 className="font-serif italic font-black text-purple-950 dark:text-purple-300">Política de Armazenamento e Integridade de Dados</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-650 dark:text-slate-400 leading-relaxed">
            <div className="space-y-2">
              <h4 className="font-bold text-purple-950 dark:text-purple-300 uppercase tracking-widest font-mono text-[10px]">1. Onde meus dados são salvos?</h4>
              <p>
                Os seus dados de horários, anotações de diário de classe e planejamentos estruturados de aula gerados pela inteligência artificial são armazenados em dois locais simultâneos:
              </p>
              <ul className="list-disc pl-5 font-mono text-[11px] space-y-1">
                <li><strong>Cloud Run Server Storage:</strong> Gravado em nuvem de container em tempo de execução no arquivo `/data/schedule.json`.</li>
                <li><strong>Mídia Local (Smartphone/Navegador):</strong> Gravado em HTML5 LocalStorage, persistindo mesmo que a aba seja reiniciada ou ocorra queda de internet.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-purple-950 dark:text-purple-305 uppercase tracking-widest font-mono text-[10px]">2. Como evitar perda de roteiros?</h4>
              <p>
                Recomendamos que ao final de cada semana pedagógica, você utilize o botão <strong>"Exportar"</strong> na aba de Downloas Físico para baixar um arquivo JSON com todas as suas notas. Em caso de troca de aparelho ou redefinição do smartphone, você pode simplesmente <strong>"Importar"</strong> este arquivo de volta para restabelecer todo o histórico de aulas no mesmo lugar.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-purple-100 dark:border-purple-950 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-305 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-2 text-xs font-medium">
              <AlertTriangle size={15} />
              <span>Deseja recomeçar do zero? Isso limpa todos os planos editados.</span>
            </div>
            
            <button
              onClick={onResetData}
              className="py-1.5 px-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-900 dark:border-rose-800 text-rose-950 dark:text-rose-250 hover:bg-rose-100 dark:hover:bg-rose-900/30 font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 rounded-none cursor-pointer transition-all active:scale-95"
            >
              <RotateCcw size={12} />
              Redefinir Banco de Fábrica
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
