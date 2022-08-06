import { qs, qsa } from "./utilities"

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
    console.log("dish: ", dish)
    console.log("diet: ", diet)
    console.log("allergies: ", allergies)
    console.log("cuisine: ", cuisine)
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
    keywordBtn.remove()
}

function createKeywordBtn(val, isRadio) {
    let el = document.createElement("button")
    el.type = "button"
    el.textContent = val
    el.setAttribute("data-radio", isRadio)
    el.setAttribute("data-keyword", val)
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
