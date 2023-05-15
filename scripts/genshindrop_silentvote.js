// noinspection ES6MissingAwait

async function silentVoteGenshinDrop(project) {
    const response = await fetch('https://genshindrop.com/case/24-chasa-oskolki/give_me_drop', {method: 'GET'})
    let json = await response.json()
    if (json.message === 'free_access_restricted') {
        endVote({later: true}, null, project)
    } else if (json.message === 'Access denied') {
        endVote({message: JSON.stringify(json)}, null, project)
    } else {
        endVote({message: JSON.stringify(json), html: JSON.stringify(json), url: response.url}, null, project)
    }
}
