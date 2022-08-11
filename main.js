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
                    )} kcal</span><span>servings: ${servings}</span><span>${totalTime}mins</span></p>
                    <a href=${url} target="_blank"
                    rel="noreferrer nofollow" class="link">view recipe at: ${source}</a>
                    <p class="[ contains ] subtitle" data-label="caution">${cautions.join(
                        " &#8226; "
                    )}</p>
                    <p class="[ contains ] subtitle" data-label="health">${healthLabels.join(
                        " &#8226; "
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
                    <details>
                    <summary>ingredients list</summary>
                    <ul class="[ ingredients-list ]" data-list="ingredients">
                    </ul>
                    </details>
                    <details>
                    <summary>nutrition facts</summary>
                    <ul class="[ nutrition-list ]" data-list="nutrition">
                    </ul>
                    </details>
                    
                `

    console.log(totalDaily, totalNutrients)

    resultsContainer.append(card)
    addChartToCanvas(totalNutrients, card)
    addIngredientsToList(ingredients, card)
    addNutritionFactsToList(totalDaily, totalNutrients, card)
    // console.log(images.THUMBNAIL)
}

function addNutritionFactsToList(totalDaily, totalNutrients, card) {
    let ul = qs("[data-list='nutrition']", card)
    let keys = Object.keys(totalNutrients)
    
    keys.forEach(key => {
        if(key == "ENERC_KCAL") return
        let { label, quantity, unit } = totalNutrients[key]
        let li = document.createElement("li")
        li.innerHTML = `<span>${label}<span>${Math.round(
            quantity
        )}${unit}</span></span><span>${Math.round(totalDaily[key]?.quantity)}${
            totalDaily[key]?.unit
        }</span>`
        ul.append(li)
    })
}
function addIngredientsToList(ingredients, card) {
    let ul = qs("[data-list='ingredients']", card)
    ingredients.forEach(({ text }) => {
        let li = document.createElement("li")
        li.textContent = text
        ul.append(li)
    })
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
                    backgroundColor: ["#558d1a", "#a6e067", "#7aca25"],
                    cutout: "85%",
                    borderColor: "#fff6e6",
                    borderWidth: 0,
                    hoverBorderWidth: 1,
                    hoverBorderJoinStyle: "round",
                    borderAlign: "center",
                },
            ],
        },
        options: {
            plugins: {
                tooltip: {
                    backgroundColor: "#e4f4d3",
                    bodyFont: {
                        family: "Georgia,'Times New Roman',Times,serif",
                        size: 20,
                    },
                    bodyColor: "#191001",
                    bodyFontSize: 20,
                    padding: 10,
                    boxPadding: 10,
                    usePointStyle: true,
                    borderColor: "#477f0c",
                    borderWidth: 2,
                },
            },
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
