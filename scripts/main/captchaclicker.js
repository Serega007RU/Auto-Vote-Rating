let dontSolve = false
chrome.runtime.onMessage.addListener(function(request/*, sender, sendResponse*/) {
    if (!window.loadedCaptcha && request.sendProject) {
        window.loadedCaptcha = true
        if (request.settings.disabledClickCaptcha) {
            dontSolve = true
        }
        run()
    }
})

function run() {
    if (window.portAlert) {
        window.portAlert.addEventListener('state', event => {
            chrome.runtime.sendMessage({message: event.detail.message, ignoreReport: true})
        })
    }

    if (window.location.href.match(/https?:\/\/(.+?\.)?google.com\/recaptcha\/api\d\/anchor/) || window.location.href.match(/https?:\/\/(.+?\.)?recaptcha.net\/recaptcha\/api\d\/anchor/) || window.location.href.match(/https?:\/\/(.+?\.)?google.com\/recaptcha\/enterprise\/anchor*/) || window.location.href.match(/https?:\/\/(.+?\.)?recaptcha.net\/recaptcha\/enterprise\/anchor*/)) {
        const timer1 = setInterval(()=>{
            // noinspection CssInvalidHtmlTagReference
            if (dontSolve || document.querySelector('head > captcha-widgets')) {
                clearInterval(timer1)
                return
            }

            if (document.querySelector('#recaptcha-anchor > div.recaptcha-checkbox-border') != null
                && isScrolledIntoView(document.querySelector('#recaptcha-anchor > div.recaptcha-checkbox-border'))
                && document.querySelector('#recaptcha-anchor > div.recaptcha-checkbox-border').style.display !== 'none') {
                //Если в капче есть какая-либо ошибка, то капчу не стоит проходить
                if (document.querySelector('.rc-anchor-error-msg-container').style.display !== 'none' && document.querySelector('.rc-anchor-error-msg-container').textContent.length > 0) return
                document.querySelector('#recaptcha-anchor > div.recaptcha-checkbox-border').click()
                clearInterval(timer1)
            }
        }, 1000)

        //Проверяет прошла ли проверка ReCaptcha
        const timer2 = setInterval(()=>{
            //Если капча пройдена
            if (document.getElementsByClassName('recaptcha-checkbox-checked').length >= 1 || (document.getElementById('g-recaptcha-response') != null && document.getElementById('g-recaptcha-response').value.length > 0)) {
                clearInterval(timer2)
                chrome.runtime.sendMessage('captchaPassed')
            }

            if (document.querySelector('.rc-anchor-error-msg-container').style.display !== 'none' && document.querySelector('.rc-anchor-error-msg-container').textContent.length > 0) {
                const text = document.querySelector('.rc-anchor-error-msg-container').textContent
                if (text.includes('Try reloading the page')) {
                    document.location.reload()
                } else {
                    // https://i.imgur.com/WJ3ce9s.png
                    if (!text.includes('Время проверки истекло') && !text.includes('Verification challenge expired') && !text.includes('Verification expired') && !text.includes('La validation a expiré') && !text.includes('Platnost výzvy ověření vypršela')) {
                        chrome.runtime.sendMessage({errorCaptcha: document.querySelector('.rc-anchor-error-msg-container').textContent})
                        clearInterval(timer2)
                    }
                }
            }
        }, 1000)
    } else if ((window.location.href.match(/https?:\/\/(.+?\.)?google.com\/recaptcha\/api\d\/bframe/) || window.location.href.match(/https?:\/\/(.+?\.)?recaptcha.net\/recaptcha\/api\d\/bframe/) || window.location.href.match(/https?:\/\/(.+?\.)?google.com\/recaptcha\/enterprise\/bframe*/) || window.location.href.match(/https?:\/\/(.+?\.)?recaptcha.net\/recaptcha\/enterprise\/bframe*/)) && document.querySelector('head > yandex-captcha-solver') == null) {
        //Интеграция с расширением Buster: Captcha Solver for Humans
        let count = 0
        let repeat = 2
        const timer7 = setInterval(() => {

            if (document.getElementById('solver-button') != null && !document.getElementById('solver-button').className.includes('working') && !document.getElementById('recaptcha-verify-button').disabled) {
                if (document.querySelector('.rc-audiochallenge-error-message') != null && document.querySelector('.rc-audiochallenge-error-message').style.display !== 'none' && document.querySelector('.rc-audiochallenge-error-message').textContent > 0) {
                    repeat = 3
                }
                if (count >= repeat) {
                    chrome.runtime.sendMessage('reloadCaptcha')
                    clearInterval(timer7)
                    return
                }
                document.getElementById('solver-button').click()
                count++
            }

            if (document.querySelector('.rc-doscaptcha-body-text') != null && document.querySelector('.rc-doscaptcha-body-text').style.display !== 'none') {
                // https://i.imgur.com/q5BroJ7.png
                chrome.runtime.sendMessage({errorCaptcha: document.querySelector('.rc-doscaptcha-body-text').textContent})
                clearInterval(timer7)
            }

            // TODO костыльное временное решение нажатие на кнопку "Verify" для расширения NopeCHA методом решения капчи "Speech", подробнее https://github.com/NopeCHALLC/nopecha-extension/issues/11
            if (document.querySelector("#audio-response")?.value.length > 3) {
                clearInterval(timer7)
                document.querySelector("#recaptcha-verify-button")?.click()
            }
        }, 2000)

        const timer3 = setInterval(() => {
            //Если требуется ручное прохождение капчи
            if (document.getElementById("solver-button") == null && document.getElementById("rc-imageselect") != null && isScrolledIntoView(document.getElementById("rc-imageselect"))) {
                chrome.runtime.sendMessage({captcha: true})
                clearInterval(timer3)
            }
        }, 1000)
    } else if (window.location.href.match(/https?:\/\/(.+?\.)?google.com\/recaptcha\/api\/fallback*/) || window.location.href.match(/https?:\/\/(.+?\.)?recaptcha.net\/recaptcha\/api\/fallback*/) || window.location.href.match(/https?:\/\/(.+?\.)?google.com\/recaptcha\/enterprise\/fallback*/) || window.location.href.match(/https?:\/\/(.+?\.)?recaptcha.net\/recaptcha\/enterprise\/fallback*/)) {
        chrome.runtime.sendMessage({errorCaptcha: document.body.innerText.trim(), restartVote: true})
    } else if (window.location.href.match(/.hcaptcha.com\/captcha.v\d\//)) {
        const timer4 = setInterval(()=>{
            // noinspection CssInvalidHtmlTagReference
            if (dontSolve || document.querySelector('head > captcha-widgets')) {
                clearInterval(timer4)
                return
            }

            if (document.getElementById('checkbox') != null
                && isScrolledIntoView(document.getElementById('checkbox'))
                && document.getElementById('checkbox').style.display !== 'none') {
                document.getElementById('checkbox').click()
                clearInterval(timer4)
            }
        }, 1000)

        //Проверяет прошла ли проверка hCaptcha
        const timer5 = setInterval(()=>{
            if (document.getElementById('checkbox') != null && document.getElementById('checkbox').getAttribute('aria-checked') === 'true') {
                clearInterval(timer5)
                chrome.runtime.sendMessage('captchaPassed')
            }
        }, 1000)

        //Если требуется ручное прохождение капчи
        const timer6 = setInterval(()=>{
            if (document.querySelector('body[class="no-selection"]') != null && document.querySelector('body[class="no-selection"]').getAttribute('aria-hidden') == null && document.querySelector('body[class="no-selection"]').style.display === '' && document.querySelector('head > yandex-captcha-solver') == null) {
                clearInterval(timer6)
                chrome.runtime.sendMessage({captcha: true})
            } else if (document.querySelector('head > yandex-captcha-solver') != null && document.querySelector('div[style="text-align: right; color: rgb(218, 94, 94);"]') != null) {
                chrome.runtime.sendMessage({errorCaptcha: document.querySelector('div[style="text-align: right; color: rgb(218, 94, 94);"]').textContent})
                clearInterval(timer5)
            }
        }, 1000)

        // Если ошибка в капче https://i.imgur.com/EqEJoMr.png
        const timer9 = setInterval(() => {
            const status = document.querySelector('#status')
            if (status && status.style.display !== 'none' && status.innerText.length > 3) {
                chrome.runtime.sendMessage({errorCaptcha: status.innerText})
                clearInterval(timer9)
            }
        }, 1000)
    } else if (window.location.href.match(/https:\/\/challenges.cloudflare.com\/*/)) {
        //Если требуется ручное прохождение капчи CloudFlare
        const timer7 = setInterval(()=> {
            if (document.querySelector('#cf-norobot-container')) {
                clearInterval(timer7)
                document.querySelector('#cf-norobot-container span.mark').click()
            } else if (document.querySelector('#challenge-stage span.mark')) {
                clearInterval(timer7)
                document.querySelector('#challenge-stage span.mark').click()
            }
        }, 1000)

        // Если мы прошли капчу CloudFlare
        const timer8 = setInterval(() => {
            if (document.querySelector('#cf-stage #success')?.style.display !== 'none') {
                clearInterval(timer8)
                chrome.runtime.sendMessage('captchaPassed')
            }
        })
    }
}

function isScrolledIntoView(el) {
    const rect = el.getBoundingClientRect()
    const elemTop = rect.top
    const elemBottom = rect.bottom

    // Only completely visible elements return true:
    let isVisible// = (elemTop >= 0) && (elemBottom <= window.innerHeight);
    // Partially visible elements return true:
    isVisible = elemTop < window.innerHeight && elemBottom >= 0
    return isVisible
}