import logoLottie from '@/assets/lottie/logo.json';
import { Row } from '@/components/ui/Layout';
import { Link } from 'expo-router';
import LottieView from 'lottie-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';

export default function HomeScreen() {
  const theme = useTheme();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <LottieView source={logoLottie} autoPlay loop style={styles.heroLogo} />
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Banco Simples
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Seu dinheiro. Sua maneira. Seu controle financeiro simplificado.
        </Text>
        <Row gap={12} style={styles.actions}>
          <Link href="/(tabs)/transactions" asChild>
            <Button
              mode="contained"
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Ir para Transações
            </Button>
          </Link>
          <Link href="/(tabs)/analytics" asChild>
            <Button
              mode="outlined"
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Ver Análises
            </Button>
          </Link>
        </Row>
      </View>

      <View style={styles.grid}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium">Controle de Transações</Text>
            <Text variant="bodyMedium" style={{ marginTop: 6 }}>
              Adicione, edite e visualize todas as suas transações em um só
              lugar.
            </Text>
          </Card.Content>
        </Card>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium">Análises Financeiras</Text>
            <Text variant="bodyMedium" style={{ marginTop: 6 }}>
              Métricas, tendências mensais e fluxo de caixa ao seu alcance.
            </Text>
          </Card.Content>
        </Card>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium">Anexos e Categorias</Text>
            <Text variant="bodyMedium" style={{ marginTop: 6 }}>
              Upload de comprovantes e categorização inteligente.
            </Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    // paddingBottom: 64,
    gap: 16,
    alignItems: 'center',
    // justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
  },
  actions: {
    marginTop: 16,
  },
  button: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroLogo: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  card: {
    flexBasis: '100%',
  },
  cardContent: {
    gap: 4,
  },
});
