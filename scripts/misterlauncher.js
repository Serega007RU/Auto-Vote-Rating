async function vote(first) {
    try {
        const project = await getProject('MisterLauncher')
        if (project.game === 'projects') {
            if (first === false) return
            if (document.querySelector('div.alert.alert-danger') != null) {
                if (document.querySelector('div.alert.alert-danger').textContent.includes('Вы уже голосовали за этот проект')) {
//                    var numbers = document.querySelector('div.alert.alert-danger').textContent.match(/\d+/g).map(Number)
//                    var count = 0
//                    var year = 0
//                    var month = 0
//                    var day = 0
//                    var hour = 0
//                    var min = 0
//                    var sec = 0
//                    for (var i in numbers) {
//                        if (count == 0) {
//                            hour = numbers[i]
//                        } else if (count == 1) {
//                            min = numbers[i]
//                        } else if (count == 2) {
//                            sec = numbers[i]
//                        } else if (count == 3) {
//                            day = numbers[i]
//                        } else if (count == 4) {
//                            month = numbers[i]
//                        } else if (count == 5) {
//                            year = numbers[i]
//                        }
//                        count++
//                    }
//                    var later = Date.UTC(year, month - 1, day, hour, min, sec, 0) - 86400000 - 10800000
                    chrome.runtime.sendMessage({later: true})
                }
            } else if (document.querySelector('div.alert.alert-success') != null && document.querySelector('div.alert.alert-success').textContent.includes('Спасибо за Ваш голос!')) {
                chrome.runtime.sendMessage({successfully: true})
            } else if (document.querySelector('input[name=nick]') != null) {
                document.querySelector('input[name=nick]').value = project.nick
                document.querySelector('button[type=submit]').click()
            } else {
                setTimeout(()=>chrome.runtime.sendMessage({message: 'Ошибка, input[name=nick] является null'}), 10000)
            }
        } else {
            const timer = setInterval(()=>{
                if (document.querySelector('#messages').textContent.length > 0) {
                    if (document.querySelector('#messages').textContent.includes('Спасибо за Ваш голос')) {
                        chrome.runtime.sendMessage({successfully: true})
                    } else if (document.querySelector('#messages').textContent.includes('уже голосовали')) {
                        const numbers = document.querySelector('#messages').textContent.match(/\d+/g).map(Number)
                        chrome.runtime.sendMessage({later: Date.UTC(numbers[2], numbers[1] -1, numbers[0], numbers[3], numbers[4], numbers[5]) - 10800000 + 60000})
                    } else {
                        chrome.runtime.sendMessage({message: document.querySelector('#messages').textContent})
                    }
                    clearInterval(timer)
                }
            }, 500)

            if (first) return

            document.querySelector('#form-vote-server button[type="submit"]').click()
        }
    } catch (e) {
        throwError(e)
    }
}