async function vote() {
    if (document.querySelector('div.MsgBox') != null && document.querySelector('div.MsgBox').innerText.length > 0) return

    if (document.querySelector('div.ui.error.message') != null) {
        if (document.querySelector('div.ui.error.message').textContent.includes('must wait until tomorrow')) {
            await wait(Math.floor(Math.random() * 9000 + 1000))
            chrome.runtime.sendMessage({later: true})
            return
        }
        await wait(Math.floor(Math.random() * 9000 + 1000))
        chrome.runtime.sendMessage({message: document.querySelector('div.ui.error.message').textContent})
        return
    }

    //Если на странице есть кнопка входа через Steam, то жмём её
    if (document.querySelector('a[href="/steam_login"]') != null) {
        await wait(Math.floor(Math.random() * 9000 + 1000))
        document.querySelector('a[href="/steam_login"]').click()
        return
    }

    if (document.querySelector('div.general > .card > div.card-body h1')) {
        const request = {}
        request.message = document.querySelector('div.general > .card > div.card-body').innerText
        if (request.message.includes('Страница не найдена')) {
            request.ignoreReport = true
        }
        chrome.runtime.sendMessage(request)
        return
    }

    let waiting = false
    const timer2 = setInterval(async () => {
        try {
            if (waiting) return
            const button = document.querySelector('#main .card-footer .btn.btn-blue')
            if (!button) return
            const message = button.textContent
            if (message.includes('ч.')) {
                const numbers = message.match(/\d+/g).map(Number)
                const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000)/* + (sec * 1000)*/
                waiting = true
                await wait(Math.floor(Math.random() * 9000 + 1000))
                chrome.runtime.sendMessage({successfully: Date.now() + milliseconds})
                return
            }
            if ((button.disabled == null || button.disabled === false) && button.getAttribute('disabled') == null) {
                waiting = true
                await wait(Math.floor(Math.random() * 9000 + 1000))
                button.click()
                clearInterval(timer2)
            }
        } catch (e) {
            clearInterval(timer2)
            throwError(e)
        }
    }, 1000)
}

const timer = setInterval(async ()=>{
    try {
        const msg = document.querySelector('div.MsgBox')
        if (msg != null && msg.innerText.length > 0) {
            const request = {}
            request.message = msg.innerText
            if (request.message.includes('уже проголосовали')) {
                clearInterval(timer)
                await wait(Math.floor(Math.random() * 9000 + 1000))
                chrome.runtime.sendMessage({later: true})
            } else if (request.message.includes('Голос принят')) {
                clearInterval(timer)
                // TODO кринж кринжа, сайт уведомление об успешном голосовании отображает буквально на секунду, ничего дибильнее придумать автор сайта не может
                // await wait(Math.floor(Math.random() * 9000 + 1000))
                // chrome.runtime.sendMessage({successfully: true})
            } else if (request.message.includes('Авторизация')) {
                clearInterval(timer)
                chrome.runtime.sendMessage({auth: true})
            } else if (request.message === 'Успешно' || request.message === ' In process...') {
                // None
            } else {
                if (request.message.includes('Сервис временно недоступен')) {
                    request.ignoreReport = true
                }
                clearInterval(timer)
                await wait(Math.floor(Math.random() * 9000 + 1000))
                chrome.runtime.sendMessage(request)
            }
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 200)