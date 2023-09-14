import os
import openai
from dotenv import load_dotenv
from flask import Flask, render_template, request, Response

# Va chercher le .env
load_dotenv()


# Création d'une instance de Flask avec le nom de notre module (app.py __name__)
app = Flask(__name__)

openai.api_key = os.getenv("OPENAI_API_KEY")


@app.route("/")
def home():
    return render_template('index.html')


@app.route("/prompt", methods=["POST"])
def prompt():
    # Les messages envoyés depuis le front dans un json
    messages = request.json['messages']
    # Créer la conversation avec notre fonction
    conversation = build_conversation_dict(messages=messages)
    # Utiliser pour générer la réponse avec openAI
    # Une réponse stream donc on change le mimetype

    return Response(event_stream(conversation), mimetype='text/event-stream')


def event_stream(conversation: list[dict]) -> str:
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=conversation,
        stream=True
    )

    for line in response:
        # Aller chercher le contenu du message
        text = line.choices[0].delta.get('content', '')
        if len(text):
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
    app.run(debug=True, host='127.0.0.1', port=5000)
