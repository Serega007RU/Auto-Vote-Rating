async function vote(first) {
    if (first == false) {
        console.warn('[Auto Vote Rating] Произошёл повторный вызов функции vote(), сообщите разработчику расширения о данной ошибке')
        return
    }
    try {
        //Если успешное авто-голосование
        if (document.querySelector('div[class="alert alert-success"]') != null || document.querySelector('div[class="alert alert-success m-t-2"]') != null) {
            chrome.runtime.sendMessage({
                successfully: true
            })
            return
        }
        //Если есть предупреждение
        if (document.querySelector('div[class="alert alert-warning"]') != null) {
            //Если вы уже голосовали
            if (document.getElementById('voteTimer') != null) {
                const numbers = document.getElementById('voteTimer').textContent.match(/\d+/g).map(Number)
                let count = 0
                let hour = 0
                let min = 0
                let sec = 0
                for (const i in numbers) {
                    if (count == 0) {
                        min = numbers[i]
                    }
                    count++
                }
                const milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
                const later = Date.now() + milliseconds
                chrome.runtime.sendMessage({
                    later: later
                })
                return
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('div[class="alert alert-warning"]').innerText})
                return
            }
        }
        //Если есть ошибка
        if (document.querySelector('div[class="alert alert-danger"]') != null) {
            chrome.runtime.sendMessage({message: document.querySelector('div[class="alert alert-danger"]').innerText})
            return
        } else if (document.querySelector('div[class="alert alert-danger m-t-2"]') != null) {
            chrome.runtime.sendMessage({message: document.querySelector('div[class="alert alert-danger m-t-2"]').innerText})
            return
        }

        if (document.getElementById('playername') != null) {
            const project = await getProject('TopGames', true)
            document.getElementById('playername').value = project.nick
        }

        const timer = setInterval(function() {
            try {
                if (document.querySelector('#captcha-content > div > div.grecaptcha-logo > iframe') != null) {
                    //Ждёт загрузки reCaptcha
                    document.querySelector('button[type="submit"').click()
                    clearInterval(timer)
                }
            } catch (e) {
                throwError(e)
                clearInterval(timer)
            }
        }, 1000)

        if (document.querySelector('.mtcaptcha') != null) {
            chrome.runtime.sendMessage({captcha: true})
            return
        }
    } catch (e) {
        throwError(e)
    }
}