# 🚀 Étape 5 : de fichiers et traitement avec Airflow

## Description
En entreprise, de nouvelles données sont générées constamment. On souhaite donc automatiser leur traitement de manière régulière. Dans cet exercice, nous allons explorer comment automatiser ce processus avec Airflow. 

## 🎯 Objectif

- Créer un DAG Airflow qui surveille un dossier pour détecter l'arrivée d'un fichier CSV ;
- charge son contenu dans une base de données SQLite ;
- archiver le fichier traité.

---

## 📚 Ressources
- [Documentation officielle d'Airflow](https://airflow.apache.org/docs/)
- [FileSensor Documentation](https://airflow.apache.org/docs/apache-airflow/stable/_api/airflow/sensors/filesystem/index.html)
- [PythonOperator Documentation](https://airflow.apache.org/docs/apache-airflow/stable/howto/operator/python.html)
- [BashOperator Documentation](https://airflow.apache.org/docs/apache-airflow/stable/howto/operator/bash.html)
- [data](docs\data\stores.db)
- [csv](docs\data\stores.db)

---

## 📝 Étapes du TD

### Etape 1 : Configuration
#### Description
Airflow propose l'objet FileSensor afin de surveiller le contenu d'un dossier. En pratique, le dossier en question est extérieur au système utilisé par Airflow. Vous devrez donc configurer le chemin d'accès vers ce dossier.

#### Tâches à réaliser

1. **Configurer le volume partagé** :
      - Ajoutez le chemin du dossier à surveiller dans les volumes de `airflow-common-env` :
        ```yaml
        - CHEMIN/LOCAL/DU/DOSSIER:/appdata
        ```

Une fois l'ajout du chemin d'accès fait, il reste à configurer la connexion entre l'objet FileSensor et le dossier.

2. **Créer la connexion FileSensor** :
      - Via la ligne de commande :
    - 
        ```bash
        airflow connections add 'file_sensor_conn' --conn-type 'fs' --conn-extra '{"path": "/appdata"}'
        ```
      - Via l'interface utilisateur (GUI) :
        - Allez dans `Admin >> Connections >> +`
        - Remplissez les champs :
          - Conn Id
          - Conn Type

---

### Etape 2 : Création du FileSensor

#### Description

Une fois l'étape de configuration réalisée, nous sommes prêts à instancier un objet FileSensor.

- **[FileSensor](https://airflow.apache.org/docs/apache-airflow/stable/_api/airflow/sensors/filesystem/index.html)** : Surveiller l'arrivée d'un fichier dans le système de fichier. Il accepte les arguments suivants :  

        -task_id
        -filepath
        -fs_conn_id
        -timeout
        -poke_interval
        -mode

### Etape 3 : Créer une tache pour ouvrir le fichier CSV et le charger dans une base de données Sqlite

- **PythonOperator** : Charger le fichier CSV dans une base de données SQLite.

### Etape 4 : Archiver le fichier (le déplacer dans un autre dossier.)
- **BashOperator** : Archiver le fichier traité.
- **PythonOperator** : Afficher quelques lignes de la table pour vérifier l'importation.

#### Tâches à réaliser

??? example "Code initial"   
    ```python {.copy}
    import os
    import glob
    import pandas as pd
    import sqlite3
    from datetime import datetime, timedelta
    from airflow import DAG, Dataset
    from airflow.operators.python import PythonOperator
    from airflow.sensors.filesystem import FileSensor
    from airflow.operators.bash import BashOperator
    import logging

    myfile = Dataset("file:///appdata/database/stores.db")

    # Define the SQLite database path
    DB_PATH = '/appdata/database/stores.db'  # Change this to your SQLite database path
    DATA_FOLDER = '/appdata/data'  # Change this to your data folder path

    def load_csv_to_sqlite():
        # # Insert data into sales with corresponding store_id
        sales = pd.read_csv("/appdata/data/sales_2010.csv")
        conn = sqlite3.connect(DB_PATH)
        conn.execute("PRAGMA foreign_keys = ON")  # Enable foreign key support
        for _, row in sales.iterrows():
            conn.execute('''
            INSERT INTO sales (store_id, Dept, Date, Weekly_Sales, IsHoliday) VALUES (?, ?, ?, ?, ?)
            ''', (row["Store"], row['Dept'], row['Date'], row['Weekly_Sales'], row['IsHoliday']))
        conn.commit()
        conn.close()
        print(sales.head(10))

    def query_db():
        # Querying the SQLite database to check the data
        conn = sqlite3.connect(DB_PATH)
        sales_query = pd.read_sql_query("SELECT * FROM sales", conn)
        print("\nSales:")
        print(sales_query)

        conn.close()
    ```

1. **Définir les arguments par défaut** :
   ```python
    # Default arguments for the DAG
    default_args = {
        'owner': 'joel',
        'retries': 1,
        'retry_delay': timedelta(minutes=5),
        'start_date': datetime(2023, 1, 1),  # Adjust this date
    }
   ```

2. **Créer l'instance du DAG** :
   ```python
    # Create the DAG
    with DAG(
        dag_id='filesensor_dag3',
        default_args=default_args,
        schedule_interval=timedelta(days=1),  # Adjust the schedule as needed
        catchup=False,
    ) as dag:
   ```

3. **Ajouter la tâche FileSensor** :
   ```python
    # Define the File Sensor to wait for new CSV files
    wait_for_csv = FileSensor(
        task_id='wait_for_csv',
        filepath='/appdata/data/*.csv',  # Detect any CSV file in the folder
        fs_conn_id='data_folder',  # Connection ID for filesystem
        timeout=60 *2,  # Timeout after 10 minutes
        poke_interval=10,  # Check every 30 seconds
        mode='poke',  # Use poke mode to wait for the file
    )
   ```

1. **Ajouter la tâche PythonOperator pour charger le fichier CSV** :
   ```python
     # Define the task to load CSV files into SQLite
     load_task = PythonOperator(
         task_id='load_csv_to_sqlite',
         python_callable=load_csv_to_sqlite,
         provide_context=True,
         outlets=[myfile]
     )
   ```

2. **Ajouter la tâche BashOperator pour archiver le fichier** :
   ```python
     archive_csv_task = BashOperator(
      task_id="archive_csv",
      bash_command="mv /appdata/data/* /appdata/archive/"
    )
   ```

3. **Définir les dépendances entre les tâches** :
   ```python
    # Set task dependencies
    wait_for_csv >> load_task >> archive_csv_task
   ```

4. **Ajouter la tâche PythonOperator pour afficher les données** :
??? example "Code initial"   
    ```python {.copy}
        from airflow import DAG, Dataset
        from airflow.decorators import task
        from airflow.operators.python import PythonOperator

        import sqlite3
        import pandas as pd
        from datetime import datetime, timedelta

        # myfile = Dataset("file:///appdata/archive/sales.csv")
        myfile = Dataset("file:///appdata/database/stores.db")

        default_args = {
            'owner': 'joel',
            'retries': 1,
            'retry_delay': timedelta(minutes=5),
            'start_date': datetime(2023, 1, 1),  # Adjust this date
        }

        def count_sales_rows():
            """Query SQLite database to count rows in sales table."""
            db_path = "/appdata/database/stores.db"  # Update if necessary
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT COUNT(*) FROM sales")
            row_count = cursor.fetchone()[0]  # Fetch the count result
            
            conn.close()
            print(f"Total rows in sales table: {row_count}")  # Log the result

        with DAG(
            dag_id="dataset_consumer2",
            default_args=default_args,
            schedule=[myfile],
            catchup=False
        ) as dag:
            
            query_db_task = PythonOperator(
                task_id="query_db",
                python_callable=count_sales_rows
            )

            query_db_task
    ```
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

## Solution complète

??? example "Afficher la solution"
    ```python
    import os
    import glob
    import pandas as pd
    import sqlite3
    from datetime import datetime, timedelta
    from airflow import DAG, Dataset
    from airflow.operators.python import PythonOperator
    from airflow.sensors.filesystem import FileSensor
    from airflow.operators.bash import BashOperator
    import logging

    myfile = Dataset("file:///appdata/database/stores.db")

    # Define the SQLite database path
    DB_PATH = '/appdata/database/stores.db'  # Change this to your SQLite database path
    DATA_FOLDER = '/appdata/data'  # Change this to your data folder path

    def load_csv_to_sqlite():
        # # Insert data into sales with corresponding store_id
        sales = pd.read_csv("/appdata/data/sales_2010.csv")
        conn = sqlite3.connect(DB_PATH)
        conn.execute("PRAGMA foreign_keys = ON")  # Enable foreign key support
        for _, row in sales.iterrows():
            conn.execute('''
            INSERT INTO sales (store_id, Dept, Date, Weekly_Sales, IsHoliday) VALUES (?, ?, ?, ?, ?)
            ''', (row["Store"], row['Dept'], row['Date'], row['Weekly_Sales'], row['IsHoliday']))
        conn.commit()
        conn.close()
        print(sales.head(10))

    def query_db():
        # Querying the SQLite database to check the data
        conn = sqlite3.connect(DB_PATH)
        sales_query = pd.read_sql_query("SELECT * FROM sales", conn)
        print("\nSales:")
        print(sales_query)

        conn.close()


    # Default arguments for the DAG
    default_args = {
        'owner': 'joel',
        'retries': 1,
        'retry_delay': timedelta(minutes=5),
        'start_date': datetime(2023, 1, 1),  # Adjust this date
    }

    # Create the DAG
    with DAG(
        dag_id='filesensor_dag3',
        default_args=default_args,
        schedule_interval=timedelta(days=1),  # Adjust the schedule as needed
        catchup=False,
    ) as dag:


        # Define the File Sensor to wait for new CSV files
        wait_for_csv = FileSensor(
            task_id='wait_for_csv',
            filepath='/appdata/data/*.csv',  # Detect any CSV file in the folder
            fs_conn_id='data_folder',  # Connection ID for filesystem
            timeout=60 *2,  # Timeout after 10 minutes
            poke_interval=10,  # Check every 30 seconds
            mode='poke',  # Use poke mode to wait for the file
        )

        # Define the task to load CSV files into SQLite
        load_task = PythonOperator(
            task_id='load_csv_to_sqlite',
            python_callable=load_csv_to_sqlite,
            provide_context=True,
            outlets=[myfile]
        )

        archive_csv_task = BashOperator(
            task_id="archive_csv",
            bash_command="mv /appdata/data/* /appdata/archive/"
        )


        # Set task dependencies
        wait_for_csv >> load_task >> archive_csv_task
    ```

---