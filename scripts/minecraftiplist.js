//Преобразует изображение в String
const toDataURL = url=>fetch(url).then(response=>response.blob()).then(blob=>new Promise((resolve,reject)=>{
    const reader = new FileReader()
    reader.onloadend = ()=>resolve(reader.result.replace(/^data:image\/(png|jpg);base64,/, ''))
    reader.onerror = reject
    reader.readAsDataURL(blob)
}))
let currentRecept = {}
let content = [0, 0, 0, 0, 0, 0, 0, 0, 0]

vote()
async function vote() {
    if (document.URL.startsWith('chrome-extension://' + chrome.runtime.id)) return
    try {
        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }
        if (document.querySelector('#Content > div.Error') != null) {
            if (document.querySelector('#Content > div.Error').textContent.includes('You did not complete the crafting table correctly')) {
                chrome.runtime.sendMessage({message: document.querySelector('#Content > div.Error').textContent})
                return
            }
            if (document.querySelector('#Content > div.Error').textContent.includes('last voted for this server')) {
                const numbers = document.querySelector('#Content > div.Error').textContent.substring(document.querySelector('#Content > div.Error').textContent.length - 30).match(/\d+/g).map(Number)
                let count = 0
                let hour = 0
                let min = 0
                let sec = 0
                for (let i in numbers) {
                    if (count == 0) {
                        hour = numbers[i]
                    } else if (count == 1) {
                        min = numbers[i]
                    }
                    count++
                }
                const milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
                chrome.runtime.sendMessage({later: Date.now() + (86400000 - milliseconds)})
                return
            }
            chrome.runtime.sendMessage({message: document.querySelector('#Content > div.Error').textContent})
            return
        }
        if (document.querySelector('#Content > div.Good') != null && document.querySelector('#Content > div.Good').textContent.includes('You voted for this server!')) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
        if (document.getElementById('InnerWrapper').innerText.includes('";'))
            return
        if (!await getRecipe(document.querySelector('table[class="CraftingTarget"]').firstElementChild.firstElementChild.firstElementChild.firstElementChild.src)) {
            chrome.runtime.sendMessage({message: 'Could not find the recipe: ' + document.querySelector('table[class="CraftingTarget"]').firstElementChild.firstElementChild.firstElementChild.firstElementChild.src})
            return
        }
        await craft(document.querySelector('#Content > form > table > tbody > tr:nth-child(2) > td > table').getElementsByTagName('img'))
        const nick = await getNickName()
        if (nick == null) return
        document.querySelector('#Content > form > input[type=text]').value = nick
        document.getElementById('votebutton').click()
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
    }
}

