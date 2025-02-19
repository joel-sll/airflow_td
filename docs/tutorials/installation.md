# Installation Instructions for Airflow with Docker

This document provides step-by-step instructions on how to install Apache Airflow using Docker.

## Prerequisites

Before you begin, ensure you have the following installed:

- Docker
- Docker Compose

## Step 1: Clone the Airflow Repository

Open your terminal and run the following command to clone the Airflow repository:

```bash
git clone https://github.com/apache/airflow.git
cd airflow
```

## Step 2: Create a Docker Compose File

Create a file named `docker-compose.yaml` in your project directory with the following content:

```yaml
version: '3'
services:
  airflow-webserver:
    image: apache/airflow:2.1.0
    restart: always
    environment:
      - AIRFLOW__CORE__EXECUTOR=LocalExecutor
    ports:
      - "8080:8080"
    volumes:
      - ./dags:/usr/local/airflow/dags
  airflow-scheduler:
    image: apache/airflow:2.1.0
    restart: always
    depends_on:
      - airflow-webserver
    environment:
      - AIRFLOW__CORE__EXECUTOR=LocalExecutor
```

## Step 3: Start Airflow

Run the following command to start Airflow:

```bash
docker-compose up -d
```

## Step 4: Access the Airflow UI

Open your web browser and navigate to `http://localhost:8080` to access the Airflow UI.

## Conclusion

You have successfully installed Apache Airflow using Docker. Proceed to the other tutorials for further instructions on setting up your data pipeline and monitoring.