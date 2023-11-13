async function vote(first) {
    if (document.querySelector('#email')) {
        chrome.runtime.sendMessage({auth: true})
        return
    }

    const later = document.querySelector('.content .post > p')
    if (later && later.textContent.includes('Вы сможете проголосовать через')) {
        const numbers = later.textContent.match(/\d+/g).map(Number)
        const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000) + (numbers[2] * 1000)
        chrome.runtime.sendMessage({later: Date.now() + milliseconds})
        return
    }

    const success = document.querySelector('.content .ann')
    if (success && success.textContent.includes('голос засчитан')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }

    if (first) return

    const project = await getProject()
    document.querySelector('#realm_id').selectedIndex = project.ordinalWorld - 1
    document.querySelector('#nickname').value = project.nick
    document.querySelector('form input[name="commit"]').click()
}