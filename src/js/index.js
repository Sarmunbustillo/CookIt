//global controller
import Search from './models/Search';
import * as searchView from './views/SearchView'
import * as recipeView from './views/recipeView'
import * as likesView from './views/likesView'
import * as listView from './views/listView'
import { elements, renderLoader, clearLoader} from './views/base';
import Recipe from './models/recipe';
import List from './models/List';
import Likes from './models/likes';


/**Global state of the app
 * Search object
 * current reciper object
 * shopping list object
 * like recipes
 */
const state = {};
window.state = state;

/**
 * SEARCH CONTROLLER
 */
const controlSearch = async () => {
    //1. get the query from view
    const query = searchView.getInput(); 
    //console.log(query);

    if(query) {
        //2. new search object and add to state
        state.search = new Search(query);
        
        //3. prepare UI for results.. clear text and display loading arrow
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            //4 search for recipes
            await state.search.getResults();
    
            //5. Render the results on UI
            //remove the loading arrow
            clearLoader();
            // the '.result. is where the result is stored from the function getResults from the module search.js
            searchView.renderResults(state.search.result);
            
        } catch (error) {
            alert('oops something went wrong with the search')
            //if there is an error clear the loader
            clearLoader();
        }
    }    
};

elements.searchForm.addEventListener('submit', e => {
    //to avoid the page from reloading it self after hitting the submit button
    e.preventDefault();
    controlSearch();
});


//since the pagination buttons only appear after a search, we need to use event delegation
//attach the eventhandler to an event that is alreay availabe
elements.searchResPages.addEventListener('click', e => {
    //closest method  returns the closest ancestor of the current element (or the elementt itself)
    //we set the default to btn-inline
    //console.log(e.target);
    const btn = e.target.closest('.btn-inline');     
    if (btn) {
        //i added the data atribute goto in the html for the buttons in searchView
        //set it to base 10 (from 0 to 9)
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);        
    }
});


/**
 * RECIPE CONTROLLER
 */
const controlRecipe = async () => {
    //window.location is the entire URL. hash is for the hash ( href="#). and then remove the # symbol
    //get id from url
    const id = window.location.hash.replace('#', '');
    //console.log(id);

    if (id) {
        //prepare the UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //highligh selected search item
        if (state.search) {
            searchView.highlightSelected(id);
        }
        //create new recipe object
        state.recipe = new Recipe(id);

        try {
            //get recipe data and parse ingredients
            await state.recipe.getRecipe();            
            state.recipe.parseIngredient();
            //console.log(state.recipe);
            //calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
    
            //render the recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
                );

        } catch (error) {
            console.log(error);
            alert('Error proccessing recipe');
        }
    } 
};
//<a class="results__link" href="#${recipe.recipe_id}">
//window is the browsers object the global object
//the hashChange fires everytime there is a change in the hash --> href="#${recipe.recipe_id}
// //add an event to the loader that fires every time something is reloaded
// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe); to maintain the same selected recipe even when loaded
// cleaner way of writing above code
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe ));


/**
 * LIST CONTROLLER
 */
const controlList = () => {
    //create a new list if there is none yet
    if (!state.list) state.list = new List();

    //add each ingredients to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item =  state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });

    const clearBtn = document.querySelector('#btn-clear-list');
    if (!clearBtn) listView.renderClearListButton();
};

//Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    //to get the id of the item
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        //delete from state
        state.list.deleteItem(id)

        //delete from UI
        listView.deleteItem(id);

        //handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        if (val > -1) state.list.updateCount(id, val);
    }
});

//handle event clear shopping list
document.querySelector('.shopping').addEventListener('click', e => {
    if (e.target.matches('#btn-clear-list, #btn-clear-list *')) {
        //clear array
        state.list.deleteList();

        //clear list form the UI
        elements.shopping.innerHTML = '';
        document.querySelector('.clear__list').innerHTML = '';
    }
});


/**
 * LIKES CONTROLLER
 */
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;
    //user has not yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        //add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img            
        );
        
        //toggle the like button
        likesView.toggleLikeBtn(true);

        //add like to UI list
        likesView.renderLike(newLike);               

    //user has yet liked current recipe
    } else {
        //delete like to the state
        state.likes.deleteLike(currentID);

        //toggle the like button
        likesView.toggleLikeBtn(false);

        //delete like to UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());    
};

//restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();

    //restore likes
    state.likes.readStorage();

    //toggle like menu buttons
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    //render the existing likes
    state.likes.likes.forEach(like  => likesView.renderLike(like));
});

///handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        //decrease button is clicked
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        //increase button is clicked)
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
        //shopping list
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
     //add ingredients to shopping list
        controlList()
    } else if(e.target.matches('.recipe__love, .recipe__love *')) {
        // like controller
        controlLike();
    } else if (e.target.matches('#btn-delete-likes')) {
        likes.deleteALLLikes();
    }
});



