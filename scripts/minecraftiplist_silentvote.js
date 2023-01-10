//Преобразует изображение в String
// noinspection ES6MissingAwait

const toDataURL = url=>fetch(url).then(response=>response.blob()).then(blob=>new Promise((resolve,reject)=>{
    const reader = new FileReader()
    reader.onloadend = ()=>resolve(reader.result.replace(/^data:image\/(png|jpg);base64,/, ''))
    reader.onerror = reject
    reader.readAsDataURL(blob)
}))
let currentRecept = {}
let content = [0, 0, 0, 0, 0, 0, 0, 0, 0]
let secondVoteMinecraftIpList = false

async function silentVoteMinecraftIpList(project) {
    let response = await fetch('https://minecraftiplist.com/index.php?action=vote&listingID=' + project.id, {
        'headers': {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-language': 'ru,en;q=0.9,ru-RU;q=0.8,en-US;q=0.7',
            'cache-control': 'no-cache',
            'pragma': 'no-cache',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1'
        },
        'referrerPolicy': 'no-referrer-when-downgrade',
        'body': null,
        'method': 'GET',
        'mode': 'cors',
        'credentials': 'include'
    })
    if (!await checkResponseError(project, response, 'minecraftiplist.com')) return

    if (response.doc.querySelector('#InnerWrapper > script:nth-child(10)') != null && response.doc.querySelector('table[class="CraftingTarget"]') == null) {
        if (secondVoteMinecraftIpList) {
            secondVoteMinecraftIpList = false
            endVote({message: 'Error time zone', html: response.doc.body.outerHTML}, null, project)
            return
        }
        await fetch('https://minecraftiplist.com/timezone.php?timezone=Europe/Moscow', {
            'headers': {
                'accept': '*/*',
                'accept-language': 'ru,en;q=0.9,ru-RU;q=0.8,en-US;q=0.7',
                'cache-control': 'no-cache',
                'pragma': 'no-cache',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'x-requested-with': 'XMLHttpRequest'
            },
            'referrerPolicy': 'no-referrer-when-downgrade',
            'body': null,
            'method': 'GET',
            'mode': 'cors',
            'credentials': 'include'
        })
        secondVoteMinecraftIpList = true
        silentVote(project)
        return
    }
    if (secondVoteMinecraftIpList) secondVoteMinecraftIpList = false

    if (response.doc.querySelector('#Content > div.Error') != null) {
        if (response.doc.querySelector('#Content > div.Error').textContent.includes('You did not complete the crafting table correctly')) {
            endVote({message: response.doc.querySelector('#Content > div.Error').textContent, html: response.doc.body.outerHTML}, null, project)
            return
        }
        if (response.doc.querySelector('#Content > div.Error').textContent.includes('last voted for this server') || response.doc.querySelector('#Content > div.Error').textContent.includes('has no votes')) {
            let numbers = response.doc.querySelector('#Content > div.Error').textContent.substring(response.doc.querySelector('#Content > div.Error').textContent.length - 30).match(/\d+/g).map(Number)
            let milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000)/* + (sec * 1000)*/
            endVote({later: Date.now() + (86400000 - milliseconds)}, null, project)
            return
        }
        endVote({message: response.doc.querySelector('#Content > div.Error').textContent, html: response.doc.body.outerHTML}, null, project)
        return
    }

    if (!await getRecipe(response.doc.querySelector('table[class="CraftingTarget"]').firstElementChild.firstElementChild.firstElementChild.firstElementChild.src.replace(/^.*\/\/[^\/]+/, 'https://minecraftiplist.com'))) {
        endVote({message: 'Couldnt find the recipe: ' + response.doc.querySelector('#Content > form > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(3) > table > tbody > tr > td > img').src.replace(/^.*\/\/[^\/]+/, 'https://minecraftiplist.com'), html: response.doc.body.outerHTML}, null, project)
        return
    }
    await craft(response.doc.querySelector('#Content > form > table > tbody > tr:nth-child(2) > td > table').getElementsByTagName('img'))

    let code = 0
    let code2 = 0

    for (let i = 0; i < 6; i++) {
        code += content[i] << (i * 5)
    }
    for (let i = 6; i < 9; i++) {
        code2 += content[i] << ((i - 6) * 5)
    }

    response = await fetch('https://minecraftiplist.com/index.php?action=vote&listingID=' + project.id, {
        'headers': {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-language': 'ru,en;q=0.9,ru-RU;q=0.8,en-US;q=0.7',
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded',
            'pragma': 'no-cache',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1'
        },
        'referrerPolicy': 'no-referrer-when-downgrade',
        'body': 'userign=' + project.nick + '&action=vote&action2=placevote&captchacode1=' + code + '&captchacode2=' + code2,
        'method': 'POST',
        'mode': 'cors',
        'credentials': 'include'
    })
    if (!await checkResponseError(project, response, 'minecraftiplist.com')) return

    if (response.doc.querySelector('#Content > div.Error') != null) {
        if (response.doc.querySelector('#Content > div.Error').textContent.includes('You did not complete the crafting table correctly')) {
            endVote({message: response.doc.querySelector('#Content > div.Error').textContent, html: response.doc.body.outerHTML}, null, project)
            return
        }
        if (response.doc.querySelector('#Content > div.Error').textContent.includes('last voted for this server')) {
            let numbers = response.doc.querySelector('#Content > div.Error').textContent.substring(response.doc.querySelector('#Content > div.Error').textContent.length - 30).match(/\d+/g).map(Number)
            let milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000)/* + (sec * 1000)*/
            endVote({later: Date.now() + (86400000 - milliseconds)}, null, project)
            return
        }
        endVote({message: response.doc.querySelector('#Content > div.Error').textContent, html: response.doc.body.outerHTML}, null, project)
        return
    }
    if (response.doc.querySelector('#Content > div.Good') != null && response.doc.querySelector('#Content > div.Good').textContent.includes('You voted for this server!')) {
        endVote({successfully: true}, null, project)
    }
}

