/* global Form, ledstrips */
/*
 * LedStrips, LedStrip and Pixel classes
 * LedStrips is a global class to manage the led strips.
 * LedStrip is a class for the single led strips for the Arduino
 * Pixel is a helper class to set the color of each led inside the strip
 * 
 * Author: Adriano
 * Date: march 2018
 */

var LedStrips = new class
{
  constructor()
  {
    this.ledstrips = [];
    this.strips = 0;
    this.selected = null;
    this.currentUsed = 0;
    this.maxCurrent = 0;
    this.ram = 0;
    this.flash = 0;
    this.pinBF = [];
  }
  
  Count()
  {
    return this.strips;
  }
  
  GetStrips()
  {
    return this.ledstrips;
  }
  
  GetStrip(index)
  {
    return this.ledstrips[index];
  }
  
  AddLedStrip()
  {

    if (this.pinBF.length > 0) {
      var ledStrip = new LedStrip(this.pinBF[0], 60);
      this.pinBF.shift();
    }else{
      var ledStrip = new LedStrip(8 + this.Count(), 60);
    }
    
    this.ledstrips.push(ledStrip);
    this.strips++;
    this.SelectStrip(ledStrip);
    return ledStrip;
  }
  
  SelectStrip(ledStrip)
  {
    var ledeffectsdiv = document.getElementById('ledeffectsdiv');
    for(var s=0;s<this.Count();s++)
    {
      this.ledstrips[s].div.id = 'ledstrip';      
    }
    
    if(this.selected !== ledStrip)
    {
      this.selected = ledStrip;
    }

    while(ledeffectsdiv.childNodes.length > 0)
    {
      ledeffectsdiv.removeChild(ledeffectsdiv.firstChild);
    }
    ledeffectsdiv.appendChild(ledStrip.loop.div);  
  }
  
  Loop()
  {
    this.currentUsed = 0;
    this.ram = 56; // base variables
    for(var s=0;s<this.Count();s++)
    {
      this.ledstrips[s].Loop();
      this.currentUsed += this.ledstrips[s].current;
      this.ram += this.ledstrips[s].ram;
    }
    if(this.currentUsed > this.maxCurrent) this.maxCurrent = this.currentUsed;
    document.getElementById('info_current').innerHTML = (parseInt(this.currentUsed / 10) / 100) + "A (max: " + (parseInt(this.maxCurrent / 100) / 10) + "A)";
    document.getElementById('info_ram').innerHTML = parseInt(this.ram) + " bytes";
  }
  
  Remove(ledStrip)
  {
    var ledstripsdiv = document.getElementById('ledstripsdiv');
    for(var s=0;s<this.Count();s++)
    {
      if(this.ledstrips[s] === ledStrip)
      {
        
        ledstripsdiv.removeChild(this.ledstrips[s].div);
        
        this.ledstrips.splice(s, 1);
        this.strips--;
        break;
      }
    }
    this.pinBF.push(ledStrip.pin);
  }
};

class LedStrip
{
  constructor(pin, leds)
  {
    this.pin = pin;
    this.loop = new Loop(this);
    this.leds = [];
    this.current = 0;
    this.ram = 0;
    this.flash = 0;
    this.frequence = 800;
    this.colortype = "NEO_GRB";
    this.div = document.createElement("div");
    this.div.className = "ledstrip";
    this.div.title = 'Double click to open settings';

    this.div.setAttribute('onclick', 'change(this)');

    this.calculateLeds = function (div) {
      if (window.innerWidth < 400) {
        var dimension = (leds<27) ? 8 : 400 / leds;
        div.style.width = dimension+"vw";
        div.style.height = dimension+"vw";
      }else if (window.innerWidth > 401 && window.innerWidth < 700) {
        var dimension = (leds<27) ? 5 : 200 / leds;
        div.style.width = dimension+"vw";
        div.style.height = dimension+"vw";
      }else {
        var dimension = (leds<27) ? 3 : 76 / leds;
        div.style.width = dimension+"vw";
        div.style.height = dimension+"vw";
      }
    }

    for(var j=0;j<leds;j++)
    {
      this.leds.push(new Pixel(0,0,0));
      var pixel = document.createElement("div");
      pixel.className = "pixelled";
      this.calculateLeds(pixel);
      this.div.appendChild(pixel);
    }
    
    this.div.addEventListener("click", function(){
      this.ShowOptions(this.pin);
    }.bind(this));

    LedStrips.SelectStrip(this);

  }

