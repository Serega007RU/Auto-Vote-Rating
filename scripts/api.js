//Фикс-костыль двойной загрузки (для Rocket Loader)
if (typeof loaded === 'undefined') {
    // noinspection ES6ConvertVarToLetConst
    var proj
    // noinspection ES6ConvertVarToLetConst
    var vkontakte
    // noinspection ES6ConvertVarToLetConst
    var loaded = true
    run()
}

async function run() {
    chrome.runtime.onMessage.addListener(function(request/*, sender, sendResponse*/) {
        if (request.sendProject) {
            proj = request.project
            if (request.vkontakte) vkontakte = request.vkontakte
        } else if (request === 'reloadCaptcha') {
            document.querySelector('iframe[title="reCAPTCHA"]').contentWindow.postMessage('reloadCaptcha', '*')
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
                    } else if ((document.querySelector('div.newmodal') && document.querySelector('div.newmodal').style.display !== 'none')
                        || (document.querySelector('div.login_modal.loginAuthCodeModal') && document.querySelector('div.login_modal.loginAuthCodeModal').style.display !== 'none')
                        || (document.querySelector('div.login_modal.loginTwoFactorCodeModal') && document.querySelector('div.login_modal.loginTwoFactorCodeModal').style.display !== 'none')
                        || (document.querySelector('div.login_modal.loginIPTModal') && document.querySelector('div.login_modal.loginIPTModal').style.display !== 'none')
                        || (document.querySelector('div.login_modal.loginAuthCodeModal') && document.querySelector('div.login_modal.loginAuthCodeModal').style.display !== 'none')
                        || document.querySelector('#loginForm')) {
                        chrome.runtime.sendMessage({authSteam: true})
                        clearInterval(timer2)
                    }
                } catch (e) {
                    chrome.runtime.sendMessage({errorVoteNoElement2: e.stack + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
                    clearInterval(timer2)
                }
            }, 1000)
            return
        }

        //Если мы находися на странице авторизации ВКонтакте
        if (document.URL.match(/vk.com\/*/)) {
            let text
            let notAuth = false
            if (document.querySelector('div.oauth_form_access')) {
                text = document.querySelector('div.oauth_form_access').textContent.replace(document.querySelector('div.oauth_access_items').textContent, '').trim()
                notAuth = true
            } else if (document.querySelector('div.oauth_content > div')) {
                text = document.querySelector('div.oauth_content > div').textContent
                notAuth = true
            } else if (document.querySelector('#login_blocked_wrap')) {
                text = document.querySelector('#login_blocked_wrap div.header').textContent + ' ' + document.querySelector('#login_blocked_wrap div.content').textContent.trim()
            } else if (document.querySelector('div.login_blocked_panel')) {
                text = document.querySelector('div.login_blocked_panel').textContent.trim()
            } else if (document.querySelector('.profile_deleted_text')) {
                text = document.querySelector('.profile_deleted_text').textContent.trim()
                notAuth = true
            } else if (document.URL.startsWith('https://vk.com/join')) {
                text = chrome.i18n.getMessage('notRegVK')
                notAuth = true
            } else if (document.body.innerText.length < 500) {
                text = document.body.innerText
            } else {
                text = 'null'
            }
            chrome.runtime.sendMessage({errorAuthVK: text, notAuth})
            return
        }

        //Если мы находися на странице авторизации Дискорд
        if (document.URL.match(/discord.com\/*/)) {
            if (document.URL.includes('%20guilds') || document.URL.includes('%20email') || document.URL.includes('+email') || !document.URL.includes('prompt=none')) {
                let url = document.URL
                //Пилюля от жадности в правах
                url = url.replace('%20guilds.join', '')
                url = url.replace('%20guilds', '')
                url = url.replace('%20email', '')
                url = url.replace('+email', '')
                //Заставляем авторизацию авторизоваться не беспокоя пользователя если права уже были предоставлены
                if (!document.URL.includes('prompt=none')) url = url.concat('&prompt=none')
                document.location.replace(url)
            } else {
                const timer = setTimeout(()=>{//Да это костыль, а есть вариант по лучше?
                    chrome.runtime.sendMessage({discordLogIn: true})
                }, 10000)
                window.onbeforeunload = ()=> clearTimeout(timer)
                window.onunload = ()=> clearTimeout(timer)
            }
            return
        }

        const script = document.createElement('script')
        script.textContent = `
        Object.defineProperty(document, 'visibilityState', {
            get() {
                return 'visible'
            }
        })
        Object.defineProperty(document, 'hidden', {
            get() {
                return false
            }
        })
        `
        document.head.appendChild(script)

        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]')) {
            return
        }

        // Bot Verification https://gyazo.com/04797d3f1ba6b9b90c48d1dd57d305a2
        if (document.querySelector('title')?.textContent?.includes('Bot Verification') || document.querySelector('#recaptchadiv')) {
            return
        }

        //Если идёт проверка (новый CloudFlare?)
        if (document.querySelector('#challenge-form')) {
            //Если нам требуется нажать на "Verify you are human" https://gyazo.com/56426c80a3072e5b4d565949af7da81b
            if (document.querySelector('#cf-norobot-container input')) {
                document.querySelector('#cf-norobot-container input').click()
            }
            return
        }

        //Если идёт проверка CloudFlare
        if (document.getElementById('cf-content')) {
            return
        }
        if (document.getElementById('cf-wrapper')) {
            if (document.querySelector('span[data-translate="complete_sec_check"]') == null && document.querySelector('span[data-translate="managed_checking_msg"]') == null) {
                chrome.runtime.sendMessage({message: document.body.innerText.trim()})
            }
            return
        }

        //Если мы находимся на странице проверки ReCaptcha
        if (document.querySelector('body > iframe') && document.querySelector('body > iframe').src.startsWith('https://geo.captcha-delivery.com/captcha/')) {
            return
        }

        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (request === 'vote') {
                sendResponse('startedVote')
                startVote(false)
            }
        })

        //Совместимость с jQuery
        for (const script of document.querySelectorAll('script')) {
            if (script.src.toLowerCase().includes('jquery')) {
                await new Promise(resolve => {
                    const timer = setInterval(()=>{
                        for (const entry of window.performance.getEntries()) {
                            if (entry.name.toLowerCase().includes('jquery')) {
                                clearInterval(timer)
                                resolve()
                                break
                            }
                        }
                    }, 1000)
                })
                break
            }
        }
        startVote(true)
    } catch (e) {
        throwError(e)
    }

    const timer1 = setInterval(()=>{
        if (document.querySelector('head > captcha-widgets')) {
            document.querySelectorAll('.captcha-solver').forEach(el => {
                if (el.dataset.state === 'solved') {
                    startVote(false)
                    clearInterval(timer1)
                }
            })
        }
    })
}

async function startVote(first) {
    const timer3 = setInterval(async ()=>{
        if (typeof vote === 'function') {
            clearInterval(timer3)
            try {
                await vote(first)
            } catch (e) {
                throwError(e)
            }
        }
    }, 100)
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

    chrome.runtime.sendMessage({errorVoteNoElement2: message + (document.body.innerText.trim().length < 150 ? ' ' + document.body.innerText.trim() : '')})
}

//Костыль для FireFox
if (typeof result === 'undefined') {
    // noinspection ES6ConvertVarToLetConst
    var result = ''
}
// noinspection BadExpressionStatementJS
result