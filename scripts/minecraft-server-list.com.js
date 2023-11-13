//Фикс-костыль двойной загрузки (для Rocket Loader)
if (typeof loaded2 === 'undefined') {
    // noinspection ES6ConvertVarToLetConst
    var loaded2 = true
    runVote()
}

async function vote(first) {
    if (document.querySelector('#voteform #voteButton').disabled) {
        await new Promise(resolve => {
            const timer = setInterval(()=>{
                try {
                    if (!document.querySelector('#voteform #voteButton').disabled) {
                        clearInterval(timer)
                        resolve()
                    }
                } catch (e) {
                    clearInterval(timer)
                    throwError(e)
                }
            }, 1000)
        })
    }

    if (first === false) return

    const project = await getProject()
    document.querySelector('#voteform #ignn').value = project.nick
    document.querySelector('#voteform #voteButton').click()
}

function runVote() {
    const timer2 = setInterval(()=>{
        try {
            if (document.querySelector('#voteerror > font') != null) {
                const request = {}
                request.message = document.querySelector('#voteerror > font').textContent.trim()
                if (request.message.includes('Vote Registered') || request.message.includes('Vote saved. But could not connect to Votifier')) {
                    if (request.message.includes('Vote saved. But could not connect to Votifier')) {
                        chrome.runtime.sendMessage({successfully: request.message})
                    } else {
                        chrome.runtime.sendMessage({successfully: true})
                    }
                } else if (request.message.includes('already voted')) {
                    chrome.runtime.sendMessage({later: true})
                } else if (request.message.includes('Please Wait')) {
                    return
                } else {
                    if (request.message.toLowerCase().includes('not a valid playername') || request.message.includes('verification expired due to timeout') || request.message.includes('Playername can not be empty') || request.message.includes('Your name is to short') || request.message.includes('cannot verify your vote due to a low browser score') || request.message.includes('with the Anti Spam check')) {
                        request.ignoreReport = true
                    }
                    chrome.runtime.sendMessage(request)
                }
                clearInterval(timer2)
            }
        } catch (e) {
            clearInterval(timer2)
            throwError(e)
        }
    }, 1000)
}
