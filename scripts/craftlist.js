async function vote(first) {
    if (document.querySelector('div.alert.alert-success')) {
        const message = document.querySelector('div.alert.alert-success').textContent
        if (message.includes('vote was successfully')
            || message.includes('hlas byl úspěšně přijatý')
            || message.includes('hlas bol úspešne prijatý')
            || message.includes('Dein Vote wurde akzeptiert')
            || message.includes('Tvůj hlas byl úspěšne přijatý')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
            chrome.runtime.sendMessage({message})
        }
        return
    }
    if (document.querySelector('div.alert.alert-info')) {
        const message = document.querySelector('div.alert.alert-info').textContent
        if (message.includes('next vote')
            || message.includes('možný hlas za tento server můžeš odeslat')
            || message.includes('možný hlas za tento server môžeš odoslať')
            || message.includes('nächster Vote')) {
            const numbers = message.match(/\d+/g).map(Number)
            chrome.runtime.sendMessage({later: Date.UTC(numbers[2], numbers[1] - 1, numbers[0], numbers[3], numbers[4], numbers[5]) + 3600000})
        } else {
            chrome.runtime.sendMessage({message})
        }
        return
    }
    if (document.querySelector('body #tracy-error')) {
        chrome.runtime.sendMessage({
            message: document.querySelector('body #tracy-error').innerText,
            ignoreReport: true
        })
        return
    }
    if (document.querySelector('body #server-error')) {
        chrome.runtime.sendMessage({
            message: document.querySelector('body #server-error').innerText,
            ignoreReport: true
        })
        return
    }
    // Костыль
    if ((document.location.pathname.split('/')[1] === 'cs' || document.location.pathname.split('/')[1] === 'sk') && !document.location.pathname.split('/')[2]) {
        const request = {}
        request.errorVoteNoElement = 'Redirected to server list'
        request.ignoreReport = true
        chrome.runtime.sendMessage(request)
        return
    }

    const btnText = document.querySelector('a.btn-vote').textContent
    if (btnText.includes('possible vote')
        || btnText.includes('možný hlas')
        || btnText.includes('ist möglich')) {
        //Из текста достаёт все цифры в Array List
        const numbers = btnText.match(/\d+/g).map(Number)
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
