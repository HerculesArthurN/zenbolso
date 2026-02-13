# Documentação Técnica: ZenBolso

**Versão:** 1.3.0  
**Última Atualização:** Janeiro 2026  
**Arquitetura:** Local-First Progressive Web Application

---

## 1. Visão Geral do Projeto

### 1.1 Objetivo do Sistema

O **ZenBolso** é um gerenciador financeiro pessoal projetado para transformar a gestão de finanças de uma tarefa mecânica em uma experiência de conscientização comportamental. O sistema utiliza métricas baseadas em "custo de tempo de vida" para traduzir gastos monetários em horas de trabalho, proporcionando uma percepção tangível do impacto financeiro de cada decisão.

### 1.2 Problema que Resolve

**Fricção Operacional:**
- Aplicativos tradicionais de finanças exigem múltiplos cliques e formulários complexos para registrar uma única transação.
- Falta de feedback imediato gera abandono e inconsistência nos registros.

**Abstração do Valor:**
- Números monetários abstratos não comunicam o custo real em termos de esforço pessoal.
- Usuários não conseguem visualizar o impacto de pequenas despesas recorrentes.

**Dependência de Conectividade:**
- Sistemas tradicionais falham ou apresentam latência em ambientes offline.
- Perda de dados em caso de falha de sincronização.

### 1.3 Público-Alvo

- **Profissionais Liberais e Autônomos:** Necessitam de controle financeiro ágil sem burocracia.
- **Usuários Conscientes de Privacidade:** Valorizam armazenamento local-first e controle sobre seus dados.
- **Indivíduos em Busca de Educação Financeira:** Desejam entender o impacto real de seus gastos através de métricas comportamentais.

---

## 2. Arquitetura da Solução

### 2.1 Visão Macro

O ZenBolso implementa uma **Arquitetura Híbrida Local-First** com sincronização progressiva em nuvem. A aplicação prioriza a execução e persistência no cliente, garantindo latência zero e funcionamento 100% offline.

```
┌─────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                │
│  React 19 + TypeScript + Tailwind CSS (SPA)             │
│  • Componentes Reativos                                  │
│  • Error Boundaries                                      │
│  • Code Splitting (React.lazy)                           │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   CAMADA DE ESTADO                       │
│  Context API + TanStack Query                            │
│  • AuthContext (Sessão)                                  │
│  • DataContext (Transações)                              │
│  • ThemeContext (UI)                                     │
└─────────────────────────────────────────────────────────┘
                            ↓
│  Service Layer (accountService, transactionService)      │
│  • Lógica de Negócio                                     │
│  • Abstração de Persistência                            │
└─────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────┬──────────────────────────────────┐
│  PERSISTÊNCIA LOCAL  │    PERSISTÊNCIA REMOTA           │
│  IndexedDB (Dexie)   │    Supabase (PostgreSQL)         │
│  • Guest Mode        │    • Authenticated Mode          │
│  • Offline-First     │    • Row Level Security          │
│  • Zero Latency      │    • Cloud Sync                  │
└──────────────────────┴──────────────────────────────────┘
```

### 2.2 Frontend

**Stack Principal:**
- **React 19** com TypeScript para type-safety completa
- **Vite** como bundler e dev server de alta performance
- **Tailwind CSS** para design system utilitário e responsivo
- **React Router DOM v7** para roteamento client-side

**Padrões Arquiteturais:**
- **Component-Based Architecture:** Componentes reutilizáveis e isolados
- **Context API:** Gerenciamento de estado global sem prop drilling
- **Custom Hooks:** Encapsulamento de lógica de negócio (`useDashboardData`, `useProfileSettings`)
- **Service Layer Pattern:** Separação entre UI e lógica de persistência

### 2.3 Backend & Sincronização

**Supabase (Backend-as-a-Service):**
- **PostgreSQL** como banco de dados relacional
- **Row Level Security (RLS)** para isolamento de dados por usuário
- **Supabase Auth** para autenticação via Magic Link (OTP)
- **Real-time Subscriptions** (opcional, não implementado na v1.3.0)

