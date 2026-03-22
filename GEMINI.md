# Zenbolso — Living Spec & AI Memory

> **Protocolo de Reset:** Quando o usuário disser **"Reset"**, leia este arquivo inteiro e resuma as **Regras de Engenharia** e os itens do **AI Memory** para confirmar alinhamento antes de qualquer ação.

---

## 🎯 Domínio e Verdades Absolutas

Zenbolso é um **gerenciador financeiro pessoal focado em Privacidade Extrema e Performance Offline-First**.

| Verdade Absoluta | Descrição |
| :--- | :--- |
| **Local-First Sempre Vence** | Toda persistência primária é local via **Dexie.js (IndexedDB)**. A UI nunca deve depender de rede para funcionar. |
| **Dados não saem sem criptografia** | Qualquer sincronização remota (Google Drive, Supabase) deve usar `crypto-js` para criptografia ponta-a-ponta antes do envio. |
| **Mobile-First é lei** | O layout foi desenhado para `max-w-[430px]`. Nunca introduzir layouts que quebrem a experiência mobile. |
| **Supabase é opcional** | Supabase é usado *apenas* para sincronização opcional; nunca como fonte de verdade primária. |

---

## 🛠 Stack Técnica (Zero Adivinhação)

- **Core:** React 19 + Vite 6 + TypeScript 5 (Strict Mode)
- **Banco de Dados Local:** `dexie` v4 + `dexie-react-hooks` v4 — Arquitetura Local-First
- **Sync Remoto (opcional):** `@supabase/supabase-js` v2 + `crypto-js` v4 (criptografia antes de qualquer upload)
- **Estilização:** Tailwind CSS v3 (Mobile-First: `max-w-[430px]`) + `tailwind-merge` + `clsx`
- **Roteamento:** `react-router-dom` v7
- **Estado Servidor:** `@tanstack/react-query` v5
- **Formulários/Validação:** Zod (obrigatório para dados externos/input do usuário)
- **Utilitários:** `date-fns` v4, `uuid` v11, `fuse.js` v7, `rrule` v2 (recorrências), `lucide-react` (ícones)
- **Exportação:** `@react-pdf/renderer`, `jspdf`, `file-saver`, `html2canvas`
- **Testes:** Vitest v4 + `@testing-library/react` v16 + Playwright v1 (E2E)

---

## 🗂 Mapa de Arquitetura (`src/`)

```
src/
├── App.tsx              # Roteamento principal
├── pages/               # Componentes de página (smart, compõem hooks + UI)
├── components/          # Componentes de UI puros e reutilizáveis
├── hooks/               # Custom hooks (useFinanceData, useTransactionForm, etc.)
│   └── queries/         # Hooks de query (react-query)
├── services/            # Lógica de negócio e acesso ao banco de dados
│   ├── db.ts            # ⭐ Definição do schema Dexie (fonte de verdade do DB)
│   ├── transactionService.ts
│   ├── accountService.ts
│   ├── categoryService.ts
│   ├── recurringService.ts
│   ├── dashboard.service.ts
│   ├── dataExportService.ts
│   ├── googleDrive.ts   # Sync com Google Drive (criptografado)
│   ├── insights.ts
│   ├── gamification.ts
│   └── domain/          # Regras de domínio puras
├── contexts/            # React Contexts (estado global de UI)
├── lib/
│   └── supabase.ts      # Cliente Supabase (instância única)
├── utils/               # Funções puras utilitárias
├── types/               # Definições de tipo TypeScript globais
├── constants/           # Constantes da aplicação
└── routes/              # Definições de rotas
```

---

## 📏 Regras de Engenharia (The Golden Rules)

| Conceito | Regra Estrita | Motivo |
| :--- | :--- | :--- |
| **Tipagem** | Proibido `any` ou `as unknown`. Usar Zod para validar dados externos e de formulários. | Segurança em runtime e DX. |
| **Arquitetura** | Lógica de DB **apenas** em `services/`. Componentes consomem dados via `hooks/`. | Componentes devem ser puros (UI). |
| **Estado Local** | `useState` / Signals para estado de UI efêmero. | Separação de responsabilidades. |
| **Estado Reativo do DB** | Usar `useLiveQuery` do `dexie-react-hooks` para dados que devem ser reativos ao IndexedDB. | Reatividade nativa Local-First. |
| **Estado Servidor** | `@tanstack/react-query` para dados de APIs remotas (Supabase). | Cache, stale-while-revalidate, retry automático. |
| **Limites de Arquivo** | Máximo **200 linhas** por arquivo. Extrair para hooks ou utility modules se ultrapassar. | SRP — Single Responsibility Principle. |
| **Testes (TDD)** | Ciclo **Red → Green → Refactor**. Nenhuma feature sem teste unitário correspondente. | Garantia de não-regressão. |
| **Segurança de Números** | Todo valor financeiro deve ser tratado com `Number()` + validação contra `NaN` antes de qualquer operação ou renderização. | Previne `NaN` silencioso na UI. |
| **Criptografia** | Toda escrita em storage remoto (Drive/Supabase) deve passar por `crypto-js` antes do envio. | Privacidade ponta-a-ponta. |
| **Recorrências** | Usar `rrule` para calcular datas de transações recorrentes. Nunca implementar lógica de recorrência manual. | Precisão e manutenibilidade. |

---

