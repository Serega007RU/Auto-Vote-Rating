// noinspection ES6MissingAwait

async function silentVoteServerPact(project) {
    let response = await fetch('https://www.serverpact.com/vote-' + project.id, {
        'headers': {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-language': 'ru,en;q=0.9,ru-RU;q=0.8,en-US;q=0.7',
            'cache-control': 'no-cache',
            'pragma': 'no-cache',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1'
        },
        'referrerPolicy': 'no-referrer-when-downgrade',
        'body': null,
        'method': 'GET',
        'mode': 'cors',
        'credentials': 'include'
    })
    if (!await checkResponseError(project, response, 'serverpact.com')) return
    function generatePass(nb) {
        let chars = 'azertyupqsdfghjkmwxcvbn23456789AZERTYUPQSDFGHJKMWXCVBN_-#@'
        let pass = ''
        for (let i = 0; i < nb; i++) {
            let wpos = Math.round(Math.random() * chars.length)
            pass += chars.substring(wpos, wpos + 1)
        }
        return pass
    }
    let captchaPass = generatePass(32)
    let captcha = await fetch('https://www.serverpact.com/v2/QapTcha-master/php/Qaptcha.jquery.php', {
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
        'body': 'action=qaptcha&qaptcha_key=' + captchaPass,
        'method': 'POST',
        'mode': 'cors',
        'credentials': 'include'
    })
    let json = captcha.json()
    if (json.error) {
        endVote({message: 'Error in captcha', html: JSON.stringify(json), url: response.url}, null, project)
        return
    }

    response = await fetch('https://www.serverpact.com/vote-' + project.id, {
        'headers': {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-language': 'ru,en;q=0.9,en-US;q=0.8',
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded',
            'pragma': 'no-cache',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1'
        },
        'referrerPolicy': 'no-referrer-when-downgrade',
        'body': response.doc.querySelector('div.QapTcha > input[type=hidden]').name + '=' + response.doc.querySelector('div.QapTcha > input[type=hidden]').value + '&' + captchaPass + '=&minecraftusername=' + project.nick + '&voten=Send+your+vote',
        'method': 'POST',
        'mode': 'cors',
        'credentials': 'include'
    })
    if (!await checkResponseError(project, response, 'serverpact.com')) return
    if (response.doc.querySelector('div.alert-success')?.textContent.includes('succesfully voted') || response.doc.querySelector('div.alert-success')?.textContent.includes('successfully voted')) {
        endVote({successfully: true}, null, project)
    } else if (response.doc.querySelector('.container h1.sp-title')?.nextSibling?.nextSibling?.textContent.includes('succesfully voted') || response.doc.querySelector('.container h1.sp-title')?.nextSibling?.nextSibling?.textContent.includes('successfully voted')) {
        endVote({successfully: true}, null, project)
    } else if (response.doc.querySelector('div.alert-warning') && (response.doc.querySelector('div.alert.alert-warning').textContent.includes('You can only vote once') || response.doc.querySelector('div.alert.alert-warning').textContent.includes('already voted'))) {
        endVote({later: Date.now() + 43200000}, null, project)
    } else if (response.doc.querySelector('div.alert-warning')) {
        endVote({message: response.doc.querySelector('div.alert-warning').textContent.substring(0, response.doc.querySelector('div.alert-warning').textContent.indexOf('\n')), html: response.doc.body.outerHTML, url: response.url}, null, project)
    } else {
        endVote({emptyError: true, html: response.doc.body.outerHTML, url: response.url}, null, project)
    }
}