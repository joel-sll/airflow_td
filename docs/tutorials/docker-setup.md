# Docker Setup for Airflow

This tutorial outlines the steps to set up Docker for running Apache Airflow. Follow the instructions below to get started.

## Prerequisites

- Ensure you have Docker installed on your machine. You can download it from [Docker's official website](https://www.docker.com/get-started).

## Step 1: Pull the Airflow Docker Image

Open your terminal and run the following command to pull the official Airflow image:

```bash
docker pull apache/airflow:2.5.0
```

## Step 2: Create a Docker Compose File

Create a file named `docker-compose.yml` in your project directory with the following content:

```yaml
version: '3'
services:
  airflow-webserver:
    image: apache/airflow:2.5.0
    restart: always
    environment:
      - AIRFLOW__CORE__EXECUTOR=LocalExecutor
    ports:
      - "8080:8080"
    volumes:
      - ./dags:/usr/local/airflow/dags
      - ./logs:/usr/local/airflow/logs
      - ./plugins:/usr/local/airflow/plugins

  airflow-scheduler:
    image: apache/airflow:2.5.0
    restart: always
    depends_on:
      - airflow-webserver
    environment:
      - AIRFLOW__CORE__EXECUTOR=LocalExecutor
    volumes:
      - ./dags:/usr/local/airflow/dags
      - ./logs:/usr/local/airflow/logs
      - ./plugins:/usr/local/airflow/plugins
```

## Step 3: Start Airflow

In your terminal, navigate to the directory containing the `docker-compose.yml` file and run:

```bash
docker-compose up
```

This command will start the Airflow web server and scheduler.

## Step 4: Access the Airflow UI

Once the services are up and running, you can access the Airflow UI by navigating to `http://localhost:8080` in your web browser.

## Conclusion

You have successfully set up Docker for running Apache Airflow. You can now proceed to create your DAGs and start building your data pipelines.