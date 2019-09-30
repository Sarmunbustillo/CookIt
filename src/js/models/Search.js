
import axios from 'axios';
import {key, proxy} from '../config';

export default class Search {
    constructor (query) {
        this.query = query;
    }  
    
    async getResults() {
        //key and proxy imported from config.js (check there for more info)
        try {
            const res = await axios(`${proxy}https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);            
            // in order to only retrive the recipes instead of all the data
            //the 'this' is used to encapsulate the data inside the object
            this.result = res.data.recipes;
            //console.log(this.result);
        } catch (error) {
            alert(error);
        }
    }
};





