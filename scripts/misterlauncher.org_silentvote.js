// noinspection ES6MissingAwait

async function silentVoteMisterLauncher(project) {
    let response = await fetch('https://oauth.vk.com/authorize?client_id=7636705&display=page&redirect_uri=https://misterlauncher.org/projects/' + project.id + '/&state=' + project.nick + '&response_type=code')
    if (!await checkResponseError(project, response, 'misterlauncher.org', null, true)) return

    if (response.doc.querySelector('.container div.alert.alert-danger') && response.doc.querySelector('.container div.alert.alert-danger').style.display !== 'none') {
        const message = response.doc.querySelector('.container div.alert.alert-danger').textContent
        if (message.includes('Вы уже голосовали за этот проект')) {
            endVote({later: true}, null, project)
        } else {
            endVote({message, html: response.doc.body.outerHTML, url: response.url}, null, project)
        }
        return
    }

    if (response.doc.querySelector('.container div.alert.alert-success') && response.doc.querySelector('.container div.alert.alert-success').style.display !== 'none') {
        const message = response.doc.querySelector('.container div.alert.alert-success').textContent
        if (message.includes('Спасибо за Ваш голос!')) {
            endVote({later: true}, null, project)
        } else {
            endVote({message, html: response.doc.body.outerHTML, url: response.url}, null, project)
        }
        return
    }

    endVote({message: 'Ошибка! div.alert.alert-success или div.alert.alert-danger is null, нет сообщения об успешном или не успешном голосовании', html: response.doc.body.outerHTML, url: response.url}, null, project)
}