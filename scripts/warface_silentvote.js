// noinspection ES6MissingAwait

async function silentVoteWarface(project) {
    await fetch('https://ru.warface.com/dynamic/auth/?profile_reload=0')
    let response = await fetch('https://ru.warface.com/dynamic/bonus/?a=init&json=true')
    let json = await response.json()
    if (json.error) {
        endVote({message: JSON.stringify(json)}, null, project)
        return
    }
    console.log('init', JSON.stringify(json))

    response = await fetch('https://ru.warface.com/dynamic/bonus/?a=weapons&json=true', {
        headers: {
            accept: 'application/json, text/plain, */*',
        },
        method: 'GET',
    })
    json = await response.json()
    console.log('weapons', JSON.stringify(json))

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
    let text = await response.text()
    console.log('bonus', text)
    try {
        text = JSON.parse(text)
    } catch (error) {
        console.error(error)
    }

    endVote({successfully: true}, null, project)
}