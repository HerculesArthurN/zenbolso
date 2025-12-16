// FACADE / BARREL FILE
// Este arquivo exporta as funcionalidades da camada de dados.

export * from './repositories/transaction.repository';
export * from './repositories/transactions'; // Legacy support (deprecating slowly)
export * from './repositories/accounts';
export * from './repositories/categories';
export * from './repositories/recurrence';
export * from './repositories/goals';
export * from './repositories/settings';
export * from './dashboard.service';