import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Transaction, Category } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Register fonts (optional, using default Helvetica for now to avoid async loading issues in local-first)
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf' }, // Fallback to standard
    ]
});

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#334155' // slate-700
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    brand: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a' // slate-900
    },
    brandAccent: {
        color: '#10b981' // emerald-500
    },
    reportTitle: {
        fontSize: 14,
        color: '#64748b' // slate-500
    },
    section: {
        margin: 10,
        padding: 10,
    },
    summaryBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f8fafc', // slate-50
        borderRadius: 8,
        padding: 15,
        marginBottom: 20
    },
    summaryItem: {
        alignItems: 'center'
    },
    summaryLabel: {
        fontSize: 8,
        textTransform: 'uppercase',
        color: '#94a3b8', // slate-400
        marginBottom: 4
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    income: { color: '#059669' }, // emerald-600
    expense: { color: '#e11d48' }, // rose-600
    balance: { color: '#4f46e5' }, // indigo-600

    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginTop: 20
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row'
    },
    tableCol: {
        width: '20%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderLeftWidth: 0,
        borderTopWidth: 0
    },
    tableColDesc: {
        width: '40%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderLeftWidth: 0,
        borderTopWidth: 0
    },
    tableCell: {
        margin: 5,
        fontSize: 8
    },
    tableHeader: {
        backgroundColor: '#f1f5f9', // slate-100
        fontWeight: 'bold'
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 8,
        color: '#94a3b8'
    }
});

interface MonthlyReportProps {
    transactions: Transaction[];
    categories: Category[];
    month: Date;
    stats: {
        income: number;
        expense: number;
        balance: number;
    };
}

export const MonthlyReportDocument: React.FC<MonthlyReportProps> = ({ transactions, categories, month, stats }) => {
    const formattedMonth = format(month, 'MMMM yyyy', { locale: ptBR });

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.brand}>ZEN<Text style={styles.brandAccent}>BOLSO</Text></Text>
                    </View>
                    <View>
                        <Text style={styles.reportTitle}>Extrato Mensal • {formattedMonth}</Text>
                    </View>
                </View>

                {/* Executive Summary */}
                <View style={styles.summaryBox}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Receitas</Text>
                        <Text style={[styles.summaryValue, styles.income]}>{formatCurrency(stats.income)}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Despesas</Text>
                        <Text style={[styles.summaryValue, styles.expense]}>{formatCurrency(stats.expense)}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Resultado</Text>
                        <Text style={[styles.summaryValue, styles.balance]}>{formatCurrency(stats.balance)}</Text>
                    </View>
                </View>

                <Text style={{ fontSize: 12, fontWeight: 'bold', marginTop: 10, marginBottom: 5 }}>Detalhamento de Transações</Text>

                {/* Transaction Table */}
                <View style={styles.table}>
                    {/* Header Row */}
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCol, styles.tableHeader]}>
                            <Text style={styles.tableCell}>Data</Text>
                        </View>
                        <View style={[styles.tableColDesc, styles.tableHeader]}>
                            <Text style={styles.tableCell}>Descrição</Text>
                        </View>
                        <View style={[styles.tableCol, styles.tableHeader]}>
                            <Text style={styles.tableCell}>Categoria</Text>
                        </View>
                        <View style={[styles.tableCol, styles.tableHeader]}>
                            <Text style={styles.tableCell}>Valor</Text>
                        </View>
                    </View>

                    {/* Data Rows */}
                    {transactions.map((tx) => {
                        const cat = categories.find(c => c.id === tx.category_id)?.name || 'Outros';
                        const isExpense = tx.type === 'EXPENSE';
                        const amountStyle = isExpense ? styles.expense : styles.income;

                        return (
                            <View style={styles.tableRow} key={tx.id}>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>{format(new Date(tx.date), 'dd/MM/yyyy')}</Text>
                                </View>
                                <View style={styles.tableColDesc}>
                                    <Text style={styles.tableCell}>{tx.description}</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>{cat}</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={[styles.tableCell, amountStyle]}>
                                        {formatCurrency(Number(tx.amount))}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    Gerado automaticamente pelo ZenBolso em {format(new Date(), 'dd/MM/yyyy HH:mm')} • Privado e Offline
                </Text>
            </Page>
        </Document>
    );
};
