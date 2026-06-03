# Arquitetura do Sistema: Zenbolso

O **Zenbolso** implementa uma **Arquitetura Híbrida Local-First** com foco em privacidade extrema, performance offline e latência zero. Toda a persistência primária e o estado operacional da aplicação acontecem no cliente (client-side), com sincronização opcional e criptografada para a nuvem.

---

## 1. Princípios Arquiteturais Inegociáveis

1. **Local-First Sempre Vence:** Toda persistência primária é feita localmente no navegador utilizando **Dexie.js (IndexedDB)**. A interface de usuário (UI) nunca deve depender de rede para funcionar ou renderizar.
2. **Design por Contrato (DbC):** Substitua convenções informais e programação defensiva por contratos estritos (pré-condições, pós-condições e invariantes).
3. **Fail-Fast:** Rejeite ativamente a Lei de Postel. Nunca tolere entradas malformadas. Valide nas fronteiras do sistema (por exemplo, formulários e retornos do banco de dados) e aborte imediatamente com erro caso o estado seja inválido.
4. **Irrepresentabilidade de Estados Inválidos:** Modele sempre o domínio utilizando Tipos de Dados Algébricos (ADTs) de forma que estados lógicos impossíveis não compilem no TypeScript.
5. **Núcleo Funcional e Casca Imperativa:** Isole a lógica pura de negócios (sem efeitos colaterais ou mutações) em um núcleo limpo (`services/domain/`). Deixe I/O, rede, sincronização externa e acesso direto ao banco de dados exclusivamente nas bordas do sistema (casca imperativa, como `services/db.ts` ou `services/googleDrive.ts`).
6. **Limites de Tamanho de Arquivo (SRP):** Máximo de **200 linhas** por arquivo de código. Se ultrapassar esse limite, extraia a lógica para hooks dedicados ou módulos utilitários menores.

---

## 2. Estrutura do Código e Divisão de Camadas (`src/`)

```
src/
├── App.tsx              # Roteamento principal e tela de bloqueio
├── pages/               # Componentes de página (Smart Components, consomem hooks + UI)
├── components/          # Componentes de UI puros, reutilizáveis e desacoplados
├── hooks/               # Custom Hooks (lógica de estado React, formulários e integração)
│   └── queries/         # Hooks de query (TanStack React Query para sincronização/APIs)
├── services/            # Camada de Persistência e Negócio (Sem dependências do React)
│   ├── db.ts            # Schema do Dexie (única fonte de verdade do banco local)
│   ├── domain/          # Regras puras do domínio financeiro
│   └── ...Service.ts    # Lógica de negócio por domínio (transactionService, accountService)
├── contexts/            # React Contexts (estados globais efêmeros de UI)
├── utils/               # Funções utilitárias puras e determinísticas
└── types/               # Definições de tipo globais do TypeScript
```

### 2.1 Services vs Custom Hooks
* **Services (`services/`):** Contêm a lógica de persistência e acesso ao banco de dados (IndexedDB/Supabase) e regras de negócio puras. **Não devem depender do React**. Componentes **nunca** chamam o banco de dados Dexie diretamente, apenas por intermédio dos Services.
* **Custom Hooks (`hooks/`):** Atuam como intermediários entre a UI (componentes) e os Services. Gerenciam o estado do React, dados de formulários, validação via **Zod** e mutações otimistas. Modais e formulários devem apenas consumir esses hooks.

---

## 3. Fluxo de Dados Reativo (Reactive Local-First)

Para manter a UI sincronizada em tempo real com as alterações no IndexedDB, o projeto adota o padrão reativo com **Dexie.js**:

* **Leitura Reativa (`useLiveQuery`):** Deve-se utilizar `useLiveQuery` da biblioteca `dexie-react-hooks` para consultar tabelas do IndexedDB cujos dados devem reagir instantaneamente a escritas/exclusões em outras partes do app.
* **Mutações Otimistas (Optimistic Updates):** Todas as mutações em listas (Adicionar, Deletar, Atualizar) executadas pelos Custom Hooks devem atualizar o estado local da UI instantaneamente antes ou em paralelo à chamada do Service do IndexedDB, garantindo a sensação de latência zero ("snappy UX").
* **TanStack React Query:** Utilizado exclusivamente para sincronização remota (dados remotos do Supabase), aplicando estratégias de cache, retry automático e *stale-while-revalidate*.

---

## 4. Segurança Numérica Estrita (Prevenção contra NaN)

> [!IMPORTANT]
> **A Regra de Ouro:** "Sanitize First, Format Later" (Sanitizar Primeiro, Formatar Depois). Nunca passe dados crus vindos de formulários ou do banco de dados diretamente para funções de formatação.

Todo valor financeiro deve ser tratado como um número de ponto flutuante seguro e passar por validação contra `NaN`, `Infinity`, `null` ou `undefined` antes de qualquer operação ou renderização.

### 4.1 Biblioteca Utilitária de Segurança (`src/utils/numberUtils.ts`)
Toda e qualquer operação aritmética deve ser feita por meio das seguintes funções puras de segurança:

* **`safeNumber(value, fallback = 0)`**: Converte qualquer entrada para um número seguro.
  * Retorna o `fallback` se o valor for `null`, `undefined`, `NaN`, ou `Infinity`.
  * Trata strings numéricas de forma segura.
* **`safeDivide(numerator, denominator, fallback = 0)`**: Divisão protegida contra divisão por zero.
  * Retorna o `fallback` se o denominador for `0`.
* **`safePercentage(part, whole, fallback = 0)`**: Cálculo seguro de porcentagens.
  * Retorna o `fallback` se o total (`whole`) for `0`. Multiplica automaticamente por 100.
* **`safeSum(values[])`**: Soma segura de arrays numéricos.
* **`safeAverage(values[], fallback = 0)`**: Média protegida para arrays.
* **`safeClamp(value, min, max)`**: Limita um valor entre os intervalos mínimo e máximo.

### 4.2 Padrões de Código Recomendados

**Agrupamento de Transações (Aggregation):**
```typescript
// ✅ CORRETO
const total = transactions.reduce((sum, t) => sum + safeNumber(t.amount, 0), 0);
```

**Cálculo de Custos e Médias:**
```typescript
// ✅ CORRETO
const custoHora = safeDivide(rendaMensal, horasTrabalhadas, 0);
const percentual = safePercentage(valorGasto, rendaMensal, 0);
```

**Renderização e Formatação na UI:**
```typescript
// ✅ CORRETO
<span>{formatCurrency(safeNumber(conta.balance, 0))}</span>
```

---

## 5. Validação de Fronteira (Zod)

Para garantir que dados externos e entradas de usuários não quebrem as invariantes do domínio financeiro:
* Todo formulário deve ser validado via schemas **Zod** dentro de seus respectivos Custom Hooks.
* O componente React UI atua de forma passiva ("burra"), apenas consumindo e exibindo o objeto `errors` gerado pelo método `.safeParse()` do Zod.
* Dados importados (JSON/CSV) de outros gerenciadores devem ser validados pelo Zod antes da inserção no banco de dados local.
