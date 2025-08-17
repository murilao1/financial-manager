import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export default function TransactionFormScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Adicionar/Editar Transação</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
