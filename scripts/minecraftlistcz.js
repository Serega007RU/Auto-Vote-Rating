let reasonInvincible

async function vote(first) {
    if (document.body.innerHTML.length === 0) {
        chrome.runtime.sendMessage({emptyError: true, ignoreReport: true})
        return
    }
    if (document.querySelector('.alert.alert-success')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('.alert.alert-primary')) {
        const request = {}
        request.message = document.querySelector('.alert.alert-primary').textContent.trim()
        if (request.message.includes('reCaptcha')) {
            return
        } else if (request.message.includes('si hlasoval')) {
            chrome.runtime.sendMessage({later: true})
            return
        } else {
            if (!request.message.includes('server u nás nemá nakonfigurované hlasování')) {
                chrome.runtime.sendMessage(request)
                return
            }
        }
    }
    if (document.querySelector('.alert.alert-danger')) {
        const request = {}
        request.message = document.querySelector('.alert.alert-danger').textContent.trim()
        chrome.runtime.sendMessage(request)
        return
    }
    if (document.querySelector('div.content.content-full h1')) {
        const request = {}
        request.message = document.querySelector('div.content.content-full h1').textContent.trim() + ' ' + document.querySelector('div.content.content-full h2').textContent.trim()
        if (request.message.includes('ale tato stránka nebyla nalezena')) {
            request.ignoreReport = true
        }
        chrome.runtime.sendMessage(request)
        return
    }
    if (document.querySelector('#vote-form').textContent.includes('si hlasoval')) {
        chrome.runtime.sendMessage({later: true})
        return
    }

    if (first) return

    const project = await getProject('MinecraftListCZ')
    document.querySelector('input[name="username"]').value = project.nick
    const gdpr = document.querySelector('a[href="https://www.minecraft-list.cz/gdpr"]')?.parentElement?.parentElement?.querySelector('input')
    if (!gdpr || !isVisible(gdpr) || gdpr.getAttribute('style')) {
        if (!gdpr) {
            reasonInvincible = 'is null'
        } else if (gdpr.getAttribute('style')) {
            reasonInvincible = 'style'
        }
        chrome.runtime.sendMessage({message: "Agree (Souhlasím) is not visible, " + reasonInvincible + ". Protection from auto-voting? Inform the extension developer about this error!"})
        return
    } else {
        gdpr.checked = true
    }

    document.querySelector('div.vote__box__buttonRow__button button[type="submit"]').click()
}

// https://stackoverflow.com/a/41698614/11235240
function isVisible(elem) {
    if (!(elem instanceof Element)) throw Error('DomUtil: elem is not an element.')
    elem.scrollIntoView({block: 'center'})
    const style = getComputedStyle(elem)
    if (style.display === 'none') {
        reasonInvincible = '1'
        return false
    }
    if (style.visibility !== 'visible') {
        reasonInvincible = '2'
        return false
    }
    if (style.opacity && style.opacity < 1) {
        reasonInvincible = '3'
        return false
    }

    // 1 пиксель?
    if (elem.offsetHeight < 16 || elem.offsetWidth < 16) {
        reasonInvincible = '4'
        return false
    }
    // if (!getText(elem)) return false // Есть текст?

    if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
        elem.getBoundingClientRect().width === 0) {
        reasonInvincible = '5'
        return false
    }
    const elemCenter   = {
        x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
        y: elem.getBoundingClientRect().top + elem.offsetHeight / 2
    };
    if (elemCenter.x < 0) {
        reasonInvincible = '6'
        return false
    }
    if (elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)) {
        reasonInvincible = '7'
        return false
    }
    // TODO если элемент вне видимости страницы то это плохо
    if (elemCenter.y < 0) return true
    if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return true
    let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y)
    do {
        if (pointContainer === elem) return true;
    } while (pointContainer = pointContainer.parentNode)
    reasonInvincible = '9'
    return false
}