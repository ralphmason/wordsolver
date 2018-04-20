
var _ =require('lodash');

function loadProblem(name){
    var data = require('fs').readFileSync(name).toString()
      return fromData(data)    
}

function fromData(data){
    
var raw; 
var split='';

data = data.toLowerCase().replace(/qu?/g,'~').split('\r')

if (data[0].indexOf(',')>=0){
    split=',';
}

raw= data.map(x=>x.trim().split(split));


var problem = new Array(64);
var ends = new Array(64);

for(var i=0;i<raw.length;i++){
    var arr=raw[i];

    for(var j = 0; j < arr.length;j++){
        var char = raw[i][j];
        if (char.length==2 && char[1]=='!'){
            ends[(i<<3)+j]=true;
            char=char[0];
        }
        problem[(i<<3)+j]=char;
    }
}

var chars={};

for(var i =0; i< 64 ; i++){
    var c = problem[i];
    if(  c && !ends[i]){
        chars[c] = chars[c] ||[];
        chars[c].push(i);
    }
}

function searchRow(char,row,position,data,pos,last){
    var result=[];
    
    if (row <0 || row >7){
        return result;
    }

    function check(position){
        var p = (row<<3)+(position);
        
        if (data[p]){
            return;
        }

        if(ends[p] && !last){
            return result;
        }

        if(problem[p]=='*' || problem[p]==char){
            var n = data.slice(0);
            n[p]=problem[p]+pos;
            result.push([p,n]);
        }  
    }

    check(position);

    if( position > 0){
        check(position-1);
    }

    if (position<7){
        check(position+1);
    }

    return result;
}

function search(chars,data,pos){

     var results=[];

     function append(res){
         if(res.length){
             results.push(res);
         }
     }

    data.forEach(x=>{
        var position=x[0];
        var row=position>>3;
        var p=position&7;
        var last = chars.length==1;
        append(searchRow(chars[0],row-1,p,x[1],pos,last));
        append(searchRow(chars[0],row,p,x[1],pos,last));
        append(searchRow(chars[0],row+1,p,x[1],pos,last));
    });

    if (results.length > 0 && chars.length > 1){
        var ret=[];
        results.forEach(x=>{
            var r=search(chars.substr(1),x,pos+1);
            if(r.length){
                ret.push(r);
            }
        })
        return ret;
    }

    return results;
}



function findword(word){
    var starts=chars[word[0]]||[];
    var results=[];

    
    if(chars['_']){
       starts=starts.concat(chars['_']);
    }

    if( starts.length==0){
        return [];
    }

    starts.forEach(x=>{
        var data=new Array(64);
        data[x]=word[0]+'1';
        var found=search(word.substr(1),[[x, data]],2);
        found.forEach(x=>{
            x.forEach(y=>{
                //if (checkEnds(y,word)){
                results.push(y);
                //}
            })
        });
        
    });

    return results;
}
    return findword;

};


module.exports={
    load:loadProblem,
    fromData:fromData
}
