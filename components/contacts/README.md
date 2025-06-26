# Composants de Gestion des Contacts

Ce dossier contient tous les composants liés à la gestion des contacts dans l'application.

## Structure des Composants

### 🎯 Composants Principaux

- **`ContactsClientPage`** - Page principale de gestion des contacts
- **`ContactList`** - Affichage des contacts avec pagination
- **`ContactSearch`** - Barre de recherche réutilisable
- **`ContactForm`** - Formulaire d'ajout/modification de contact
- **`DialogAddContact`** - Modale pour ajouter un nouveau contact

### 🔧 Hooks Personnalisés

- **`useSearchDebounce`** - Gestion de la recherche avec debounce (300ms)
- **`useContactFilter`** - Filtrage des contacts selon un terme de recherche

## Responsabilités Séparées

### ContactsClientPage
- Gestion de l'état global des contacts
- Chargement des données depuis l'API
- Coordination entre les composants
- Gestion de la pagination

### ContactSearch
- Interface de recherche avec raccourci clavier (⌘K)
- Affichage du nombre de résultats
- Bouton de réinitialisation

### ContactList
- Affichage tabulaire des contacts
- Pagination des résultats
- Actions sur chaque contact (éditer/supprimer)
- États vides (aucun contact / aucun résultat)

## Fonctionnalités

### 🔍 Recherche
- **Recherche multi-champs** : nom, email, téléphone, adresse
- **Debounce** : 300ms pour optimiser les performances
- **Raccourci clavier** : `Ctrl/Cmd + K`
- **Réinitialisation** : bouton X pour vider la recherche

### 📄 Pagination
- **Pagination côté client** pour les contacts filtrés
- **Navigation** : précédent/suivant + numéros de page
- **Affichage intelligent** : ellipses pour les grandes listes
- **Réinitialisation** automatique lors d'une recherche

### 📊 États
- **Chargement** : skeleton loader
- **Erreur** : message d'erreur avec retry
- **Vide** : différents messages selon le contexte
- **Résultats** : compteur dynamique

## Utilisation

```tsx
// Utilisation simple
<ContactsClientPage dictionary={dictionary} />

// Utilisation du composant de recherche séparément
<ContactSearch
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  resultsCount={filteredContacts.length}
  totalCount={contacts.length}
  dictionary={dictionary}
/>

// Utilisation des hooks
const { searchTerm, debouncedSearchTerm, setSearchTerm } = useSearchDebounce()
const filteredContacts = useContactFilter(contacts, debouncedSearchTerm)
```

## Performance

- **Debouncing** évite les filtres excessifs
- **useMemo** dans le hook de filtrage
- **Pagination** limite le rendu DOM
- **Lazy loading** des actions de contact
