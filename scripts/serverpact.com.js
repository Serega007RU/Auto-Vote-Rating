async function vote(first) {
    if (first === false) return
    if (document.querySelector('div.alert-success')?.textContent.includes('succesfully voted') || document.querySelector('div.alert-success')?.textContent.includes('successfully voted')) {
        chrome.runtime.sendMessage({successfully: true})
    } else if (document.querySelector('.container h1.sp-title')?.nextElementSibling?.nextSibling?.textContent.includes('succesfully voted') || document.querySelector('.container h1.sp-title')?.nextElementSibling?.nextSibling?.textContent.includes('successfully voted')) {
        chrome.runtime.sendMessage({successfully: true})
    } else if (document.querySelector('div.alert-warning') && (document.querySelector('div.alert-warning').textContent.includes('You can only vote once') || document.querySelector('div.alert-warning').textContent.includes('already voted'))) {
        chrome.runtime.sendMessage({later: Date.now() + 43200000})
        //ToDo <Serega007> а зачем нам говорить сколько осталось до следующего голосования? Нееет, мы по тупому просто напишем 12 часов и пошлём нафиг, зачем это нужно ServerPact'у?
    } else if (document.querySelector('div.alert-warning')) {
        chrome.runtime.sendMessage({message: document.querySelector('div.alert-warning').innerText.trim()})
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
            'body': 'action=qaptcha&qaptcha_key=' + document.querySelector('div.QapTcha > input[type=hidden]:last-of-type').name,
            'method': 'POST',
            'mode': 'cors',
            'credentials': 'include'
        })
        //Убираем здесь value иначе капча не будет пройдена
        document.querySelector('div.QapTcha > input[type=hidden]:nth-child(6)').value = ''
        //Включаем кнопку отправки голоса
        document.querySelector('form input[type="submit"][name="voten"]').removeAttribute('disabled')
        const project = await getProject()
        //Вписываем ник в поле ввода
        if (document.querySelector('form input[name="minecraftusername"]')) document.querySelector('form input[name="minecraftusername"]').value = project.nick
        //Жмём кнопку отправки голоса
        document.querySelector('form input[type="submit"][name="voten"]').click()
    }
}