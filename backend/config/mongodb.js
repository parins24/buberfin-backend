import mongoose from "mongoose";

const connectToDb = async () =>{
    mongoose.connection.on('connected', ()=>{
        console.log("DB connectd");
        
    })
    await mongoose.connect(`${process.env.MONGODB_URI}/buberfin`)
}


export default connectToDb ;