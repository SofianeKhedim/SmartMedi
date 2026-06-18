import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { useApp } from '../context/AppContext';
import { lightTheme, darkTheme } from '../constants/Colors';
import ExportService from '../services/ExportService';

export default function HistoriqueScreen() {
  const { isDarkMode, measurements, userProfile } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPressureStatus = (systolic, diastolic) => {
    if (systolic < 120 && diastolic < 80) {
      return { status: 'Normale', color: theme.success, icon: 'check-circle' };
    } else if (systolic >= 180 || diastolic >= 120) {
      return { status: 'Critique', color: theme.error, icon: 'alert-triangle' };
    } else if (systolic >= 140 || diastolic >= 90) {
      return { status: 'Élevée', color: theme.error, icon: 'alert-circle' };
    } else {
      return { status: 'Attention', color: theme.warning, icon: 'info' };
    }
  };

  const handleExport = async () => {
    if (measurements.length === 0) {
      Alert.alert('Aucune donnée', 'Vous n\'avez pas encore de mesures à exporter.');
      return;
    }

    setIsExporting(true);
    try {
      await ExportService.exportToPDF(measurements, userProfile);
      Alert.alert('Export réussi', 'Votre rapport a été généré et peut être partagé.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de générer le rapport.');
    } finally {
      setIsExporting(false);
    }
  };

  const getAverages = () => {
    if (measurements.length === 0) return { systolic: 0, diastolic: 0 };
    
    const totalSystolic = measurements.reduce((sum, m) => sum + m.systolic, 0);
    const totalDiastolic = measurements.reduce((sum, m) => sum + m.diastolic, 0);
    
    return {
      systolic: Math.round(totalSystolic / measurements.length),
      diastolic: Math.round(totalDiastolic / measurements.length),
    };
  };

  const averages = getAverages();
  // Copy before sorting — Array.sort mutates in place, and `measurements` is React state.
  const sortedMeasurements = [...measurements].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header avec stats et bouton export */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.text }]}>Historique des Mesures</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {measurements.length} mesure{measurements.length > 1 ? 's' : ''} enregistrée{measurements.length > 1 ? 's' : ''}
          </Text>
        </View>
        
        <TouchableOpacity 
          onPress={handleExport} 
          style={[styles.exportButton, { backgroundColor: theme.primary }]}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator color={theme.background} size="small" />
          ) : (
            <FeatherIcon name="download" size={20} color={theme.background} />
          )}
        </TouchableOpacity>
      </View>

      {/* Moyennes */}
      {measurements.length > 0 && (
        <View style={[styles.averageCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.averageTitle, { color: theme.text }]}>Moyennes</Text>
          <Text style={[styles.averageValue, { color: theme.primary }]}>
            {averages.systolic}/{averages.diastolic} mmHg
          </Text>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {measurements.length === 0 ? (
          <View style={styles.emptyState}>
            <FeatherIcon name="activity" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucune mesure</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Commencez par ajouter votre première mesure de tension artérielle
            </Text>
          </View>
        ) : (
          sortedMeasurements.map((measurement, index) => {
            const pressureStatus = getPressureStatus(measurement.systolic, measurement.diastolic);
            
            return (
              <View 
                key={measurement.id || index} 
                style={[styles.measurementCard, { 
                  backgroundColor: theme.card,
                  borderColor: theme.border 
                }]}
              >
                <View style={styles.measurementHeader}>
                  <View style={styles.dateTimeContainer}>
                    <Text style={[styles.date, { color: theme.text }]}>
                      {formatDate(measurement.date)}
                    </Text>
                    <Text style={[styles.time, { color: theme.textSecondary }]}>
                      {formatTime(measurement.date)}
                    </Text>
                  </View>
                  
                  <View style={[styles.statusBadge, { backgroundColor: pressureStatus.color + '20' }]}>
                    <FeatherIcon 
                      name={pressureStatus.icon} 
                      size={14} 
                      color={pressureStatus.color} 
                    />
                    <Text style={[styles.statusText, { color: pressureStatus.color }]}>
                      {pressureStatus.status}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.measurementContent}>
                  <View style={styles.pressureValues}>
                    <Text style={[styles.pressureText, { color: theme.text }]}>
                      <Text style={styles.systolicValue}>{measurement.systolic}</Text>
                      <Text style={[styles.separator, { color: theme.textSecondary }]}> / </Text>
                      <Text style={styles.diastolicValue}>{measurement.diastolic}</Text>
                      <Text style={[styles.unit, { color: theme.textSecondary }]}> mmHg</Text>
                    </Text>
                    
                    {measurement.pulse && (
                      <Text style={[styles.pulseText, { color: theme.textSecondary }]}>
                        ❤️ {measurement.pulse} bpm
                      </Text>
                    )}
                  </View>
                  
                  {measurement.notes && (
                    <Text style={[styles.notes, { color: theme.textSecondary }]}>
                      💭 {measurement.notes}
                    </Text>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  exportButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  averageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  averageTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  averageValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 60, // Espace pour la barre de navigation
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  measurementCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  measurementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateTimeContainer: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  measurementContent: {
    gap: 8,
  },
  pressureValues: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressureText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  systolicValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  separator: {
    fontSize: 20,
  },
  diastolicValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 14,
    fontWeight: '500',
  },
  pulseText: {
    fontSize: 14,
  },
  notes: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
