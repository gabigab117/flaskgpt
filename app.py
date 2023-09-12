import os
import openai
from dotenv import load_dotenv
from flask import Flask, render_template

# Va chercher le .env
load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

# Création d'une instance de Flask avec le nom de notre module (app.py __name__)
app = Flask(__name__)


@app.route("/")
def home():
    return render_template('index.html')


def event_stream(conversation: list[dict]) -> str:
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=conversation,
        stream=True
    )

    for line in response:
        # Aller chercher le contenu du message
        text = line.choices[0].delta.get('content', '')
        if text:
            # Est-ce que j'ai du texte ?
            # Pas de return mais un generateur : yield
            # Yield: ne pas tout charger dans la mémoire, lire 1 par 1
            yield text


# Créer la fonction avec en param la liste des échanges et retourne une liste de dictionnaires
def build_conversation_dict(messages: list) -> list[dict]:
    # On récupère l'indice avec i et enumerate. Si pair le reste est de 0 donc user
    return [
        {"role": "user" if i % 2 == 0 else "assistant", "content": message}
        for i, message in enumerate(messages)
    ]


# Exécuter le code à l'intérieur de la structure conditionnelle uniquement quand on lance le fichier.
# Si j'appelle app.py depuis un autre fichier le code ci-dessous ne s'exécute pas.
if __name__ == '__main__':
    # app.run(debug=True, host='127.0.0.1', port=5000)
    conversation = build_conversation_dict(["oui", "non", "bordel"])
    for line in event_stream(conversation):
        print(line)
