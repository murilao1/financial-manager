import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Dimensions } from 'react-native';
import { Text, useTheme, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, PieChart } from 'react-native-chart-kit';

const CARD_MAX_WIDTH = 720;
const CHART_PADDING = 64;

interface Transaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    date: string;
    description: string;
}

interface Metrics {
    savingsRate: number;
    totalIncome: number;
    totalExpense: number;
    balance: number;
    topExpenseCategory: string;
    topExpenseAmount: number;
    largestExpense: { description: string; amount: number; date: string };
    largestIncome: { description: string; amount: number; date: string };
    mostActiveDay: { day: string; count: number };
}

const DAYS_OF_WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function AnalyticsScreen() {
    const theme = useTheme();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [dimensions, setDimensions] = useState(Dimensions.get('window'));

    // Listener para mudanças de dimensão
    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDimensions(window);
        });

        return () => subscription?.remove();
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        if (transactions.length > 0) {
            calculateMetrics();
        }
    }, [transactions, selectedPeriod]);

    const fetchTransactions = async () => {
        try {
            // TODO: Substituir pela sua chamada de API
            const mockData: Transaction[] = [
                { id: '1', type: 'income', amount: 5000, category: 'Salário', date: '2025-10-01', description: 'Salário mensal' },
                { id: '2', type: 'expense', amount: 1500, category: 'Moradia', date: '2025-10-05', description: 'Aluguel' },
                { id: '3', type: 'expense', amount: 500, category: 'Alimentação', date: '2025-10-10', description: 'Supermercado' },
                { id: '4', type: 'expense', amount: 250, category: 'Transporte', date: '2025-10-15', description: 'Combustível' },
                { id: '5', type: 'income', amount: 1000, category: 'Freelance', date: '2025-10-20', description: 'Projeto extra' },
                { id: '6', type: 'expense', amount: 800, category: 'Lazer', date: '2025-10-22', description: 'Viagem' },
                { id: '7', type: 'expense', amount: 150, category: 'Saúde', date: '2025-10-25', description: 'Farmácia' },
                { id: '8', type: 'expense', amount: 400, category: 'Alimentação', date: '2025-10-28', description: 'Restaurante' },
                { id: '9', type: 'income', amount: 2000, category: 'Investimentos', date: '2025-10-30', description: 'Dividendos' },
                { id: '10', type: 'income', amount: 4000, category: 'Adiantamento', date: '2025-08-29', description: 'Salário mensal' },
                { id: '11', type: 'income', amount: 5000, category: 'Salário', date: '2025-09-05', description: 'Salário mensal' },
                { id: '12', type: 'expense', amount: 1500, category: 'Moradia', date: '2025-09-05', description: 'Aluguel' },
                { id: '13', type: 'expense', amount: 500, category: 'Alimentação', date: '2025-09-10', description: 'Supermercado' },
                { id: '14', type: 'expense', amount: 250, category: 'Transporte', date: '2025-09-15', description: 'Combustível' },
                { id: '15', type: 'income', amount: 1000, category: 'Freelance', date: '2025-09-20', description: 'Projeto extra' },
                { id: '16', type: 'expense', amount: 800, category: 'Lazer', date: '2025-09-22', description: 'Viagem' },
                { id: '17', type: 'expense', amount: 150, category: 'Saúde', date: '2025-09-25', description: 'Farmácia' },
                { id: '18', type: 'expense', amount: 400, category: 'Alimentação', date: '2025-09-28', description: 'Restaurante' },
                { id: '19', type: 'income', amount: 2000, category: 'Investimentos', date: '2025-09-29', description: 'Dividendos' },
                { id: '20', type: 'income', amount: 4000, category: 'Adiantamento', date: '2025-09-30', description: 'Salário mensal' },
            ];

            setTransactions(mockData);
        } catch (error) {
            console.error('Erro ao buscar transações:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateMetrics = () => {
        const now = new Date();
        const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const filteredTransactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);

            switch (selectedPeriod) {
                case 'week':
                    const weekAgo = new Date(currentDate);
                    weekAgo.setDate(currentDate.getDate() - 7);
                    return transactionDate >= weekAgo;

                case 'month':
                    return transactionDate.getMonth() === currentDate.getMonth() &&
                        transactionDate.getFullYear() === currentDate.getFullYear();

                case 'year':
                    return transactionDate.getFullYear() === currentDate.getFullYear();

                default:
                    return true;
            }
        });
        const income = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = income - expense;
        const savingsRate = income > 0 ? ((balance / income) * 100) : 0;

        // Despesas por categoria
        const expensesByCategory = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        const topCategory = Object.entries(expensesByCategory)
            .sort(([, a], [, b]) => b - a)[0];

        // Maior despesa individual
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        const largestExpenseTransaction = expenseTransactions.length > 0
            ? expenseTransactions.reduce((max, t) => t.amount > max.amount ? t : max)
            : null;

        // Maior receita individual
        const incomeTransactions = transactions.filter(t => t.type === 'income');
        const largestIncomeTransaction = incomeTransactions.length > 0
            ? incomeTransactions.reduce((max, t) => t.amount > max.amount ? t : max)
            : null;

        // Dia da semana mais ativo
        const dayCount = transactions.reduce((acc, t) => {
            const dayOfWeek = new Date(t.date).getDay();
            acc[dayOfWeek] = (acc[dayOfWeek] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        const mostActiveDay = Object.entries(dayCount)
            .sort(([, a], [, b]) => b - a)[0];

        setMetrics({
            savingsRate,
            totalIncome: income,
            totalExpense: expense,
            balance,
            topExpenseCategory: topCategory?.[0] || 'N/A',
            topExpenseAmount: topCategory?.[1] || 0,
            largestExpense: largestExpenseTransaction
                ? {
                    description: largestExpenseTransaction.description,
                    amount: largestExpenseTransaction.amount,
                    date: new Date(largestExpenseTransaction.date).toLocaleDateString('pt-BR'),
                }
                : { description: 'N/A', amount: 0, date: '' },
            largestIncome: largestIncomeTransaction
                ? {
                    description: largestIncomeTransaction.description,
                    amount: largestIncomeTransaction.amount,
                    date: new Date(largestIncomeTransaction.date).toLocaleDateString('pt-BR'),
                }
                : { description: 'N/A', amount: 0, date: '' },
            mostActiveDay: mostActiveDay
                ? { day: DAYS_OF_WEEK[parseInt(mostActiveDay[0])], count: mostActiveDay[1] }
                : { day: 'N/A', count: 0 },
        });
    };

    const getCategoryChartData = () => {
        const expensesByCategory = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        const sortedCategories = Object.entries(expensesByCategory)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        if (sortedCategories.length === 0) {
            return {
                labels: ['Sem dados'],
                datasets: [{ data: [0] }],
            };
        }

        return {
            labels: sortedCategories.map(([cat]) => cat),
            datasets: [{
                data: sortedCategories.map(([, amount]) => amount),
            }],
        };
    };

    const getPieChartData = () => {
        const expensesByCategory = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        const colors = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#009688'];
        const isMobile = dimensions.width <= 768;

        return Object.entries(expensesByCategory)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, population], index) => ({
                name,
                population,
                color: colors[index % colors.length],
                legendFontColor: theme.dark ? '#FFFFFF' : '#000000',
                legendFontSize: isMobile ? 12 : 14,
            }));
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.screen}>
                <View style={[styles.header, { borderBottomColor: theme.colors.primary }]}>
                    <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
                        Análises Financeiras
                    </Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text variant="bodyLarge" style={styles.loadingText}>
                        Carregando análises...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    const categoryData = getCategoryChartData();
    const pieData = getPieChartData();

    // Cálculo responsivo baseado nas dimensões atuais
    const isMobile = dimensions.width <= 768;
    const cardContentWidth = isMobile
        ? dimensions.width - 32  // 16px de padding de cada lado do containerView
        : Math.min(dimensions.width - 32, CARD_MAX_WIDTH);
    const chartWidth = isMobile
        ? dimensions.width - CHART_PADDING
        : Math.min(dimensions.width - CHART_PADDING, CARD_MAX_WIDTH);
    const chartHeight = isMobile ? 200 : 280;

    return (
        <SafeAreaView style={styles.screen}>
            <View style={[styles.header, { borderBottomColor: theme.colors.primary }]}>
                <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
                    Análises Financeiras
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.containerView}>
                <View style={styles.container}>
                    <Text variant="bodyLarge" style={styles.subtitle}>
                        Visão detalhada do seu desempenho financeiro
                    </Text>

                    {/* Período Selector */}
                    <View style={styles.periodContainer}>
                        <View style={styles.chipsWrapper}>
                            <Chip
                                selected={selectedPeriod === 'week'}
                                onPress={() => setSelectedPeriod('week')}
                                style={[styles.chip, selectedPeriod === 'week' && { backgroundColor: theme.colors.primary }]}
                                textStyle={selectedPeriod === 'week' ? { color: theme.colors.onPrimary } : undefined}
                            >
                                Semana
                            </Chip>
                            <Chip
                                selected={selectedPeriod === 'month'}
                                onPress={() => setSelectedPeriod('month')}
                                style={[styles.chip, selectedPeriod === 'month' && { backgroundColor: theme.colors.primary }]}
                                textStyle={selectedPeriod === 'month' ? { color: theme.colors.onPrimary } : undefined}
                            >
                                Mês
                            </Chip>
                            <Chip
                                selected={selectedPeriod === 'year'}
                                onPress={() => setSelectedPeriod('year')}
                                style={[styles.chip, selectedPeriod === 'year' && { backgroundColor: theme.colors.primary }]}
                                textStyle={selectedPeriod === 'year' ? { color: theme.colors.onPrimary } : undefined}
                            >
                                Ano
                            </Chip>
                        </View>
                    </View>

                    {/* Resumo Financeiro */}
                    {metrics && (
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.primary }]}>
                                    Resumo Financeiro
                                </Text>

                                <View style={styles.summaryRow}>
                                    <View style={styles.summaryItem}>
                                        <Text variant="bodyMedium" style={styles.summaryLabel}>
                                            Receitas
                                        </Text>
                                        <Text variant="titleMedium" style={[styles.summaryValue, styles.incomeText]}>
                                            R$ {metrics.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </Text>
                                    </View>

                                    <View style={styles.summaryDivider} />

                                    <View style={styles.summaryItem}>
                                        <Text variant="bodyMedium" style={styles.summaryLabel}>
                                            Despesas
                                        </Text>
                                        <Text variant="titleMedium" style={[styles.summaryValue, styles.expenseText]}>
                                            R$ {metrics.totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </Text>
                                    </View>
                                </View>

                                <View style={[styles.balanceContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                                    <View style={styles.balanceRow}>
                                        <Text variant="bodyMedium" style={styles.balanceLabel}>
                                            Saldo do Período
                                        </Text>
                                        <Text
                                            variant="titleLarge"
                                            style={[
                                                styles.balanceValue,
                                                { color: metrics.balance >= 0 ? '#4CAF50' : '#F44336' }
                                            ]}
                                        >
                                            R$ {metrics.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </Text>
                                    </View>

                                    <View style={styles.balanceRow}>
                                        <Text variant="bodyMedium" style={styles.savingsText}>
                                            Taxa de Poupança:
                                        </Text>
                                        <Text
                                            variant="titleLarge"
                                            style={[
                                                styles.balanceValue,
                                                { color: metrics.balance >= 0 ? '#4CAF50' : '#F44336' }
                                            ]}
                                        >
                                            {metrics.savingsRate.toFixed(1)}%
                                        </Text>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    )}

                    {/* Estatísticas Extras */}
                    {metrics && (
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.primary }]}>
                                    Estatísticas Detalhadas
                                </Text>

                                {/* Maior Receita */}
                                <View style={[styles.statItem, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                                    <View style={styles.statHeader}>
                                        <Text variant="titleSmall" style={{ color: '#4CAF50', fontWeight: '600' }}>
                                            💰 Maior Receita
                                        </Text>
                                    </View>
                                    <View style={styles.statContent}>
                                        <Text variant="bodyMedium" style={styles.statDescription}>
                                            {metrics.largestIncome.description}
                                        </Text>
                                        <View style={styles.statRow}>
                                            <Text variant="titleMedium" style={{ color: '#4CAF50', fontWeight: '700' }}>
                                                R$ {metrics.largestIncome.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </Text>
                                            <Text variant="bodySmall" style={styles.statDate}>
                                                {metrics.largestIncome.date}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Maior Despesa */}
                                <View style={[styles.statItem, { backgroundColor: 'rgba(244, 67, 54, 0.1)' }]}>
                                    <View style={styles.statHeader}>
                                        <Text variant="titleSmall" style={{ color: '#F44336', fontWeight: '600' }}>
                                            💸 Maior Despesa
                                        </Text>
                                    </View>
                                    <View style={styles.statContent}>
                                        <Text variant="bodyMedium" style={styles.statDescription}>
                                            {metrics.largestExpense.description}
                                        </Text>
                                        <View style={styles.statRow}>
                                            <Text variant="titleMedium" style={{ color: '#F44336', fontWeight: '700' }}>
                                                R$ {metrics.largestExpense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </Text>
                                            <Text variant="bodySmall" style={styles.statDate}>
                                                {metrics.largestExpense.date}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Dia mais ativo */}
                                <View style={[styles.statItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                                    <View style={styles.statHeader}>
                                        <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                                            📅 Dia da Semana Mais Ativo
                                        </Text>
                                    </View>
                                    <View style={styles.statContent}>
                                        <View style={styles.statRow}>
                                            <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                                                {metrics.mostActiveDay.day}
                                            </Text>
                                            <Text variant="bodySmall" style={styles.statDate}>
                                                {metrics.mostActiveDay.count} transações
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    )}

                    {/* Despesas por Categoria - Barras */}
                    {metrics && metrics.topExpenseCategory !== 'N/A' && (
                        <Card style={[styles.card, styles.transparentCard]}>
                            <Card.Content style={styles.chartCardContent}>
                                <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.primary }]}>
                                    Top 5 Categorias de Despesas
                                </Text>

                                <BarChart
                                    data={categoryData}
                                    width={cardContentWidth}
                                    height={chartHeight}
                                    yAxisLabel="R$ "
                                    yAxisSuffix=""
                                    chartConfig={{
                                        backgroundColor: theme.colors.surface,
                                        backgroundGradientFrom: theme.colors.surface,
                                        backgroundGradientTo: theme.colors.surfaceVariant,
                                        backgroundGradientFromOpacity: 0.95,
                                        backgroundGradientToOpacity: 0.95,
                                        decimalPlaces: 0,
                                        color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
                                        labelColor: (opacity = 1) => theme.dark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.85)',
                                        propsForBackgroundLines: {
                                            strokeDasharray: '',
                                            stroke: theme.colors.surfaceVariant,
                                            strokeWidth: 1,
                                        },
                                        fillShadowGradient: '#F44336',
                                        fillShadowGradientOpacity: 0.15,
                                    } as any}
                                    style={styles.chart}
                                    showValuesOnTopOfBars={!isMobile}
                                    fromZero
                                    withInnerLines={true}
                                    withHorizontalLabels={true}
                                />
                            </Card.Content>
                        </Card>
                    )}

                    {/* Distribuição de Despesas - Pizza */}
                    {pieData.length > 0 && (
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.primary }]}>
                                    Distribuição de Despesas
                                </Text>

                                <View style={styles.chartContainer}>
                                    <PieChart
                                        data={pieData}
                                        width={chartWidth}
                                        height={chartHeight}
                                        chartConfig={{
                                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        }}
                                        accessor="population"
                                        backgroundColor="transparent"
                                        paddingLeft={isMobile ? '15' : '30'}
                                        absolute
                                        style={styles.chart}
                                    />
                                </View>
                            </Card.Content>
                        </Card>
                    )}

                    {/* Informação */}
                    <View style={[styles.infoContainer, { backgroundColor: theme.colors.secondaryContainer }]}>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSecondaryContainer, textAlign: 'center' }}>
                            💡 Acompanhe suas finanças regularmente para manter o controle do seu orçamento.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    containerView: {
        padding: 16,
        gap: 16,
        alignItems: 'center',
    },
    container: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: 24,
        width: '100%',
        maxWidth: CARD_MAX_WIDTH,
        alignSelf: 'center',
    },
    header: {
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontWeight: '700',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        textAlign: 'center',
    },
    periodContainer: {
        width: '100%',
        marginBottom: 16,
    },
    chipsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
    },
    chip: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        width: '100%',
        maxWidth: CARD_MAX_WIDTH,
        alignSelf: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        alignSelf: 'center',
        fontWeight: '700',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        marginBottom: 16,
        justifyContent: 'center',
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryDivider: {
        width: 1,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 16,
    },
    summaryLabel: {
        marginBottom: 4,
        opacity: 0.7,
    },
    summaryValue: {
        fontWeight: '600',
    },
    incomeText: {
        color: '#4CAF50',
    },
    expenseText: {
        color: '#F44336',
    },
    balanceContainer: {
        borderRadius: 8,
        padding: 12,
        width: '100%',
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    balanceLabel: {
        opacity: 0.8,
    },
    balanceValue: {
        fontWeight: '700',
    },
    savingsText: {
        opacity: 0.7,
    },
    statItem: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        width: '100%',
    },
    statHeader: {
        marginBottom: 8,
    },
    statContent: {
        gap: 8,
    },
    statDescription: {
        opacity: 0.8,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statDate: {
        opacity: 0.6,
    },
    chartContainer: {
        alignItems: 'center',
        width: '100%',
        overflow: 'hidden',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 8,
    },
    transparentCard: {
        backgroundColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 0,
        borderWidth: 0,
    },
    chartCardContent: {
        paddingHorizontal: 0,
    },
    infoContainer: {
        borderRadius: 8,
        padding: 16,
        paddingBottom: 20,
        marginBottom: 40,
        width: '100%',
        alignItems: 'center',
    },
});