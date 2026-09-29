/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { INITIAL_SLOTS } from "./src/data.js";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(process.cwd(), 'data');
const SCHEDULE_FILE_PATH = path.join(DATA_DIR, 'schedule.json');

// Initialize data folder and seed file if not exists
async function initializeDatabase() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(SCHEDULE_FILE_PATH);
      console.log('Database schedule.json already exists.');
    } catch {
      console.log('Database schedule.json not found. Seeding initial schedule slots...');
      await fs.writeFile(SCHEDULE_FILE_PATH, JSON.stringify(INITIAL_SLOTS, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Failed to initialize database directories:', err);
  }
}

// Lazy safe getter for Gemini Client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// API Routes
app.get("/api/schedule", async (req, res) => {
  try {
    await initializeDatabase();
    const data = await fs.readFile(SCHEDULE_FILE_PATH, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Error fetching schedule:', err);
    res.status(500).json({ error: 'Failed to retrieve schedule from server storage.' });
  }
});

app.post("/api/schedule", async (req, res) => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const slots = req.body;
    if (!Array.isArray(slots)) {
      return res.status(400).json({ error: 'Invalid payload. Expected an array of slots.' });
    }
    await fs.writeFile(SCHEDULE_FILE_PATH, JSON.stringify(slots, null, 2), 'utf-8');
    res.json({ success: true, message: 'Schedule updated and synced with cloud successfully.' });
  } catch (err) {
    console.error('Error saving schedule:', err);
    res.status(500).json({ error: 'Failed to write schedule to server storage.' });
  }
});

