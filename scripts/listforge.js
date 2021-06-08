async function vote(first) {
    try {
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

        if (document.querySelector('div.alert.alert-danger') != null) {
            if (document.querySelector('div.alert.alert-danger').textContent.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
                return
            }
            chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent.trim()})
            return
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
            if (project.nick == null || project.nick == '') {
                chrome.runtime.sendMessage({requiredNick: true})
                return
            }
            document.getElementById('nickname').value = project.nick
            //Кликаем проголосовать, если нет hCaptcha
            if (document.getElementById('voteBtn') != null) {
                document.getElementById('voteBtn').click()
            //Если hCaptcha
            } else {
                document.querySelector('button[form="vote_form"]').click()
            }
        } else {
            throw Error(null)
        }
        
    } catch (e) {
        throwError(e)
    }
}