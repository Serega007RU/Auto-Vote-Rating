async function vote(/*first*/) {
    if (document.querySelector('.success.message') && (document.querySelector('.success.message').textContent.includes('vote a bien été comptabilisé') || document.querySelector('.success.message').textContent.includes('vote a été compté'))) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('.error.message')) {
        if (document.querySelector('.error.message').textContent.includes('devez attendre jusqu')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('.error.message').innerText.trim()})
        }
        return
    }

    const project = await getProject('ServeurMinecraftFr')
    if (document.querySelector('#main-content input[name="username"]')) document.querySelector('#main-content input[name="username"]').value = project.nick
    chrome.runtime.sendMessage({captcha: true})
}