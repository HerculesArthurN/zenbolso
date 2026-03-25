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
| 2026-03-22 | **Validação de Payload (Zod)** | Operações diretas no Dexie sem validação criam risco de inconsistência. | Todo formulário que vai para o IndexedDB deve ser validado via `zod` dentro de seu respectivo Custom Hook. O componente React UI é estritamente "burro" e apenas consome o objeto `errors` gerado por `.safeParse()`. |
| 2026-03-22 | **Manipulação de Datas (Time/Timezone)** | A reinvenção de funções nativas de `Date` gera bugs de timezone e dificulta a manutenção do código. | É estritamente proibido reinventar a roda com funções nativas de `Date`. Toda lógica temporal deve ser isolada em `utils/` utilizando a biblioteca `date-fns` para garantir determinismo. |
| 2026-03-22 | **UX Offline-first (Optimistic Updates)** | Todas as mutações em listas (Adicionar, Deletar, Atualizar) devem refletir na UI instantaneamente através de Atualizações Otimistas no estado local do Hook, antes ou em paralelo à chamada do Service do IndexedDB. Isso garante a sensação de latência zero ("snappy UX") característica de apps nativos. |
| 2026-03-24 | **Ergonomia Mobile (Touch Targets & Gestures)** | Proibido botões muito pequenos apertados na UI. | É obrigatório garantir uma área de clique de no mínimo 44x44px. Para itens de lista, o aplicativo utiliza gestos de exclusão e edição (Swipe-to-Action) para liberar espaço visual, evitando cliques acidentais e melhorando a "Native Feel". |
| 2026-03-24 | **Estratégia de Cache PWA:** | Perda da Base Dexie por falha de caching de App Shell. | O Service Worker deve adotar a estratégia `CacheFirst` para assets estáticos (JS, CSS, Imagens) através do `vite-plugin-pwa`. Atualizações de App Shell não podem bloquear a UI principal nem conflitar com o ciclo de vida do banco Dexie (`indexedDB`). |
| 2026-03-24 | **Seed Data Temporal (Munição de Festim):** | Gráficos e resumos vazios porque a base mockada tinha anos *hardcoded*. | É estritamente proibido hardcodar anos ou meses (ex: "2026-01-01") ao gerar dados de teste. A `seedService` deve SEMPRE utilizar a data atual (`new Date()`) e a biblioteca `date-fns` para espalhar as transações falsas pelo mês corrente. Isso garante que o Dashboard sempre exiba gráficos preenchidos no exato momento da instalação. |
| 2026-03-24 | **Segurança Física (App Lock):** | A privacidade local exige proteção contra acesso físico indevido. | Credenciais de bloqueio (PIN) NUNCA devem ser salvas em texto plano (plain-text). Deve-se utilizar funções de Hash (ex: SHA-256 via Web Crypto API) para armazenar e comparar a chave de acesso. A tela de bloqueio deve interceptar a árvore de renderização do React no nível mais alto possível (`App.tsx`), impedindo o vazamento de dados via DOM. |
| 2026-03-25 | **Protocolo Fantasma (Local-First Recovery):** | App Lock sem botão de esquecimento leva a "Bricking" se o usuário esquecer o PIN. | Em arquiteturas de privacidade extrema com criptografia local, não existe "Recuperação de Senha". A perda da credencial de acesso (PIN) resulta na perda irreversível dos dados. A UI deve sempre fornecer uma "Saída de Emergência" (Hard Reset) na tela de bloqueio para evitar o bloqueio permanente do software, alertando o usuário sobre a destruição total do banco de dados (Dexie). |

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
