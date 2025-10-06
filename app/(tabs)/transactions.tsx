import Button from "@/designSystem/Button";
import Notification from "@/designSystem/Notification";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  View,
} from "react-native";
import { Card, Chip, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebase/firebaseConfig";

type Transaction = {
  id: string;
  date: string;
  amount: number;
  category: "credit" | "debit"; // valor do Firestore
  categoryLabel: string;       // valor exibido no front
};

export default function TransactionsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"todos" | "deposito" | "transferencia">("todos");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // 🔹 Buscar transações do Firestore
  const fetchTransactions = async () => {
    const user = auth.currentUser;
    if (!user) return [];

    setLoading(true);
    try {
      const transactionsRef = collection(db, "transacoes");
      const q = query(transactionsRef, where("userId", "==", user.uid));

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => {
        const category = doc.data().transaction.toLowerCase(); // "credit" ou "debit"
        return {
          id: doc.id,
          date: doc.data().createdAt?.toDate
            ? doc.data().createdAt.toDate().toISOString()
            : new Date().toISOString(),
          amount: doc.data().value,
          category: category as "credit" | "debit",
          categoryLabel: category === "credit" ? "Depósito" : "Transferência",
          ...doc.data(),
        };
      });
      setTransactions(data);
    } catch (error) {
      console.error(error);
      setNotification({ message: "Erro ao carregar transações", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // 🔹 Filtrar transações
  const filteredTransactions =
    filter === "todos"
      ? transactions
      : transactions.filter((t) =>
          (filter === "deposito" && t.category === "credit") ||
          (filter === "transferencia" && t.category === "debit")
        );

  // 🔹 Renderização de cada item
  const renderItem = ({ item }: { item: Transaction }) => {
    const isSelected = selectedTransaction?.id === item.id;
    const isCredit = item.category === "credit";

    return (
      <Card
        style={[
          styles.card,
          {
            backgroundColor: isSelected
              ? theme.colors.secondaryContainer
              : theme.colors.background,
          },
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
              textStyle={{ fontSize: 11, color: theme.colors.onSurfaceVariant }}
            >
              {item.categoryLabel.toUpperCase()}
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

  // 🔹 Excluir
  const handleDelete = () => {
    if (!selectedTransaction) return;
    Alert.alert(
      "Excluir transação",
      "Tem certeza que deseja excluir esta transação?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            setTransactions((prev) => prev.filter((t) => t.id !== selectedTransaction.id));
            setSelectedTransaction(null);
            setNotification({ message: "Transação excluída!", type: "info" });
          },
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
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
          Transações
        </Text>
      </View>

      {/* 🔹 Filtro */}
      <View style={styles.tabRow}>
        <Chip
          selected={filter === "todos"}
          onPress={() => setFilter("todos")}
          style={[styles.chip, filter === "todos" && { backgroundColor: theme.colors.primary }]}
          textStyle={filter === "todos" ? { color: theme.colors.onPrimary } : undefined}
        >
          Todos
        </Chip>

        <Chip
          selected={filter === "deposito"}
          onPress={() => setFilter("deposito")}
          style={[styles.chip, filter === "deposito" && { backgroundColor: theme.colors.primary }]}
          textStyle={filter === "deposito" ? { color: theme.colors.onPrimary } : undefined}
        >
          Depósito
        </Chip>

        <Chip
          selected={filter === "transferencia"}
          onPress={() => setFilter("transferencia")}
          style={[styles.chip, filter === "transferencia" && { backgroundColor: theme.colors.primary }]}
          textStyle={filter === "transferencia" ? { color: theme.colors.onPrimary } : undefined}
        >
          Transferência
        </Chip>
      </View>

      {filteredTransactions.length === 0 && !loading ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>Nenhuma transação</Text>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 140, marginHorizontal: 16 }}
        />
      )}

      {selectedTransaction && (
        <View style={[styles.footer, { borderTopColor: theme.colors.primary }]}>
          <Button mode="outlined" icon="delete" onPress={handleDelete}>
            Excluir
          </Button>

          <Button mode="contained" icon="pencil" onPress={handleEdit}>
            Editar
          </Button>
        </View>
      )}

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
  },
  header: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginVertical: 16,
  },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  card: {
    marginVertical: 6,
    borderRadius: 12,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 16,
    marginBottom: 55,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
