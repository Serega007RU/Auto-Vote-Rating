function vote(first) {
    if (document.querySelector('span[style="font-size:20px;color:red;"]')) {
        const message = document.querySelector('span[style="font-size:20px;color:red;"]').textContent
        if (message.includes('Captcha incorrect')) {
            // None
        } else {
            chrome.runtime.sendMessage({message})
            return
        }
    }

    if (document.querySelector('.div-page .div-box center')?.innerText?.trim()?.length > 5) {
        const request = {}
        request.message = document.querySelector('.div-page .div-box center').innerText.trim()
        if (request.message.includes('avez effectué trop de tentative de vote pour')) {
            request.ignoreReport = true
        }
        chrome.runtime.sendMessage(request)
        return
    }

    if (document.querySelector('b.page-spacer')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }

    if (first) return

    document.getElementById('postbut').click()
}