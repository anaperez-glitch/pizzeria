pipeline {
    agent any

    environment {
        SONARQUBE = 'sonarqube'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/anaperez-glitch/pizzeria.git'
            }
        }

        stage('Validación') {
            steps {
                sh 'echo "Ejecutando pruebas/linter..."'
            }
        }

        stage('Build') {
            steps {
                sh 'echo "Construyendo la web (HTML/CSS/JS)..."'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    echo "Copiando archivos al volumen compartido..."
                    rm -rf /web/*           # Limpia el contenido anterior
                    cp -r Pizzeria/* /web/  # Copia la nueva versión
                    echo "Deploy completado!"
                '''
            }
        }

    }  // <-- cierre de stages

}  // <-- cierre de pipeline
