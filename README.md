# ReachDem

ReachDem (anciennement **CMPAIGN**) est une plateforme SaaS de communication marketing conçue pour les équipes qui veulent gérer des envois **SMS** et **E-mail** depuis une seule interface.

L’application couvre tout le flux : gestion des contacts, segmentation, création de campagnes, envoi, suivi des performances et gestion de crédits/projets.

---

## ✨ Ce que permet ReachDem

- **Campagnes SMS et e-mail** (envoi immédiat ou planifié)
- **Gestion des contacts et groupes** (création, import CSV, rattachement aux groupes)
- **Segmentation marketing** (segments, relations segment-contact)
- **Suivi des envois** (historique, stats, transactions)
- **Facturation/paiement** (intégrations NotchPay + Lygos)
- **Analytics produit** (Mixpanel + Google Analytics)
- **Internationalisation** (français/anglais)
- **Authentification + réinitialisation de mot de passe**

---

## 🧱 Stack technique

- **Framework** : Next.js 16 (App Router)
- **UI** : React 19 + Tailwind CSS 4 + composants Radix
- **Data backend** : Appwrite
- **State management** : Zustand + context providers
- **Analytics** : Mixpanel + Google Analytics
- **Paiement** : NotchPay + Lygos
- **Envoi e-mail** : Resend

---

## 📁 Structure du projet

```txt
app/                Pages, routes API, server actions, i18n
components/         Composants UI et composants métier
hooks/              Hooks personnalisés (analytics, filtres, etc.)
lib/                Intégrations (Appwrite, SMS, tracking, utils)
store/              Stores Zustand
providers/          Providers globaux (theme, analytics, sidebar)
constants/          Constantes et IDs de collections
docs/               Documentation technique complémentaire
public/             Assets statiques
```

---

## 🚀 Démarrage rapide

### 1) Prérequis

- Node.js **18+**
- pnpm (recommandé)

### 2) Installation

```bash
pnpm install
```

### 3) Variables d’environnement

Créez un fichier `.env.local` à la racine du projet.

Exemple minimal (à adapter à vos environnements) :

```env
# URL app
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Appwrite
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_APPWRITE_REACHDEM_DATABASE_ID=
NEXT_PUBLIC_APPWRITE_REACHDEM_PROJECT_COLLECTION_ID=
NEXT_PUBLIC_APPWRITE_REACHDEM_MESSAGE_COLLECTION_ID=
NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID=
NEXT_PUBLIC_APPWRITE_CAMPAIGNS_COLLECTION_ID=
NEXT_PUBLIC_APPWRITE_CONTACTS_COLLECTION_ID=
NEXT_PUBLIC_APPWRITE_SEGMENTS_COLLECTION_ID=
NEXT_PUBLIC_APPWRITE_CONTACT_SEGMENTS_COLLECTION_ID=
NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID=
NEXT_PUBLIC_APPWRITE_MAILING_CONTACTS_COLLECTION_ID=
NEXT_PUBLIC_APPWRITE_MAILING_GROUPS_COLLECTION_ID=
NEXT_PUBLIC_APPWRITE_MAILING_GROUP_CONTACTS_COLLECTION_ID=
NEXT_PUBLIC_APPWRITE_MAILING_SEGMENTS_COLLECTION_ID=
NEXT_PUBLIC_APPWRITE_MAILING_SEGMENT_CONTACTS_COLLECTION_ID=
NEXT_PUBLIC_APPWRITE_MAILING_CAMPAIGN_STATS_COLLECTION_ID=

# SMS provider
NEXT_PUBLIC_MBOA_SMS_USERID=
NEXT_PUBLIC_MBOA_SMS_API_PASSWORD=

# Analytics
NEXT_PUBLIC_MIXPANEL_TOKEN=
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# Paiement
NOTCHPAY_PUBLIC_KEY=
NOTCHPAY_PRIVATE_KEY=
LYGOS_API_URL=
LYGOS_API_KEY=

# Email / sécurité
RESEND_API_KEY=
SESSION_SECRET=
```

> ℹ️ Gardez les secrets côté serveur et ne partagez jamais votre `.env.local`.

### 4) Lancer en local

```bash
pnpm dev
```

Application disponible sur : `http://localhost:3000`

---

## 📜 Scripts disponibles

```bash
pnpm dev     # développement
pnpm build   # build production
pnpm start   # démarrage du build
pnpm lint    # lint Next.js/ESLint
```

---

## 🧭 Principales zones fonctionnelles

- **Landing/Public** : pages marketing, pricing, FAQ, contact
- **Auth** : login, register, forgot/reset password
- **Dashboard Mail** : contacts, groupes, composition de messages
- **Dashboard SMS** : campagnes, projets, historique, billing, paramètres
- **API routes** : paiements, webhooks, feedback, envoi

---

## 📚 Documentation complémentaire

- [Guide Analytics Mixpanel + GA](docs/DUAL_ANALYTICS_GUIDE.md)
- [Guide Mixpanel](docs/MIXPANEL_TRACKING_GUIDE.md)
- [Améliorations Dashboard](docs/DASHBOARD_IMPROVEMENTS.md)
- [Guide Reset Password](PASSWORD_RESET_GUIDE.md)
- [Guide import CSV](test-csv-import.md)

---

## 🤝 Contribution

1. Créez une branche feature
2. Implémentez votre changement
3. Exécutez `pnpm lint`
4. Ouvrez une Pull Request claire (contexte, modifications, impacts)

---

## 📄 Licence

Aucune licence explicite n’est actuellement définie dans ce repository.
