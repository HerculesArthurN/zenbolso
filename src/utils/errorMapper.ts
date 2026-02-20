
const errorMessages: Record<string, string> = {
  // --- Validação (Entrada do Usuário) ---
  'VALIDATION_REQUIRED_FIELD': 'Por favor, preencha todos os campos obrigatórios.',
  'VALIDATION_INVALID_VALUE': 'O valor informado é inválido. Verifique se é um número positivo.',
  'VALIDATION_INVALID_DATE': 'A data informada não é válida.',
  'VALIDATION_NO_ACCOUNT': 'Selecione uma conta para continuar.',
  'VALIDATION_NO_CATEGORY': 'Selecione uma categoria para a transação.',
  'VALIDATION_FUTURE_DATE_LOCKED': 'Não é permitido lançar transações muito distantes no futuro.',
  
  // --- Regras de Negócio ---
  'BUSINESS_LAST_ACCOUNT_DELETE': 'Você não pode excluir sua única conta. O sistema precisa de pelo menos uma.',
  'BUSINESS_LAST_CATEGORY_DELETE': 'É necessário manter pelo menos uma categoria deste tipo.',
  'BUSINESS_INSUFFICIENT_FUNDS_WARNING': 'Atenção: Essa transação deixará o saldo da conta negativo.',
  
  // --- Banco de Dados / Armazenamento ---
  'DB_WRITE_ERROR': 'Falha ao salvar os dados. Verifique o armazenamento do dispositivo.',
  'DB_READ_ERROR': 'Não foi possível ler os dados. Tente recarregar a página.',
  'DB_DELETE_ERROR': 'Falha ao excluir o registro.',
  'DB_QUOTA_EXCEEDED': 'Seu dispositivo está sem espaço para salvar novos dados.',
  'DB_CONSTRAINT_ERROR': 'Já existe um registro com este nome ou identificador.',
  
  // --- Importação / Exportação ---
  'IMPORT_EMPTY_FILE': 'O arquivo selecionado parece estar vazio.',
  'IMPORT_PARSE_ERROR': 'Não conseguimos ler este arquivo. Verifique se é um CSV válido.',
  'IMPORT_NO_VALID_DATA': 'Nenhuma transação válida foi encontrada no texto ou arquivo.',
  'EXPORT_NO_DATA': 'Não há dados para exportar no momento.',
  
  // --- Genérico ---
  'UNKNOWN_ERROR': 'Ocorreu um erro inesperado. Tente novamente.',
  'NETWORK_ERROR': 'Erro de conexão. Verifique sua internet.',
};

export function getUserFriendlyMessage(code: string): string {
  return errorMessages[code] || errorMessages['UNKNOWN_ERROR'];
}

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
      const code = (error as any).code;
      return getUserFriendlyMessage(code) || (error as any).message;
  }
  if (error instanceof Error) {
      return error.message;
  }
  return getUserFriendlyMessage('UNKNOWN_ERROR');
}
