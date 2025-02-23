<!-- # 🚀 Étape 3 : Création d'un pipeline ETL avec Airflow

## 🎯 Objectif

Créer un pipeline ETL (Extract, Transform, Load) avec Airflow pour :

1. Extraire des données de ventes de magasins en France et aux États-Unis.
2. Transformer les données en convertissant les prix en GBP.
3. Charger les données transformées dans un fichier CSV.

---

## 📚 Ressources
- [Documentation officielle d'Airflow](https://airflow.apache.org/docs/)
- [PythonOperator](https://airflow.apache.org/docs/apache-airflow/stable/howto/operator/python.html)
- [Pandas Documentation](https://pandas.pydata.org/docs/)

---

## 📝 Étapes du TD

### Exercice 1 : Mise en  place  du  pipeline de  la  france

#### Partie 1 : Extraction des données pour la France

??? example "Afficher le code"
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

2. Complétez le dictionnaire `default_args` avec:
   
      - `owner`: votre nom
      - `retries`: 2 
      - `retry_delay`: 10 minutes
      - `start_date`: date actuelle

3. Complétez le code de l'instance DAG avec:
   
      - ID: `etl_ventes_pipeline`
      - Arguments par défaut: `default_args=default_args`
      - Description personnalisée
      - Intervalle d'exécution: 5 minutes

4. Définissez la tâche `extract_france_task` avec:
   
      - `task_id='extract_france'`
      - `python_callable=extract_france`
      - `dag=dag`

5. 🔍 Vérification :
    Lancez  le  dag `etl_ventes_pipeline`  et  double-cliquer sur  `extract_france_task` et  dans  l'onglet  Xcom vous  devriez  voir  les  donnees  extrait  

![alt text](\image\extract_france.png)



??? example "Afficher la solution" 
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


#### Partie 2 :Transformation des données pour la France

??? example "Afficher le code"
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


1. Ajouter  le code  ci  dessus  dans  le    fichier `etl_ventes_dag.py` .
   
2. Completer  la  fonctoin  transform_france  en  utilisant  Xcom 
 
    ```python
    ventes_france = context['task_instance'].xcom_pull(task_ids='.....')
    return transformation_ventes(ventes_france, "France")
    ```
    [xcoms](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/xcoms.html)


3.  Completer  la  tache  transform_france_task  avec  :

      - `task_id='transform_france'`
      - `python_callable=transform_france`
      - `provide_context=True`
      - `dag=dag`

5. Definisez un  flux  de  donner  entre  les  taches `extract_france_task`  et `transform_france_task`

6. 🔍 Vérification :
    Lancez  le  dag `etl_ventes_pipeline`  et  double-cliquer sur  `transform_france` et  dans  l'onglet  Xcom vous  devriez  voir  les  donnees  extrait  



![alt text](\image\extract_france.png)


??? example "Afficher la solution" 
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

### Étape 2 : 
#### Exercice
1. Définissez un dictionnaire `magasins` contenant les données des magasins en France.
2. Créez une fonction `extraction_ventes(magasin_key)` pour générer des ventes aléatoires pour un magasin donné.
3. Ajoutez une fonction `extract_france()` pour extraire les données des magasins en France.

#### Ressources utiles
- [Manipulation de dictionnaires en Python](https://docs.python.org/3/tutorial/datastructures.html#dictionaries)
- [Génération de nombres aléatoires avec `random`](https://docs.python.org/3/library/random.html)

#### 💡 Astuce
- Utilisez `random.choice` pour sélectionner aléatoirement des villes et des noms de magasins.
- Stockez les ventes dans une liste de dictionnaires.

??? example "Afficher la solution"
    ```python
    # Données des magasins avec prix en devise locale
    magasins = {
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
    ```

---

### Étape 3 : Transformation des données pour la France

#### Exercice
1. Définissez un dictionnaire `TAUX_CONVERSION` pour les taux de change EUR → GBP et USD → GBP.
2. Créez une fonction `transformation_ventes(ventes, pays)` pour convertir les prix en GBP.
3. Ajoutez une fonction `transform_france()` pour transformer les données des magasins en France.

#### Ressources utiles
- [Manipulation de listes et dictionnaires en Python](https://docs.python.org/3/tutorial/datastructures.html)
- [Arrondir des nombres avec `round`](https://docs.python.org/3/library/functions.html#round)

#### 💡 Astuce
- Utilisez `round` pour arrondir les prix convertis à 2 décimales.
- Ajoutez un champ `taux_conversion` pour suivre le taux utilisé.

??? example "Afficher la solution"
    ```python
    # Taux de conversion (simulé)
    TAUX_CONVERSION = {
        'EUR_TO_GBP': 0.85,  # 1 EUR = 0.85 GBP
        'USD_TO_GBP': 0.79   # 1 USD = 0.79 GBP
    }

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
    ```

---

### Étape 4 : Extraction et transformation des données pour les USA

#### Exercice
1. Ajoutez les données des magasins aux États-Unis dans le dictionnaire `magasins`.
2. Créez une fonction `extract_usa()` pour extraire les données des magasins aux États-Unis.
3. Créez une fonction `transform_usa()` pour transformer les données des magasins aux États-Unis.

#### Ressources utiles
- [Documentation sur les dictionnaires Python](https://docs.python.org/3/tutorial/datastructures.html#dictionaries)
- [Utilisation de `random` pour générer des données aléatoires](https://docs.python.org/3/library/random.html)

#### 💡 Astuce
- Inspirez-vous des fonctions `extract_france()` et `transform_france()`.
- Assurez-vous que les données sont correctement converties en GBP.

??? example "Afficher la solution"
    ```python
    # Ajout des données pour les USA
    magasins["usa"] = {
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
    }

    def extract_usa():
        """Extraction des données USA"""
        return extraction_ventes("usa")

    def transform_usa(**context):
        """Transformation des données USA"""
        ventes_usa = context['task_instance'].xcom_pull(task_ids='extract_usa')
        return transformation_ventes(ventes_usa, "USA")
    ```

---

### Étape 5 : Chargement des données

#### Exercice
1. Créez une fonction `load_data()` pour charger les données transformées dans un fichier CSV.
2. Combinez les données des deux magasins dans un DataFrame Pandas.
3. Sauvegardez le DataFrame dans un fichier CSV.

#### Ressources utiles
- [Documentation de Pandas sur les DataFrames](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.html)
- [Manipulation de fichiers CSV avec Pandas](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.to_csv.html)

#### 💡 Astuce
- Utilisez `pd.concat` pour combiner les données existantes et nouvelles.
- Vérifiez si le fichier CSV existe déjà avant de l'écraser.

??? example "Afficher la solution"
    ```python
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
    ```

---

### Étape 6 : Configuration du DAG

#### Exercice
1. Définissez les arguments par défaut du DAG.
2. Créez une instance de DAG avec un intervalle d'exécution de 5 minutes.
3. Ajoutez les tâches d'extraction, de transformation et de chargement.
4. Définissez les dépendances entre les tâches.

#### Ressources utiles
- [Documentation d'Airflow sur les DAGs](https://airflow.apache.org/docs/apache-airflow/stable/concepts/dags.html)
- [Utilisation de PythonOperator](https://airflow.apache.org/docs/apache-airflow/stable/howto/operator/python.html)

#### 💡 Astuce
- Utilisez `PythonOperator` pour les tâches.
- Définissez les dépendances avec `>>`.

??? example "Afficher la solution"
    ```python
    # Configuration du DAG
    default_args = {
        'owner': 'airflow',
        'depends_on_past': False,
        'start_date': datetime(2024, 1, 1),
        'retries': 1,
        'retry_delay': timedelta(minutes=5),
    }

    # Création du DAG
    dag = DAG(
        'etl_ventes_pipeline',
        default_args=default_args,
        description='Pipeline ETL: Extraction → Transformation (conversion en GBP) → Chargement',
        schedule_interval=timedelta(minutes=5),
        catchup=False,
    )

    # Tâches d'extraction
    extract_usa_task = PythonOperator(
        task_id='extract_usa',
        python_callable=extract_usa,
        dag=dag,
    )

    extract_france_task = PythonOperator(
        task_id='extract_france',
        python_callable=extract_france,
        dag=dag,
    )

    # Tâches de transformation
    transform_usa_task = PythonOperator(
        task_id='transform_usa',
        python_callable=transform_usa,
        provide_context=True,
        dag=dag,
    )

    transform_france_task = PythonOperator(
        task_id='transform_france',
        python_callable=transform_france,
        provide_context=True,
        dag=dag,
    )

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

## 🏆 Conclusion
Vous avez créé un pipeline ETL complet avec Airflow pour extraire, transformer et charger des données de ventes. Ce TD vous a permis de comprendre les concepts de base d'Airflow et de construire un workflow robuste. -->