import { Transaction, TransactionType, RecurringConfig } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { generateRRule } from './recurrence';
import { postRecurringConfig } from './api';
import { TransactionRepository } from './repositories/transaction.repository';

/**
 * Gera e salva as parcelas de uma transação.
 */
export const processInstallments = async (
    baseTransaction: Omit<Transaction, 'id'>,
    installments: number
): Promise<Transaction> => {
    const installmentValue = baseTransaction.value / installments;
    const baseDate = new Date(baseTransaction.date);
    const tags = [...(baseTransaction.tags || []), 'parcelado'];

    // 1. Criar a primeira parcela (retornada para a UI)
    const firstTx: Transaction = {
        ...baseTransaction,
        id: uuidv4(),
        value: installmentValue,
        description: `${baseTransaction.description || 'Compra Parcelada'} (1/${installments})`,
        tags
    };

    // Salvar primeira parcela (necessário para a UI atualizar imediatamente)
    await TransactionRepository.add(firstTx);

    // 2. Gerar e salvar as parcelas subsequentes em background
    const promises = [];
    for (let i = 1; i < installments; i++) {
        const nextDate = new Date(baseDate);
        nextDate.setMonth(nextDate.getMonth() + i);

        const tx: Transaction = {
            ...baseTransaction,
            id: uuidv4(),
            value: installmentValue,
            date: nextDate.toISOString().split('T')[0],
            description: `${baseTransaction.description || 'Compra Parcelada'} (${i + 1}/${installments})`,
            tags
        };
        promises.push(TransactionRepository.add(tx));
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
        value: number;
        category: string;
        description: string;
        tags?: string[];
        date: string;
        frequency: 'weekly' | 'monthly' | 'yearly';
    }
): Promise<void> => {
    const startDate = new Date(data.date);
    // Ajuste de fuso horário simples para garantir a data correta na regra
    const localDate = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
    const rruleString = generateRRule(data.frequency, localDate);

    // 1. Criar e salvar a Primeira Transação IMEDIATAMENTE (para aparecer na lista)
    const firstTransaction: Transaction = {
        id: uuidv4(),
        type: data.type,
        value: data.value,
        category: data.category,
        description: data.description ? `${data.description} (Recorrente)` : 'Transação Recorrente',
        tags: data.tags,
        date: data.date
    };
    await TransactionRepository.add(firstTransaction);

    // 2. Salvar a Configuração da Recorrência
    const config: RecurringConfig = {
        id: uuidv4(),
        type: data.type,
        value: data.value,
        category: data.category,
        description: data.description,
        tags: data.tags,
        frequency: data.frequency,
        rruleString,
        lastGeneratedDate: data.date, // Marcamos hoje como gerado para o robô pegar apenas a próxima
        nextDueDate: '', // Será calculado pelo job de recorrência na próxima execução
        active: true
    };

    await postRecurringConfig(config);
};