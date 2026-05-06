# Jenkins Full Stack App

A small full-stack Node.js application used to practice CI/CD with Jenkins,
Docker, SonarQube, DockerHub, and Minikube.

## Project Structure

```text
.
|-- app.js
|-- Dockerfile
|-- Jenkinsfile
|-- package.json
|-- sonar-project.properties
|-- public/
|   |-- index.html
|   |-- script.js
|   `-- styles.css
`-- k8s/
    |-- deployment.yaml
    `-- service.yaml
```

## Features

- Node.js backend using the built-in `http` module
- Static frontend served from the `public` folder
- Health API endpoint
- Simple task API
- Docker image build
- SonarQube code scan from Jenkins
- DockerHub image push from Jenkins
- Minikube deployment using Kubernetes manifests

## API Endpoints

```text
GET  /api/health
GET  /api/tasks
POST /api/tasks
```

Example health check:

```bash
curl http://localhost:3000/api/health
```

## Run Locally

Install Node.js first, then run:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## Run With Docker

Build the Docker image:

```bash
docker build -t jenkins-fullstack-app .
```

Run the container:

```bash
docker run -d --name jenkins-fullstack-app -p 3000:3000 jenkins-fullstack-app
```

Open:

```text
http://localhost:3000
```

Stop the container:

```bash
docker rm -f jenkins-fullstack-app
```

## Jenkins Pipeline

The `Jenkinsfile` runs these stages:

```text
Checkout
SonarQube Analysis
Build Docker Image
Run Smoke Test
Push To DockerHub
Deploy To Minikube
```

Required Jenkins plugins:

```text
Git
Pipeline
Docker Pipeline
SonarQube Scanner
Credentials
```

## Jenkins Credentials

Create DockerHub credentials in Jenkins:

```text
Manage Jenkins -> Credentials -> Global -> Add Credentials
```

Use:

```text
Kind: Username with password
ID: dockerhub-creds
Username: your DockerHub username
Password: your DockerHub password or access token
```

## SonarQube Setup

Start SonarQube, for example:

```bash
docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community
```

Open:

```text
http://localhost:9000
```

In Jenkins, configure SonarQube:

```text
Manage Jenkins -> System -> SonarQube servers
Name: SonarQube
Server URL: http://your-sonarqube-server:9000
```

Configure SonarScanner:

```text
Manage Jenkins -> Tools -> SonarQube Scanner installations
Name: sonar-scanner
```

The scanner name must match the `Jenkinsfile`.

## Minikube Deployment

Start Minikube on the Jenkins server:

```bash
minikube start
```

Check the cluster:

```bash
kubectl get nodes
```

After Jenkins deploys the app, check:

```bash
kubectl get pods
kubectl get svc
```

Get Minikube IP:

```bash
minikube ip
```

Open the app:

```text
http://<minikube-ip>:30007
```

## Manual Kubernetes Deploy

If you want to deploy manually:

```bash
kubectl apply -f k8s/
kubectl get pods
kubectl get svc
```

## GitHub Webhook

Use this format for GitHub webhook payload URL:

```text
http://<jenkins-public-ip>:8080/job/<job-name>/build?token=<jenkins-trigger-token>
```

Content type:

```text
application/json
```

Event:

```text
Just the push event
```

## Notes

- Jenkins, Docker, Minikube, and `kubectl` should run on the same server for this simple setup.
- If Jenkins runs inside Docker, extra configuration is needed to access Docker and Minikube.
- The Kubernetes service uses NodePort `30007`.
