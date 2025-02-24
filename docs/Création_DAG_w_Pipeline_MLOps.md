# 🚀 Étape 4 :  Pipeline MLOps avec Airflow et Docker

## **Objectif**
L'objectif de cet exercice est de mettre en place un **pipeline MLOps automatisé** avec **Apache Airflow** et **Docker** pour gérer l'entraînement et l'évaluation d'un modèle de classification sur le dataset **Iris**.

Nous allons :

1. **Charger et prétraiter les données** 📊
2. **Entraîner un modèle RandomForest** 🎯
3. **Évaluer la performance du modèle** 📈
4. **Mettre en place un DAG Airflow pour automatiser ces étapes**

---

## 📂 **Structure du projet**

```plaintext 
mlops/
│── airflow-docker/
│   ├── dags/                      # Contient les DAGs (workflow Airflow)
│   │   ├── mlops_pipeline.py
│   │   │── src/                            # Code métier (prétraitement, entraînement...)
│   │   │   ├── preprocessing.py
│   │   │   ├── training.py
│   │   │   ├── evaluation.py
│   │   │── data/                           # Datasets si besoin
│   │   │   ├── data.csv
│   │   │── models/                         # Stockage des modèles entraînés
│   ├── plugins/                   # Plugins Airflow si nécessaire
│   ├── logs/                       # Logs d'exécution
│   ├── docker-compose.yml          # Déploiement Docker
│   ├── requirements.txt            # Dépendances

```

---

## **1️⃣ Étape 1 - Prétraitement des données**
**📌 Objectif :** Charger et nettoyer les données Iris, puis les sauvegarder.

📍 **Fichier : `src/preprocessing.py`**
```python {.copy}
import os
import pandas as pd
from sklearn.datasets import load_iris

def preprocess_data():
    print("Prétraitement des données...")

    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data"))
    os.makedirs(data_dir, exist_ok=True)

    # Charger le dataset Iris
    iris = load_iris()
    df = pd.DataFrame(data=iris.data, columns=iris.feature_names)
    df['target'] = iris.target

    file_path = os.path.join(data_dir, "iris.csv")

    df.to_csv(file_path, index=False)
    print(f"Données sauvegardées : {file_path}")

    return file_path

```

---

## **2️⃣ Étape 2 - Entraînement du modèle**
**📌 Objectif :** Entraîner un modèle `RandomForestClassifier` et sauvegarder le modèle.

📍 **Fichier : `src/training.py`**
```python {.copy}
import os
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

def train_model():
    print("Entraînement du modèle...")

    data= os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/iris.csv"))

    if not os.path.exists(data):
        raise FileNotFoundError(f"{data} introuvable. Exécute preprocessing.py")

    models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../models"))
    os.makedirs(models_dir, exist_ok=True)  

    df = pd.read_csv(data)
    X = df.drop(columns=["target"])
    y = df["target"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    model_file_path = os.path.join(models_dir, "model.pkl")

    joblib.dump(model, model_file_path)
    print(f"Modèle sauvegardé : {model_file_path}")

```

---

## **3️⃣ Étape 3 - Évaluation du modèle**
**📌 Objectif :** Calculer la précision du modèle et sauvegarder le score.

📍 **Fichier : `src/evaluation.py`**
```python {.copy}
import os
import pandas as pd
import joblib
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

def evaluate_model():
    print("Évaluation du modèle...")

    data = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/iris.csv"))
    model = os.path.abspath(os.path.join(os.path.dirname(__file__), "../models/model.pkl"))

    # Vérifier si les fichiers existent
    if not os.path.exists(data):
        raise FileNotFoundError(f"{data} introuvable. Exécuter preprocessing.py")
    
    if not os.path.exists(model):
        raise FileNotFoundError(f"{model} introuvable. Exécuter train_model.py")

    # Charger les données
    df = pd.read_csv(data)
    X = df.drop(columns=["target"])
    y = df["target"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = joblib.load(model)

    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)
    print(f"Précision du modèle : {accuracy:.4f}")

    return accuracy

```

---

## **4️⃣ Étape 4 - DAG Airflow**
📍 **Fichier : `dags/mlops_pipeline.py`**
```python {.copy}
import logging
from datetime import datetime, timedelta
from airflow.models.dag import DAG
from airflow.operators.python import PythonOperator

from src.preprocessing import preprocess_data
from src.training import train_model
from src.evaluation import evaluate_model


default_args = {
    'owner': 'mlops-airflow',
    'retries': 1,
    'retry_delay': timedelta(minutes=10),
    'start_date': datetime.now(),
}

dag = DAG('mlops_pipeline',
    # À compléter
)

task_1 = PythonOperator(
    # À compléter
)

task_2 = PythonOperator(
    # À compléter
)

task_3 = PythonOperator(
    # À compléter
)

task_1 >> # À compléter 
task_1 << # À compléter
```



