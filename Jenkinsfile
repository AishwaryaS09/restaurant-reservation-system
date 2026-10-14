
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
stage('Build Kubernetes Images') {
    steps {
        sh '''
            set -e

            docker build -t dinesync-backend:build-${BUILD_NUMBER} ./backend

            docker build \
                -f frontend/Dockerfile.k8s \
                -t dinesync-frontend:build-${BUILD_NUMBER} \
                ./frontend

            echo "Versioned Kubernetes images built!"
        '''
    }
}
stage('Load Images into Minikube') {
    steps {
        sh '''#!/bin/bash
    set -eo pipefail

            docker save dinesync-backend:build-${BUILD_NUMBER} |
                docker exec -i --user root minikube \
                ctr -n k8s.io images import -

            docker save dinesync-frontend:build-${BUILD_NUMBER} |
                docker exec -i --user root minikube \
                ctr -n k8s.io images import -

            echo "Versioned images loaded into Minikube!"
        '''
    }
}
stage('Deploy to Kubernetes') {
    steps {
        sh '''
            set -e

            KUBECTL="/var/lib/minikube/binaries/v1.37.0/kubectl"
            KUBECONFIG="/etc/kubernetes/admin.conf"

            docker exec --user root minikube \
                "$KUBECTL" --kubeconfig="$KUBECONFIG" \
                set image deployment/dinesync-backend \
                backend=dinesync-backend:build-${BUILD_NUMBER}

            docker exec --user root minikube \
                "$KUBECTL" --kubeconfig="$KUBECONFIG" \
                set image deployment/dinesync-frontend \
                frontend=dinesync-frontend:build-${BUILD_NUMBER}

            echo "Kubernetes deployment images updated!"
        '''
    }
}
stage('Verify Kubernetes Deployment') {
    steps {
        sh '''
            set -e

            KUBECTL="/var/lib/minikube/binaries/v1.37.0/kubectl"
            KUBECONFIG="/etc/kubernetes/admin.conf"

            docker exec --user root minikube \
                "$KUBECTL" --kubeconfig="$KUBECONFIG" \
                rollout status deployment/dinesync-backend --timeout=180s

            docker exec --user root minikube \
                "$KUBECTL" --kubeconfig="$KUBECONFIG" \
                rollout status deployment/dinesync-frontend --timeout=180s

            echo "Both Kubernetes deployments are healthy!"
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
