pipeline {
    agent any

    environment {
        IMAGE_NAME = 'prashant260/jenkins-fullstack-app'
        CONTAINER_NAME = 'jenkins-fullstack-app-test'
        APP_PORT = '3000'
        SONAR_SCANNER_HOME = tool 'sonar-scanner'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {

                withSonarQubeEnv('SonarQube') {

                    sh '''
                    $SONAR_SCANNER_HOME/bin/sonar-scanner \
                    -Dsonar.projectKey=jenkins-fullstack-app \
                    -Dsonar.sources=.
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {

                sh '''
                docker build \
                -t $IMAGE_NAME:$BUILD_NUMBER \
                -t $IMAGE_NAME:latest .
                '''
            }
        }

        stage('Run Smoke Test') {
            steps {

                sh '''
                docker rm -f $CONTAINER_NAME || true

                docker run -d \
                --name $CONTAINER_NAME \
                -p $APP_PORT:3000 \
                $IMAGE_NAME:$BUILD_NUMBER

                sleep 10

                curl --fail http://localhost:$APP_PORT/api/health
                '''
            }
        }

        stage('Push To DockerHub') {
            steps {

                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {

                    sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                    docker push $IMAGE_NAME:$BUILD_NUMBER
                    docker push $IMAGE_NAME:latest
                    '''
                }
            }
        }

        stage('Deploy To Minikube') {
            steps {
                sh '''
                kubectl apply -f k8s/
                kubectl set image deployment/jenkins-fullstack-app \
                jenkins-fullstack-app=$IMAGE_NAME:$BUILD_NUMBER
                kubectl rollout status deployment/jenkins-fullstack-app --timeout=120s
                '''
            }
        }
    }

    post {

        always {
            sh 'docker rm -f $CONTAINER_NAME || true'
        }

        success {
            echo 'Pipeline completed successfully'
        }

        failure {
            echo 'Pipeline failed'
        }
    }
}
