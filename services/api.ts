// FACADE / BARREL FILE
// Este arquivo agora apenas re-exporta as funcionalidades modularizadas em 'repositories' e 'dashboard.service'.

export * from './repositories/transactions';
export * from './repositories/accounts';
export * from './repositories/categories';
export * from './repositories/recurrence';
export * from './repositories/goals';
export * from './repositories/settings';
export * from './dashboard.service';
