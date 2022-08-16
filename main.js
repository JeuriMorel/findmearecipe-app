import {
    qs,
    qsa,
    appendToUrl,
    createCard,
    getDailyPercentage,
    handleRadioKeywordBtns,
    removeKeywordBtn,
    createKeywordBtn,
    addIngredientsToList,
} from "./utilities"
import { Macro } from "./macro"
import { APP_ID, APP_KEY, EDAMAM_URL, SEARCH_TYPE } from "./app_params"

const form = qs("form")
const keywordsContainer = qs("[data-keywords]")
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

form.addEventListener("change", ({ target: { value, type, checked } }) => {
    let isRadio = type == "radio"
    if (isRadio) {
        handleRadioKeywordBtns()
    }
    if (checked) {
        let keywordBtn = createKeywordBtn(value, isRadio)
        keywordsContainer.append(keywordBtn)
    } else {
        removeKeywordBtn(value)
    }
})

radios.forEach(radio => {
    radio.addEventListener("click", () => {
        radio.toggleAttribute("data-checked")
        if (radio.dataset.checked == null) {
            radio.checked = false
            handleRadioKeywordBtns()
        }
    })
})


function createUrl(data) {
    const dish = data.getAll("dish")
    const diet = data.getAll("diet")
    const allergies = data.getAll("allergies")
    const cuisine = data.getAll("cuisine")

    const searchUrl = new URL(EDAMAM_URL)

    appendToUrl(searchUrl, "type", SEARCH_TYPE)
    appendToUrl(searchUrl, "q", dish)
    appendToUrl(searchUrl, "app_id", APP_ID)
    appendToUrl(searchUrl, "app_key", APP_KEY)
    diet.forEach(dietParam => appendToUrl(searchUrl, "diet", dietParam))
    allergies.forEach(healthParam =>
        appendToUrl(searchUrl, "health", healthParam)
    )
    if (cuisine.length) appendToUrl(searchUrl, "cuisineType", cuisine)

    return searchUrl
}



function handleRecipeCards(recipes) {
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
    } = recipes.recipe

    const cardParams = {
        imgUrl: images.REGULAR.url,
        label,
        calories: Math.round(calories),
        servings,
        totalTime: totalTime > 0 ? totalTime + "mins" : "",
        url,
        source,
        cautions: cautions.join(" &#8226; "),
        healthLabels: healthLabels.join(" &#8226; "),
    }

    const card = createCard(cardParams)
    resultsContainer.append(card)
    addChartToCanvas(totalNutrients, card)
    addIngredientsToList(ingredients, card)
    addNutritionFactsToList(totalDaily, totalNutrients, card)
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



function addChartToCanvas({ FAT: fat, CHOCDF: carbs, PROCNT: protein }, card) {
    let macrosArray = [fat, carbs, protein].map(macro => new Macro(macro))

    let donutCanvas = qs("canvas", card).getContext("2d")

    let _ = new Chart(donutCanvas, {
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


async function getRecipes({ href }) {
    try {
        const {
            data: { hits: recipes },
        } = await axios(href)
        recipes.forEach(handleRecipeCards)
    } catch (error) {
        const { message } = error
        alert(message)
    }
}