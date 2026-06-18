import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // SDK 53+ replaced shouldShowAlert with shouldShowBanner/shouldShowList
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  async requestPermissions() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'SmartMedi',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#266EF1',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  async scheduleMedicationReminder(medicationName: string, time: Date, recurring: boolean = true) {
    const trigger: Notifications.NotificationTriggerInput = recurring
      ? {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: time.getHours(),
          minute: time.getMinutes(),
        }
      : {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: time,
        };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rappel Médicament 💊',
        body: `Il est temps de prendre votre ${medicationName}`,
        sound: 'default',
      },
      trigger,
    });
  }

  async scheduleMeasurementReminder(time: Date) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Mesure de Tension 🩺',
        body: 'N\'oubliez pas de mesurer votre tension artérielle',
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.getHours(),
        minute: time.getMinutes(),
      },
    });
  }

  async sendHighPressureAlert(systolic: number, diastolic: number) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Tension Élevée Détectée',
        body: `Tension: ${systolic}/${diastolic} mmHg. Consultez votre médecin.`,
        sound: 'default',
        priority: 'high',
      },
      trigger: null,
    });
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export default new NotificationService();