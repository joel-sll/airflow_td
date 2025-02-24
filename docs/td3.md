# 🚀 TD3: Gestion de fichiers avec Airflow

## 🎯 Objectif
Créer un DAG qui permet de surveiller, charger et traiter des fichiers CSV en utilisant différents opérateurs d'Airflow.

## 📝 Exercices Pratiques

### 1. Configuration du FileSensor

#### Configuration des volumes
- Ajouter le path à surveiller dans les volumes de airflow-common-env:
    ```
    C:\Users\Joel\Documents\Python\test_airflow:/appdata
    ```

#### Création de la connexion
1. Via ligne de commande:
     ```bash
     airflow connections add 'CONNECTION_NAME_HERE' --conn-type 'fs' --conn-extra '{"path": YOUR_PATH_HERE"}'
     ```
2. Via interface GUI:
     - Admin >> Connections >> +

#### Paramétrage de la tâche FileSensor
- Configurer les paramètres:
    - task_id
    - filepath
    - fs_conn_id
    - timeout
    - poke_interval
    - mode

### 2. Traitement des données

#### Chargement du fichier (PythonOperator)
- Créer une tâche pour charger le fichier CSV dans le dossier surveillé
- Importer les données dans la base SQLite stores.db

#### Archivage (BashOperator)
- Créer une tâche pour déplacer le fichier CSV traité vers le dossier archive

#### Vérification (PythonOperator)
- Créer une tâche pour afficher un échantillon de la table sales

## 💡 Astuces
- Vérifier la détection correcte du fichier par le FileSensor
- Tester chaque étape séparément avant de les enchaîner
- Consulter les logs pour le debugging

