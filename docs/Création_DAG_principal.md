# 🚀 Étape 4 : Création d'un pipeline ETL avec Airflow

## 🎯 Objectif

Créer un pipeline ETL (Extract, Transform, Load) avec Airflow pour :

1. Extraire des données de ventes de magasins en France et aux États-Unis.
2. Transformer les données en convertissant les prix en GBP.
3. Charger les données transformées dans un fichier CSV.
4. Générer un rapport consolidé.

---

## 📚 Ressources
- [Documentation officielle d'Airflow](https://airflow.apache.org/docs/)
- [PythonOperator](https://airflow.apache.org/docs/apache-airflow/stable/howto/operator/python.html)
- [Pandas Documentation](https://pandas.pydata.org/docs/)

---

## 📝 Étapes du TD

### Exercice 1 : Mise en place du pipeline de la France

#### Partie 1 : Extraction des données pour la France

??? tip "Astuce"
      - Pensez à bien initialiser le répertoire de données avec `os.makedirs()`.
      - Les `default_args` sont essentiels pour la configuration du DAG.
      - Utilisez `datetime.now()` pour la date de début.

??? example "Code initial"
    ```python { .py .copy }
    from airflow import DAG
    from airflow.operators.python_operator import PythonOperator
    from datetime import datetime, timedelta
    import random
    import pandas as pd
    import os

    # Configuration
    AIRFLOW_HOME = os.getenv('AIRFLOW_HOME', '/opt/airflow')
    DATA_DIR = os.path.join(AIRFLOW_HOME, 'data')
    CSV_FILE = os.path.join(DATA_DIR, 'vente.csv')
    os.makedirs(DATA_DIR, exist_ok=True)

    # Taux de conversion (simulé)
    TAUX_CONVERSION = {
        'EUR_TO_GBP': 0.85,  # 1 EUR = 0.85 GBP
        'USD_TO_GBP': 0.79   # 1 USD = 0.79 GBP
    }

    # Données des magasins avec prix en devise locale
    magasins = {
        "usa": {
            "pays": "États-Unis",
            "devise": "USD",
            "villes": ["New York", "Los Angeles"],
            "noms_magasin": ["SuperMart USA", "QuickShop USA"],
            "produits": {
                "Pommes": 1.80,  # Prix en USD
                "Bananes": 0.95,
                "Lait": 2.40,
                "Pain": 1.45,
                "Œufs": 3.00
            },
            "vendeurs": ["Alice", "Bob", "Charlie", "David", "Eve"]
        },
        "france": {
            "pays": "France",
            "devise": "EUR",
            "villes": ["Paris", "Lyon"],
            "noms_magasin": ["SuperMart France", "QuickShop France"],
            "produits": {
                "Pommes": 1.30,  # Prix en EUR
                "Bananes": 0.70,
                "Lait": 1.80,
                "Pain": 1.00,
                "Œufs": 2.20
            },
            "vendeurs": ["Jean", "Marie", "Pierre", "Sophie", "Luc"]
        }
    }

    def extraction_ventes(magasin_key):
        """
        Extrait les données de vente pour un magasin.
        """
        magasin = magasins[magasin_key]
        ventes = []
        
        for produit, prix_unitaire in magasin["produits"].items():
            for vendeur in magasin["vendeurs"]:
                ville = random.choice(magasin["villes"])
                nom_magasin = random.choice(magasin["noms_magasin"])
                quantite_vendue = random.randint(1, 10)
                prix_total = quantite_vendue * prix_unitaire
                
                ventes.append({
                    "pays": magasin["pays"],
                    "devise_origine": magasin["devise"],
                    "ville": ville,
                    "nom_magasin": nom_magasin,
                    "produit": produit,
                    "prix_unitaire_original": prix_unitaire,
                    "vendeur": vendeur,
                    "quantite_vendue": quantite_vendue,
                    "prix_total_original": prix_total,
                    "date_vente": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })
        
        return ventes

    def extract_france():
        """Extraction des données France"""
        return extraction_ventes("france")

    # Configuration du DAG
    default_args = {
     # À compléter
    }

    # Création du DAG
    dag = DAG(
     # À compléter
    )
    
    # Tâches d'extraction
    extract_france_task = PythonOperator(
     # À compléter
    )
    ```

1. Créez un fichier `etl_ventes_dag.py` dans le dossier `dags` d'Airflow.

2. Complétez le dictionnaire `default_args` avec :
   
      - `owner`: votre nom
      - `retries`: 2
      - `retry_delay`: 10 minutes
      - `start_date`: date actuelle

3. Complétez le code de l'instance DAG avec :
   
      - ID: `etl_ventes_pipeline`
      - Arguments par défaut: `default_args=default_args`
      - Description personnalisée
      - Intervalle d'exécution : 5 minutes

4. Définissez la tâche `extract_france_task` avec :
   
      - `task_id='extract_france'`
      - `python_callable=extract_france`
      - `dag=dag`

5. 🔍 Vérification :
   
   Lancez le DAG `etl_ventes_pipeline`, double-cliquez sur `extract_france_task` et vérifiez les données extraites dans l'onglet XCom.

??? success "Solution complète"
    ```python { .py .copy }
    # Configuration du DAG
    default_args = {
        'owner': 'votre_nom',
        'depends_on_past': False,
        'start_date': datetime(2025, 2, 25),
        'retries': 2,
        'retry_delay': timedelta(minutes=10),
    }

    # Création du DAG
    dag = DAG(
        'etl_ventes_pipeline',
        default_args=default_args,
        description='Pipeline ETL pour les données de vente',
        schedule_interval=timedelta(minutes=5),
        catchup=False,
    )

    # Tâche d'extraction France
    extract_france_task = PythonOperator(
        task_id='extract_france',
        python_callable=extract_france,
        dag=dag,
    )
    ```

---

#### Partie 2 : Transformation des données pour la France

??? tip "Astuce"
       - Utilisez la fonction `xcom_pull()` pour récupérer les données de la tâche précédente.
       - N'oubliez pas d'activer `provide_context=True` pour accéder aux XComs.
       - Les opérateurs de dépendance `>>` ou `<<` définissent l'ordre d'exécution.

??? example "Code initial"
    ```python { .py .copy }
    def transformation_ventes(ventes, pays):
        """
        Transforme les données de vente en convertissant les prix en GBP.
        """
        ventes_transformees = []
        for vente in ventes:
            vente_transformee = vente.copy()     
            # Sélectionner le taux de conversion approprié
            taux = (TAUX_CONVERSION['EUR_TO_GBP'] 
                    if vente['devise_origine'] == 'EUR' 
                    else TAUX_CONVERSION['USD_TO_GBP'])
            # Convertir les prix en GBP
            vente_transformee['prix_unitaire_gbp'] = round(vente['prix_unitaire_original'] * taux, 2)
            vente_transformee['prix_total_gbp'] = round(vente['prix_total_original'] * taux, 2)
            vente_transformee['taux_conversion'] = taux
            vente_transformee['date_transformation'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            ventes_transformees.append(vente_transformee)
        print(f"✓ Transformation des données de {pays} terminée")
        return ventes_transformees

    def transform_france(**context):
        """Transformation des données France"""
        pass

    transform_france_task = PythonOperator(
    # À compléter
    )
    ```

1. Ajoutez le code de transformation dans le fichier `etl_ventes_dag.py`.

2. Complétez la fonction `transform_france` en utilisant XCom :
   
   [Doc xcoms](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/xcoms.html)
   
   ```python
   ventes_france = context['ti'].xcom_pull(task_ids='........')
   return transformation_ventes(ventes_france, "France")
   ```


3. Complétez la tâche `transform_france_task` avec :
   
      - `task_id='transform_france'`
      - `python_callable=transform_france`
      - `provide_context=True`
      - `dag=dag`

4. Définissez le flux de données entre les tâches.

5. 🔍 Vérification :
   
   Vérifiez les données transformées dans l'onglet XCom de la tâche `transform_france`.

??? success "Solution complète"
    ```python { .py .copy }
    def transformation_ventes(ventes, pays):
    """
    Transforme les données de vente en convertissant les prix en GBP.
    """
    ventes_transformees = []
    for vente in ventes:
        vente_transformee = vente.copy()     
        # Sélectionner le taux de conversion approprié
        taux = (TAUX_CONVERSION['EUR_TO_GBP'] 
                if vente['devise_origine'] == 'EUR' 
                else TAUX_CONVERSION['USD_TO_GBP'])
        # Convertir les prix en GBP
        vente_transformee['prix_unitaire_gbp'] = round(vente['prix_unitaire_original'] * taux, 2)
        vente_transformee['prix_total_gbp'] = round(vente['prix_total_original'] * taux, 2)
        vente_transformee['taux_conversion'] = taux
        vente_transformee['date_transformation'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ventes_transformees.append(vente_transformee)
    print(f"✓ Transformation des données de {pays} terminée")
    return ventes_transformees

    def transform_france(**context):
        """Transformation des données France"""
        ventes_france = context['task_instance'].xcom_pull(task_ids='extract_france')
        return transformation_ventes(ventes_france, "France")

    transform_france_task = PythonOperator(
        task_id='transform_france',
        python_callable=transform_france,
        provide_context=True,
        dag=dag,
    )
    ```

---

### Exercice 2 : Mise en place du pipeline pour les USA

#### Partie 1 : Extraction des données pour les USA

??? tip "Astuce"
       - Suivez la même structure que pour la France.
       - Utilisez une fonction `extract_usa` pour simuler l'extraction des données.

 
1. Définissez la tâche `extract_usa_task`  et la  fonction  `extract_usa` avec :
   
      - `task_id='extract_usa'`
      - `python_callable=extract_usa`
      - `dag=dag`

2. 🔍 Vérification :
   
   Vérifiez les données extraites dans l'onglet XCom de la tâche `extract_usa`.

??? success "Solution complète"
    ```python { .py .copy }
    def extract_usa():
    """Extraction des données USA"""
        return extraction_ventes("usa")
    # Tâches d'extraction
    extract_usa_task = PythonOperator(
        task_id='extract_usa',
        python_callable=extract_usa,
        dag=dag,
    )
    ```

---

#### Partie 2 : Transformation des données pour les USA

??? tip "Astuce"
    - Utilisez la même logique que pour la France.
    - Assurez-vous de bien récupérer les données via `xcom_pull`.

 
1. Ajoutez la tâche `transform_usa_task` avec :
   
      - `task_id='transform_usa'`
      - `python_callable=transform_usa`
      - `provide_context=True`
      - `dag=dag`

2. Définissez le flux de données entre les tâches.

3. 🔍 Vérification :
   
   Vérifiez les données transformées dans l'onglet XCom de la tâche `transform_usa`.

??? success "Solution complète"
    ```python { .py .copy }
    def transform_usa(**context):
        """Transformation des données USA"""
        ventes_usa = context['ti'].xcom_pull(task_ids='extract_usa')
        return {"region": "USA", "total_ventes": sum(ventes_usa["ventes"])}

    transform_usa_task = PythonOperator(
        task_id='transform_usa',
        python_callable=transform_usa,
        provide_context=True,
        dag=dag,
    )
    # Définition du flux
    extract_usa_task >> transform_usa_task
    ```

---

### Exercice 3 : Chargement des données dans un CSV

??? tip "Astuce"
    - Utilisez `pandas` pour créer un DataFrame et sauvegarder les données dans un fichier CSV.
    - Assurez-vous que le répertoire de sortie existe.

??? example "Code initial"
    ```python { .py .copy }
    def load_data(**context):
        """Chargement des données transformées"""
        try:
            # Récupérer les données transformées
            ventes_usa = context['......'].xcom_pull(task_ids='......')
            ventes_france = context['......'].xcom_pull(task_ids='......')
            
            # Combiner les données
            toutes_ventes = ventes_usa + ventes_france
            
            # Créer le DataFrame
            df = pd.DataFrame(toutes_ventes)
            
            # Gérer le fichier existant
            if os.path.exists(CSV_FILE):
                df_existant = pd.read_csv(CSV_FILE)
                df = pd.concat([df_existant, df], ignore_index=True)
            
            # Sauvegarder
            df.to_csv(CSV_FILE, index=False)
            print(f"✓ Données chargées dans {CSV_FILE}")
            print(f"✓ Nombre total d'enregistrements: {len(df)}")
            
        except Exception as e:
            print(f"❌ Erreur lors du chargement: {str(e)}")
            raise

    # Tâche de chargement
    load_task = PythonOperator(
         # À compléter
    )

    # Définition du flux de données
    # À compléter
    ```

1. Complétez la fonction `load_data` en utilisant XCom
2. Ajoutez la tâche `load_data_task` avec :
   
      - `task_id='load_data'`
      - `python_callable=load_data`
      - `provide_context=True`
      - `dag=dag`

3. Définissez le flux de données entre les tâches.

4. 🔍 Vérification :
   
   Vérifiez que le fichier `data/ventes_transformed.csv` est créé avec les données correctes.

??? success "Solution complète"
    ```python { .py .copy }
    def load_data(**context):
        """Chargement des données transformées"""
        try:
            # Récupérer les données transformées
            ventes_usa = context['task_instance'].xcom_pull(task_ids='transform_usa')
            ventes_france = context['task_instance'].xcom_pull(task_ids='transform_france')
            
            # Combiner les données
            toutes_ventes = ventes_usa + ventes_france
            
            # Créer le DataFrame
            df = pd.DataFrame(toutes_ventes)
            
            # Gérer le fichier existant
            if os.path.exists(CSV_FILE):
                df_existant = pd.read_csv(CSV_FILE)
                df = pd.concat([df_existant, df], ignore_index=True)
            
            # Sauvegarder
            df.to_csv(CSV_FILE, index=False)
            print(f"✓ Données chargées dans {CSV_FILE}")
            print(f"✓ Nombre total d'enregistrements: {len(df)}")
            
        except Exception as e:
            print(f"❌ Erreur lors du chargement: {str(e)}")
            raise
    # Tâche de chargement
    load_task = PythonOperator(
        task_id='load_data',
        python_callable=load_data,
        provide_context=True,
        dag=dag,
    )
    # Définition du flux de données
    extract_usa_task >> transform_usa_task >> load_task
    extract_france_task >> transform_france_task >> load_task
    ```

---

### Exercice 4 : Création du rapport

??? tip "Astuce"
    - Utilisez `pandas` pour générer un rapport consolidé.
    - Ajoutez des calculs supplémentaires comme la moyenne ou le total des ventes.

??? example "Code initial"
    ```python { .py .copy }
    def generate_report(**context):
        """Génère un rapport consolidé."""
        df = pd.read_csv('output/ventes.csv')
        total_ventes = df['total_ventes'].sum()
        moyenne_ventes = df['total_ventes'].mean()
        rapport = f"Total des ventes : {total_ventes}\nMoyenne des ventes : {moyenne_ventes}"
        return rapport
    ```

1. Ajoutez la tâche `generate_report_task` avec :
   
      - `task_id='generate_report'`
      - `python_callable=generate_report`
      - `provide_context=True`
      - `dag=dag`

2. Définissez le flux de données entre les tâches.

3. 🔍 Vérification :
   
   Vérifiez que le rapport est généré correctement.

??? success "Solution complète"
    ```python
    def generate_report(**context):
        """Génère un rapport consolidé."""
        df = pd.read_csv('output/ventes.csv')
        total_ventes = df['total_ventes'].sum()
        moyenne_ventes = df['total_ventes'].mean()
        rapport = f"Total des ventes : {total_ventes}\nMoyenne des ventes : {moyenne_ventes}"
        return rapport

    generate_report_task = PythonOperator(
        task_id='generate_report',
        python_callable=generate_report,
        provide_context=True,
        dag=dag,
    )

    # Définition du flux
    load_data_task >> generate_report_task
    ```

---

## 🎉 Résultat final

Vous avez maintenant un pipeline ETL complet avec Airflow qui :

1. Extrait les données de ventes pour la France et les USA.
   
2. Transforme les données en calculant le total des ventes.
   
3. Charge les données transformées dans un fichier CSV.

4. Génère un rapport consolidé.