async function vote(first) {
    if (document.querySelector('div.success.message') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('div.error.message') != null) {
        if (document.querySelector('div.error.message').textContent.includes('Najbližšie môžeš hlasovať')) {
            // const numbers = document.querySelector('div.error.message').textContent.match(/\d+/g).map(Number)
            // chrome.runtime.sendMessage({later: new Date(numbers[0][1]...)})
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('div.error.message').textContent.trim()})
        }
        return
    }

    if (first) return

    const project = await getProject('MinecraftServerSk')
    document.querySelector('#main-content input[name="username"]').value = project.nick
    document.querySelector('#main-content button[name="submit"]').click()
}