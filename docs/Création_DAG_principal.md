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
    ```python
    from airflow import DAG
    from airflow.operators.python_operator import PythonOperator
    from datetime import datetime, timedelta
    import os

    # Fonction d'extraction des données pour la France
    def extract_france():
        """Simule l'extraction des données de ventes en France."""
        return {"ventes": [100, 200, 300]}  # Exemple de données
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
    ```python
    # Configuration du DAG
    default_args = {
        'owner': 'votre_nom',
        'depends_on_past': False,
        'start_date': datetime(2023, 10, 1),
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
    ```python
    def transform_france(**context):
        """Transformation des données France"""
        ventes_france = context['ti'].xcom_pull(task_ids='extract_france')
        return {"region": "France", "total_ventes": sum(ventes_france["ventes"])}
    ```

1. Ajoutez le code de transformation dans le fichier `etl_ventes_dag.py`.

2. Complétez la fonction `transform_france` en utilisant XCom :
   ```python
   ventes_france = context['ti'].xcom_pull(task_ids='extract_france')
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
    ```python
    def transform_france(**context):
        """Transformation des données France"""
        ventes_france = context['ti'].xcom_pull(task_ids='extract_france')
        return {"region": "France", "total_ventes": sum(ventes_france["ventes"])}

    transform_france_task = PythonOperator(
        task_id='transform_france',
        python_callable=transform_france,
        provide_context=True,
        dag=dag,
    )

    # Définition du flux
    extract_france_task >> transform_france_task
    ```

---

### Exercice 2 : Mise en place du pipeline pour les USA

#### Partie 1 : Extraction des données pour les USA

??? tip "Astuce"
       - Suivez la même structure que pour la France.
       - Utilisez une fonction `extract_usa` pour simuler l'extraction des données.

??? example "Code initial"
    ```python
    def extract_usa():
        """Simule l'extraction des données de ventes aux USA."""
        return {"ventes": [500, 600, 700]}  # Exemple de données
    ```

1. Définissez la tâche `extract_usa_task` avec :
   
      - `task_id='extract_usa'`
      - `python_callable=extract_usa`
      - `dag=dag`

2. 🔍 Vérification :
   
   Vérifiez les données extraites dans l'onglet XCom de la tâche `extract_usa`.

??? success "Solution complète"
    ```python
    # Tâche d'extraction USA
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

??? example "Code initial"
    ```python
    def transform_usa(**context):
        """Transformation des données USA"""
        ventes_usa = context['ti'].xcom_pull(task_ids='extract_usa')
        return {"region": "USA", "total_ventes": sum(ventes_usa["ventes"])}
    ```

1. Ajoutez la tâche `transform_usa_task` avec :
   
      - `task_id='transform_usa'`
      - `python_callable=transform_usa`
      - `provide_context=True`
      - `dag=dag`

2. Définissez le flux de données entre les tâches.

3. 🔍 Vérification :
   
   Vérifiez les données transformées dans l'onglet XCom de la tâche `transform_usa`.

??? success "Solution complète"
    ```python
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
    ```python
    import pandas as pd

    def load_data(**context):
        """Charge les données transformées dans un fichier CSV."""
        data_france = context['ti'].xcom_pull(task_ids='transform_france')
        data_usa = context['ti'].xcom_pull(task_ids='transform_usa')
        df = pd.DataFrame([data_france, data_usa])
        df.to_csv('output/ventes.csv', index=False)
    ```

1. Ajoutez la tâche `load_data_task` avec :
   
      - `task_id='load_data'`
      - `python_callable=load_data`
      - `provide_context=True`
      - `dag=dag`

2. Définissez le flux de données entre les tâches.

3. 🔍 Vérification :
   
   Vérifiez que le fichier `output/ventes.csv` est créé avec les données correctes.

??? success "Solution complète"
    ```python
    def load_data(**context):
        """Charge les données transformées dans un fichier CSV."""
        data_france = context['ti'].xcom_pull(task_ids='transform_france')
        data_usa = context['ti'].xcom_pull(task_ids='transform_usa')
        df = pd.DataFrame([data_france, data_usa])
        os.makedirs('output', exist_ok=True)
        df.to_csv('output/ventes.csv', index=False)

    load_data_task = PythonOperator(
        task_id='load_data',
        python_callable=load_data,
        provide_context=True,
        dag=dag,
    )

    # Définition du flux
    [transform_france_task, transform_usa_task] >> load_data_task
    ```

---

### Exercice 4 : Création du rapport

??? tip "Astuce"
    - Utilisez `pandas` pour générer un rapport consolidé.
    - Ajoutez des calculs supplémentaires comme la moyenne ou le total des ventes.

??? example "Code initial"
    ```python
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