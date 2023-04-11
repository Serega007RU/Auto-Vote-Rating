async function vote(first) {
    document.querySelector('.give').click()
}

const timer = setInterval(() => {
    const message = document.querySelector('.snotifyToast')?.innerText
    if (message) {
        clearInterval(timer)
        if (message.toLowerCase().includes('до следующего получения бонуса')) {
            const numbers = message.match(/\d+/g).map(Number)
            const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000) + (numbers[2] * 1000)
            chrome.runtime.sendMessage({later: Date.now() + milliseconds})
        } else {
            chrome.runtime.sendMessage({message})
        }
    }
}, 100) // TODO приходится ставить слишком низкий timeout из-за того что уведомление об успешном/неуспешном получении бонуса слишком мало по времени висит