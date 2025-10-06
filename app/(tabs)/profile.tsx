import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, TextInput } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Button from '@/designSystem/Button';
import Notification from '@/designSystem/Notification';
import { auth } from '@/firebase/firebaseConfig';
import { signOut, onAuthStateChanged, updatePassword } from 'firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'error' | 'success' | 'info';
  } | null>(null);

  const [showPasswordCard, setShowPasswordCard] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setEmail(user?.email ?? null);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setNotification({ message: 'Erro ao encerrar sessão.', type: 'error' });
    }
  };

  const handleCancel = () => {
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordCard(false);
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setNotification({
        message: 'Preencha todos os campos de senha.',
        type: 'error',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setNotification({ message: 'As senhas não coincidem.', type: 'error' });
      return;
    }
    if (!auth.currentUser) {
      setNotification({ message: 'Usuário não autenticado.', type: 'error' });
      return;
    }

    try {
      setUpdatingPassword(true);
      await updatePassword(auth.currentUser, newPassword);
      setNotification({
        message: 'Senha atualizada com sucesso!',
        type: 'success',
      });
      handleCancel();
    } catch (err: any) {
      let msg = 'Não foi possível atualizar a senha.';
      if (err.code === 'auth/weak-password') {
        msg = 'A senha deve ter no mínimo 6 caracteres.';
      }
      if (err.code === 'auth/requires-recent-login') {
        msg = 'Reautentique-se e tente novamente.';
      }
      setNotification({ message: msg, type: 'error' });
    } finally {
      setUpdatingPassword(false);
    }
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
          Perfil do Usuário
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.containerView}>
        <View style={styles.container}>
          <Text
            variant="bodyLarge"
            style={[styles.subtitle, { fontWeight: '700' }]}
          >
            Usuário logado:
          </Text>
          <Text
            variant="bodyLarge"
            style={[styles.subtitle, { marginLeft: 5 }]}
          >
            {email ?? 'Usuário não autenticado'}
          </Text>
        </View>

        {!showPasswordCard && (
          <View style={styles.buttonGroup}>
            <Button
              mode="contained"
              onPress={() => setShowPasswordCard(true)}
              icon={() => (
                <MaterialIcons name="vpn-key" size={20} color="#fff" />
              )}
            >
              Trocar Senha
            </Button>

            <Button
              mode="contained"
              onPress={handleSignOut}
              icon={() => (
                <MaterialIcons name="logout" size={20} color="#fff" />
              )}
            >
              Sair
            </Button>
          </View>
        )}

        {showPasswordCard && (
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                shadowColor: theme.colors.shadow,
              },
            ]}
          >
            <Text
              variant="bodyLarge"
              style={[
                styles.subtitle,
                { alignSelf: 'flex-start', marginBottom: 15 },
              ]}
            >
              Digite a nova senha abaixo:
            </Text>
            <TextInput
              placeholder="Nova senha"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.input}
            />
            <TextInput
              placeholder="Confirmar nova senha"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
            />

            <View style={styles.cardButtons}>
              <Button mode="outlined" onPress={handleCancel}>
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleUpdatePassword}
                loading={updatingPassword}
              >
                Atualizar
              </Button>
            </View>
          </View>
        )}
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
    justifyContent: 'center',
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
    marginBottom: 5,
  },
  buttonGroup: {
    justifyContent: 'center',
    gap: 16,
  },
  passwordSection: { width: '100%', marginTop: 16, alignItems: 'center' },
  card: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  input: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#687EDB',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  cardButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
});
