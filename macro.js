export class Macro {
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
