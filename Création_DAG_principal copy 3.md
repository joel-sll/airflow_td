<!-- # 🚀 Étape 3 : Création d'un pipeline ETL avec Airflow

## 🎯 Objectif

Créer un pipeline ETL (Extract, Transform, Load) avec Airflow pour :

1. Extraire des données de ventes de magasins en France et aux États-Unis
2. Transformer les données en convertissant les prix en GBP 
3. Charger les données transformées dans un fichier CSV
4. Générer un rapport d'analyse

---

## 📚 Ressources
- [Documentation officielle d'Airflow](https://airflow.apache.org/docs/)
- [PythonOperator](https://airflow.apache.org/docs/apache-airflow/stable/howto/operator/python.html)
- [Pandas Documentation](https://pandas.pydata.org/docs/)
- [XCom dans Airflow](https://airflow.apache.org/docs/apache-airflow/stable/concepts/xcoms.html)

---

## 📝 Étapes du TD

### Exercice 1 : Pipeline France

#### Partie 1 : Extraction des données France

??? tip "Astuces"
    - Utilisez `os.makedirs()` avec `exist_ok=True` pour le répertoire de données
    - Définissez une `start_date` dans le futur pour éviter les exécutions historiques
    - Préférez `datetime.now()` pour la date de début en développement

??? example "Code initial"
    ```python
    from airflow import DAG
    from airflow.operators.python import PythonOperator
    from datetime import datetime, timedelta
    import os
    ```

??? success "Solution"
    ```python
    default_args = {
        'owner': 'votre_nom',
        'start_date': datetime(2025, 2, 25),
        'retries': 2,
        'retry_delay': timedelta(minutes=10)
    }

    dag = DAG(
        'etl_ventes_pipeline',
        default_args=default_args,
        description='Pipeline ETL ventes FR/US',
        schedule_interval='*/5 * * * *',
        catchup=False
    )

    extract_france_task = PythonOperator(
        task_id='extract_france',
        python_callable=extract_france,
        dag=dag
    )
    ```

#### Partie 2 : Transformation France

??? tip "Astuces"
    - Utilisez le décorateur `@task` pour des tâches Python simples
    - Activez `provide_context=True` pour accéder aux XComs
    - Stockez les données intermédiaires avec `xcom_push()`

??? success "Solution"
    ```python
    def transform_france(**context):
        data = context['task_instance'].xcom_pull(task_ids='extract_france')
        transformed = transformation_ventes(data, "France")
        return transformed

    transform_france_task = PythonOperator(
        task_id='transform_france',
        python_callable=transform_france,
        provide_context=True,
        dag=dag
    )

    extract_france_task >> transform_france_task
    ```

### Exercice 2 : Pipeline USA

??? tip "Astuces"
    - Réutilisez la même structure que pour le pipeline France
    - Adaptez les fonctions de transformation pour le format US
    - Gérez les fuseaux horaires pour les données US

??? success "Solution"
    ```python
    extract_usa_task = PythonOperator(
        task_id='extract_usa',
        python_callable=extract_usa,
        dag=dag
    )

    transform_usa_task = PythonOperator(
        task_id='transform_usa',
        python_callable=transform_usa,
        provide_context=True,
        dag=dag
    )

    extract_usa_task >> transform_usa_task
    ```

### Exercice 3 : Chargement CSV

??? tip "Astuces"
    - Utilisez `pandas.concat()` pour fusionner les données
    - Définissez un chemin absolu pour le fichier CSV
    - Ajoutez des vérifications d'intégrité des données

??? success "Solution"
    ```python
    def load_data(**context):
        fr_data = context['task_instance'].xcom_pull(task_ids='transform_france')
        us_data = context['task_instance'].xcom_pull(task_ids='transform_usa')
        
        df = pd.concat([fr_data, us_data])
        df.to_csv('ventes_combinees.csv', index=False)

    load_task = PythonOperator(
        task_id='load_data',
        python_callable=load_data,
        provide_context=True,
        dag=dag
    )

    [transform_france_task, transform_usa_task] >> load_task
    ```

### Exercice 4 : Génération Rapport

??? tip "Astuces"
    - Utilisez matplotlib pour les visualisations
    - Générez le rapport au format HTML ou PDF
    - Incluez des métriques clés de performance

??? success "Solution"
    ```python
    def generate_report(**context):
        df = pd.read_csv('ventes_combinees.csv')
        report = create_sales_report(df)
        save_report(report, 'rapport_ventes.html')

    report_task = PythonOperator(
        task_id='generate_report',
        python_callable=generate_report,
        dag=dag
    )

    load_task >> report_task
    ```

--- -->