**Estratégia de Sincronização:**
1. **Modo Visitante (Guest):** Dados persistidos exclusivamente no IndexedDB local
2. **Modo Autenticado:** Sincronização bidirecional entre IndexedDB e Supabase
3. **Optimistic Updates:** UI atualizada imediatamente antes da confirmação do servidor

### 2.4 Infraestrutura

**Hospedagem:**
- **Vercel Edge Network** para distribuição global com baixa latência
- **Serverless Functions** (não utilizadas na v1.3.0, mas disponíveis para expansão)

**CI/CD:**
- Deploy automático via integração Git → Vercel
- Preview deployments para cada pull request
- Rollback instantâneo em caso de falhas

### 2.5 Fluxo de Dados Crítico

**Exemplo: Criação de Transação**

```
1. Usuário abre modal de nova transação
   ↓
2. Preenche dados manuais (valor, conta, categoria)
   ↓
3. transactionService.createTransaction() é chamado
   ↓
4. Verifica estado de autenticação (AuthContext)
   ↓
5a. [Guest Mode] → Salva no IndexedDB via Dexie
5b. [Auth Mode] → Envia para Supabase + Salva no IndexedDB
   ↓
6. UI atualizada via TanStack Query (invalidação de cache)
   ↓
7. Toast de confirmação exibido ao usuário
```

---

## 3. Tecnologias Utilizadas

### 3.1 Linguagens de Programação

- **TypeScript 5.7.2:** Type-safety em toda a aplicação, reduzindo bugs em runtime
- **SQL (PostgreSQL):** Queries, triggers e RLS policies no Supabase

### 3.2 Frameworks e Bibliotecas

**Core:**
- `react@19.0.0` - Biblioteca de UI
- `react-dom@19.0.0` - Renderização DOM
- `react-router-dom@7.0.2` - Roteamento SPA

**Estado e Dados:**
- `@tanstack/react-query@5.62.0` - Gerenciamento de estado assíncrono
- `dexie@4.0.10` - Wrapper para IndexedDB

**Backend & Auth:**
- `@supabase/supabase-js@2.89.0` - Cliente Supabase

**UI & Estilização:**
- `tailwindcss@3.4.16` - Framework CSS utilitário
- `lucide-react@0.469.0` - Ícones SVG
- `recharts@2.15.0` - Gráficos e visualizações

**Utilitários:**
- `date-fns@4.1.0` - Manipulação de datas
- `fuse.js@7.0.0` - Busca fuzzy para Smart Parser
- `uuid@11.0.3` - Geração de IDs únicos
- `clsx@2.1.1` + `tailwind-merge@2.5.5` - Composição de classes CSS

### 3.3 Banco(s) de Dados

**Local (Client-Side):**
- **IndexedDB** via Dexie.js
  - Schema: `transactions`, `accounts`, `recurring_transactions`
  - Capacidade: ~50MB+ (dependente do navegador)
  - Persistência: Sobrevive a reloads e fechamento do navegador

**Cloud (Server-Side):**
- **PostgreSQL 15** (Supabase)
  - Tabelas: `accounts`, `categories`, `transactions`, `recurring_transactions`
  - Extensões: `pgcrypto` para geração de UUIDs
  - Triggers: `handle_updated_at()`, `seed_default_categories()`

### 3.4 Serviços de Terceiros e Integrações

- **Supabase:**
  - Autenticação (Magic Link via email)
  - Banco de dados PostgreSQL gerenciado
  - Row Level Security (RLS)
  
- **Vercel:**
  - Hospedagem de aplicação estática
  - CDN global
  - Analytics (opcional)

### 3.5 Infraestrutura, Cloud, CI/CD

**Infraestrutura:**
- **Vercel Edge Network:** 100+ edge locations globalmente
- **Supabase Cloud:** Instância PostgreSQL dedicada com backups automáticos

