Commençons par un classique de l'informatique : Hello world !

L'idée ici est de créer un DAG qui automatisera le lancement de notre fonction helloworld.

### Etape 1 : Ecrire la fonction helloworld
```python
def helloworld():
    print("Hello, World!")
```

### Etape 2 : Instancier le DAG
Un DAG doit **obligatoirement** avoir les arguments suivants :

- *dag_id* : est une chaine de caractère sans espaces.
- *schedule_interval* : est une chaine de caractère, un objet timedelta ou None. ([Voir ici](https://airflow.apache.org/docs/apache-airflow/1.10.1/scheduler.html#dag-runs))
- *start_date* : est un objet datetime qui contient la date de première exécution.

```python
with DAG(
    dag_id='hello-world',
    schedule_interval='@daily',
    start_date= datetime(2023, 1, 1),
) as dag:
```

Le DAG ci-dessus s'appelle "hello-world". Il est prévu qu'il s'exécute chaque jour (`schedule_interval='@daily'`) à partir du 1er janvier 2023.

### Etape 3 : Associer la fonction au DAG
Pour associer la fonction *helloworld* au DAG, il faut écrire une tache.

```python
hello_task = PythonOperator(
	task_id='hello_task',
	python_callable=helloworld
)
```
On instancie un objet PythonOperator qui utilise l'identifiant *hello_task* (`task_id='hello_task'`) et appelle la fonction *helloworld* (`python_callable=helloworld`).

### Etape 4 : On rassemble chaque étape !

Pour fonctionner, il faut également inclure les importations requises. Au final, notre dag va ressembler à ceci :

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

def helloworld():
    print("Hello World")

with DAG(
    dag_id='PythonOperator_hello-world',
    schedule_interval='@daily',
    start_date= datetime(2023, 1, 1),
) as dag:
    
    hello_task = PythonOperator(
        task_id='hello_task',
        python_callable=helloworld
    )
```

Une fois le DAG chargé dans Airflow, vous pouvez le retrouver dans la liste :
![DAG helloworld](./image/helloworld_UI1.PNG)

Il ne reste plus qu'à l'activer en cliquant sur le bouton à gauche.

### Etape 5 : Observer le fonctionnement du DAG

Observez les indicateurs d'exécution puis cliquez sur le DAG et explorez l'interface.
??? info "Indicateurs d'exécution"

	![DAG helloworld](./image/helloworld_exec1.PNG)

Tout se passe-t-il vous l'auriez prévu ?

??? warning
	
	![DAG helloworld](./image/helloworld_exec2.PNG)
	Votre DAG est programmé pour s'exécuter chaque jour mais il s'est exécuté plusieurs fois ! (68 fois dans la capture ci-dessus). Pourquoi ?
	
	??? tip 
		
		![DAG helloworld](./image/helloworld_exec3.PNG)
		
		Lorsque nous avons défini le DAG, nous lui avons donné comme date de première exécution le 1er janvier 2023. Par défaut, Airflow exécute un DAG depuis la date de 1ère exécution jusqu'à la date courante en respectant l'intervalle donné dans l'argument *schedule_interval*. Pour prévenir ce comportement, il faut utiliser l'argument *catchup* avec la valeur `False`lors de la définition du DAG.
		```python
		from airflow import DAG
		from airflow.operators.python import PythonOperator
		from datetime import datetime

		def helloworld():
			print("Hello World")

		with DAG(
			dag_id='PythonOperator_hello-world',
			schedule_interval='@daily',
			start_date= datetime(2023, 1, 1),
			catchup= False
		) as dag:
			
			hello_task = PythonOperator(
				task_id='hello_task',
				python_callable=helloworld
			)
		```

??? tip "Difficile de retrouver votre DAG dans l'interface d'Airflow ?"
	
	Pour retrouver plus facilement votre DAG dans l'interface, vous pouvez utiliser l'argument *owner* de l'objet DAG :
	
			```python
		from airflow import DAG
		from airflow.operators.python import PythonOperator
		from datetime import datetime

		def helloworld():
			print("Hello World")

		with DAG(
			dag_id='PythonOperator_hello-world',
			schedule_interval='@daily',
			start_date= datetime(2023, 1, 1),
			owner= "Joel"
		) as dag:
			
			hello_task = PythonOperator(
				task_id='hello_task',
				python_callable=helloworld
			)
		```
		
	Vous pouvez alors trier les DAG disponibles par Owner.
	
	![owner attribute](./image/owner.PNG)

??? tip "Beaucoup de DAG à définir ?"
	Si vous avez plusieurs DAG dans votre fichier, vous pouvez regrouper les arguments en commun dans un dictionnaire et utiliser l'argument *default_args* de l'objet DAG.
	
	```python
	default_args = {
    "owner": "Joel",
	schedule_interval='@daily',
	start_date= datetime(2023, 1, 1)
	}
	
	with DAG(
			dag_id='PythonOperator_hello-world'
			default_args= default_args
		) as dag:
	```