async function vote(first) {
    const text = document.querySelector('#vote i')?.parentElement?.innerText
    if (text != null && text.length > 0) {
        if (text.includes('hast erfolgreich')) {
            chrome.runtime.sendMessage({successfully: true})
        } else if (text.includes('hast heute schon')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message: text.trim()})
        }
        return
    }

    const project = await getProject('ServerListe')
    document.querySelector('input[name="username"]').value = project.nick
    document.querySelector('button[data-callback="submitVoteForm"]').click()
}