**CI/CD:**
- **Git-based Deployment:** Push para `main` → Deploy automático
- **Preview Environments:** Cada branch gera uma URL de preview
- **Build Process:**
  ```bash
  npm run build
  → tsc (Type checking)
  → vite build (Bundling + Minification)
  → Output: /dist
  ```

**Monitoramento:**
- **Vercel Analytics:** Métricas de performance (Web Vitals)
- **Supabase Dashboard:** Logs de queries e autenticação
- **Browser DevTools:** Error Boundaries capturam erros em produção

---

## 4. Funcionalidades do Aplicativo

### 4.1 Funcionalidades Principais

#### 4.1.1 Exportação de Relatórios (PDF)
**Descrição:** Geração de documentos PDF detalhados dos relatórios mensais.

**Tecnologia:** jsPDF e html2canvas para captura de UI e geração de documentos.

**Funcionalidades:**
- Exportação de gráficos de distribuição (Pie Chart)
- Exportação de fluxos mensais (Bar Chart)
- Resumo financeiro (Entradas, Saídas, Saldo)
- Formatação otimizada para impressão

#### 4.1.2 Zen Insights (Custo de Tempo)
**Descrição:** Conversão de gastos em horas de trabalho.

**Fórmula:**
```
Custo em Horas = Valor da Transação / (Renda Mensal / Horas Trabalhadas por Mês)
```

**Exemplo:**
- Renda: R$ 5.000/mês
- Horas: 160h/mês
- Valor Hora: R$ 31,25
- Gasto: R$ 125,00
- **Custo em Tempo: 4 horas de vida**

**Visualização:**
- Card dedicado no Dashboard
- Barra de progresso comparando gastos vs. renda
- Alertas visuais quando gastos excedem renda

#### 4.1.3 Gestão de Contas Multi-tipo
**Tipos Suportados:**
- `WALLET` (Carteira/Dinheiro)
- `BANK` (Conta Bancária)
- `INVESTMENT` (Investimentos)

**Funcionalidades:**
- Criação, edição e exclusão de contas
- Saldos consolidados em tempo real
- Cores personalizadas para identificação visual
- Arquivamento (soft delete) de contas inativas

#### 4.1.4 Lançamentos Recorrentes
**Descrição:** Automação de transações fixas mensais.

**Regras:**
- `day_of_month`: Dia do mês para lançamento (1-31)
- `amount`: Valor fixo
- `account_id` e `category_id`: Destino da transação
- `active`: Flag de ativação/desativação

**Processamento:**
- Executado automaticamente no carregamento do Dashboard
- Verifica se `currentDay >= day_of_month` e `last_processed_date < currentMonth`
- Cria transação e atualiza `last_processed_date`

### 4.2 Fluxos Críticos de Uso

#### 4.2.1 Onboarding (Primeiro Acesso)
```
1. Usuário acessa a Landing Page
2. Clica em "Começar Agora"
3. Sistema detecta ausência de contas (localStorage vazio)
4. Exibe OnboardingWizard:
   - Step 1: Configuração de Perfil (renda, horas)
   - Step 2: Criação da primeira conta
5. Redireciona para Dashboard
6. Flag `zenbolso_intro_seen` salva no localStorage
```

#### 4.2.2 Fluxo de Autenticação Progressiva
```
[Modo Visitante]
1. Usuário acessa /dashboard sem login
2. Dados salvos exclusivamente no IndexedDB
3. Banner em Settings alerta sobre falta de backup

[Migração para Autenticado]
4. Usuário clica em "Criar Conta / Login" (Settings)
5. Redireciona para /login
6. Insere email → Recebe Magic Link
7. Clica no link → Sessão criada
8. Sistema detecta user.id
9. Dados locais são migrados para Supabase
10. Sincronização bidirecional ativada
```

#### 4.2.3 Exportação de PDF
1. Usuário acessa a aba de Relatórios
2. Seleciona o mês desejado
3. Clica em "Confirmar PDF"
4. O sistema processa o conteúdo via html2canvas
5. Gera o documento via jsPDF e realiza o download automático

