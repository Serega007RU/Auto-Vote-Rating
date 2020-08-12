//vote();
function vote () {
	if (document.readyState != 'complete') {
		document.onreadystatechange = function () {
            if (document.readyState == "complete") {
                vote();
            }
        }
		return;
	}
	chrome.storage.sync.get('AVMRenableSyncStorage', function(result) {
		var settingsStorage;
		let settingsSync = result.AVMRenableSyncStorage;
		if (settingsSync) {
			settingsStorage = chrome.storage.sync;
		} else {
			settingsStorage = chrome.storage.local;
		}
		settingsStorage.get('AVMRprojectsMinecraftIpList', async function(result) {
			try {
                await getRecept();
                
			} catch (e) {
				if (document.URL.startsWith('chrome-error') || document.querySelector("#error-information-popup-content > div.error-code") != null) {
					sendMessage('Ошибка! Похоже браузер не может связаться с сайтом, вот что известно: ' + document.querySelector("#error-information-popup-content > div.error-code").textContent)
				} else {
					sendMessage('Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ": " + e.message + "\n" + e.stack);
				}
			}
		});
	});
}

function getNickName(projects) {
    for (project of projects) {
        if (project.MinecraftIpList && (document.URL.startsWith('https://www.minecraftiplist.com/index.php?action=vote&listingID=' + project.id))) {
            return project.nick;
        }
    }
    if (!document.URL.startsWith('https://www.minecraftiplist.com/index.php?action=vote&listingID=')) {
    	sendMessage('Ошибка голосования! Произошло перенаправление/переадресация на неизвестный сайт: ' + document.URL + ' Проверьте данный URL');
    } else {
        sendMessage('Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL);
    }
}

function sendMessage(message) {
    chrome.runtime.sendMessage({
         message: message
    }, function(response) {});
}

//Собсна сам процесс крафта
function craft() {
    let inventoryCount = 0;
    let inventory = document.querySelector("#Content > form > table > tbody > tr:nth-child(2) > td > table").getElementsByTagName('img');
    if (currentRecept.sign) {
    	let countRecept = 0;
    	let countRecept2 = 0;
    	for (let element of inventory) {
    		inventoryCount++;
    		//Если это дубовая доска
            if (getBase64Image(element) === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAEcElEQVRYR8WWwW9UVRTGL3RmmEIRKG0ppNVqigZJLCQSJcSEgDHEGBeauHBjDKzc4YIlC/8AEzfujAsT2cFCY4zRaEwIJpoQaiyQjrTSQjttZ2ppoUM7MOZ3Zr6XM2/e0CksvJt377v33e873/nOmdkQ/uex4XHxf/j8w4q+nZibDSfPfvtYd637I4ABZPR3ddvz+0tX7Xni8L7wxkdfruvOlg/HgUulUvju4nUDfvPIC2F2abGOVKtE1iTggf8anbMoifjevZVwaGhP6O7YauBS4/xPV8LmzRk710pqmhL44pO3Klzuxy+XxyKpUYChdxBivHN8yIAZ+p4zn371WyJWw0uAiZSxf2+XPbUmKoYA/N7Rg8+aEpxlzlCKIMWA9Nsfn6vDjBbe1QLxRBRNNpu1y+JSSynOSRURSUqRFIkInPngtUpxaTG8d/ygXc4gxz4iwLVHnj2AV0PqedKffX0x9O/qCPliKSyWlsOPl8YMu44ALyDBODzUZ09vrniO43sQ9t8wV4mOTd6RSI8msLq6agfT6bQ9yw+ra7mauSJTjuPAeETpE3D5wQO7J9XWlkzg2KEB62zPPb3dDm7dlA2L90vRE0WIWPWvUlNYgLJPinY+tSUM/z0TllerlcFoT2cMfHyqaOvL16YbU4D8N27+GzKZVOjr7YjA+aCzVpIoklQNN8YWQuHOXcsxgzxbINl2e+YmqpU1sGeHEbnw80g9gVPvHoh6Owcnp5fsg33PdIWr/8wZIU/k9VcGba0cD+fyUaRETsSTMwv2rlx+GFKpjaGvZ5ut2U80IQoADJgiHs5N2UcvDe62J2dIDx5hXiiuWLQC3LmjvQ6cNaMwvxw0R5UGBU4cGawIxBsREMhAZGWlHF5+sb+a1BoZCHjJAWIABpDI8Q7pGfgg0QPNQCCg8sQjDIhIAdbkGJkHdndGhFCFQSp4rzOQa0gBHpDsf4xM1IEguUVZqwrm+IJxK1+t713dW+wp08mEvMvP3rW9wf5qa2/aiBSll1wVYZe70mSND0ZvFiLHK2LVutLhzWcMQkg2oXJPpJJdZPQhPvFERQAwgAD36aAB4Xrtc09iFWBCTDa0tzfqgt6MzK+MTkepYQKR8dsLDbVOOmRAzkkZ5uO3580riSbkgDeiIlX0Kj88QmpQAwVwNbVOjpnHJVeJ6gz3NZTh6fdfrUh6DsiIas0iIaOKbL6wVOd8HzlnmpXlN79eT/41RAHl2edfrdlcfL/abg2g1ogkddyAvFcDMiPXWnNiI+JAvOUqDb41CxwieCCeY/ZVln7PG7TBA7pUZlTH850QcmpEmBUCKIDT1fd9B/Q9Qb3gz9xM8l+ySNPahJ/njuym0NPTbiWpimCb+pcR8YA3V6ROadnkjv/8xnHW/FsOETneV4XMSBVYeU0VIzOyVi+Q1HFgrdck4FPDPP6rmJucr/vjgdTZTDr8PnKrpbtbOuTZH3i+t9K5LRv9KnoFUhvbWgZetwJJHiE1eICxltRPnIJmFzzp+/8AoVgGTlFuFt4AAAAASUVORK5CYII=") {
                countRecept++;
                if (countRecept == 1) {
                	content[0] = inventoryCount;
                }
                if (countRecept == 2) {
                	content[1] = inventoryCount;
                }
                if (countRecept == 3) {
                	content[2] = inventoryCount;
                }
                if (countRecept == 4) {
                	content[3] = inventoryCount;
                }
                if (countRecept == 5) {
                	content[4] = inventoryCount;
                }
                if (countRecept == 6) {
                	content[5] = inventoryCount;
                }
            //Если это палка
            } else if (getBase64Image(element) === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAvklEQVRYR2NkGGDAOMD2M4w6gG4h4Gkm+h8U3fdffAPH+o1HX8F2D38HwHzuYCgE9vn87U/oGwID5gBCFsOyP83SwIA5AGaxvAQn2JMHLrxFiXP0go/qITBgDiA2yGkWAgPmAFKDnOohMGAOIDfIqRYCA+YASoOc4hAYMAdQK8jJDoEBcwC1g5zkEBgwB9AqyIkOgQFzAL0sxtkiGnAHaMhxg9vvMABrv9OqC4fRIhpwB9DKp7jMpXqbkFQPAAAIj7AhtyvgaAAAAABJRU5ErkJggg==") {
                countRecept2++;
                if (countRecept2 == 1) {
                	content[7] = inventoryCount;
                }
            }
    	}
    	recalculate();
    	return;
    }
    if (currentRecept.ironSword) {
    	let countRecept = 0;
    	let countRecept2 = 0;
    	for (let element of inventory) {
    		inventoryCount++;
    		//Если это железный слиток
            if (getBase64Image(element) === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABTElEQVRYR+2WMQqDMBSG6ym8gaNHcBBP4OIFXLyNg+AieBDFxVEENxG8hAhu0sKDV5rUl6QixoJdijbp+/4vyVPjofljaK7/uAEON+B53vNzWcuyFNb4XwA+KaYOw5DZ11mWwTVlYreB0wBkhYIggITDMGye6K7r4D5lQmrgNADVQhiTSkw1NsrE24A2ACzs+z7AR1G0GeLXxHEcC7t827bwu3EZgKIogChNU/h2XVfpOUUltW1bOD/Pc9bAZQBwrauqYkzsTYoaxnFkjNR1vW1AG0CSJAwhntu+7+G+aZpKe4JPSk36MqAdwHEcBtayLLiWGaASL8sC8/G88yaapoEm+O4D2gCQDBsSD7KuKwyZ51m4B3BNqaTU5K9ngTYAygRvYG9SqYHLAPAg0zQx8Lh7lZqCwiDyjQg3pTYABfhDhkjfCQ+pIviTG+AFAM4TIKlzVdgAAAAASUVORK5CYII=") {
                countRecept++;
                if (countRecept == 1) {
                	content[1] = inventoryCount;
                }
                if (countRecept == 2) {
                	content[4] = inventoryCount;
                }
            //Если это палка
            } else if (getBase64Image(element) === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAvklEQVRYR2NkGGDAOMD2M4w6gG4h4Gkm+h8U3fdffAPH+o1HX8F2D38HwHzuYCgE9vn87U/oGwID5gBCFsOyP83SwIA5AGaxvAQn2JMHLrxFiXP0go/qITBgDiA2yGkWAgPmAFKDnOohMGAOIDfIqRYCA+YASoOc4hAYMAdQK8jJDoEBcwC1g5zkEBgwB9AqyIkOgQFzAL0sxtkiGnAHaMhxg9vvMABrv9OqC4fRIhpwB9DKp7jMpXqbkFQPAAAIj7AhtyvgaAAAAABJRU5ErkJggg==") {
                countRecept2++;
                if (countRecept2 == 1) {
                	content[7] = inventoryCount;
                }
            }
    	}
    	recalculate();
    	return;
    }
    if (currentRecept.diamondPickaxe) {
    	let countRecept = 0;
    	let countRecept2 = 0;
    	for (let element of inventory) {
    		inventoryCount++;
    		//Если это палка
            if (getBase64Image(element) === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAvklEQVRYR2NkGGDAOMD2M4w6gG4h4Gkm+h8U3fdffAPH+o1HX8F2D38HwHzuYCgE9vn87U/oGwID5gBCFsOyP83SwIA5AGaxvAQn2JMHLrxFiXP0go/qITBgDiA2yGkWAgPmAFKDnOohMGAOIDfIqRYCA+YASoOc4hAYMAdQK8jJDoEBcwC1g5zkEBgwB9AqyIkOgQFzAL0sxtkiGnAHaMhxg9vvMABrv9OqC4fRIhpwB9DKp7jMpXqbkFQPAAAIj7AhtyvgaAAAAABJRU5ErkJggg==") {
                countRecept++;
                if (countRecept == 1) {
                	content[4] = inventoryCount;
                }
                if (countRecept == 2) {
                	content[7] = inventoryCount;
                }
            //Если это алмаз
            } else if (getBase64Image(element) === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABc0lEQVRYR2NkGGDAOMD2M4w6gOQQ4DE3+I8v2r6cvECSmSQpBlk8YA6AWfz5xHm86ZbXwhAsT2xIEB0CA+YAdIsXf3+BNQT0WXjA4vEPT4HpOzHFRIUEwRAYMAegW3zp9xewjy7+gdAwEMspAWZ6v7uEIn7IK56yEBh0DoDFPczHsBBBTxCVn++BhZ69e0NUWsCZBnDFPc0dQMji3q+P8ZYDUxbOB8trRQSAaUJpASMEBq0DYPl896/3JIUAobRAdAgMmANgqT368j6wzxPUIWU9LgBLA7+fvUJR8nHPUazlAsEQGHAHoJdw11ZswBsCPBYGKPJfTlwA898sWk9eCNDdATDnw7Kj3baFYKGLfbPAtGCQG94QeL9uF4q6B1n1WH0OM4RgSTjgDlBZ0gt27OsF60gKAVYpMbxxT3QIDJgD0NOCSFwgWAg9laMnCEKpHl090S2iAXMAekjgzQJIkjRrFQ+YA4i1mFR1BNMAqQaSqh4AYA1SMLuYz5cAAAAASUVORK5CYII=") {
                countRecept2++;
                if (countRecept2 == 1) {
                	content[0] = inventoryCount;
                }
                if (countRecept2 == 2) {
                	content[1] = inventoryCount;
                }
                if (countRecept2 == 3) {
                	content[2] = inventoryCount;
                }
            }
    	}
    	recalculate();
    	return;
    }
    if (currentRecept.chest) {
    	let countRecept = 0;
    	for (let element of inventory) {
    		inventoryCount++;
    		//Если это дубовая доска
            if (getBase64Image(element) === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAEcElEQVRYR8WWwW9UVRTGL3RmmEIRKG0ppNVqigZJLCQSJcSEgDHEGBeauHBjDKzc4YIlC/8AEzfujAsT2cFCY4zRaEwIJpoQaiyQjrTSQjttZ2ppoUM7MOZ3Zr6XM2/e0CksvJt377v33e873/nOmdkQ/uex4XHxf/j8w4q+nZibDSfPfvtYd637I4ABZPR3ddvz+0tX7Xni8L7wxkdfruvOlg/HgUulUvju4nUDfvPIC2F2abGOVKtE1iTggf8anbMoifjevZVwaGhP6O7YauBS4/xPV8LmzRk710pqmhL44pO3Klzuxy+XxyKpUYChdxBivHN8yIAZ+p4zn371WyJWw0uAiZSxf2+XPbUmKoYA/N7Rg8+aEpxlzlCKIMWA9Nsfn6vDjBbe1QLxRBRNNpu1y+JSSynOSRURSUqRFIkInPngtUpxaTG8d/ygXc4gxz4iwLVHnj2AV0PqedKffX0x9O/qCPliKSyWlsOPl8YMu44ALyDBODzUZ09vrniO43sQ9t8wV4mOTd6RSI8msLq6agfT6bQ9yw+ra7mauSJTjuPAeETpE3D5wQO7J9XWlkzg2KEB62zPPb3dDm7dlA2L90vRE0WIWPWvUlNYgLJPinY+tSUM/z0TllerlcFoT2cMfHyqaOvL16YbU4D8N27+GzKZVOjr7YjA+aCzVpIoklQNN8YWQuHOXcsxgzxbINl2e+YmqpU1sGeHEbnw80g9gVPvHoh6Owcnp5fsg33PdIWr/8wZIU/k9VcGba0cD+fyUaRETsSTMwv2rlx+GFKpjaGvZ5ut2U80IQoADJgiHs5N2UcvDe62J2dIDx5hXiiuWLQC3LmjvQ6cNaMwvxw0R5UGBU4cGawIxBsREMhAZGWlHF5+sb+a1BoZCHjJAWIABpDI8Q7pGfgg0QPNQCCg8sQjDIhIAdbkGJkHdndGhFCFQSp4rzOQa0gBHpDsf4xM1IEguUVZqwrm+IJxK1+t713dW+wp08mEvMvP3rW9wf5qa2/aiBSll1wVYZe70mSND0ZvFiLHK2LVutLhzWcMQkg2oXJPpJJdZPQhPvFERQAwgAD36aAB4Xrtc09iFWBCTDa0tzfqgt6MzK+MTkepYQKR8dsLDbVOOmRAzkkZ5uO3580riSbkgDeiIlX0Kj88QmpQAwVwNbVOjpnHJVeJ6gz3NZTh6fdfrUh6DsiIas0iIaOKbL6wVOd8HzlnmpXlN79eT/41RAHl2edfrdlcfL/abg2g1ogkddyAvFcDMiPXWnNiI+JAvOUqDb41CxwieCCeY/ZVln7PG7TBA7pUZlTH850QcmpEmBUCKIDT1fd9B/Q9Qb3gz9xM8l+ySNPahJ/njuym0NPTbiWpimCb+pcR8YA3V6ROadnkjv/8xnHW/FsOETneV4XMSBVYeU0VIzOyVi+Q1HFgrdck4FPDPP6rmJucr/vjgdTZTDr8PnKrpbtbOuTZH3i+t9K5LRv9KnoFUhvbWgZetwJJHiE1eICxltRPnIJmFzzp+/8AoVgGTlFuFt4AAAAASUVORK5CYII=") {
                countRecept++;
                if (countRecept == 1) {
                	content[0] = inventoryCount;
                }
                if (countRecept == 2) {
                	content[1] = inventoryCount;
                }
                if (countRecept == 3) {
                	content[2] = inventoryCount;
                }
                if (countRecept == 4) {
                	content[3] = inventoryCount;
                }
                if (countRecept == 5) {
                	content[5] = inventoryCount;
                }
                if (countRecept == 6) {
                	content[6] = inventoryCount;
                }
                if (countRecept == 7) {
                	content[7] = inventoryCount;
                }
                if (countRecept == 8) {
                	content[8] = inventoryCount;
                	recalculate();
                	return;
                }
            }
    	}
    }
    if (currentRecept.goldShover) {
    	let countRecept = 0;
    	let countRecept2 = 0;
    	for (let element of inventory) {
    		inventoryCount++;
    		//Если это золотой слиток
            if (getBase64Image(element) === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABVElEQVRYR+2WPQrCQBBGN6VoIXiCgLXkKMbKRvES9jaSQrH2FisInkDE3jJFDqCChYKNP5BxJDs62VWCGyF2xsR935vZyTrC8sexvL4oADI30GyKW7Kss1m65f8FoEkxtZRlpa99/xR/50x8beBnAPqFjo/EY2ZHD+LrnAmtgZ8BmC+EQbnE3Gh7b+JpwBoALjyZALnrKts4EeezxEHQT53yiwX87OQGQEpIHkVQFdcdGb2nuKTtdvrj3S4xkBsAIaDWUQQ1RBPfJkUP12lNUdJb7dUeQAMWAWjNYd9KCbPc84xaQtCk9Klwe4kvDcMDNWAZYNRSa1TvnI0McIlpUmpiuYRzwnMOWANAMhxIFGRTgW5trFVDNBF2NZeU66CXd4E1AM4EGijNq0r3fppUayA3ABRkt1PZsXvNpoL+LvZEhE1pDUDPns0d2jNhNsvw/1IA3AH2jNXZ87pgMwAAAABJRU5ErkJggg==") {
                countRecept++;
                if (countRecept == 1) {
                	content[1] = inventoryCount;
                }
            //Если это палка
            } else if (getBase64Image(element) === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAvklEQVRYR2NkGGDAOMD2M4w6gG4h4Gkm+h8U3fdffAPH+o1HX8F2D38HwHzuYCgE9vn87U/oGwID5gBCFsOyP83SwIA5AGaxvAQn2JMHLrxFiXP0go/qITBgDiA2yGkWAgPmAFKDnOohMGAOIDfIqRYCA+YASoOc4hAYMAdQK8jJDoEBcwC1g5zkEBgwB9AqyIkOgQFzAL0sxtkiGnAHaMhxg9vvMABrv9OqC4fRIhpwB9DKp7jMpXqbkFQPAAAIj7AhtyvgaAAAAABJRU5ErkJggg==") {
                countRecept2++;
                if (countRecept2 == 1) {
                	content[4] = inventoryCount;
                }
                if (countRecept2 == 2) {
                	content[7] = inventoryCount;
                }
            }
    	}
    	recalculate();
    	return;
    }
}

//Текущий рецепт
var currentRecept = {};

//Узнаёт какой щас рецепт
function getRecept() {
    let image_base64 = getBase64Image(document.querySelector("#Content > form > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(3) > table > tbody > tr > td > img"));
    if (image_base64 === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA+UlEQVRYR2NkGGDAOMD2M4w6ACME5rf4/qdltJy68Axs/PQ1Z8F2D14HLFh5EOzShHB7ogKkaeo+sDo5EWYUfejmEB0CA+4AmI9g3q/LdgIzcfkUXT0sJB69+QvWB9NPdAgMuAOIingyFBEdAmSYTZQWkh2AnhhhfJht6LkEl3qYuqHjAEKJEBYC6KkdV66hei6guQOISlFkKCI5DZBhB14tBB2QGWJM09oQ5jqcteGAO8DRRJEuIbD/zH3s7YEBdwCxiS7JVwclpO4//wrWCvMZseaQ3SgdcAfUJNmBQ+DZ63dgz9I9BEYdMBoCAx4CuAosupUD1HIAANcWHjDlMO3DAAAAAElFTkSuQmCC") {
        currentRecept.sign = true;
    } else if (image_base64 === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABMklEQVRYR+WVMQ6CQBBFodTSxMTOTmhtrEmAwrsQDsMFvAKdBZB4BBsCWBpbS201GTIFK5NdZdkh0WYSjfnv/539a1uGPkEQvPqkbEP6FhsACmdZBl6bpoEZRRHM0RNgA6CEHccB52EYjpsAG4CqcJ7ncPzad4AN4FthvP7aEmAD+FVYWwLaAVzX7XR2Xde9xzRUmExgMgC+7wNkURQwMQldzqUJsAEgGR5FHMfwVZIkMKuq6rxqYrdjw6k+82QPTBYgTVMwN9S5tAeoBIwByHYBf6d6YvAOsAPsd0toxPVqBiynyxwm3oqyLHt7QtW5dAfYAFDY2y4A8nC8tU14fcCVFauaKizVJD56wDiA6MjbPNszP987zilHqo8X9X97MgBi5w+938o7QDWecQCR+G8A3m2QOvKmXFx+AAAAAElFTkSuQmCC") {
        currentRecept.ironSword = true;
    } else if (image_base64 === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABQ0lEQVRYR2NkGGDAOMD2M4w6gOQQ4LM3+09MtH06eIoos4lShGzhgDkAZrHqmqlg9/y48xBM/3n9DiVAWESFwPzHFV1g2vr7fTAtL8EJpmdseoTiaaJDYMAdAPMmoSiQLE5BCZGkrb1g/vztT8D0jUdfyQuBQeMAQjnA00wUnEseTZyOkkae984B89FzB9FpgJDFMPkBcwDMYlhqP3DhLdhN/6f0g2n03AELCaqFwIA5AGaxgyEk/6OndliugeUO9LRAcQgMmANwBTl6PqdZCAyYAwgFOXp2hYWAbEcZSh1Bdi4YMAcQG+S4QgBWi94OyUYpEYnOBQPmAFKDHFeRDUsLJNcFA+YAcoOc2EoLpg5nGhgwB1AryIkNCYwQGHAHZPjJgVs0sPocvWwn1mfEqsMIgQF3ALEup5Y6oktCalmIbg4A+foUMN2VCYUAAAAASUVORK5CYII=") {
        currentRecept.diamondPickaxe = true;
    } else if (image_base64 === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFVklEQVRYR+1WW29UVRT+zm3uvTAttEAHymWgAoVixKBIDMGEGH02POAb/4J/4+XFJ40hvhiVGBUKxUIFwZoOTOTSdjqXzsy5zDn7bLPW7hkLhZ6CJry4XvY+Z+991re+9a21j4ZXbNor9o//Abw0A29O7JcfHk1yBr+ecnD15uxLfeuFD5Hjs8d0dpy3OjxW/QSPn10OcH3mxYBsGMDr40X5wVHBjsb6BHxhwjICfn7shxjp78NCU4NwbHx+Td8wI7EAKOIzh/2uY5qY2R78VW9gczoDI3D52Vl2eE+6N81AFpptXPzViGXkuQAo4nPHTf7oUMrmMXK8unSHLZUOYaZ4jAB5no+FmuR3X0xrmJy++0xfa14e2LdTnj3Rxwf35BpdimlCESeTFr8L2s0uKJoQI9EeArEa1L26EuuX15w1jKwBcGj/TinCENl0Gu9PqBwXB5RTch5RvRQqARIoskXHRsQGaYJMEzkeP/1FYKlag9vxsVCpP+HzuQCYTl1HJp3CxycSLK7+lMpxFDEJjyIf0BMsyMhxwujnPZ/86GK+Uuc5WbPtoNZorQ/gQHGHPFJo8YGZBz08SglkMwoIias/43PkoacYIjaiKqD1b6ZNPF6sQteUr7GhAFoY4Op9iWo9BgCl4J0dCkBDSPRYCfxUSiKUYZeRjyaUuArDqv5/e6hESo4XKjXQqpQS49vVvqCjgE6VQ1TrzfUZeK1YkPu2KBFtzahchroFyzJxadbo0kmpiTrhxSkHDxZrvEZRb+9xoRs6ZBAgmzJBREnNwPR9F82WHa8B2/H4YyeKSnxZXUVoJNPw/QA/31OqbtkuQhEipBwB2DXoIm1amJtXAZDley3cr+jMShCIeAYOFguysAnQdQ13HnZA9+X4iEBvKsVARGjA0AWDuXjDZwAHt4VoeR4yuoamE2L81DmcP38eFy5cwI3rkxjJq35SWnDjNUAADg+rztdY6fG3H3hM7XhBIGdoyFhUIQJf3ZCwTAP7BzvQtRA1T0ModIweeQ+GYaBcLsNbvIOspRi69SiIB0AifLcoUG0o4ZDN26rb3VtUmji+Wz3/8LsLw9CxtVf1BKI6EAKnTp9hEZZKJWSdOV7LZQ1cnvXiy5BEOFFoI5/JQHgOGq7F0ZE9aptIWSaIETLSA/UKajCkLKLa9gR2HXwLQRCgUqlgUJZ4LwHdEABi4O1RD02/wyCqts1jfVlFGUq9m5ord+tIpxIY6qH3QM4M0PIEto6dRKvVQqo5AyfwWRtSN3F1zo9ngDRwctRmkUVR0khlSBE3VUHADYDJks8MjPZ3IOVKdZkBcskki5KMqoJMihBTZaqCDTQi0kDHURG35D9aoGdqTATm4VKAK3MdpnZXv49sRildCJUuipyMomcAuolrJRJhTCOiFOwZtDGyKcn05zSTFU9dkazP0JidZUfDtzNtroKoDBU3yiLHNuWGNKClcLPsxQPYNpSXx/aqjke135uWDIQck1FXJJtvCUzOCsXASgOiObVdEm3k2PN1JA2T912fs7Ec1wnp49uH8lJCw+lD6qpddl1kkup3jIBQM2oLE9/fdpmB6LIhgZoJk/NPEZPZnQ7+fCz5Qqs1nqSf1tf9Jds2NCA1SLyx12A2yALZZh2QGC/9oTQwNuizYzKno7HTTCKBm2XVkp8W3upUxf4T0mYCAkicPpSFEES7StF3t2yuAtLAUmtFdOyYKmDt1bvacTTfEIBoM+mDSKPUtDvAlVkFYPeg7FJNjC09VWrPcvxSAKJDw1sGJFUX/W8QgJbtcC5fxPG/AhAd3pzv5f/H9XK8XvSxIow7/F+s/w3q6KE/0+QK8AAAAABJRU5ErkJggg==") {
        currentRecept.chest = true;
    } else if (image_base64 === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABG0lEQVRYR2NkGGDAOMD2M4w6gGYhYGur8h9b9B4+fAfFzuHnAJjP1240RgmASxe/gfmNddfBNCwkqB4CA+YAdIsfP/oJ9un793/BtJ4+F5gO9j9LmxAYMAcQslhQkBnsY1k5dtqEwIA7AJbUPc1Ewfm+uNMCLETI5zB9VMsFA+YAmMUOhkJgT83f/gRMH7rggzXO0UtHikNgwByAy+Ibj76CPQVLnOhlP9VCYMAcALNYXoIT7JkDF96CaZjP0X1IiE9yGhgwBxAKckI+xSVPdAgMmAOoHeQk5wK6O0BDjhtcpitKQOpv9BKO3NROdBoYcAfQKrERHQID7gD0+v3+C0hrltpxT7A9AAuJAXMAuSUbqfqILglJNZhY9QAUhdwhLzndMwAAAABJRU5ErkJggg==") {
        currentRecept.goldShover = true;
    }
}

//Преобразует изображение в String
function getBase64Image(img) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

// function addImageProcess(src){
//   return new Promise((resolve, reject) => {
// 	let img = new Image()
// 	img.onload = () => resolve(img)
// 	img.onerror = reject
// 	img.src = src
//   })
// }
