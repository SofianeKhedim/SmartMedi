// screens/SignUpScreen.tsx

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

export default function SignUpScreen({ navigation }: { navigation: any }) {
  const { isDarkMode, updateUserProfile } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!isValidEmail(form.email)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide.');
      return;
    }

    setIsLoading(true);
    
    // Simulation d'une inscription
    setTimeout(async () => {
      try {
        // Créer le profil utilisateur
        await updateUserProfile({
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
        });
        
        Alert.alert('Inscription réussie', `Bienvenue dans SmartMedi, ${form.firstName} !`);
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de créer le compte.');
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Inscription</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Créez votre compte</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.input}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Prénom *</Text>
            <TextInput
              autoCapitalize="none"
              onChangeText={firstName => setForm({ ...form, firstName })}
              placeholder="Votre prénom"
              placeholderTextColor={theme.placeholder}
              style={[styles.inputControl, {
                backgroundColor: theme.surface,
                color: theme.text
              }]}
              value={form.firstName}
            />
          </View>

          <View style={styles.input}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Nom *</Text>
            <TextInput
              autoCapitalize="none"
              onChangeText={lastName => setForm({ ...form, lastName })}
              placeholder="Votre nom"
              placeholderTextColor={theme.placeholder}
              style={[styles.inputControl, {
                backgroundColor: theme.surface,
                color: theme.text
              }]}
              value={form.lastName}
            />
          </View>

          <View style={styles.input}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Adresse e-mail *</Text>
            <TextInput
              autoCapitalize="none"
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
            <Text style={[styles.inputLabel, { color: theme.text }]}>Numéro de téléphone</Text>
            <TextInput
              keyboardType="phone-pad"
              onChangeText={phone => setForm({ ...form, phone })}
              placeholder="Votre numéro de téléphone"
              placeholderTextColor={theme.placeholder}
              style={[styles.inputControl, {
                backgroundColor: theme.surface,
                color: theme.text
              }]}
              value={form.phone}
            />
          </View>

          <View style={styles.input}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Mot de passe *</Text>
            <TextInput
              secureTextEntry={true}
              onChangeText={password => setForm({ ...form, password })}
              placeholder="********"
              placeholderTextColor={theme.placeholder}
              style={[styles.inputControl, {
                backgroundColor: theme.surface,
                color: theme.text
              }]}
              value={form.password}
            />
          </View>

          <View style={styles.formAction}>
            <TouchableOpacity onPress={handleSignUp} disabled={isLoading}>
              <View style={[styles.btn, { backgroundColor: theme.primary, borderColor: theme.primary }]}>
                {isLoading ? (
                  <ActivityIndicator color={theme.background} />
                ) : (
                  <Text style={[styles.btnText, { color: theme.background }]}>S'inscrire</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.formFooter, { color: theme.text }]}>
              Vous avez déjà un compte ?{' '}
              <Text style={{ textDecorationLine: 'underline', color: theme.primary }}>Connectez-vous</Text>
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
