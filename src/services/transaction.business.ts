import { Transaction, TransactionType, RecurringConfig } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { generateRRule } from './recurrence';
import { postRecurringConfig } from './api';
import { transactionService } from './transactionService';

/**
 * Gera e salva as parcelas de uma transação.
 */
export const processInstallments = async (
    baseTransaction: Omit<Transaction, 'id'>,
    installments: number
): Promise<Transaction> => {
    const installmentValue = baseTransaction.amount / installments;
    const baseDate = new Date(baseTransaction.date);
    // Tags removed as they are not in schema currently
    // const tags = [...(baseTransaction.tags || []), 'parcelado'];

    const now = new Date().toISOString();

    // 1. Criar a primeira parcela (retornada para a UI)
    const firstTx: Transaction = {
        ...baseTransaction,
        id: uuidv4(),
        amount: installmentValue,
        description: `${baseTransaction.description || 'Compra Parcelada'} (1/${installments})`,
        created_at: now,
        updated_at: now
    };

    // Salvar primeira parcela (necessário para a UI atualizar imediatamente)
    await transactionService.createTransaction(firstTx);

    // 2. Gerar e salvar as parcelas subsequentes em background
    const promises = [];
    for (let i = 1; i < installments; i++) {
        const nextDate = new Date(baseDate);
        nextDate.setMonth(nextDate.getMonth() + i);

        const tx: Transaction = {
            ...baseTransaction,
            id: uuidv4(),
            amount: installmentValue,
            date: nextDate.toISOString().split('T')[0],
            description: `${baseTransaction.description || 'Compra Parcelada'} (${i + 1}/${installments})`,
            created_at: now,
            updated_at: now
        };
        promises.push(transactionService.createTransaction(tx));
    }

    await Promise.all(promises);
    return firstTx;
};

/**
 * Cria e salva uma configuração de transação recorrente e gera a primeira ocorrência imediatamente.
 */
export const createRecurringTransaction = async (
    data: {
        type: TransactionType;
        amount: number;
        category_id: string;
        account_id: string;
        user_id: string;
        description: string;
        date: string;
        frequency: 'weekly' | 'monthly' | 'yearly';
    }
): Promise<void> => {
    const startDate = new Date(data.date);
    const localDate = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
    const rruleString = generateRRule(data.frequency, localDate);
    const now = new Date().toISOString();

    // 1. Criar e salvar a Primeira Transação IMEDIATAMENTE
    const firstTransaction: Transaction = {
        id: uuidv4(),
        user_id: data.user_id,
        account_id: data.account_id,
        type: data.type,
        amount: data.amount,
        category_id: data.category_id,
        description: data.description ? `${data.description} (Recorrente)` : 'Transação Recorrente',
        date: data.date,
        is_paid: true,
        created_at: now,
        updated_at: now
    };
    await transactionService.createTransaction(firstTransaction);

    // 2. Salvar a Configuração da Recorrência
    const config: RecurringConfig = {
        id: uuidv4(),
        type: data.type, // Config uses 'type' property
        value: data.amount, // Config uses 'value' property
        category: data.category_id, // Config uses 'category' string (ID)
        account_id: data.account_id,
        user_id: data.user_id,
        description: data.description,
        frequency: data.frequency,
        rruleString,
        lastGeneratedDate: data.date,
        nextDueDate: '',
        active: true
    };

    await postRecurringConfig(config);
};