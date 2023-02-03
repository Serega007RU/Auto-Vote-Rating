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

    // TODO что-то этот сайт совсем умер, возможно даже сменились ссылки, подробнее в sentry, id: c4fdd5a51b5d445192e5740b00904a8a
    if (document.querySelector('div.text-center a[href="http://minecraftbestservers.com/"]')) {
        chrome.runtime.sendMessage({message: document.querySelector('div.text-center').innerText, ignoreReport: true})
        return
    }

    const project = await getProject('MinecraftBestServersCom')
    document.querySelector('#main-content input[name="username"]').value = project.nick
    chrome.runtime.sendMessage({captcha: true})
}