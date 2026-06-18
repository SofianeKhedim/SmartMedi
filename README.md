# 🩺 SmartMedi v2.0

**SmartMedi** est une application mobile **React Native (Expo)** dédiée au suivi et à la gestion de l'hypertension artérielle. Elle permet d'enregistrer ses mesures de tension, de visualiser son historique, de discuter avec un assistant médical IA et d'exporter un rapport PDF à partager avec son médecin.

> ⚠️ **Avertissement médical** — SmartMedi est un outil d'aide au suivi, **pas un dispositif médical**. Les informations fournies ne remplacent jamais une consultation. En cas d'urgence, appelez le **15**.

---

## ✨ Fonctionnalités

- 🩺 **Mesures** — saisie tension systolique/diastolique, pouls et notes, avec évaluation automatique du niveau de risque
- 📊 **Historique & statistiques** — graphique de tendance, moyennes et codes couleur
- 🤖 **Assistant IA** — chatbot spécialisé hypertension propulsé par **Google Gemini** (avec repli local sans clé API)
- 📄 **Export PDF** — rapport médical détaillé partageable
- 🔔 **Notifications** — rappels de mesure et alertes de tension critique
- 👤 **Profil** — informations utilisateur et paramètres
- 🎨 **Thème clair/sombre** et persistance locale des données

---

## 🚀 Installation

### Prérequis

- **Node.js 20 LTS** (recommandé) et **npm**
- L'application **Expo Go** sur votre téléphone (iOS/Android), ou un émulateur/simulateur
- *(Optionnel)* une clé API **Google Gemini** pour activer l'assistant IA (voir plus bas)

> ℹ️ Ce projet utilise **Expo SDK 54**. Sur un téléphone, **Expo Go doit être en SDK 54** (la dernière version du store) — sinon il refusera d'ouvrir le projet.

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/moNiang01/SmartMedi.git
cd SmartMedi

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement (voir section suivante)
cp .env.example .env
# puis éditer .env pour y coller votre clé Gemini

# 4. Lancer l'application
npm start
```

Au lancement de `npm start`, Expo ouvre le **Metro Bundler** et affiche un **QR code** + un menu de raccourcis.

### 📱 Lancer sur un téléphone physique (recommandé)

1. Installez **Expo Go** sur votre téléphone :
   - **iOS** → [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - **Android** → [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Branchez le téléphone et l'ordinateur sur le **même réseau Wi-Fi**.
3. Lancez `npm start` sur l'ordinateur.
4. Scannez le **QR code** :
   - **iPhone** → avec l'app **Appareil photo** (une notification propose d'ouvrir dans Expo Go)
   - **Android** → avec le bouton **« Scan QR code »** dans l'app Expo Go
5. L'appli se charge et se **recharge automatiquement** à chaque modification du code.

> 💡 Si le QR ne marche pas (réseaux séparés, Wi-Fi public), lancez en mode tunnel : `npx expo start --tunnel`.

### 💻 Lancer sur un émulateur / le web

Depuis le terminal où tourne `npm start`, appuyez sur :

- **`a`** → émulateur **Android** (Android Studio requis)
- **`i`** → simulateur **iOS** (macOS + Xcode requis)
- **`w`** → version **navigateur web** (la plus rapide pour un test)

> 💡 **Connexion** — l'authentification est une **démo** : n'importe quel email et mot de passe fonctionnent (aucun serveur d'authentification).

> 📈 **Astuce graphique** — à la première ouverture, l'accueil affiche « Aucune mesure ». Ajoutez **plusieurs mesures** (onglet **Mesurer**) pour que la **courbe de tension** s'affiche correctement : comptez au moins **3 à 5 mesures** pour une tendance lisible.

---

## 🔑 Configuration de la clé API Gemini (assistant IA)

L'assistant fonctionne **sans clé** grâce à des réponses locales prédéfinies. Pour activer les **vraies réponses IA** (Google Gemini), ajoutez une clé API — c'est **gratuit**.

### 1. Obtenir une clé (gratuit, ~2 min)

1. Ouvrez **[Google AI Studio → aistudio.google.com/apikey](https://aistudio.google.com/apikey)**
2. Connectez-vous avec un compte **Google**
3. Cliquez sur **« Get API key »** puis **« Create API key »**
4. Laissez Google créer un projet, puis **copiez la clé** (elle commence par `AIza...`)

> 🔒 **Important (depuis le 19 juin 2026)** : Google bloque les clés « non restreintes ». Sur [aistudio.google.com/api-keys](https://aistudio.google.com/api-keys), si une clé est marquée *unrestricted*, cliquez sur **« Restrict to Gemini API »**.

> 💸 Le quota gratuit couvre **Gemini 2.5 Flash** (le modèle utilisé ici) : environ **10 requêtes/min** et **500 requêtes/jour**, sans carte bancaire.

### 2. Renseigner la clé

**Option A — fichier `.env` (recommandé)**

Créez un fichier `.env` à la racine (à partir de `.env.example`) :

```bash
EXPO_PUBLIC_GEMINI_API_KEY=AIza...votre_cle...
```

Puis **redémarrez** le serveur Expo (`npm start`) pour que la variable soit prise en compte.

**Option B — directement dans l'app**

Onglet **Assistant** → icône **⚙️** (en haut à droite) → collez votre clé. Elle est enregistrée localement et **prioritaire** sur celle du `.env`.

> ⚠️ **Ne committez jamais votre clé.** Le fichier `.env` est listé dans `.gitignore`. Seul `.env.example` (sans secret) est versionné.

---

## 📂 Structure du projet

```
SmartMedi/
├── App.tsx                 # Navigation (auth + onglets) et thème
├── constants/
│   ├── Colors.tsx          # Thèmes clair/sombre
│   └── config.ts           # Lecture de la clé Gemini + modèle
├── context/
│   └── AppContext.tsx      # State global + persistance AsyncStorage
├── components/
│   └── SplashScreen.tsx    # Écran de démarrage animé
├── screen/                 # Écrans (Login, SignUp, Home, Mesure, Historique, Chatbot, Profil)
└── services/
    ├── ChatbotService.tsx      # Intégration Google Gemini + réponses locales
    ├── ExportService.tsx       # Génération du rapport PDF
    └── NotificationService.tsx # Rappels et alertes
```

---

## 🔧 Technologies

| Domaine | Outils |
|---|---|
| **Framework** | React Native 0.81 · Expo SDK 54 · React 19 · TypeScript |
| **Navigation** | React Navigation 6 (stack + bottom tabs) |
| **UI** | Chart Kit · Gifted Chat · @expo/vector-icons · Reanimated 4 |
| **Données** | AsyncStorage (stockage local clé-valeur) |
| **IA** | Google Gemini (`gemini-2.5-flash`) |
| **Système** | Expo Notifications · Expo Print & Sharing |

---

## 🔒 Confidentialité

- Les **mesures**, le **profil** et les **préférences** sont stockés **uniquement sur l'appareil** (AsyncStorage). Aucun serveur, aucun compte cloud.
- **Exception** : si une clé API est configurée, les **questions envoyées à l'assistant** sont transmises à l'API **Google Gemini** pour générer une réponse. Sans clé, tout reste 100 % local.

---

## 📈 Roadmap

- [ ] Connexion Bluetooth aux tensiomètres connectés
- [ ] Intégration Apple Health / Google Fit
- [ ] Rappels de médicaments avancés
- [ ] Authentification réelle + synchronisation multi-appareils

---

*Développé avec ❤️ pour améliorer le suivi de l'hypertension — projet EPSI.*
