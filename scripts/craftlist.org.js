async function vote(first) {
    const request = {}
    request.message = 'Auto-voting is suspended for craftlist.org , use other automation methods or vote manually. The risk of being banned for auto-voting is too high.'
    request.retryCoolDown = 1814400000
    request.ignoreReport = true
    chrome.runtime.sendMessage(request)
    if (true) return

    if (first) await wait(Math.floor(Math.random() * 3000 + 1000))

    if (document.querySelector('div.alert.alert-success')) {
        const message = document.querySelector('div.alert.alert-success').textContent
        if (message.includes('vote was successfully')
            || message.includes('hlas byl úspěšně přijatý')
            || message.includes('hlas bol úspešne prijatý')
            || message.includes('Dein Vote wurde akzeptiert')
            || message.includes('Tvůj hlas byl úspěšne přijatý')
            || message.includes('głos został pomyślnie zaakceptowany')) {
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
            || message.includes('nächster Vote')
            || message.includes('następny głos będzie możliwy')) {
            const numbers = message.match(/\d+/g).map(Number)
            chrome.runtime.sendMessage({later: Date.UTC(numbers[2], numbers[1] - 1, numbers[0], numbers[3], numbers[4], numbers[5]) + 3600000})
        } else {
            chrome.runtime.sendMessage({message})
        }
        return
    }
    if (document.querySelector('div.alert.alert-error')) {
        const message = document.querySelector('div.alert.alert-error').textContent
        if (message.includes('next vote')
            || message.includes('možný hlas za tento server můžeš odeslat')
            || message.includes('možný hlas za tento server môžeš odoslať')
            || message.includes('nächster Vote')
            || message.includes('następny głos będzie możliwy')) {
            const numbers = message.match(/\d+/g).map(Number)
            chrome.runtime.sendMessage({later: Date.UTC(numbers[2], numbers[1] - 1, numbers[0], numbers[3], numbers[4]) + 3600000})
            return
        } else if (message.includes('robot')) {
            // None
        } else {
            chrome.runtime.sendMessage({message})
            return
        }
    }

    if (document.querySelector('div.alert.alert-danger')) {
        const request = {}
        request.message = document.querySelector('div.alert.alert-danger').innerText
        if (request.message.includes('Ban')) {
            request.retryCoolDown = 43200000
            request.ignoreReport = true
        }
        chrome.runtime.sendMessage(request)
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
    if ((document.location.pathname.split('/')[1] === 'cz' || document.location.pathname.split('/')[1] === 'cs' || document.location.pathname.split('/')[1] === 'sk') && !document.location.pathname.split('/')[2]) {
        const request = {}
        request.errorVoteNoElement = 'Redirected to server list'
        request.ignoreReport = true
        chrome.runtime.sendMessage(request)
        return
    }

    const project = await getProject()

    if (first && !document.querySelector('#voteModal')?.classList.contains('show')) {
        const btnText = document.querySelector('.sidebar .card-body .btn')?.textContent
        if (btnText &&
            (btnText.includes('possible vote')
            || btnText.includes('možný hlas')
            || btnText.includes('ist möglich'))) {
            const numbers = btnText.match(/\d+/g).map(Number)
            const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000) + (numbers[2] * 1000)
            chrome.runtime.sendMessage({later: Date.now() + milliseconds})
            return
        } else {
            document.querySelector('.sidebar .card-body .btn')?.click()
        }

        const timeout = document.querySelector('#voteModal p.text-center')
        if (timeout) {
            const hours = timeout.textContent.match(/\d+/g).map(Number)[0]
            const milliseconds = (hours * 60 * 60 * 1000)
            if (project.timeout == null || project.timeout !== milliseconds) {
                project.timeout = milliseconds
                chrome.runtime.sendMessage({changeProject: project})
            }
        }
        return
    }

    // Если пользователь умудрится закрыть модалку
    if (!document.querySelector('#voteModal')?.classList.contains('show')) {
        document.querySelector('.sidebar .card-body .btn')?.click()
    }

    const btnText = document.querySelector('.modal-footer a span')?.textContent
    if (btnText &&
        (btnText.includes('possible vote')
            || btnText.includes('možný hlas')
            || btnText.includes('ist möglich'))) {
        const numbers = btnText.match(/\d+/g).map(Number)
        const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000) + (numbers[2] * 1000)
        chrome.runtime.sendMessage({later: Date.now() + milliseconds})
        return
    }

    if (first) return

    document.querySelector('.modal-body #frm-voteForm-nickName').value = project.nick
    document.querySelector("#voteModal > div > div > div.modal-footer > button").click()
}

const timer = setInterval(() => {
    const request = {}
    request.message = document.querySelector('.modal-body .text-danger')?.innerText
    if (request.message?.length > 3 && !request.message.includes('field is required') && !request.message.includes('pole je povinný') && !request.message.includes('pole je povinné')) {
        clearInterval(timer)
        if (request.message.includes('Nick je v špatném formátu')) {
            request.ignoreReport = true
            request.retryCoolDown = 604800000
        }
        setTimeout(() => {
            chrome.runtime.sendMessage(request)
        }, 15000)
    }
}, 1000)