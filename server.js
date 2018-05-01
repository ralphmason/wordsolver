
var path = require('path');
var express = require('express');
var bodyParser = require("body-parser");
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

app.post("/hilight",(res,rep)=>{
    var prob=res.body.data;
    var word=res.body.word;

    word=word.replace(/qu/g,'~');
   

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

    solver(data,word,(sol)=>{  
        function find(x){
            for(var i =0;i<x.length;i++){
                var ele=x[i];
                if (Array.isArray(ele)){
                    if(ele.length==64){
                        return ele;
                    }
                        
                    var ret=find(ele);

                    if (ret){
                        return ret;
                    }
                }
            }
            return null;
        }
        var toSend=find(sol);
        rep.send(toSend||{});
        rep.end();
    
    });
});


app.post('/save',(res,rep)=>{
    fs.writeFile(path.join(__dirname, `/saved/${res.body.level}.json`), JSON.stringify(res.body.layout), ()=>{
        rep.send('saved');
        rep.end();
    });
});

app.post('/load',(res,rep)=>{
    fs.readFile(path.join(__dirname, `/saved/${res.body.level}.json`), (err,data)=>{
    if(data){
        rep.send(JSON.parse(data? data.toString():{}));
      }
        rep.end();
    });
});


app.post('/works',(res,rep)=>{
    var word=res.body.word;

    fs.appendFile('good.txt',word+'\r', function (err) {
       rep.end();
      });
});
app.post('/didnt',(res,rep)=>{
    var word=res.body.word;

    fs.appendFile('bad.txt',word+'\r', function (err) {
       rep.end();
      });
});


var port = 3000;


app.listen(port, function() {
  console.log('listening on'+port);
});

