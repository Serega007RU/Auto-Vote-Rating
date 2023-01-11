//Фикс-костыль двойной загрузки (для Rocket Loader)
if (!window.loaded) {
    window.loaded = true
    // noinspection JSIgnoredPromiseFromCall
    run()
}

chrome.runtime.onMessage.addListener(function(request/*, sender, sendResponse*/) {
    if (request.sendProject) {
        window.proj = request.project
        if (request.vkontakte) window.vkontakte = request.vkontakte
    } else if (request === 'captchaPassed') {
        // noinspection JSIgnoredPromiseFromCall
        startVote(false)
    }
})

async function run() {
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
                    chrome.runtime.sendMessage({errorVoteNoElement: e.stack + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
                    clearInterval(timer2)
                }
            }, 1000)
            return
        }

        //Если мы находися на странице авторизации ВКонтакте
        if (document.URL.match(/vk.com\/*/)) {
            // TODO нужно полностью переписать тут всю логику под новую версию интерфейса ВК
            if (document.querySelector('.vkc__AuthRoot__contentIn')) {
                const timer = setInterval(()=>{
                    if (document.querySelector('.vkc__AcceptPrivacyPolicy__content button[type="submit"]')) {
                        clearInterval(timer)
                        document.querySelector('.vkc__AcceptPrivacyPolicy__content button[type="submit"]').click()
                    }
                }, 1000)
                return
            }
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
                const timer4 = setTimeout(()=>{//Да это костыль, а есть вариант по лучше?
                    chrome.runtime.sendMessage({discordLogIn: true})
                }, 10000)
                window.onbeforeunload = ()=> clearTimeout(timer4)
                window.onunload = ()=> clearTimeout(timer4)
            }
            return
        }

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
            const timer5 = setInterval(()=>{
                if (document.querySelector('#cf-norobot-container input[type="button"]')) {
                    clearInterval(timer5)
                    document.querySelector('#cf-norobot-container input[type="button"]').click()
                }
            }, 1000)
            return
        }

        //Если идёт проверка CloudFlare
        if (document.getElementById('cf-content')) {
            return
        }
        if (document.getElementById('cf-wrapper')) {
            if (document.querySelector('span[data-translate="complete_sec_check"]') == null && document.querySelector('span[data-translate="managed_checking_msg"]') == null) {
                const request = {}
                if (document.querySelector('#cf-error-details h1')) {
                    request.message = document.querySelector('#cf-error-details h1').textContent.trim()
                } else {
                    request.message = document.body.innerText.trim()
                }
                request.ignoreReport = true
                chrome.runtime.sendMessage(request)
            }
            return
        }

        //Если мы находимся на странице проверки ReCaptcha
        if (document.querySelector('body > iframe') && document.querySelector('body > iframe').src.startsWith('https://geo.captcha-delivery.com/captcha/')) {
            return
        }

        //Совместимость с jQuery
        for (const script of document.querySelectorAll('script')) {
            if (script.src.toLowerCase().includes('jquery')) {
                await new Promise(resolve => {
                    const timer6 = setInterval(()=>{
                        for (const entry of window.performance.getEntries()) {
                            if (entry.name.toLowerCase().includes('jquery')) {
                                clearInterval(timer6)
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
        if (typeof vote === 'function' && window.proj != null) {
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
    return window.proj
}

function throwError(error) {
    let message
    if (error.stack) {
        // noinspection JSUnresolvedVariable
        if (self.evalCore) {
            message = error.toString()
        } else {
            message = error.stack
        }
    } else {
        message = error
    }

    const request = {}
    request.errorVoteNoElement = message + (document.body.innerText.trim().length < 150 ? ' ' + document.body.innerText.trim() : '')
    if (request.errorVoteNoElement.includes('500') && request.errorVoteNoElement.includes('Internal Server Error')) {
        request.ignoreReport = true
    }
    if (document.location.pathname === '/' && document.location.search === '') {
        request.ignoreReport = true
    }

    chrome.runtime.sendMessage(request)
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Костыль для FireFox
if (typeof result === 'undefined') {
    // noinspection ES6ConvertVarToLetConst
    var result = ''
}
// noinspection BadExpressionStatementJS
result