var puz = $('#puzzle');

const STATES={
    enabled:' ',
    disabled:'  ',
    exclaim:'!',
    book_open:'bo',
    book_closed:'bc'
}

var transitions={};
         
var raw =[STATES.enabled,
            STATES.disabled,
            STATES.exclaim,
            /*STATES.book_open,
            STATES.book_closed,*/
            STATES.enabled];

for(var i=0;i<raw.length-1;i++){
   transitions[raw[i]]=raw[i+1];
}

var maintable = table({className:'puztab'});
puz.append(maintable);


for(var ro=0; ro<8;ro++){

    var row=tr({className:'row'});

    for( var co = 0 ; co<8 ;co++){
        var id = ((ro*8)+co);
        var edit =  input({type:'text',id:"e"+id,className:'edit'});
        var btn = button({className:'button',id:"b"+id},STATES.enabled);
           
        row.appendChild((td(span({id:'i'+id,className:'info'}),edit,btn)));
       
             
        btn.onclick=(x)=>{
            var btn=x.currentTarget;
            var edit=btn.previousSibling;
            set_state(edit, btn, transitions[btn.innerHTML])
        }

        maintable.append(row);
    }
}

//hide column 8
iterate((id,edit,button)=>{  
    if (id%8==7){
        set_state(edit, button,STATES.disabled);
        edit.style.visibility='hidden';
        button.style.visibility='hidden';
    }
});

var flip = button("Flip Books");
var solve = button("Solve it");
var level = input();
var save=button('Save')
var load=button('Load')
var reset=button('Reset');
level.style.width='100px';

puz.append(div(' '),
    div(solve, span(' Level '),level,span(' '),load,span(' '),save,span(' ',reset)),
    div(' ')
);

solve.onclick=()=>{
    var obj={};

    iterate((i,e,but)=>{
        var ex=but.innerHTML=="!"?"!":"";

        if(!e.disabled&& e){
            obj[i]=e.value+ex;
        }
   });

   var result=document.getElementById('result');

    clear_results();

    result.innerHTML=("<p>Querying the oracle...</p>");

    $.ajax({
        url: "result",
        type: "POST",
        data: JSON.stringify(obj),
        contentType: "application/json",
        complete: (res)=>{
            $('#result').html('');
            
            var r = res.responseJSON;
            r=r.sort((x,y)=>y.length-x.length);

            var cols = Math.max(Math.floor(r.length/7),1)
            var row=tr();
            var columns=table(row);
             for(var i=0;i<cols;i++){
                var d=td();
                row.appendChild(d);

                var arr=[];
                while(r.length >0 && arr.length<7){
                    arr.push(r.shift())
                }
                
                var html='<table>';

                arr.map(res=>`<tr  class="result"><td>${res.replace(/~/g,'qu')}</td><td>${res.length}</td></tr>\r\n`).forEach(element => {
                    html+=element;
                });
                html+='</table>'

                d.innerHTML+=html;

            }

            result.appendChild(columns);

            var timeout;
            var hilight_happened=false;
            var cancelled=false;
            var pending=false;

            result.onclick=(x)=>{
                if(x.target.tagName!='TD')
                return;

                var word=x.target.parentElement.firstElementChild.innerHTML;

                el('selection').style.visibility='visible';
                el('tword').value=word;
            }

            result.onmouseover=(x)=>{
                console.log('mouse over')
                if(x.target.tagName!='TD')
                    return;

                var word=x.target.parentElement.firstElementChild.innerHTML;

                timeout= setTimeout(()=>{

                    if(hilight_happened){
                        return;
                    }
                    
                    if(pending){
                        return;
                    }

                    pending=true;

                    console.log('making call');

                    $.ajax({
                        url: "hilight",
                        type: "POST",
                        data: JSON.stringify({word:word,data:obj}),
                        contentType: "application/json",
                        complete: (result)=>{

                            var h=result.responseJSON;

                            var locations=[];

                            iterate((id,edit,button)=>{
                                if(h[id]){
                                    locations[parseInt(h[id].substr(1))-1]=id;
                                    edit.old=edit.style.backgroundColor;
                                    edit.style.backgroundColor='chartreuse';
                                    el('i'+id).innerHTML=h[id].substr(1);
                                }
                            });

                            if(locations.length>4){
                                var val=Math.min(2,locations.length-5);
                                var last=locations.pop();
                                var second=locations.pop();

                                var diff=Math.abs(last-second);
                                var hichar='';

                                switch(diff){
                                    case 1: //east West
                                        hichar=[3,2,0][val];
                                        break;
                                    case 8:
                                        hichar=[4,2,0][val];
                                        break;
                                    default:
                                        if(last>second){
                                            if(last%8<second%8)
                                                hichar=[6,1,0][val];
                                             else
                                                 hichar=[5,1,0][val];
                                             
                                         }
                                         else{
                                            if(last%8<second%8)
                                                hichar=[5,1,0][val]
                                             else
                                                hichar=[6,1,0][val]
                                        }

                                    }

                                el('e'+last).style.backgroundImage=`url(${hichar}.png)`;
                                el('e'+last).style.backgroundColor='#f300ff';
                            }

                            pending=false;
                            hilight_happened=true;
                        }
                 
                    })
                    }, 250);
            };

            result.onmouseout=(x)=>{
                if(timeout){
                    clearTimeout(timeout);
                    timeout=null;
                }
                if(hilight_happened){
                
                console.log('mouseout')

                iterate((id,edit,button)=>{
                     edit.style.backgroundColor=null;
                     edit.style.fontSize=null;
                     edit.style.backgroundImage=null;
                     el('i'+id).innerHTML=''; 
                });
                hilight_happened=false;
                }
            }
           }
        }
    );
    
}

