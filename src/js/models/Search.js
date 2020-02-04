
import axios from 'axios';
import {key, proxy} from '../config';

export default class Search {
    constructor (query) {
        this.query = query;
    }  
    
    async getResults() {
        //key and proxy imported from config.js (check there for more info)
        try {
             //old API that shut down.. i leave it here for educational purposes
           // const res = await axios(`${PROXY}http://food2fork.com/api/search?key=${KEY}&q=${this.query}`)            // in order to only retrive the recipes instead of all the data
            const res = await axios(`https://forkify-api.herokuapp.com/api/search?&q=${this.query}`);           
            // in order to only retrive the recipes instead of all the data
            //the 'this' is used to encapsulate the data inside the object
            this.result = res.data.recipes;
            //console.log(this.result);
        } catch (error) {
            alert(error);
        }
    }
};





