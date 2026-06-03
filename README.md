# 🧘 Zenbolso — Gestor Financeiro Pessoal Local-First

O **Zenbolso** é um organizador de orçamento pessoal e familiar projetado sob o paradigma **Local-First**, garantindo privacidade absoluta dos dados financeiros e performance offline instantânea.

A aplicação adota uma interface otimizada para o uso móvel ("max-w-[430px]") e introduz o indicador comportamental de **"Custo de Tempo de Vida"**, convertendo despesas em horas de trabalho reais do usuário para promover a conscientização financeira.

---

## 🛠️ Stack Tecnológica

O projeto é desenvolvido de ponta a ponta em **TypeScript**, garantindo tipagem estática rigorosa em todas as camadas:

- **Frontend (Client-Side):** React 19, Vite 6 e React Router v7.
- **Ambiente de Desenvolvimento:** Node.js 18+.
- **Estilização & Componentes:** Tailwind CSS v3 e Lucide React (mobile-first responsivo).
- **Banco de Dados Local:** IndexedDB gerenciado via **Dexie.js** (única fonte de verdade).
- **Sincronização em Nuvem (Opcional):** Integração com Supabase (PostgreSQL) usando criptografia ponta a ponta no cliente via `crypto-js`.
- **Validação de Fronteiras:** Zod (schemas de formulário e dados externos).
- **Suíte de Testes:** Vitest e Testing Library para testes unitários; Playwright para testes de fumaça (E2E).

---

## 🚀 Guia de Setup Rápido

### Pré-requisitos
- Node.js v18 ou superior instalado.

### Passo 1: Instalação das Dependências
```bash
npm install
```

### Passo 2: Inicializar o Servidor de Desenvolvimento
```bash
npm run dev
```
O servidor estará disponível localmente na porta configurada (geralmente `http://localhost:3000`).

### Passo 3: Executar a Suíte de Testes Unitários
```bash
npm run test
```

### Passo 4: Compilar para Produção (Static Build)
```bash
npm run build
```
O build estático e minificado será exportado para o diretório `/dist`.

---

## 🏗️ Arquitetura Macro da Solução

O fluxo de dados da aplicação funciona de forma estritamente unidirecional e cliente-centrada:

```
┌──────────────────────────────────────────────┐
│            CAMADA DE INTERFACE (UI)          │
│ Componentes Declarativos React 19 (Dumb)     │
└──────────────────────┬───────────────────────┘
                       │ (Leitura / useLiveQuery)
                       ▼
┌──────────────────────────────────────────────┐
│           ESTADO REATIVO LOCAL (Dexie)       │
│ Consulta IndexedDB em Tempo Real (Offline)   │
└──────────────────────┬───────────────────────┘
                       │ (Mutações Otimistas)
                       ▼
┌──────────────────────────────────────────────┐
│       SERVIÇOS DE DOMÍNIO / PERSISTÊNCIA     │
│ Camada Pura de Persistência (services/)      │
└──────────────────────┬───────────────────────┘
                       │ (Sync Opcional + Cripto)
                       ▼
┌──────────────────────────────────────────────┐
│          NUVEM (Supabase / Drive)            │
│ Criptografado no Cliente antes do Envio      │
└──────────────────────────────────────────────┘
```

A documentação detalhada das regras de engenharia está dividida em:
- [Diretrizes de Arquitetura (docs/arquitetura.md)](docs/arquitetura.md)
- [Segurança e Privacidade (docs/seguranca.md)](docs/seguranca.md)
- [Diretrizes Visuais e UX (docs/visual.md)](docs/visual.md)

---
<p align="center">
  Desenvolvido por <b>Hércules</b> com disciplina arquitetural e compromisso inabalável com a privacidade do usuário.
</p>
