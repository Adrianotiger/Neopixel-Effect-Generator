
/* global LedStrip, Form */

var Effects = new class
{
  constructor()
  {
    this.effects = [];
    this.effectsName = [];
    this.effectsPath = [];
    this.speedFactorTime = 0;
    this.speedFactorStart = 0;
    this.lastStep = 0;
    
    setTimeout(function(){this.LoadEffects();}.bind(this), 100);
  }
    
  LoadEffects()
  {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'scripts/effects/effects.json', true);
    xobj.onreadystatechange = function () {
      if (xobj.readyState === 4 && xobj.status === 200) {
        var json = JSON.parse(xobj.response);
        for(var k=0;k<json.length;k++)
        {
          this.LoadEffect(json[k].name, json[k].class, json[k].path);
        }
      }
    }.bind(this);
    xobj.send(null); 
  }
  
  LoadEffect(title, classname, path)
  {
    var script = document.createElement("script");
    script.onload = function(){
      this.effectsName.push(title);
      var className = eval(classname);
      this.effects.push(className);
      this.effectsPath.push(path.substr(0, path.lastIndexOf("/")));
      console.log("Loading " + classname + ", ver." + className.Version + " from " + className.Author);
    }.bind(this);
    script.setAttribute("src", "scripts/effects/" + path);
    document.head.appendChild(script);
  }
      
  NewEffect(id)
  {
    return new this.effects[id];
  }
  
  ChooseEffect(e, loop)
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
    window.className = "form_windowselect";
    for(var k in this.effects)
    {
      var eff = document.createElement("div");
      eff.appendChild(document.createTextNode(this.effectsName[k]));
      var f = function(id, loop){return function(){document.body.removeChild(black); loop.AddEffect(id);};};
      eff.addEventListener("click", f(k, loop));
      window.appendChild(eff);
    }
    black.appendChild(window);
    document.body.appendChild(black);
    
    var rect = window.getBoundingClientRect();
    window.style.top = (parseInt(e.clientY) - parseInt(rect.height) - 1) + "px";
    window.style.left = (parseInt(e.clientX) - rect.left / 2) + "px";
  }
  
  ShowInfo(e, effectid)
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
      var basePath = "https://github.com/Adrianotiger/Neopixel-Effect-Generator/tree/master/scripts/effects/";
      window.open(basePath + this.effectsPath[effectid]);
    }.bind(this));
    window.className = "form_windowselect";
    
      var effName = document.createElement("span");
      effName.appendChild(document.createTextNode(this.effectsName[effectid]));
      window.appendChild(effName);
      
      var effVersion = document.createElement("span");
      effVersion.appendChild(document.createTextNode("Version: " + this.effects[effectid].Version));
      window.appendChild(effVersion);
      
      var effAuthor = document.createElement("span");
      effAuthor.appendChild(document.createTextNode("Author: " + this.effects[effectid].Author));
      window.appendChild(effAuthor);
      
      var effWebPage = document.createElement("span");
      effWebPage.appendChild(document.createTextNode(this.effectsPath[effectid]));
      window.appendChild(effWebPage);
      
      console.log(this.effectsPath[effectid]);
          
    black.appendChild(window);
    document.body.appendChild(black);
    
    var rect = window.getBoundingClientRect();
    window.style.top = (parseInt(e.clientY) - parseInt(rect.height) - 1) + "px";
    window.style.left = (parseInt(e.clientX) - rect.left / 2) + "px";
  }
};

class Effect
{
  constructor()
  {
    this.colors = [];
    this.step = 0;
    this.steps = 0;
    this.delay = 20;
    this.name = "Unknown effect";
    
    this.animationSettings = [];
    this.colorSettings = [];
    
    this.div = document.createElement("div");
    this.div.className = "effectdiv";
    
    this.table = document.createElement("table");
    this.table.setAttribute("border", "2");
  }
  
  static get Author() {return "Adriano Petrucci";}
  static get Version() {return "0.0";}
  
  Init(leds) 
  {
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    this.effectActive = td;
    td.setAttribute("style", "color:white;min-width:80px;background-color:black;");
    td.appendChild(document.createTextNode(this.name));
    tr.appendChild(td);
    td = document.createElement("td");
    td.setAttribute("style", "color:yellow;text-decoration:underline;cursor:pointer;");
    td.appendChild(document.createTextNode("Animation"));
    td.addEventListener("click", function(){
      this.OpenAnimationSettings();
    }.bind(this));
    tr.appendChild(td);
    td = document.createElement("td");
    td.setAttribute("style", "color:yellow;text-decoration:underline;cursor:pointer;");
    td.appendChild(document.createTextNode("Colors"));
    td.addEventListener("click", function(){
      this.OpenColorSettings();
    }.bind(this));
    tr.appendChild(td);
    this.table.appendChild(tr);
    document.getElementById("ledeffectsdiv").appendChild(this.table);
  }
  
  OpenAnimationSettings()
  {
    Form.GetInputs("Effect Animation Settings", this.animationSettings);
  }
  
  OpenColorSettings()
  {
    Form.GetInputs("Color Settings", this.colorSettings);
  }
  
  InitEffect()
  {
    this.step = 0;
    this.effectActive.style.backgroundColor = "#303080";
  }
  
  EndEffect()
  {
    this.effectActive.style.backgroundColor = "#000000";
  }
  
  NextStep(ledStrip) 
  {
    this.step++;
  }
  UpdateSteps()  {}
  GetArduinoCode(stripid, effectname, leds) 
  {
    return "uint8_t strip" + stripid + "_" + effectname + "() {\n";
  }
  
}