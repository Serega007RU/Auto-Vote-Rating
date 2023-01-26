async function vote() {
    if (document.querySelector('div.MsgBox') != null && document.querySelector('div.MsgBox').innerText.length > 0) return

    if (document.querySelector('div.ui.error.message') != null) {
        if (document.querySelector('div.ui.error.message').textContent.includes('must wait until tomorrow')) {
            await wait(Math.floor(Math.random() * 9000 + 1000))
            chrome.runtime.sendMessage({later: true})
            return
        }
        await wait(Math.floor(Math.random() * 9000 + 1000))
        chrome.runtime.sendMessage({message: document.querySelector('div.ui.error.message').textContent})
        return
    }

    //Если на странице есть кнопка входа через Steam, то жмём её
    if (document.querySelector('a[href="/steam_login"]') != null) {
        await wait(Math.floor(Math.random() * 9000 + 1000))
        document.querySelector('a[href="/steam_login"]').click()
        return
    }

    if (document.querySelector('div.general > .card > div.card-body h1')) {
        const request = {}
        request.message = document.querySelector('div.general > .card > div.card-body').innerText
        if (request.message.includes('Страница не найдена')) {
            request.ignoreReport = true
        }
        chrome.runtime.sendMessage(request)
        return
    }

    const btn = document.querySelector('#main .card-body .btn.btn-blue')
    if (btn) {
        if (!isVisible(btn)) {
            await wait(Math.floor(Math.random() * 9000 + 1000))
            chrome.runtime.sendMessage({message: 'Кнопка голосования невидимая! Защита от авто-голосования? Сообщите разработчику расширения о данной ошибке!'})
            return
        }
        const message = getText(btn)
        if (message.includes('ч.')) {
            const numbers = message.match(/\d+/g).map(Number)
            const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000)/* + (sec * 1000)*/
            await wait(Math.floor(Math.random() * 9000 + 1000))
            chrome.runtime.sendMessage({later: Date.now() + milliseconds})
        } else {
            chrome.runtime.sendMessage({message: 'Что-то не так с кнопкой голосования, ' + message})
        }
    } else {
        const event = new Event('mousemove')
        document.body.dispatchEvent(event)

        let waiting = false
        let timer2 = setInterval(async () => {
            try {
                if (waiting) return
                let buttons = findVoteButton()
                if (buttons.length === 0) return
                let button = buttons[buttons.length - 1]
                if (!button) return
                // const message = getText(button)
                if (!isVisible(button)) {
                    clearInterval(timer2)
                    await wait(Math.floor(Math.random() * 9000 + 1000))
                    chrome.runtime.sendMessage({message: 'Кнопка голосования стала невидимая! Защита от авто-голосования? Сообщите разработчику расширения о данной ошибке!'})
                } else if ((button.disabled == null || button.disabled === false) && button.getAttribute('disabled') == null) {
                    waiting = true
                    await wait(Math.floor(Math.random() * 9000 + 1000))
                    buttons = findVoteButton()
                    if (buttons.length === 0) {
                        waiting = false
                        return
                    }
                    button = buttons[buttons.length - 1]
                    if (!button) {
                        waiting = false
                        return
                    }
                    clearInterval(timer2)
                    const event = new Event('mousemove')
                    document.body.dispatchEvent(event)
                    button.click()
                }
            } catch (e) {
                clearInterval(timer2)
                throwError(e)
            }
        }, 1000)
    }
}

const timer = setInterval(async ()=>{
    try {
        const msg = document.querySelector('div.MsgBox')
        if (msg != null && msg.innerText.length > 0) {
            clearInterval(timer)
            const message = msg.innerText
            if (message.includes('уже проголосовали')) {
                await wait(Math.floor(Math.random() * 9000 + 1000))
                chrome.runtime.sendMessage({later: true})
            } else if (message.includes('Голос принят')) {
                chrome.runtime.sendMessage({successfully: true})
            } else if (message.includes('Авторизация')) {
                chrome.runtime.sendMessage({auth: true})
            } else {
                await wait(Math.floor(Math.random() * 9000 + 1000))
                chrome.runtime.sendMessage({message})
            }
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 200)

// https://stackoverflow.com/a/41698614/11235240
function isVisible(elem) {
    if (!(elem instanceof Element)) throw Error('DomUtil: elem is not an element.')
    elem.scrollIntoView({block: 'center'})
    const style = getComputedStyle(elem)
    if (style.display === 'none') return false
    if (style.visibility !== 'visible') return false
    if (style.opacity && style.opacity < 0.5) return false

    if (elem.offsetHeight < 40 || elem.offsetWidth < 40) return false // 1 пиксель?
    // if (!getText(elem)) return false // Есть текст?

    if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
        elem.getBoundingClientRect().width === 0) {
        return false
    }
    const elemCenter   = {
        x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
        y: elem.getBoundingClientRect().top + elem.offsetHeight / 2
    };
    if (elemCenter.x < 0) return false
    if (elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)) return false
    // TODO если элемент вне видимости страницы то это плохо
    if (elemCenter.y < 0) return true
    if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return true
    let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y)
    do {
        if (pointContainer === elem) return true;
    } while (pointContainer = pointContainer.parentNode)
    return false
}

function findVoteButton() {
    const elements = []
    for (const elem of document.querySelector('#main .card-body').querySelectorAll('*')) {
        if (isVisible(elem)) {
            elements.push(elem)
        }
    }
    return elements
}

function findElement(text) {
    const result = []
    for (const element of document.querySelectorAll("*")) {
        const txt = getText(element)
        if (txt && txt.toLowerCase() === text) {
            result.push(element)
        }
    }
    return result
}

function getText(elem) {
    if (!(elem instanceof Element)) throw Error('DomUtil: elem is not an element.')
    // https://stackoverflow.com/a/60263053/11235240
    let prop = window.getComputedStyle(elem, '::before').getPropertyValue('content')
    let text
    if (!prop || prop === 'none' || prop === 'normal') prop = window.getComputedStyle(elem, '::after').getPropertyValue('content')
    if (!prop || prop === 'none' || prop === 'normal') {
        if (elem.innerText && elem.innerText.length > 3) text = elem.innerText
    } else if (prop.length > 3) {
        text = prop
    }
    if (!text) return null
    return text.replaceAll('"', '')
}

// TODO не работает на ::after content: 'текст'
// function findElement(text) {
//     // https://stackoverflow.com/a/29289196/11235240
//     const xPathResult = document.evaluate(xpathPrepare(text), document, null, XPathResult.ANY_TYPE, null)
//
//     // https://stackoverflow.com/a/47017702/11235240
//     const nodes = []
//     let node = xPathResult.iterateNext()
//     while (node) {
//         nodes.push(node)
//         node = xPathResult.iterateNext()
//     }
//     return nodes
// }
//
// // https://stackoverflow.com/a/8474109/11235240
// function xpathPrepare(searchString) {
//     const xpath = "//text()[contains(translate(., '$u', '$l'), '$s')]";
//     return xpath.replace("$u", searchString.toUpperCase())
//         .replace("$l", searchString.toLowerCase())
//         .replace("$s", searchString.toLowerCase());
// }