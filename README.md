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

- **Node.js 18 ou 20 LTS** (recommandé) et **npm**
- L'application **Expo Go** sur votre téléphone (iOS/Android), ou un émulateur
- *(Optionnel)* une clé API **Google Gemini** pour activer l'assistant IA (voir plus bas)

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

Au lancement de `npm start`, Expo affiche un **QR code** :

- 📱 **Téléphone** : scannez-le avec l'application **Expo Go**
- 🤖 **Android** : touche `a` (émulateur Android)
- 🍎 **iOS** : touche `i` (simulateur iOS, macOS uniquement)
- 🌐 **Web** : touche `w` (ouvre la version navigateur)

> 💡 **Connexion** — l'authentification est une **démo** : n'importe quel email et mot de passe fonctionnent (aucun serveur d'authentification).

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
| **Framework** | React Native 0.74 · Expo SDK 51 · TypeScript |
| **Navigation** | React Navigation 6 (stack + bottom tabs) |
| **UI** | React Native Paper · Chart Kit · Gifted Chat · Feather Icons |
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
