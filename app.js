const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _= require('lodash');
const dotenv = require('dotenv');
dotenv.config({path:"./config.env"});

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
const PORT=process.env.PORT;

app.use(express.static("public"));


const DB=process.env.DATABASE;

mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false
}).then(function(){
    console.log("database connected");
}).catch((err) => console.log("DB not connected"));


const articleSchema={
      color:String,
      disposition:String
}
const Article = mongoose.model('Article',articleSchema);

app.route("/records")
.get( async function(req,res){

  let page=parseInt(req.query.page);
  let limit=parseInt(req.query.limit);
  let Next_page=page+1
  let Prev_page=page-1
  let Current_page=page
  if(!page){
    page=1;
  }
  if(!limit){
    limit=10;
  }

  if(page===1){
    Prev_page="null"
  }

  const skip=(page-1)*limit;

  const data=await Article.find().skip(skip).limit(limit);
  const open=await Article.find({disposition:"open"}).count();
  const ClosedCount=await Article.find({disposition:"closed"}).count();
  const total=await Article.find().count() -1;
  const total_page=Math.round(total/limit)+1;
 if (data.length === 0){
   Next_page = "null"
 }
  
  const Made_by={
    name:"Atul Balodi"
  }
  const article={
    Prev_page,
    Current_page,
    Next_page,
    limit,
    open,
    ClosedCount,
    total,
    total_page,
    data,
    Made_by
  }
  res.send(article);  
})
.post(function (req,res){
  const color=_.capitalize(req.body.color);
  const disposition=req.body.disposition;
  const article=new Article({
    color:color,
    disposition:disposition
  })
  article.save(function (err) {
    if(!err){
      res.send("success");
    }
  })
})
.delete(function (req,res) {
  Article.deleteMany(function(err){
    if(!err){
       res.send("Deleted all post")
    }
  })
})


app.route("/records/:post")
.get(function(req,res){
  const reqpost=_.capitalize(req.params.post);

  Article.find({color:reqpost},function(err,foundpost){
    if(!err){
      res.send(foundpost);
    }
  })
})




app.listen(PORT,function(){
  console.log("server started");
})
