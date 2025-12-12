# Gerente Pessoal de Bolso 💰

> **Acalme o caos financeiro em 5 segundos por dia.**

Uma aplicação web **Local-First** focada em simplicidade radical (Zero Friction), privacidade absoluta e clareza visual.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Stack](https://img.shields.io/badge/stack-React_19_|_Vite_|_Dexie-teal.svg)

---

## 🏗️ Arquitetura e Filosofia

Este projeto foi construído sobre três pilares de engenharia:

1.  **Local-First & Offline-First**:
    *   Não há backend. Não há login. Não há nuvem.
    *   Todos os dados residem no navegador do usuário usando **IndexedDB** (via Dexie.js).
    *   Privacidade total: Os dados financeiros nunca saem do dispositivo.

2.  **Performance Otimizada**:
    *   Uso do **React Query** para gerenciamento de estado assíncrono, cache e atualizações otimistas.
    *   Bundle otimizado com Vite.

3.  **UX de Baixa Fricção**:
    *   Entrada de dados via Inteligência Artificial local (Regex + Fuse.js) para categorização automática.
    *   Interface limpa baseada em Tailwind CSS.

---

## 🛠️ Tech Stack

*   **Core**: React 18+, TypeScript, Vite.
*   **Estado & Cache**: TanStack React Query.
*   **Persistência**: Dexie.js (IndexedDB Wrapper).
*   **Estilização**: Tailwind CSS, Lucide React (Ícones).
*   **Lógica de Negócio**: RRule (Recorrência), Fuse.js (Busca Fuzzy).
*   **Visualização**: Recharts.

---

## 🚀 Guia de Instalação (Rodando Localmente)

Siga os passos abaixo para ter o projeto rodando na sua máquina em minutos.

### Pré-requisitos
*   **Node.js** (Versão 18 ou superior).
*   Gerenciador de pacotes (npm, yarn ou pnpm).

### Passo a Passo

1.  **Clone ou baixe o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/gerente-pessoal.git
    cd gerente-pessoal
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

4.  **Acesse:**
    O terminal mostrará o endereço local (geralmente `http://localhost:5173`). Abra no seu navegador.

---

## 📖 Manual de Uso: Como o App Funciona

O aplicativo é dividido em quatro áreas principais acessíveis pela barra lateral (Desktop) ou menu inferior (Mobile).

### 1. Dashboard (Visão Geral)
O centro de comando. Aqui você tem:
*   **Saldo Líquido**: Diferença entre receitas e despesas. Clique no ícone de "olho" para esconder valores.
*   **Insights Inteligentes**: O sistema analisa seus gastos e gera alertas (ex: "Você gastou muito com Delivery este mês").
*   **Gamificação**: Badges desbloqueáveis baseados em bons hábitos financeiros.
*   **Contas**: Resumo do saldo de cada conta (Nubank, Carteira, Investimentos).

### 2. Extrato (Transações)
Onde a mágica acontece.
*   **Smart Input (IA Local)**: Ao clicar em "Nova Transação", use o campo de texto livre.
    *   *Exemplo:* Digite "Almoço 35,90 padaria ontem".
    *   *Resultado:* O app preenche valor (35.90), categoria (Alimentação), data (ontem) e descrição automaticamente.
*   **Filtros Avançados**: Busque por tags, categorias ou períodos específicos.
*   **Importação**: Você pode colar o texto da fatura do cartão ou extrato bancário, e o app tentará reconhecer as transações automaticamente.

### 3. Planejamento
Focado no futuro e metas.
*   **Orçamento**: Defina um teto de gastos nas configurações e acompanhe a barra de progresso.
*   **Projeção (Forecast)**: Um gráfico que prevê como estará seu saldo daqui a 30 dias com base nas suas transações recorrentes.
*   **Simulador de Compras**: Quer comprar um tênis de R$ 500? O simulador diz se essa compra vai deixar seu saldo negativo no futuro.
*   **Álbum de Sonhos**: Crie metas visuais (ex: "Viagem") com foto e valor alvo.

### 4. Configurações
Personalização total.
*   **Dados & Backup**: Como o app é offline, use o botão **Exportar Backup (CSV)** regularmente para salvar seus dados. Você pode restaurá-los em qualquer dispositivo.
*   **Modo Escuro**: Alterne entre tema claro e escuro.
*   **Cadastro**: Gerencie suas contas bancárias, categorias personalizadas e recorrencias (contas fixas).

---

## 🤝 Contribuindo

1.  Faça um Fork do projeto.
2.  Crie uma Branch para sua Feature (`git checkout -b feature/NovaFeature`).
3.  Faça o Commit (`git commit -m 'Add some NovaFeature'`).
4.  Push para a Branch (`git push origin feature/NovaFeature`).
5.  Abra um Pull Request.

---

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.
