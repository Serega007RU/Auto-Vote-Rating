// noinspection ES6MissingAwait

async function silentVoteHoYoLAB(project) {
    const response = await fetch('https://sg-hk4e-api.hoyolab.com/event/sol/sign?lang=en-us', {
        "headers": {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'ru,en;q=0.9,cs;q=0.8,zh-TW;q=0.7,zh;q=0.6',
            'content-type': 'application/json;charset=UTF-8'
        },
        'body': '{"act_id":"e202102251931481"}',
        'method': 'POST',
        'mode': 'cors',
        'credentials': 'include'
    })
    const json = await response.json()
    if (json.message === 'OK') {
        endVote({successfully: true}, null, project)
    } else if (json.message) {
        if (json.message.includes('already checked in today')) {
            endVote({later: true}, null, project)
        } else {
            const request = {}
            request.message = json.message
            if (request.message.includes('create a character in game first') || request.message.includes('Not logged in')) {
                request.ignoreReport = true
            }
            request.html = JSON.stringify(json)
            request.url = response.url
            endVote(request, null, project)
        }
    } else {
        endVote({message: JSON.stringify(json), html: JSON.stringify(json), url: response.url}, null, project)
    }
}