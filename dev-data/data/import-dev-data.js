const mongoose=require('mongoose')
const fs=require('fs')
const dotenv=require('dotenv')
//const Review = require('../../models/reviewModel')
dotenv.config({path:'./config.env'})
const tours=JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'))
const users=JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'))
const reviews=JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'))
const DB=process.env.DATABASE
mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:true,
    useUnifiedTopology:true
}).then(con=>{
    console.log('DB connection successful');
}
)
const Tour=require('./../../models/tourModel');
const User=require('./../../models/userModel');
const Review=require('./../../models/reviewModel');

const importData=async()=>{
try{
    await Tour.create(tours);
    await User.create(users);
    await Review.create(reviews);
    console.log('data successfully loaded');
    process.exit();
}catch(err){
console.log(err);
}
}
const deleteData=async()=>{
try{
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    
    console.log('data successfully deleted');
    process.exit();

}catch(err){
console.log(err);
}
}
if(process.argv[2]==='--import'){
    importData();
}
else if(process.argv[2]==='--delete'){
    deleteData();
}
//console.log(process.argv);
