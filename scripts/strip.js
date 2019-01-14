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
    var ledStrip = new LedStrip(8 + this.Count(), 60);
    this.ledstrips.push(ledStrip);
    this.strips++;
    this.SelectStrip(ledStrip);
    //ledStrip.ShowOptions();
    return ledStrip;
  }
  
  SelectStrip(ledStrip)
  {
    for(var s=0;s<this.Count();s++)
    {
      this.ledstrips[s].div.style.borderColor = "#000000";
    }
    ledStrip.div.style.borderColor = "#303060";
    
    if(this.selected === ledStrip)
    {
      
    }
    else
    {
      this.selected = ledStrip;
    }
    
    while(document.getElementById("ledeffectsdiv").childNodes.length > 2)
    {
      document.getElementById("ledeffectsdiv").removeChild(
              document.getElementById("ledeffectsdiv").childNodes[document.getElementById("ledeffectsdiv").childNodes.length - 1]
              );
    }
    document.getElementById("ledeffectsdiv").appendChild(
              ledStrip.loop.div
              );    
  }
  
  Loop()
  {
    this.currentUsed = 0;
    for(var s=0;s<this.Count();s++)
    {
      this.ledstrips[s].Loop();
      this.currentUsed += this.ledstrips[s].current;
    }
    if(this.currentUsed > this.maxCurrent) this.maxCurrent = this.currentUsed;
    document.getElementById('info_current').innerHTML = (parseInt(this.currentUsed / 10) / 100) + "A (max:" + (parseInt(this.maxCurrent / 100) / 10) + "A)";
  }
  
  Remove(ledStrip)
  {
    while(document.getElementById("ledeffectsdiv").childNodes.length > 4)
    {
      document.getElementById("ledeffectsdiv").removeChild(
              document.getElementById("ledeffectsdiv").childNodes[document.getElementById("ledeffectsdiv").childNodes.length - 1]
              );
    }
    
    for(var s=0;s<this.Count();s++)
    {
      if(this.ledstrips[s] === ledStrip)
      {
        document.getElementById("ledstripsdiv").removeChild(this.ledstrips[s].div);
        this.ledstrips.splice(s, 1);
        this.strips--;
        break;
      }
    }
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
    this.div = document.createElement("div");
    this.div.className = "ledstrip";
    for(var j=0;j<leds;j++)
    {
      this.leds.push(new Pixel(0,0,0));

      var dimension = 98 / leds;
      if(leds < 30) dimension = 3;
      var pixel = document.createElement("div");
      pixel.className = "pixelled";
      pixel.setAttribute("style", "width:"+dimension+"vw;height:"+dimension+"vw;");
      this.div.appendChild(pixel);
    }
    this.div.addEventListener("click", function(){
      this.ShowOptions();
    }.bind(this));
  }
  
  ShowOptions()
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
        pixel.setAttribute("style", "width:1vw;height:1vw;");
        this.div.appendChild(pixel);
        leds = this.leds.length;
      }
      for(var j=0;j<leds;j++)
      {
        var dimension = 98 / leds;
        if(leds < 30) dimension = 3;
        this.div.childNodes[j].style.width = dimension+"vw";
        this.div.childNodes[j].style.height = dimension+"vw";
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

    inputs.push(Form.CreateCloseButton("Remove Strip", function(){
      LedStrips.Remove(this);
    }.bind(this)));
    Form.GetInputs("Strip settings", inputs);
  }
  
  GetDiv()
  {
    return this.div;
  }
  
  Show()
  {
    var r,g,b,a,r1,g1,b1,norm;
    this.current = 0;
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
  constructor(red, green, blue)
  {
    this.red = red;
    this.green = green;
    this.blue = blue;
  }

  SetColor(col1, col2, col3)
  {
    this.red = col1;
    this.green = col2;
    this.blue = col3;
  }

  GetColor()
  {
    return "#" + this.red.toString(16) + this.green.toString(16) + this.blue.toString(16);
  }
};