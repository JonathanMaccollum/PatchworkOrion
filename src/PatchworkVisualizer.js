function PatchworkVisualizer(
    options
){
    var viewer=options.viewer;
    var isDebug=options.isDebug;
    var sources=options.sources;
    this.getSource=function(author,name){
        var result= sources.findIndex(e=> e.author === author && e.name === name);
        if(result===-1){
            throw ('Unable to locate source with author '+author+' and name '+name);
        }
        else{
            return result;
        }
    }
    function refreshAt(index,replace=false){
        var src=sources[index];
        viewer.addTiledImage({
                tileSource:src.author+'.'+src.name+'.xml',
                index:index,
                replace:replace,
                x:src.x,
                y:src.y,
                width:src.width,
                degrees:src.rotation,
                opacity: src.opacity
            })
    }
    this.startImageLoad=function(onCompletion){
        var delay = 250;
        if(isDebug){
            delay=0;
        }
        var last = sources.length-1;
        sources.forEach(
            (src,i)=>{
                setTimeout(()=>{
                    refreshAt(i, false);
                    if(i===last && onCompletion != null){onCompletion();}
                },i*delay);            
        });
    };
    function update(i, x, y, w, r, o) {
        sources[i].x=x;
        sources[i].y=y;
        sources[i].width=w;
        sources[i].rotation=r;
        sources[i].opacity=o;
        refreshAt(i, true)
    }

    var uiElements = {
        viewer:document.getElementById(viewer.id),
        form:document.getElementById('form'),
        tileSelector:document.getElementById('tiles'),
        x:document.getElementById('x'),
        y:document.getElementById('y'),
        scale:document.getElementById('scale'),
        rotation:document.getElementById('rotation'),
        opacity:document.getElementById('opacity'),
        update:document.getElementById('update'),
        hide:document.getElementById('hide'),
        dim:document.getElementById('dim'),
        show:document.getElementById('show'),
        capturedValues:document.getElementById('capturedValues'),
        editor:document.getElementById('editor'),
    }
    if(isDebug) {
        uiElements.editor.style.display = "block";
    }else{
        uiElements.editor.style.display = "none";
    }
    sources.forEach(function(src,i){
        var option = document.createElement("option");
        option.text=src.name + ' - '+src.author;
        option.value=i;
        uiElements.tileSelector.add(option,i);
    });
    var onTileChanged=function(index){
        var selectedItem=sources[index];
        uiElements.x.value=selectedItem.x;
        uiElements.y.value=selectedItem.y;
        uiElements.scale.value=selectedItem.width;
        uiElements.rotation.value=selectedItem.rotation;
        uiElements.opacity.value=selectedItem.opacity;
    }
    uiElements.tileSelector.onchange = function(){
        onTileChanged(this.value);
    };
    var applyUpdateFromUser=function(){
        update(
            uiElements.tileSelector.value,
            Number(uiElements.x.value),
            Number(uiElements.y.value),
            Number(uiElements.scale.value),
            Number(uiElements.rotation.value),
            Number(uiElements.opacity.value)
            );
        uiElements.capturedValues.value=
            uiElements.x.value+', '+
            uiElements.y.value+', '+
            uiElements.scale.value+', '+
            uiElements.rotation.value+', '+
            uiElements.opacity.value
    }
    uiElements.update.onclick=applyUpdateFromUser;
    uiElements.dim.onclick=function(){
        uiElements.opacity.value=0.5;
        applyUpdateFromUser();
    }
    uiElements.show.onclick=function(){
        uiElements.opacity.value=1;
        applyUpdateFromUser();
    }
    uiElements.hide.onclick=function(){
        uiElements.opacity.value=0;
        applyUpdateFromUser();
    }
    onTileChanged(0);

    this.swapTargets=function(targets){
        if(isDebug){
            return;
        }
        var indexes=targets.map(source=>this.getSource(source.author,source.name));
        if(indexes.length<2){
            return;
        }
        var first=sources[indexes[0]];
        var lastIndex=indexes[indexes.length-1]
        for(var i=0;i<indexes.length-1;i++){
            sources[indexes[i]]=sources[indexes[i+1]];
        }
        sources[lastIndex]=first;
        for(var i=0;i<indexes.length;i++){
            refreshAt(indexes[i],true)
        }
    }
    this.onKeyUp=function(key,x){
        uiElements.viewer.addEventListener('keyup',(event)=>{
            const keyName = event.key;
            if(keyName===key){
                x();
            }
        });
    }
    function onKeyDown(key,x){
        uiElements.viewer.addEventListener('keydown',(event)=>{
            const keyName = event.key;
            if(keyName===key){
                x();
            }
        });
    }
    if(!isDebug){
        
        function toggleRGBMode(){
            var index=1;
            var selectedItem=sources[index];
            if(selectedItem.opacity===0.75)
                selectedItem.opacity=0;
            else
                selectedItem.opacity=0.75;
            refreshAt(index,true);
            onTileChanged(index);
        }
        var toggleRGB=new OpenSeadragon.Button({
            tooltip: 'Toggle RGB Mode',
            srcRest: 'icons/rgb_button_rest.png',
            srcGroup: 'icons/rgb_button_grouphover.png',
            srcHover: 'icons/rgb_button_hover.png',
            srcDown: 'icons/rgb_button_pressed.png'
        });
        viewer.buttons.buttons.push(toggleRGB);
        viewer.buttons.element.appendChild(toggleRGB.element);
        toggleRGB.element.addEventListener('click',toggleRGBMode);
    }

    onKeyUp("q",()=>{
            var index=sources.length-1;
            var selectedItem=sources[index];
            if(selectedItem.opacity===1)
                selectedItem.opacity=0;
            else
                selectedItem.opacity=1;
            refreshAt(index,true);
            onTileChanged(index);
        });
    // document
    //     .getElementById('toggleAnnotations')
    //     .addEventListener('click',(event)=>{
    //         var index=sources.length-1;
    //         var selectedItem=sources[index];
    //         if(selectedItem.opacity===1)
    //             selectedItem.opacity=0;
    //         else
    //             selectedItem.opacity=1;
    //         refreshAt(index,true);
    //         onTileChanged(index);
    //         });

    if(isDebug){
        var transposeMultiplier=0.00005;
        var scaleMultiplier =0.00005;
        var rotationMultiplier=0.1;
        onKeyDown("shift",()=>{
            transposeMultiplier=0.0005;
            scaleMultiplier=0.0005;
            rotationMultiplier=1;
        });
        onKeyUp("shift",()=>{
            transposeMultiplier=0.00005;
            scaleMultiplier=0.00005;
            rotationMultiplier=0.1;
        });
        onKeyUp("h",()=>{
            var selectedItem=sources[uiElements.tileSelector.value];
            selectedItem.x=selectedItem.x-1*transposeMultiplier;
            refreshAt(uiElements.tileSelector.value,true);
            onTileChanged(uiElements.tileSelector.value);
        })
        onKeyUp("k",()=>{
            var selectedItem=sources[uiElements.tileSelector.value];
            selectedItem.x=selectedItem.x+transposeMultiplier;
            refreshAt(uiElements.tileSelector.value,true);
            onTileChanged(uiElements.tileSelector.value);
        })
        onKeyUp("u",()=>{
            var selectedItem=sources[uiElements.tileSelector.value];
            selectedItem.y=selectedItem.y-1*transposeMultiplier;
            refreshAt(uiElements.tileSelector.value,true);
            onTileChanged(uiElements.tileSelector.value);
        })
        onKeyUp("j",()=>{
            var selectedItem=sources[uiElements.tileSelector.value];
            selectedItem.y=selectedItem.y+transposeMultiplier;
            refreshAt(uiElements.tileSelector.value,true);
            onTileChanged(uiElements.tileSelector.value);
        })
        onKeyUp("y",()=>{
            var selectedItem=sources[uiElements.tileSelector.value];
            selectedItem.rotation=selectedItem.rotation-1*rotationMultiplier;
            refreshAt(uiElements.tileSelector.value,true);
            onTileChanged(uiElements.tileSelector.value);
        })
        onKeyUp("i",()=>{
            var selectedItem=sources[uiElements.tileSelector.value];
            selectedItem.rotation=selectedItem.rotation+rotationMultiplier;
            refreshAt(uiElements.tileSelector.value,true);
            onTileChanged(uiElements.tileSelector.value);
        })
        onKeyUp("o",()=>{
            var selectedItem=sources[uiElements.tileSelector.value];
            selectedItem.width=selectedItem.width+scaleMultiplier;
            refreshAt(uiElements.tileSelector.value,true);
            onTileChanged(uiElements.tileSelector.value);
        })
        onKeyUp("l",()=>{
            var selectedItem=sources[uiElements.tileSelector.value];
            selectedItem.width=selectedItem.width-1*scaleMultiplier;
            refreshAt(uiElements.tileSelector.value,true);
            onTileChanged(uiElements.tileSelector.value);
        })
        onKeyUp("z",()=>{
            var selectedItem=sources[uiElements.tileSelector.value];
            selectedItem.opacity=0.1;
            refreshAt(uiElements.tileSelector.value,true);
            onTileChanged(uiElements.tileSelector.value);
        })
        onKeyUp("x",()=>{
            var selectedItem=sources[uiElements.tileSelector.value];
            selectedItem.opacity=0.5;
            refreshAt(uiElements.tileSelector.value,true);
            onTileChanged(uiElements.tileSelector.value);
        })
        onKeyUp("c",()=>{
            var selectedItem=sources[uiElements.tileSelector.value];
            selectedItem.opacity=1;
            refreshAt(uiElements.tileSelector.value,true);
            onTileChanged(uiElements.tileSelector.value);
        })
    }

    return this;
}