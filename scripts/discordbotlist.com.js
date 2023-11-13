let timer4, timer5

async function vote(first) {
    // https://cdn.discordapp.com/attachments/572131636934737921/1100021083891048458/image.png
    if (document.querySelector('body > h1')?.textContent.includes('Backend fetch failed')) {
        chrome.runtime.sendMessage({message: document.documentElement.innerText, ignoreReport: true})
        return
    }

    if (document.querySelector('.main-content').innerText.includes('ogging you in')) {
        await new Promise(resolve => {
            const timer1 = setInterval(() => {
                if (!document.querySelector('.main-content').innerText.includes('ogging you in')) {
                    clearInterval(timer1)
                    resolve()
                }
            }, 1000)
        })
    }

    const login = findElement('a', ['log in'])
    if (login) {
        login.click()
        return
    }

    const captcha = document.querySelector('div.turnstile.text-center')

    if (captcha && first) return

    if (timer4 != null || timer5 != null) return

    timer4 = setInterval(() => {
        const vote = findElement('button', ['upvote'])
        if (vote && !vote.disabled) {
            clearInterval(timer4)
            vote.click()

            timer5 = setInterval(() => {
                const vote2 = findElement('button', ['upvote anyway'])
                if (vote2 && !vote2.disabled) {
                    clearInterval(timer5)
                    vote2.click()
                }
            }, 1000)
        }
    }, 1000)
}

const timer2 = setInterval(()=>{
    try {
        const result = findElement('h1', ['thank you for voting', 'one more thing...'])
        if (result) {
            clearInterval(timer2)
            if (result.textContent.toLowerCase().includes('thank you for voting') || (result.parentElement.textContent.toLowerCase().includes('one more thing...') && result.parentElement.textContent.toLowerCase().includes('how would you rate your experience using'))) {
                chrome.runtime.sendMessage({successfully: true})
            }
            return
        } else {
            for (const el of document.querySelectorAll('link')) {
                if (el.href.includes('thanks')) {
                    chrome.runtime.sendMessage({successfully: true})
                    clearInterval(timer2)
                    return
                }
            }
            if (document.location.pathname.split('/').includes('thanks') || document.location.pathname.split('/').includes('rate')) {
                chrome.runtime.sendMessage({successfully: true})
                clearInterval(timer2)
                return
            }
        }
        //Костыль, на servers при успешном голосовании тупо перекидывает на страницу проекта
        if (document.querySelector('.upvotes') != null) {
            chrome.runtime.sendMessage({successfully: true})
            clearInterval(timer2)
        }
    } catch (e) {
        clearInterval(timer2)
        throwError(e)
    }
}, 1000)

const timer3 = setInterval(()=>{
    try {
        if (document.querySelector('div[role="status"]')?.children.length > 0) {
            const request = {}
            request.message = ''
            for (const el of document.querySelector('.toasted-container').children) {
                request.message = request.message + el.textContent + ' '
            }

            if (request.message.includes('already voted')) {
                clearTimeout(timer3)
                chrome.runtime.sendMessage({later: true})
            } else if (request.message.includes('Captcha failed')) {
                // None
            } else {
                if (request.message.includes('must watch the ad to upvote') || request.message.includes('Invalid')) {
                    request.ignoreReport = true
                }
                chrome.runtime.sendMessage(request)
            }
        }
    } catch (e) {
        clearInterval(timer3)
        throwError(e)
    }
}, 1000)

function findElement(selector, text) {
    for (const element of document.querySelectorAll(selector)) {
        for (const t of text) {
            if (element.textContent.toLowerCase().includes(t) || element.innerText.toLowerCase().includes(t)) {
                return element
            }
        }
    }
}