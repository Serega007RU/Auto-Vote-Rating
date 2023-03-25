async function vote(first) {
    if (document.querySelector('.done_present')) {
        const message = document.querySelector('.done_present').textContent.trim()
        if (message.includes('уже получен')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message})
        }
        return
    }
}