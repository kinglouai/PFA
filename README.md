# Projet fédérateur (S4 / 2A)
CI/CD Workflow Generator from Project Requirements (Template + Validation) Public cible
Étudiants 2A — Binôme — 1 semestre (S4) Domaine
DevOps • CI/CD • Software Quality • Automation Livrable principal
Générateur de pipelines (GitHub Actions/GitLab CI) + validateur + UI Niveau attendu
MVP stable + bibliothèque de templates + jeux de tests Encadrant
Pr. Youness BOUTYOUR
1. Contexte et motivation
La mise en place de pipelines CI/CD est répétitive et sujette à erreurs (ordre des étapes, gestion des secrets, caches, dépendances). Ce projet vise un générateur de workflows à partir d’exigences projet, basé sur des templates versionnés et une validation systématique.
2. Description et Objectifs
Ce projet vise à créer un outil (web + API) qui génère automatiquement un pipeline CI/CD (ex. GitHub Actions) à partir d’un profil projet renseigné par l’utilisateur (langage, framework, tests, lint, build Docker, branchement, etc.). Le système sélectionne des templates adaptés, produit un fichier YAML prêt à l’emploi, puis exécute une validation (syntaxe YAML + règles de bonnes pratiques : ordre des étapes, tests avant déploiement, absence de secrets hardcodés, etc.) et affiche un rapport d’erreurs/avertissements. L’objectif est de réduire le temps de configuration, standardiser les pipelines et garantir une base robuste et maintenable, tout en fournissant une prévisualisation et un export du workflow généré.
Objectifs :
•
Capturer les exigences d’un projet via un wizard (langage, framework, tests, build, deploy).
•
Générer automatiquement un workflow YAML prêt à l’emploi (pipeline CI).
•
Valider syntaxe + bonnes pratiques (tests avant deploy, secrets, branches, etc.).
•
Exporter YAML + documentation (README pipeline) + support de scénarios d’exemple.
3. Périmètre MVP (obligatoire)
•
Wizard requirements : langage (Python/Node/Java), framework (FastAPI/Express/Spring), tests (pytest/jest/mvn), build Docker (oui/non).
•
Génération GitHub Actions (MVP) : lint + tests + build (option Docker) avec triggers (push/PR) et matrix si pertinent.
•
Bibliothèque de templates : min 6 templates paramétrables (test-only, lint+test, docker build, deploy simulé, security scan simple, cache deps).
•
Validation : yamllint + checks custom (ordre des jobs, secrets non hardcodés, conditions branches).
•
UI : prévisualisation YAML, téléchargement, rapport de validation (warnings/errors).
•
Jeu de tests : au moins 3 profils projets (Python, Node, Java) avec YAML attendu.
4. Extensions (bonus)
2
•
Support GitLab CI, ou conversion GitHub→GitLab.
•
Réparation de pipeline : import YAML existant + suggestions de correction.
•
Policy engine : règles sécurité (SAST/Dependabot/SBOM) et conformité.
5. Architecture attendue
•
Frontend : wizard + viewer YAML + panneau validation.
•
Backend : service génération (templates) + service validation + stockage profils.
•
Templates : repository versionné, modulaires (includes/partials).
•
Validation : pipeline tests de non‑régression (snapshots YAML).
6. Évaluation
•
Correctness : YAML valide, exécutable, conforme au profil.
•
Qualité : lisibilité/maintenabilité YAML, modularité templates.
•
Couverture : diversité de profils supportés, robustesse des validations.
•
Mesures : taux de génération sans erreur, taux de warnings, temps de génération.
7. Livrables
•
Application (web) 'requirements → YAML' + docker-compose.
•
Repo templates + règles validation + tests automatisés.
•
3 repos de démonstration (ou projets exemples) + workflows générés.
•
Rapport : templates, validation, limites, perspectives.
•
Démo + guide utilisateur.
