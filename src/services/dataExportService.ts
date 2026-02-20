import { db } from './db';
import { decrypt } from '../utils/crypto';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

export interface ZenBolsoBackup {
    version: number;
    timestamp: string;
    data: {
        transactions: any[];
        accounts: any[];
        categories: any[];
        recurringConfigs: any[];
        goals: any[];
        settings: any[];
    };
}

export const dataExportService = {
    /**
     * Exporta todo o banco de dados como um arquivo JSON (Backup Completo)
     * Os dados são mantidos como estão no banco (criptografados se aplicável).
     */
    async exportToJSON() {
        try {
            const [transactions, accounts, categories, recurringConfigs, goals, settings] = await Promise.all([
                db.transactions.toArray(),
                db.accounts.toArray(),
                db.categories.toArray(),
                db.recurringConfigs.toArray(),
                db.goals.toArray(),
                db.settings.toArray()
            ]);

            const backup: ZenBolsoBackup = {
                version: 1,
                timestamp: new Date().toISOString(),
                data: {
                    transactions,
                    accounts,
                    categories,
                    recurringConfigs,
                    goals,
                    settings
                }
            };

            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const fileName = `zenbolso_backup_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.json`;
            saveAs(blob, fileName);

            return true;
        } catch (error) {
            console.error('Erro ao exportar backup:', error);
            throw new Error('Falha ao gerar backup JSON.');
        }
    },

    /**
     * Importa um arquivo JSON de backup e substitui o banco de dados atual.
     * @param file Arquivo JSON selecionado pelo usuário
     */
    async importFromJSON(file: File): Promise<void> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const content = e.target?.result as string;
                    const backup = JSON.parse(content) as ZenBolsoBackup;

                    if (!backup.data || !backup.version) {
                        throw new Error('Arquivo de backup inválido.');
                    }

                    // Transaction to wipe and restore
                    await db.transaction('rw', [db.transactions, db.accounts, db.categories, db.recurringConfigs, db.goals, db.settings], async () => {
                        // Wipe all tables
                        await Promise.all([
                            db.transactions.clear(),
                            db.accounts.clear(),
                            db.categories.clear(),
                            db.recurringConfigs.clear(),
                            db.goals.clear(),
                            db.settings.clear()
                        ]);

                        // Restore data
                        if (backup.data.transactions?.length) await db.transactions.bulkAdd(backup.data.transactions);
                        if (backup.data.accounts?.length) await db.accounts.bulkAdd(backup.data.accounts);
                        if (backup.data.categories?.length) await db.categories.bulkAdd(backup.data.categories);
                        if (backup.data.recurringConfigs?.length) await db.recurringConfigs.bulkAdd(backup.data.recurringConfigs);
                        if (backup.data.goals?.length) await db.goals.bulkAdd(backup.data.goals);
                        if (backup.data.settings?.length) await db.settings.bulkAdd(backup.data.settings);
                    });

                    resolve();
                } catch (err) {
                    console.error('Erro ao importar backup:', err);
                    reject(err);
                }
            };

            reader.onerror = () => reject(new Error('Erro ao ler arquivo.'));
            reader.readAsText(file);
        });
    },

    /**
     * Exporta transações visíveis para CSV (Descriptografado).
     */
    async exportToCSV() {
        try {
            const transactions = await db.transactions.toArray();
            const accounts = await db.accounts.toArray();
            const accountMap = new Map(accounts.map((a: any) => [a.id, a.name]));

            // Header Row
            const headers = ['Data', 'Descrição', 'Categoria', 'Valor', 'Tipo', 'Conta', 'Status'];

            // Data Rows
            const rows = transactions.map((tx: any) => {
                const date = tx.date;
                const description = decrypt(tx.description || '') || 'Sem descrição';

                // Decrypt amount
                let amount = 0;
                if (typeof tx.amount === 'string') {
                    const decrypted = decrypt(tx.amount);
                    amount = decrypted ? Number(decrypted) : 0;
                } else {
                    amount = Number(tx.amount) || 0;
                }

                const category = typeof tx.category_id === 'string' ? tx.category_id : 'Outros';
                const type = tx.type === 'EXPENSE' ? 'Despesa' : 'Receita';
                const accountName = accountMap.get(tx.account_id || '') || 'Carteira';
                const status = 'Pago'; // Dexie items are usually confirmed in this app model

                // CSV escaping for description
                const safeDesc = `"${description.replace(/"/g, '""')}"`;

                return [date, safeDesc, category, amount.toFixed(2), type, accountName, status].join(',');
            });

            const csvContent = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const fileName = `zenbolso_relatorio_${format(new Date(), 'yyyy-MM-dd')}.csv`;
            saveAs(blob, fileName);

            return true;
        } catch (error) {
            console.error('Erro ao exportar CSV:', error);
            throw new Error('Falha ao gerar CSV.');
        }
    }
};
