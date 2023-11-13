async function vote(first) {
    if (document.querySelector('a[href*="/accounts/discord/login"]')) {
        document.querySelector('a[href*="/accounts/discord/login"]').click()
        return
    }

    if (document.querySelector('div[x-show="show"] section > div')?.textContent.includes('can vote again in')) {
        const message = document.querySelector('div[x-show="show"] section > div').textContent
        const numbers = message.match(/\d+/g).map(Number)
        chrome.runtime.sendMessage({later: Date.now() + ((numbers[0] + 1) * 60 * 60 * 1000)})
        return
    }

    if (document.querySelector('p[x-html="message.message"]')) {
        const request = {}
        request.message = document.querySelector('p[x-html="message.message"]').textContent
        if (request.message.includes('Successfully voted')) {
            chrome.runtime.sendMessage({successfully: true})
            return
        } else if (request.message.includes('Successfully signed in')) {
            // None
        } else {
            if (request.message.includes('must be in the server to vote')) {
                request.ignoreReport = true
            }
            chrome.runtime.sendMessage(request)
            return
        }
    }

    document.querySelector('section > form > button').click()
}