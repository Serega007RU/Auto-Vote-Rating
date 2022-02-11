async function vote(first) {
    try {
        if (document.getElementById('summary') != null) {
            if (document.getElementById('summary').textContent.includes('Ошибка проверки CSRF')) {
                //Костыль костыля, перезагружаем страницу в случае возникновения Ошибки проверки CSRF (данная ошибка выскакивает после прохождения проверки CloudFlare)
                document.location.replace(document.URL)
                return
            } else if (document.querySelector('#summary > h1') != null && document.querySelector('#summary > p') != null) {
                chrome.runtime.sendMessage({message: document.getElementById('summary').textContent})
                return
            }
        }

        if (document.querySelector('#container > h1') != null) {
            let message = document.querySelector('#container > h1').textContent
            if (document.querySelector('#container > h1').nextElementSibling != null) {
                message = message + ' ' + document.querySelector('#container > h1').nextElementSibling.textContent
            }
            chrome.runtime.sendMessage({message})
            return
        }
        const project = await getProject('TopCraft')
        //Авторизованы ли мы в аккаунте?
        if (!document.querySelector('#userLoginWrap').classList.contains('hidden')) {
            if (vkontakte != null && vkontakte.passwordTopCraft) {
                // document.querySelector('.usr-login-lnk').click()
                // document.getElementById('id_login').value = vkontakte.id + vkontakte.numberId
                // document.getElementById('id_password').value = vkontakte.passwordTopCraft
                // document.querySelector('button[type="submit"].btn-login').click()
                // const timer1 = setInterval(()=>{
                //     if (document.querySelector('#loginForm .error') != null) {
                //         chrome.runtime.sendMessage({message: document.querySelector('#loginForm > .error').textContent})
                //         clearInterval(timer1)
                //     }
                // }, 1000)
                const csrftoken = document.querySelector('input[name="csrfmiddlewaretoken"]').value
                try {
                    const login = vkontakte.id + vkontakte.numberId
                    if (login.length > 30) login.substring(0, 30)
                    const response = await fetch('https://topcraft.ru/accounts/login/', {
                        'headers': {
                            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        },
                        'body': 'csrfmiddlewaretoken=' + csrftoken + '&login=' + login + '&password=' + vkontakte.passwordTopCraft,
                        'method': 'POST'
                    })
                    response.html = await response.text()
                    response.doc = new DOMParser().parseFromString(response.html, 'text/html')
                    if (response.doc.querySelector('.errorlist') != null) {
                        chrome.runtime.sendMessage({message: response.doc.querySelector('.errorlist').textContent})
                    } else {
                        chrome.runtime.sendMessage({message: 'Неизвестная ошибка авторизации по passwordTopCraft'})
                    }
                    return
                } catch (e) {
                    //Если мы получили ошибку
                    //Mixed Content: The page at 'https://topcraft.ru/servers/id/' was loaded over HTTPS, but requested an insecure resource 'http://topcraft.ru/account/projects/'. This request has been blocked; the content must be served over HTTPS.
                    //то значит всё норм
                    if (e.message !== 'Failed to fetch') {
                        throwError(e)
                        return
                    }
                }
                document.location.reload()
                return
            }
            const timerLogin = setInterval(() => {
                if (document.querySelector('#loginModal').classList.contains('in')) {
                    document.querySelector('a.modalVkLogin').click()
                    clearInterval(timerLogin)
                } else {
                    document.querySelector('button[data-type=vote]').click()
                }
            }, 1000)
            return
        }
        if (!document.querySelector('#voteModal').classList.contains('in')) {
            if (document.querySelector('button.openVoteModal') === null) {
                //Костыль для владельцев проектов если они голосуют за свой же проект
                let url = new URL(document.URL)
                if (!url.searchParams.has('voting')) {
                    url.searchParams.append('voting', project.id)
                    document.location.replace(url.toString())
                }
            } else {
                const timerVote = setInterval(() => {
                    if (document.querySelector('#voteModal').classList.contains('in')) {
                        clearInterval(timerVote)
                    } else {
                        document.querySelector('button.openVoteModal').click()
                    }
                }, 1000)
            }
        }
        if (first) return

        if (vkontakte != null) {
            await new Promise(resolve => {
                chrome.runtime.sendMessage({changeProxy: 'TopCraft'}, async result => {
                    if (result === 'success') {
                        await new Promise(resolve1 => setTimeout(resolve1, 1000))
                    }
                    resolve()
                })
            })
        }

        //Вводит никнейм
        document.querySelector('input[name=nick]').value = project.nick
        document.querySelector('input[name=nick]').click()
        //Клик 'Голосовать' в окне голосования
        document.querySelector('button.btn.btn-info.btn-vote.voteBtn').click()
    } catch (e) {
        throwError(e)
    }
}

let fixTimer
const timer = setInterval(()=>{
    try {
        //Ищет надпись в которой написано что вы проголосовали или вы уже голосовали, по этой надписи скрипт завершается
        if (document.readyState === 'complete' && document.querySelectorAll('div[class=tooltip-inner]').item(0) != null) {
            const textContent = document.querySelectorAll('div[class=tooltip-inner]').item(0).textContent.toLowerCase()
            if (textContent.includes('уже голосовали') || textContent.includes('уже проголосовали') || textContent.includes('сможете проголосовать') || textContent.includes('вы сегодня голосовали') || textContent.includes('вы сегодня проголосовали')) {
                chrome.runtime.sendMessage({later: true})
            } else if (textContent.includes('за ваш голос') || textContent.includes('спасибо за голос') ||  textContent.includes('голос принят') || textContent.includes('голос засчитан') || textContent.includes('успех') || textContent.includes('успешн')) {
                chrome.runtime.sendMessage({successfully: true})
            } else {
                chrome.runtime.sendMessage({message: document.querySelectorAll('div[class=tooltip-inner]').item(0).textContent})
            }
            clearInterval(timer)
            clearTimeout(fixTimer)
        }
    } catch (e) {
        throwError(e)
        clearInterval(timer)
    }
}, 1000)

//Фикс-костыль на случай если у нас ошибка в vote запросе
const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.name === 'https://topcraft.ru/projects/vote/') {
            fixTimer = setTimeout(()=>{
                chrome.runtime.sendMessage({message: 'Мы получили что vote запрос прошёл но ответ от TopCraft так и не поступил, скорее всего в vote запросе произошла ошибка, смотрите подробности в консоли в момент голосования'})
            }, 5000)
        }
    }
})
observer.observe({
    entryTypes: ["resource"]
})