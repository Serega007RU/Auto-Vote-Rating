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

        if (document.querySelector('div.ui.success.message') != null) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }

        if (document.querySelector('div.ui.error.message') != null) {
            if (document.querySelector('div.ui.error.message').textContent.includes('must wait until tomorrow')) {
                chrome.runtime.sendMessage({later: true})
                return
            }
            chrome.runtime.sendMessage({message: document.querySelector('div.ui.error.message').textContent})
            return
        }

        //Если на странице есть кнопка входа через Steam то жмём её
        if (document.querySelector('#serverPage > div > a > img') != null) {
            document.querySelector('#serverPage > div > a > img').click()
            return
        }

        if (first) return

        const nick = await getNickName()
        console.log(nick)
        if (nick == null) return
        if (document.querySelector('input[name="username"]') != null) {
            if (nick == '') {
                chrome.runtime.sendMessage({requiredNick: true})
                return
            }
            document.querySelector('input[name="username"]').value = nick
        }
        document.querySelector('#serverPage > form button[type="submit"]').click()
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
    }
}

async function getNickName() {
    const storageArea = await new Promise(resolve=>{
        chrome.storage.local.get('storageArea', data=>{
            resolve(data['storageArea'])
        })
    })
    const projects = await new Promise(resolve=>{
        chrome.storage[storageArea].get('AVMRprojectsBestServersCom', data=>{
            resolve(data['AVMRprojectsBestServersCom'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.id)) {
            return project.nick
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}
