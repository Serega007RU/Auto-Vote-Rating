async function vote(first) {
    if (first === false) return

    // LoliLand неверно сообщает браузеру что страница полностью загружена, приходится извращаться и дожидаться полной загрузки страницы через querySelector
    if (document.querySelector('.preloader_malc') || document.querySelector('#loader-wrapper')) {
        await new Promise(resolve => {
            const timer2 = setInterval(() => {
                if (!document.querySelector('.preloader_malc') && !document.querySelector('#loader-wrapper')) {
                    clearInterval(timer2)
                    resolve()
                }
            }, 1000)
        })
    }

    if (document.querySelector('.bonus_box_wrapper')?.nextElementSibling.textContent) {
        let message = document.querySelector('.bonus_box_wrapper').nextElementSibling.textContent
        if (message.includes('Залогинтесь, чтобы получить доступ к данному разделу') || message.includes('Подтвердите двухфакторную аунтификацию')) {
            chrome.runtime.sendMessage({auth: true})
            await new Promise(resolve => {
                const timer3 = setInterval(() => {
                    try {
                        message = document.querySelector('.bonus_box_wrapper').nextElementSibling.textContent
                        if (!message.includes('Залогинтесь, чтобы получить доступ к данному разделу') && !message.includes('Подтвердите двухфакторную аунтификацию')) {
                            clearInterval(timer3)
                            resolve()
                        }
                    } catch (error) {
                        clearInterval(timer3)
                        throwError(error)
                    }
                }, 1000)
            })
        }
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
        } else if (message.toLowerCase().includes('вы успешно авторизовались') || message.toLowerCase().includes('логин или пароль введен не верно') || message.toLowerCase().includes('подтвердите двухфакторную авторизацию')) {
            // None
        } else {
            chrome.runtime.sendMessage({message})
            clearInterval(timer)
        }
    }
}, 100) // TODO приходится ставить слишком низкий timeout из-за того что уведомление об успешном/неуспешном получении бонуса слишком мало по времени висит