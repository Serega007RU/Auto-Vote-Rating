async function vote() {
    try {
        if (document.querySelector('div.MsgBox') != null) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }

        if (document.querySelector('div.ui.error.message') != null) {
            if (document.querySelector('div.ui.error.message').textContent.includes('must wait until tomorrow')) {
                chrome.runtime.sendMessage({later: true})
                return
            }
            chrome.runtime.sendMessage({message: document.querySelector('div.ui.error.message').textContent})
            return
        }

        //Если на странице есть кнопка входа через Steam то жмём её
        if (document.querySelector('#main a[href="/steam_login"]') != null) {
            document.querySelector('#main a[href="/steam_login"]').click()
            return
        }

        //Зачем такие костыли
        const button = document.querySelector('div.card-footer button')
        button.disabled = false
        button.setAttribute('data-send', '/server/vote')

        if (button.textContent.includes('Голосовать через ')) {
            const numbers = button.textContent.match(/\d+/g).map(Number)
            let count = 0
            let hour = 0
            let min = 0
            let sec = 0
            for (const i in numbers) {
                if (count === 0) {
                    hour = numbers[i]
                } else if (count === 1) {
                    min = numbers[i]
                }
                count++
            }
            const milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
            const later = Date.now() + milliseconds
            chrome.runtime.sendMessage({later: later})
        } else {
            button.click()
        }
    } catch (e) {
        throwError(e)
    }
}

const timer = setInterval(()=>{
    if (document.querySelector('div.MsgBox') != null) {
        clearInterval(timer)
        const message = document.querySelector('div.MsgBox').innerText
        if (message.includes('уже проголосовали')) {
            chrome.runtime.sendMessage({later: true})
        } else if (message.includes('Голос принят')) {
            chrome.runtime.sendMessage({successfully: true})
        } else if (message.length > 0) {
            chrome.runtime.sendMessage({message})
        }
    }
}, 200)