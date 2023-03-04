let openedModal = false

async function vote(first) {
    // if (first) await wait(Math.floor(Math.random() * 3000 + 1000))

    if (querySelector('div.alert.alert-success')) {
        const message = querySelector('div.alert.alert-success', true).textContent
        if (message.includes('vote was successfully')
            || message.includes('hlas byl úspěšně přijatý')
            || message.includes('hlas bol úspešne prijatý')
            || message.includes('Dein Vote wurde akzeptiert')
            || message.includes('Tvůj hlas byl úspěšne přijatý')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
            chrome.runtime.sendMessage({message})
        }
        return
    }
    if (querySelector('div.alert.alert-info')) {
        const message = querySelector('div.alert.alert-info', true).textContent
        if (message.includes('next vote')
            || message.includes('možný hlas za tento server můžeš odeslat')
            || message.includes('možný hlas za tento server môžeš odoslať')
            || message.includes('nächster Vote')) {
            const numbers = message.match(/\d+/g).map(Number)
            chrome.runtime.sendMessage({later: Date.UTC(numbers[2], numbers[1] - 1, numbers[0], numbers[3], numbers[4], numbers[5]) + 3600000})
        } else {
            chrome.runtime.sendMessage({message})
        }
        return
    }
    if (querySelector('div.alert.alert-error')) {
        const message = querySelector('div.alert.alert-error', true).textContent
        if (message.includes('next vote')
            || message.includes('možný hlas za tento server můžeš odeslat')
            || message.includes('možný hlas za tento server môžeš odoslať')
            || message.includes('nächster Vote')) {
            const numbers = message.match(/\d+/g).map(Number)
            chrome.runtime.sendMessage({later: Date.UTC(numbers[2], numbers[1] - 1, numbers[0], numbers[3], numbers[4]) + 3600000})
        } else {
            chrome.runtime.sendMessage({message})
        }
    }

    if (querySelector('body #tracy-error')) {
        chrome.runtime.sendMessage({
            message: querySelector('body #tracy-error', true).innerText,
            ignoreReport: true
        })
        return
    }
    if (querySelector('body #server-error')) {
        chrome.runtime.sendMessage({
            message: querySelector('body #server-error', true).innerText,
            ignoreReport: true
        })
        return
    }
    // Костыль
    if ((document.location.pathname.split('/')[1] === 'cz' || document.location.pathname.split('/')[1] === 'cs' || document.location.pathname.split('/')[1] === 'sk') && !document.location.pathname.split('/')[2]) {
        const request = {}
        request.errorVoteNoElement = 'Redirected to server list'
        request.ignoreReport = true
        chrome.runtime.sendMessage(request)
        return
    }

    const project = await getProject('CraftList')

    if (first && !openedModal) {
        openedModal = true
        const btnText = querySelector('.sidebar .card-body .btn', first)?.textContent
        if (btnText &&
            (btnText.includes('possible vote')
            || btnText.includes('možný hlas')
            || btnText.includes('ist möglich'))) {
            const numbers = btnText.match(/\d+/g).map(Number)
            const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000) + (numbers[2] * 1000)
            chrome.runtime.sendMessage({later: Date.now() + milliseconds})
            return
        } else {
            querySelector('.sidebar .card-body .btn', first)?.click()
        }

        const timeout = querySelector('#voteModal p.text-center')
        if (timeout) {
            const hours = timeout.textContent.match(/\d+/g).map(Number)[0]
            const milliseconds = (hours * 60 * 60 * 1000)
            if (project.timeout == null || project.timeout !== milliseconds) {
                project.timeout = milliseconds
                chrome.runtime.sendMessage({changeProject: project})
            }
        }
        return
    }

    querySelectorAll('.modal-body input', true).value = project.nick

    querySelectorAll('.modal-footer button', true).click()
}

const timer = setInterval(() => {
    const message = querySelectorAll('.modal-body .text-danger')
    if (message && message.innerText.length > 3) {
        clearInterval(timer)
        setTimeout(() => {
            chrome.runtime.sendMessage({message})
        }, 15000)
    }
}, 1000)

function querySelectorAll(selector, required) {
    const elements = document.querySelectorAll(selector)
    const results = []
    for (const element of elements) {
        const result = isVisible(element)
        if (result === true) return element
        results.push(result)
    }
    if (required) throw selector + ' ' + results.toString()
}

function querySelector(selector, required) {
    const element = document.querySelector(selector)
    const result = isVisible(element)
    if (result === true) return element
    if (required) throw selector + ' ' + result
}

// https://stackoverflow.com/a/41698614/11235240
function isVisible(elem) {
    if (!(elem instanceof Element)) return 'element null'
    elem.scrollIntoView({block: 'center'})
    const style = getComputedStyle(elem)
    if (style.display === 'none') {
        return 'style display none'
    }
    if (style.visibility !== 'visible') {
        return 'visibility'
    }
    if (style.opacity && style.opacity < 0.5) {
        return 'opacity'
    }

    // 1 пиксель?
    if (elem.offsetHeight < 16 || elem.offsetWidth < 16) {
        return 'offset'
    }
    // if (!getText(elem)) return false // Есть текст?

    if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
        elem.getBoundingClientRect().width === 0) {
        return 'offset bounding'
    }

    const elemCenter   = {
        x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
        y: elem.getBoundingClientRect().top + elem.offsetHeight / 2
    };
    if (elemCenter.x < 0) {
        return 'pixel x'
    }
    if (elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)) {
        return 'pixel y'
    }

    // TODO если элемент вне видимости страницы то это плохо
    if (elemCenter.y < 0) return true
    if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return true

    // TODO если мы видим bframe reCAPTCHA то значит искомый элемент в любом случае будет невидим
    for (const iframe of [...document.querySelectorAll('iframe[src*="https://www.google.com/recaptcha/api2/bframe"]'), ...document.querySelectorAll('iframe[src*="https://www.recaptcha.net/recaptcha/api2/bframe"]')]) {
        if (window.getComputedStyle(iframe).visibility === 'visible') {
            return true
        }
    }

    let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y)
    do {
        if (pointContainer === elem || pointContainer?.style?.display) return true;
    } while (pointContainer = pointContainer.parentNode)
    return 'end'
}
