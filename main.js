import { qs, qsa } from "./utilities"
// import { response } from "./example"
import { Macro } from "./macro"
import {
    APP_ID,
    APP_KEY,
    EDAMAM_URL,
    SEARCH_TYPE
} from './app_params'


const form = qs("form")
const keywordsContainer = qs("[data-keywords]")
// const button = qs('button')
const radios = qsa("input[type=radio]")
const resultsContainer = qs("[data-container=results]")

form.addEventListener("submit", e => {
    e.preventDefault()
    const data = new FormData(form)
    resultsContainer.innerHTML = ""
    const url = createUrl(data)
    getRecipes(url)
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
    if(val.split(' ').length > 1) return
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

function createUrl(data) {
    const dish = data.getAll("dish")
    const diet = data.getAll("diet")
    const allergies = data.getAll("allergies")
    const cuisine = data.getAll("cuisine")

    const searchUrl = new URL(EDAMAM_URL)

    searchUrl.searchParams.append('type', SEARCH_TYPE)
    searchUrl.searchParams.append('q', dish)
    searchUrl.searchParams.append('app_id', APP_ID)
    searchUrl.searchParams.append('app_key', APP_KEY)
    diet.forEach(dietParam => searchUrl.searchParams.append("diet", dietParam))
    allergies.forEach(healthParam =>
        searchUrl.searchParams.append("health", healthParam)
    )
    if(cuisine.length) searchUrl.searchParams.append('cuisineType', cuisine)

    return searchUrl
}

async function getRecipes({ href }) {
    let response = await fetch(href)
    let recipes = await response.json()
    recipes.hits.forEach(handleRecipeCards)
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
        healthLabels,
        cautions,
    } = recipe.recipe

    let time = totalTime > 0 ? totalTime + 'mins' : ''

    let card = document.createElement("div")
    card.classList.add("card")
    card.innerHTML = `
                    <img src="${images.REGULAR.url}" alt="" class="card-thumbnail">
                    <p class="recipe-name">${label}</p>
                    <p class="[ recipe-info ] subtitle"><span>${Math.round(
                        calories
                    )} kcal</span><span>servings: ${servings}</span><span>${time}</span></p>
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


    resultsContainer.append(card)
    addChartToCanvas(totalNutrients, card)
    addIngredientsToList(ingredients, card)
    addNutritionFactsToList(totalDaily, totalNutrients, card)
    // console.log(images.SMALL.url)
}

function addNutritionFactsToList(totalDaily, totalNutrients, card) {
    let ul = qs("[data-list='nutrition']", card)
    let keys = Object.keys(totalNutrients)
    const boldLabels = ["Fat", "Cholesterol", "Sodium", "Protein", "Carbs"]

    keys.forEach(key => {
        if (key == "ENERC_KCAL" || key == "CHOCDF.net") return
        let { label, quantity, unit } = totalNutrients[key]
        const classList = boldLabels.includes(label)
            ? 'class="fw-bold"'
            : "class='padding-inline-start-16'"

        let li = document.createElement("li")
        li.innerHTML = `<span ${classList}>${label}<span class="[ ] [ margin-inline-start-4 | fw-regular ]">${Math.round(
            quantity
        )}${unit}</span></span><span class="fw-bold">${getDailyPercentage(
            totalDaily,
            key
        )}</span>`
        ul.append(li)
    })
}
function getDailyPercentage(totalDaily, key) {
    let num = Math.round(totalDaily[key]?.quantity)
    if (isNaN(num)) return ""
    return num + totalDaily[key]?.unit
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


