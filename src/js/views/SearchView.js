import { elements } from './base';

//is the same as writing it() => return elements.sea.....
export const getInput = () => elements.searchInput.value;

//clear the input after someting has being searched
export const clearInput = () => {
    elements.searchInput.value = '';
};

//clears the old results
export const clearResults = () => {
    elements.searchResultList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
};

//to display when a recipe is selected
export const highlightSelected = id => {
   //convert all the results in an array
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));    
   //for each object remove the active, so when something new gets cliked it will dissapear from the old one
    resultsArr.forEach(el => {
        el.classList.remove('results__link--active');
    });
    document.querySelector(`.results__link[href*="#${id}"]`).classList.add('results__link--active');
}

//shorten the length of the titles' recipe to one line without curring words in half and adding the '...' if there is more to it
//17 was chosen as a defoault parameter 
/*Example
const newTitle = [Pasta with tomato and spinach];
acc = 0 / acc + cur.length = 5 / newTitle = [pasta]
acc = 5 / acc + cur.length = 9 / newTitle = [pasta with]
acc = 9 / acc + cur.length = 15 / newTitle = [pasta with tomato]
acc = 15 / acc + cur.length = 18 / newTitle = [pasta with tomato]
acc = 18 / acc + cur.length = 24 / newTitle = [pasta with tomato]
*/

export const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    if(title.length > limit) {
        //split the string into an array for every blank space
        // the reduce method reduces the array to a single value
        title.split(' '). reduce((acc, cur) => {
            if (acc + cur.length <= limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;
        //start with an acc (accumulator) of 0    
        }, 0);

        //return the result concatenated with spaces in between each word
        return `${newTitle.join(' ')} ...`;
    }   
    return title;
}

const renderRecipe = recipe => {
    //render the recipe in the UI
    //the data from the API returns a picture, id, title, etc.. example :'recipe_id'
    const markup = `
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="${recipe.title}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;
    
    elements.searchResultList.insertAdjacentHTML('beforeend', markup);
};

//create button for next and prev and return the markup
//type: 'prev', or 'next'
// add the data attribute in this example its 'data-goto='
const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
        <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>
`;

//render the buttons to move between the recipes
const renderButtons = (page, numResults, resPerPage) => {
    // for example 30 total recipes and each page has 10 recipes = 3
    const pages = Math.ceil(numResults / resPerPage);
    
    let button;

    if (page === 1 && pages > 1) {
        //only button to go next page
       button =  createButton(page, 'next');
        //if in between pages
    } else if (page < pages) {
        //both buttons
        button = `
            ${createButton(page, 'prev')}
            ${createButton(page, 'next')}        
        ` ;        
         //if on last page
    } else if (page === pages && pages > 1) {
        //only button go to prev page
        button = createButton(page, 'prev');
    }

    elements.searchResPages.insertAdjacentHTML('afterbegin', button );
};

//recives an array of 30 recipes and loops through it, the pages and results per pages set to 10  
export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    //render results of current page
    const start  = (page - 1) * resPerPage;
    const end = page * resPerPage;
    //slice the first 10 recipes and render each recipe
    //the method slice does not include the ending part
    recipes.slice(start, end).forEach(renderRecipe);

    //render pagination buttons
    renderButtons(page, recipes.length, resPerPage);
};