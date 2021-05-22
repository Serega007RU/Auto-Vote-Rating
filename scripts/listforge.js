try {
    //Если мы находимся на странице авторизации Steam
    if (document.URL.startsWith('https://steamcommunity.com/openid/login')) {
        document.getElementById('imageLogin').click()
        const timer2 = setInterval(()=>{
            try {
                if (document.getElementById('error_display').style.display != 'none') {
                    chrome.runtime.sendMessage({message: document.getElementById('error_display').textContent})
                    clearInterval(timer2)
                } else if ((document.querySelector('div.newmodal') != null && document.querySelector('div.newmodal').style.display != 'none')
                    || (document.querySelector('div.login_modal.loginAuthCodeModal') != null && document.querySelector('div.login_modal.loginAuthCodeModal').style.display != 'none')
                    || (document.querySelector('div.login_modal.loginTwoFactorCodeModal') != null && document.querySelector('div.login_modal.loginTwoFactorCodeModal').style.display != 'none')
                    || (document.querySelector('div.login_modal.loginIPTModal') != null && document.querySelector('div.login_modal.loginIPTModal').style.display != 'none')) {
                        chrome.runtime.sendMessage({authSteam: true})
                        clearInterval(timer2)
                }
            } catch (e) {
                chrome.runtime.sendMessage({errorVoteNoElement2: e.stack + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
                clearInterval(timer2)
            }
        }, 1000)
    } else {
        window.onmessage = function(e) {
            if (e.data == 'vote') {
                vote(false)
            }
        }
        vote(true)
    }
} catch (e) {
    chrome.runtime.sendMessage({errorVoteNoElement2: e.stack + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
}

async function vote(first) {
    try {
        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }
        //Если мы находимся на странице проверки ReCaptcha
        if (document.querySelector('body > iframe') != null && document.querySelector('body > iframe').src.startsWith('https://geo.captcha-delivery.com/captcha/')) {
            return
        }

        //Пилюля от жадности
        if (document.getElementById('adblock-notice') != null) document.getElementById('adblock-notice').remove()
        if (document.getElementById('adsense-notice') != null) document.getElementById('adsense-notice').remove()
        if (document.getElementById('vote-loading-block') != null) document.getElementById('vote-loading-block').remove()
        if (document.getElementById('blocked-notice') != null) document.getElementById('blocked-notice').remove()
        if (document.getElementById('privacysettings-notice') != null) document.getElementById('privacysettings-notice').remove()
        if (document.getElementById('vote-form-block') != null) document.getElementById('vote-form-block').removeAttribute('style')
        if (document.getElementById('vote-button-block') != null) document.getElementById('vote-button-block').removeAttribute('style')

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

        const project = await getProject()
        if (project == null) return

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
            throw null
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
        chrome.storage[storageArea].get('AVMRprojectsListForge', data=>{
            resolve(data['AVMRprojectsListForge'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.game) && document.URL.includes(project.id)) {
            return project
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}