## 🧠 AI Memory (Log de Erros e Decisões — Prevenção de Recorrência)

> **Protocolo:** Ao final de cada feature ou correção de bug complexo, o assistente deve perguntar: *"Devemos adicionar algum aprendizado à seção AI Memory do GEMINI.md?"*

| Data | Categoria | Descrição do Problema | Correção Definitiva Aplicada |
| :--- | :--- | :--- | :--- |
| 2026-03-22 | **Persistência** | Proibido usar `localStorage` para dados financeiros (limite de ~5MB de quota e ausência de suporte a transações ACID). | Usar **exclusivamente Dexie/IndexedDB** para dados financeiros. |
| 2026-03-22 | **Sanitização / NaN** | Retornos do Dexie com campos `undefined` ou `null` causavam `NaN` silencioso em somas e formatações na UI. | Todo valor numérico retornado do DB deve ser sanitizado com `Number(value) \|\| 0` ou Zod antes de qualquer operação aritmética. Ver `NUMBER_SAFETY_GUIDE.md` na raiz. |
| 2026-03-22 | **TypeScript** | Longos ciclos de erros de compilação (`tsc_errors_*.log`) causados por `any` implícito e retornos não tipados de queries Dexie. | Ativar `"strict": true` no `tsconfig.json` e tipar todos os retornos de `services/` explicitamente. |
| 2026-03-22 | **Arquitetura** | Lógica de negócio (cálculos de saldo, filtros de período) estava sendo implementada diretamente em componentes de página. | Mover toda lógica para `services/` (pura, sem React) ou `hooks/` (com React). Componentes só recebem dados prontos. |
| 2026-03-22 | **Reset / Persistência** | `SettingsPage.tsx` usava `localStorage.clear()` no botão "Resetar Aplicativo". Como os dados financeiros vivem no **IndexedDB (Dexie)**, a ação era completamente ineficaz — os dados **não eram apagados**. | Sempre usar `clearAllData()` via `services/api.ts` (que chama Dexie internamente) antes do `window.location.reload()`. Nunca usar `localStorage.clear()` para resetar estado financeiro. |
| 2026-03-22 | **Reutilização de Hooks** | `NewTransactionModal.tsx` (243 linhas) reimplementava estado de formulário e lógica de submit já existentes em `useTransactionForm.ts`, ignorando o hook próprio do projeto. | Antes de criar `useState` + handlers num componente, verificar se já existe um hook em `hooks/` que resolve o problema. Componentes de modal/form devem ser **consumidores** de hooks, não reimplementadores. |
| 2026-03-22 | **Monolito de Componente** | `SettingsModal.tsx` chegou a **574 linhas** por acumular 6 abas completas (UI + handlers + estado) num único arquivo, inviabilizando testes por aba e aumentando risco de regressão. | Cada aba deve ser um componente próprio em `components/settings/tabs/`. Lógica compartilhada vai para `hooks/useSettingsData.ts`. O arquivo-pai fica apenas com o shell de navegação entre abas. |
| 2026-03-22 | **TDD para Golden Rule Guards** | Ao corrigir o bug do `resetApp`, precisávamos garantir que a ordem `db.delete() → db.open() → localStorage.clear()` fosse preservada para sempre e nunca regredisse. | Criar testes unitários específicos para **regras de negócio críticas** (`hooks/__tests__/useSettingsData.test.ts`). Mockar o Dexie com `vi.mock('../../services/db')` e verificar a ordem de invocação com `mock.invocationCallOrder[0]`. O teste vira o guardião permanente da Golden Rule. |
| 2026-03-22 | **Padrão de Decomposição de Modal com Abas** | Modais com múltiplas abas tendem a crescer indefinidamente por acumular estado, handlers e JSX de cada aba no mesmo arquivo, tornando impossível testar cada aba isoladamente. | Padrão definitivo: (1) `useXxxData.ts` — estado de controle + ações perigosas; (2) `tabs/XxxTab.tsx` — UI pura via props, zero estado próprio; (3) `XxxModal.tsx` — shell com `TAB_CONFIG` array + composição. Cada camada tem responsabilidade única e é testável de forma independente. |

---

## 🚀 Comandos Rápidos

```bash
# Desenvolvimento
npm run dev

# Build de produção (executa tsc primeiro)
npm run build

# Preview do build
npm run preview

# Testes unitários (Vitest)
npm run test

# Testes E2E (Playwright) — requer `npm run dev` rodando
npx playwright test

# Lint (se configurado)
npm run lint
```

---

## 🔄 Protocolo de Operação (Nosso Contrato)

1. **Reset:** Quando o usuário disser "Reset", leia este arquivo e resuma as **Engineering Rules** e o **AI Memory** antes de qualquer ação.
2. **TDD Obrigatório:** Nunca implementar uma feature sem **primeiro** definir ou criar os testes unitários correspondentes.
3. **Atualização Pós-Task:** Ao final de cada feature ou bug fix complexo, perguntar: *"Devemos adicionar algum aprendizado à seção AI Memory do GEMINI.md?"*
4. **Guarda de Arquitetura:** Se qualquer código violar uma regra desta spec (ex: `any`, lógica de DB em componente, localStorage para dados), interromper e sugerir a correção baseada neste arquivo.
5. **Limite de Arquivo:** Ao identificar um arquivo com mais de 200 linhas, sugerir proativamente a extração para hooks ou utility modules.
