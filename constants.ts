
export const CATEGORIES = {
  income: ['Salário', 'Freelance', 'Investimentos', 'Outros'],
  expense: ['Moradia', 'Alimentação', 'Saúde', 'Educação', 'Assinaturas', 'Outros'],
};

export const CATEGORY_ICONS: Record<string, string> = {
  'Salário': '💰',
  'Freelance': '💻',
  'Investimentos': '📈',
  'Outros': '📦',
  'Moradia': '🏠',
  'Alimentação': '🍔',
  'Transporte': '🚗',
  'Lazer': '🎉',
  'Saúde': '💊',
  'Educação': '📚',
  'Assinaturas': '🎬',
  'Mercado': '🛒',
  'Padaria': '🥖',
  'Restaurante': '🍽️',
  'Uber': '🚕',
  'Gasolina': '⛽'
};

export const COLORS = [
  '#2DD4BF', // Teal (Primary)
  '#FBBF24', // Amber (Secondary)
  '#F43F5E', // Rose (Expense)
  '#818CF8', // Indigo (Cool)
  '#34D399', // Emerald (Growth)
  '#FB7185', // Soft Rose
  '#60A5FA', // Blue
  '#A78BFA', // Violet
];


export const STORAGE_KEY = 'pocket_manager_data_v1';
export const SETUP_KEY = '@finance-app:setup-completed';