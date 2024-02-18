
const mongoose = require('mongoose');
const kill =require('kill-port')
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
const port = 8000;
//debugger;
//console.log(process.debugPort);

process.on('uncaughtException',err=>{
  console.log(err);
  console.log('UNCAUGHT EXCEPTION! shutting down ....');
  //process.exit(1);
})
const DB = process.env.DATABASE;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('DB connection successful');
  });
//console.log(process.env);

const server=app.listen(port, () => {
  
  console.log(`${port} port is listening`);
})
process.on('unhandledRejection',err=>{
  console.log(err.name,err.message);
  console.log('UNHANDLED REJESTION! shutting down ....');
  server.close(()=>{
    process.exit(1);
  })
})
//this
//console.log(x);