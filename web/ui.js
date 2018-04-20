var puz = $('#puzzle');

for(var ro=0; ro<8;ro++){
    var r = div({className:'row'});

    for( var co = 0 ; co<8 ;co++){
        var id = ((ro*8)+co);
        var edit =  input({type:'text',id:"e"+id});
        edit.style.width="30px";
        edit.style.height="30px";
        
        var btn = button({className:'btn btn-primary mb-2',id:"b"+id},'  ');
        btn.style.width="30px";
        btn.style.height="30px";
        btn.innerHTML=' ';
        
        if(co==7){
            edit.disabled=true;
            edit.style.visibility='hidden';
            btn.style.visibility='hidden';
        }
       
        r.appendChild(
            div({className:'col-sm-1 m-0 p-0'},
                div({className:'input-group'},
                    edit,
                    btn
                )
            )
         );


         var states={
             ' ':['  ',true],
             '  ':['!',false],
             '!':['bo',false],
             'bo':['bc',true],
             'bc':[' ',false]
         };


        btn.onclick=(x)=>{
            var btn=x.currentTarget;
            var edit=btn.previousSibling;

            var s=states[btn.innerHTML];
            btn.innerHTML=s[0];
            edit.disabled=s[1];
            edit.style.backgroundColor=s[1]?'grey':'white';
        
        }

        puz.append(r);
  
}

}
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

    for(var i=0;i<64;i++){
        var e=document.getElementById("e"+i).value;
        var ex=document.getElementById("b"+i).innerHTML=="!"?"!":"";
        if(e){
            obj[i]=e+ex;
        }
    }

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

            r.map(res=>`<tr><td>${res}</td><td>${res.length}</td></tr>\r\n`).forEach(element => {
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

/*
for(var i=0;i<64;i++){
    document.getElementById('e'+i).onfocus=(x)=>{
        x.currentTarget.select();
        }
}
*/
$(function () {
    var focusedElement;
    $(document).on('focus', 'input', function () {
        if (focusedElement == this) return; //already focused, return so user can now place cursor at specific point in input.
        focusedElement = this;
        setTimeout(function () { focusedElement.select(); }, 50); //select all text in any field on focus for easy re-entry. Delay sightly to allow focus to "stick" before selecting.
    });
});


flip.onclick=()=>{
    for(var i=0;i<64;i++){
        
        var b = document.getElementById('b'+i);
        var e = document.getElementById('e'+i);

        switch(b.innerHTML){
            case 'bo':
                b.innerHTML='bc';
                e.disabled=true;
                e.style.backgroundColor='grey';
                break;
            case 'bc':
                b.innerHTML='bo';
                e.disabled=false;
                e.style.backgroundColor='white';
                break;
        }

    }
}
