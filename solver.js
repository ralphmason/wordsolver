

module.exports=function(data,result){

var _ = require('lodash');
var p=require('./problem').fromData(data);
var lineReader=require('line-reader');

//p("set");
//p("seins");

var r=[];

var filename='wordlist2.txt';
//filename='testlist.txt';

var ret=[];

lineReader.eachLine(filename, function(line, last) {
    line=line.replace(/qu/g,'~');
    var res=p(line);
    if(res.length){
       r.push([line,res]);
    }
    if(last){
        r=r.sort((x,y)=>x[0].length-y[0].length);
        r=r.map(x=>{
            var r = x[1];
            while(r.length!=64){
                r=r[1]||r[0];
            }
            return [ x[0],r]
        });

        result(r.map(x=>x[0]))
        return ;
        
        r.forEach(x=>{
            var crap = _.filter(x[1],x=>x);

            

            console.log(`${x[0].length}:${x[0]} ${crap}`);
        });
        
    }
  });

  function decode(val){
      console.log(`[${(val>>3)+1},${(val&7)+1}]`)
  }
}