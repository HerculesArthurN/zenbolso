import { useState, useEffect, useCallback } from 'react';
import { useCategoriesQuery, useAccountsQuery } from './useFinanceData';
import { SmartParserService } from '../services/domain/parser/smart-parser.service';
import { TransactionDraft } from '../services/domain/parser/types';

export const useSmartForm = () => {
  const [rawInput, setRawInput] = useState('');
  const [parsedData, setParsedData] = useState<TransactionDraft | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  // Carrega dados de contexto (cacheado pelo React Query)
  const { data: categories = [] } = useCategoriesQuery();
  const { data: accounts = [] } = useAccountsQuery();

  // Lógica de Debounce e Parse
  useEffect(() => {
    if (!rawInput.trim()) {
      setParsedData(null);
      return;
    }

    setIsParsing(true);
    
    const handler = setTimeout(() => {
      const result = SmartParserService.parse(rawInput, {
        categories,
        accounts
      });
      
      setParsedData(result);
      setIsParsing(false);
    }, 500); // 500ms de espera

    return () => clearTimeout(handler);
  }, [rawInput, categories, accounts]);

  const clear = useCallback(() => {
    setRawInput('');
    setParsedData(null);
  }, []);

  return {
    rawInput,
    setRawInput,
    parsedData,
    isParsing,
    clear
  };
};