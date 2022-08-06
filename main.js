import { qs, qsa } from "./utilities"
import {response} from './example'

const form = qs("form")
const keywordsContainer = qs("[data-keywords]")
// const button = qs('button')
const radios = qsa("input[type=radio]")

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
    getRecipes()
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
    if(keywordBtn) keywordBtn.remove()
}

function createKeywordBtn(val, isRadio) {
    let el = document.createElement("button")
    el.type = "button"
    el.textContent = val
    el.classList.add('keyword-btn')
    el.setAttribute("data-radio", isRadio)
    el.setAttribute("data-keyword", val)
    el.addEventListener('click', () => {
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
    recipes.forEach(handleRecipe)
}

function handleRecipe(recipe) {
    const { label, images, source, url, yield: servings, ingredients, calories, totalTime, totalNutrients, totalDaily, digest } = recipe.recipe
    
    console.dir({ label, images, source, url, servings, ingredients, calories, totalTime, totalNutrients, totalDaily, digest })
}
