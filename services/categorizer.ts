// Mapeamento centralizado de palavras-chave para categorias
// Isso facilita a manutenção: para ensinar algo novo ao sistema, basta adicionar aqui.

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Alimentação': ['ifood', 'uber eats', 'rappi', 'restaurante', 'padaria', 'mercado', 'supermercado', 'mc donalds', 'burger', 'king', 'subway', 'pao de acucar', 'carrefour', 'extra', 'fome', 'lanche', 'almoço', 'jantar'],
  'Transporte': ['uber', '99', 'posto', 'gasolina', 'ipiranga', 'shell', 'estacionamento', 'metro', 'onibus', 'bilhete', 'sem parar', 'veloe', 'combustivel', 'abastecer'],
  'Lazer': ['netflix', 'spotify', 'cinema', 'steam', 'amazon prime', 'hbo', 'disney', 'ingresso', 'eventim', 'sympla', 'bar', 'cerveja', 'jogos', 'game'],
  'Saúde': ['farmacia', 'drogaria', 'medico', 'consulta', 'dentista', 'hosp', 'lab', 'dr', 'remedio'],
  'Moradia': ['aluguel', 'condominio', 'luz', 'agua', 'internet', 'claro', 'vivo', 'tim', 'oi', 'enel', 'sabesp', 'net'],
  'Investimentos': ['nuinvest', 'rico', 'xp', 'tesouro', 'cdb', 'b3', 'corretora', 'trade', 'aporte'],
  'Educação': ['curso', 'udemy', 'alura', 'escola', 'faculdade', 'livraria', 'saraiva', 'amazon book', 'kindle'],
  'Salário': ['pagamento recebido', 'ted recebida', 'doc recebido', 'pix recebido', 'salario', 'proventos', 'remuneracao']
};

export const detectCategoryFromKeywords = (text: string): string => {
    const lowerText = text.toLowerCase();
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(k => lowerText.includes(k))) {
            return category;
        }
    }
    return 'Outros';
};

export const formatDescription = (desc: string): string => {
  // Remove prefixos/sufixos comuns de banco e capitaliza
  let clean = desc.replace(/\s-\s.*/, ''); // Remove "- Localização"
  clean = clean.replace(/\*/g, ' '); // Remove asteriscos
  clean = clean.replace(/\s+/g, ' ').trim();
  if (!clean) return 'Transação';
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
};