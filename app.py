from flask import Flask, render_template


# Création d'une instance de Flask avec le nom de notre module (app.py __name__)
app = Flask(__name__)


@app.route("/")
def home():
    return render_template('index.html')


# Exécuter le code à l'intérieur de la structure conditionnelle uniquement quand on lance le fichier.
if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
