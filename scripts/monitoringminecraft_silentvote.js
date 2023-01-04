// noinspection ES6MissingAwait

async function silentVoteMonitoringMinecraft(project) {
    let i = 0
    while (i <= 3) {
        i++
        let response = await fetch('https://monitoringminecraft.ru/top/' + project.id + '/vote', {
            'headers': {
                'content-type': 'application/x-www-form-urlencoded'
            },
            'body': 'player=' + project.nick + '',
            'method': 'POST'
        })
        if (!await checkResponseError(project, response, 'monitoringminecraft.ru', [503], true)) return
        if (response.status === 503) {
            if (i >= 3) {
                endVote({message: chrome.i18n.getMessage('errorAttemptVote', 'response code: ' + String(response.status))}, null, project)
                return
            }
            await wait(5000)
            continue
        }

        if (response.doc.querySelector('body') != null && response.doc.querySelector('body').textContent.includes('Вы слишком часто обновляете страницу. Умерьте пыл.')) {
            if (i >= 3) {
                endVote({message: chrome.i18n.getMessage('errorAttemptVote') + response.doc.querySelector('body').textContent}, null, project)
                return
            }
            await wait(5000)
            continue
        }
        if (response.doc.querySelector('form[method="POST"]') != null && response.doc.querySelector('form[method="POST"]').textContent.includes('Ошибка')) {
            endVote({message: response.doc.querySelector('form[method="POST"]').textContent.trim()}, null, project)
            return
        }
        if (response.doc.querySelector('input[name=player]') != null) {
            if (i >= 3) {
                endVote({message: chrome.i18n.getMessage('errorAttemptVote', 'input[name=player] is ' + JSON.stringify(response.doc.querySelector('input[name=player]')))}, null, project)
                return
            }
            await wait(5000)
            continue
        }

        if (response.doc.querySelector('center').textContent.includes('Вы уже голосовали сегодня')) {
            endVote({later: true}, null, project)
            return
        } else if (response.doc.querySelector('center').textContent.includes('Вы успешно проголосовали!')) {
            endVote({successfully: true}, null, project)
            return
        } else {
            endVote({message: response.doc.querySelector('center').textContent}, null, project)
            return
        }
    }
}