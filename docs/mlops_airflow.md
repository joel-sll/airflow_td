# 📌 Faisons un petit cas d'usage: Pipeline MLOps avec Airflow et Docker

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
│   ├── plugins/                   # Plugins Airflow si nécessaire
│   ├── logs/                       # Logs d'exécution
│   ├── docker-compose.yml          # Déploiement Docker
│   ├── requirements.txt            # Dépendances
│── src/                            # Code métier (prétraitement, entraînement...)
│   ├── preprocessing.py
│   ├── training.py
│   ├── evaluation.py
│── data/                           # Datasets si besoin
│   ├── data.csv
│── models/                         # Stockage des modèles entraînés
│── api/                            # API FastAPI pour servir le modèle
│   ├── app.py
```

---

## **1️⃣ Étape 1 - Prétraitement des données**
**📌 Objectif :** Charger et nettoyer les données Iris, puis les sauvegarder.

📍 **Fichier : `src/preprocessing.py`**
```python
import pandas as pd
from sklearn.datasets import load_iris

def preprocess_data():
    print("Prétraitement des données...")
    
    # Charger le dataset Iris
    iris = load_iris()
    df = pd.DataFrame(data=iris.data, columns=iris.feature_names)
    df['target'] = iris.target

    # Sauvegarder les données
    df.to_csv("data/iris.csv", index=False)
    print(" Données sauvegardées : data/iris.csv")

    return "data/iris.csv"
```

---

## **2️⃣ Étape 2 - Entraînement du modèle**
**📌 Objectif :** Entraîner un modèle `RandomForestClassifier` et sauvegarder le modèle.

📍 **Fichier : `src/training.py`**
```python
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

def train_model():
    print(" Entraînement du modèle...")

    # Charger les données
    df = pd.read_csv("data/iris.csv")
    X = df.drop(columns=["target"])
    y = df["target"]

    # Split train/test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Entraîner le modèle
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Sauvegarder le modèle
    joblib.dump(model, "models/model.pkl")
    print("Modèle sauvegardé : models/model.pkl")

    return "models/model.pkl"
```

---

## **3️⃣ Étape 3 - Évaluation du modèle**
**📌 Objectif :** Calculer la précision du modèle et sauvegarder le score.

📍 **Fichier : `src/evaluation.py`**
```python
import pandas as pd
import joblib
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

def evaluate_model():
    print(" Évaluation du modèle...")

    # Charger les données
    df = pd.read_csv("data/iris.csv")
    X = df.drop(columns=["target"])
    y = df["target"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Charger le modèle
    model = joblib.load("models/model.pkl")
    y_pred = model.predict(X_test)

    # Calculer la précision
    accuracy = accuracy_score(y_test, y_pred)
    print(f" Précision du modèle : {accuracy:.4f}")

    return accuracy
```

---

## **4️⃣ Étape 4 - DAG Airflow**
📍 **Fichier : `dags/mlops_pipeline.py`**
```python
import logging
from datetime import datetime, timedelta
from airflow.models.dag import DAG
from airflow.operators.python import PythonOperator
import sys
import os

# Ajoute src/ au PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

# Importation des fonctions
from preprocessing import preprocess_data
from training import train_model
from evaluation import evaluate_model

default_args = {
    'owner': 'airflow',
    'start_date': datetime(2025, 2, 23),
    'retries': 1,
}

with DAG('mlops_pipeline',
         default_args=default_args,
         schedule_interval='@daily',
         catchup=False) as dag:

    task_1 = PythonOperator(
        task_id='preprocess_data',
        python_callable=preprocess_data
    )

    task_2 = PythonOperator(
        task_id='train_model',
        python_callable=train_model
    )

    task_3 = PythonOperator(
        task_id='evaluate_model',
        python_callable=evaluate_model
    )

    task_1 >> task_2 >> task_3
```

---

## **5️⃣ Lancer le pipeline**
1️⃣ **Démarrer Airflow avec Docker**
```sh
docker-compose up -d
```

2️⃣ **Accéder à Airflow**
- Ouvrir **http://localhost:8080**
- Activer et exécuter le DAG `mlops_pipeline`

---

🎯 **Félicitations !** Tu as maintenant un pipeline MLOps complet avec **Airflow** pour **entraîner, évaluer et automatiser** un modèle de classification Iris ! 🚀
