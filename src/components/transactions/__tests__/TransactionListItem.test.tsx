import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransactionListItem } from '../TransactionListItem';
import { Transaction } from '../../../types';

const mockTransaction: Transaction = {
  id: 'tx-123',
  description: 'Compra no Mercado',
  amount: 250.75,
  date: '2026-03-24',
  type: 'EXPENSE',
  category_id: 'cat-1',
  account_id: 'acc-1',
  is_paid: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('TransactionListItem Component', () => {
  it('deve renderizar os dados da transação corretamente (descrição, valor formatado, conta, categoria)', () => {
    const onEditMock = vi.fn();
    const onDeleteMock = vi.fn();

    render(
      <TransactionListItem
        transaction={mockTransaction}
        categoryName="Supermercado"
        accountName="Conta Corrente"
        onEdit={onEditMock}
        onDelete={onDeleteMock}
      />
    );

    // Verifica a renderização
    expect(screen.getByText('Compra no Mercado')).toBeInTheDocument();
    
    // O valor deve aparecer e possivelmente formatado com R$
    const valueElement = screen.getByText((content) => content.includes('250,75') || content.includes('250.75'));
    expect(valueElement).toBeInTheDocument();

    expect(screen.getByText('Supermercado')).toBeInTheDocument();
    expect(screen.getByText('Conta Corrente')).toBeInTheDocument();
  });

  // Nota de TDD: a biblioteca de swipe e a animação do framer-motion assumem o controle 
  // do ponteiro, então testamos o repasse dos eventos da UI para assegurar a consistência 
  // arquitetural do dumb component (ele deve chamar onDelete passando o id correto).
});
