async function vote(first) {
    //Пилюля от жадности
    if (document.getElementById('adblock-notice') != null) document.getElementById('adblock-notice').remove()
    if (document.getElementById('adsense-notice') != null) document.getElementById('adsense-notice').remove()
    if (document.getElementById('vote-loading-block') != null) document.getElementById('vote-loading-block').remove()
    if (document.getElementById('blocked-notice') != null) document.getElementById('blocked-notice').remove()
    if (document.getElementById('privacysettings-notice') != null) document.getElementById('privacysettings-notice').remove()
    if (document.getElementById('vote-form-block') != null) document.getElementById('vote-form-block').removeAttribute('style')
    if (document.getElementById('vote-button-block') != null) document.getElementById('vote-button-block').removeAttribute('style')
    if (document.querySelector('a[href="/servers/premium/"]') != null) document.querySelector('a[href="/servers/premium/"]').remove()

    for (const el of document.querySelectorAll('div.alert.alert-info')) {
        if (el.textContent.includes('server has been removed')) {
            chrome.runtime.sendMessage({message: el.textContent.trim()})
            return
        }
    }

    for (const el of document.querySelectorAll('strong')) {
        if (el.textContent.includes('Thank you for your vote')) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
    }

    if (document.querySelector('div.alert.alert-danger')) {
        const message = document.querySelector('div.alert.alert-danger').textContent.trim()
        if (message.includes('already voted') || message.includes('have reached your daily vote limit')) {
            chrome.runtime.sendMessage({later: true})
            return
        }
        if (message.includes('Captcha data missing')) {
            chrome.runtime.sendMessage({captcha: true})
            return
        }
        chrome.runtime.sendMessage({message})
        return
    }

    if (document.querySelector('.container h1')?.textContent?.includes('Error')) {
        const request = {}
        request.message = document.querySelector('.container h1').textContent + ' ' + document.querySelector('.container p').textContent
        if (request.message.includes('page you were looking for cannot be found') || request.message.includes('page you were looking does not exist anymore')) {
            request.ignoreReport = true
        }
        chrome.runtime.sendMessage(request)
    }

    //Если на странице есть hCaptcha то мы ждём её решения
    if (document.querySelector('div.h-captcha') != null && first) {
        return
    }

    //Соглашаемся с Privacy Policy
    document.getElementById('accept').checked = true

    //Если требуется авторизация Steam
    if (document.querySelector('form[name="steam_form"] > input[type="image"]') != null) {
        document.querySelector('form[name="steam_form"] > input[type="image"]').click()
        return
    }

    const project = await getProject('ListForge', true)
    //Вводим ник если он существует
    if (document.getElementById('nickname') != null) {
        if (project.nick == null || project.nick === '') {
            chrome.runtime.sendMessage({requiredNick: true})
            return
        }

        document.getElementById('nickname').value = project.nick
        //Кликаем проголосовать, если нет hCaptcha
        if (document.getElementById('voteBtn') != null) {
            document.getElementById('voteBtn').click()
        //Если hCaptcha
        } else if (document.querySelector('button[form="vote_form"]') != null) {
            document.querySelector('button[form="vote_form"]').click()
        //Ещё какая-то разновидность кнопки Vote (Specially for Minecraft Pocket Servers)
        } else {
            document.querySelector('a[href="javascript:document.vote_form.submit();"]').click()
        }
    } else {
        // noinspection ExceptionCaughtLocallyJS
        throw Error(null)
    }
}