import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, TextInput, Chip, useTheme } from 'react-native-paper';
import Select from '@/designSystem/Select';
import UploadField from '@/designSystem/UploadField';
import { suggestCategories } from '@/helpers/categories';
import Button from '@/designSystem/Button';
import Notification from '@/designSystem/Notification';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveTransaction } from '@/firebase/saveTransactions';

type TransactionsType = {
  id?: string;
  transaction: string;
  value: number;
  observation: string;
  file: {
    uri: string;
    name: string;
    size?: number;
    type?: string;
  } | null;
  categories: string[];
};

type TransactionFormProps = {
  selectedTransaction?: TransactionsType | null;
};

export default function TransactionFormScreen({
  selectedTransaction,
}: TransactionFormProps) {
  const theme = useTheme();
  const router = useRouter();
  const [observation, setObservation] = useState('');
  const [transaction, setTransaction] = useState('');
  const [value, setValue] = useState('');
  const [valueNumeric, setValueNumeric] = useState<number | null>(null);
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'error' | 'success' | 'info';
  } | null>(null);
  const [file, setFile] = useState<{
    uri: string;
    name: string;
    size?: number;
    type?: string;
  } | null>(null);

  const options = [
    { label: 'Depósito', value: 'debit' },
    { label: 'Transferência', value: 'credit' },
  ];

  const handleSave = async () => {
    try {
      if (!transaction.trim()) {
        setNotification({
          message: "O campo 'Tipo de Transação' é obrigatório.",
          type: 'error',
        });
        return;
      }

      if (!value.trim() || value === 'R$\u00A00,00') {
        setNotification({
          message: "O campo 'Valor' é obrigatório.",
          type: 'error',
        });
        return;
      }

      const transactionData = {
        transaction,
        value: valueNumeric!,
        observation,
        file,
        categories:
          suggestedCategories.length > 0 ? suggestedCategories : ['Outros'],
      };

      await saveTransaction(transactionData, selectedTransaction?.id);

      setNotification({
        message: 'Transação salva com sucesso!',
        type: 'success',
      });
      handleClear();
      setTimeout(() => {
        router.replace('/(tabs)/transactions');
      }, 500);
    } catch (error) {
      setNotification({ message: 'Erro ao salvar transação.', type: 'error' });
    }
  };

  const handleClear = () => {
    setTransaction('');
    setValue('');
    setObservation('');
    setFile(null);
    setSuggestedCategories([]);
  };

  const handleObservationChange = (text: string) => {
    setObservation(text);
    setSuggestedCategories(suggestCategories(text));
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
      <View
        style={[styles.header, { borderBottomColor: theme.colors.primary }]}
      >
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          {!selectedTransaction ? 'Adicionar Transação' : 'Editar Transação'}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.containerView}>
        <View style={styles.container}>
          <Text variant="bodyLarge" style={styles.subtitle}>
            {!selectedTransaction ? 'Preencha o formulário para adicionar uma nova transação.' : 'Altere os dados da transação selecionada.'}
          </Text>
          <Select
            label="Tipo de Transação"
            options={options}
            value={transaction}
            onChange={setTransaction}
            style={styles.input}
          />

          <TextInput
            mode="outlined"
            label="Valor"
            value={value}
            keyboardType="numeric"
            onChangeText={(val) => {
              const numeric = val.replace(/\D/g, '');
              const numberValue = Number(numeric) / 100;
              if (numberValue > 999999999.99) {
                return;
              }
              setValueNumeric(numberValue);
              const formatted = numberValue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              });
              setValue(formatted);
            }}
            style={styles.input}
          />

          <TextInput
            mode="outlined"
            label="Observação (Opcional)"
            value={observation}
            onChangeText={handleObservationChange}
            style={styles.input}
          />

          {suggestedCategories.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsLabel}>Categorias sugeridas:</Text>
              <View style={styles.chipContainer}>
                <View style={styles.chipsWrapper}>
                  {suggestedCategories.map((cat) => (
                    <Chip
                      key={cat}
                      style={[styles.chip, { backgroundColor: theme.colors.primary }]}
                      textStyle={{ color: theme.colors.onPrimary }}
                    >
                      {cat}
                    </Chip>
                  ))}
                </View>
              </View>
            </View>
          )}

          <UploadField
            file={file}
            fileType="*/*"
            onChange={(file) => setFile(file)}
          />
        </View>
      </ScrollView>
      <View style={[styles.footer, { borderTopColor: theme.colors.primary }]}>
        <Link href="/(tabs)/transactions" asChild>
          <Button mode="outlined" onPress={handleClear}>
            Cancelar
          </Button>
        </Link>
        <Button mode="contained" onPress={handleSave}>
          Salvar
        </Button>
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
  input: {
    width: '100%',
    marginBottom: 16,
  },
  suggestionsContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: 8,
  },
  suggestionsLabel: {
    marginBottom: 8,
    justifyContent: 'flex-start',
  },
  chipContainer: {
    width: '100%',
    marginBottom: 16,
  },
  chipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    marginBottom: 70,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
