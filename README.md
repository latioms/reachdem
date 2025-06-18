# ReachDem

ReachDem (anciennement **CMPAIGN**) est une application Next.js d'envoi de messages marketing (SMS et e-mails). Elle permet de planifier ou d'exécuter des campagnes instantanées et propose une API "Messages as a Service".

## Fonctionnalités clés

- Envoi de campagnes directes ou programmées
- API SMS/Mail pour intégration tierce
- Tableau de bord détaillé (projets, messages, transactions)
- Suivi Mixpanel et Google Analytics via un hook unique
- Internationalisation français/anglais avec détection automatique
- Gestion d'authentification et de crédits utilisateur

## Structure du projet

- `app/` – pages Next.js et internationalisation
  - `[locale]/(auth)` : connexion/inscription
  - `[locale]/(dashboard)` : espace utilisateur (campagnes, facturation)
  - `[locale]/(landing)` et `(platform)` : pages publiques
  - `[order]/success` et `[order]/failure` : état d'une commande
- `components/` – composants React réutilisables
- `hooks/` – hooks personnalisés dont `use-dual-analytics`
- `lib/` – utilitaires et appels d'API (ex. `dashboard-stats.ts`)
- `providers/` – providers globaux (thème, analytics, sidebar)
- `context/` – contexte d'authentification
- `middleware.ts` – redirection automatique vers la bonne langue
- `store/` – états globaux via Zustand
- `public/` – images et ressources statiques

## Lancer l'application en local

Prérequis : Node.js >= 18 et [pnpm](https://pnpm.io).

```bash
pnpm install       # installe les dépendances
pnpm dev           # démarre le mode développement
# ou pnpm build && pnpm start pour un build de production
```

Certaines fonctionnalités requièrent des variables d'environnement (`.env.local`), notamment pour les services analytics et l'API SMS. Reportez-vous à `DUAL_ANALYTICS_GUIDE.md` et `MIXPANEL_TRACKING_GUIDE.md` pour plus de détails.

## Ressources complémentaires

- `DASHBOARD_IMPROVEMENTS.md` – pistes d'évolution du tableau de bord
- `DUAL_ANALYTICS_GUIDE.md` et `MIXPANEL_TRACKING_GUIDE.md` – configuration du suivi analytique
