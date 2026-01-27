import { test, expect } from '@playwright/test';

test.describe('Anti-Duplicidade Offline Sync (Smoke v3.0)', () => {
    test('deve garantir que múltiplas edições offline gerem apenas um registro remoto', async ({ page }) => {
        // 1. Inicialização
        await page.goto('/');

        // Injetar helper (já injetado via index.tsx, mas garantimos aqui se necessário)
        // await page.evaluate(() => { ... });

        // 2. Simular Offline
        await page.route('**/*', route => {
            const url = route.request().url();
            if (url.includes('supabase.co')) {
                return route.abort();
            }
            return route.continue();
        });

        // 3. Gerar Conflito
        // Helper: Create Transaction
        const createTx = async (description: string, amount: number) => {
            await page.click('#btn-new-transaction');
            await page.fill('#input-description', description);
            await page.fill('#input-amount', amount.toString());
            // Selecionar conta se necessário (assume-se que a primeira já vem selecionada)
            await page.click('#btn-save-transaction');
            // Aguardar modal fechar
            await page.waitForSelector('#btn-save-transaction', { state: 'hidden' });
        };

        // Helper: Edit Transaction
        const editTx = async (newAmount: number, newDescription?: string) => {
            // Encontrar a transação na lista (RecentTransactions)
            // Passar o mouse para mostrar os botões de ação (group-hover)
            await page.hover(`text=${newDescription || 'Teste Duplicidade'}`);
            await page.click('[title="Editar Transação"]'); // Lucide Pencil title

            await page.fill('#input-amount', newAmount.toString());
            if (newDescription) {
                await page.fill('#input-description', newDescription);
            }
            await page.click('#btn-save-transaction');
            await page.waitForSelector('#btn-save-transaction', { state: 'hidden' });
        };

        // Executar fluxo
        await createTx("Teste Duplicidade", 100);
        await editTx(200);
        await editTx(300, "Teste Duplicidade Final");

        // 4. Asserções Locais
        // Dexie
        const txs: any[] = await page.evaluate(async () => {
            return await (window as any).__test.db.transactions
                .where("description")
                // No Dexie as descrições estão encriptadas, então precisamos descriptografar ou buscar por outro campo
                // Para o teste, vamos buscar todas e descriptografar no evaluate
                .toArray();
        });

        // Como estão encriptadas, vamos usar um helper se estiver disponível ou apenas contar
        expect(txs.length).toBe(1);

        // Fila (Sync Queue)
        const jobs = await page.evaluate(async () => {
            return await (window as any).__test.queue.toArray();
        });

        // Deve haver apenas 1 job (visto que houve merge) ou todos devem ter o mesmo entity_id
        expect(jobs.length).toBeGreaterThan(0);
        const firstEntityId = jobs[0].entity_id;
        expect(jobs.every((j: any) => j.entity_id === firstEntityId)).toBe(true);
        // Com meu SyncQueue.ts, deve ser exatamente 1 job devido ao merge de update em create
        expect(jobs.length).toBe(1);

        // 5. Reativar Rede
        await page.unroute('**/*');

        // Aguardar fila zerar
        await page.waitForFunction(async () => {
            const q = await (window as any).__test.queue.toArray();
            return q.length === 0;
        }, { timeout: 10000 });

        // 6. Asserção Remota (Supabase)
        const remoteCount = await page.evaluate(async () => {
            const { count, error } = await (window as any).__test.supabase
                .from('transactions')
                .select('*', { count: 'exact', head: true })
                .ilike('description', '%Teste Duplicidade%');

            if (error) throw error;
            return count;
        });

        expect(remoteCount).toBe(1);
    });
});
