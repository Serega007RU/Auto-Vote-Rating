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

    if (document.querySelector('b.page-spacer')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }

    if (first) return

    document.getElementById('postbut').click()
}