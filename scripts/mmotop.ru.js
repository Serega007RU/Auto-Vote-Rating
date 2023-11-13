async function vote(first) {
    // https://i.imgur.com/yI6PmMA.png
    if (document.querySelector('body > h1')?.textContent === 'Forbidden') {
        chrome.runtime.sendMessage({message: document.querySelector('body').innerText.trim(), ignoreReport: true})
        return
    }

    if (document.querySelector('#id_spinner')) {
        await new Promise(resolve => {
            const timer = setInterval(() => {
                if (!document.querySelector('#id_spinner')) {
                    clearInterval(timer)
                    resolve()
                }
            }, 1000)
        })
    }

    if (document.querySelector('a[href="https://mmotop.ru/users/sign_in"]') || document.querySelector('a[href="/users/sign_in"]') || document.querySelector('form[action="/users/sign_in"]') || document.querySelector('form#new_user')) {
        chrome.runtime.sendMessage({auth: true})
        return
    }

    if (document.querySelector('div[class="can-vote"]')) {
        chrome.runtime.sendMessage({later: true})
        return
    }

    if (document.querySelector('body > div.ui-pnotify')) {
        const request = {}
        request.message = document.querySelector('body > div.ui-pnotify').innerText
        if (request.message.includes('Голос принят') || request.message.includes('vote accepted')) {
            chrome.runtime.sendMessage({successfully: true})
            return
        } else if (request.message.includes('Signed in successfully') || request.message.includes('Вы успешно зарегистрировались')) {
            // None
        } else {
            if (request.message.includes('Quaptcha check fail')) {
                request.ignoreReport = true
            }
            chrome.runtime.sendMessage(request)
            return
        }
    }

    // Если мы вдруг пропустили уведомление, то пытаемся снова войти в меню голосования
    if (document.querySelector('.header-2 a.btn.btn-danger')) {
        document.querySelector('.header-2 a.btn.btn-danger').click()
        return
    }

    // Если аккаунт не подтверждённый
    if (document.querySelector('.vote-content [href*="resend_confirmation_token"]')) {
        chrome.runtime.sendMessage({message: document.querySelector('.vote-content').innerText, ignoreReport: true})
    }

    if (document.querySelector('div.notice div.alert')) {
        const request = {}
        request.message = document.querySelector('div.notice div.alert').innerText
        if (request.message.includes('News')) {
            // None
        } else {
            if (request.message.includes('требуется активировать аккаунт')) {
                request.ignoreReport = true
            }
            chrome.runtime.sendMessage(request)
            return
        }
    }

    if (document.querySelector('#vote_loading')) {
        await new Promise(resolve => {
            const timer = setInterval(() => {
                if (!document.querySelector('#vote_loading')) {
                    clearInterval(timer)
                    resolve()
                }
            }, 1000)
        })
    }

    if (document.querySelector('.vote-content .payment_select')) {
        chrome.runtime.sendMessage({message: 'Авто-голосование не доступно на платном голосовании, не вмешивайтесь в процесс авто-голосования!', ignoreReport: true})
        return
    }

    if (document.querySelector('form[name="form"] input[name="captcha"]')) {
        chrome.runtime.sendMessage({captcha: true})
        return
    }

    //Делаем форму голосования видимой
    document.querySelector('div.vote-fields').removeAttribute('style')

    if (document.querySelector("div.g-recaptcha > div > div > iframe") && first) {
        return
    }

    const project = await getProject()

    //Отправка запроса на прохождение капчи (мы типо прошли капчу)
    try {
        const response = await fetch('https://' + project.game + '.mmotop.ru/votes/quaptcha.json', {
            'headers': {
                'accept': 'application/json, text/javascript, */*; q=0.01',
                'accept-language': 'ru,en;q=0.9,en-US;q=0.8',
                'cache-control': 'no-cache',
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'pragma': 'no-cache',
                'sec-ch-ua': '\"Google Chrome\";v=\"87\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"87\"',
                'sec-ch-ua-mobile': "?0",
                'sec-fetch-dest': "empty",
                'sec-fetch-mode': "cors",
                'sec-fetch-site': "same-origin",
                'x-csrf-token': document.querySelector('input[name="authenticity_token"]').value,
                'x-requested-with': "XMLHttpRequest"
            },
            'body': 'action=qaptcha&qaptcha_key=' + document.querySelector('div.QapTcha > input[type=hidden]').name,
            'method': 'POST',
            'mode': 'cors',
            'credentials': 'include'
        })
        if (!response.ok) {
            chrome.runtime.sendMessage({errorVote: [String(response.status), response.url]})
            return
        }
    } catch (error) {
        chrome.runtime.sendMessage({message: error.toString(), ignoreReport: true})
        return
    }
    //Убираем здесь value иначе капча не будет пройдена
    document.querySelector('div.QapTcha > input[type=hidden]').value = ''
    //Делаем кнопку 'Проголосовать' кликабельной
    document.getElementById('check_vote_form').disabled = false

    //Вписываем никнейм
    document.getElementById('charname').firstElementChild.value = project.nick
    //Выбираем нужный мир
    const ordinalWorld = project.ordinalWorld - 1
    const world = document.querySelectorAll('#world > div > table > tbody > tr')[ordinalWorld]
    if (!world) {
        chrome.runtime.sendMessage({message: 'Мир под номером ' + project.ordinalWorld + ' не найден, проверьте правильность указанного номера мира', ignoreReport: true})
        return
    } else {
        world.click()
    }
    //Кликает голосовать
    document.querySelector('#check_vote_form').click()
}