  ShowOptions(pin)
  {
    
    if(LedStrips.selected !== this)
    {
      LedStrips.SelectStrip(this);
      return;
    }

    var inputs = [];

    inputs.push(Form.CreateNumberInput("Leds quantity:", this.leds.length, 1, 500, function(val){
      var leds = this.leds.length;
      while(val < leds)
      {
        this.leds.splice(leds-1,1);
        this.div.removeChild(this.div.childNodes[this.div.childNodes.length-1]);
        leds = this.leds.length;
      }
      while(val > leds)
      {
        this.leds.push(new Pixel(0,0,0));
        var pixel = document.createElement("div");
        pixel.className = "pixelled";
        this.div.appendChild(pixel);
        leds = this.leds.length;
      }
      for(var j=0;j<leds;j++)
      {
        this.calculateLeds(this.div.childNodes[j]);
      }
    }.bind(this)));

    inputs.push(Form.CreateNumberInput("Arduino Pin:", this.pin, 1, 30, function(val){
      var found = 0;
      for(var k=0;k<LedStrips.Count();k++)
      {
        if(LedStrips.GetStrip(k).pin === parseInt(val)) found++;
      }
      if(found > 0)
      {
        alert("Pin " + val + " is already used.");
      }
      else
      {
        this.pin = parseInt(val);
      }
    }.bind(this)));
    
    inputs.push(Form.CreateSelectionInput("Strip frequence (kHz):", this.frequence, [400,800], function(val){
      this.frequence = val;
    }.bind(this)));
    
    inputs.push(Form.CreateSelectionInput("Strip type (default 'Neo NEO_GRB'):", this.colortype, ["NEO_RGB","NEO_RBG","NEO_GRB","NEO_GBR","NEO_BRG","NEO_BGR","NEO_WRGB","NEO_WRBG","NEO_WGRB","NEO_WGBR","NEO_WBRG","NEO_WBGR"], function(val){
      this.colortype = val;
    }.bind(this)));

    inputs.push(Form.CreateCloseButton("Remove Strip", function(){
      LedStrips.Remove(this);
    }.bind(this)));

    Form.GetInputs(inputs, pin);
  }
  
  GetDiv()
  {
    return this.div;
  }

  SetPin(pin){
    this.pin = pin;
  }

  Show()
  {
    var r,g,b,a,r1,g1,b1,norm;
    this.current = 0;
    this.ram = this.leds.length * 3;
    for(var j=0;j<this.leds.length;j++)
    {
      r = this.leds[j].red;
      g = this.leds[j].green;
      b = this.leds[j].blue;
      norm = r+g+b+1;
      this.current += (norm / 15);
      a = Math.min(1.0, norm / 350.0);

      r1 = r * a;
      g1 = g * a;
      b1 = b * a;
      this.div.childNodes[j].style.backgroundImage = "radial-gradient(rgba("+r1+","+g1+","+b1+",1.0), rgba("+r+","+g+","+b+","+(a*0.8)+"), rgba("+r+","+g+","+b+","+(a*0.1)+")), url(css/pixel.png)";
    }
  }
  
  GetArduinoLoops(stripid)
  {
    return this.loop.GetArduinoLoops(stripid, "loop0");
  }
  
  GetArduinoCode(stripid)
  {
    return this.loop.GetArduinoCode(stripid, "loop0");
  }
  
  Loop()
  {
    if(this.loop.NextStep())
    {
      this.Show();
    }
  }
};

class Pixel
{
  constructor(red, green, blue, white)
  {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.white = white ? white : 0;
  }

  SetColor(col1, col2, col3, col4)
  {
    this.red = col1;
    this.green = col2;
    this.blue = col3;
    this.white = col4 ? col4 : 0;
  }

  GetColor()
  {
    return "#" + this.red.toString(16) + this.green.toString(16) + this.blue.toString(16);
  }
};