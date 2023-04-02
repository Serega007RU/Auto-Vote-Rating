async function vote(first) {
    if (!first) return

    await wait(5000) // TODO дикий костыль ожидающий загрузки страницы

    if (document.querySelector('div[class*="sign-list"] div[class*="sign-wrapper"]')) {
        document.querySelector('div[class*="sign-list"] div[class*="sign-wrapper"]').click()
    } else if (document.querySelector('div[class*="sign-list"] div[class*="has-signed"]')) {
        chrome.runtime.sendMessage({later: true})
    } else {
        chrome.runtime.sendMessage({errorVoteNoElement: 'not loaded page?'})
    }
}

const timer = setInterval(() => {
    const message = document.querySelector('div.sign-wrapper')?.innerText
    if (message) {
        clearInterval(timer)
        if (message.includes('checked in today')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
            chrome.runtime.sendMessage({message})
        }
    }
}, 1000)