
var Form = new class
{
  constructor()
  { 
  }
  
  CreateSwitchInput(title, val1, val2, def, func)
  {

    var div = document.createElement("div");
    div.setAttribute("style", "min-width:150px;");

    var b = document.createElement("b");
    b.appendChild(document.createTextNode(title));
    div.appendChild(b);

    var tab = document.createElement("table");
    tab.className = 'switch';
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.appendChild(document.createTextNode(val1));
    td.className = 'switch-text';
    tr.appendChild(td);

    td = document.createElement("td");
    var oval = document.createElement("div");
    oval.className = 'switch-body';
    var slider = document.createElement("div");
    slider.className = 'switch-circle';
    slider.setAttribute("style", "left:"+(def===val1?0:26)+"px;");
    oval.appendChild(slider);
    td.appendChild(oval);
    tr.appendChild(td);

    td = document.createElement("td");
    td.appendChild(document.createTextNode(val2));
    td.className = 'switch-text';
    tr.appendChild(td);
    tab.appendChild(tr);

    div.appendChild(tab);

    div.addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      if(def === val1)
      {
        def = val2;
        slider.style.left = "26px";
      }
      else
      {
        def = val1;
        slider.style.left = "0px";
      }
      func(def);
    }.bind(this));

    return div;  
  }
  
  CreateNumberInput(title, value, min, max, func)
  {
    var div = document.createElement("div");
    div.className = 'number-input-div';
    var h3 = document.createElement("p");
    h3.className = 'setting-p';

    h3.appendChild(document.createTextNode(title));
    div.appendChild(h3);

    var inp = document.createElement("input");
    inp.className = 'setting-input';
    inp.setAttribute("type", "number");
    inp.setAttribute("min", min);
    inp.setAttribute("max", max);
    inp.setAttribute("value", value);
    div.appendChild(inp);
    inp.addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
    });
    inp.addEventListener("change", function(){
      if(inp.value > max) alert("Value must be less than " + max);
      else if(inp.value < min) alert("Value must be greater than " + min);
      else if(!parseInt(inp.value)) alert("Invalid number");
      else func(inp.value);
    });
    return div;
  }
  
  CreateSelectionInput(title, value, options, func)
  {
    var div = document.createElement("div");
    div.className = 'number-input-div';
    var h3 = document.createElement("p");
    h3.className = 'setting-p';

    h3.appendChild(document.createTextNode(title));

    div.appendChild(h3);
    var inp = document.createElement("select");
    inp.setAttribute("value", value);
    inp.className = 'setting-input';
    for(var o=0;o<options.length;o++)
    {
      var opt = document.createElement("option");
      opt.setAttribute("value", options[o]);
      opt.appendChild(document.createTextNode(options[o]));
      if(options[o].toString() === value.toString()) opt.setAttribute("selected", "true");
      inp.appendChild(opt);
    }
    div.appendChild(inp);
    inp.addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
    });
    inp.addEventListener("change", function(){
      func(inp.value);
    });
    return div;
  }
  
  CreateSliderInput(title, value, def, min, max, func)
  {
    var div = document.createElement("div");
    var inp = new Slider(min, max, value, def, title);
    div.appendChild(inp.div);
    inp.div.addEventListener("changed", function(e)
    {
      func(e.detail.val);
    }.bind(this));
    return div;
  }
  
  CreateColorInput(title, red, green, blue, func)
  {
    var div = document.createElement("div");
    div.className = 'open-settings-div';

    var divContainer = document.createElement('div');
    divContainer.className = 'color-input-div';

    var p = document.createElement("p");
    p.appendChild(document.createTextNode(title));
    divContainer.appendChild(p);

    var pixel = new Pixel(red, green, blue);
    var divColor = document.createElement("div");

    divColor.setAttribute("style", "background-color:rgba("+red+","+green+","+blue+",1.0);");
    divContainer.appendChild(divColor);

    var remove = document.createElement("b");

    remove.addEventListener("click", function(e){
      div.parentNode.removeChild(div);
      func(null);
    });
    remove.appendChild(document.createTextNode("X"));
    divContainer.appendChild(remove);
    div.appendChild(divContainer);

    var inpR = new Slider(0, 255, red, red, "Red");
    div.appendChild(inpR.div);
    inpR.div.addEventListener("changed", function(e)
    {
      pixel.red = e.detail.val;
      divColor.style.backgroundColor = "rgba("+pixel.red+","+pixel.green+","+pixel.blue+",1.0)";
      func(pixel);
    }.bind(this));
    var inpG = new Slider(0, 255, green, green, "Green");
    div.appendChild(inpG.div);
    inpG.div.addEventListener("changed", function(e)
    {
      pixel.green = e.detail.val;
      divColor.style.backgroundColor = "rgba("+pixel.red+","+pixel.green+","+pixel.blue+",1.0)";
      func(pixel);
    }.bind(this));
    var inpB = new Slider(0, 255, blue, blue, "Blue");
    div.appendChild(inpB.div);
    inpB.div.addEventListener("changed", function(e)
    {
      pixel.blue = e.detail.val;
      divColor.style.backgroundColor = "rgba("+pixel.red+","+pixel.green+","+pixel.blue+",1.0)";
      func(pixel);
    }.bind(this));
    return div;
  }
  
  CreateCloseButton(text, func)
  {
    var div = document.createElement("div");
    div.className = 'close-btn-div';

    var butt = document.createElement("input");
    butt.setAttribute("type", "button");
    butt.setAttribute("value", text);
    butt.className = 'remove-strip';
    butt.addEventListener("click", function(){
      func();
    });
    div.appendChild(butt);
    return div;
  }

  CreateColorButton(text, func)
  {
    var div = document.createElement("div");
    div.className = 'close-btn-div';

    var butt = document.createElement("input");
    butt.setAttribute("type", "button");
    butt.setAttribute("value", text);
    butt.className = 'color-add';
    butt.addEventListener("click", function(){
      func();
    });
    div.appendChild(butt);
    return div;
  }
  
  GetInputs(inputs, pin)
  {
    var stripDiv = document.getElementById('strip');
    while(stripDiv.childElementCount > 0){
      stripDiv.removeChild(stripDiv.lastElementChild);
    }    
  
    for(var k in inputs)
    {
      stripDiv.appendChild(inputs[k]);      
    }
    stripDiv.style.display = 'block';
    stripDiv.className = 'settings-div';
  }

  GetInputsSetttings(title, inputs) {

    var test = document.getElementById('test');
    while (test.childElementCount > 0) {
      test.removeChild(test.firstChild);
    }

    var tit = document.createElement('h3');
    tit.innerHTML = title;
    var footer = document.getElementsByClassName('footer')[0];
    footer.style.zIndex = '1';

    var close = document.createElement('div');
    close.className = 'close-btn';
    close.innerHTML = 'X';
    close.addEventListener('click', function() {
      footer.style.zIndex = '-1';
      test.style.display = 'none';
    })
    test.appendChild(close);
    test.appendChild(tit);

    if (inputs[0].childNodes[0].innerText == '') {
      var divContainer = document.createElement('div');
      for (let i = 0; i < inputs.length; i++) {
        divContainer.appendChild(inputs[i]);
      }
      test.appendChild(divContainer);
    } else {
      for (var k in inputs) {
        test.appendChild(inputs[k]);
      }
    }
    test.style.display = 'block';
  }
};