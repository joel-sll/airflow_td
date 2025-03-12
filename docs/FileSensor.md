# 🚀 Automatiser le déclenchement d'un DAG

## Description
En entreprise, de nouvelles données sont générées constamment. On souhaite donc automatiser leur traitement de manière régulière. Dans cet exercice, nous allons explorer une façon  d'automatiser ce processus avec Airflow. 

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
- [data](./data/stores.db)
- [csv](./data/stores.db)

---

## 📝 Étapes du TD

### Etape 1 : Configuration
#### Description
Airflow propose l'objet FileSensor afin de surveiller le contenu d'un dossier. En pratique, le dossier en question est extérieur au système utilisé par Airflow. Vous devrez donc configurer le chemin d'accès vers ce dossier.

1. **Configurer les volumes partagés dans le container** :
    - Ajoutez le chemin du dossier à surveiller dans les volumes de `x-airflow-common` (*docker-compose.yml ligne 75*):
        ```yaml
        - CHEMIN/LOCAL/DU/DOSSIER:CHEMIN/DANS/LE/CONTAINER
        ```
    - Procédez de même pour ajouter le dossier contenant la base de données puis celui pour archiver les fichiers de données traités.

Une fois l'ajout du chemin d'accès fait, il reste à configurer la connexion entre l'objet FileSensor et le dossier.

2. **Créer la connexion FileSensor** :
??? tip "Via la ligne de commande :"
    ```bash
    airflow connections add 'data_folder' --conn-type 'fs' --conn-extra '{"path": "/appdata"}'
    ```
??? tip "Via l'interface utilisateur :"
    - Allez dans `Admin >> Connections >> +`
    - Remplissez les champs :
        - Conn Id
        - Conn Type

---

### Etape 2 : Création du FileSensor

#### Description

Une fois l'étape de configuration réalisée, nous sommes prêts à instancier un objet FileSensor.

- **[FileSensor](https://airflow.apache.org/docs/apache-airflow/stable/_api/airflow/sensors/filesystem/index.html)** : Surveiller l'arrivée d'un fichier dans le système de fichier. Il nécessite les arguments suivants :  

    - task_id
    - filepath
    - fs_conn_id
    - timeout
    - poke_interval
    - mode

??? tip "Un template d'instanciation pour FileSensor"
    ```python
    wait_for_csv = FileSensor(
        task_id='wait_for_csv',
        filepath=
        fs_conn_id=
        timeout=
        poke_interval=
        mode=
    )
    ```

??? exemple
    ```python
    wait_for_csv = FileSensor(
        task_id='wait_for_csv',
        filepath='/appdata/data/*.csv',  # Detect any CSV file in the folder
        fs_conn_id='data_folder',  # Connection ID for filesystem
        timeout=60 *2,  # Timeout after 10 minutes
        poke_interval=10,  # Check every 30 seconds
        mode='poke',  # Use poke mode to wait for the file
    )
    ```

### Etape 3 : Créer le DAG qui exécutera les différentes taches

??? hint "Rappel des arguments pour le DAG"
    ```python
    with DAG(
        owner=
        default_args=
        dag_id=
        schedule_interval=
        start_date=
    ) as dag:
    ```

### Etape 4 : Créer une tache pour ouvrir le fichier CSV et le charger dans une base de données Sqlite

#### Description
Utiliser un [PythonOperator](https://airflow.apache.org/docs/apache-airflow/stable/howto/operator/python.html) pour créer le DAG qui devra charger le CSV dans la base de données.

??? hint "Rappel des arguments pour une tache"
    ```python
    load_task = PythonOperator(
        task_id=
        python_callable=
    )
    ```

??? example "Code de la fonction à exécuter avec le DAG"
    ```python
    def load_csv_to_sqlite():
    # Insert data into the sales table with corresponding store_id
    sales = pd.read_csv("/appdata/data/sales_2010.csv")
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    for _, row in sales.iterrows():
        conn.execute('''
        INSERT INTO sales (store_id, Dept, Date, Weekly_Sales, IsHoliday) VALUES (?, ?, ?, ?, ?)
        ''', (row["Store"], row['Dept'], row['Date'], row['Weekly_Sales'], row['IsHoliday']))
    conn.commit()
    conn.close()
    ```

### Etape 5 : Archiver le fichier (le déplacer dans un autre dossier.)
Nous allons profiter de cette tache pour introduire un nouvel opérateur : [**BashOperator**](https://airflow.apache.org/docs/apache-airflow/stable/howto/operator/bash.html). Comme son nom l'indique, il permet d'utiliser d'exécuter des commandes bash avec Airflow.

??? tip "Template d'une tache utilisant un BashOperator"
    ```python
    archive_csv_task = BashOperator(
        task_id=
        bash_command=
    )

??? tip "Une commande bash possible"
    Voir du coté de [**mv**](https://www.man-linux-magique.net/man1/mv.html)

    ??? example
        ```bash
        mv /appdata/data/* /appdata/archive/
        ```

### Etape 5 : Définir l'ordre des taches
Dans la première partie, nous avons écrit notre premier DAG (Hello World). Il ne contenait qu'une tache. Ici nous avons 3 taches qui doivent s'exécuter dans un ordre précis. Vouloir archiver un fichier qui n'a pas été traité est un non-sens. On parle ici de dépendance. La tache d'archivage dépend de la tache de chargement dans la base de données qui depend elle même de la détection d'un nouveau fichier.

Pour expliciter ces relations de dépendances, Airflow utilise 2 opérateurs : **>>** et **<<**.

*tache1 >> tache2* signifie que la tache *tache1* est en amont de la tache *tache2*.

*tache2 << tache1* signifie que la tache *tache2* est en aval de la tache *tache1*.

??? info "Pour aller plus loin"
    Si vous avez 3 tâches (`tache1`, `tache2`, `tache3`) et que `tache3` dépend simultanément de `tache1` et `tache2`, vous avez plusieurs façons possibles d'écrire cette relation :
    
    - `tache1 >> tache3 << tache2`
    - `[tache1, tache2] >> tache3`
    - `tache1 >> tache3`  
      `tache2 >> tache3`



## 🔍 Vérification

Pour valider votre DAG :

1. **Vérifiez la présence du DAG** dans l'interface web d'Airflow.
2. **Déclenchez manuellement le DAG** via l'interface.
3. **Analysez les logs** pour chaque tâche pour confirmer leur bon déroulement.

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

    # file:// indique que le chemin utilisé est un chemin absolu
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