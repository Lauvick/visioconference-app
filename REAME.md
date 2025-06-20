# Application de Visioconférence

Une application de visioconférence moderne développée avec React, offrant des fonctionnalités similaires à Zoom.

## 🚀 Fonctionnalités

- **Interface utilisateur moderne** avec design glassmorphism
- **Contrôles média** : activation/désactivation caméra et microphone
- **Enregistrement de réunions** avec téléchargement automatique
- **Chat en temps réel** intégré
- **Gestion des participants** avec statuts visuels
- **Partage d'écran** (simulation)
- **Interface responsive** adaptée à tous les écrans

## 🛠️ Technologies utilisées

- React 18 avec Hooks
- Lucide React pour les icônes
- TailwindCSS pour le styling
- WebRTC API pour l'accès caméra/microphone
- MediaRecorder API pour l'enregistrement

## 📦 Installation

1. Clonez le repository :
```bash
git clone https://github.com/Lauvick/visioconference-app.git
cd visioconference-app
```

2. Installez les dépendances :
```bash
npm install
```

3. Lancez l'application :
```bash
npm start
```

## 🌐 Déploiement

### Vercel (Recommandé)
1. Connectez votre repo GitHub à Vercel
2. Le déploiement se fait automatiquement

### Netlify
1. Glissez-déposez le dossier `build` sur Netlify
2. Ou connectez votre repo GitHub

## 🔒 Sécurité

- L'application nécessite HTTPS pour fonctionner (accès caméra/micro)
- Les enregistrements sont stockés localement
- Aucune donnée n'est envoyée vers des serveurs externes

## 🚧 Limitations actuelles

- Fonctionnement en mode démo (pas de vraie communication entre utilisateurs)
- Enregistrement uniquement du flux local
- Pas de serveur WebRTC pour les appels réels

## 📝 Améliorations futures

- Intégration d'un serveur de signalisation WebRTC
- Base de données pour la gestion des utilisateurs
- Salles de réunion persistantes
- Partage de fichiers
- Intégration calendrier

## 📄 Licence

MIT License

## 👨‍💻 Auteur

Développé par Lauvick