import React, { useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useApp } from '../context/AppContext';
import { lightTheme, darkTheme } from '../constants/Colors';
import ExportService from '../services/ExportService';

export default function HomeScreen() {
  const { isDarkMode, toggleTheme, measurements, userProfile } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
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

  const getChartData = () => {
    const recentMeasurements = measurements.slice(0, 7).reverse();
    return {
      labels: recentMeasurements.map(m => {
        const date = new Date(m.date);
        return date.toLocaleDateString('fr-FR', { weekday: 'short' });
      }),
      datasets: [{ data: recentMeasurements.map(m => m.systolic) }]
    };
  };
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>

        {/* Header avec boutons d'action */}
        <View style={styles.actionWrapper}>
          <View style={styles.leftActions}>
            <TouchableOpacity onPress={handleExportData} disabled={isExporting}>
              <View style={[styles.action, { backgroundColor: theme.surface }]}>
                <FeatherIcon
                  color={theme.primary}
                  name={isExporting ? 'loader' : 'download'}
                  size={22}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.rightActions}>
            <View style={styles.themeToggle}>
              <FeatherIcon name="sun" size={18} color={theme.textSecondary} />
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                thumbColor={theme.primary}
                trackColor={{ false: theme.border, true: theme.primary }}
                style={{ marginHorizontal: 8 }}
              />
              <FeatherIcon name="moon" size={18} color={theme.textSecondary} />
            </View>
          </View>
        </View>

        {/* Logo de l'application */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo_smart.png')} 
            style={styles.logo}
          />
        </View>

        {/* Graphique de la tension artérielle */}
        <View style={[styles.graphContainer, {
          backgroundColor: theme.surface,
          borderColor: theme.border
        }]}>
          <Text style={[styles.graphTitle, { color: theme.accent }]}>
            Historique de la Tension Artérielle
          </Text>
          {measurements.length > 0 ? (
            <LineChart
              data={getChartData()}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={{
                backgroundColor: theme.surface,
                backgroundGradientFrom: theme.surface,
                backgroundGradientTo: theme.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => {
                  const hex = theme.primary.replace('#', '');
                  const r = parseInt(hex.substr(0, 2), 16);
                  const g = parseInt(hex.substr(2, 2), 16);
                  const b = parseInt(hex.substr(4, 2), 16);
                  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                },
                labelColor: (opacity = 1) => {
                  const hex = theme.text.replace('#', '');
                  const r = parseInt(hex.substr(0, 2), 16);
                  const g = parseInt(hex.substr(2, 2), 16);
                  const b = parseInt(hex.substr(4, 2), 16);
                  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                },
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: theme.primary,
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          ) : (
            <View style={styles.emptyChart}>
              <FeatherIcon name="bar-chart-2" size={40} color={theme.textSecondary} />
              <Text style={[styles.emptyChartText, { color: theme.textSecondary }]}>
                Aucune mesure pour le moment.{'\n'}Ajoutez votre première mesure dans l'onglet « Mesurer ».
              </Text>
            </View>
          )}
        </View>

        {/* Statistiques rapides */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Dernière mesure</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {measurements.length > 0 
                ? `${measurements[0].systolic}/${measurements[0].diastolic}` 
                : 'Aucune'}
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total mesures</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{measurements.length}</Text>
          </View>
        </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60, // Espace pour la barre de navigation flottante
  },
  container: {
    padding: 24,
    minHeight: '100%',
  },
  /** Actions */
  action: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: -8,
    marginBottom: 16,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  /** Logo */
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  /** Search */
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    marginRight: 12,
  },
  input: {
    height: 44,
    paddingLeft: 44,
    paddingRight: 24,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  inputIcon: {
    position: 'absolute',
    width: 44,
    height: 44,
    top: 0,
    left: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  btnText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  /** Graphique */
  graphContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyChart: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyChartText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  /** Stats */
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