### 4.3 Regras de Negócio Relevantes

#### 4.3.1 Isolamento de Dados por Usuário
- **Regra:** Cada registro possui `user_id` obrigatório (exceto em Guest Mode)
- **Implementação:** RLS policies no Supabase garantem que `auth.uid() = user_id`
- **Validação:** Queries automáticas filtram por `user_id` no backend

#### 4.3.2 Integridade Referencial
- **Contas:** Não podem ser excluídas se possuírem transações vinculadas
- **Categorias:** Exclusão define `category_id = NULL` nas transações (ON DELETE SET NULL)
- **Validação:** Service layer verifica existência de dados antes de permitir exclusão

#### 4.3.3 Processamento de Recorrências
- **Idempotência:** `last_processed_date` garante que uma regra não gere duplicatas no mesmo mês
- **Atomicidade:** Falha em uma regra não impede processamento das demais (try/catch individual)

#### 4.3.4 Conversão de Tipos Numéricos
- **PostgreSQL:** Armazena valores como `NUMERIC` (precisão arbitrária)
- **JavaScript:** Converte para `Number` via `Number(value)` para evitar erros de tipo
- **Formatação:** `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`

### 4.4 Permissões, Papéis de Usuário e Segurança

#### 4.4.1 Modelo de Permissões

**Não há papéis diferenciados.** Todos os usuários autenticados possuem as mesmas permissões:
- CRUD completo sobre seus próprios dados
- Acesso exclusivo via RLS policies

#### 4.4.2 Row Level Security (RLS) Policies

**Tabela: `accounts`**
```sql
CREATE POLICY accounts_select ON accounts 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY accounts_insert ON accounts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY accounts_update ON accounts 
  FOR UPDATE USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY accounts_delete ON accounts 
  FOR DELETE USING (auth.uid() = user_id);
```

**Mesma estrutura aplicada para:**
- `categories`
- `transactions`
- `recurring_transactions`

#### 4.4.3 Autenticação

**Método:** Magic Link (OTP via email)

**Fluxo:**
1. Usuário insere email
2. Supabase envia link único com token JWT
3. Usuário clica no link
4. Token validado → Sessão criada
5. `access_token` armazenado no `localStorage` (gerenciado pelo Supabase SDK)

**Segurança:**
- Tokens expiram em 1 hora (renovação automática via refresh token)
- HTTPS obrigatório em produção
- CORS configurado para domínio específico

#### 4.4.4 Proteção de Rotas

**ProtectedRoute Component:**
```typescript
// Permite acesso em Guest Mode (sem autenticação)
// Não bloqueia usuários não autenticados
// Apenas garante que AuthContext está carregado
```

**Rotas Públicas:**
- `/` (Landing Page)
- `/login`
- `/admin` (SQL Runner - sem autenticação na v1.3.0, **risco de segurança**)

**Rotas Protegidas (Guest-Friendly):**
- `/dashboard`
- `/transactions`
- `/reports`
- `/settings`
- `/recurring`

---

## 5. Aspectos Não Funcionais

### 5.1 Escalabilidade

#### 5.1.1 Arquitetura Serverless
- **Supabase:** Auto-scaling de conexões PostgreSQL
- **Vercel:** Edge Functions escalam automaticamente sob demanda
- **IndexedDB:** Limite teórico de ~50MB-250MB por origem (dependente do navegador)

#### 5.1.2 Estratégias de Otimização
- **Code Splitting:** Páginas carregadas sob demanda via `React.lazy()`
- **Tree Shaking:** Vite elimina código não utilizado no bundle final
- **Lazy Loading de Imagens:** (não aplicável na v1.3.0, sem imagens pesadas)

#### 5.1.3 Limitações Conhecidas
- **IndexedDB:** Não recomendado para datasets > 10.000 transações em Guest Mode
- **Supabase Free Tier:** Limite de 500MB de storage e 2GB de transferência/mês

