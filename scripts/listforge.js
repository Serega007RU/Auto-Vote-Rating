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
                chrome.runtime.sendMessage({errorVoteNoElement2: e.stack})
                clearInterval(timer2)
            }
        }, 1000)
    } else {
        window.onmessage = function(e) {
            if (e.data == 'vote') {
                vote(false)
            }
        }
        if (document.getElementById('vote-loading-block') != null) {
            const timer1 = setInterval(()=>{
                try {
                    if (document.getElementById('vote-loading-block').style.display == 'none') {
                        vote(true)
                        clearInterval(timer1)
                    }
                } catch (e) {
                    chrome.runtime.sendMessage({errorVoteNoElement2: e.stack})
                    clearInterval(timer1)
                }
            }, 1000)
        } else {
            vote(true)
        }
    }
} catch (e) {
    chrome.runtime.sendMessage({errorVoteNoElement2: e.stack})
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
        if (document.getElementById('adblock-notice') != null) document.getElementById('adblock-notice').style.display = 'none'
        if (document.getElementById('vote-form-block') != null) document.getElementById('vote-form-block').removeAttribute('style')
        if (document.getElementById('blocked-notice') != null) document.getElementById('blocked-notice').style.display = 'none'

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

        for (const el of document.querySelectorAll('div.alert.alert-danger')) {
            if (el.offsetParent != null) {
                if (el.textContent.includes('already voted')) {
                    chrome.runtime.sendMessage({later: true})
                    return
                } else if (el.parentElement.href == null) {
                    chrome.runtime.sendMessage({message: el.textContent.trim()})
                    return
                }
            }
        }

        const project = await getProject()
        if (project == null || project == '')
            return
        
        //Если на странице есть hCaptcha и мы голосуем через Steam то ждём её решения
        if (document.querySelector('div.h-captcha') != null && first && project.nick && project.nick != '') {
            return
        }
        
        //Соглашаемся с Privacy Policy
        document.querySelectorAll('#accept').forEach(e=>{e.checked = true})
        //Вводим ник если он существует
        if (document.getElementById('nickname') != null && project.nick && project.nick != '') {
            document.getElementById('nickname').value = project.nick
            //Кликаем проголосовать, если нет hCaptcha
            if (document.getElementById('voteBtn') != null) {
                document.getElementById('voteBtn').click()
            //Если hCaptcha
            } else {
                document.querySelector('a.btn.btn-large.btn-primary.mt-1').click()
            }
        } else {
            //Если Steam
            if (document.querySelector('form[name="steam_form"] > input[type="image"]') != null) {
                document.querySelector('form[name="steam_form"] > input[type="image"]').click()
            } else if (document.getElementById('nickname') != null) {
                chrome.runtime.sendMessage({requiredNick: true})
            } else {
                chrome.runtime.sendMessage({errorVoteNoElement: true})
            }
        }
        
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack})
    }
}

async function getProject() {
    const projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsListForge', data=>{
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
