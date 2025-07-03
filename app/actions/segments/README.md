# Actions pour la gestion des segments

Cette architecture organise les actions des segments en séparant les responsabilités dans différents fichiers pour une meilleure maintenabilité et réutilisabilité.

## Structure des fichiers

### 📁 **segments/**

#### **constants.ts**
- Constantes partagées pour tous les modules de segments
- Variables d'environnement Appwrite (MAILING_DATABASE_ID, SEGMENTS_COLLECTION_ID, etc.)

#### **createSegment.ts**
- `createSegment()` - Créer un nouveau segment avec validation
- Gère l'unicité des noms et la validation des données

#### **getSegments.ts**
- `getSegments()` - Récupérer tous les segments d'un utilisateur
- `getSegmentById()` - Récupérer un segment spécifique
- `getSegmentWithContacts()` - Récupérer un segment avec ses contacts
- `searchSegments()` - Rechercher des segments par nom

#### **updateSegment.ts**
- `updateSegment()` - Mettre à jour un segment existant
- Gère la validation et l'unicité des noms

#### **deleteSegment.ts**
- `deleteSegment()` - Supprimer un segment et ses relations
- `deleteMultipleSegments()` - Suppression en lot

#### **segmentRelations.ts**
- `addContactToSegment()` - Ajouter un contact à un segment
- `removeContactFromSegment()` - Retirer un contact d'un segment
- `addMultipleContactsToSegment()` - Ajout en lot
- `removeMultipleContactsFromSegment()` - Suppression en lot
- `moveContactsBetweenSegments()` - Déplacer des contacts entre segments

#### **segmentAnalytics.ts**
- `analyzeSegmentUsage()` - Analyser l'utilisation des segments
- `getSegmentStats()` - Statistiques de base des segments
- `getColorDistributionReport()` - Rapport de distribution des couleurs

#### **segmentBulkOperations.ts**
- `duplicateSegment()` - Dupliquer un segment avec ses contacts
- `mergeSegments()` - Fusionner plusieurs segments
- `cleanupEmptySegments()` - Supprimer les segments vides
- `cleanupOrphanedRelations()` - Nettoyer les relations orphelines
- `removeDuplicateRelations()` - Supprimer les relations en double

#### **segmentValidation.ts**
- `validateSegmentIntegrity()` - Valider l'intégrité des données
- `checkSegmentConsistency()` - Vérifier la cohérence des données
- `autoRepairSegmentIssues()` - Réparation automatique des problèmes

#### **index.ts**
- Point d'entrée centralisé pour tous les exports
- Facilite les imports depuis d'autres parties de l'application

### 📄 **segmentUtils.ts** (existant)
- `getSegmentsCached()` - Version mise en cache des segments
- `invalidateSegmentCache()` - Invalider le cache
- `optimizeSegmentPerformance()` - Optimisation des performances

## Configuration Appwrite

Les segments utilisent la base de données **mailing** d'Appwrite avec les collections suivantes :

```env
NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID - Base de données principale
NEXT_PUBLIC_APPWRITE_MAILING_SEGMENTS_COLLECTION_ID - Collection des segments
NEXT_PUBLIC_APPWRITE_MAILING_SEGMENT_CONTACTS_COLLECTION_ID - Relations segment-contact
NEXT_PUBLIC_APPWRITE_MAILING_CONTACTS_COLLECTION_ID - Collection des contacts
```

## Gestion des utilisateurs

L'authentification et la gestion des utilisateurs utilisent les **méthodes classiques d'Appwrite** :
- `getAccount()` pour récupérer l'utilisateur connecté
- Pas de base de données utilisateur séparée
- Les segments sont liés aux utilisateurs via `user_id`

## Utilisation

### Import centralisé
```typescript
import { 
  createSegment, 
  getSegments, 
  updateSegment,
  deleteSegment,
  addContactToSegment,
  analyzeSegmentUsage
} from '@/app/actions/segments'
```

### Import spécifique
```typescript
import { createSegment } from '@/app/actions/segments/createSegment'
import { analyzeSegmentUsage } from '@/app/actions/segments/segmentAnalytics'
```

## Conventions

### Format de retour standardisé
Toutes les actions retournent un objet avec :
```typescript
{
  success: boolean
  data?: any
  error?: string
}
```

### Validation
- Validation de l'authentification utilisateur avec `getAccount()`
- Validation des paramètres d'entrée
- Vérification des permissions (ownership des segments)

### Gestion d'erreur
- Try-catch dans toutes les fonctions
- Logs d'erreur avec console.error
- Messages d'erreur utilisateur-friendly

### Revalidation
- Appel à `revalidatePath()` après les modifications
- Chemins principaux : `/dashboard/segments`, `/dashboard/contacts`

## Exemples d'usage

### Créer un segment
```typescript
const result = await createSegment({
  name: "Clients VIP",
  color: "purple",
  description: "Clients avec plus de 10 commandes"
})

if (result.success) {
  console.log("Segment créé:", result.data)
}
```

### Analyser l'utilisation
```typescript
const analysis = await analyzeSegmentUsage()

if (analysis.success) {
  const { overview, insights, recommendations } = analysis.data
  console.log(`${overview.total_segments} segments trouvés`)
  console.log(`${insights.empty_segments.length} segments vides`)
}
```

### Opérations en lot
```typescript
// Fusionner des segments
const mergeResult = await mergeSegments(
  "target-segment-id",
  ["source1-id", "source2-id"],
  true // supprimer les segments sources
)

// Nettoyer les segments vides
const cleanupResult = await cleanupEmptySegments()
```

Cette organisation facilite la maintenance, les tests, et permet une évolution modulaire de chaque fonctionnalité.
