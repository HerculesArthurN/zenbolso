# ZenBolso — PROJECT.md

## What This Is

**ZenBolso** é um gerenciador financeiro pessoal local-first e offline-first. É um projeto **acadêmico/de aprendizagem** para explorar o uso de AI na criação de software, usado exclusivamente pelo desenvolvedor (Hercules).

**Este NÃO é um SaaS.** A decisão de criar um produto multi-usuário foi abandonada. O foco está em um app pessoal, funcional, limpo e veloz.

## Core Value

> Um dashboard financeiro pessoal que funciona perfeitamente no desktop, com zero dependência de rede, sem código morto, e que cobre o ciclo básico de finanças pessoais: lançar, categorizar, visualizar, recorrer e exportar.

## Context

- **Usuários:** 1 (o próprio desenvolvedor)
- **Plataforma primária:** Desktop (browser no desktop — não é mais mobile-first)
- **Persistência:** IndexedDB via Dexie v4 — 100% local, sem servidor
- **Sync remoto:** Removido desta versão — Supabase era opcional e adiciona complexidade desnecessária
- **Idioma:** Português brasileiro (pt-BR) — apenas
- **Moeda:** BRL (Real Brasileiro) — apenas

## Requirements

### Validated (já implementado e funciona)

- ✓ Persistência local com Dexie/IndexedDB — stable
- ✓ Transações (criar, editar, deletar) — stable
- ✓ Categorias padrão com ícones e cores — stable
- ✓ Contas múltiplas (Carteira, etc.) — stable
- ✓ Transações recorrentes via `rrule` — stable
- ✓ App Lock (PIN via Web Crypto API) — stable
- ✓ PWA com service worker — stable
- ✓ Dashboard com gráficos (Recharts) — stable
- ✓ Exportação de dados (CSV, PDF) — stable
- ✓ Criptografia AES de campos sensíveis — stable
- ✓ Sistema de conquistas/gamificação — stable

### Active (o que este milestone entrega)

- [ ] Layout responsivo para desktop — app sai do container `max-w-[430px]` exclusivo em telas grandes
- [ ] UX desktop funcional — botões e interações que funcionam corretamente no desktop
- [ ] Remoção de LoginPage e autenticação Supabase — código morto eliminado
- [ ] Remoção de multi-moeda e multi-idioma — simplificação de codebase
- [ ] Planning.tsx implementado — página de metas/orçamento funcional
- [ ] SettingsPage.tsx decomposto — de 27KB monolito para componentes por aba
- [ ] Cobertura de testes nas features críticas — transactionService, accountService

### Out of Scope

- Autenticação multi-usuário — projeto pessoal, desnecessário
- Supabase como sync feature — removed, aumenta complexidade sem benefício
- Multi-currency — só BRL
- Multi-language — só pt-BR
- Google Drive sync — fora deste milestone
- Deploy em produção / SaaS — não é mais o objetivo

## Key Decisions

| Decisão | Racional | Outcome |
|---------|---------|---------|
| Projeto pessoal, não SaaS | Reduz escopo, foca qualidade | Removemos auth, multi-user |
| Desktop-first | Desenvolvedor usa desktop | Layout responsivo > mobile-only |
| Remover Supabase auth | Nunca foi usado em produção | LoginPage deletada |
| pt-BR + BRL apenas | Único usuário, única moeda | Remove i18n e currency switches |
| SettingsPage decomposição | 27KB monolito não testável | Aba por componente |

## Evolution

Este documento evolui a cada transição de fase e milestone.

**Após cada fase** — revisar Requirements Active vs Validated.
**Após milestone** — atualizar "What This Is" se o projeto derivou.

---
*Last updated: 2026-03-29 — Milestone 1: Desktop & Cleanup*
