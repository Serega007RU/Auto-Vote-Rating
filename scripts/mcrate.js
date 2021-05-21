vote()
async function vote() {
    if (document.URL.includes('.vk')) {
        chrome.runtime.sendMessage({errorAuthVK: true})
        return
    }
    try {
        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }
        //Авторизован ли пользователь в вк?
        if (document.querySelector('a[class=vk_authorization]') != null) {
            document.querySelector('a[class=vk_authorization]').click()
        } else if (document.querySelector('input[name=login_player]') != null) {
            //Ввод ника и голосование
            const project = await getProject()
            if (project == null) return
            document.querySelector('input[name=login_player]').value = project.nick
            document.querySelector('span[id=buttonrate]').click()
        } else if (document.querySelector('div[class=report]') != null) {
            if (document.querySelector('div[class=report]').textContent.includes('Ваш голос засчитан')) {
                chrome.runtime.sendMessage({successfully: true})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('div[class=report]').textContent})
            }
        } else if (document.querySelector('span[class=count_hour]') != null) {
//          const timer = setInterval(()=>{
//              try {
//                  //Если вы уже голосовали, высчитывает сколько надо времени прождать до следующего голосования (точнее тут высчитывается во сколько вы голосовали)
//                  let hour = parseInt(document.querySelector('span[class=count_hour]').textContent)
//                  let min = parseInt(document.querySelector('span[class=count_min]').textContent)
//                  let sec = parseInt(document.querySelector('span[class=count_sec]').textContent)
//                  let milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
//                  if (milliseconds == 0) return
//                  let later = Date.now() - (86400000 - milliseconds)
//                  chrome.runtime.sendMessage({later: later})
//                  clearInterval(timer)
//              } catch (e) {
//                  chrome.runtime.sendMessage({errorVoteNoElement2: e.stack + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
//                  clearInterval(timer)
//              }
//          }, 2000)
            chrome.runtime.sendMessage({later: true})
        } else if (document.querySelector('div[class="error"]') != null) {
            chrome.runtime.sendMessage({message: document.querySelector('div[class="error"]').textContent})
        } else {
            chrome.runtime.sendMessage({errorVoteNoElement: true})
        }
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
    }
}

async function getProject() {
    const storageArea = await new Promise(resolve=>{
        chrome.storage.local.get('storageArea', data=>{
            resolve(data['storageArea'])
        })
    })
    const projects = await new Promise(resolve=>{
        chrome.storage[storageArea].get('AVMRprojectsMCRate', data=>{
            resolve(data['AVMRprojectsMCRate'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.id)) {
            return project
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}
