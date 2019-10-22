/* global LedStrip, Form */

/*
 * Effects and Effect classes
 * Effects is a global class to manage the effects.
 * Effect is the base class for generating the new effects
 * 
 * Author: Adriano
 * Date: march 2018
 */

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
      e.stopPropagation();
      document.body.removeChild(black);
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
      
      var effWebPage = document.createElement("a");
      effWebPage.setAttribute("href", "https://github.com/Adrianotiger/Neopixel-Effect-Generator/tree/master/scripts/effects/" + this.effectsPath[effectid]);
      effWebPage.setAttribute("target", "_blank");
      effWebPage.setAttribute("style", "color:darkblue;");
      effWebPage.appendChild(document.createTextNode("Open description on GitHub"));
      window.appendChild(effWebPage);
          
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
    this.options = [];
    
    this.div = document.createElement("div");
    this.div.className = "effectdiv";
    
    this.table = document.createElement("div");
  }
  
  static get Author() {return "Adriano Petrucci";}
  static get Version() {return "0.0";}
  
  Init(leds) 
  {
    var btn = document.createElement("div");

    this.effectActive = btn;

    btn.className = "btn-effect";
    btn.appendChild(document.createTextNode(this.name));
    this.div.appendChild(btn);

    btn = document.createElement("div");
    btn.className = "btn-effect-item";
    btn.appendChild(document.createTextNode("Animation"));
    btn.addEventListener("click", function(){
      this.OpenAnimationSettings();
    }.bind(this));
    this.div.appendChild(btn);

    btn = document.createElement("div");
    btn.className = "btn-effect-item";
    if(this.colorSettings.length > 0)
    {
      btn.appendChild(document.createTextNode("Colors"));
      btn.addEventListener("click", function(){
        this.OpenColorSettings();
      }.bind(this));
    }
    this.div.appendChild(btn);

    document.getElementById("ledeffectsdiv").appendChild(this.div);
  }
  
  OpenAnimationSettings()
  {
    var inputs = [];
    for(var k in this.animationSettings)
    {
      var s = this.animationSettings[k];
      switch(s.type)
      {
        case 'switch': inputs.push(Form.CreateSwitchInput(s.title, s.options[0], s.options[1], s.value(), s.update));
                        break;
        case 'slider': inputs.push(Form.CreateSliderInput(s.title, s.value(), s.options[1], s.options[0], s.options[2], s.update));
                        break;
        case 'button': inputs.push(Form.CreateCloseButton(s.title, s.update));
                        break;
        default:          break;
      }
    }
    Form.GetInputsSetttings('Animation of '+this.name, inputs);
  }
  
  OpenColorSettings()
  {
    var inputs = [];
    for(var k in this.colorSettings)
    {
      var s = this.colorSettings[k];
      switch(s.type)
      {
        case 'color': inputs.push(Form.CreateColorInput(s.title, s.color().red, s.color().green, s.color().blue, s.update));
                        break;
        case 'button': inputs.push(Form.CreateColorButton(s.title, s.update));
                        break;
        default:        break;
      }
    }
    Form.GetInputsSetttings('Color of '+this.name, inputs);
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
    var sRet = "uint8_t strip" + stripid + "_" + effectname + "() {\n";
    sRet += "    // Strip ID: " + stripid + " - Effect: " + this.name + " - LEDS: " + leds + "\n";
    sRet += "    // Steps: " + this.steps + " - Delay: " + this.delay + "\n";
    sRet += "    // Colors: " + this.colors.length + " (";
    for(var j=0;j<this.colors.length;j++)
    {
      if(j>0) sRet += ", ";
      sRet += this.colors[j].red + "." + this.colors[j].green + "." + this.colors[j].blue;
    }
    sRet += ")\n";
    sRet += "    // Options: ";
    for(var o in this.options)
    {
      sRet += o + "=" + this.options[o] + ", ";
    }
    sRet += "\n";
    return  sRet;
  }
  
}