async function vote(first) {
    // Если мы находимся на странице сервера (мы не можем напрямую попасть на страницу голосования по одному только URL)
    if (document.querySelector('form[action="vote.php"] input[name="vote"]')) {
        document.querySelector('form[action="vote.php"] input[name="vote"]').click()
        return
    }

    if (document.querySelector('#info').style.display) {
        const message = document.querySelector('#info').innerText.trim()
        if (message.includes('vote a été comptabilisé')) {
            chrome.runtime.sendMessage({successfully: true})
        } else if (message.includes('avez déjà voté')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message})
        }
        return
    }

    document.querySelector('form input[name="user"]').scrollIntoView({block: 'center'})

    if (first) return

    const project = await getProject()
    document.querySelector('form input[name="user"]').value = project.nick
    document.querySelector('form input[type="submit"][name="voter"]').click()
}