pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/anaperez-glitch/pizzeria.git'
            }
        }

        stage('Validación') {
            steps {
                sh 'echo "Ejecutando validaciones básicas..."'
            }
        }

        stage('Build') {
            steps {
                sh 'echo "Construyendo la web (HTML/CSS/JS)..."'
            }
        }

        stage('Deploy') {
            steps {
                sh 'echo "Copiando archivos al volumen de Nginx..."'
                sh 'cp -r * /web/'
                sh 'docker restart app_web'
            }
        }
    }
}
