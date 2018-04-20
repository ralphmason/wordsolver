var path = require('path');
var express = require('express');
var bodyParser     =        require("body-parser");
var fs=require('fs');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


var staticPath = path.join(__dirname, '/web');
app.use(express.static(staticPath,{index:'index.html'}));

var solver=require('./solver');

app.post("/result",(res,rep)=>{
    var prob=res.body;

    var data='';

    for(var r=0;r<8;r++){
        for(var c=0;c<8;c++){
            data+=prob[(r*8)+c] ||'';
            if(c<7){
                data+=','
            }
        }
        if ( r <7){
            data +='\r';
        }
    }
    solver(data,(sol)=>{
        
        rep.send(sol);
        rep.end();
    
    });

})


app.post('/save',(res,rep)=>{
    fs.writeFile(path.join(__dirname, `/saved/${res.body.level}.json`), JSON.stringify(res.body.layout), ()=>{
        rep.send('saved');
        rep.end();
    })


})

app.post('/load',(res,rep)=>{
    fs.readFile(path.join(__dirname, `/saved/${res.body.level}.json`), (err,data)=>{
    if(data){
        rep.send(JSON.parse(data? data.toString():{}));
      }
        rep.end();
    })


})

app.listen(3000, function() {
  console.log('listening');
});

