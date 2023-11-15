// noinspection ES6MissingAwait

self['silentVote_genshindrop.com'] = async function (project) {
    const response = await fetch('https://genshindrop.com/case/24-chasa-oskolki/give_me_drop')

    const text = await response.text()

    let json
    try {
        json = JSON.parse(text)
    } catch (error) {
        const dom = new DOMParser().parseFromString(text, 'text/html')
        if (dom.querySelector('.title')?.textContent === 'Доступ ограничен') {
            endVote({auth: true}, null, project)
        } else {
            endVote({errorVoteNoElement: 'Not found title', html: text, url: response.url}, null, project)
        }
        return
    }

    if (json.message === 'success') {
        console.log(JSON.stringify(json.drop))
        endVote({successfully: true}, null, project)
    } else if (json.message === 'free_access_restricted') {
        const response2 = await fetch('https://genshindrop.com/case/24-chasa-oskolki')
        const html2 = await response2.text()
        const dom2 = new DOMParser().parseFromString(html2, 'text/html')
        if (!dom2.querySelector('.free-box-needs_item-description')) {
            endVote({errorVoteNoElement: 'Not found later', html: html2, url: response2.url}, null, project)
            return
        }
        const numbers = dom2.querySelector('.free-box-needs_item-description').textContent.match(/\d+/g).map(Number)
        if (numbers.length > 1) {
            endVote({errorVoteNoElement: 'Error calculating later', html: html2, url: response2.url}, null, project)
            return
        }
        endVote({later: Date.now() + (numbers[0] + 1) * 60 * 60 * 1000}, null, project)
    } else if (json.message === 'Access denied') {
        endVote({message: JSON.stringify(json)}, null, project)
    } else {
        endVote({message: JSON.stringify(json), html: JSON.stringify(json), url: response.url}, null, project)
    }
}
