async function vote(first) {
    try {
        if (document.querySelector('div.alert.alert-danger') != null) {
            chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent})
            return
        }
        if (document.querySelector('div.alert.alert-error') != null) {
            if (document.querySelector('div.alert.alert-error').textContent.includes('Již si hlasoval')) {
                if (document.querySelector('div.alert.alert-error').textContent.match(/\d+/g)) {
                    const numbers = document.querySelector('div.alert.alert-error').textContent.match(/\d+/g).map(Number)
                    let count = 0
                    let hour = 0
                    let min = 0
                    let sec = 0
                    for (const i in numbers) {
                        if (count === 0) {
                            hour = numbers[i]
                        } else if (count === 1) {
                            min = numbers[i]
                        } else if (count === 2) {
                            sec = numbers[i]
                        }
                        count++
                    }
                    let time = new Date()
                    if (time.getUTCHours() > hour || (time.getUTCHours() === hour && time.getUTCMinutes() >= min) || (time.getUTCHours() === hour && time.getUTCMinutes() === min && time.getUTCMinutes() >= sec)) {
                        time.setUTCDate(time.getUTCDate() + 1)
                    }
                    time.setUTCHours(hour, min, sec, 0)
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
    } catch (e) {
        throwError(e)
    }
}