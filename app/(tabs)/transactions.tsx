import Button from '@/designSystem/Button';
import Notification from '@/designSystem/Notification';
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState } from "react";
//import { Theme } from '@react-navigation/native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Card,
  Chip,
  Text, useTheme
} from 'react-native-paper';
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from '../../firebase/firebaseConfig';

type Transaction = {
  id: string;
  date: string;
  amount: number;
  category: string;
};

export default function TransactionsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<"todos" | "credito" | "debito">("todos");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'error' | 'success' | 'info';
  } | null>(null);

  async function fetchTransactions() {
    const user = auth.currentUser;
    if (!user) return [];

    const transactionsRef = collection(db, 'transacoes');
    const q = query(
      transactionsRef,
      where('userId', '==', user.uid),
      // orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      date: doc.data().createdAt?.toDate
        ? doc.data().createdAt.toDate().toISOString()
        : new Date().toISOString(),
      amount: doc.data().value,
      category: doc.data().transaction, // ou 'credito'/'debito' dependendo do seu campo
      ...doc.data(),
    }));

    return data;
  }

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);

      fetchTransactions()
        .then(data => setTransactions(data))
        .catch(err => {
          console.error('Erro ao buscar transações:', err);
          setNotification({ message: 'Erro ao carregar transações', type: 'error' });
        })
        .finally(() => setLoading(false));
    }, []) // Dependências: pode deixar vazio se fetchTransactions não mudar
  );


  const filteredTransactions =
    filter === "todos"
      ? transactions
      : transactions.filter(t => t.category === filter);

  const renderItem = ({ item }: { item: Transaction }) => {
    const isSelected = selectedTransaction?.id === item.id;
    const isCredit = item.amount > 0;

    return (
      <Card
        style={[
          styles.card,
          {
            backgroundColor: isSelected
              ? theme.colors.secondaryContainer
              : theme.colors.background,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }
        ]}
        onPress={() => setSelectedTransaction(item)}
      >
        <Card.Content style={{ paddingVertical: 12 }}>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}
          >
            {new Date(item.date).toLocaleString("pt-BR")}
          </Text>
          <View style={styles.itemRow}>
            <Chip
              compact
              mode="outlined"
              textStyle={[styles.chipText, { fontSize: 11, color: theme.colors.onSurfaceVariant }]}
            >
              {item.category.toUpperCase()}
            </Chip>
            <Text
              variant="titleMedium"
              style={{
                color: isCredit ? "#16A34A" : theme.colors.error,
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              {isCredit
                ? `+R$ ${item.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                : `-R$ ${Math.abs(item.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const handleDelete = () => {
    if (!selectedTransaction) return;
    Alert.alert(
      "Excluir transação",
      "Tem certeza que deseja excluir esta transação?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir", style: "destructive", onPress: () => {
            setTransactions(prev => prev.filter(t => t.id !== selectedTransaction.id));
            setSelectedTransaction(null);
            setNotification({ message: "Transação excluída!", type: "info" });
          }
        },
      ]
    );
  };

const handleEdit = () => {
  if (!selectedTransaction) return;

  router.push({
    pathname: "/(tabs)/transaction-form",
    params: {
      id: selectedTransaction.id,
      amount: String(selectedTransaction.amount),
      category: selectedTransaction.category,
      date: selectedTransaction.date,
    },
  });

  setNotification({ message: "Editando transação...", type: "info" });
};



  return (
    <SafeAreaView style={styles.screen}>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onHide={() => setNotification(null)}
        />
      )}

      <View style={[styles.header, { borderBottomColor: theme.colors.primary }]}>
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Transações
        </Text>
      </View>

      <View style={styles.tabRow}>
        {["todos", "credito", "debito"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.tabButton,
              {
                borderColor: theme.colors.primary,
                backgroundColor: filter === f ? theme.colors.primary : theme.colors.background
              }
            ]}
            onPress={() => setFilter(f as "todos" | "credito" | "debito")}
          >
            <Text
              style={{
                color: filter === f ? theme.colors.onPrimary : theme.colors.primary,
                fontWeight: "bold"
              }}
            >
              {f === "todos" ? "Todos" : f === "credito" ? "Crédito" : "Débito"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredTransactions.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>Nenhuma transação</Text>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 140, marginHorizontal: 16 }}
        />
      )}
      {selectedTransaction && (<View style={[styles.footer, { borderTopColor: theme.colors.primary }]}>
          <Button mode="outlined" icon="delete" onPress={handleDelete}>
            Excluir
          </Button>
        
        <Button mode="contained" icon="pencil" onPress={handleEdit}>
          Editar
        </Button>
      </View>)}


      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
    marginHorizontal: 16
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1
  },
  header: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    marginVertical: 6,
    borderRadius: 12,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  chipText: {
    fontSize: 11,
    lineHeight: 14
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    marginBottom: 55,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 8,
    paddingVertical: 6,
  },
});
