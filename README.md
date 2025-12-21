# Gerente Pessoal de Bolso 💰

> **Acalme o caos financeiro em 5 segundos por dia.**

Uma aplicação web **Local-First** focada em simplicidade radical (Zero Friction), privacidade absoluta e clareza visual. Use imediatamente, sem cadastro. Login opcional para backup.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Stack](https://img.shields.io/badge/stack-React_18_|_Vite_|_Dexie-teal.svg)

---

## 🏗️ Arquitetura e Filosofia

Este projeto foi reformulado com o princípio de **"Progressive Auth"** e **Local-First**, baseando-se em três pilares:

1.  **Local-First "Real" (Modo Visitante Padrão)**:
    *   **Zero Barreira de Entrada**: O usuário não precisa criar conta ou fazer login para começar a usar.
    *   **Persistência Local**: Todos os dados (transações, contas, configurações) são salvos inicialmente apenas no navegador do usuário via **IndexedDB** (Dexie.js).
    *   **Privacidade**: Seus dados financeiros pertencem ao seu dispositivo, não a um servidor na nuvem.

2.  **Autenticação Progressiva (Google Drive Backup)**:
    *   O login com Google é tratado como uma **Utility (Ferramenta)**, não como um "Porteiro".
    *   Serve exclusivamente para habilitar o recurso de **Backup & Sincronização** na nuvem (Google Drive AppData Folder).
    *   O usuário decide *quando* e *se* quer conectar sua conta para segurança extra.

3.  **UX de Baixa Fricção**:
    *   **Smart Input**: Entrada de dados simplificada (IA local com Regex) que entende linguagem natural (ex: "Pizza 50 ontem").
    *   **Performance**: Interface reativa e instantânea, sem loaders de rede bloqueantes para operações básicas.

---

## 🛠️ Visão Geral Técnica

### Stack Tecnológico
*   **Core**: React 18+, TypeScript, Vite v6.
*   **Roteamento**: React Router DOM (v6) com Guards de Proteção Progressiva.
*   **Estado & Cache**: TanStack React Query (Server/Async State) + Context API (Auth).
*   **Banco de Dados Local**: Dexie.js (Wrapper robusto para IndexedDB).
*   **Integração Nuvem**: Google Drive API (via `@react-oauth/google`) para armazenamento de arquivos de backup (JSON).
*   **Estilização**: Tailwind CSS (Utility-first) + Lucide React (Ícones).
*   **Visualização de Dados**: Recharts (Gráficos responsivos).

### Estrutura de Pastas Chave
*   `src/context/AuthContext.tsx`: Gerencia o estado do usuário Google (opcional) e lógica de sincronização.
*   `src/services/repositories`: Camada de abstração de dados. O frontend fala com repositórios, que decidem se leem do Dexie ou (futuramente) sincronizam.
*   `src/routes/guards.tsx`: Controla o acesso às rotas. Garante que apenas usuários que passaram pelo "Setup" (Landing Page) acessem o Dashboard.
*   `src/layouts`: Layouts responsivos para Mobile e Desktop.

---

## 🚀 Guia de Instalação e Configuração

Siga os passos abaixo para rodar o projeto localmente em sua máquina.

### Pré-requisitos
*   **Node.js**: Versão 18.0.0 ou superior (Recomendado: LTS mais recente).
*   **Gerenciador de Pacotes**: npm (padrão), yarn ou pnpm.
*   **Navegador**: Moderno (Chrome, Edge, Firefox, Brave) com suporte a IndexedDB.

### Passo a Passo

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/seu-usuario/mycashflow.git
    cd mycashflow
    ```

2.  **Instale as Dependências:**
    ```bash
    npm install
    ```

3.  **Configuração de Variáveis de Ambiente (Opcional):**
    *   O projeto usa um `Google Client ID` para a funcionalidade de backup opcional.
    *   Crie um arquivo `.env` na raiz (copie de `.env.example` se existir) e adicione:
    ```env
    VITE_GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
    ```
    *   *Nota:* Sem isso, o app roda perfeitamente em modo Offline, apenas o botão "Conectar Drive" falhará.

4.  **Inicie o Servidor de Desenvolvimento:**
    ```bash
    npm run dev
    ```

5.  **Acesse a Aplicação:**
    *   Abra `http://localhost:5173` (ou a porta indicada no terminal).
    *   Você verá a **Landing Page**.

---

## 📖 Instruções de Uso

### 1. Começando (Onboarding)
*   Na tela inicial, clique em **"Começar Agora"**.
*   Você será direcionado imediatamente para o **Dashboard**. Nenhum dado pessoal é solicitado.

### 2. Registrando Transações
*   Clique no botão **+ (Nova Transação)**.
*   **Modo Rápido**: Digite algo como *"Uber 25 trabalho"* e o app tentará preencher Categoria (Transporte), Valor (25) e Descrição.
*   **Modo Manual**: Preencha os campos detalhadamente se preferir.

### 3. Conectando Backup (Opcional)
*   Para garantir que seus dados não sejam perdidos se você limpar o navegador:
    1.  Vá até **Configurações** (Menu lateral ou inferior).
    2.  Localize a seção **Backup & Sincronização**.
    3.  Clique em **Conectar Drive**.
    4.  Após o login Google, o app criará um backup automático na sua pasta oculta do Google Drive (`appDataFolder`).

### 4. Planejamento e Metas
*   Acesse a aba **Planejamento**.
*   Use o **Simulador de Compras** para testar se uma despesa futura cabe no seu orçamento atual.
*   Defina um **Teto de Gastos** no widget de Orçamento.

---

## 📄 Licença
Distribuído sob a licença MIT. Sinta-se livre para usar, estudar e modificar.
