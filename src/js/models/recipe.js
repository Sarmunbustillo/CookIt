import axios from 'axios';
import { key, proxy } from '../config';


export default class Recipe {
    constructor(id) {
        this.id = id;
    }
    //get a single id targeted recipe
    async getRecipe() {
        try {
            //to get a recipe according to the API's documentation we use the URl https://www.food2fork.com/api/get 
            //be aware of the ending in 'get'. with the parameters key and recipes id
            // old API that shut down... i leave there for educational purposes
            // const res = await axios(`${proxy}https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            //console.log(res);
           //save all the incoming data 
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;        
        } catch (error) {
            console.log(error);
            alert('something went wrong :(');
        }
    }

    //calc the time of cooking (every 3 ingredients 15 min)
    calcTime() {
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    calcServings() {
        this.servings = 4;
    }

    //parse ingredients into a uniform data, and more readable
    parseIngredient() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tbsp', 'tbsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'];

        const newIngredients = this.ingredients.map( el => {
            //1. uniform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });

            //2.remove parenthesis
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            //3 parse ingredients into count, unit and ingredients
            const arrIng = ingredient.split(' ');
            //returns the indeex where the current element is at
            //basically to find the position of a unit that we dont know which unit we are looking for
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIng;
            if (unitIndex > -1) {
                //if there is an unit
                // ex. 4 1/2 cups, arrCount is [4, 1/2] ---> 4+1/2 .. eval(4+1/2) will calculate then 4.5
                //ex. 4 cups, arrCount is [4]                
                const arrCount = arrIng.slice(0, unitIndex); 

                let count;
                if (arrCount.length === 1) {
                    //sometimes the format given is 1-1/2 meaning one and a half, but it will be parse as 1 - .5
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    //join('+) joins the elements
                    //and eval will do the calculation on a string(check up there ^)
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }
                    //join returns a string.
                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' '),
                }

            } else if (parseInt(arrIng[0], 10)) {
                //there is no unit but 1st element is a number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                     unit: '',   
                     ingredient: arrIng.slice(1).join(' ')                     
                }
            } else if (unitIndex === -1) {
                //there is no unit and no number in 1st position
                //if there is no unit make count one. ex) says only tomato sauce, then say 1 totamo sauce
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }

            return objIng;
        });
        this.ingredients = newIngredients;
        
    }
    //in order to increase or decrease the servings
    //type == 'dec' or 'inc'
    updateServings (type) {
        //servings
        const newServings = type === 'dec' ? this.servings -1 : this.servings + 1;
        
        //ingredients
        this.ingredients.forEach(ing => {            
            ing.count *= (newServings / this.servings);           
        });

        this.servings = newServings;
    }
};