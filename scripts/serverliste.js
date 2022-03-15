async function vote(first) {
    if (document.querySelector('div.box.error') != null) {
        if (document.querySelector('div.box.error').textContent.includes('Du hast heute schon')) {
            chrome.runtime.sendMessage({later: true})
            return
        }
        chrome.runtime.sendMessage({message: document.querySelector('div.box.error').textContent})
        return
    }
    if (document.querySelector('div.box.success') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }

    if (first) return

    const project = await getProject('ServerListe')
    document.querySelector('input[name="spieler"]').value = project.nick
    document.querySelector('#vote_form a.button').click()
}