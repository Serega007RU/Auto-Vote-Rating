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

//Текущий рецепт
var currentRecept = {};

//Собсна сам процесс крафта
function craft() {
    let count = 1;
    document.querySelector("#Content > form > table > tbody > tr:nth-child(2) > td > table").getElementsByTagName('img');
    if (currentRecept.sign) {
        
    }
}


//Узнаёт какой щас рецепт
async function getRecept() {
    let image = await addImageProcess(document.querySelector("#Content > form > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(3) > table > tbody > tr > td > img").src);
    let image_base64 = getBase64Image(image);
    if (image_base64 === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA+UlEQVRYR2NkGGDAOMD2M4w6ACME5rf4/qdltJy68Axs/PQ1Z8F2D14HLFh5EOzShHB7ogKkaeo+sDo5EWYUfejmEB0CA+4AmI9g3q/LdgIzcfkUXT0sJB69+QvWB9NPdAgMuAOIingyFBEdAmSYTZQWkh2AnhhhfJht6LkEl3qYuqHjAEKJEBYC6KkdV66hei6guQOISlFkKCI5DZBhB14tBB2QGWJM09oQ5jqcteGAO8DRRJEuIbD/zH3s7YEBdwCxiS7JVwclpO4//wrWCvMZseaQ3SgdcAfUJNmBQ+DZ63dgz9I9BEYdMBoCAx4CuAosupUD1HIAANcWHjDlMO3DAAAAAElFTkSuQmCC") {
        currentRecept.sign = true;
    } else if (image_base64 === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABNUlEQVRYR+WVMQ6CQBREpdTSxMTOTmhtrE2AwrsQDsMFvAKdBZB4BBsCWBpbS201GfMLVn52lXWXRJsfNTpv5u8OzsjQKwiCR5eUY0h/ZA2AhLMsg9emaTCjKML8eQLWADhh13XhPAzD3yZgDUBVOM9zrF/7GbAG8KkwXX9tCVgD+FZYWwLaATzPa3V2Xdeda+orzCYwGADf9wFZFAUmJaHLuTQBawBERquI4xgfJUmCWVVV66kmdjs1HP2PbLI9MFiANE1hqq9zaQ9wCRgDkJ0F+p7rCdnupQlYB9iuZ2jExXwMlsNpgkm3oixLvBd7QtW5NAFrACS8WU0BudtfMOvzDVdWrGqusFSTeOsB4wCio83y/tr58dpyzjlSfXhxv3cGAyB2ft/7rXwGuMYzDiAS/w3AE22QOvK20Ss1AAAAAElFTkSuQmCC") {
        currentRecept.ironSword = true;
    } else if (image_base64 === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABRUlEQVRYR2NkGGDAOMD2M4w6gOQQ4LM3+09MtH06eIoos4lShGzhgDkAZrHqmqlg9/y48xBM/3n9DiVAWESFwPzHFV1g2vr7fTAtL8EJpmdseoTiaaJDYMAdAPMmoSiQLE5BCZGkrb1g/vztT8D0jUdfyQuBQeMAQjnA00wUnEseTZyOkkae984B89FzB9FpgJDFMPkBcwDMYlhqP3DhLdhN/6f0g2n03AELCaqFwIA5AGaxgyEk/6OndliugeUO9LRAcQgMmANwBTl6PqdZCAyYAwgFOXp2hYWAbEcZWApWR5CdCwbMAcQGOa4QgNWit0OyUUpEonPBgDmA1CDHVWTD0gLJdcGAOYDcICe20oKpw5kGBswB1ApyYkMCIwQG3AEZfnLgFg2sPkcv24n1GbHqMEJgwB1ArMuppY7okpBaFqKbAwD5+hQw5D57LQAAAABJRU5ErkJggg==") {
        currentRecept.diamondPickaxe = true;
    } else if (image_base64 === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFaklEQVRYR+1WW1MUVxDuue2di4BykVXUrBARxVRMmRgrZWmVlUqeUz6YN/8F/yaXlzwllaLykkpipZLIRQISjYYUq1RAgYXdZXfnsnM56e7DbFCUAXzwJf1yzsw5Z/rrr7/uOQq8ZlNes3/4H8C+GXhnuF98fC7OGfz2jgUTd+f29a09HyLH18+r7LjNqPO47sZ4/OK2B1OzewOyawBvDeXER+d8djTQ4oPr62BoHj8/dQPobW2BlYoCvmXCl5PqrhmJBEARXzvjNhzTRE83wT+lMhxMpkDzbH62Nizek2xOMpCVSg1Gf9ciGXkpAIr4xgWdP9qZMHkMHW8t3S5DpsPXEzyGgBzHhZWi4HdfTSswPv3whb62vTx18qi4frGFD57IlBsU04QijscNfufVKg1QNCFGwj0EYiuoRyUp1q8nrW2MbANwuv+o8IMA0skkfDgsc5xrl07JeUj1WiAFSKDIVjH3IRukCTLFz/D4+W8+rK0Xwa4jK4XSMz5fCoAOaqoKqWQCPr0YY3G1IsuU4zBiEh5F3q7GWJCh45jWyns++9mG5UKJ52SVmgXFcnVnAKdyR8TZbJUPzC428SgwlemUBELiak25HHngSIaIjbAKaP27aR2erq6DqkhfA50eKIEHE48FrJciAFAK3j8iAZR9AU1GDH7JxyEQQYORT4aluLJdsv7/WJIiJccrhSLQqkDUQ4flPq8ugd5ZCBAAlsgW25aCN3NZcfKQFFF3SuYyUA0wDB1uzWmNo5SasBOOYidcXC3yGkV9uMkGVVNBeB6kEzoQUULRYPqxDZWqGa0B03L4YxdzUnxpVUaoxZPguh78+kiqumraEPgBsiMjPdZhQ1I3YH5ZBkDW1mzA4wKCwbnn+dEMDCID2QMYiarAgyVUOuId6vWhOZFgIH6gYSp8BjM64zKAwZ4Aqo4DKTxTsQIYunwDbt68CSMjIzAzNQ69bbKf5FfsaA0QgDNdsvOVN3v8/UWHqR3K+pDRFEghMQTimxkBhq5Bf0cd1wMoOgoCUqHv7FXQNA0WFhbAWX0AaUMydO+JFw2ARPhBDqkqS+GQLZuy2z1alZq4cFw+//SnjY5U6G6WPYGo9nwfLl+5xiLM5/OQtuZ5LZPW4PacE12GJMLhbA3aUinwHQvKtsHRkT2p6ZBAMRIjZKQH6hXUYEhZRLXp+HBs8F3MtweFQgE6RJ73EtBdASAG3utzoOLWGcS6afJY2pBRBkJtpGbsYQmSiRh0YrsIkOWM7qEWfOgeuATVahUSlVmwPJe1IVQdJubdaAZIA5f6TBZZGCWNVIYUcUUWBNiYofG8ywz0tdaR8s3qQhCZeJxFSUZVQYb9HfsAVcEuGhFpoG7JiKviPy3QMzUmArO05sHYfJ2pPdbqYqeUSvfRERlFTkbRMwBkYDJPIoxoRJSCEx0m9B6IM/0ZRWfFU1cka8EqIHY2LAW+n61xFYRlKLmRFjo2KTdompKAuwtONICezjZx/g3Z8aj2m5PYvxEIOSajrki2XPVhfA77ATGw2YBoTm2XRBs6dlwV4hoGgWtT8yZsRHVC+vhhBCFQ11dOy1/thm1DKi6vYwSEmlENr2Q/3reZgfBnQwLVYzrnnyImM+t1+Pup4B9asfws/bS+45Wsp7MdpSXgbWSE2CDzRI11QGK89ZfUwECHy47JrLrCTlOxGFIuW/LzwuOXmxZ5J6R9BARlhIykUWREu0zRD/ewWrAKSANr1U3RsWOqgO2/3q2O9wQg3Ez6INIoNTUskrE5CeB4h2hQTYytPVdqL3K8LwDhoa5D7YKqi+4bBKBqWpzLvTh+JQDh4YNtzXx/3CnHO0VPa7vSQNRHXmX9X+rooT/5uQYVAAAAAElFTkSuQmCC") {
        currentRecept.chest = true;
    } else if (image_base64 === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABGklEQVRYR2NkGGDAOMD2M4w6gGYhYGur8h9b9B4+fAfFzuHnAJjP1240RgmASxe/gfmNddfBNCwkqB4CA+YAdIsfP/oJ9un793/BtJ4+F5gO9j9LmxAYMAcQslhQkBnsY1k5dtqEwIA7AJbUPc1Ewfm+uNMCLETI5zB9VMsFA+YAmMUOhkJgT83f/gRMH7rggzXOYT6nWggMmANwWXzj0VdwtMISJ3rZT7UQGDAHwCyWl+AEe+bAhbdgGuZzdB8S4pOcCwbMAYSCnJBPcckTHQID5gBqBznJuYDuDtCQ4waX6YoSkPobvYQjN7UTnQYG3AG0SmxEh8CAOwDmUphD7r+AtGapHfcEa8MBdwC5JRup+oguCUk1mFj1ABSF3CEug5sSAAAAAElFTkSuQmCC") {
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

function addImageProcess(src){
  return new Promise((resolve, reject) => {
	let img = new Image()
	img.onload = () => resolve(img)
	img.onerror = reject
	img.src = src
  })
}