app.post("/api/gemini/plan", async (req, res) => {
  try {
    const { subject, topic, turma, notes, periodicity } = req.body;
    if (!subject) {
      return res.status(400).json({ error: 'O nome da disciplina é obrigatório para gerar o plano.' });
    }

    const mode = periodicity || "diario"; // "diario" | "quinzenal" | "trimestral"
    const ai = getGeminiClient();
    if (!ai) {
      // In case key is missing, provide a beautiful placeholder plan depending on periodicity
      let fallbackText = '';
      if (mode === 'quinzenal') {
        fallbackText = `### 📅 Planejamento Quinzenal (Draft Simulado - Chave API Não Fornecida)
**Componente Curricular:** ${subject}
**Turma:** ${turma || 'Ensino Técnico'}
**Período:** Planejamento de 15 Dias Acadêmicos
**Tópico / Foco:** ${topic || 'Fundamentos Técnicos da Área'}

*(Nota: Para utilizar planos gerados em tempo real pela IA Gemini, salve a sua \`GEMINI_API_KEY\` no painel **Settings > Secrets**).*

#### 1. Objetivos Pedagógicos (Alinhamento BNCC para 2 Semanas)
Desenvolver a competência de análise estruturada de sistemas e aplicações voltados para o tema de ${topic || subject} na Escola Estadual Maria Barbosa Leite.

#### 2. Distribuição das Aulas (Quinzena)
- **Semana 1 - Teoria e Alinhamento Temático (100 min total):** Introdução profunda aos conceitos de ${topic || subject}, com exemplos práticos preliminares no projetor.
- **Semana 2 - Laboratório e Fixação Ativa (100 min total):** Criação de protótipos práticos nos computadores do laboratório, aplicação das notas do professor: "${notes || 'Foco em exercitar os comandos fundamentais.'}".

#### 3. Método de Avaliação Pedagogica
Desafio prático individual pontuado para verificar a familiaridade com as tecnologias abordadas.`;
      } else if (mode === 'trimestral') {
        fallbackText = `### 📅 Planejamento Trimestral (Draft Simulado - Chave API Não Fornecida)
**Componente Curricular:** ${subject}
**Turma:** ${turma || 'Ensino Técnico'}
**Período:** Trimestre Letivo de 2026 (Resolução SEE Nº 5.222)
**Objetivo Geral:** ${topic || 'Formação Técnica Profissional'}

*(Nota: Para utilizar planos gerados em tempo real pela IA Gemini, salve a sua \`GEMINI_API_KEY\` no painel **Settings > Secrets**).*

#### 1. Mapeamento de Conteúdos (Eixo Tecnológico)
- **Mês 1 (Fundamentos Básicos):** Introdução às terminologias, arquitetura inicial do tema no dia a dia técnico.
- **Mês 2 (Laboratório Intermediário):** Desenvolvimento guiado, estruturação de blocos de lógica e simulação prática de cenários de TI.
- **Mês 3 (Projetos e Avaliação Trimestral):** Implementação de microsserviço ou projeto final aplicado à comunidade de Varzelândia/MG.

#### 2. Plano de Desenvolvimento Integrado (Notas do Professor)
*Diretrizes:* "${notes || 'Utilização do laboratório de informática duas vezes por semana com acompanhamento ativo.'}"`;
      } else {
        fallbackText = `### 📚 Planejamento Diário (Draft Simulado - Chave API Não Fornecida)
**Componente Curricular:** ${subject}
**Turma:** ${turma || 'Ensino Técnico'}
**Tópico Previsto:** ${topic || 'Fundamentos Técnicos'}

*(Nota: Para utilizar planos gerados em tempo real pela IA Gemini, salve a sua \`GEMINI_API_KEY\` no painel **Settings > Secrets**).*

#### 1. Tema e Objetivos da Aula (Alinhamento BNCC)
Entender de forma simples a importância do tema ${topic || subject} no nosso uso do dia a dia da tecnologia na Escola Estadual Maria Barbosa Leite.

#### 2. Sequência Didática do Dia (50 minutos)
- **Acolhida e Introdução (10 min):** Conversa inicial sobre o tema.
- **Prática Guiada (20 min):** Passo a passo no computador do laboratório.
- **Exercício de Fixação (15 min):** Atividade prática livre pelo aluno.
- **Fechamento e Dúvidas (05 min):** Relembrar tudo que fizemos.

#### 3. Exemplo Prático e Didático
*Notas Adicionais do Professor:* "${notes || 'Explicação prática na lousa e no projetor.'}"`;
      }

      return res.json({ plan: fallbackText });
    }

    let promptPrompt = '';

    if (mode === "quinzenal") {
      promptPrompt = `Você é um excelente Professor Orientador e Docente do Curso Técnico de Informática da Escola Estadual Maria Barbosa Leite.
Sua tarefa é elaborar um Planejamento QUINZENAL (de duas semanas de aula, equivalente a aproximadamente 4 encontros regulares) para a disciplina indicada. O plano deve ser didático, estruturado e alinhado com a BNCC e com as Normas de TI da Escola.

Crie um planejamento quinzenal detalhado em formato Markdown legível em português do Brasil para:
- **Componente Curricular:** ${subject}
- **Eixo Temático / Foco das Semanas:** ${topic || 'Conceitos intermediários e prática laboratorial'}
- **Turma de Estudantes:** ${turma || 'Curso Técnico em Informática'}
- **Anotações prévias do Professor:** ${notes || 'Nenhuma nota provida.'}

Por favor, apresente um cronograma de distribuição de aulas bem dividido, contemplando:
1. **Objetivos Gerais e Habilidades (Alinhamento BNCC para a Quinzena)**: O que se espera que os alunos dominem ao fim destas duas semanas.
2. **Cronograma Detalhado Aula a Aula (Exemplos das próximas aulas)**: Dividido em canais didáticos sugeridos (ex: Encontro 1 e 2: Teoria e Demonstração; Encontro 3 e 4: Laboratório de Desenvolvimento e Prática de Codificação).
3. **Atividade Avaliativa Quinzenal**: Uma proposta de micro-desafio de entrega prática ou laboratório de fixação com duração estimada.
4. **Metodologia de Apoio e Aprendizado Diferenciado**: Como recuperar alunos com dificuldades no Laboratório.

Mantenha o tom profissional, acolhedor e perfeitamente didático aplicado ao Ensino Técnico Médio da Escola Estadual Maria Barbosa Leite, localizada em Varzelândia/MG.`;
    } else if (mode === "trimestral") {
      promptPrompt = `Você é um excelente Professor Orientador e Docente do Curso Técnico de Informática da Escola Estadual Maria Barbosa Leite.
Sua tarefa é elaborar um Planejamento TRIMESTRAL (Plano de Curso para um Trimestre Letivo de 2026, baseado na Resolução SEE Nº 5.222) para a disciplina especificada.

Crie uma proposta de Plano de Trimester em formato Markdown legível em português do Brasil para:
- **Componente Curricular:** ${subject}
- **Grande Tema do Trimestre:** ${topic || 'Doutrina técnica e projetos integradores'}
- **Turma de Estudantes:** ${turma || 'Curso Técnico em Informática'}
- **Diretrizes e Pré-Requisitos (Notas do Professor):** ${notes || 'Nenhum requisito específico especificado.'}

Por favor, organize o plano em seções profissionais de coordenação pedagógica contendo:
1. **Apresentação e Relevância Tecnológica**: Por que este componente é estudado de forma essencial neste período.
2. **Matriz de Competências e Habilidades (Referencial BNCC)**: Quais são as metas oficiais descritas.
3. **Plano de Conteúdos Programáticos (Mês a Mês)**: Divisão sugerida de temas (Mês 1: Aquisição de bases teóricas; Mês 2: Estudo de Casos reais e Práticas guiadas; Mês 3: Consolidação e Projeto de Conclusão).
4. **Projeto Prático Integrador do Trimestre**: Uma atividade ou sistema simulado que unifique os saberes desenvolvidos.
5. **Critérios de Recuperação e Avaliação Paralela**: Diretrizes em conformidade com as regras pedagógicas de Minas Gerais para assegurar a aprovação qualificada.

Seja muito formal, focado e completo, trazendo credibilidade à equipe pedagógica da Escola Estadual Maria Barbosa Leite.`;
    } else {
      promptPrompt = `Você é um excelente Professor Orientador e Docente do Curso Técnico de Informática da Escola Estadual Maria Barbosa Leite.
Sua tarefa é elaborar um Planejamento Diário simples, didático e de fácil compreensão para os alunos do Ensino Médio, estritamente alinhado com as diretrizes da BNCC (Base Nacional Comum Curricular) e com as Normas da Escola.

Crie um plano de aula completo em formato Markdown legível em português do Brasil para:
- **Componente Curricular:** ${subject}
- **Tópico Principal / Assunto do Dia:** ${topic || 'Conceitos gerais e laboratório prático'}
- **Turma de Estudantes:** ${turma || 'Curso Técnico em Informática'}
- **Anotações previas do Professor:** ${notes || 'Nenhuma nota provida.'}

Por favor, estruture seu plano de aula com as seguintes seções em Markdown elegante, mantendo uma linguagem clara e acessível aos estudantes, baseando-se em uma Sequência Didática Diária (50 minutos):
1. **Tema e Objetivos da Aula (Alinhamento BNCC)**: (O que vamos aprender hoje? Quais habilidades serão desenvolvidas de forma simples e direta)
2. **Sequência Didática do Dia (50 minutos)**: (Ex: Acolhida e Introdução - 10 min, Prática Guiada - 20 min, Exercício de Fixação - 15 min, Fechamento e Dúvidas - 5 min)
3. **Exemplo Prático e Didático**: (Ensine um conceito passo a passo usando uma linguagem de muito fácil entendimento, como se estivesse explicando diretamente para um adolescente no projeto)
4. **Desafio do Dia**: (Proponha 1 ou 2 atividades práticas envolventes para serem desenvolvidas individualmente ou em dupla no laboratório)
5. **Avaliação e Resultados Esperados**: (Como saberemos se os alunos compreenderam o assunto? Critérios simples).

Seja encorajador, muito acessível, perfeitamente didático, profissional, e aplique a realidade da Escola Estadual Maria Barbosa Leite.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptPrompt,
      config: {
        systemInstruction: "Você é um assistente pedagógico especializado para professores de cursos técnicos de informática de nível médio e superior.",
      }
    });

    res.json({ plan: response.text });
  } catch (err: any) {
    console.error('Error calling Gemini API:', err);
    res.status(500).json({ error: 'Erro ao gerar o plano de aula via Inteligência Artificial Gemini: ' + err.message });
  }
});

// Setup Vite or Static File Serving
async function setupViteAndStatic() {
  await initializeDatabase();
  
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open in browser to use: http://localhost:${PORT}`);
  });
}

setupViteAndStatic();
