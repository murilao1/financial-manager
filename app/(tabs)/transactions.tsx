import Button from "@/designSystem/Button";
import Notification from "@/designSystem/Notification";
import { useFocusEffect, useRouter } from "expo-router";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, View } from "react-native";
import { Card, Chip, IconButton, Text, useTheme } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebase/firebaseConfig";

type Transaction = {
  id: string;
  date: string;
  amount: number;
  category: "entrada" | "saida";
  categoryLabel: string;
};

export default function TransactionsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"todos" | "deposito" | "transferencia">("todos");
  const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const user = auth.currentUser;
      if (!user) return;

      const transactionsRef = collection(db, "transacoes");

      const unsubscribe = onSnapshot(
        transactionsRef,
        (snapshot) => {
          const data = snapshot.docs
            .map((d) => {
              const docData = d.data();
              const categoryRaw = docData.transaction?.toLowerCase();
              let category: "entrada" | "saida" = "saida";
              let categoryLabel = "Transferência";
              if (categoryRaw === "entrada") {
                category = "entrada";
                categoryLabel = "Depósito";
              }
              return {
                id: d.id,
                amount: docData.value,
                date: docData.createdAt?.toDate ? docData.createdAt.toDate().toISOString() : new Date().toISOString(),
                category,
                categoryLabel,
                userId: docData.userId,
              };
            })
            .filter((t) => t.userId === user.uid)
            .sort((a, b) => (a.date < b.date ? 1 : -1));

          setTransactions(data);
          setLoading(false);
        },
        (error) => {
          console.error("Erro ao escutar transações:", error);
          setNotification({ message: "Erro ao carregar transações", type: "error" });
          setLoading(false);
        }
      );

      return () => unsubscribe();
    }, [])
  );

  const filteredTransactions = transactions
    .filter((t) =>
      filter === "todos"
        ? true
        : (filter === "deposito" && t.category === "entrada") || (filter === "transferencia" && t.category === "saida")
    )
    .filter((t) => {
      if (!selectedDate) return true;
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getFullYear() === selectedDate.getFullYear() &&
        transactionDate.getMonth() === selectedDate.getMonth() &&
        transactionDate.getDate() === selectedDate.getDate()
      );
    });

  const toggleSelectTransaction = (item: Transaction) => {
    const exists = selectedTransactions.find((t) => t.id === item.id);
    if (exists) {
      setSelectedTransactions(selectedTransactions.filter((t) => t.id !== item.id));
    } else {
      setSelectedTransactions([...selectedTransactions, item]);
    }
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const isSelected = selectedTransactions.some((t) => t.id === item.id);
    const isEntrada = item.category === "entrada";

    return (
      <Card
        style={[styles.card, { backgroundColor: isSelected ? theme.colors.secondaryContainer : theme.colors.background }]}
        onPress={() => toggleSelectTransaction(item)}
        accessibilityLabel={`Transação ${item.categoryLabel}`}
        accessibilityHint={`Toca para ${isSelected ? "deselecionar" : "selecionar"} a transação`}
      >
        <Card.Content style={{ paddingVertical: 12 }}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
            {new Date(item.date).toLocaleString("pt-BR")}
          </Text>
          <View style={styles.itemRow}>
            <Chip compact mode="outlined" textStyle={{ fontSize: 11, color: theme.colors.onSurfaceVariant }}>
              {item.categoryLabel.toUpperCase()}
            </Chip>
            <Text
              variant="titleMedium"
              style={{ color: isEntrada ? "#16A34A" : theme.colors.error, fontWeight: "bold", fontSize: 16 }}
            >
              {isEntrada
                ? `+R$ ${item.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                : `-R$ ${Math.abs(item.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const handleDelete = async () => {
    if (selectedTransactions.length === 0) return;

    Alert.alert("Excluir transações", `Deseja realmente excluir ${selectedTransactions.length} transação(ões)?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await Promise.all(selectedTransactions.map((t) => deleteDoc(doc(db, "transacoes", t.id))));
            setSelectedTransactions([]);
            setNotification({ message: "Transações excluídas com sucesso!", type: "info" });
          } catch (error) {
            console.error("Erro ao excluir:", error);
            setNotification({ message: "Erro ao excluir transações", type: "error" });
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    if (selectedTransactions.length !== 1) return;
    const transaction = selectedTransactions[0];
    router.push({
      pathname: "/(tabs)/transaction-form",
      params: { id: transaction.id, amount: String(transaction.amount), category: transaction.category, date: transaction.date },
    });
  };

  return (
    <SafeAreaView style={styles.screen}>
      {notification && <Notification message={notification.message} type={notification.type} onHide={() => setNotification(null)} />}

      <View style={[styles.header, { borderBottomColor: theme.colors.primary }]}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
          Transações
        </Text>
        <IconButton
          icon="calendar"
          size={26}
          onPress={() => setShowDatePicker(true)}
          iconColor={theme.colors.primary}
          style={{ position: "absolute", right: 12 }}
          accessibilityLabel="Selecionar data"
          accessibilityHint="Abre o calendário para filtrar transações por data"
        />
      </View>

      <DatePickerModal
        locale="pt"
        mode="single"
        visible={showDatePicker}
        date={selectedDate ?? new Date()}
        onDismiss={() => setShowDatePicker(false)}
        onConfirm={({ date }) => {
          setShowDatePicker(false);
          setSelectedDate(date ? date : null);
        }}
      />

      <View style={styles.tabRow}>
        <Chip
          selected={filter === "todos"}
          onPress={() => setFilter("todos")}
          style={[styles.chip, filter === "todos" && { backgroundColor: theme.colors.primary }]}
          textStyle={filter === "todos" ? { color: theme.colors.onPrimary } : undefined}
          accessibilityLabel="Filtrar todas transações"
        >
          Todos
        </Chip>
        <Chip
          selected={filter === "deposito"}
          onPress={() => setFilter("deposito")}
          style={[styles.chip, filter === "deposito" && { backgroundColor: theme.colors.primary }]}
          textStyle={filter === "deposito" ? { color: theme.colors.onPrimary } : undefined}
          accessibilityLabel="Filtrar depósitos"
        >
          Depósito
        </Chip>
        <Chip
          selected={filter === "transferencia"}
          onPress={() => setFilter("transferencia")}
          style={[styles.chip, filter === "transferencia" && { backgroundColor: theme.colors.primary }]}
          textStyle={filter === "transferencia" ? { color: theme.colors.onPrimary } : undefined}
          accessibilityLabel="Filtrar transferências"
        >
          Transferência
        </Chip>
      </View>

      {selectedDate && (
        <Text style={{ textAlign: "center", color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
          {selectedDate.toLocaleDateString("pt-BR")}
        </Text>
      )}

      {filteredTransactions.length === 0 && !loading ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>Nenhuma transação</Text>
      ) : (
        <FlatList data={filteredTransactions} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 140, marginHorizontal: 16 }} />
      )}

      {selectedTransactions.length > 0 && (
        <View style={[styles.footer, { borderTopColor: theme.colors.primary }]}>
          <Button mode="outlined" icon="delete" onPress={handleDelete} accessibilityLabel="Excluir transações" accessibilityHint="Exclui as transações selecionadas">
            Excluir
          </Button>
          {selectedTransactions.length > 1 && (
            <Button
              mode="outlined"
              onPress={() => {
                if (selectedTransactions.length === filteredTransactions.length) {
                  setSelectedTransactions([]);
                } else {
                  setSelectedTransactions(filteredTransactions);
                }
              }}
              accessibilityLabel="Selecionar todas ou limpar seleção"
            >
              {selectedTransactions.length === filteredTransactions.length ? "Limpar" : "Todas"}
            </Button>
          )}
          {selectedTransactions.length === 1 && (
            <Button mode="contained" icon="pencil" onPress={handleEdit} accessibilityLabel="Editar transação" accessibilityHint="Abre a tela para editar a transação selecionada">
              Editar
            </Button>
          )}
        </View>
      )}

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  title: { fontWeight: "bold", fontSize: 20 },
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
    borderRadius: 8,
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
    marginBottom: 70,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
