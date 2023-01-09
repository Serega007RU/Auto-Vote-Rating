async function vote(first) {
    //MMoTopRU, что за костыли?
    if (document.querySelector('body > div') == null && document.querySelectorAll('body > script[type="text/javascript"]').length === 1) {
        // chrome.runtime.sendMessage({emptySite: true})
        return
    }

    if (document.body.innerText.trim().length < 150 && document.body.innerText.trim().includes('Loading...')) {
        return
    }

    if (document.querySelector('a[href="https://mmotop.ru/users/sign_in"]') || document.querySelector('a[href="/users/sign_in"]') || document.querySelector('form[action="/users/sign_in"]')) {
        chrome.runtime.sendMessage({auth: true})
        return
    }

    if (document.querySelector('div[class="can-vote"]') != null) {
        chrome.runtime.sendMessage({later: true})
        return
    }
    if (document.querySelector('body > div.ui-pnotify') != null) {
        if (document.querySelector('body > div.ui-pnotify').textContent.includes('Голос принят') || document.querySelector('body > div.ui-pnotify').textContent.includes('vote accepted')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('body > div.ui-pnotify').textContent})
        }
        return
    }

    // Если мы вдруг попустили уведомление, то пытаемся снова войти в меню голосования
    if (document.querySelector('.header-2 a.btn.btn-danger')) {
        document.querySelector('.header-2 a.btn.btn-danger').click()
        return
    }

    //Делаем форму голосования видимой
    document.querySelector('div.vote-fields').removeAttribute('style')

    if (document.querySelector("div.g-recaptcha > div > div > iframe") != null && first) {
        return
    }

    const project = await getProject('MMoTopRU', true)

    //Отправка запроса на прохождение капчи (мы типо прошли капчу)
    await fetch('https://' + project.game + '.mmotop.ru/votes/quaptcha.json', {
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
    //Убираем здесь value иначе капча не будет пройдена
    document.querySelector('div.QapTcha > input[type=hidden]').value = ''
    //Делаем кнопку 'Проголосовать' кликабельной
    document.getElementById('check_vote_form').disabled = false

    //Вписываем никнейм
    document.getElementById('charname').firstElementChild.value = project.nick
    //Выбираем нужный мир
    const ordinalWorld = project.ordinalWorld - 1
    document.querySelectorAll('#world > div > table > tbody > tr')[ordinalWorld].click()
    //Кликает голосовать
    document.getElementById('check_vote_form').click()
}