# Diretrizes de Segurança e Privacidade: Zenbolso

A privacidade e a proteção de dados financeiros são pilares fundamentais do **Zenbolso**. Para garantir privacidade extrema e controle total ao usuário, implementamos camadas estritas de segurança criptográfica no dispositivo local e na comunicação com nuvens externas.

---

## 1. Criptografia de Backups (Ponta a Ponta)

Toda persistência local no IndexedDB (Dexie) é armazenada em texto plano para viabilizar buscas rápidas e reatividade instantânea na UI. No entanto, nenhum dado financeiro pode sair do dispositivo do usuário sem proteção criptográfica.

* **Criptografia Simétrica (AES-256):** Toda sincronização com servidores externos (seja Supabase ou backups no Google Drive) é criptografada utilizando a biblioteca `crypto-js`.
* **Chave de Criptografia:** A chave de criptografia (passphrase) é gerada localmente a partir de um segredo do usuário e nunca é enviada a servidores de terceiros.
* **Processamento:**
  1. A service de backup coleta as transações, contas e categorias do IndexedDB.
  2. Os dados são serializados em JSON.
  3. O payload JSON é criptografado localmente utilizando `AES.encrypt(payload, userSecret).toString()`.
  4. O ciphertext resultante é enviado para a nuvem.
  5. No download, o payload é descriptografado localmente utilizando `AES.decrypt(ciphertext, userSecret).toString(enc.Utf8)` antes de ser hidratado no IndexedDB.

---

## 2. Controle de Acesso Local (App Lock)

Para proteger os dados financeiros contra olhares e acessos físicos indevidos ao dispositivo, o Zenbolso fornece o recurso **App Lock (Bloqueio do App)**.

* **Não Persistência de Credenciais em Texto Plano:** O código PIN ou senha de acesso definidos pelo usuário **NUNCA** devem ser salvos em formato de texto legível (plain-text) no `localStorage` ou no banco de dados.
* **Hashes Criptográficos (SHA-256):** O PIN é processado utilizando a **Web Crypto API** do navegador para gerar um hash criptográfico seguro (SHA-256) antes do armazenamento. A validação do acesso compara o hash gerado a partir do input digitado com o hash armazenado.
* **Prevenção de Vazamento no DOM (Interceptação no Topo):** A verificação de bloqueio intercepta o fluxo de renderização do React no nível mais alto possível (`App.tsx`). Caso o aplicativo esteja bloqueado, nenhum componente das páginas internas do dashboard é montado na árvore do DOM, prevenindo vazamentos de informações por inspeção do DOM no navegador.

---

## 3. Protocolo Fantasma: Hard Reset (Saída de Emergência)

> [!WARNING]
> **Privacidade Extrema implica em Responsabilidade Total:** Em uma arquitetura local-first com criptografia no cliente, não há servidor centralizado capaz de redefinir ou recuperar o PIN ou senha de um usuário. Se o usuário perder ou esquecer a credencial de bloqueio local, os dados tornam-se inacessíveis para sempre.

Para evitar o travamento definitivo ("bricking") do aplicativo caso o usuário esqueça o PIN:
* A tela de bloqueio deve sempre fornecer uma **Saída de Emergência** claramente sinalizada: o botão de **Hard Reset (Apagar Tudo)**.
* **Aviso de Destruição Total:** O usuário deve ser expressamente alertado de que essa ação destrói de forma irreversível todos os dados armazenados no dispositivo.
* **Procedimento de Limpeza Correto:**
  * **É estritamente proibido** utilizar apenas `localStorage.clear()` para redefinir o estado. Os dados financeiros do Zenbolso vivem no IndexedDB (Dexie).
  * O Hard Reset deve invocar a função `clearAllData()` exposta pela service de persistência, que executa explicitamente o fechamento e exclusão do banco de dados Dexie (`db.delete() -> db.open()`) em paralelo à limpeza do `localStorage`.
  * Após a conclusão da exclusão dos dados físicos do IndexedDB, o aplicativo realiza um redirecionamento forçado com `window.location.reload()`.

---

## 4. Segurança na Nuvem: Supabase & Row Level Security (RLS)

Ao utilizar o modo autenticado para sincronização opcional, a segurança das tabelas remotas no PostgreSQL do Supabase é mantida através de políticas rigorosas no banco de dados:

* **Isolamento de Dados por Usuário:** Todo registro em nuvem possui um identificador `user_id` obrigatório.
* **Políticas RLS:** Todas as tabelas no Supabase (`accounts`, `categories`, `transactions`, `recurring_transactions`) possuem a política de segurança ativada para garantir que o usuário autenticado (`auth.uid()`) acesse apenas seus próprios dados.

```sql
-- Exemplo de política RLS para a tabela accounts
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

* **Autenticação Segura via Magic Link (OTP):** Não há senhas armazenadas no backend do Supabase. O acesso é autenticado via email utilizando tokens JWT de curta duração (com refresh tokens renovados pelo SDK cliente).
* **HTTPS Obrigatório:** Toda a comunicação de sincronização em produção é forçada via HTTPS para prevenir ataques man-in-the-middle.

---

## 5. Vulnerabilidades Conhecidas e Recomendações

* **Admin Page (`/admin`):**
  * **Risco:** O painel contendo o SQL Runner encontra-se exposto sem autenticação, permitindo a execução arbitrária de código SQL no backend.
  * **Mitigação Exigida:** Esta página deve ser estritamente bloqueada sob autenticação administrativa obrigatória ou completamente removida das rotas em ambientes de produção.
