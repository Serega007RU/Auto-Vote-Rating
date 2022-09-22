async function vote() {
    if (document.querySelector('div.MsgBox') != null && document.querySelector('div.MsgBox').innerText.length > 0) return

    if (document.querySelector('div.ui.error.message') != null) {
        if (document.querySelector('div.ui.error.message').textContent.includes('must wait until tomorrow')) {
            await wait(Math.floor(Math.random() * 10000))
            chrome.runtime.sendMessage({later: true})
            return
        }
        await wait(Math.floor(Math.random() * 10000))
        chrome.runtime.sendMessage({message: document.querySelector('div.ui.error.message').textContent})
        return
    }

    //Если на странице есть кнопка входа через Steam то жмём её
    if (document.querySelector('div.card-footer a[href="/steam_login"]') != null) {
        await wait(Math.floor(Math.random() * 10000))
        document.querySelector('div.card-footer a[href="/steam_login"]').click()
        return
    }

    // let button = document.querySelector('div.card-footer .btn.btn-blue:nth-child(2)')
    // if (!button) button = document.querySelector('div.card-footer .btn.btn-blue')
    const button = document.querySelector('.vote-page .btn.btn-blue')

    const event = new Event('mousemove')
    document.body.dispatchEvent(event)

    if (!isVisible(button)) {
        await wait(Math.floor(Math.random() * 10000))
        chrome.runtime.sendMessage({message: 'Кнопка голосования невидимая! Защита от авто-голосования? Сообщите разработчику расширения о данной ошибке!'})
        return
    }

    if (button.textContent.includes('ч.')) {
        const numbers = button.textContent.match(/\d+/g).map(Number)
        const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000)/* + (sec * 1000)*/
        await wait(Math.floor(Math.random() * 10000))
        chrome.runtime.sendMessage({later: Date.now() + milliseconds})
    } else {
        const timer2 = setInterval(async () => {
            if (!isVisible(button)) {
                clearInterval(timer2)
                await wait(Math.floor(Math.random() * 10000))
                chrome.runtime.sendMessage({message: 'Кнопка голосования стала невидимая! Защита от авто-голосования? Сообщите разработчику расширения о данной ошибке!'})
            } else if ((button.disabled == null || button.disabled === false) && button.getAttribute('disabled') == null) {
                clearInterval(timer2)
                const event = new Event('mousemove')
                document.body.dispatchEvent(event)
                await wait(Math.floor(Math.random() * 10000))
                button.click()
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
                await wait(Math.floor(Math.random() * 10000))
                chrome.runtime.sendMessage({later: true})
                await wait(Math.floor(Math.random() * 10000))
            } else if (message.includes('Голос принят')) {
                chrome.runtime.sendMessage({successfully: true})
            } else {
                await wait(Math.floor(Math.random() * 10000))
                chrome.runtime.sendMessage({message})
            }
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 200)

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// https://stackoverflow.com/a/41698614/11235240
function isVisible(elem) {
    if (!(elem instanceof Element)) throw Error('DomUtil: elem is not an element.')
    const style = getComputedStyle(elem)
    if (style.display === 'none') return false
    if (style.visibility !== 'visible') return false
    if (style.opacity < 0.1) return false

    if (elem.offsetHeight < 40 || elem.offsetWidth < 40) return false // 1 пиксель?
    if (elem.textContent.length <= 3) return false // Есть текст?

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
    if (elemCenter.y < 0) return false
    if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return false
    let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y)
    do {
        if (pointContainer === elem) return true;
    } while (pointContainer = pointContainer.parentNode)
    return false
}