async function vote(/*first*/) {
    if (document.querySelector('.alert.alert-danger') != null) {
        chrome.runtime.sendMessage({message: document.querySelector('.alert.alert-danger').textContent.trim()})
        return
    } else if (document.querySelector('.alert.alert-warning') != null) {
        if (document.querySelector('.alert.alert-warning').textContent.includes('already voted')) {
            let hour = 0
            let min = 0
            let sec = 0
            if (document.querySelector('.alert.alert-warning').textContent.match(/\d+ hour/g) != null) {
                hour = Number(document.querySelector('.alert.alert-warning').textContent.match(/\d+ hour/g)[0].match(/\d+/g)[0])
            }
            if (document.querySelector('.alert.alert-warning').textContent.match(/\d+ min/g) != null) {
                min = Number(document.querySelector('.alert.alert-warning').textContent.match(/\d+ min/g)[0].match(/\d+/g)[0])
            }
            if (document.querySelector('.alert.alert-warning').textContent.match(/\d+ sec/g) != null) {
                sec = Number(document.querySelector('.alert.alert-warning').textContent.match(/\d+ sec/g)[0].match(/\d+/g)[0])
            }
            const milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
            chrome.runtime.sendMessage({later: Date.now() + milliseconds})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('.alert.alert-warning').textContent.trim()})
        }
        return
    } else if (document.querySelector('.alert.alert-success') != null && document.querySelector('.alert.alert-success').textContent.includes('voted successfully')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }

    if (document.querySelector("#vote").innerText.toLowerCase().includes('login to vote') || document.querySelector("#vote").innerText.toLowerCase().includes('connect with a social network to vote')) {
        chrome.runtime.sendMessage({auth: true})
        return
    }

    // if (first) return

    const project = await getProject('TopG', true)
    document.getElementById('game_user').value = project.nick
    document.querySelector('#vote button[type="submit"]').click()
}