import React, { useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  Image,
  Alert,
  Switch,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useApp } from '../context/AppContext';
import { lightTheme, darkTheme } from '../constants/Colors';
import NotificationService from '../services/NotificationService';

export default function UserProfile() {
  const { isDarkMode, toggleTheme, userProfile, updateUserProfile, measurements } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: userProfile?.name || '',
    age: userProfile?.age?.toString() || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [reminderSettings, setReminderSettings] = useState({
    measurementReminder: false,
    medicationReminder: false,
  });

  const getLatestVitals = () => {
    if (measurements.length === 0) {
      return {
        systolic: 'N/A',
        diastolic: 'N/A',
        pulse: 'N/A',
        lastMeasure: 'Aucune mesure'
      };
    }
    
    const latest = measurements[0];
    return {
      systolic: `${latest.systolic} mmHg`,
      diastolic: `${latest.diastolic} mmHg`, 
      pulse: latest.pulse ? `${latest.pulse} bpm` : 'N/A',
      lastMeasure: new Date(latest.date).toLocaleDateString('fr-FR')
    };
  };

  const vitals = getLatestVitals();
  
  const vitalSigns = [
    { label: 'Pression Systolique', value: vitals.systolic, icon: 'arrow-up' },
    { label: 'Pression Diastolique', value: vitals.diastolic, icon: 'arrow-down' },
    { label: 'Fréquence Cardiaque', value: vitals.pulse, icon: 'heart' },
    { label: 'Dernière Mesure', value: vitals.lastMeasure, icon: 'clock' },
  ];
  
  const recommendations = [
    '💧 Restez hydraté - 1,5L d\'eau par jour',
    '🏃‍♂️ Exercice régulier - 30min, 5 fois/semaine',
    '🥗 Régime pauvre en sel - moins de 5g/jour',
    '🚫 Évitez tabac et alcool excessif',
    '😴 Sommeil de qualité - 7-8h par nuit',
    '🧘‍♂️ Gérez le stress - relaxation, méditation',
  ];

  const handleEditProfile = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({
        ...userProfile!,
        name: editForm.name,
        age: editForm.age ? parseInt(editForm.age) : undefined,
      });
      setShowEditModal(false);
      Alert.alert('Succès', 'Profil mis à jour avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnecter', 
          style: 'destructive',
          onPress: async () => {
            await updateUserProfile(null);
          }
        },
      ]
    );
  };

  const toggleMeasurementReminder = async (value: boolean) => {
    if (value) {
      Alert.alert(
        'Rappel de mesure',
        'Voulez-vous être rappelé chaque jour à 9h00 pour prendre votre tension ?',
        [
          { text: 'Annuler' },
          { 
            text: 'Activer',
            onPress: async () => {
              const reminderTime = new Date();
              reminderTime.setHours(9, 0, 0, 0);
              await NotificationService.scheduleMeasurementReminder(reminderTime);
              setReminderSettings(prev => ({ ...prev, measurementReminder: true }));
            }
          }
        ]
      );
    } else {
      await NotificationService.cancelAllNotifications();
      setReminderSettings(prev => ({ ...prev, measurementReminder: false }));
    }
  };
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Mon Profil</Text>
        <TouchableOpacity onPress={() => setShowEditModal(true)} style={styles.editButton}>
          <FeatherIcon name="edit" size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Profil utilisateur */}
          <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.profileHeader}>
              <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
                <Text style={[styles.avatarText, { color: theme.primary }]}>
                  {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: theme.text }]}>
                  {userProfile?.name || 'Utilisateur'}
                </Text>
                <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
                  {userProfile?.email || 'email@exemple.com'}
                </Text>
                {userProfile?.age && (
                  <Text style={[styles.profileAge, { color: theme.textSecondary }]}>
                    {userProfile.age} ans
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Paramètres */}
          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>⚙️ Paramètres</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <FeatherIcon name={isDarkMode ? 'moon' : 'sun'} size={20} color={theme.primary} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Mode sombre</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                thumbColor={theme.primary}
                trackColor={{ false: theme.border, true: theme.primary + '40' }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <FeatherIcon name="bell" size={20} color={theme.primary} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Rappel mesures</Text>
              </View>
              <Switch
                value={reminderSettings.measurementReminder}
                onValueChange={toggleMeasurementReminder}
                thumbColor={theme.primary}
                trackColor={{ false: theme.border, true: theme.primary + '40' }}
              />
            </View>
          </View>

          {/* Signes vitaux */}
          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>🩸 Dernières Mesures</Text>
            
            <View style={styles.vitalsGrid}>
              {vitalSigns.map(({ label, value, icon }, index) => (
                <View key={index} style={[styles.vitalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <FeatherIcon name={icon} size={16} color={theme.primary} />
                  <Text style={[styles.vitalLabel, { color: theme.textSecondary }]}>{label}</Text>
                  <Text style={[styles.vitalValue, { color: theme.text }]}>{value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Recommandations */}
          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>💡 Recommandations</Text>
            
            {recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={[styles.recommendationText, { color: theme.textSecondary }]}>{rec}</Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity 
              onPress={handleLogout}
              style={[styles.logoutButton, { backgroundColor: theme.error + '20', borderColor: theme.error }]}
            >
              <FeatherIcon name="log-out" size={20} color={theme.error} />
              <Text style={[styles.logoutText, { color: theme.error }]}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal d'édition du profil */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowEditModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Modifier le profil</Text>
              
              <View style={styles.modalForm}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Nom</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: theme.surface,
                      color: theme.text,
                      borderColor: theme.border 
                    }]}
                    value={editForm.name}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                    placeholder="Votre nom"
                    placeholderTextColor={theme.placeholder}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Âge (optionnel)</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: theme.surface,
                      color: theme.text,
                      borderColor: theme.border 
                    }]}
                    value={editForm.age}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, age: text }))}
                    placeholder="Votre âge"
                    placeholderTextColor={theme.placeholder}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  onPress={() => setShowEditModal(false)}
                  style={[styles.modalButton, { backgroundColor: theme.surface }]}
                >
                  <Text style={[styles.modalButtonText, { color: theme.text }]}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={handleEditProfile}
                  style={[styles.modalButton, { backgroundColor: theme.primary }]}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color={theme.background} size="small" />
                  ) : (
                    <Text style={[styles.modalButtonText, { color: theme.background }]}>Sauvegarder</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    padding: 20,
  },
  profileCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  profileAge: {
    fontSize: 14,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vitalCard: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  vitalLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  vitalValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  recommendationItem: {
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalForm: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
