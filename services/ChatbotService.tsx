import AsyncStorage from '@react-native-async-storage/async-storage';
import { GEMINI_API_KEY, GEMINI_MODEL } from '../constants/config';

const API_KEY_STORAGE = 'geminiApiKey';

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

const SYSTEM_PROMPT = `Tu es un assistant médical spécialisé dans l'hypertension artérielle. Tu dois:
- Donner des conseils sur la gestion de l'hypertension
- Expliquer les risques et les préventions
- Recommander de consulter un médecin quand nécessaire
- Répondre uniquement sur les sujets médicaux liés à l'hypertension
- Être bienveillant et professionnel
- Répondre en français
- TOUJOURS rappeler que tes conseils ne remplacent pas une consultation médicale
- Limiter tes réponses à 200 mots maximum pour rester concis`;

class ChatbotService {
  // A key entered in-app (persisted) takes precedence over the build-time env key.
  private runtimeKey: string | null = null;
  private loaded = false;

  /** Load any user-provided key from storage. Safe to call repeatedly. */
  async init(): Promise<void> {
    if (this.loaded) return;
    try {
      this.runtimeKey = await AsyncStorage.getItem(API_KEY_STORAGE);
    } catch {
      this.runtimeKey = null;
    }
    this.loaded = true;
  }

  private getActiveKey(): string {
    return (this.runtimeKey && this.runtimeKey.trim()) || GEMINI_API_KEY || '';
  }

  /** True when an AI key is configured (env or runtime). */
  hasApiKey(): boolean {
    return this.getActiveKey().length > 0;
  }

  async setApiKey(key: string): Promise<void> {
    this.runtimeKey = key.trim();
    this.loaded = true;
    try {
      await AsyncStorage.setItem(API_KEY_STORAGE, this.runtimeKey);
    } catch {
      // non-fatal: key still active for this session
    }
  }

  async clearApiKey(): Promise<void> {
    this.runtimeKey = null;
    try {
      await AsyncStorage.removeItem(API_KEY_STORAGE);
    } catch {
      // ignore
    }
  }

  /**
   * Send a message to Gemini. `history` is the prior conversation (oldest
   * first) so the model keeps context. Falls back to local canned answers
   * when no key is set or the API call fails.
   */
  async sendMessage(message: string, history: ChatTurn[] = []): Promise<string> {
    await this.init();
    const apiKey = this.getActiveKey();
    if (!apiKey) {
      return this.getLocalResponse(message);
    }

    try {
      const contents = [
        ...history.map((turn) => ({
          role: turn.role,
          parts: [{ text: turn.text }],
        })),
        { role: 'user', parts: [{ text: message }] },
      ];

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
            // gemini-2.5-* are "thinking" models; disable thinking so the
            // token budget produces visible text instead of internal reasoning.
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as any));
        throw new Error(
          `API ${response.status}: ${errorData?.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text.trim();
      }
      throw new Error('Réponse vide de l\'API');
    } catch (error) {
      console.warn('Gemini API error, using local response:', error);
      return this.getLocalResponse(message);
    }
  }

  private getLocalResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    const responses: { [key: string]: string[] } = {
      tension: [
        'La tension artérielle normale est inférieure à 120/80 mmHg. Mesurez-la régulièrement et consultez votre médecin si elle reste élevée.',
        'Pour une mesure précise, restez assis calmement 5 minutes avant la prise. Évitez café et tabac 30 minutes avant.',
        'Une tension élevée peut être silencieuse. C\'est pourquoi un suivi régulier est essentiel pour votre santé.'
      ],
      alimentation: [
        'Réduisez le sel à moins de 5g/jour. Privilégiez fruits, légumes, poissons et évitez les plats préparés riches en sodium.',
        'Le régime DASH est excellent pour l\'hypertension : riche en fruits, légumes, céréales complètes et pauvre en graisses saturées.',
        'Limitez l\'alcool et maintenez un poids santé. Chaque kilo perdu peut réduire votre tension de 1 mmHg.'
      ],
      medicament: [
        'Prenez vos médicaments exactement comme prescrits, même si vous vous sentez bien. L\'hypertension est souvent asymptomatique.',
        'Ne jamais arrêter un traitement antihypertenseur brutalement. Consultez votre médecin pour tout ajustement.',
        'Utilisez des rappels ou une pilulier pour ne pas oublier vos prises. La régularité est cruciale pour l\'efficacité.'
      ],
      exercice: [
        'L\'activité physique régulière peut réduire votre tension de 4-9 mmHg. Visez 30 minutes d\'exercice modéré 5 fois par semaine.',
        'Marche rapide, natation, vélo sont excellents. Commencez progressivement et consultez votre médecin avant un nouveau programme.',
        'L\'exercice aide aussi à gérer le stress et maintenir un poids santé, deux facteurs importants pour votre tension.'
      ],
      stress: [
        'Le stress chronique peut contribuer à l\'hypertension. Techniques de relaxation, méditation et respiration profonde peuvent aider.',
        'Identifiez vos sources de stress et développez des stratégies d\'adaptation. Un sommeil de qualité est aussi essentiel.',
        'Si le stress persiste, n\'hésitez pas à consulter un psychologue. Votre santé mentale impacte votre santé cardiovasculaire.'
      ],
      urgence: [
        '🚨 Si votre tension dépasse 180/120 mmHg avec maux de tête sévères, troubles visuels ou douleur thoracique, appelez le 15 immédiatement.',
        'Une tension très élevée sans symptômes nécessite une consultation rapide mais pas urgente. Contactez votre médecin.',
        'En cas de doute, mieux vaut consulter. Les complications de l\'hypertension peuvent être graves mais sont évitables.'
      ]
    };

    for (const [keyword, possibleResponses] of Object.entries(responses)) {
      if (lowerMessage.includes(keyword)) {
        const randomIndex = Math.floor(Math.random() * possibleResponses.length);
        return possibleResponses[randomIndex] + '\n\n⚠️ Ces conseils ne remplacent pas une consultation médicale.';
      }
    }

    const defaultResponses = [
      'Je suis spécialisé dans l\'hypertension artérielle. Posez-moi des questions sur la tension, l\'alimentation, les médicaments ou les symptômes.',
      'Pour mieux vous aider, pouvez-vous préciser votre question sur l\'hypertension ? Je peux vous conseiller sur la prévention, le suivi ou les traitements.',
      'N\'hésitez pas à me poser des questions spécifiques sur la gestion de votre tension artérielle. Je suis là pour vous accompagner.',
    ];

    const randomIndex = Math.floor(Math.random() * defaultResponses.length);
    return defaultResponses[randomIndex] + '\n\n💡 Mots-clés utiles: tension, alimentation, médicament, exercice, stress, urgence';
  }
}

export default new ChatbotService();