??? example "Afficher la solution"
    ```python {.copy}
    import logging
    from datetime import datetime, timedelta
    from airflow.models.dag import DAG
    from airflow.operators.python import PythonOperator

    from src.preprocessing import preprocess_data
    from src.training import train_model
    from src.evaluation import evaluate_model


    default_args = {
        'owner': 'mlops-airflow',
        'retries': 1,
        'retry_delay': timedelta(minutes=10),
        'start_date': datetime.now(),
    }

    dag = DAG('mlops_pipeline',
            default_args=default_args,
            schedule_interval=timedelta(days=1),
            catchup=False
    )

    task_1 = PythonOperator(
        task_id='preprocess_data',
        python_callable=preprocess_data,
        dag=dag
    )

    task_2 = PythonOperator(
        task_id='train_model',
        python_callable=train_model,
        dag=dag
    )

    task_3 = PythonOperator(
        task_id='evaluate_model',
        python_callable=evaluate_model,
        dag=dag
    )

    task_1 >> task_2 >> task_3
    ```

---

## **5️⃣ Lancer le pipeline**
1️⃣ **Démarrer Airflow avec Docker**

<span style="color:red">Modifier la ligne 71 du `docker-compose.yml` pour ajouter les dépendances : :</span>

<span style="color:red">
```yaml {.copy}
    _PIP_ADDITIONAL_REQUIREMENTS: ${_PIP_ADDITIONAL_REQUIREMENTS:- pandas requests scikit-learn numpy logging}
```
</span>

```sh  {.copy}
docker-compose up
```

2️⃣ **Accéder à Airflow**

- Ouvrir **http://localhost:8080**
- Activer et exécuter le DAG `mlops_pipeline`

---

## **6️⃣ Génération du rapport**

Maintenant qu'on a `accuracy`, nous allons générer un rapport contenant cette métrique.

### **📌 Objectif : Générer un rapport avec l'accuracy**

📍 **Fichier : `src/generate_report.py`**

```python {.copy}
import os

def generate_report(**kwargs):
    ti = kwargs['ti']  # Récupérer l'accuracy depuis XCom
    accuracy = ti.xcom_pull(task_ids='evaluate_model', key='accuracy')
    
    if accuracy is None:
        raise ValueError("L'accuracy n'a pas été trouvée dans XCom.")
    
    report_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../report"))
    os.makedirs(report_dir, exist_ok=True)
    
    report_content = f"""
    # Rapport d'Évaluation du Modèle

    **Accuracy**: {accuracy}
    
    **Commentaire**: Le modèle a atteint une accuracy de {accuracy}.
    """
    
    report_path = os.path.join(report_dir, "model_accuracy_report.md")
    with open(report_path, "w") as file:
        file.write(report_content)
    
    return report_path
```
Nous avons ajouté la génération du rapport, nous devons mettre à jour le **DAG** pour inclure cette nouvelle tâche.

📍 **Fichier : `mlops_pipeline.py`**

```python  {.copy}
from src.generate_report import generate_report

task_4 = PythonOperator(
    # À compléter
)

task_3 >> task_4
```

??? success "Solution complète"
    ```python  {.copy}
    from src.generate_report import generate_report

    task_4 = PythonOperator(
        task_id='generate_report',
        python_callable=generate_report,
        provide_context=True,
        dag=dag
    )

    task_3 >> task_4
    ```


Pour s'assurer `evaluate_model`  envoie correctement l'accuracy et que `task_3` récupère bien la valeur transmise, on doit faire certaine modification.

### **📌 Modification de `evaluate_model.py` pour envoyer correctement l'accuracy**

Dans **`src/evaluation.py`**, nous devons nous assurer que l'accuracy est bien stockée dans XCom et récupérable par les tâches suivantes.

📍 **Fichier : `src/evaluation.py`**
```python  {.copy}
import os
import pandas as pd
import joblib
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

def evaluate_model(**kwargs):
    print("Évaluation du modèle...")

    data = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/iris.csv"))
    model = os.path.abspath(os.path.join(os.path.dirname(__file__), "../models/model.pkl"))

    # Vérifier si les fichiers existent
    if not os.path.exists(data):
        raise FileNotFoundError(f"{data} introuvable. Exécuter preprocessing.py")
    
    if not os.path.exists(model):
        raise FileNotFoundError(f"{model} introuvable. Exécuter train_model.py")

    # Charger les données
    df = pd.read_csv(data)
    X = df.drop(columns=["target"])
    y = df["target"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = joblib.load(model)

    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)
    print(f"Précision du modèle : {accuracy:.4f}")

    ti = kwargs['ti']  
    ti.xcom_push(key='accuracy', value=accuracy)

    return accuracy
```

### **📌 Modifier `task_3` dans `mlops_pipeline.py` pour recevoir les données correctement**

Dans **`mlops_pipeline.py`**, nous devons nous assurer que `task_3` (évaluation) est bien configuré pour recevoir et transmettre les données.

📍 **Fichier : `mlops_pipeline.py`**

```python  {.copy}
from src.evaluation import evaluate_model

task_3 = PythonOperator(
    task_id='evaluate_model',
    # À compléter
)
```
??? success "Solution complète"
    ```python  {.copy}
    from src.evaluation import evaluate_model

    task_3 = PythonOperator(
        task_id='evaluate_model',
        python_callable=evaluate_model,
        provide_context=True,  # ✅ Assurer le passage des données via XCom
        dag=dag
    )
    ```

Une fois ces modifications effectuées, `evaluate_model` enverra correctement l'accuracy, et `task_3` récupérera et transmettra bien les données pour `generate_report`.





