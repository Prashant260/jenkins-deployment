pipeline {
    agent any

    environment {
        IMAGE_NAME = 'jenkins-fullstack-app'
        CONTAINER_NAME = 'jenkins-fullstack-app-test'
        APP_PORT = '3000'
       
    }

    tools {
        sonarQubeScanner 'sonar-scanner'
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
                    sonar-scanner \
                    -Dsonar.projectKey=jenkins-fullstack-app \
                    -Dsonar.sources=.
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_NAME:$BUILD_NUMBER .'
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