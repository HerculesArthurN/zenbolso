# 🔒 Guia de Correção de Avisos de Segurança do Supabase

Este documento explica como resolver os 4 avisos de segurança detectados pelo Supabase Linter.

---

## 📋 Resumo dos Avisos

| # | Aviso | Severidade | Status |
|---|-------|------------|--------|
| 1 | `function_search_path_mutable` (exec_sql) | ⚠️ WARN | ✅ Corrigido via SQL |
| 2 | `function_search_path_mutable` (handle_updated_at) | ⚠️ WARN | ✅ Corrigido via SQL |
| 3 | `extension_in_public` (pg_trgm) | ⚠️ WARN | ✅ Corrigido via SQL |
| 4 | `auth_leaked_password_protection` | ⚠️ WARN | 🔧 Requer ação manual |

---

## 🛠️ Como Aplicar as Correções

### Passo 1: Executar a Migração SQL

1. Acesse o **Supabase Dashboard** do seu projeto
2. Vá para: **SQL Editor** (ícone de banco de dados na barra lateral)
3. Clique em **New Query**
4. Copie e cole o conteúdo do arquivo `supabase_security_fixes.sql`
5. Clique em **Run** (ou pressione `Ctrl+Enter`)

**Resultado esperado:**
```
Success. No rows returned.
```

---

### Passo 2: Habilitar Proteção contra Senhas Vazadas (Manual)

Esta configuração **não pode ser feita via SQL** e requer acesso ao Dashboard:

1. Acesse: `https://supabase.com/dashboard/project/SEU_PROJECT_ID/auth/policies`
2. No menu lateral, vá para: **Authentication** → **Policies**
3. Procure pela seção: **"Password Strength and Leaked Password Protection"**
4. Ative a opção: **"Check against HaveIBeenPwned database"**
5. Clique em **Save**

**O que isso faz:**
- Verifica automaticamente se as senhas dos usuários foram expostas em vazamentos de dados conhecidos
- Usa a API do [HaveIBeenPwned.org](https://haveibeenpwned.com/) de forma segura (sem enviar a senha completa)
- Bloqueia senhas comprometidas durante o cadastro e alteração de senha

---

## 🔍 Detalhes Técnicos

### 1. Function Search Path Mutable

**Problema:**
Funções sem `search_path` fixo podem ser exploradas por ataques de "search path injection", onde um atacante cria objetos maliciosos em schemas que têm precedência.

**Solução:**
Adicionamos `SET search_path = public` em todas as funções:
```sql
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- ← Proteção adicionada
AS $$ ... $$;
```

---

### 2. Extension in Public Schema

**Problema:**
Extensões no schema `public` podem criar conflitos de nomes e dificultar a gestão de permissões.

**Solução:**
Movemos a extensão `pg_trgm` para o schema `extensions`:
```sql
CREATE SCHEMA IF NOT EXISTS extensions;
DROP EXTENSION IF EXISTS pg_trgm CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;
```

**⚠️ Atenção:**
Se você estava usando `pg_trgm` para busca fuzzy (ex: `LIKE`, `ILIKE`, operadores de similaridade), atualize suas queries para referenciar o schema correto:
```sql
-- Antes:
SELECT * FROM tabela WHERE coluna % 'busca';

-- Depois (se necessário):
SELECT * FROM tabela WHERE coluna extensions.% 'busca';
```

Na prática, o PostgreSQL deve resolver automaticamente se você tiver `extensions` no `search_path`.

---

### 3. Leaked Password Protection

**Problema:**
Sem essa proteção, usuários podem criar contas com senhas que já foram expostas em vazamentos de dados, tornando-as alvos fáceis para ataques de credential stuffing.

**Solução:**
Habilitar manualmente no Dashboard (veja Passo 2 acima).

---

## ✅ Verificação

Após aplicar as correções, execute o **Linter** novamente no Supabase:

1. Vá para: **Database** → **Database Health**
2. Clique em **Run Linter**
3. Verifique se os avisos desapareceram

**Resultado esperado:**
- ✅ Nenhum aviso de `function_search_path_mutable`
- ✅ Nenhum aviso de `extension_in_public`
- ✅ Nenhum aviso de `auth_leaked_password_protection` (se habilitado no Dashboard)

---

## 📚 Referências

- [Supabase Database Linter](https://supabase.com/docs/guides/database/database-linter)
- [Function Search Path Security](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
- [Extension Best Practices](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public)
- [Password Security](https://supabase.com/docs/guides/auth/password-security)

---

## 🆘 Troubleshooting

### Erro: "extension pg_trgm does not exist"
**Causa:** A extensão não estava instalada antes.  
**Solução:** Remova a linha `DROP EXTENSION` do script e execute apenas o `CREATE EXTENSION`.

### Erro: "cannot drop extension pg_trgm because other objects depend on it"
**Causa:** Existem índices ou funções usando a extensão.  
**Solução:** 
1. Identifique as dependências: `SELECT * FROM pg_depend WHERE refobjid = 'pg_trgm'::regclass;`
2. Recrie-as após mover a extensão, ou use `CASCADE` com cuidado.

### Aviso ainda aparece após aplicar a migração
**Causa:** Cache do Linter.  
**Solução:** Aguarde 1-2 minutos e execute o Linter novamente.

---

**Criado em:** 2026-01-26  
**Versão do ZenBolso:** v3.1.2
