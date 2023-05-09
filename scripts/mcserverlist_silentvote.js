// noinspection ES6MissingAwait

async function silentVoteMCServerList(project) {
    let response = await fetch('https://mcserver-list.eu/api/sendvote/' + project.id + '/' + project.nick, {'headers': {'content-type': 'application/x-www-form-urlencoded'}, 'body': null})
    let json = await response.json()
    if (response.ok) {
        if (json.data.status === 'success') {
            endVote({successfully: true}, null, project)
        } else if (json.data.error) {
            if (json.data.error.includes('username_voted')) {
                endVote({later: true}, null, project)
            } else {
                const request = {}
                request.message = json.data.error
                if (request.message === 'server_not_found') {
                    request.ignoreReport = true
                }
                endVote(request, null, project)
            }
        } else {
            endVote({message: JSON.stringify(json)}, null, project)
        }
    } else {
        endVote({errorVote: [String(response.status), response.url]}, null, project)
    }
}
