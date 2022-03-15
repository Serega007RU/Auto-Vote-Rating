async function vote(first) {
    if (document.querySelector('div.alert.alert-danger') != null) {
        chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent})
        return
    }
    if (document.querySelector('div.alert.alert-error') != null) {
        if (document.querySelector('div.alert.alert-error').textContent.includes('Již si hlasoval')) {
            if (document.querySelector('div.alert.alert-error').textContent.match(/\d+/g)) {
                const numbers = document.querySelector('div.alert.alert-error').textContent.match(/\d+/g).map(Number)
                let time = new Date()
                if (time.getUTCHours() > numbers[0] || (time.getUTCHours() === numbers[0] && time.getUTCMinutes() >= numbers[1]) || (time.getUTCHours() === numbers[0] && time.getUTCMinutes() === numbers[1] && time.getUTCMinutes() >= numbers[2])) {
                    time.setUTCDate(time.getUTCDate() + 1)
                }
                time.setUTCHours(numbers[0], numbers[1], numbers[2], 0)
                chrome.runtime.sendMessage({later: time.getTime()})
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