function cloneAnswerBlock() {
    const output = document.querySelector("#gpt-output");
    const template = document.querySelector('#chat-template');
    const clone = template.cloneNode(true);
    /* supprimer l'id du template que l'on clone, ici #chat-template */
    clone.id = "";
    output.appendChild(clone);
    /* supprimer le hiden pour afficher la div */
    clone.classList.remove("hidden")
    return clone.querySelector(".message");
}

function addToLog(message) {
    const answerBlock = cloneAnswerBlock();
    answerBlock.innerText = message;
    return answerBlock;
}

function getChatHistory() {
    /* on ne récupère que .message et pas ceux qui ont #chat-template */
    const messageBlocks = document.querySelectorAll(".message:not(#chat-template .message)");
    /* C'est un peu comme si je faisais une compréhension de liste
     innerText ne récupère que le texte sans être interprété
     innerHTML récupère le text et le HTML avec
     */
    return Array.from(messageBlocks).map(block => block.innerHTML);
}


async function fetchPromptResponse() {
    const response = await fetch("/prompt", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"messages": getChatHistory()})
    })

    return response.body.getReader()
}


/* Récupère le lecteur */
async function readResponseChunks(reader, answerBlock) {
    /* Ce qui va être envoyé depuis le back c'est des Bytes il faut donc décoder */
    const decoder = new TextDecoder();
    const converter = new showdown.Converter();

    let chunks = "";
    while (true) {
        const {done, value} = await reader.read();
        if (done) {
            break;
        }
        chunks += decoder.decode(value);
        answerBlock.innerHTML = converter.makeHtml(chunks);
    }
}

/* Ecouteur d'évènements Listener */
document.addEventListener("DOMContentLoaded", () => {
    /* DOMContentLoaded quand dom est généré */
    /* Récupère le formulaire */
    const form = document.querySelector("#prompt-form");
    /* Récumère les icônes */
    const spinnerIcon = document.querySelector("#spinner-icon");
    const sendIcon = document.querySelector("#send-icon");

    /* Autre écouteur sur le submit du form */
    form.addEventListener("submit", async (event) => {
        /* Empêche soumission par defaut */
        event.preventDefault();
        /* Changer les icônes */
        spinnerIcon.classList.remove("hidden");
        sendIcon.classList.add("hidden");

        /* prompt utilisateur (form ligne 33) */
        const prompt = form.elements.prompt.value;
        form.elements.prompt.value = "";
        /* Envoyer le prompt a addToLog */
        addToLog(prompt);

        /* On essaye */
        try {
            const answerBlock = addToLog("GPT est en train de réfléchir...");
            const reader = await fetchPromptResponse(prompt);
            await readResponseChunks(reader, answerBlock);
            /* Si problème */
        } catch (error) {
            console.error('Une erreur est survenue:', error);
            /* finally Si tout se passe bien */
        } finally {
            spinnerIcon.classList.add("hidden");
            sendIcon.classList.remove("hidden");
            hljs.highlightAll();
        }
    });
});