# 🚀 Étape 1 : Installation d'Apache Airflow sous Windows avec Docker

## 📌 Prérequis
Avant d'installer Apache Airflow, assurez-vous d'avoir :

- **Docker Desktop** installé et en cours d'exécution ([Télécharger ici](https://www.docker.com/products/docker-desktop/))

- [Docs ](https://docs.google.com/document/d/10hvqWLw7EDXJAnFEIWpX1HkxQQksT4OaeNZuaYJ5DHM/edit?tab=t.0)
---

## 🚀 Étape 1 : Créer un dossier pour Airflow
Dans un terminal, exécutez :

```command
mkdir airflow-docker
cd airflow-docker
```

---

## 📥 Étape 2 : Télécharger le fichier `docker-compose.yaml`

Dans PowerShell ou Git Bash :

```command
curl -LO https://airflow.apache.org/docs/apache-airflow/stable/docker-compose.yaml
```

Si `curl` ne fonctionne pas, téléchargez le fichier manuellement depuis :  
🔗 [Lien de téléchargement](https://airflow.apache.org/docs/apache-airflow/stable/docker-compose.yaml)

<span style="color:red">Modifier la ligne 71 du `docker-compose.yml` pour ajouter les dépendances : :</span>

<span style="color:red">
```yaml {.copy}
    _PIP_ADDITIONAL_REQUIREMENTS: ${_PIP_ADDITIONAL_REQUIREMENTS:- pandas requests scikit-learn numpy logging}
```
</span>
---

## 📂 Étape 3 : Créer les dossiers nécessaires

Exécutez la commande suivante pour créer les répertoires (ou dossier) :
```command
mkdir dags, logs, plugins, data
```

Si PowerShell ne supporte pas plusieurs dossiers, exécutez-les séparément :
```command
mkdir dags
mkdir logs
mkdir plugins
mkdir data
```

---

## 🛠️ Étape 4 : Configurer les variables d'environnement

Sous terminal vsCode :
```command 
Set-Content .env "AIRFLOW_UID=50000`nAIRFLOW_GID=0"
```

Vérifiez que le fichier `.env` est bien créé avec :
```command
Get-Content .env
```
Vous devriez voir :
```
AIRFLOW_UID=50000
AIRFLOW_GID=0
```

---

## 🏗️ Étape 5 : Initialiser Airflow

Exécutez la commande suivante pour initialiser la base de données d'Airflow :
```command 
docker-compose up airflow-init
```

---

## ▶️ Étape 6 : Lancer Airflow

Une fois l'initialisation terminée, démarrez Airflow avec :
```command 
docker-compose up
```

Airflow sera accessible à l'adresse :  
🔗 **http://localhost:8080**

Par défaut, les identifiants sont :

  - **Utilisateur** : `airflow`
  - **Mot de passe** : `airflow`

---

## 🛑 Étape 7 : Arrêter Airflow

Si vous souhaitez arrêter Airflow, utilisez :
```command
docker-compose down
```

Pour tout redémarrer plus tard :
```command
docker-compose up
```

---

## 🔄 Étape 8 : Nettoyage et suppression des containers

Si vous souhaitez **réinitialiser complètement** Airflow, exécutez :
```command
docker-compose down --volumes --remove-orphans
```
Cela supprimera les volumes liés à Airflow.

---

## 🎯 Résumé des commandes importantes
| Commande | Description |
|----------|------------|
| `mkdir dags logs plugins` | Crée les dossiers nécessaires |
| `curl -LO ...` | Télécharge le fichier docker-compose.yaml |
| `Set-Content .env ...` | Configure les variables d'environnement |
| `docker-compose up airflow-init` | Initialise Airflow |
| `docker-compose up` | Démarre Airflow |
| `docker-compose down` | Arrête Airflow |
| `docker-compose down --volumes --remove-orphans` | Supprime tous les volumes Airflow |

---
<span style="color:green">
✨ **Airflow est maintenant installé et opérationnel sous Windows !** 🚀
</span>

