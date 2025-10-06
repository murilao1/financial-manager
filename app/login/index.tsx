import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import { auth } from '@/firebase/firebaseConfig';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import Notification from '@/designSystem/Notification';
import logoLottie from '@/assets/lottie/logo.json';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/');
    } catch {
      setError('Usuário ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setNotification({
        message: 'Informe seu e-mail para redefinir a senha.',
        type: 'error',
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setNotification({
        message: 'Enviamos um link para o seu e-mail para redefinir sua senha.',
        type: 'success',
      });
    } catch (err) {
      console.error(err);
      setNotification({
        message: 'Não foi possível enviar o e-mail de redefinição.',
        type: 'error',
      });
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onHide={() => setNotification(null)}
        />
      )}

      <LottieView source={logoLottie} autoPlay loop style={styles.heroLogo} />

      <View style={styles.formContainer}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Login
        </Text>

        <View style={styles.inputWrapper}>
          <MaterialIcons
            name="email"
            size={20}
            color="#687EDB"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.inputWrapper}>
          <MaterialIcons
            name="lock"
            size={20}
            color="#687EDB"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#888"
          />
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={20} color="red" />
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          style={[styles.button, loading && { opacity: 0.8 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </Pressable>

        <TouchableOpacity onPress={() => router.push('/login/register')}>
          <Text style={[styles.link, { marginTop: 12 }]}>
            Não tem conta? Cadastre-se
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={[styles.link, { marginTop: 10 }]}>
            Esqueci minha senha
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  heroLogo: {
    width: 150,
    height: 150,
    marginTop: 60,
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#f3f6fc',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    fontSize: 28,
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#687EDB',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginLeft: 5,
    fontSize: 14,
  },
  button: {
    width: '100%',
    backgroundColor: '#687EDB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#687EDB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  link: {
    color: '#0d30cc',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
