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
                    await fetch('https://topcraft.ru/accounts/login/', {
                        'headers': {
                            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        },
                        'body': 'csrfmiddlewaretoken=' + csrftoken + '&login=' + vkontakte.id + vkontakte.numberId + '&password=' + vkontakte.passwordTopCraft,
                        'method': 'POST'
                    })
                } catch (e) {

                }
                document.location.reload()
                return
            }
            document.querySelector('button[data-type=vote]').click()
            document.querySelector('a.modalVkLogin').click()
            return
        }
        if (!document.querySelector('#voteModal').classList.contains('in')) {
            if (document.querySelector('button.openVoteModal') === null) {
                //Костыль для владельцев проектов если они голосуют за свой же проект
                let url = new URL(document.URL)
                url.searchParams.append('voting', '10895')
                document.location.replace(url.toString())
            } else {
                document.querySelector('button.openVoteModal').click()
            }
        }
        if (first) return

        //Вводит никнейм
        document.querySelector('input[name=nick]').value = project.nick
        document.querySelector('input[name=nick]').click()
        //Клик 'Голосовать' в окне голосования
        document.querySelector('button.btn.btn-info.btn-vote.voteBtn').click()
    } catch (e) {
        throwError(e)
    }
}

const timer = setInterval(()=>{
    try {
        //Ищет надпись в которой написано что вы проголосовали или вы уже голосовали, по этой надписи скрипт завершается
        if (document.readyState === 'complete' && document.querySelectorAll('div[class=tooltip-inner]').item(0) != null) {
            const textContent = document.querySelectorAll('div[class=tooltip-inner]').item(0).textContent.toLowerCase()
            if (textContent.includes('уже голосовали') || textContent.includes('уже проголосовали') || textContent.includes('сможете проголосовать')) {
                chrome.runtime.sendMessage({later: true})
            } else if (textContent.includes('за ваш голос') || textContent.includes('спасибо за голос') ||  textContent.includes('голос принят') || textContent.includes('голос засчитан') || textContent.includes('успех') || textContent.includes('успешн')) {
                chrome.runtime.sendMessage({successfully: true})
            } else {
                chrome.runtime.sendMessage({message: document.querySelectorAll('div[class=tooltip-inner]').item(0).textContent})
            }
            clearInterval(timer)
        }
    } catch (e) {
        throwError(e)
        clearInterval(timer)
    }
}, 1000)