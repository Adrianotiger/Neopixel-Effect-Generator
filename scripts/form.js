
var Form = new class
{
  constructor()
  { 
  }
  
  CreateSwitchInput(title, val1, val2, def, func)
  {
    var div = document.createElement("div");
    div.setAttribute("style", "height:40px;min-width:150px;");
    var b = document.createElement("b");
    b.appendChild(document.createTextNode(title));
    div.appendChild(b);
    div.appendChild(document.createElement("br"));
    var tab = document.createElement("table");
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.appendChild(document.createTextNode(val1));
    tr.appendChild(td);
    td = document.createElement("td");
    var oval = document.createElement("div");
    oval.setAttribute("style", "width:48px;height:16px;border-radius:18px;background-color:white;border-color:#8a8ad2;border-style:ridge;border-width:2px;display:inline-block;position:relative;");
    var slider = document.createElement("div");
    slider.setAttribute("style", "width:14px;height:14px;border-radius:16px;background-color:#8080ff;border-color:#8a8ad2;border-style:ridge;border-width:2px;display:inline-block;position:absolute;top:-1px;left:"+(def===val1?3:26)+"px;");
    oval.appendChild(slider);
    td.appendChild(oval);
    tr.appendChild(td);
    td = document.createElement("td");
    td.appendChild(document.createTextNode(val2));
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
        slider.style.left = "3px";
      }
      func(def);
    }.bind(this));
    return div;
  }
  
  CreateNumberInput(title, value, min, max, func)
  {
    var div = document.createElement("div");
    var h3 = document.createElement("h3");
    h3.setAttribute("style", "display:inline-block;margin:10px;");
    h3.appendChild(document.createTextNode(title));
    div.appendChild(h3);
    var inp = document.createElement("input");
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
    div.setAttribute("style", "min-height:120px;width:350px;");
    var h3 = document.createElement("h3");
    h3.setAttribute("style", "display:inline-block;margin:10px;");
    h3.appendChild(document.createTextNode(title));
    div.appendChild(h3);
    var pixel = new Pixel(red, green, blue);
    var divColor = document.createElement("div");
    divColor.setAttribute("style", "width:100px;height:10px;border-radius:5px;background-color:rgba("+red+","+green+","+blue+",1.0);");
    div.appendChild(divColor);
    var remove = document.createElement("b");
    remove.setAttribute("style", "display:inline-block;width:25px;height:16px;color:red;text-decoration:underline;cursor:pointer;");
    remove.addEventListener("click", function(e){
      div.parentNode.removeChild(div);
      func(null);
    });
    remove.appendChild(document.createTextNode("X"));
    div.appendChild(remove);
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
    div.setAttribute("style", "min-height:120px;width:350px;");
    var butt = document.createElement("input");
    butt.setAttribute("type", "button");
    butt.setAttribute("value", text);
    butt.addEventListener("click", function(){
      document.body.removeChild(div.parentNode.parentNode);
      func();
    });
    div.appendChild(butt);
    return div;
  }
  
  GetInputs(title, inputs)
  {
    var black = document.createElement("div");
    black.className = "formoverlayblack";
    black.addEventListener("click", function(){
      document.body.removeChild(black);
    }.bind(this));
    var window = document.createElement("div");
    window.addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
    }.bind(this));
    window.className = "formwindow";
    var h2 = document.createElement("h2");
    h2.appendChild(document.createTextNode(title));
    window.appendChild(h2);
    for(var k in inputs)
    {
      window.appendChild(inputs[k]);
    }
    black.appendChild(window);
    document.body.appendChild(black);
  }
};