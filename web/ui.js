var puz = $('#puzzle');

const STATES={
    enabled:' ',
    disabled:'  ',
    exclaim:'!',
    book_open:'bo',
    book_closed:'bc'
}

for(var ro=0; ro<8;ro++){
    var r = div({className:'row'});

    for( var co = 0 ; co<8 ;co++){
        var id = ((ro*8)+co);
        var edit =  input({type:'text',id:"e"+id});
        edit.style.width="30px";
        edit.style.height="30px";
        
        var btn = button({className:'btn btn-primary mb-2',id:"b"+id},STATES.enabled);
        btn.style.width="30px";
        btn.style.height="30px"; 
          
        r.appendChild(
            div({className:'col-sm-1 m-0 p-0'},
                div({className:'input-group'},
                    edit,
                    btn
                )
            )
         );


         var transitions={};
         
         var raw =[STATES.enabled,
                     STATES.disabled,
                     STATES.exclaim,
                     STATES.book_open,
                     STATES.book_closed,
                     STATES.enabled];
    
        for(var i=0;i<raw.length-1;i++){
            transitions[raw[i]]=raw[i+1];
        }
        
        btn.onclick=(x)=>{
            var btn=x.currentTarget;
            var edit=btn.previousSibling;
            set_state(edit, btn, transitions[btn.innerHTML])
        }

        puz.append(r);
  
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
var reset=button('Reset')

puz.append(div({className:'row'},
    div({className:'col-sm-12'},solve,span(' '),
    flip,span(' Level '),level,span(' '),load,span(' '),save,span(' ',reset))
));

solve.onclick=()=>{
    var obj={};

    iterate((i,e,but)=>{
        var ex=but.innerHTML=="!"?"!":"";

        if(!e.disabledv&& e){
            obj[i]=e.value+ex;
        }
   });

    $('#result').html("<p>Consulting the oracle...</p>");

    $.ajax({
        url: "result",
        type: "POST",
        data: JSON.stringify(obj),
        contentType: "application/json",
        complete: (result)=>{
            var r = result.responseJSON;
            r=r.sort((x,y)=>y.length-x.length);

            var html='<table class=".table"><tr><th>Word</th><th>Length</th></tr>';

            r.map(res=>`<tr><td>${res.replace(/~/,'qu')}</td><td>${res.length}</td></tr>\r\n`).forEach(element => {
                html+=element;
            });
            html+='</table>'

            $('#result').html(html);
 

           }
        }
    );
    
}

puz.keyup((x)=>{
    var ele=x.originalEvent.srcElement;

    if(ele.id[0]!='e'){
        return;
    }

    function isdisabled(id){
        document.getElementById('e'+id).disabled==true
    }
    function focus(id){
        document.getElementById('e'+id).focus();
    }

    

    if(ele.value.length>1){
        ele.value=ele.value[0];
    }

    var id=parseInt(ele.id.substr(1));
    var next=id+1;
   
    
    switch(x.which){
        //case 37: //left defualty behavior
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
                return;
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

reset.onclick=()=>{
    iterate((id,edit,btn)=>{
        edit.value='';
        set_state(edit, btn, id%8==7?STATES.disabled:STATES.enabled);
    });
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
    edit.style.backgroundColor=edit.disabled?'grey':'white';

}

load.onclick=()=>{
    
    $.ajax({
        url: "load",
        type: "POST",
        data: JSON.stringify({level:level.value}),
        contentType: "application/json",
        complete: (result)=>{
            var lay=result.responseJSON;

            iterate((id,edit,butt)=>{
                edit.value='';
                set_state(edit,butt,lay[id]||STATES.enabled)
              });

        }
        
    });

}