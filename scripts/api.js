let proj
chrome.runtime.onMessage.addListener(function(request/*, sender, sendResponse*/) {
    if (request.sendProject) {
        proj = request.project
    }
})

try {
    //Если мы находимся на странице авторизации Steam
    if (document.URL.startsWith('https://steamcommunity.com/openid/login')) {
        document.getElementById('imageLogin').click()
        const timer2 = setInterval(()=>{
            try {
                if (document.getElementById('error_display').style.display !== 'none') {
                    chrome.runtime.sendMessage({message: document.getElementById('error_display').textContent})
                    clearInterval(timer2)
                } else if ((document.querySelector('div.newmodal') != null && document.querySelector('div.newmodal').style.display !== 'none')
                    || (document.querySelector('div.login_modal.loginAuthCodeModal') != null && document.querySelector('div.login_modal.loginAuthCodeModal').style.display !== 'none')
                    || (document.querySelector('div.login_modal.loginTwoFactorCodeModal') != null && document.querySelector('div.login_modal.loginTwoFactorCodeModal').style.display !== 'none')
                    || (document.querySelector('div.login_modal.loginIPTModal') != null && document.querySelector('div.login_modal.loginIPTModal').style.display !== 'none')) {
                        chrome.runtime.sendMessage({authSteam: true})
                        clearInterval(timer2)
                }
            } catch (e) {
                chrome.runtime.sendMessage({errorVoteNoElement2: e.stack + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
                clearInterval(timer2)
            }
        }, 1000)
    } else if (document.URL.includes('vk.com/')) {
        let text
        if (document.querySelector('div.oauth_form_access') != null) {
            text = document.querySelector('div.oauth_form_access').textContent.replace(document.querySelector('div.oauth_access_items').textContent, '').trim()
        } else if (document.querySelector('div.oauth_content > div') != null) {
            text = document.querySelector('div.oauth_content > div').textContent
        } else if (document.querySelector('#login_blocked_wrap') != null) {
            text = document.querySelector('#login_blocked_wrap div.header').textContent + ' ' + document.querySelector('#login_blocked_wrap div.content').textContent.trim()
        } else if (document.querySelector('div.login_blocked_panel') != null) {
            text = document.querySelector('div.login_blocked_panel').textContent.trim()
        } else {
            text = 'null'
        }
        chrome.runtime.sendMessage({errorAuthVK: text})
    } else {
        let check = true
        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            check = false
            //Фикс CloudFlare если 2 проверки накладываются друг на друга
            if (document.URL.includes('__cf_chl_jschl_tk__')) {

                function removeURLParameter(url, parameter) {
                    //prefer to use l.search if you have a location/link object
                    const urlparts = url.split('?')
                    if (urlparts.length >= 2) {

                        const prefix = encodeURIComponent(parameter) + '='
                        const pars = urlparts[1].split(/[&;]/g)

                        //reverse iteration as may be destructive
                        for (let i = pars.length; i-- > 0;) {
                            //idiom for string.startsWith
                            if (pars[i].lastIndexOf(prefix, 0) !== -1) {  
                                pars.splice(i, 1)
                            }
                        }
                
                        return urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : '')
                    }
                    return url
                }
                
                let url = removeURLParameter(document.URL, '__cf_chl_jschl_tk__')
                document.location.replace(url)
            }
        }
        //Если идёт проверка CloudFlare
        if (document.querySelector('#cf-content > h1 > span') != null) {
            check = false
        }
        //Если мы находимся на странице проверки ReCaptcha
        if (document.querySelector('body > iframe') != null && document.querySelector('body > iframe').src.startsWith('https://geo.captcha-delivery.com/captcha/')) {
            check = false
        }

        if (check) {
            window.onmessage = function(e) {
                if (e.data === 'vote') {
                    vote(false)
                } else if (e.data === 'voteReady') {
                    vote()
                }
            }
            vote(true)
        }
    }
} catch (e) {
    throwError(e)
}

async function getProject() {
    if (proj == null) {
        return await new Promise(resolve => {
            setInterval(()=>{
                if (proj != null) resolve(proj)
            }, 100)
        })
    } else {
        return proj
    }
}

function throwError(error) {
    let message
    if (error.message === 'errorVoteNoNick2') {
        chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
        return
    } else if (error.stack) {
        message = error.stack
    } else {
        message = error
    }

    chrome.runtime.sendMessage({errorVoteNoElement2: message + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
}