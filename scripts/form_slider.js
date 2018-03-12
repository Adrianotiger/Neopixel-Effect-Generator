class Slider
{
  constructor(min, max, value, def, title)
  {
    this.div = document.createElement("div");
    this.min = min;
    this.max = max;
    this.maxAbs = Math.abs(max);
    this.default = def;
    this.val = value;
    this.div.className = "form_sliderdiv";
    this.hasMouse = false;

    var line = document.createElement("div");
    line.className = "form_sliderline";
    this.div.appendChild(line);

    this.slider = document.createElement("div");
    this.slider.addEventListener("mousedown", function(e){e.preventDefault();return false;});
    this.slider.setAttribute("style", "position:absolute;left:"+parseInt(300*(this.val-min)/this.maxAbs - 10)+"px;top:13px;height:20px;width:20px;border-radius:12px;background-color:white;border-style:ridge;border-width:2px;border-color:#aaaaff;");
    this.div.appendChild(this.slider);

    var defLine = document.createElement("div");
    defLine.setAttribute("style", "position:absolute;left:"+parseInt(300*(def-min)/this.maxAbs)+"px;top:20px;height:10px;width:4px;border-radius:2px;background-color:white;");
    this.div.appendChild(defLine);

    this.value = document.createElement("i");
    this.value.setAttribute("style", "min-width:10px;height:10px;position:absolute;right:0px;top:0px;font-size:12px;");
    this.value.appendChild(document.createTextNode(this.val));
    this.div.appendChild(this.value);
    
    this.event = new CustomEvent('changed', { detail: this });

    this.value.addEventListener("mousedown", function(e){e.stopPropagation();});
    this.value.addEventListener("click", function(e)
    {
      e.preventDefault();
      e.stopPropagation();
      
      var newVal = prompt("Set new value:", this.val);
      if(!newVal || parseInt(newVal) < 0) return;
      this.ChangeValue(newVal, true);
    }.bind(this));

    this.title = document.createElement("b");
    this.title.setAttribute("style", "min-width:10px;height:10px;position:absolute;left:0px;top:0px;font-size:12px;");
    this.title.appendChild(document.createTextNode(title));
    this.div.appendChild(this.title);

    this.div.addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      var rect = this.div.getBoundingClientRect();
      this.ChangeValue(e.clientX - rect.left);
    }.bind(this));
    this.div.addEventListener("mousedown", function(e){
      e.preventDefault();
      e.stopPropagation();
      this.hasMouse = true;
      var rect = this.div.getBoundingClientRect();
      this.ChangeValue(e.clientX - rect.left);
    }.bind(this));
    this.div.addEventListener("mouseup", function(e){
      e.preventDefault();
      e.stopPropagation();
      this.hasMouse = false;
    }.bind(this));
    this.div.addEventListener("mousemove", function(e){
      e.preventDefault();
      e.stopPropagation();
      if(e.buttons === 1 && this.hasMouse)
      {
        var rect = this.div.getBoundingClientRect();
        this.ChangeValue(e.clientX - rect.left);
      }
    }.bind(this));

    this.div.addEventListener("dblclick", function(e){
      this.val = this.default;
      var left = parseInt(300*(this.val-this.min)/this.maxAbs);
      this.slider.style.left = (left - 10) + "px";
      this.value.innerHTML = this.val;

      this.div.dispatchEvent(this.event);
    }.bind(this));
  }
  
  ChangeValue(val, realvalue)
  {
    if(realvalue)
      this.val = parseInt(val);
    else
      this.val = parseInt(this.maxAbs * val / 300);
    var left = parseInt(300*(this.val-this.min)/this.maxAbs);
    if(left < 10) 
    {
      left = 10;
      if(!realvalue)
        this.val = this.min;
    }
    else if(left > 290) 
    {
      left = 290;
      if(this.max > 0)
        this.val = this.maxAbs;
    }

    this.slider.style.left = (left - 10) + "px";
    this.value.innerHTML = this.val;

    this.div.dispatchEvent(this.event);
  }
}