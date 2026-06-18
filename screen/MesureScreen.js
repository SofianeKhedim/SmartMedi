import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { lightTheme, darkTheme } from '../constants/Colors';
import NotificationService from '../services/NotificationService';

export default function MesureScreen() {
  const { isDarkMode, addMeasurement } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const evaluatePressure = (systolicValue, diastolicValue) => {
    if (systolicValue < 120 && diastolicValue < 80) {
      return { level: 'normal', message: 'Votre tension est normale. Continuez vos bonnes habitudes !' };
    } else if (systolicValue >= 180 || diastolicValue >= 120) {
      return { level: 'emergency', message: '🚨 URGENCE ! Tension critique. Consultez immédiatement un médecin ou appelez le 15.' };
    } else if ((systolicValue >= 140 && systolicValue < 180) || (diastolicValue >= 90 && diastolicValue < 120)) {
      return { level: 'high', message: '⚠️ Hypertension détectée. Consultez votre médecin rapidement.' };
    } else if ((systolicValue >= 130 && systolicValue < 140) || (diastolicValue >= 80 && diastolicValue < 90)) {
      return { level: 'elevated', message: '⚠️ Tension élevée. Surveillez régulièrement et adoptez un mode de vie sain.' };
    } else {
      return { level: 'prehigh', message: '⚠️ Tension légèrement élevée. Surveillez régulièrement.' };
    }
  };

  const handleMeasure = async () => {
    const systolicValue = parseInt(systolic);
    const diastolicValue = parseInt(diastolic);
    const pulseValue = pulse ? parseInt(pulse) : undefined;

    if (isNaN(systolicValue) || isNaN(diastolicValue)) {
      Alert.alert("Erreur", "Veuillez entrer des valeurs valides pour la tension.");
      return;
    }

    if (systolicValue < 70 || systolicValue > 250 || diastolicValue < 40 || diastolicValue > 150) {
      Alert.alert("Valeurs suspectes", "Les valeurs saisies semblent anormales. Vérifiez votre saisie.");
      return;
    }

    setIsLoading(true);

    try {
      // Enregistrer la mesure
      const measurementData = {
        date: new Date().toISOString(),
        systolic: systolicValue,
        diastolic: diastolicValue,
        pulse: pulseValue,
        notes: notes.trim() || undefined,
      };

      await addMeasurement(measurementData);

      // Évaluer la tension
      const evaluation = evaluatePressure(systolicValue, diastolicValue);
      
      // Envoyer notification si tension élevée
      if (evaluation.level === 'emergency' || evaluation.level === 'high') {
        await NotificationService.sendHighPressureAlert(systolicValue, diastolicValue);
      }

      // Afficher le résultat
      Alert.alert(
        "Mesure enregistrée", 
        evaluation.message,
        [
          { 
            text: "OK", 
            onPress: () => {
              // Reset du formulaire
              setSystolic('');
              setDiastolic('');
              setPulse('');
              setNotes('');
            }
          }
        ],
        { cancelable: false }
      );

      // Questions supplémentaires pour tension élevée
      if (evaluation.level === 'high' || evaluation.level === 'emergency') {
        setTimeout(() => {
          Alert.alert(
            "Symptômes",
            "Ressentez-vous des maux de tête, troubles visuels, douleurs thoraciques ou essoufflement ?",
            [
              { text: "Non" },
              { 
                text: "Oui", 
                onPress: () => Alert.alert(
                  "Action recommandée", 
                  "Avec ces symptômes et votre tension élevée, consultez immédiatement un médecin.",
                  [{ text: "Compris", style: "destructive" }]
                )
              }
            ]
          );
        }, 1000);
      }

    } catch (error) {
      Alert.alert("Erreur", "Impossible d'enregistrer la mesure. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: theme.text }]}>Mesurer la tension artérielle</Text>

      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Prenez votre mesure dans un environnement calme, après 5 minutes de repos
      </Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Tension Systolique (mmHg)</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.surface, 
              color: theme.text,
              borderColor: theme.border 
            }]}
            placeholder="Ex: 120"
            placeholderTextColor={theme.placeholder}
            keyboardType="numeric"
            value={systolic}
            onChangeText={setSystolic}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Tension Diastolique (mmHg)</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.surface, 
              color: theme.text,
              borderColor: theme.border 
            }]}
            placeholder="Ex: 80"
            placeholderTextColor={theme.placeholder}
            keyboardType="numeric"
            value={diastolic}
            onChangeText={setDiastolic}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Fréquence Cardiaque (bpm) - Optionnel</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.surface, 
              color: theme.text,
              borderColor: theme.border 
            }]}
            placeholder="Ex: 75"
            placeholderTextColor={theme.placeholder}
            keyboardType="numeric"
            value={pulse}
            onChangeText={setPulse}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Notes - Optionnel</Text>
          <TextInput
            style={[styles.textArea, { 
              backgroundColor: theme.surface, 
              color: theme.text,
              borderColor: theme.border 
            }]}
            placeholder="Commentaires, contexte, ressenti..."
            placeholderTextColor={theme.placeholder}
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, { 
            backgroundColor: theme.primary,
            opacity: isLoading ? 0.7 : 1 
          }]} 
          onPress={handleMeasure}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.background} size="small" />
          ) : (
            <Text style={[styles.buttonText, { color: theme.background }]}>
              📊 Enregistrer la mesure
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120, // Espace pour la barre de navigation flottante
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  textArea: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    fontWeight: '500',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
