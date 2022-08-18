async function vote(first) {
    if (document.querySelector('.alert.alert-success') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('.alert.alert-primary') != null) {
        if (document.querySelector('.alert.alert-primary').textContent.includes('si hlasoval')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('.alert.alert-primary').textContent.trim()})
        }
        return
    }
    if (document.querySelector('.vote__box').textContent.includes('si hlasoval')) {
        chrome.runtime.sendMessage({later: true})
        return
    }

    if (first) return

    const project = await getProject('MinecraftListCZ')
    document.querySelector('input[name="username"]').value = project.nick
    // TODO временный код
    if (document.querySelector("#terms") && window.getComputedStyle(document.querySelector("#terms")).visibility === 'visible' && isInViewport(document.querySelector("#terms"))) {
        document.querySelector("#terms").checked = true
    } else {
        chrome.runtime.sendMessage({message: "Agree (Souhlasím) is not visible"})
    }
    // TODO конец
    document.querySelector('div.vote__box__buttonRow__button button[type="submit"]').click()
}

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}