// noinspection ES6MissingAwait

async function silentVoteWarface(project) {
    let response = await fetch('https://ru.warface.com/dynamic/bonus/?a=weapons&json=true', {
        headers: {
            accept: 'application/json, text/plain, */*',
        },
        method: 'GET',
    })
    let json = await response.json()

    const bonuses = {}
    // noinspection JSUnresolvedVariable
    const keys = Object.keys(json.message.weapon)
    if (keys.length === 0) {
        endVote({later: true}, null, project)
        return
    }
    keys.forEach((i)=>{
        if (i === 'update') return false;
        // noinspection JSUnresolvedVariable
        bonuses[i] = json.message.weapon[i];
    })

    const formData  = new FormData();
    formData.append('choosed_item', bonuses[Object.keys(bonuses)[0]].id)

    response = await fetch('https://ru.warface.com/dynamic/bonus/?a=bonus', {
        method: 'POST',
        body: formData
    })
    json = await response.json()
    console.log(JSON.stringify(json))

    endVote({successfully: true}, null, project)
}