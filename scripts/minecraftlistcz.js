async function vote(first) {
    if (document.querySelector('.alert.alert-success')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('.alert.alert-primary')) {
        if (document.querySelector('.alert.alert-primary').textContent.includes('si hlasoval')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('.alert.alert-primary').textContent.trim()})
        }
        return
    }
    if (document.querySelector('#vote-form').textContent.includes('si hlasoval')) {
        chrome.runtime.sendMessage({later: true})
        return
    }

    if (first) return

    const project = await getProject('MinecraftListCZ')
    document.querySelector('input[name="username"]').value = project.nick
    const gdpr = document.querySelector("#vote-form > div.row > div.col-lg-7 > div.vote__box__checkboxxx > div:nth-child(1) > input")
    if (!gdpr || !isVisible(gdpr) || gdpr.getAttribute('style')) {
        chrome.runtime.sendMessage({message: "Agree (Souhlasím) is not visible. Protection from auto-voting? Inform the extension developer about this error!"})
        return
    } else {
        gdpr.checked = true
    }

    document.querySelector('div.vote__box__buttonRow__button button[type="submit"]').click()
}

// https://stackoverflow.com/a/41698614/11235240
function isVisible(elem) {
    if (!(elem instanceof Element)) throw Error('DomUtil: elem is not an element.')
    const style = getComputedStyle(elem)
    if (style.display === 'none') return false
    if (style.visibility !== 'visible') return false
    if (style.opacity && style.opacity < 1) return false

    if (elem.offsetHeight < 16 || elem.offsetWidth < 16) return false // 1 пиксель?
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
    if (elemCenter.y < 0) return false
    if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return false
    let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y)
    do {
        if (pointContainer === elem) return true;
    } while (pointContainer = pointContainer.parentNode)
    return false
}