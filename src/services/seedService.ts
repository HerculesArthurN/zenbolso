import { subDays, startOfMonth } from 'date-fns';
import { transactionService } from './transactionService';

export const seedService = {
  injectMockData: async (): Promise<boolean> => {
    const today = new Date();
    
    // Munição tática: Espalhada pelo mês atual para gerar gráficos perfeitos
    const mockData = [
      { description: 'Salário Mensal', amount: 5500, type: 'INCOME' as const, date: startOfMonth(today).toISOString().split('T')[0] },
      { description: 'Aluguel', amount: 1500, type: 'EXPENSE' as const, date: subDays(today, 25).toISOString().split('T')[0] },
      { description: 'Mercado Super+', amount: 650.40, type: 'EXPENSE' as const, date: subDays(today, 20).toISOString().split('T')[0] },
      { description: 'Conta de Luz', amount: 120.90, type: 'EXPENSE' as const, date: subDays(today, 15).toISOString().split('T')[0] },
      { description: 'Internet Fibra', amount: 99.90, type: 'EXPENSE' as const, date: subDays(today, 10).toISOString().split('T')[0] },
      { description: 'Ifood (Pizza)', amount: 75.50, type: 'EXPENSE' as const, date: subDays(today, 5).toISOString().split('T')[0] },
      { description: 'Uber', amount: 24.00, type: 'EXPENSE' as const, date: subDays(today, 2).toISOString().split('T')[0] },
      { description: 'Rendimento Nu/Inter', amount: 45.30, type: 'INCOME' as const, date: today.toISOString().split('T')[0] },
    ];

    try {
      // Injeção iterativa segura garantida
      for (const tx of mockData) {
        await transactionService.createTransaction(tx as any); 
      }
      return true;
    } catch (error) {
      console.error('Falha ao injetar munição de festim:', error);
      return false;
    }
  }
};
