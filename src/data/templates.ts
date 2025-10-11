import type { TopicTemplate } from "@/types";

export const defaultTemplates: TopicTemplate[] = [
  {
    id: "debate",
    name: "Debate",
    icon: "💬",
    description: "Estrutura para debates e discussões políticas",
    defaultTitle: "Novo Debate",
    defaultContent: `
<h2>📋 Tese Principal</h2>
<p>Descreva a tese ou posição principal do debate...</p>

<h2>✅ Argumentos a Favor</h2>
<ul>
  <li>Argumento 1</li>
  <li>Argumento 2</li>
  <li>Argumento 3</li>
</ul>

<h2>❌ Contra-argumentos</h2>
<ul>
  <li>Contra-argumento 1</li>
  <li>Contra-argumento 2</li>
  <li>Contra-argumento 3</li>
</ul>

<h2>🎯 Conclusão</h2>
<p>Sua análise final e posicionamento...</p>
    `.trim(),
    defaultTags: ["debate", "política", "argumentação"],
    isCustom: false,
  },
  {
    id: "entrevista",
    name: "Entrevista",
    icon: "🎤",
    description: "Template para anotações de entrevistas políticas",
    defaultTitle: "Entrevista - [Nome do Entrevistado]",
    defaultContent: `
<h2>👤 Entrevistado</h2>
<p><strong>Nome:</strong> [Nome completo]</p>
<p><strong>Cargo:</strong> [Cargo/posição]</p>
<p><strong>Data:</strong> [Data da entrevista]</p>

<h2>📺 Contexto</h2>
<p>Contexto da entrevista, programa, evento...</p>

<h2>💡 Principais Pontos</h2>
<ul>
  <li>Ponto 1</li>
  <li>Ponto 2</li>
  <li>Ponto 3</li>
</ul>

<h2>📝 Observações</h2>
<p>Observações importantes, tom, reações...</p>

<h2>🔗 Links</h2>
<p>Links relevantes, vídeos, artigos...</p>
    `.trim(),
    defaultTags: ["entrevista", "política", "mídia"],
    isCustom: false,
  },
  {
    id: "analise-politica",
    name: "Análise Política",
    icon: "📊",
    description: "Estrutura para análises políticas detalhadas",
    defaultTitle: "Análise: [Tema]",
    defaultContent: `
<h2>🎯 Tema Central</h2>
<p>Descrição do tema ou questão política...</p>

<h2>📅 Contexto Histórico</h2>
<p>Contexto histórico e antecedentes...</p>

<h2>🔍 Análise Atual</h2>
<p>Análise da situação atual...</p>

<h2>👥 Principais Atores</h2>
<ul>
  <li>Actor 1</li>
  <li>Actor 2</li>
  <li>Actor 3</li>
</ul>

<h2>📈 Impactos e Consequências</h2>
<p>Possíveis impactos e consequências...</p>

<h2>🔮 Perspectivas Futuras</h2>
<p>Cenários futuros e tendências...</p>
    `.trim(),
    defaultTags: ["análise", "política", "contexto"],
    isCustom: false,
  },
  {
    id: "anotacao-rapida",
    name: "Anotação Rápida",
    icon: "⚡",
    description: "Template simples para anotações rápidas",
    defaultTitle: "Anotação Rápida",
    defaultContent: `
<p>Escreva suas anotações aqui...</p>
    `.trim(),
    defaultTags: ["rápida", "notas"],
    isCustom: false,
  },
];
