import uniqid from 'uniqid';

export default class List {
    constructor() {
        this.items = [];
    }

//we installed npm uniqid to create unique ids
    addItem (count, unit, ingredient) {
        const item = {
            id: uniqid(),
            count,
            unit,
            ingredient
        }
        this.items.push(item);
        return item;
    }

    deleteItem (id) {
        //find the index of the desired id to delete
        const index = this.items.findIndex(el => el.id === id);
        // starting at the found index and remove one element. splice mutates the original array
        this.items.splice(index, 1);
    }

    updateCount (id, newCount) {
        //method find finds the element.
        //find the element and update its count
        this.items.find(el => el.id === id).count = newCount;
    }

    deleteList() {
        this.items = [];       
    }
}