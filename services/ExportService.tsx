import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
// SDK 54 moved the classic file API (documentDirectory, moveAsync) to /legacy.
import * as FileSystem from 'expo-file-system/legacy';
import { BloodPressureMeasurement, UserProfile } from '../context/AppContext';

class ExportService {
  async exportToPDF(measurements: BloodPressureMeasurement[], userProfile: UserProfile | null) {
    const html = this.generateHTMLReport(measurements, userProfile);
    
    try {
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      const pdfName = `SmartMedi_Rapport_${new Date().toISOString().split('T')[0]}.pdf`;
      const pdfUri = `${FileSystem.documentDirectory}${pdfName}`;
      
      await FileSystem.moveAsync({
        from: uri,
        to: pdfUri,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Partager le rapport médical',
        });
      }

      return pdfUri;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  private generateHTMLReport(measurements: BloodPressureMeasurement[], userProfile: UserProfile | null): string {
    // Copy before sorting — Array.sort mutates in place, and `measurements` is React state.
    const sortedMeasurements = [...measurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const averageSystolic = measurements.length > 0 
      ? Math.round(measurements.reduce((sum, m) => sum + m.systolic, 0) / measurements.length)
      : 0;
    
    const averageDiastolic = measurements.length > 0
      ? Math.round(measurements.reduce((sum, m) => sum + m.diastolic, 0) / measurements.length)
      : 0;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Rapport Médical SmartMedi</title>
          <style>
            body {
              font-family: 'Helvetica', 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #266EF1;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              color: #266EF1;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .patient-info {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .summary {
              background: #e8f4f8;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background: #266EF1;
              color: white;
            }
            tr:nth-child(even) {
              background: #f9f9f9;
            }
            .high-pressure {
              background-color: #ffebee !important;
              color: #c62828;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">📱 SmartMedi</div>
            <h2>Rapport de Suivi Tension Artérielle</h2>
            <p>Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>

          ${userProfile ? `
            <div class="patient-info">
              <h3>👤 Informations Patient</h3>
              <p><strong>Nom:</strong> ${userProfile.name}</p>
              <p><strong>Email:</strong> ${userProfile.email}</p>
              ${userProfile.age ? `<p><strong>Âge:</strong> ${userProfile.age} ans</p>` : ''}
            </div>
          ` : ''}

          <div class="summary">
            <h3>📊 Résumé des Mesures</h3>
            <p><strong>Nombre total de mesures:</strong> ${measurements.length}</p>
            <p><strong>Période:</strong> ${measurements.length > 0 ? `Du ${new Date(sortedMeasurements[sortedMeasurements.length - 1].date).toLocaleDateString('fr-FR')} au ${new Date(sortedMeasurements[0].date).toLocaleDateString('fr-FR')}` : 'Aucune donnée'}</p>
            <p><strong>Tension moyenne:</strong> ${averageSystolic}/${averageDiastolic} mmHg</p>
          </div>

          <h3>🩺 Historique Détaillé des Mesures</h3>
          ${measurements.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Systolique</th>
                  <th>Diastolique</th>
                  <th>Évaluation</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${sortedMeasurements.map(measurement => {
                  const date = new Date(measurement.date);
                  const isHigh = measurement.systolic >= 140 || measurement.diastolic >= 90;
                  const evaluation = this.evaluatePressure(measurement.systolic, measurement.diastolic);
                  
                  return `
                    <tr ${isHigh ? 'class="high-pressure"' : ''}>
                      <td>${date.toLocaleDateString('fr-FR')}</td>
                      <td>${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>${measurement.systolic} mmHg</td>
                      <td>${measurement.diastolic} mmHg</td>
                      <td>${evaluation}</td>
                      <td>${measurement.notes || '-'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          ` : '<p>Aucune mesure enregistrée.</p>'}

          <div class="footer">
            <p>Ce rapport a été généré par SmartMedi v2.0</p>
            <p>⚠️ Consultez votre médecin pour l'interprétation de ces données</p>
          </div>
        </body>
      </html>
    `;
  }

  private evaluatePressure(systolic: number, diastolic: number): string {
    if (systolic < 120 && diastolic < 80) return '✅ Normale';
    if (systolic < 130 && diastolic < 80) return '⚠️ Élevée';
    if (systolic < 140 && diastolic < 90) return '⚠️ Hypertension stade 1';
    if (systolic >= 180 || diastolic >= 120) return '🚨 Crise hypertensive';
    return '⚠️ Hypertension stade 2';
  }
}

export default new ExportService();