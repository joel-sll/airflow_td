Voici une version détaillée des étapes pour chaque exercice, en respectant la structure **Exercice / Ressources / Astuce / Solution**. J'ai ajouté deux nouveaux exercices : un pour surveiller le fichier CSV avec un **Sensor** et un autre pour envoyer une notification Slack lorsque le pipeline est terminé.

---

# 🚀 Étape 3 : Création d'un pipeline ETL avec Airflow

## 🎯 Objectif

Créer un pipeline ETL (Extract, Transform, Load) avec Airflow pour :

1. Extraire des données de ventes de magasins en France et aux États-Unis.
2. Transformer les données en calculant le total des ventes.
3. Charger les données transformées dans un fichier CSV.
4. Surveiller les modifications du fichier CSV avec un **Sensor**.
5. Envoyer une notification Slack lorsque le pipeline est terminé.

---

## 📚 Ressources
- [Documentation officielle d'Airflow](https://airflow.apache.org/docs/)
- [PythonOperator](https://airflow.apache.org/docs/apache-airflow/stable/howto/operator/python.html)
- [FileSensor](https://airflow.apache.org/docs/apache-airflow/stable/howto/sensor.html)
- [SlackOperator](https://airflow.apache.org/docs/apache-airflow-providers-slack/stable/operators/slack.html)
- [Pandas Documentation](https://pandas.pydata.org/docs/)

---

## 📝 Étapes du TD

### Exercice 1 : Mise en place du pipeline de la France et des USA

#### Partie 1 : Extraction des données

**Objectif** : Extraire des données de ventes pour la France et les USA.

??? tip "Astuce"
    - Utilisez des fonctions simples pour simuler l'extraction des données.
    - Stockez les données dans XCom pour les réutiliser dans les tâches suivantes.

??? example "Code initial"
    ```python
    def extract_france():
        """Simule l'extraction des données de ventes en France."""
        return {"ventes": [100, 200, 300]}  # Exemple de données

    def extract_usa():
        """Simule l'extraction des données de ventes aux USA."""
        return {"ventes": [500, 600, 700]}  # Exemple de données
    ```

**Étapes** :

1. Créez un fichier `etl_ventes_dag.py` dans le dossier `dags` d'Airflow.

2. Définissez les fonctions `extract_france` et `extract_usa` pour simuler l'extraction des données.

3. Ajoutez les tâches `extract_france_task` et `extract_usa_task` dans le DAG.

??? success "Solution complète"
    ```python
    from airflow import DAG
    from airflow.operators.python_operator import PythonOperator
    from datetime import datetime, timedelta

    # Fonctions d'extraction
    def extract_france():
        return {"ventes": [100, 200, 300]}

    def extract_usa():
        return {"ventes": [500, 600, 700]}

    # Configuration du DAG
    default_args = {
        'owner': 'votre_nom',
        'depends_on_past': False,
        'start_date': datetime(2023, 10, 1),
        'retries': 2,
        'retry_delay': timedelta(minutes=10),
    }

    dag = DAG(
        'etl_ventes_pipeline',
        default_args=default_args,
        description='Pipeline ETL pour les données de vente',
        schedule_interval=timedelta(minutes=5),
        catchup=False,
    )

    # Tâches d'extraction
    extract_france_task = PythonOperator(
        task_id='extract_france',
        python_callable=extract_france,
        dag=dag,
    )

    extract_usa_task = PythonOperator(
        task_id='extract_usa',
        python_callable=extract_usa,
        dag=dag,
    )
    ```

---

#### Partie 2 : Transformation des données

**Objectif** : Transformer les données extraites en calculant le total des ventes.

??? tip "Astuce"
    - Utilisez `xcom_pull` pour récupérer les données des tâches d'extraction.
    - Appliquez des transformations simples comme la somme des ventes.

??? example "Code initial"
    ```python
    def transform_france(**context):
        """Transformation des données France."""
        ventes_france = context['ti'].xcom_pull(task_ids='extract_france')
        return {"region": "France", "total_ventes": sum(ventes_france["ventes"])}

    def transform_usa(**context):
        """Transformation des données USA."""
        ventes_usa = context['ti'].xcom_pull(task_ids='extract_usa')
        return {"region": "USA", "total_ventes": sum(ventes_usa["ventes"])}
    ```

**Étapes** :

1. Définissez les fonctions `transform_france` et `transform_usa` pour transformer les données.

2. Ajoutez les tâches `transform_france_task` et `transform_usa_task` dans le DAG.

3. Définissez les dépendances entre les tâches d'extraction et de transformation.

??? success "Solution complète"
    ```python
    # Fonctions de transformation
    def transform_france(**context):
        ventes_france = context['ti'].xcom_pull(task_ids='extract_france')
        return {"region": "France", "total_ventes": sum(ventes_france["ventes"])}

    def transform_usa(**context):
        ventes_usa = context['ti'].xcom_pull(task_ids='extract_usa')
        return {"region": "USA", "total_ventes": sum(ventes_usa["ventes"])}

    # Tâches de transformation
    transform_france_task = PythonOperator(
        task_id='transform_france',
        python_callable=transform_france,
        provide_context=True,
        dag=dag,
    )

    transform_usa_task = PythonOperator(
        task_id='transform_usa',
        python_callable=transform_usa,
        provide_context=True,
        dag=dag,
    )

    # Définition du flux
    extract_france_task >> transform_france_task
    extract_usa_task >> transform_usa_task
    ```

---

#### Partie 3 : Chargement des données dans un CSV

**Objectif** : Charger les données transformées dans un fichier CSV.

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

**Étapes** :

1. Définissez la fonction `load_data` pour charger les données dans un fichier CSV.

2. Ajoutez la tâche `load_data_task` dans le DAG.

3. Définissez les dépendances entre les tâches de transformation et de chargement.

??? success "Solution complète"
    ```python
    import os
    import pandas as pd

    def load_data(**context):
        """Charge les données transformées dans un fichier CSV."""
        data_france = context['ti'].xcom_pull(task_ids='transform_france')
        data_usa = context['ti'].xcom_pull(task_ids='transform_usa')
        df = pd.DataFrame([data_france, data_usa])
        os.makedirs('output', exist_ok=True)
        df.to_csv('output/ventes.csv', index=False)

    # Tâche de chargement
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

### Exercice 2 : Surveillance du fichier CSV avec un Sensor

**Objectif** : Surveiller les modifications du fichier CSV avec un **Sensor**.

??? tip "Astuce"
    - Utilisez `FileSensor` pour surveiller les modifications du fichier CSV.
    - Configurez le `filepath` pour pointer vers le fichier CSV.

??? example "Code initial"
    ```python
    from airflow.sensors.filesystem import FileSensor

    file_sensor_task = FileSensor(
        task_id='file_sensor',
        filepath='output/ventes.csv',
        poke_interval=30,  # Vérifie toutes les 30 secondes
        timeout=300,       # Timeout après 5 minutes
        mode='poke',
    )
    ```

**Étapes** :

1. Ajoutez la tâche `file_sensor_task` pour surveiller le fichier CSV.

2. Définissez les dépendances entre la tâche de chargement et le **Sensor**.

??? success "Solution complète"
    ```python
    from airflow.sensors.filesystem import FileSensor

    # Tâche de surveillance
    file_sensor_task = FileSensor(
        task_id='file_sensor',
        filepath='output/ventes.csv',
        poke_interval=30,
        timeout=300,
        mode='poke',
        dag=dag,
    )

    # Définition du flux
    load_data_task >> file_sensor_task
    ```

---

### Exercice 3 : Envoi d'une notification Slack

**Objectif** : Envoyer une notification Slack lorsque le pipeline est terminé.

??? tip "Astuce"
    - Utilisez `SlackOperator` pour envoyer une notification Slack.
    - Configurez les paramètres `token`, `channel`, et `message` pour la notification.

??? example "Code initial"
    ```python
    from airflow.providers.slack.operators.slack_webhook import SlackWebhookOperator

    slack_task = SlackWebhookOperator(
        task_id='send_slack_notification',
        slack_webhook_conn_id='slack_default',
        message="Le pipeline ETL est terminé avec succès !",
    )
    ```

**Étapes** :

1. Configurez la connexion Slack dans Airflow (via l'interface web ou en utilisant une connexion par défaut).

2. Ajoutez la tâche `slack_task` pour envoyer une notification Slack.

3. Définissez les dépendances entre le **Sensor** et la tâche de notification Slack.

??? success "Solution complète"
    ```python
    from airflow.providers.slack.operators.slack_webhook import SlackWebhookOperator

    # Tâche de notification Slack
    slack_task = SlackWebhookOperator(
        task_id='send_slack_notification',
        slack_webhook_conn_id='slack_default',
        message="Le pipeline ETL est terminé avec succès !",
        dag=dag,
    )

    # Définition du flux
    file_sensor_task >> slack_task
    ```

---

### Exercice 4 : Génération d'un rapport consolidé

**Objectif** : Générer un rapport consolidé à partir des données transformées.

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

**Étapes** :

1. Définissez la fonction `generate_report` pour générer un rapport consolidé.

2. Ajoutez la tâche `generate_report_task` dans le DAG.

3. Définissez les dépendances entre le **Sensor** et la tâche de génération de rapport.

??? success "Solution complète"
    ```python
    def generate_report(**context):
        """Génère un rapport consolidé."""
        df = pd.read_csv('output/ventes.csv')
        total_ventes = df['total_ventes'].sum()
        moyenne_ventes = df['total_ventes'].mean()
        rapport = f"Total des ventes : {total_ventes}\nMoyenne des ventes : {moyenne_ventes}"
        return rapport

    # Tâche de génération de rapport
    generate_report_task = PythonOperator(
        task_id='generate_report',
        python_callable=generate_report,
        provide_context=True,
        dag=dag,
    )

    # Définition du flux
    file_sensor_task >> generate_report_task
    ```

---

## 🎉 Résultat final

Vous avez maintenant un pipeline ETL complet avec Airflow qui :
1. Extrait les données de ventes pour la France et les USA.
2. Transforme les données en calculant le total des ventes.
3. Charge les données transformées dans un fichier CSV.
4. Surveille les modifications du fichier CSV avec un **Sensor**.
5. Envoie une notification Slack lorsque le pipeline est terminé.
6. Génère un rapport consolidé.

N'hésitez pas à adapter ce pipeline à vos besoins spécifiques ! 😊