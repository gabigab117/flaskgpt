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