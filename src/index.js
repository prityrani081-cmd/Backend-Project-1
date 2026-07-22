//require('dotenv').config({path: './env'})  comment করার কারনঃ প্রথম লাইনে এটি দিলে code এর consistency খারাপ হয় ।

import dotenv from "dotenv" //config না করা পর্যন্ত কাজ করবেনা।
import connectDB from "./db/index.js";


//package.json->script->(-r dotenv/config --experimental-json-modules) : r flag set & request for experiment of config(dotenv)
dotenv.config({
    path: './env'
})


connectDB()








/*
import mongoose from "mongoose";
import {DB_NAME} from "./constants" 

import express from "express"
const app = express()

;( async ()=> {
try {
    await mongoose.connect(`${process.env.MONGODB_URI}`);
    app.on("error" , ()=>{

        console.log("ERROR: ",error);
        throw error
        
    }) //app(express এর) এর সাথে listen করছে

    app.listen(process.env.PORT, ()=>{
        console.log(`App is listening on port ${process.env.PORT}`);
        
    })
} catch (error) {
    console.error("ERROR: ", error)
    throw error
}

})()

*/