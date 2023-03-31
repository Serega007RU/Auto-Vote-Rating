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

    document.querySelector('.gifts.choose .gifts__list').firstElementChild.click()
    document.querySelector('.bonus_buttons .btn').click()
}

const timer = setInterval(() => {
    const popup = document.querySelector('.popup')?.textContent
    if (popup) {
        clearInterval(timer)
        if (popup.toLocaleLowerCase().includes('подарок успешно')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
            chrome.runtime.sendMessage({message: popup})
        }
    }
}, 1000)