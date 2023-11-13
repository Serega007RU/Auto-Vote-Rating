async function vote(first) {
    if (document.querySelector('p.text-success')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }

    if (document.querySelector('div.container div.p-3 h2')?.parentElement?.textContent.includes('can vote again in')) {
        chrome.runtime.sendMessage({later: true})
        return
    }

    if (document.querySelector('p.text-danger')) {
        const request = {}
        request.message = document.querySelector('p.text-danger').innerText
        if (request.message.includes('Captcha was solved incorrectly')) {
            // None
        } else if (request.message.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
            return
        } else {
            chrome.runtime.sendMessage(request)
            return
        }
    }

    const project = await getProject()
    if (document.querySelector('form input[name="username"]')) {
        document.querySelector('form input[name="username"]').value = project.nick
    }

    if (first) {
        chrome.runtime.sendMessage({captcha: true})
    }

    // document.querySelector('form input[type="submit"]').click()
}