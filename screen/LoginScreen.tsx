// screens/LoginScreen.tsx

import React, { useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { lightTheme, darkTheme } from '../constants/Colors';

export default function LoginScreen({ navigation }: { navigation: any }) {
  const { isDarkMode, updateUserProfile } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Erreur', 'Veuillez entrer un email et un mot de passe.');
      return;
    }

    setIsLoading(true);
    
    // Simulation d'une authentification
    setTimeout(async () => {
      try {
        // Créer le profil utilisateur
        await updateUserProfile({
          name: form.email.split('@')[0],
          email: form.email,
        });
        
        Alert.alert('Connexion réussie', `Bienvenue dans SmartMedi !`);
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de se connecter.');
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Bienvenue !</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Connectez-vous à votre compte</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.input}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Adresse e-mail</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={email => setForm({ ...form, email })}
              placeholder="john@example.com"
              placeholderTextColor={theme.placeholder}
              style={[styles.inputControl, {
                backgroundColor: theme.surface,
                color: theme.text
              }]}
              value={form.email}
            />
          </View>

          <View style={styles.input}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Mot de passe</Text>
            <TextInput
              autoCorrect={false}
              onChangeText={password => setForm({ ...form, password })}
              placeholder="********"
              placeholderTextColor={theme.placeholder}
              style={[styles.inputControl, {
                backgroundColor: theme.surface,
                color: theme.text
              }]}
              secureTextEntry={true}
              value={form.password}
            />
          </View>

          <View style={styles.formAction}>
            <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
              <View style={[styles.btn, { backgroundColor: theme.primary, borderColor: theme.primary }]}>
                {isLoading ? (
                  <ActivityIndicator color={theme.background} />
                ) : (
                  <Text style={[styles.btnText, { color: theme.background }]}>Se connecter</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp')}>
            <Text style={[styles.formFooter, { color: theme.text }]}>
              Vous n'avez pas de compte ?{' '}
              <Text style={{ textDecorationLine: 'underline', color: theme.primary }}>Inscrivez-vous</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  header: {
    marginVertical: 36,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  /** Form */
  form: {
    marginBottom: 24,
  },
  formAction: {
    marginVertical: 24,
  },
  formFooter: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  /** Input */
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputControl: {
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  /** Button */
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  btnText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
  },
});
