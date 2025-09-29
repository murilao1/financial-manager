import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { registerUser } from '../../firebase/registerFunction';

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    try {
      await registerUser(email, password, firstName, lastName);
      alert('Usuário cadastrado com sucesso!');
      router.replace('/login');
    } catch (err: any) {
      setError('Erro ao cadastrar usuário');
      console.log(err);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.formContainer}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Cadastro
        </Text>

        <View style={styles.inputWrapper}>
          <MaterialIcons
            name="person"
            size={20}
            color="#687EDB"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={firstName}
            onChangeText={setFirstName}
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.inputWrapper}>
          <MaterialIcons
            name="person-outline"
            size={20}
            color="#687EDB"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Sobrenome"
            value={lastName}
            onChangeText={setLastName}
            placeholderTextColor="#888"
          />
        </View>

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

        <Pressable style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </Pressable>

        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text style={styles.link}>Já tem conta? Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
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
    marginTop: 20,
    color: '#0d30cc',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
