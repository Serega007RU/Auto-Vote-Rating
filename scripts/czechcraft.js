async function vote(first) {
    if (document.querySelector('div.alert.alert-danger') != null) {
        chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent})
        return
    }
    if (document.querySelector('div.alert.alert-error') != null) {
        if (document.querySelector('div.alert.alert-error').textContent.includes('Již si hlasoval')) {
            if (document.querySelector('div.alert.alert-error').textContent.match(/\d+/g)) {
                const numbers = document.querySelector('div.alert.alert-error').textContent.match(/\d+/g).map(Number)
                const date = new Date()
                chrome.runtime.sendMessage({later: Date.UTC(date.getFullYear(), date.getMonth(), date.getDay() + 1/*Отсчёт дня начинает с нуля?*/, numbers[0] - 2/*На czech-craft время указано в часовом поясе UTC +2*/, numbers[1], numbers[2])})
            } else {
                chrome.runtime.sendMessage({later: true})
            }
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-error').textContent})
        }
        return
    }
    if (document.querySelector('div.alert.alert-success') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }

    if (first) return

    const project = await getProject('CzechCraft')
    document.getElementById('username').value = project.nick
    document.getElementById('privacy').checked = true
    document.querySelector('form[method="post"] > button.button').click()
}