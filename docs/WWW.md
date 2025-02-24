# 🆘 Aide à l'installation de Docker et gestion des erreurs de modules dans Apache Airflow


### 📌 La méthode la plus simple
La façon la plus simple d’ajouter vos dépendances est de modifier le fichier `docker-compose.yaml`. 

  - **Étape 1** : Rendez-vous à la **ligne 71** du fichier `docker-compose.yaml`.
  - **Étape 2** : Ajoutez tous les modules Python dont vous avez besoin à la variable `_PIP_ADDITIONAL_REQUIREMENTS`.

Cependant, pour une gestion plus propre et plus professionnelle des dépendances, il est recommandé d’adopter une approche plus robuste en construisant une image Docker personnalisée.

🔗 **Pour en savoir plus sur la bonne manière de gérer les dépendances, consultez la documentation officielle d'Airflow :**  
[Airflow Docker Customization][def]

---

### 🚀 Installation propre des dépendances avec Dockerfile

#### **Étape 1 : Créer un Dockerfile**
Afin de pouvoir installer les modules nécessaires via un fichier `requirements.txt`, commencez par créer un `Dockerfile` dans le même dossier que `docker-compose.yaml`.

Assurez-vous également d’avoir un fichier `requirements.txt` listant vos dépendances.

---

### ⚠️ **Attention aux dépendances spécifiques**
Certaines bibliothèques nécessitent des dépendances système spécifiques. 
Par exemple, `scikit-learn` a besoin de `gcc`, `g++`, `make` et `python3-dev` pour être compilé correctement.

Ajoutez donc ces dépendances dans le `Dockerfile` avant d'installer `requirements.txt` :

```dockerfile
FROM apache/airflow:2.10.5

USER root

RUN apt-get update && apt-get install -y \
    gcc g++ make python3-dev

USER airflow

COPY requirements.txt /requirements.txt

RUN pip install --no-cache-dir "apache-airflow==${AIRFLOW_VERSION}" -r /requirements.txt

```

#### **Étape 2 : Modifier le `docker-compose.yaml`**

Dans le fichier `docker-compose.yaml` :
- **Commentez** la ligne 52 :
  ```yaml
  # image: ${AIRFLOW_IMAGE_NAME:-apache/airflow:2.10.5}
  ```
- **Décommentez** la ligne 53 pour utiliser le Dockerfile que nous avons créé :
  ```yaml
  build: .
  ```

#### **Étape 3 : Construire et lancer les conteneurs**
Exécutez les commandes suivantes pour reconstruire et démarrer l’application :
```sh
docker-compose build
docker-compose up -d
```

Avec cette approche, votre environnement Airflow est bien configuré et prêt à exécuter des tâches avec toutes les dépendances requises. ✅

🎯 **Félicitations !** Tu as maintenant un pipeline MLOps complet avec **Airflow** pour **entraîner, évaluer et automatiser** un modèle de classification Iris ! 🚀

