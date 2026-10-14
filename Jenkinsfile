
pipeline {
    agent {
        label 'dinesync-agent'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Node.js') {
            steps {
                sh 'node --version'
                sh 'npm --version'
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                }
            }
        }

        
        stage('Run Backend Tests') {
            steps {
                dir('backend') {
                    sh 'npm test'
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Build React Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Verify Build Output') {
            steps {
                sh '''
                    test -f frontend/dist/index.html
                    echo "React frontend build verified!"
                '''
            }
        }
        
stage('Verify Docker Access') {
    steps {
        sh 'docker version'
    }
}

stage('Build Backend Docker Image') {
    steps {
        sh 'docker build -t dinesync-backend:ci ./backend'
    }
}

stage('Build Frontend Docker Image') {
    steps {
        sh 'docker build -t dinesync-frontend:ci ./frontend'
    }
}

stage('Verify Docker Images') {
    steps {
        sh '''
            docker image inspect dinesync-backend:ci
            docker image inspect dinesync-frontend:ci
            echo "Both Docker images built successfully!"
        '''
    }
}

    }

    post {
        success {
            echo 'DineSync CI build completed successfully!'
        }

        failure {
            echo 'DineSync CI build failed. Check console output.'
        }
    }
}
