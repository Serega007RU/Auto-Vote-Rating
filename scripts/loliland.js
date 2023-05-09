async function vote(first) {
    if (first === false) return

    if (document.querySelector('.preloader_malc')) {
        await new Promise(resolve => {
            const timer2 = setInterval(() => {
                if (!document.querySelector('.preloader_malc')) {
                    clearInterval(timer2)
                    resolve()
                }
            }, 1000)
        })
    }

    if (document.querySelector('.bonus_box_wrapper').nextElementSibling.textContent.includes('Залогинтесь, чтобы получить доступ к данному разделу')) {
        chrome.runtime.sendMessage({auth: true})
        await new Promise(resolve => {
            const timer3 = setInterval(() => {
                if (!document.querySelector('.bonus_box_wrapper').nextElementSibling.textContent.includes('Залогинтесь, чтобы получить доступ к данному разделу')) {
                    clearInterval(timer3)
                    resolve()
                }
            }, 1000)
        })
    }

    if (document.querySelector('.give_disable')) {
        chrome.runtime.sendMessage({
            message: 'Не выполнены условия для получения бонуса',
            ignoreReport: true
        })
        return
    }

    document.querySelector('.give').click()
}

const timer = setInterval(() => {
    const message = document.querySelector('.snotifyToast')?.innerText
    if (message && message.length > 5) {
        if (message.toLowerCase().includes('до следующего получения бонуса')) {
            const numbers = message.match(/\d+/g).map(Number)
            let hours = 0
            let minutes = 0
            let seconds = 0
            let x = 0
            for (let i = numbers.length - 1; i >= 0; i--) {
                if (x === 0) seconds = numbers[i]
                else if (x === 1) minutes = numbers[i]
                else if (x === 2) hours = numbers[i]
                x++
            }
            const milliseconds = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000) + (seconds * 1000)
            chrome.runtime.sendMessage({later: Date.now() + milliseconds})
            clearInterval(timer)
        } else if (message.toLowerCase().includes('вы успешно получили')) {
            chrome.runtime.sendMessage({successfully: true})
            clearInterval(timer)
        } else if (message.toLowerCase().includes('вы успешно авторизовались')) {
            // None
        } else {
            chrome.runtime.sendMessage({message})
            clearInterval(timer)
        }
    }
}, 100) // TODO приходится ставить слишком низкий timeout из-за того что уведомление об успешном/неуспешном получении бонуса слишком мало по времени висит