export function qs(selector, parent = document) {
    return parent.querySelector(selector)
}

export function qsa(selector, parent = document) {
    return [...parent.querySelectorAll(selector)]
}

export function appendToUrl(url, param, value) {
    url.searchParams.append(param, value)
}

export function createCard({
    imgUrl,
    label,
    calories,
    servings,
    totalTime,
    url,
    source,
    cautions,
    healthLabels,
}) {
    let card = document.createElement("div")
    card.classList.add("card")
    card.innerHTML = `
                    <img src="${imgUrl}" alt="" class="card-thumbnail">
                    <p class="recipe-name">${label}</p>
                    <p class="[ recipe-info ] subtitle"><span>${calories} kcal</span><span>servings: ${servings}</span><span>${totalTime}</span></p>
                    <a href=${url} target="_blank"
                    rel="noreferrer nofollow" class="link">view recipe at: ${source}</a>
                    <p class="[ contains ] subtitle" data-label="caution">${cautions}</p>
                    <p class="[ contains ] subtitle" data-label="health">${healthLabels}</p>
                    <details>
                    <summary>calorie breakdown</summary>
                    <div class="canvas-container">
                    <canvas></canvas>
                    <span class="[ calorie-display ]">${calories}</span>
                    </div>
                    </details>
                    <details>
                    <summary>ingredients list</summary>
                    <ul class="[ ingredients-list ]" data-list="ingredients">
                    </ul>
                    </details>
                    <details>
                    <summary>nutrition facts</summary>
                    <ul class="[ nutrition-list ]" data-list="nutrition">
                    </ul>
                    </details>`

    return card
}

export function getDailyPercentage(totalDaily, key) {
    let num = Math.round(totalDaily[key]?.quantity)
    if (isNaN(num)) return ""
    return num + totalDaily[key]?.unit
}

export function handleRadioKeywordBtns() {
    let radio = qs("[data-radio=true]")
    if (radio != undefined) radio.remove()
}

export function removeKeywordBtn(val) {
    if (val.split(" ").length > 1) return
    let keywordBtn = qs(`[data-keyword=${val}]`)
    if (keywordBtn) keywordBtn.remove()
}

export function createKeywordBtn(val, isRadio) {
    let el = document.createElement("button")
    el.type = "button"
    el.textContent = val
    el.classList.add("keyword-btn")
    el.setAttribute("data-radio", isRadio)
    el.setAttribute("data-keyword", val)
    el.addEventListener("click", () => {
        let input = qs(`#${val}`)
        input.removeAttribute("data-checked")
        input.checked = false
        el.remove()
    })
    return el
}

export function addIngredientsToList(ingredients, card) {
    let ul = qs("[data-list='ingredients']", card)
    ingredients.forEach(({ text }) => {
        let li = document.createElement("li")
        li.textContent = text
        ul.append(li)
    })
}