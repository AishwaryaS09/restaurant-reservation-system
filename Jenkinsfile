
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Project Structure') {
            steps {
                sh '''
                    test -f backend/package.json
                    test -f frontend/package.json
                    echo "DineSync project structure verified"
                '''
            }
        }

        stage('Verify Docker Configuration') {
            steps {
                sh '''
                    test -f backend/Dockerfile
                    test -f frontend/Dockerfile
                    test -f compose.yaml
                    echo "Docker configuration files verified"
                '''
            }
        }

        stage('Verify Git Commit') {
            steps {
                sh 'git log -1 --oneline'
            }
        }
    }

    post {
        success {
            echo 'DineSync CI validation completed successfully!'
        }
        failure {
            echo 'DineSync CI validation failed.'
        }
    }
}
