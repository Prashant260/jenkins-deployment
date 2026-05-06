pipeline {
  agent any

  environment {
    IMAGE_NAME = 'jenkins-fullstack-app'
    CONTAINER_NAME = 'jenkins-fullstack-app-test'
    APP_PORT = '3000'
    K8S_DEPLOYMENT = 'jenkins-fullstack-app'
    K8S_CONTAINER = 'jenkins-fullstack-app'
    SONAR_SCANNER_HOME = tool 'SonarScanner'
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
          sh '$SONAR_SCANNER_HOME/bin/sonar-scanner'
        }
      }
    }

    stage('SonarQube Quality Gate') {
      steps {
        timeout(time: 5, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
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
          docker run -d --name $CONTAINER_NAME -p $APP_PORT:3000 $IMAGE_NAME:$BUILD_NUMBER
          sleep 5
          curl --fail http://localhost:$APP_PORT/api/health
        '''
      }
    }
  }
}
   