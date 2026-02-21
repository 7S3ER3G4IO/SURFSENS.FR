# MARCHE À SUIVRE POUR L'IA (AI README)

Ce fichier contient la procédure et les directives que tu (l'IA) dois **strictement lire et suivre** à chaque fois que tu commences une nouvelle modification ou une nouvelle tâche sur ce projet.

## 1. Analyser la Demande
- Lis attentivement la demande complète de l'utilisateur.
- Si la demande n'est pas claire, pose des questions avant de commencer à coder.
- Identifie s'il s'agit d'un bug à corriger, d'une nouvelle fonctionnalité, ou d'une refonte visuelle.

## 2. Prendre Connaissance du Code (Contexte)
- Utilise les outils de recherche (`grep_search`, `list_dir`, `view_file`) pour lire les fichiers liés à la demande.
- Le projet contient des fichiers à la racine (comme `index.html`, `admin.html`, `script.js`, `style.css`) ainsi qu'une structure potentiel de Next.js (`src/`, `next.config.ts`).
- Modifie toujours les bons fichiers en fonction du contexte de la tâche. Si c'est pour l'interface vanilla, modifie les fichiers `.html`, `.js` et `.css` à la racine.

## 3. Esthétique et UI/UX (Règle d'or)
- Toute modification visuelle doit avoir un aspect **premium, moderne et wow**.
- Maintiens la cohérence avec le design actuel (couleurs, polices, thèmes dynamiques).
- Utilise des micro-animations et ne te contente jamais d'un design basique. Les éléments interactifs (boutons, inputs) doivent réagir au survol.

## 4. Précautions Techniques
- **Pas de suppositions** : Si tu as besoin d'une variable qui dépend d'un autre fichier, cherche-la d'abord.
- Si le Javascript est lié au DOM, assure-toi d'utiliser des vérifications de sécurité (`if (element)`).
- Quand tu remplaces du code, sois extrêmement précis avec les contextes de remplacement (TargetContent).

## 5. Workflow de Modification
1. Identifier les fichiers à modifier.
2. Lire les lignes exactes avant d'écrire ou de remplacer le code.
3. Appliquer les modifications via l'outil approprié.
4. (Si pertinent) Lancer les commandes pour observer les résultats de l'intégration, si un serveur de développement est requis.

---
**Rappel final pour chaque début de tâche :**
Tu dois toujours commencer par te référer à ce document, ou tout au moins te remémorer cette procédure, avant de commencer les intégrations. Applique les meilleures pratiques de développement web à tout instant.