async function getNickName() {
    const storageArea = await new Promise(resolve=>{
        chrome.storage.local.get('storageArea', data=>{
            resolve(data['storageArea'])
        })
    })
    const projects = await new Promise(resolve=>{
        chrome.storage[storageArea].get('AVMRprojectsMinecraftIpList', data=>{
            resolve(data['AVMRprojectsMinecraftIpList'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.id)) {
            return project.nick
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}

function recalculate() {
    let code = 0
    let code2 = 0

    for (let i = 0; i < 6; i++) {
        code += content[i] << (i * 5)
    }
    for (let i = 6; i < 9; i++) {
        code2 += content[i] << ((i - 6) * 5)
    }
    document.forms['main'].elements['captchacode1'].value = code
    document.forms['main'].elements['captchacode2'].value = code2
}

//Собсна сам процесс крафта
async function craft(inv) {
    content = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    let inventoryCount = 0
    let inventory = inv
    if (currentRecept.sign) {
        let countRecept = 0
        let countRecept2 = 0
        for (const element of inventory) {
            inventoryCount++
            //Если это дубовая доска
            if (await toDataURL(element.src.replace('chrome-extension://' + chrome.runtime.id, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAP1BMVEX///9RQSpIOyRkUzB2Xz26lmGdgkwxKBhNPidyXThEOSFxWjiyjllCNSBoUzItJBY1Kht7YT0wJhhLPCZOPSek/k6aAAAAAXRSTlMAQObYZgAAAXFJREFUeF6VkYmOwkAMQ0nmvvf6/29dOzPArkBIhNJWssd5SS9vVgghvpJjDKGU8ELuc3a6nssllBk75FkeGsWOQjhvc8KMl79yKRF/APLRY+kdrtDv5IGW3nc4jsO1W5nBuzAnT+FBAWZzf0+p2+CdIzlS9wN3TityM7TmfSmGtuVIOedjGMO5hh+3UMgT5meutWZJ6TAMhe6833N8TmRXkbWymMGhVJvSwt44W3NKK+V8GJxCUgVs804gUq8V105Qo3Reh4eH8ZDhyyKb4SgYdgwaVhLKCS+7BfKptIZLdS0CYoi1bntwjAcjHR4aF5CIWI8BZ4mgSiu0zC653qbQ0QyzAcE7W0C1nLwOJCkdqvmhXtISi8942WM2o6TDw8sRpF5HvSYYAhBhgmiMCaaToLZkWzcs1nsZgpDhYHpmYFHNSbZwNFrrcq/x4zAIKYkGlZ/6f2EAwxQBJsMfa39P7m99XJ7X17CEZ/K9EXq/V7+8vxIydl/EGwAAAABJRU5ErkJggg==') {
                countRecept++
                if (countRecept == 1) {
                    content[0] = inventoryCount
                }
                if (countRecept == 2) {
                    content[1] = inventoryCount
                }
                if (countRecept == 3) {
                    content[2] = inventoryCount
                }
                if (countRecept == 4) {
                    content[3] = inventoryCount
                }
                if (countRecept == 5) {
                    content[4] = inventoryCount
                }
                if (countRecept == 6) {
                    content[5] = inventoryCount
                }
                //Если это палка
            } else if (await toDataURL(element.src.replace('chrome-extension://' + chrome.runtime.id, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAAAoHgtJNhWJZydoTh6sX77EAAAAAXRSTlMAQObYZgAAADFJREFUeF7ljDENAAAIw2ZhFmYBC/jXxA8HWcJHz6YpzhEXoZjCDLIH+eRgBiAxhEUBBakJ98ESqgkAAAAASUVORK5CYII=') {
                countRecept2++
                if (countRecept2 == 1) {
                    content[7] = inventoryCount
                }
            }
        }
        return
    }
    if (currentRecept.ironSword) {
        let countRecept = 0
        let countRecept2 = 0
        for (const element of inventory) {
            inventoryCount++
            //Если это железный слиток
            if (await toDataURL(element.src.replace('chrome-extension://' + chrome.runtime.id, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAIVBMVEUAAADY2NhERESWlpY1NTVycnJoaGioqKj///+CgoJ/f3/RLsQ9AAAAAXRSTlMAQObYZgAAAGRJREFUeF6tyjERADEIRNFYwAIWsICFWIgFLGAhFlB5yXAMBZTZ7r/Z8XaILWShCDaQpQAgWCHqpksFJI1cZ9yAUhSdtQAURXN2ACD21+xhbzHPxcyjwhW7Z68CLhZVICQr4ek+KDhG7bVD+wwAAAAASUVORK5CYII=') {
                countRecept++
                if (countRecept == 1) {
                    content[1] = inventoryCount
                }
                if (countRecept == 2) {
                    content[4] = inventoryCount
                }
                //Если это палка
            } else if (await toDataURL(element.src.replace('chrome-extension://' + chrome.runtime.id, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAAAoHgtJNhWJZydoTh6sX77EAAAAAXRSTlMAQObYZgAAADFJREFUeF7ljDENAAAIw2ZhFmYBC/jXxA8HWcJHz6YpzhEXoZjCDLIH+eRgBiAxhEUBBakJ98ESqgkAAAAASUVORK5CYII=') {
                countRecept2++
                if (countRecept2 == 1) {
                    content[7] = inventoryCount
                }
            }
        }
        return
    }
    if (currentRecept.diamondPickaxe) {
        let countRecept = 0
        let countRecept2 = 0
        for (const element of inventory) {
            inventoryCount++
            //Если это палка
            if (await toDataURL(element.src.replace('chrome-extension://' + chrome.runtime.id, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAAAoHgtJNhWJZydoTh6sX77EAAAAAXRSTlMAQObYZgAAADFJREFUeF7ljDENAAAIw2ZhFmYBC/jXxA8HWcJHz6YpzhEXoZjCDLIH+eRgBiAxhEUBBakJ98ESqgkAAAAASUVORK5CYII=') {
                countRecept++
                if (countRecept == 1) {
                    content[4] = inventoryCount
                }
                if (countRecept == 2) {
                    content[7] = inventoryCount
                }
                //Если это алмаз
            } else if (await toDataURL(element.src.replace('chrome-extension://' + chrome.runtime.id, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAIVBMVEUAAAAw270be2vR+vOi9udK7dEglYGM9OL///8szbEMNzBqdBtcAAAAAXRSTlMAQObYZgAAAHJJREFUeNrNzUEOAjEMQ1FaE0/D/Q9MM4pkduCu+KtIflIe/9arc4Hm1RVxgObnHTCGyHegGah5rdidgRpxF6EnvwDNV0dGnABAoJ9YAMgUmDsXxI5d7kgHFImYM7u6avbAGJ+AtEATMjvNBiiiNBvguDejWQ0NckD8GAAAAABJRU5ErkJggg==') {
                countRecept2++
                if (countRecept2 == 1) {
                    content[0] = inventoryCount
                }
                if (countRecept2 == 2) {
                    content[1] = inventoryCount
                }
                if (countRecept2 == 3) {
                    content[2] = inventoryCount
                }
            }
        }
        return
    }
    if (currentRecept.chest) {
        let countRecept = 0
        for (const element of inventory) {
            inventoryCount++
            //Если это дубовая доска
            if (await toDataURL(element.src.replace('chrome-extension://' + chrome.runtime.id, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAP1BMVEX///9RQSpIOyRkUzB2Xz26lmGdgkwxKBhNPidyXThEOSFxWjiyjllCNSBoUzItJBY1Kht7YT0wJhhLPCZOPSek/k6aAAAAAXRSTlMAQObYZgAAAXFJREFUeF6VkYmOwkAMQ0nmvvf6/29dOzPArkBIhNJWssd5SS9vVgghvpJjDKGU8ELuc3a6nssllBk75FkeGsWOQjhvc8KMl79yKRF/APLRY+kdrtDv5IGW3nc4jsO1W5nBuzAnT+FBAWZzf0+p2+CdIzlS9wN3TityM7TmfSmGtuVIOedjGMO5hh+3UMgT5meutWZJ6TAMhe6833N8TmRXkbWymMGhVJvSwt44W3NKK+V8GJxCUgVs804gUq8V105Qo3Reh4eH8ZDhyyKb4SgYdgwaVhLKCS+7BfKptIZLdS0CYoi1bntwjAcjHR4aF5CIWI8BZ4mgSiu0zC653qbQ0QyzAcE7W0C1nLwOJCkdqvmhXtISi8942WM2o6TDw8sRpF5HvSYYAhBhgmiMCaaToLZkWzcs1nsZgpDhYHpmYFHNSbZwNFrrcq/x4zAIKYkGlZ/6f2EAwxQBJsMfa39P7m99XJ7X17CEZ/K9EXq/V7+8vxIydl/EGwAAAABJRU5ErkJggg==') {
                countRecept++
                if (countRecept == 1) {
                    content[0] = inventoryCount
                }
                if (countRecept == 2) {
                    content[1] = inventoryCount
                }
                if (countRecept == 3) {
                    content[2] = inventoryCount
                }
                if (countRecept == 4) {
                    content[3] = inventoryCount
                }
                if (countRecept == 5) {
                    content[5] = inventoryCount
                }
                if (countRecept == 6) {
                    content[6] = inventoryCount
                }
                if (countRecept == 7) {
                    content[7] = inventoryCount
                }
                if (countRecept == 8) {
                    content[8] = inventoryCount
                    return
                }
            }
        }
    }
    if (currentRecept.goldShover) {
        let countRecept = 0
        let countRecept2 = 0
        for (const element of inventory) {
            inventoryCount++
            //Если это золотой слиток
            if (await toDataURL(element.src.replace('chrome-extension://' + chrome.runtime.id, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAJFBMVEUAAAD//4tQUADe3gA8PADcdhOGhgD//wv////bohOurgC3YRCwQZoNAAAAAXRSTlMAQObYZgAAAGdJREFUeF6tykERwDAIRNFYwAIWsICFWKgFLMRCLMRCzZVCGQ5w7N7+mx3/DrGFLBTBBrIWAAhWiHrTpQLSirx03MCiKNK1ABRFc3YAIMdLd3ewt4EV8yhgcqbOq4DL+c4VQrISft0DreJJLwFPy8oAAAAASUVORK5CYII=') {
                countRecept++
                if (countRecept == 1) {
                    content[1] = inventoryCount
                }
                //Если это палка
            } else if (await toDataURL(element.src.replace('chrome-extension://' + chrome.runtime.id, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAAAoHgtJNhWJZydoTh6sX77EAAAAAXRSTlMAQObYZgAAADFJREFUeF7ljDENAAAIw2ZhFmYBC/jXxA8HWcJHz6YpzhEXoZjCDLIH+eRgBiAxhEUBBakJ98ESqgkAAAAASUVORK5CYII=') {
                countRecept2++
                if (countRecept2 == 1) {
                    content[4] = inventoryCount
                }
                if (countRecept2 == 2) {
                    content[7] = inventoryCount
                }
            }
        }
        return
    }
}

//Узнаёт какой щас рецепт
async function getRecipe(img) {
    currentRecept = {}
    let image_base64 = await toDataURL(img)
    if (image_base64 === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAGFBMVEUAAACfhE1BNCFpVDMhGQs/LQ5iTSx8Yj6Dkc6FAAAAAXRSTlMAQObYZgAAAE9JREFUeF69yDERgEAMRFEsxEIsnIVvYS2cBewzhIIU2Y7hF5nNO74pWmsGFaCQA7g/EA5aDhRSXQcQIAgcvBlYrRmyN0K197M9nL9ApoMLLkoqo8izD4QAAAAASUVORK5CYII=') {
        currentRecept.sign = true
        return true
    } else if (image_base64 === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAIVBMVEUAAAAoKChERET////Y2NiWlpZra2soHgtJNhVoTh6JZyfBS+igAAAAAXRSTlMAQObYZgAAAFlJREFUeF69ylENgDAMBuFaOAu1MAtYqIVamIVZmAVUkhBoQsg/3uhLe19qj3H3NXjbFFQ3AX88QLWC5GoFRlAtofoFJdgKxiSSBYy9GyQKYPZza4j7ksAHHA9JIPGh7/5zAAAAAElFTkSuQmCC') {
        currentRecept.ironSword = true
        return true
    } else if (image_base64 === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAG1BMVEUAAAAOPzYoHgtJNhUnsppoTh6JZycrx6wz68uqoKj7AAAAAXRSTlMAQObYZgAAAF5JREFUeF6tz1EJwDAMhOFYiIVaiIWzUAuzEAuTvW57uMCxwKD3+MEfiO2b3+vAzwTSYyrUBDiGQl0kvIWYA+kNxLroUKiBfQCDBanA4P1RoQSPmAIDjlCCHhgQfu0Cin4cjxIk8BAAAAAASUVORK5CYII=') {
        currentRecept.diamondPickaxe = true
        return true
    } else if (image_base64 === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABGlBMVEX///8eGhU9LQxZQhJoRRNrTBxJNBNGMRFdQx0sJx+NaB2peCylbR+icSdmRxh9XiKgaiM2KA5HLw1POxVZPRgcGRRALhRFLg+CYS6OZSk9KRCTay0iHhhlQxYaFxI2MCcSEA0pJR1KOB4SEAwaFxMbGBMgHRcyLSVbPhYXFBAZFhIzJhRaQBqMYCYWFBAkGgkdGhQ+Kg80LiZCMxo1LiUbFxIrJR06JgsrJh89KxIyMjJRORhGRkZKSkpUVFSQYiMRDwwTEAwNDAoODAoRDw0TEQ0TEQ4VEg4YFhMdGhUiHxgpHxExIg0yJBE0JRAxJRQqJR45Jw0qJh87Kg8xLCY3LiVINh05OTlSPR0+Pj5TU1NXV1dnZ2fLy8skqgJzAAAAAXRSTlMAQObYZgAAActJREFUeF7NkEWOHEEQRTs5i5mhkRmG2czMdP9rOHrTVbI8I3nnv/0vXkZG4/9LM44P7qqTxLaTZHhLPbQs3dZ1Vcuu/2ZpQq1rqqFrtq1l1p+WYZLsaoiuGwAZ83mzVr+PY1CrhqYBBZixo+K4sijtjWUZBsihNNQdnCQf0aIGtJVmdm3DtKbaUGfZAULoZg+8JURRTpqZpRoggRU3AULC7VYGSol5Apb5XNMsa4OeBZxHUWsPtD2PUpMpigKX/BQE6N2H42h9er8y5LmUlDJTUQYoCLBYLpfOeFEZjj538ueepAVlA8Sxe/zz18V4Ou1WgO93OoPcGxV0giLXeX3148urNK0tyXzf327zfDYrV44zfnT1/SxNefXNNmHUH422ncGgjxbj6YvLizMhaoBiEkbYaAQPPQ6mb9KXl98EdkUFHFHGTJOZvn/eR+s0xRxjIaL6DkVBICY7L1drzoXA2HVFqwI8RgpKCGVygmB6V2McVkDpeZIROKbpTeBMPILaOQ0fNPY57EnpgaGYTZBwI47D0Gk9bNTTO/SkJKZfriLOQyfs7jeskFLOpOwj7jhhq6rrKXvyax+B/F7jtjzt9VEX6jvyBOT/lt87NjDVK2XlDAAAAABJRU5ErkJggg==') {
        currentRecept.chest = true
        return true
    } else if (image_base64 === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAG1BMVEUAAAA9PSQoHgtJNhXq7leJZye8v03N0FBoTh6Jp74IAAAAAXRSTlMAQObYZgAAAFBJREFUeF6tzUENwEAIRNGxMBawgAUs1MJaWAuV3eOEkAyXcvsvAfDzkPTAqkMHrHtqQu9rAdl7Qj6hFrQGYSDfUAj6goH9QmhhwPZCYmGfD2TEGC3TC/o7AAAAAElFTkSuQmCC') {
        currentRecept.goldShover = true
        return true
    } else {
        return false
    }
}
