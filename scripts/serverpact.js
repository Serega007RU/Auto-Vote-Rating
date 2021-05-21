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
            const project = await getProject()
            if (project == null) return
            //Вписываем ник в поле ввода
            document.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.row > div:nth-child(1) > div.hidden-xs > div > form > div.input-group > input').value = project.nick
            //Жмём кнопку отправки голоса
            document.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.row > div:nth-child(1) > div.hidden-xs > div > form > div.input-group > span > input').click()
        }
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
    }
}

async function getProject() {
    const storageArea = await new Promise(resolve=>{
        chrome.storage.local.get('storageArea', data=>{
            resolve(data['storageArea'])
        })
    })
    const projects = await new Promise(resolve=>{
        chrome.storage[storageArea].get('AVMRprojectsServerPact', data=>{
            resolve(data['AVMRprojectsServerPact'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.id)) {
            return project
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}