puz.keyup((x)=>{
    var ele=x.originalEvent.srcElement;

    if(ele.id[0]!='e'){
        return;
    }

    if(x.which==16){//shift
        return;
    }

    function isdisabled(id){
        return document.getElementById('e'+id).disabled==true
    }
    function focus(id){
        return document.getElementById('e'+id).focus();
    }

    
    ele.value=ele.value.slice(-1).toUpperCase();

    var id=parseInt(ele.id.substr(1));
    var next=id+1;
   
    
    switch(x.which){
        //case 37: //right defualty behavior
        //break;
        case 38: //up
            while(true){
                id -=8;
                if( id<0){
                    return;
                }
                if (!isdisabled(id))
                    return focus(id)
            }


        break;
        case 37://left
    
        while(true){
            id -=1;

            if( id<0){
                id=63;
            }
            if (!isdisabled(id))
                return focus(id)
        }
        case 40: //down
            while(true){
                id +=8;

                if (id > 64){
                    return;
                }
                if (!isdisabled(id))
                    return focus(id)
            }

    }   
    
    
    var next=id+1;
    if (next==64){
        next=0;
    }

    while(document.getElementById('e'+next).disabled==true){
        next++;
        if (next==64){
            next=0;
        }
    }

    document.getElementById('e'+next).focus();
    $('#result').html('');


});

$(function () {
    var focusedElement;
    $(document).on('focus', 'input', function () {
        if (focusedElement == this) return; //already focused, return so user can now place cursor at specific point in input.
        focusedElement = this;
        setTimeout(function () { focusedElement.select(); }, 50); //select all text in any field on focus for easy re-entry. Delay sightly to allow focus to "stick" before selecting.
    });
});


flip.onclick=()=>{

    iterate((i,e,b)=>{
      
        switch(b.innerHTML){
            case 'bo':
                set_state(e,b,'bc')
               break;
            case 'bc':
                set_state(e,b,'bo')
                break;
        }

    })
}

save.onclick=()=>{
    var obj={};

    iterate((i,edit,butt)=>{
        var ex = butt.innerHTML;
        
        if(ex!=' '){
            obj[i]=ex;
        }
    });

     $.ajax({
        url: "save",
        type: "POST",
        data: JSON.stringify({level:level.value,layout:obj}),
        contentType: "application/json",
        complete: (result)=>{
           alert("Saved")
            }
        }
    );
}

function saveword(verb){

    $.ajax({
        url: verb,
        type: "POST",
        data: JSON.stringify({word:el('tword').value}),
        contentType: "application/json",
        complete: (result)=>{
           alert("Saved")
            }
        }
    );

}


function el(x){
    return document.getElementById(x)
}

el('bworks').onclick=()=>{
 saveword('works');
}

el('bdidnt').onclick=()=>{
  saveword('didnt');
}


function clear_results(){
    el('result').innerHTML='';
    el('selection').style.visibility='hidden';
}

reset.onclick=()=>{
    iterate((id,edit,btn)=>{
        edit.value='';
        set_state(edit, btn, id%8==7?STATES.disabled:STATES.enabled);
    });
    clear_results();

}

function edit_butt(id){
    var b = document.getElementById('b'+id);
    var e = document.getElementById('e'+id);
    return [e,b];
}

function iterate(to){
    for(var i=0;i<64;i++){
        var [e,b]=edit_butt(i);
        to(i,e,b);
    }
}

function set_state(edit,btn,state){
    
    if(parseInt(edit.id.substr(1))%8==7){
        state=STATES.disabled;
    }
    
    btn.innerHTML=state
    
    const states = {
        [STATES.enabled]:false,
        [STATES.disabled]:true,
        [STATES.exclaim]:false,
        [STATES.book_open]:false,
        [STATES.book_closed]:true
    }

    edit.disabled=states[state];
    edit.style.backgroundColor='#51555';
    edit.style.visibility=edit.disabled?'hidden':'visible';

}

load.onclick=()=>{
    
    $.ajax({
        url: "load",
        type: "POST",
        data: JSON.stringify({level:level.value}),
        contentType: "application/json",
        complete: (result)=>{
            var lay=result.responseJSON;

            if(lay==null){
                alert('no one has created this level yet, perhaps you could lay it out and save it for everyone to use');
                return;
            }

            iterate((id,edit,butt)=>{
                edit.value='';
                set_state(edit,butt,lay[id]||STATES.enabled)
              });

        }
        
    });

}