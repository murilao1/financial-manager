import { useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import {
    ActivityIndicator,
    Card,
    Chip,
    Text,
    useTheme,
} from 'react-native-paper';
import {
    SafeAreaView,
    useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { auth, db } from '../../firebase/firebaseConfig';

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

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

export default function AnalyticsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<
    'week' | 'month' | 'year'
  >('month');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [activeIndex, setActiveIndex] = useState(0); // índice da página atual para dots com cores discretas

  // Listener para mudanças de dimensão
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [])
  );

  // Métricas recalculadas quando transações ou período mudam
  const calculateMetrics = useCallback(() => {
    if (transactions.length === 0) return;
    const now = new Date();
    const currentDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const filteredTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      switch (selectedPeriod) {
        case 'week':
          const weekAgo = new Date(currentDate);
          weekAgo.setDate(currentDate.getDate() - 7);
          return transactionDate >= weekAgo;
        case 'month':
          return (
            transactionDate.getMonth() === currentDate.getMonth() &&
            transactionDate.getFullYear() === currentDate.getFullYear()
          );
        case 'year':
          return transactionDate.getFullYear() === currentDate.getFullYear();
        default:
          return true;
      }
    });
    const income = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;
    const savingsRate = income > 0 ? (balance / income) * 100 : 0;
    const expensesByCategory = transactions
      .filter((t) => t.type === 'expense')
      .reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        },
        {} as Record<string, number>
      );
    const topCategoryEntries = Object.entries(expensesByCategory).sort(
      (a, b) => b[1] - a[1]
    );
    const topCategory = topCategoryEntries[0];
    const expenseTransactions = transactions.filter(
      (t) => t.type === 'expense'
    );
    const largestExpenseTransaction =
      expenseTransactions.length > 0
        ? expenseTransactions.reduce((max, t) => {
            return t.amount > max.amount ? t : max;
          })
        : null;
    const incomeTransactions = transactions.filter((t) => t.type === 'income');
    const largestIncomeTransaction =
      incomeTransactions.length > 0
        ? incomeTransactions.reduce((max, t) => {
            return t.amount > max.amount ? t : max;
          })
        : null;
    const dayCount = transactions.reduce(
      (acc, t) => {
        const dayOfWeek = new Date(t.date).getDay();
        acc[dayOfWeek] = (acc[dayOfWeek] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );
    const mostActiveDayEntries = Object.entries(dayCount).sort(
      (a, b) => b[1] - a[1]
    );
    const mostActiveDay = mostActiveDayEntries[0];
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
            date: new Date(largestExpenseTransaction.date).toLocaleDateString(
              'pt-BR'
            ),
          }
        : { description: 'N/A', amount: 0, date: '' },
      largestIncome: largestIncomeTransaction
        ? {
            description: largestIncomeTransaction.description,
            amount: largestIncomeTransaction.amount,
            date: new Date(largestIncomeTransaction.date).toLocaleDateString(
              'pt-BR'
            ),
          }
        : { description: 'N/A', amount: 0, date: '' },
      mostActiveDay: mostActiveDay
        ? {
            day: DAYS_OF_WEEK[parseInt(mostActiveDay[0])],
            count: mostActiveDay[1],
          }
        : { day: 'N/A', count: 0 },
    });
  }, [transactions, selectedPeriod]);

  useEffect(() => {
    calculateMetrics();
  }, [calculateMetrics]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setTransactions([]);
        return;
      }

      const transRef = collection(db, 'transacoes');
      const q = query(transRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);

      const mapType = (
        transactionField: any,
        categories: any[],
        amount: number
      ) => {
        const field = (transactionField || '').toString().toLowerCase();
        const cats = (categories || []).map((c: any) =>
          c.toString().toLowerCase()
        );

        if (
          field.includes('saída') ||
          field.includes('transferência') ||
          field.includes('transferencia') ||
          field.includes('transf') ||
          cats.some(
            (c: string) =>
              c.includes('saída') ||
              c.includes('transferência') ||
              c.includes('transferencia') ||
              c.includes('transf')
          )
        ) {
          return 'expense' as const;
        }

        if (
          field.includes('entrada') ||
          field.includes('depósito') ||
          field.includes('deposito') ||
          field.includes('dep') ||
          field.includes('recei') ||
          cats.some(
            (c: string) =>
              c.includes('entrada') ||
              c.includes('depósito') ||
              c.includes('deposito') ||
              c.includes('dep') ||
              c.includes('recei')
          )
        ) {
          return 'income' as const;
        }

        if (
          field.includes('debit') ||
          field.includes('desp') ||
          field.includes('expense') ||
          cats.some(
            (c: string) =>
              c.includes('moradia') ||
              c.includes('alimentação') ||
              c.includes('alimentacao') ||
              c.includes('lazer') ||
              c.includes('transporte') ||
              c.includes('saúde') ||
              c.includes('saude')
          )
        ) {
          return 'expense' as const;
        }

        if (
          field.includes('credit') ||
          field.includes('recei') ||
          cats.some(
            (c: string) =>
              c.includes('pagamento') ||
              c.includes('salário') ||
              c.includes('salario') ||
              c.includes('invest')
          )
        ) {
          return 'income' as const;
        }

        return amount >= 0 ? ('income' as const) : ('expense' as const);
      };

      const data: Transaction[] = snapshot.docs.map((docSnap) => {
        const d: any = docSnap.data();
        const categories = d.categories ?? [];
        const rawAmount =
          typeof d.value === 'number' ? d.value : (d.amount ?? 0);
        const amountNum = Number(rawAmount || 0);

        let dateStr = new Date().toISOString();
        if (d.createdAt) {
          try {
            if (typeof d.createdAt.toDate === 'function') {
              dateStr = d.createdAt.toDate().toISOString();
            } else {
              dateStr = new Date(d.createdAt).toISOString();
            }
          } catch {
            dateStr = new Date().toISOString();
          }
        }

        const category =
          Array.isArray(categories) && categories.length > 0
            ? String(categories[0])
            : d.category || 'Outros';
        const description =
          d.observation || d.description || d.transaction || '';
        const type = mapType(d.transaction, categories, amountNum);
        const normalizedAmount = Math.abs(amountNum);

        return {
          id: docSnap.id,
          type,
          amount: normalizedAmount,
          category,
          date: dateStr,
          description,
        } as Transaction;
      });

      data.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setTransactions(data);
    } catch (error) {
      console.error('Erro ao buscar transações do Firestore:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // (legacy calculateMetrics removed - now using memoized version above)

  const getCategoryChartData = () => {
    const expensesByCategory = transactions
      .filter((t) => t.type === 'expense')
      .reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        },
        {} as Record<string, number>
      );

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
      datasets: [
        {
          data: sortedCategories.map(([, amount]) => amount),
        },
      ],
    };
  };

  const getPieChartData = () => {
    const expensesByCategory = transactions
      .filter((t) => t.type === 'expense')
      .reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        },
        {} as Record<string, number>
      );

    const colors = ['#FF9800', '#E91E63', '#9C27B0', '#2196F3', '#FFFB07'];
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

  // Hook de animação deve vir antes de qualquer retorno condicional
  const scrollX = React.useRef(new Animated.Value(0)).current;

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View
          style={[styles.header, { borderBottomColor: theme.colors.primary }]}
        >
          <Text
            variant="headlineMedium"
            style={[styles.title, { color: theme.colors.primary }]}
          >
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
  const isMobile = dimensions.width <= 768;
  const cardContentWidth = isMobile
    ? dimensions.width - 32
    : Math.min(dimensions.width - 32, CARD_MAX_WIDTH);
  const chartWidth = isMobile
    ? dimensions.width - CHART_PADDING
    : Math.min(dimensions.width - CHART_PADDING, CARD_MAX_WIDTH);
  const chartHeight = isMobile ? 200 : 280;

  // ----------------- Animated Sections -----------------
  const sections: { key: string; render: () => React.ReactElement }[] = [
    {
      key: 'resumo',
      render: () => (
        <View style={styles.container}>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Visão detalhada do seu desempenho financeiro
          </Text>
          <View style={styles.periodContainer}>
            <View style={styles.chipsWrapper}>
              {(['week', 'month', 'year'] as const).map((period) => (
                <Chip
                  key={period}
                  selected={selectedPeriod === period}
                  onPress={() => setSelectedPeriod(period)}
                  style={[
                    styles.chip,
                    selectedPeriod === period && {
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                  textStyle={
                    selectedPeriod === period
                      ? { color: theme.colors.onPrimary }
                      : undefined
                  }
                  icon={() => null}
                >
                  {period === 'week'
                    ? 'Semana'
                    : period === 'month'
                      ? 'Mês'
                      : 'Ano'}
                </Chip>
              ))}
            </View>
          </View>
          {metrics ? (
            <Card style={styles.card}>
              <Card.Content>
                <Text
                  variant="titleLarge"
                  style={[styles.cardTitle, { color: theme.colors.primary }]}
                >
                  Resumo Financeiro
                </Text>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text variant="bodyMedium" style={styles.summaryLabel}>
                      Receitas
                    </Text>
                    <Text
                      variant="titleMedium"
                      style={[styles.summaryValue, styles.incomeText]}
                    >
                      R${' '}
                      {metrics.totalIncome.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text variant="bodyMedium" style={styles.summaryLabel}>
                      Despesas
                    </Text>
                    <Text
                      variant="titleMedium"
                      style={[styles.summaryValue, styles.expenseText]}
                    >
                      R${' '}
                      {metrics.totalExpense.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.balanceContainer,
                    { backgroundColor: theme.colors.surfaceVariant },
                  ]}
                >
                  <View style={styles.balanceRow}>
                    <Text variant="bodyMedium" style={styles.balanceLabel}>
                      Saldo do Período
                    </Text>
                    <Text
                      variant="titleLarge"
                      style={[
                        styles.balanceValue,
                        { color: metrics.balance >= 0 ? '#4CAF50' : '#F44336' },
                      ]}
                    >
                      R${' '}
                      {metrics.balance.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
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
                        { color: metrics.balance >= 0 ? '#4CAF50' : '#F44336' },
                      ]}
                    >
                      {metrics.savingsRate.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ) : (
            <Card style={styles.card}>
              <Card.Content>
                <Text
                  variant="titleLarge"
                  style={[styles.cardTitle, { color: theme.colors.primary }]}
                >
                  Resumo Financeiro
                </Text>
                <Text style={{ textAlign: 'center', opacity: 0.7 }}>
                  Nenhuma transação encontrada para o período selecionado.
                  Adicione transações para ver o resumo.
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      ),
    },
    {
      key: 'estatisticas',
      render: () => (
        <View style={styles.container}>
          {metrics ? (
            <Card style={styles.card}>
              <Card.Content>
                <Text
                  variant="titleLarge"
                  style={[styles.cardTitle, { color: theme.colors.primary }]}
                >
                  Estatísticas Detalhadas
                </Text>
                <View
                  style={[
                    styles.statItem,
                    { backgroundColor: 'rgba(76, 175, 80, 0.1)' },
                  ]}
                >
                  <View style={styles.statHeader}>
                    <Text
                      variant="titleSmall"
                      style={{ color: '#4CAF50', fontWeight: '600' }}
                    >
                      💰 Maior Receita
                    </Text>
                  </View>
                  <View style={styles.statContent}>
                    <Text variant="bodyMedium" style={styles.statDescription}>
                      {metrics.largestIncome.description}
                    </Text>
                    <View style={styles.statRow}>
                      <Text
                        variant="titleMedium"
                        style={{ color: '#4CAF50', fontWeight: '700' }}
                      >
                        R${' '}
                        {metrics.largestIncome.amount.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                      <Text variant="bodySmall" style={styles.statDate}>
                        {metrics.largestIncome.date}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={[
                    styles.statItem,
                    { backgroundColor: 'rgba(244, 67, 54, 0.1)' },
                  ]}
                >
                  <View style={styles.statHeader}>
                    <Text
                      variant="titleSmall"
                      style={{ color: '#F44336', fontWeight: '600' }}
                    >
                      💸 Maior Despesa
                    </Text>
                  </View>
                  <View style={styles.statContent}>
                    <Text variant="bodyMedium" style={styles.statDescription}>
                      {metrics.largestExpense.description}
                    </Text>
                    <View style={styles.statRow}>
                      <Text
                        variant="titleMedium"
                        style={{ color: '#F44336', fontWeight: '700' }}
                      >
                        R${' '}
                        {metrics.largestExpense.amount.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                      <Text variant="bodySmall" style={styles.statDate}>
                        {metrics.largestExpense.date}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={[
                    styles.statItem,
                    { backgroundColor: theme.colors.surfaceVariant },
                  ]}
                >
                  <View style={styles.statHeader}>
                    <Text
                      variant="titleSmall"
                      style={{ color: theme.colors.primary, fontWeight: '600' }}
                    >
                      📅 Dia da Semana Mais Ativo
                    </Text>
                  </View>
                  <View style={styles.statContent}>
                    <View style={styles.statRow}>
                      <Text
                        variant="titleMedium"
                        style={{
                          color: theme.colors.primary,
                          fontWeight: '700',
                        }}
                      >
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
          ) : (
            <Card style={styles.card}>
              <Card.Content>
                <Text
                  variant="titleLarge"
                  style={[styles.cardTitle, { color: theme.colors.primary }]}
                >
                  Estatísticas Detalhadas
                </Text>
                <Text style={{ textAlign: 'center', opacity: 0.7 }}>
                  Sem estatísticas disponíveis porque não há transações no
                  período selecionado.
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      ),
    },
    {
      key: 'categorias',
      render: () => (
        <View style={styles.container}>
          {metrics && metrics.topExpenseCategory !== 'N/A' ? (
            <Card style={[styles.card, styles.transparentCard]}>
              <Card.Content style={styles.chartCardContent}>
                <Text
                  variant="titleLarge"
                  style={[styles.cardTitle, { color: theme.colors.primary }]}
                >
                  Top 5 Categorias de Despesas
                </Text>
                <BarChart
                  data={categoryData}
                  width={cardContentWidth}
                  height={chartHeight}
                  yAxisLabel="R$ "
                  yAxisSuffix=""
                  chartConfig={
                    {
                      backgroundColor: theme.colors.surface,
                      backgroundGradientFrom: theme.colors.surface,
                      backgroundGradientTo: theme.colors.surfaceVariant,
                      backgroundGradientFromOpacity: 0.95,
                      backgroundGradientToOpacity: 0.95,
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
                      labelColor: (opacity = 1) =>
                        theme.dark
                          ? 'rgba(255, 255, 255, 0.9)'
                          : 'rgba(0, 0, 0, 0.85)',
                      propsForBackgroundLines: {
                        strokeDasharray: '',
                        stroke: theme.colors.surfaceVariant,
                        strokeWidth: 1,
                      },
                      fillShadowGradient: '#F44336',
                      fillShadowGradientOpacity: 0.15,
                    } as any
                  }
                  style={styles.chart}
                  showValuesOnTopOfBars={!isMobile}
                  fromZero
                  withInnerLines={true}
                  withHorizontalLabels={true}
                />
              </Card.Content>
            </Card>
          ) : (
            <Card style={styles.card}>
              <Card.Content>
                <Text
                  variant="titleLarge"
                  style={[styles.cardTitle, { color: theme.colors.primary }]}
                >
                  Categorias de Despesas
                </Text>
                <Text
                  variant="bodyMedium"
                  style={{ textAlign: 'center', opacity: 0.7 }}
                >
                  Nenhuma despesa categorizada encontrada no período
                  selecionado.
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      ),
    },
    {
      key: 'distribuicao',
      render: () => (
        <View style={styles.container}>
          {pieData.length > 0 ? (
            <Card style={styles.card}>
              <Card.Content>
                <Text
                  variant="titleLarge"
                  style={[styles.cardTitle, { color: theme.colors.primary }]}
                >
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
          ) : (
            <Card style={styles.card}>
              <Card.Content>
                <Text
                  variant="titleLarge"
                  style={[styles.cardTitle, { color: theme.colors.primary }]}
                >
                  Distribuição de Despesas
                </Text>
                <Text style={{ textAlign: 'center', opacity: 0.7 }}>
                  Não há despesas suficientes para gerar a distribuição no
                  período selecionado.
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      ),
    },
  ];

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true }
  );
  // Função simples (não-hook) antes de qualquer retorno condicional
  const handleMomentumScrollEnd = (e: any) => {
    const index = Math.round(
      e.nativeEvent.contentOffset.x / (dimensions.width || 1)
    );
    setActiveIndex(index);
  };

  const renderItem = ({ item }: { item: (typeof sections)[number] }) => {
    return (
      <ScrollView
        style={{ width: dimensions.width }}
        contentContainerStyle={styles.containerView}
        showsVerticalScrollIndicator={false}
      >
        {item.render()}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView
      style={[styles.screen, { paddingBottom: insets.bottom + 40 }]}
    >
      <View
        style={[styles.header, { borderBottomColor: theme.colors.primary }]}
      >
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Análises Financeiras
        </Text>
      </View>
      <Animated.FlatList
        data={sections}
        keyExtractor={(i) => i.key}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
        decelerationRate="fast"
        snapToInterval={dimensions.width}
        snapToAlignment="center"
        disableIntervalMomentum
        onMomentumScrollEnd={handleMomentumScrollEnd}
      />
      {/* Aviso fixo abaixo do carrossel */}
      <View
        style={[
          styles.infoContainer,
          {
            backgroundColor: theme.colors.secondaryContainer,
            marginBottom: insets.bottom + 48,
          },
        ]}
      >
        <Text
          variant="bodyMedium"
          style={{
            color: theme.colors.onSecondaryContainer,
            textAlign: 'center',
          }}
        >
          💡 Acompanhe suas finanças regularmente para manter o controle do seu
          orçamento.
        </Text>
      </View>
      {/* Indicadores de página */}
      <View
        style={[styles.pagerIndicatorContainer, { bottom: insets.bottom + 80 }]}
      >
        {sections.map((_, i) => {
          const inputRange = [
            (i - 1) * dimensions.width,
            i * dimensions.width,
            (i + 1) * dimensions.width,
          ];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.6, 1.2, 0.6],
            extrapolate: 'clamp',
          });
          // Apenas duas cores (ativo e inativo) para evitar variação de tonalidade
          const inactiveColor = theme.dark
            ? 'rgba(255,255,255,0.45)'
            : 'rgba(0,0,0,0.35)';
          const backgroundColor =
            i === activeIndex ? theme.colors.primary : inactiveColor;
          return (
            <Animated.View
              key={i}
              style={[
                styles.pagerDot,
                { transform: [{ scale }], backgroundColor },
              ]}
            />
          );
        })}
      </View>
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
    letterSpacing: 0,
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
    marginHorizontal: 16,
    alignItems: 'center',
  },
  pagerIndicatorContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  pagerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});
