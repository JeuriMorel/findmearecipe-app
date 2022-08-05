import { qs, qsa } from "./utilities"

const form = qs("form")
// const button = qs('button')
const radios = qsa("input[type=radio]")

form.addEventListener("submit", e => {
    e.preventDefault()
    let data = new FormData(form)
    for (const [key, value] of data.entries()) {
        console.log(key, value)
    }
})

radios.forEach(radio => {
    radio.addEventListener("click", () => {
        radio.toggleAttribute("data-checked")
        if (radio.dataset.checked == null) {
            radio.checked = false
        }
    })
})