### 5.2 Performance

#### 5.2.1 Métricas de Performance (Web Vitals)

**Objetivo:**
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

**Otimizações Implementadas:**
- **Vite:** Hot Module Replacement (HMR) em < 50ms
- **Tailwind CSS:** Purge de classes não utilizadas (bundle CSS < 20KB)
- **React 19:** Concurrent Rendering para UI responsiva

#### 5.2.2 Optimistic Updates
```typescript
// Exemplo: Criação de transação
const { mutate } = useMutation({
  mutationFn: transactionService.createTransaction,
  onMutate: async (newTransaction) => {
    // 1. Cancela queries em andamento
    await queryClient.cancelQueries(['transactions']);
    
    // 2. Snapshot do estado anterior
    const previous = queryClient.getQueryData(['transactions']);
    
    // 3. Atualiza UI otimisticamente
    queryClient.setQueryData(['transactions'], (old) => [...old, newTransaction]);
    
    return { previous };
  },
  onError: (err, newTransaction, context) => {
    // 4. Rollback em caso de erro
    queryClient.setQueryData(['transactions'], context.previous);
  },
  onSettled: () => {
    // 5. Revalida dados do servidor
    queryClient.invalidateQueries(['transactions']);
  }
});
```

#### 5.2.3 Caching Strategy
- **TanStack Query:** Cache de 5 minutos para queries de leitura
- **Stale-While-Revalidate:** UI exibe dados em cache enquanto revalida em background
- **IndexedDB:** Persistência automática, sem necessidade de cache adicional

### 5.3 Segurança

#### 5.3.1 Camadas de Segurança

**1. Row Level Security (RLS):**
- Políticas SQL garantem isolamento de dados no nível do banco
- Mesmo com vazamento de `anon_key`, usuários não acessam dados alheios

**2. JWT Authentication:**
- Tokens assinados com chave secreta (gerenciada pelo Supabase)
- Validação automática em cada request

**3. HTTPS Obrigatório:**
- Vercel força HTTPS em produção
- Certificados SSL automáticos via Let's Encrypt

**4. Content Security Policy (CSP):**
- (Não implementado na v1.3.0 - **recomendação para v2.0**)

#### 5.3.2 Vulnerabilidades Conhecidas

**CRÍTICO:**
- **Admin Page (`/admin`):** Expõe SQL Runner sem autenticação
  - **Risco:** Execução arbitrária de SQL
  - **Mitigação Recomendada:** Adicionar autenticação obrigatória ou remover em produção

**MÉDIO:**
- **Guest Mode:** Dados armazenados em texto plano no IndexedDB
  - **Risco:** Acesso físico ao dispositivo expõe dados
  - **Mitigação:** Implementar criptografia client-side (Web Crypto API)

#### 5.3.3 Boas Práticas Implementadas
- **Sanitização de Inputs:** Supabase escapa automaticamente valores em queries
- **Prepared Statements:** Proteção contra SQL Injection
- **Rate Limiting:** Supabase aplica rate limits por IP (configurável)

### 5.4 Observabilidade

#### 5.4.1 Logging

**Client-Side:**
- `console.error()` para erros capturados por Error Boundaries
- Toast notifications para feedback ao usuário

**Server-Side:**
- Supabase Dashboard: Logs de queries e autenticação
- Vercel Logs: Erros de build e runtime (se houver serverless functions)

#### 5.4.2 Monitoramento

**Ferramentas Disponíveis:**
- **Vercel Analytics:** Web Vitals, pageviews, unique visitors
- **Supabase Dashboard:** Métricas de uso de banco de dados

**Alertas:**
- (Não configurados na v1.3.0 - **recomendação para v2.0**)
- Sugestão: Integração com Sentry para error tracking

#### 5.4.3 Debugging

**Desenvolvimento:**
- React DevTools para inspeção de componentes
- TanStack Query DevTools para visualização de cache
- Dexie.js Cloud (opcional) para debug de IndexedDB

