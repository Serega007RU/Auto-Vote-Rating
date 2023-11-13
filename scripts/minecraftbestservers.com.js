async function vote(first) {
    if (document.querySelector('div[class*="bg-green-"][x-data="{ show: true }"]')) {
        const message = document.querySelector('div.bg-green-500[x-data="{ show: true }"]').innerText
        if (message.includes('vote has been counted')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
            chrome.runtime.sendMessage({message})
        }
        return
    }

    if (document.querySelector('div[class*="bg-red-"][x-data="{ show: true }"]')) {
        const request = {}
        request.message = document.querySelector('div[class*="bg-red-"][x-data="{ show: true }"]').innerText
        if (request.message.includes('failed the security challenge')) {
            // None
        } else if (request.message.toLowerCase().includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
            return
        } else {
            if (request.message.includes('Server does not exist')) {
                request.ignoreReport = true
                request.retryCoolDown = 21600000
            } else if (request.message.toLowerCase().includes('could not send vote via votifier')) {
                request.ignoreReport = true
            }
            chrome.runtime.sendMessage(request)
            return
        }
    }

    if (document.querySelector('div.tab[x-show="tab === 1"]')?.innerText.includes('Come back tomorrow to vote in the next period')) {
        chrome.runtime.sendMessage({later: true})
        return
    }

    if (first) return

    const project = await getProject()
    document.querySelector('#username').value = project.nick
    document.querySelector('.tab form button.justify-center').click()
}