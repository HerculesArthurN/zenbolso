# ROADMAP.md — ZenBolso Milestone 1: Desktop & Cleanup

## Milestone Goal
Transformar o ZenBolso de uma demo mobile-first em um app de finanças pessoais funcional no desktop, limpo, sem código morto, e com features básicas completas.

**Target:** App funcional no desktop, sem Supabase auth, com Planning page implementada, SettingsPage decomposta.

---

## Phase 1 — Desktop Layout & Responsiveness
**Status:** `[ ] Not Started`
**Covers:** R-101, R-102, R-103, R-104, R-105

### Goal
Transformar o layout do app de mobile-only para genuinamente responsivo. No desktop, o app deve usar o espaço disponível de forma inteligente — não ser um retângulo de 430px flutuando no centro.

### Plans
- **1-01** `layout` — Criar sistema de layout responsivo: breakpoint `md` (768px) colapsa para mobile shell, acima disso usa tela toda com sidebar de navegação
- **1-02** `nav` — Substituir bottom tab bar por sidebar collapsível no desktop; manter bottom nav em mobile
- **1-03** `interactions` — Auditar e corrigir todos os botões/CTAs que não funcionam com mouse (hover states, focus rings, click areas)

### UAT / Verification
- [ ] Em viewport 1280px: app ocupa o espaço disponível com sidebar visível
- [ ] Em viewport 375px: app aparece como mobile com bottom nav
- [ ] Todos os botões do Dashboard são clicáveis com mouse sem sobreposição
- [ ] Sidebar colapsa/expande em telas intermediárias

---

## Phase 2 — Cleanup & Dead Code Removal
**Status:** `[x] Done`
**Covers:** R-201, R-202, R-203, R-204, R-205, R-206

### Goal
Eliminar tudo que não é usado: Supabase auth/login, multi-moeda, multi-idioma, rotas mortas, componentes órfãos. O app deve ser honesto sobre o que é — uma tool pessoal, pt-BR, BRL.

### Plans
- **2-01** `auth-removal` — Deletar `LoginPage.tsx`, rota `/login`, hooks de auth Supabase, `SessionContext` auth-related logic
- **2-02** `simplification` — Remover seletores de moeda/idioma, remover formatters multi-currency, manter apenas BRL/pt-BR; remover `AdminPage.tsx` se não usada
- **2-03** `dead-code` — Auditoria de imports não usados, componentes sem referência, hooks órfãos; executar `tsc` e corrigir erros resultantes

### UAT / Verification
- [x] Rota `/login` não existe mais (404)
- [x] Não há seletor de moeda na UI
- [x] `npm run build` passa sem warnings de imports não usados
- [x] `tsc` passa sem erros

---

## Phase 3 — Core Feature Completion & Quality
**Status:** `[x] Done`
**Covers:** R-301, R-302, R-303, R-304, R-305, R-306

### Goal
Finalizar o que está incompleto: implementar Planning/Metas, decompor SettingsPage, adicionar testes nas camadas críticas, eliminar `any` types do core.

### Plans
- **3-01** `planning-page` — Implementar `Planning.tsx` com UI de Metas: listar, criar (nome + valor alvo + prazo), marcar progresso; serviço `goalService.ts` usando tabela `goals` já no Dexie schema
- **3-02** `settings-decomp` — Decompor `SettingsPage.tsx` (27KB) em `components/settings/tabs/` — um componente por aba; `useSettingsData.ts` para lógica compartilhada; shell pai ≤200 linhas
- **3-03** `types-and-tests` — Eliminar `any` em `db.ts` e `transactionService.ts`; escrever testes unitários para `transactionService` (CRUD + criptografia) e `accountService` (CRUD + saldo)

### UAT / Verification
- [x] Rota `/planning` renderiza lista de metas + formulário de criação
- [x] Meta criada persiste após reload (IndexedDB)
- [x] `SettingsPage.tsx` tem menos de 200 linhas
- [x] Cada aba de settings é um componente isolado em `components/settings/tabs/`
- [x] `npm run test` passa com cobertura de `transactionService` e `accountService`
- [x] `tsc` sem erros de `any` implícito

---

## Milestone Summary

| Phase | Focus | Effort |
|-------|-------|--------|
| Phase 1 | Desktop layout + botões funcionando | Medium |
| Phase 2 | Remover auth Supabase + dead code | Medium |
| Phase 3 | Planning page + Settings decomp + testes | High |

**Total:** ~3 fases coarse, sequenciais (cada fase pode ser independente mas Phase 2 facilita Phase 3)

---

## Completed Phases

- **Phase 2:** Cleanup & Dead Code Removal
- **Phase 3:** Core Feature Completion & Quality