**Produção:**
- Error Boundaries capturam erros e exibem UI de fallback
- Source maps habilitados para stack traces legíveis

### 5.5 Manutenibilidade

#### 5.5.1 Arquitetura de Código

**Separação de Responsabilidades:**
```
src/
├── components/        # UI Components (Apresentação)
├── contexts/          # Estado Global (React Context)
├── hooks/             # Lógica Reutilizável (Custom Hooks)
├── services/          # Camada de Persistência
├── pages/             # Páginas/Rotas
├── types/             # Definições TypeScript
└── utils/             # Funções Utilitárias
```

**Princípios Aplicados:**
- **Single Responsibility:** Cada módulo possui uma única responsabilidade
- **Dependency Injection:** Services recebem dependências via parâmetros
- **Interface Segregation:** Tipos TypeScript definem contratos claros

#### 5.5.2 Testes

**Status Atual (v1.3.0):**
- **Nenhum teste automatizado implementado**

**Recomendações para v2.0:**
- **Unit Tests:** Vitest para funções puras (smartParser, utils)
- **Integration Tests:** Testing Library para componentes React
- **E2E Tests:** Playwright para fluxos críticos

#### 5.5.3 Documentação

**Código:**
- Comentários JSDoc em funções complexas
- Tipos TypeScript servem como documentação inline

**Projeto:**
- `README.md`: Instruções de setup e features
- `TECHNICAL_DOCUMENTATION.md`: Este documento
- `supabase_setup.sql`: Schema e políticas do banco

#### 5.5.4 Versionamento

**Estratégia:**
- Semantic Versioning: `MAJOR.MINOR.PATCH`
- Git Flow: `main` (produção), `develop` (staging), feature branches

**Changelog:**
- (Não mantido formalmente na v1.3.0)
- Recomendação: Adotar Conventional Commits + automated changelog

---

## 6. Diagramas de Arquitetura

### 6.1 Diagrama de Contexto (C4 Model - Nível 1)

```
┌─────────────┐
│   Usuário   │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────────┐
│          ZenBolso (SPA)                 │
│  • Dashboard                            │
│  • Relatórios Exportáveis               │
│  • Zen Insights                         │
└──────┬──────────────────────┬───────────┘
       │                      │
       ↓                      ↓
┌─────────────┐      ┌──────────────────┐
│  IndexedDB  │      │    Supabase      │
│  (Local)    │      │  • PostgreSQL    │
│             │      │  • Auth          │
└─────────────┘      └──────────────────┘
```

### 6.2 Fluxo de Autenticação

```
[Guest Mode]                    [Authenticated Mode]
     │                                 │
     ↓                                 ↓
IndexedDB ←─────────────────→ IndexedDB + Supabase
(Offline)                      (Sync Bidirecional)
```

---

## 7. Considerações Finais

### 7.1 Pontos Fortes
- **Latência Zero:** Experiência offline-first garante responsividade
- **Segurança Robusta:** RLS no nível do banco previne vazamentos de dados
- **UX Premium:** Relatórios PDF e Zen Insights diferenciam o produto

### 7.2 Áreas de Melhoria
- **Testes Automatizados:** Cobertura de testes inexistente
- **Observabilidade:** Falta de error tracking e APM
- **Segurança:** Admin Page exposta sem autenticação
- **Escalabilidade:** Limitações do IndexedDB para datasets grandes

### 7.3 Roadmap Técnico (Sugestões)
- **v1.4:** Implementar testes unitários e integração
- **v1.5:** Adicionar Sentry para error tracking
- **v2.0:** Migração para PWA com Service Worker para cache de assets
- **v2.1:** Implementar criptografia client-side para Guest Mode

---

**Documento Elaborado por:** Equipe de Engenharia ZenBolso  
**Contato Técnico:** [Inserir email de suporte técnico]  
**Repositório:** [Inserir URL do repositório Git]