// function recalculate() {
//     let code = 0
//     let code2 = 0
//
//     for (let i = 0; i < 6; i++) {
//         code += content[i] << (i * 5)
//     }
//     for (let i = 6; i < 9; i++) {
//         code2 += content[i] << ((i - 6) * 5)
//     }
//     document.forms['main'].elements['captchacode1'].value = code
//     document.forms['main'].elements['captchacode2'].value = code2
// }

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
            if (await toDataURL(element.src.replace(/^.*\/\/[^\/]+/, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAP1BMVEX///9RQSpIOyRkUzB2Xz26lmGdgkwxKBhNPidyXThEOSFxWjiyjllCNSBoUzItJBY1Kht7YT0wJhhLPCZOPSek/k6aAAAAAXRSTlMAQObYZgAAAXFJREFUeF6VkYmOwkAMQ0nmvvf6/29dOzPArkBIhNJWssd5SS9vVgghvpJjDKGU8ELuc3a6nssllBk75FkeGsWOQjhvc8KMl79yKRF/APLRY+kdrtDv5IGW3nc4jsO1W5nBuzAnT+FBAWZzf0+p2+CdIzlS9wN3TityM7TmfSmGtuVIOedjGMO5hh+3UMgT5meutWZJ6TAMhe6833N8TmRXkbWymMGhVJvSwt44W3NKK+V8GJxCUgVs804gUq8V105Qo3Reh4eH8ZDhyyKb4SgYdgwaVhLKCS+7BfKptIZLdS0CYoi1bntwjAcjHR4aF5CIWI8BZ4mgSiu0zC653qbQ0QyzAcE7W0C1nLwOJCkdqvmhXtISi8942WM2o6TDw8sRpF5HvSYYAhBhgmiMCaaToLZkWzcs1nsZgpDhYHpmYFHNSbZwNFrrcq/x4zAIKYkGlZ/6f2EAwxQBJsMfa39P7m99XJ7X17CEZ/K9EXq/V7+8vxIydl/EGwAAAABJRU5ErkJggg==') {
                countRecept++
                if (countRecept === 1) {
                    content[0] = inventoryCount
                }
                if (countRecept === 2) {
                    content[1] = inventoryCount
                }
                if (countRecept === 3) {
                    content[2] = inventoryCount
                }
                if (countRecept === 4) {
                    content[3] = inventoryCount
                }
                if (countRecept === 5) {
                    content[4] = inventoryCount
                }
                if (countRecept === 6) {
                    content[5] = inventoryCount
                }
                //Если это палка
            } else if (await toDataURL(element.src.replace(/^.*\/\/[^\/]+/, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAAAoHgtJNhWJZydoTh6sX77EAAAAAXRSTlMAQObYZgAAADFJREFUeF7ljDENAAAIw2ZhFmYBC/jXxA8HWcJHz6YpzhEXoZjCDLIH+eRgBiAxhEUBBakJ98ESqgkAAAAASUVORK5CYII=') {
                countRecept2++
                if (countRecept2 === 1) {
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
            if (await toDataURL(element.src.replace(/^.*\/\/[^\/]+/, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAIVBMVEUAAADY2NhERESWlpY1NTVycnJoaGioqKj///+CgoJ/f3/RLsQ9AAAAAXRSTlMAQObYZgAAAGRJREFUeF6tyjERADEIRNFYwAIWsICFWIgFLGAhFlB5yXAMBZTZ7r/Z8XaILWShCDaQpQAgWCHqpksFJI1cZ9yAUhSdtQAURXN2ACD21+xhbzHPxcyjwhW7Z68CLhZVICQr4ek+KDhG7bVD+wwAAAAASUVORK5CYII=') {
                countRecept++
                if (countRecept === 1) {
                    content[1] = inventoryCount
                }
                if (countRecept === 2) {
                    content[4] = inventoryCount
                }
                //Если это палка
            } else if (await toDataURL(element.src.replace(/^.*\/\/[^\/]+/, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAAAoHgtJNhWJZydoTh6sX77EAAAAAXRSTlMAQObYZgAAADFJREFUeF7ljDENAAAIw2ZhFmYBC/jXxA8HWcJHz6YpzhEXoZjCDLIH+eRgBiAxhEUBBakJ98ESqgkAAAAASUVORK5CYII=') {
                countRecept2++
                if (countRecept2 === 1) {
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
            if (await toDataURL(element.src.replace(/^.*\/\/[^\/]+/, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAAAoHgtJNhWJZydoTh6sX77EAAAAAXRSTlMAQObYZgAAADFJREFUeF7ljDENAAAIw2ZhFmYBC/jXxA8HWcJHz6YpzhEXoZjCDLIH+eRgBiAxhEUBBakJ98ESqgkAAAAASUVORK5CYII=') {
                countRecept++
                if (countRecept === 1) {
                    content[4] = inventoryCount
                }
                if (countRecept === 2) {
                    content[7] = inventoryCount
                }
                //Если это алмаз
            } else if (await toDataURL(element.src.replace(/^.*\/\/[^\/]+/, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAIVBMVEUAAAAw270be2vR+vOi9udK7dEglYGM9OL///8szbEMNzBqdBtcAAAAAXRSTlMAQObYZgAAAHJJREFUeNrNzUEOAjEMQ1FaE0/D/Q9MM4pkduCu+KtIflIe/9arc4Hm1RVxgObnHTCGyHegGah5rdidgRpxF6EnvwDNV0dGnABAoJ9YAMgUmDsXxI5d7kgHFImYM7u6avbAGJ+AtEATMjvNBiiiNBvguDejWQ0NckD8GAAAAABJRU5ErkJggg==') {
                countRecept2++
                if (countRecept2 === 1) {
                    content[0] = inventoryCount
                }
                if (countRecept2 === 2) {
                    content[1] = inventoryCount
                }
                if (countRecept2 === 3) {
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
            if (await toDataURL(element.src.replace(/^.*\/\/[^\/]+/, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAP1BMVEX///9RQSpIOyRkUzB2Xz26lmGdgkwxKBhNPidyXThEOSFxWjiyjllCNSBoUzItJBY1Kht7YT0wJhhLPCZOPSek/k6aAAAAAXRSTlMAQObYZgAAAXFJREFUeF6VkYmOwkAMQ0nmvvf6/29dOzPArkBIhNJWssd5SS9vVgghvpJjDKGU8ELuc3a6nssllBk75FkeGsWOQjhvc8KMl79yKRF/APLRY+kdrtDv5IGW3nc4jsO1W5nBuzAnT+FBAWZzf0+p2+CdIzlS9wN3TityM7TmfSmGtuVIOedjGMO5hh+3UMgT5meutWZJ6TAMhe6833N8TmRXkbWymMGhVJvSwt44W3NKK+V8GJxCUgVs804gUq8V105Qo3Reh4eH8ZDhyyKb4SgYdgwaVhLKCS+7BfKptIZLdS0CYoi1bntwjAcjHR4aF5CIWI8BZ4mgSiu0zC653qbQ0QyzAcE7W0C1nLwOJCkdqvmhXtISi8942WM2o6TDw8sRpF5HvSYYAhBhgmiMCaaToLZkWzcs1nsZgpDhYHpmYFHNSbZwNFrrcq/x4zAIKYkGlZ/6f2EAwxQBJsMfa39P7m99XJ7X17CEZ/K9EXq/V7+8vxIydl/EGwAAAABJRU5ErkJggg==') {
                countRecept++
                if (countRecept === 1) {
                    content[0] = inventoryCount
                }
                if (countRecept === 2) {
                    content[1] = inventoryCount
                }
                if (countRecept === 3) {
                    content[2] = inventoryCount
                }
                if (countRecept === 4) {
                    content[3] = inventoryCount
                }
                if (countRecept === 5) {
                    content[5] = inventoryCount
                }
                if (countRecept === 6) {
                    content[6] = inventoryCount
                }
                if (countRecept === 7) {
                    content[7] = inventoryCount
                }
                if (countRecept === 8) {
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
            if (await toDataURL(element.src.replace(/^.*\/\/[^\/]+/, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAJFBMVEUAAAD//4tQUADe3gA8PADcdhOGhgD//wv////bohOurgC3YRCwQZoNAAAAAXRSTlMAQObYZgAAAGdJREFUeF6tykERwDAIRNFYwAIWsICFWKgFLMRCLMRCzZVCGQ5w7N7+mx3/DrGFLBTBBrIWAAhWiHrTpQLSirx03MCiKNK1ABRFc3YAIMdLd3ewt4EV8yhgcqbOq4DL+c4VQrISft0DreJJLwFPy8oAAAAASUVORK5CYII=') {
                countRecept++
                if (countRecept === 1) {
                    content[1] = inventoryCount
                }
                //Если это палка
            } else if (await toDataURL(element.src.replace(/^.*\/\/[^\/]+/, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAAAoHgtJNhWJZydoTh6sX77EAAAAAXRSTlMAQObYZgAAADFJREFUeF7ljDENAAAIw2ZhFmYBC/jXxA8HWcJHz6YpzhEXoZjCDLIH+eRgBiAxhEUBBakJ98ESqgkAAAAASUVORK5CYII=') {
                countRecept2++
                if (countRecept2 === 1) {
                    content[4] = inventoryCount
                }
                if (countRecept2 === 2) {
                    content[7] = inventoryCount
                }
            }
        }
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
