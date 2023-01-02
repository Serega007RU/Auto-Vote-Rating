// noinspection ES6MissingAwait

async function silentVoteMisterLauncher(project) {
    let response = await fetch('https://oauth.vk.com/authorize?client_id=7636705&display=page&redirect_uri=https://misterlauncher.org/projects/' + project.id + '/&state=' + project.nick + '&response_type=code')
    if (!await checkResponseError(project, response, 'misterlauncher.org', null, true)) return
    if (response.doc.querySelector('div.alert.alert-danger') != null) {
        if (response.doc.querySelector('div.alert.alert-danger').textContent.includes('Вы уже голосовали за этот проект')) {
            endVote({later: true}, null, project)
        } else {
            endVote({message: response.doc.querySelector('div.alert.alert-danger').textContent}, null, project)
        }
    } else if (response.doc.querySelector('div.alert.alert-success') != null) {
        if (response.doc.querySelector('div.alert.alert-success').textContent.includes('Спасибо за Ваш голос!')) {
            endVote({successfully: true}, null, project)
        } else {
            endVote({message: response.doc.querySelector('div.alert.alert-success').textContent}, null, project)
        }
    } else {
        endVote({message: 'Error! div.alert.alert-success или div.alert.alert-danger is null'}, null, project)
    }
}