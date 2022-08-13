async function vote(/*first*/) {
    if (document.querySelector('.success.message')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('.error.message')) {
        if (document.querySelector('.error.message').textContent.includes('must wait')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('.error.message').innerText.trim()})
        }
        return
    }

    const project = await getProject('MinecraftBestServersCom')
    document.querySelector('#main-content input[name="username"]').value = project.nick
    chrome.runtime.sendMessage({captcha: true})
}