vote()
async function vote() {
    try {
        //Если идёт проверка CloudFlare
        if (document.querySelector('#cf-content > h1 > span') != null) {
            return
        }
        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }
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
            const nick = await getNickName()
            if (nick == null)
                return
            document.getElementById('playername').value = nick
        }

        const check = setInterval(function() {
            if (document.querySelector('#captcha-content > div > div.grecaptcha-logo > iframe') != null) {
                //Ждёт загрузки reCaptcha
                document.querySelector('button[type="submit"').click()
                clearInterval(check)
            }
        }, 1000)
    } catch (e) {
        chrome.runtime.sendMessage({message: 'Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ': ' + e.message + '\n' + e.stack})
    }
}

async function getNickName() {
    const projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsTopGames', data=>{
            resolve(data['AVMRprojectsTopGames'])
        })
    })
    for (const project of projects) {
        if (project.TopGames && document.URL.includes(project.game) && document.URL.includes(project.id)) {
            return project.nick
        }
    }

    chrome.runtime.sendMessage({message: 'Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL})
}
