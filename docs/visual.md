# Diretrizes de Experiência Visual e Usabilidade: Zenbolso

A interface do **Zenbolso** foi projetada para oferecer uma experiência "Native Feel" rápida, inclusiva e otimizada para o uso no dia a dia. A usabilidade segue regras estritas para garantir conforto e responsividade, especialmente em dispositivos móveis.

---

## 1. Usabilidade Mobile-First e Layout

A aplicação adota um design prioritariamente voltado a smartphones, utilizando contêineres e grids fluidos adaptáveis a telas maiores:

* **O Limite de Largura Móvel:** A casca visual de toda a aplicação (layout principal) é restrita a `max-w-[430px]`. Layouts que ultrapassem ou quebrem essa barreira visual em dispositivos móveis são estritamente proibidos.
* **Componentização de Abas e Modais:** Modais complexos ou com múltiplas abas (como a tela de configurações) devem ser decompostos:
  1. A lógica de estado de controle vai para um Custom Hook dedicado (ex: `useSettingsData.ts`).
  2. Cada aba do modal deve ser isolada em um arquivo próprio em `components/settings/tabs/` contendo apenas JSX de UI pura baseada em props, sem estado interno próprio.
  3. O arquivo pai do modal gerencia exclusivamente a navegação entre as abas.

---

## 2. Ergonomia Móvel e Touch Targets

Operar um aplicativo de finanças exige alta precisão em cliques rápidos. Para minimizar erros e toques acidentais:

* **Touch Targets:** Todos os botões interativos, links, ícones clicáveis e campos de entrada de dados devem manter uma área física mínima de toque de **44x44px** (conforme recomendado pela Apple e Google Material Design).
* **Gestos Swipe-to-Action:** As listagens de transações e contas devem implementar gestos de deslizar para os lados (Swipe) para revelar ações rápidas de exclusão e edição. 
  * Isso libera espaço visual na tela móvel.
  * Previne cliques destrutivos acidentais fornecendo um feedback tátil virtual.
  * Melhora o fluxo de uso nativo do aplicativo ("Native Feel").

---

## 3. Modo de Privacidade: Ocultação de Saldos

Para proteger a privacidade do usuário em locais públicos, a UI deve fornecer um controle global de ocultação de saldos:

* **Botão Alternador:** Um ícone em formato de olho (`Eye` / `EyeOff` da biblioteca Lucide React) deve estar sempre acessível na tela (no Header ou na barra de saldo).
* **Comportamento:** Ao clicar no botão, todos os saldos de contas, totais de receitas, despesas e valores de transações nas listagens devem ser substituídos por caracteres de ocultação (ex: `••••` ou `R$ *,**`).
* **Persistência local:** A preferência de visualização do usuário (saldos visíveis ou ocultos) deve ser persistida localmente (no `localStorage`) para manter o estado entre as sessões.

---

## 4. Acessibilidade (Diretrizes WCAG)

O Zenbolso deve ser utilizável por todos, respeitando diretrizes básicas de acessibilidade digital:

* **Contraste de Cores:** Todo texto de transação ou saldo deve atender aos padrões mínimos da **WCAG 2.1 AA** (relação de contraste de no mínimo 4.5:1 para texto normal e 3:1 para texto grande).
* **Semântica HTML:** Usar tags semânticas corretas (`main`, `nav`, `section`, `article`, `header`, `footer`) e atribuir propriedades `aria-label` adequadas para leitores de tela em botões representados apenas por ícones.
* **Foco do Teclado:** Elementos focáveis devem ter anéis de foco visíveis (`focus:ring-2`) para navegação facilitada por teclado.

---

## 5. Desempenho e Latência de UI

Uma interface rápida contribui diretamente para a retenção do usuário. Visamos as seguintes métricas de Web Vitals:

* **LCP (Largest Contentful Paint):** Menor que **2.5 segundos**.
* **FID (First Input Delay):** Menor que **100 milissegundos**.
* **CLS (Cumulative Layout Shift):** Menor que **0.1** (evitando mudanças bruscas de layout enquanto imagens ou dados carregam).
* **Otimização de Pacotes (Tailwind CSS):** Reduzir a carga de CSS na renderização inicial com purge automático de classes não utilizadas (garantindo pacote CSS inferior a **20KB**).
* **Atualizações Otimistas:** A UI deve atualizar instantaneamente ao incluir ou remover registros, mantendo o usuário livre de telas de carregamento bloqueantes.
