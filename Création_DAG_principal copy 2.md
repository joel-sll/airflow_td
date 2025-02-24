<!-- # 🚀 Étape 3 : Création d'un pipeline ETL avec Airflow

## 🎯 Objectif

Créer un pipeline ETL (Extract, Transform, Load) avec Airflow pour :

1. Extraire des données de ventes de magasins en France et aux États-Unis
2. Transformer les données en convertissant les prix en GBP
3. Charger les données transformées dans un fichier CSV

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
    - Pensez à bien initialiser le répertoire de données avec `os.makedirs()`
    - Les `default_args` sont essentiels pour la configuration du DAG
    - Utilisez `datetime.now()` pour la date de début

??? example "Code initial"
    ```python { .py .copy }
    [Code précédent inchangé jusqu'aux tâches]
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

#### Partie 2 : Transformation des données pour la France

??? tip "Astuce"
    - Utilisez la fonction `xcom_pull()` pour récupérer les données de la tâche précédente
    - N'oubliez pas d'activer `provide_context=True` pour accéder aux XComs
    - Les opérateurs de dépendance `>>` ou `<<` définissent l'ordre d'exécution

??? example "Code initial"
    ```python { .py .copy }
    [Code précédent inchangé jusqu'aux tâches]
    ```

1. Ajoutez le code de transformation dans le fichier `etl_ventes_dag.py`.

2. Complétez la fonction `transform_france` en utilisant XCom :
    ```python
    ventes_france = context['task_instance'].xcom_pull(task_ids='extract_france')
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

    # Définition du flux
    extract_france_task >> transform_france_task
    ```


### Exercice 2 : Mise en place du pipeline pour les USA

### Exercice 3 : Chargement des données dans le  csv


??? tip "Astuce"
    - A
    - A
    - A

??? example "Code initial"
    ```python { .py .copy }
    [Code précédent inchangé jusqu'aux tâches]
    ```


1. Ajoutez le code de transformation dans le fichier `etl_ventes_dag.py`.

2. Complétez la fonction `transform_france` en utilisant XCom :
    ```python
    ventes_france = context['task_instance'].xcom_pull(task_ids='extract_france')
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
    ```



### Exercice 4 : creation du  rapport

 -->
