async function vote(first) {
    if (first === false) return
    try {
        if (document.querySelector('#middlebb')) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }

        chrome.runtime.sendMessage({captcha: true})
    } catch (e) {
        throwError(e)
    }
}