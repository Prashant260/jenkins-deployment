pipeline {
  agent any

  environment {
    IMAGE_NAME = 'jenkins-fullstack-app'
    CONTAINER_NAME = 'jenkins-fullstack-app-test'
    APP_PORT = '3000'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
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

  post {
    always {
      sh '''
        docker rm -f $CONTAINER_NAME || true
        docker image prune -f || true
      '''
    }

    success {
      echo 'Pipeline completed successfully.'
    }

    failure {
      echo 'Pipeline failed. Check the stage logs above.'
    }
  }
}
