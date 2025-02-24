# 🚀 TD : Surveillance de fichiers et traitement avec Airflow

## 🎯 Objectif

Créer un DAG Airflow qui surveille un dossier pour détecter l'arrivée d'un fichier CSV, charge son contenu dans une base de données SQLite, puis archive le fichier traité. Ce TD vous permettra de comprendre comment utiliser les opérateurs **FileSensor**, **PythonOperator**, et **BashOperator** pour créer un pipeline de traitement de fichiers.

---

## 📚 Ressources
- [Documentation officielle d'Airflow](https://airflow.apache.org/docs/)
- [FileSensor Documentation](https://airflow.apache.org/docs/apache-airflow/stable/_api/airflow/sensors/filesystem/index.html)
- [PythonOperator Documentation](https://airflow.apache.org/docs/apache-airflow/stable/howto/operator/python.html)
- [BashOperator Documentation](https://airflow.apache.org/docs/apache-airflow/stable/howto/operator/bash.html)

---

## 📝 Étapes du TD

### Exercice 1 : Configuration initiale

#### Description
Nous allons configurer un DAG pour surveiller un dossier, traiter un fichier CSV, et archiver le fichier après traitement.

#### Tâches à réaliser

1. **Configurer le volume partagé** :
   - Ajoutez le chemin du dossier à surveiller dans les volumes de `airflow-common-env` :
     ```yaml
     - C:\Users\Joel\Documents\Python\test_airflow:/appdata
     ```

2. **Créer la connexion FileSensor** :
   - Via la ligne de commande :
     ```bash
     airflow connections add 'file_sensor_conn' --conn-type 'fs' --conn-extra '{"path": "/appdata"}'
     ```
   - Via l'interface utilisateur (GUI) :
     - Allez dans `Admin >> Connections >> +`
     - Remplissez les champs :
       - Conn Id: `file_sensor_conn`
       - Conn Type: `File (path)`
       - Extra: `{"path": "/appdata"}`

3. **Créer le DAG** :
   - Créez un fichier `file_processing_dag.py` dans le dossier `dags`.

---

### Exercice 2 : Création du DAG

#### Description
Nous allons créer un DAG avec les tâches suivantes :
1. **FileSensor** : Surveiller l'arrivée d'un fichier CSV.
2. **PythonOperator** : Charger le fichier CSV dans une base de données SQLite.
3. **BashOperator** : Archiver le fichier traité.
4. **PythonOperator** : Afficher quelques lignes de la table pour vérifier l'importation.

#### Tâches à réaliser

1. **Importer les modules nécessaires** :
   ```python
   from datetime import datetime, timedelta
   from airflow.models.dag import DAG
   from airflow.sensors.filesystem import FileSensor
   from airflow.operators.python import PythonOperator
   from airflow.operators.bash import BashOperator
   import pandas as pd
   import sqlite3
   import os
   ```

2. **Définir les arguments par défaut** :
   ```python
   default_args = {
       'owner': 'votre_nom',
       'retries': 2,
       'retry_delay': timedelta(minutes=5),
       'start_date': datetime(2023, 10, 1),
   }
   ```

3. **Créer l'instance du DAG** :
   ```python
   dag = DAG(
       'file_processing_dag',
       default_args=default_args,
       description='DAG pour surveiller et traiter un fichier CSV',
       schedule_interval=timedelta(days=1),
       catchup=False
   )
   ```

4. **Ajouter la tâche FileSensor** :
   ```python
   task_file_sensor = FileSensor(
       task_id='file_sensor_task',
       filepath='data.csv',
       fs_conn_id='file_sensor_conn',
       poke_interval=30,
       timeout=300,
       mode='poke',
       dag=dag
   )
   ```

5. **Ajouter la tâche PythonOperator pour charger le fichier CSV** :
   ```python
   def load_csv_to_db():
       csv_path = '/appdata/data.csv'
       db_path = '/appdata/stores.db'
       df = pd.read_csv(csv_path)
       conn = sqlite3.connect(db_path)
       df.to_sql('sales', conn, if_exists='append', index=False)
       conn.close()

   task_load_csv = PythonOperator(
       task_id='load_csv_task',
       python_callable=load_csv_to_db,
       dag=dag
   )
   ```

6. **Ajouter la tâche BashOperator pour archiver le fichier** :
   ```python
   task_archive_file = BashOperator(
       task_id='archive_file_task',
       bash_command='mv /appdata/data.csv /appdata/archive/data.csv',
       dag=dag
   )
   ```

7. **Ajouter la tâche PythonOperator pour afficher les données** :
   ```python
   def display_data():
       db_path = '/appdata/stores.db'
       conn = sqlite3.connect(db_path)
       df = pd.read_sql_query('SELECT * FROM sales LIMIT 5', conn)
       print(df)
       conn.close()

   task_display_data = PythonOperator(
       task_id='display_data_task',
       python_callable=display_data,
       dag=dag
   )
   ```

8. **Définir les dépendances entre les tâches** :
   ```python
   task_file_sensor >> task_load_csv >> task_archive_file >> task_display_data
   ```

---

### Exercice 3 : Vérification et test

#### Description
Vérifiez que le DAG fonctionne correctement en suivant les étapes ci-dessous.

#### Tâches à réaliser

1. **Vérifier la présence du DAG** :
   - Accédez à l'interface web d'Airflow : [http://localhost:8080/](http://localhost:8080/)
   - Recherchez `file_processing_dag` dans la liste des DAGs.

2. **Déclencher le DAG manuellement** :
   - Cliquez sur le bouton "Trigger DAG" pour lancer l'exécution.

3. **Surveiller l'exécution** :
   - Accédez à l'onglet "Graph View" pour visualiser l'état des tâches.
   - Vérifiez les logs de chaque tâche pour confirmer leur bon déroulement.

4. **Vérifier les résultats** :
   - Assurez-vous que le fichier CSV a été chargé dans la base de données SQLite.
   - Vérifiez que le fichier a été déplacé dans le dossier `archive`.
   - Confirmez que les données ont été affichées correctement dans les logs.

---

## 🔍 Vérification

Pour valider votre DAG :

1. **Vérifiez la présence du DAG** dans l'interface web d'Airflow.
2. **Déclenchez manuellement le DAG** via l'interface.
3. **Analysez les logs** pour chaque tâche pour confirmer leur bon déroulement.
4. **Vérifiez les résultats** :
   - Le fichier CSV a été chargé dans la base de données.
   - Le fichier a été archivé.
   - Les données ont été affichées correctement.

---

## 💡 Astuces

- Utilisez `catchup=False` pour éviter l'exécution des DAGs historiques.
- Testez votre DAG avec `airflow dags test [dag_id] [date]`.
- Assurez-vous que les chemins de fichiers sont corrects et accessibles par Airflow.

---

## Solution complète

??? example "Afficher la solution"
    ```python
    from datetime import datetime, timedelta
    from airflow.models.dag import DAG
    from airflow.sensors.filesystem import FileSensor
    from airflow.operators.python import PythonOperator
    from airflow.operators.bash import BashOperator
    import pandas as pd
    import sqlite3
    import os

    default_args = {
        'owner': 'votre_nom',
        'retries': 2,
        'retry_delay': timedelta(minutes=5),
        'start_date': datetime(2023, 10, 1),
    }

    dag = DAG(
        'file_processing_dag',
        default_args=default_args,
        description='DAG pour surveiller et traiter un fichier CSV',
        schedule_interval=timedelta(days=1),
        catchup=False
    )

    task_file_sensor = FileSensor(
        task_id='file_sensor_task',
        filepath='data.csv',
        fs_conn_id='file_sensor_conn',
        poke_interval=30,
        timeout=300,
        mode='poke',
        dag=dag
    )

    def load_csv_to_db():
        csv_path = '/appdata/data.csv'
        db_path = '/appdata/stores.db'
        df = pd.read_csv(csv_path)
        conn = sqlite3.connect(db_path)
        df.to_sql('sales', conn, if_exists='append', index=False)
        conn.close()

    task_load_csv = PythonOperator(
        task_id='load_csv_task',
        python_callable=load_csv_to_db,
        dag=dag
    )

    task_archive_file = BashOperator(
        task_id='archive_file_task',
        bash_command='mv /appdata/data.csv /appdata/archive/data.csv',
        dag=dag
    )

    def display_data():
        db_path = '/appdata/stores.db'
        conn = sqlite3.connect(db_path)
        df = pd.read_sql_query('SELECT * FROM sales LIMIT 5', conn)
        print(df)
        conn.close()

    task_display_data = PythonOperator(
        task_id='display_data_task',
        python_callable=display_data,
        dag=dag
    )

    task_file_sensor >> task_load_csv >> task_archive_file >> task_display_data
    ```

---

## Conclusion

Vous avez maintenant un DAG fonctionnel qui surveille un dossier, traite un fichier CSV, et archive le fichier après traitement. Vous pouvez étendre ce DAG en ajoutant des fonctionnalités supplémentaires, comme la gestion des erreurs ou l'envoi de notifications.