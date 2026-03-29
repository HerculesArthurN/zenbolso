# REQUIREMENTS.md — ZenBolso Milestone 1

## Milestone: Desktop & Cleanup
*Transformar o ZenBolso de uma demo mobile em um app de finanças pessoais funcional no desktop, eliminando código morto e finalizando features básicas.*

---

## Phase 1 — Desktop Responsiveness [P1]

| ID | Requirement | Priority |
|----|------------|---------|
| R-101 | Layout deve ser responsivo: mobile (<768px) mantém visual atual; desktop (≥768px) usa espaço disponível com sidebar ou layout de duas colunas | MUST |
| R-102 | Remover restrição `max-w-[430px]` como único modo de exibição — substituir por `max-w-[430px]` em mobile e layout expandido em desktop | MUST |
| R-103 | Todos os botões e interações (clique, hover, focus) funcionam com mouse e teclado no desktop | MUST |
| R-104 | Navbar/navegação adaptada: bottom tab bar em mobile, sidebar ou top nav em desktop | MUST |
| R-105 | Touch targets (mínimo 44×44px) mantidos em mobile; desktop pode usar elementos menores se necessário | SHOULD |

## Phase 2 — Cleanup & Simplification [P2]

| ID | Requirement | Priority |
|----|------------|---------|
| R-201 | Remover `LoginPage.tsx` e todo o fluxo de autenticação Supabase da UI | MUST |
| R-202 | Remover quaisquer referências a multi-moeda (currency switcher, formatters de moeda além de BRL) | MUST |
| R-203 | Remover strings de i18n e qualquer seletor de idioma — app é 100% pt-BR | MUST |
| R-204 | Remover rotas, componentes e hooks que sã mortos (nunca chamados) — auditoria de dead code | MUST |
| R-205 | `sync_queue` table no Dexie pode ser mantida mas sem consumidor ativo — remover qualquer UI de sync que não funciona | SHOULD |
| R-206 | `LoginPage.tsx` removida = rota `/login` inexistente; App sempre inicia no Dashboard (após onboarding) | MUST |

## Phase 3 — Core Feature Completion [P3]

| ID | Requirement | Priority |
|----|------------|---------|
| R-301 | `Planning.tsx` implementada — página de Metas/Orçamento com pelo menos: listar metas, adicionar meta com valor alvo e prazo, marcar progresso | MUST |
| R-302 | `SettingsPage.tsx` decomposta em componentes por aba (`tabs/ProfileTab`, `tabs/SecurityTab`, `tabs/DataTab`, etc.) | MUST |
| R-303 | `SettingsPage.tsx` final com menos de 200 linhas (apenas shell de navegação) | MUST |
| R-304 | Cobertura de testes unitários para `transactionService.ts` — CRUD + criptografia | MUST |
| R-305 | Cobertura de testes unitários para `accountService.ts` — CRUD + cálculo de saldo | SHOULD |
| R-306 | Tipos `any` eliminados de `db.ts` e `transactionService.ts` — substituídos por tipos explícitos | SHOULD |

---

## Non-Functional Requirements

| ID | Requirement |
|----|------------|
| NFR-1 | App continua funcionando 100% offline (local-first não é negociável) |
| NFR-2 | Nenhum dado sai do browser sem criptografia |
| NFR-3 | Build TypeScript sem erros (`tsc` passa) |
| NFR-4 | Testes unitários existentes continuam passando |

---

## Out of Scope (Este Milestone)

- Supabase sync / Google Drive backup
- Multi-currency
- Multi-language / i18n
- Sistema de gamificação (reviews/tweaks)
- Exportação avançada de PDF
- Relatórios adicionais
