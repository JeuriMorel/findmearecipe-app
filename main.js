import { qs, qsa } from "./utilities"
import { response } from "./example"

const form = qs("form")
const keywordsContainer = qs("[data-keywords]")
// const button = qs('button')
const radios = qsa("input[type=radio]")
const resultsContainer = qs("[data-container=results]")

form.addEventListener("submit", e => {
    e.preventDefault()
    const data = new FormData(form)
    const dish = data.getAll("dish")
    const diet = data.getAll("diet")
    const allergies = data.getAll("allergies")
    const cuisine = data.getAll("cuisine")
    // console.log("dish: ", dish)
    // console.log("diet: ", diet)
    // console.log("allergies: ", allergies)
    // console.log("cuisine: ", cuisine)
    resultsContainer.innerHTML = ""
    getRecipes()
    resultsContainer.scrollIntoView({
        behavior: "smooth",
    })
})

form.addEventListener("change", e => {
    let target = e.target
    let val = e.target.value
    let isRadio = target.type == "radio"
    if (isRadio) {
        handleRadioKeywordBtns()
    }
    if (target.checked) {
        let keywordBtn = createKeywordBtn(val, isRadio)
        keywordsContainer.append(keywordBtn)
    } else {
        removeKeywordBtn(val)
    }
})

function handleRadioKeywordBtns() {
    let radio = qs("[data-radio=true]")
    if (radio != undefined) radio.remove()
}

function removeKeywordBtn(val) {
    let keywordBtn = qs(`[data-keyword=${val}]`)
    if (keywordBtn) keywordBtn.remove()
}

function createKeywordBtn(val, isRadio) {
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

radios.forEach(radio => {
    radio.addEventListener("click", () => {
        radio.toggleAttribute("data-checked")
        if (radio.dataset.checked == null) {
            radio.checked = false
            handleRadioKeywordBtns()
        }
    })
})

//handleRecipes

// https://api.edamam.com/api/recipes/v2

//cuisineType=Eastern%20Europe

//https://api.edamam.com/api/recipes/v2?type=public&q=shrimp%20scampi%20alfredo&app_id=45433615&app_key=cec90a00&diet=balanced&diet=high-fiber&diet=high-protein&diet=low-carb&health=alcohol-cocktail&health=alcohol-free&cuisineType=Asian

function getRecipes() {
    let recipes = response.hits
    recipes.forEach(handleRecipeCards)
}

function handleRecipeCards(recipe) {
    const {
        label,
        images,
        source,
        url,
        yield: servings,
        ingredients,
        calories,
        totalTime,
        totalNutrients,
        totalDaily,
        digest,
        healthLabels,
        cautions,
    } = recipe.recipe

    let card = document.createElement("div")
    card.classList.add("card")
    card.innerHTML = `
                    <img src="https://source.unsplash.com/300x300/?food" alt="" class="card-thumbnail">
                    <p class="recipe-name">${label}</p>
                    <p class="[ recipe-info ] subtitle"><span>${Math.round(
                        calories
                    )}kcal</span><span>servings: ${servings}</span></p>
                    <a href=${url} target="_blank"
                    rel="noreferrer nofollow" class="link">go to: ${source}</a>
                    <p class="[ caution ] subtitle">Contains: ${cautions.join(
                        "&#8226;"
                    )}</p>
                    <details>
                    <summary>calorie breakdown</summary>
                    <div class="canvas-container">
                    <canvas></canvas>
                    <span class="[ calorie-display ]">${Math.round(
                        calories
                    )}</span>
                    </div>
                    </details>
                    
                `

    resultsContainer.append(card)
    addChartToCanvas(totalNutrients, card)
    // console.log(images.THUMBNAIL)
}

function addChartToCanvas({ FAT: fat, CHOCDF: carbs, PROCNT: protein }, card) {
    let macrosArray = [fat, carbs, protein].map(macro => new Macro(macro))

    let donutCanvas = qs("canvas", card).getContext("2d")

    let donutChart = new Chart(donutCanvas, {
        type: "doughnut",
        data: {
            labels: macrosArray.map(macro => macro.label),
            datasets: [
                {
                    label: "calories",
                    data: macrosArray,
                    backgroundColor: ["#7d5204", "#e19306", "#fdd183"],
                    cutout: "85%",
                    borderColor: "#fff6e6",
                    borderWidth: 4,
                    hoverBorderWidth: 1,
                    hoverBorderJoinStyle: "round",
                    borderAlign: "center",
                },
            ],
        },
    })
}

class Macro {
    constructor({ label, quantity }) {
        this.label = label
        this.quantity = Math.round(quantity)
        this.multiplier = label == "Fat" ? 9 : 4
        this.value = this.calories
    }

    get calories() {
        return this.multiplier * this.quantity
    }
}
