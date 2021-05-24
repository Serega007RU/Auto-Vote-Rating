async function vote(first) {
    try {
        if (document.querySelector('article.message.is-success') != null && document.querySelector('article.message.is-success').textContent.includes('Úspěšně jste zahlasoval')) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
        if (document.querySelector('article.message.is-danger') != null) {
            if (document.querySelector('article.message.is-danger').textContent.includes('Hlasovat můžete až')) {
                chrome.runtime.sendMessage({later: Date.now() + 7200000})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('article.message.is-danger').textContent})
            }
            return
        }

        if (first) {
            document.getElementById('vote-modal').previousElementSibling.click()
            return
        }
        let project = await getProject('MinecraftServery')
        document.querySelector('input[name="nickname"]').value = project.nick
        document.querySelector('input[name="vote"]').click()
    } catch (e) {
        throwError(e)
    }
}