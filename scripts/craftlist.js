async function vote(first) {
    if (document.querySelector('div.alert.alert-success') != null) {
        if (document.querySelector('div.alert.alert-success').textContent.includes('vote was successfully')
            || document.querySelector('div.alert.alert-success').textContent.includes('hlas byl úspěšně přijatý')
            || document.querySelector('div.alert.alert-success').textContent.includes('hlas bol úspešne prijatý')
            || document.querySelector('div.alert.alert-success').textContent.includes('Dein Vote wurde akzeptiert')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-success').textContent})
        }
        return
    }
    if (document.querySelector('div.alert.alert-info') != null) {
        if (document.querySelector('div.alert.alert-info').textContent.includes('next vote')
            || document.querySelector('div.alert.alert-info').textContent.includes('možný hlas za tento server můžeš odeslat')
            || document.querySelector('div.alert.alert-info').textContent.includes('možný hlas za tento server môžeš odoslať')
            || document.querySelector('div.alert.alert-info').textContent.includes('nächster Vote')) {
            const numbers = document.querySelector('div.alert.alert-info').textContent.match(/\d+/g).map(Number)
            chrome.runtime.sendMessage({later: Date.UTC(numbers[2], numbers[1] - 1, numbers[0], numbers[3], numbers[4], numbers[5]) + 3600000})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-info').textContent})
        }
        return
    }
    if (document.querySelector('a.btn-vote').textContent.includes('possible vote')
        || document.querySelector('a.btn-vote').textContent.includes('možný hlas')
        || document.querySelector('a.btn-vote').textContent.includes('ist möglich')) {
        //Из текста достаёт все цифры в Array List
        const numbers = document.querySelector('a.btn-vote').textContent.match(/\d+/g).map(Number)
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
        const milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
        chrome.runtime.sendMessage({later: Date.now() + milliseconds})
        return
    } else {
        document.querySelector('a.btn-vote').click()
    }

    if (first) return

    let project = await getProject('CraftList')
    let hours = document.querySelector('#voteModal p.text-center').textContent.match(/\d+/g).map(Number)[0]
    const milliseconds = (hours * 60 * 60 * 1000)
    if (project.timeout == null || project.timeout !== milliseconds) {
        project.timeout = milliseconds
        chrome.runtime.sendMessage({changeProject: project})
    }
    document.querySelector('input[name="nickName"]').value = project.nick
    document.querySelector('button.btn.btn-vote').click()
}
