async function vote(first) {
    if (document.querySelector('.alert-success')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('.alert-danger')) {
        if (document.querySelector('.alert-danger').textContent.includes('ya votaste')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('.alert-danger').innerText.trim()})
        }
        return
    }

    if (first) {
        document.querySelector('[data-target="#votarModal"]').click()
        return
    }

    const project = await getProject()
    document.querySelector('#input-name').value = project.nick
    document.querySelector('form[action="/servidor/votar"] button[type="submit"]').click()
}