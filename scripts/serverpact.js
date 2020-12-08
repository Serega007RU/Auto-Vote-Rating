vote()
async function vote() {
    try {
        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }
        if (document.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div:nth-child(4)') != null && document.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div:nth-child(4)').textContent.includes('You have successfully voted')) {
            chrome.runtime.sendMessage({successfully: true})
        } else if (document.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning') != null && (document.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning').textContent.includes('You can only vote once') || document.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning').textContent.includes('already voted'))) {
            chrome.runtime.sendMessage({later: Date.now() + 43200000})
            //ToDo <Serega007> а зачем нам говорить сколько осталось до следующего голосования? Нееет, мы по тупому просто напишем 12 часов и пошлём нафиг, зачем это нужно ServerPact'у?
        } else if (document.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning') != null) {
            chrome.runtime.sendMessage({message: document.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning').textContent})
        } else {
            //Отправка запроса на прохождение капчи (мы типо прошли капчу)
            await fetch('https://www.serverpact.com/v2/QapTcha-master/php/Qaptcha.jquery.php', {
                'headers': {
                    'accept': 'application/json, text/javascript, */*; q=0.01',
                    'accept-language': 'ru,en;q=0.9,ru-RU;q=0.8,en-US;q=0.7',
                    'cache-control': 'no-cache',
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'pragma': 'no-cache',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'x-requested-with': 'XMLHttpRequest'
                },
                'referrerPolicy': 'no-referrer-when-downgrade',
                'body': 'action=qaptcha&qaptcha_key=' + document.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.row > div:nth-child(1) > div.hidden-xs > div > form > div.QapTcha > input[type=hidden]:nth-child(6)').name,
                'method': 'POST',
                'mode': 'cors',
                'credentials': 'include'
            })
            //Убираем здесь value иначе капча не будет пройдена
            document.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.row > div:nth-child(1) > div.hidden-xs > div > form > div.QapTcha > input[type=hidden]:nth-child(6)').value = ''
            //Включаем кнопку отправки голоса
            document.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.row > div:nth-child(1) > div.hidden-xs > div > form > div.input-group > span > input').removeAttribute('disabled')
            let nick = await getNickName()
            if (nick == null || nick == '')
                return
            //Вписываем ник в поле ввода
            document.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.row > div:nth-child(1) > div.hidden-xs > div > form > div.input-group > input').value = nick
            //Жмём кнопку отправки голоса
            document.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.row > div:nth-child(1) > div.hidden-xs > div > form > div.input-group > span > input').click()
        }
    } catch (e) {
        if (document.URL.startsWith('chrome-error') || document.querySelector('#error-information-popup-content > div.error-code') != null) {
            chrome.runtime.sendMessage({message: 'Ошибка! Похоже браузер не может связаться с сайтом, вот что известно: ' + document.querySelector('#error-information-popup-content > div.error-code').textContent})
        } else {
            chrome.runtime.sendMessage({message: 'Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ': ' + e.message + '\n' + e.stack})
        }
    }
}

async function getNickName() {
    let projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsServerPact', data=>{
            resolve(data['AVMRprojectsServerPact'])
        })
    })
    for (project of projects) {
        if (project.ServerPact && (document.URL.startsWith('https://www.serverpact.com/vote-' + project.id))) {
            return project.nick
        }
    }
    if (!document.URL.startsWith('https://www.serverpact.com/vote-')) {
        chrome.runtime.sendMessage({message: 'Ошибка голосования! Произошло перенаправление/переадресация на неизвестный сайт: ' + document.URL + ' Проверьте данный URL'})
    } else {
        chrome.runtime.sendMessage({message: 'Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL})
    }
}
