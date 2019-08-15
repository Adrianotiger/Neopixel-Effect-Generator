/* global Form, Effects */

// Version 1.1
// - updated for Generator 2.0
// 
// Every effect extends the Effect class.
// This will give some base functionality
class EffectBlink extends Effect
{  
  constructor()
  {
    super();
    this.name = "Blink";
    this.options['length'] = 0;
    this.options['timeBegin'] = 20;
    this.options['timeToOn'] = 1;
    this.options['timeOn'] = 1;
    this.options['timeToOff'] = 5;
    this.options['timeOver'] = 0;
    this.options['every'] = 1;
  }
  
  static get Author() {return "Adriano Petrucci";}
  static get Version() {return "1.1";}
  
  Init(leds)
  {
    this.colors.push(new Pixel(0,0,0));
    this.colors.push(new Pixel(255,255,255));
    
    this.delay = 5;
    
    this.options['timeBegin'] = 50;
    this.options['timeToOn'] = 10;
    this.options['timeOn'] = 10;
    this.options['timeToOff'] = 10;
    this.options['timeOver'] = 100;
    this.options['every'] = 1;
    
    this.UpdateSteps();
    this.options['length'] = leds;
        
    this.animationSettings.push(
      {type:'slider', title:'Delay before blink (ms):', options:[1, 100, -1000], value:()=>{return this.options['timeBegin'];}, update:(val)=>{
          this.options['timeBegin'] = val;
          this.UpdateSteps();
        }
      }
    );
    this.animationSettings.push(
      {type:'slider', title:'Delay for max intensity (ms):', options:[1, 2, -100], value:()=>{return this.options['timeToOn'];}, update:(val)=>{
          this.options['timeToOn'] = val;
          this.UpdateSteps();
        }
      }
    );
    this.animationSettings.push(
      {type:'slider', title:'Delay for On (ms):', options:[1, 2, -100], value:()=>{return this.options['timeOn'];}, update:(val)=>{
          this.options['timeOn'] = val;
          this.UpdateSteps();
        }
      }
    );
    this.animationSettings.push(
      {type:'slider', title:'Delay for min intensity (ms):', options:[1, 20, -100], value:()=>{return this.options['timeToOff'];}, update:(val)=>{
          this.options['timeToOff'] = val;
          this.UpdateSteps();
        }
      }
    );
    this.animationSettings.push(
      {type:'slider', title:'Delay after blink (ms):', options:[1, 100, -1000], value:()=>{return this.options['timeOver'];}, update:(val)=>{
          this.options['timeOver'] = val;
          this.UpdateSteps();
        }
      }
    );
    this.animationSettings.push(
      {type:'slider', title:'Blink every (ms):', options:[1, 1, leds / 2], value:()=>{return this.options['every'];}, update:(val)=>{
          this.options['every'] = val;
          this.UpdateSteps();
        }
      }
    );
    this.animationSettings.push(
      {type:'slider', title:'Delay (time between steps):', options:[1, 2, 100], value:()=>{return this.delay;}, update:(val)=>{
          this.delay = val;
          this.UpdateSteps();
        }
      }
    );
    this.colorSettings.push(
      {
        type:'color', title:'Base Color:', color:()=>{return new Pixel(this.colors[0].red, this.colors[0].green, this.colors[0].blue, this.colors[0].white);}, update:this.CreateFunc(0, this)
      }
    );
    this.colorSettings.push(
      {
        type:'color', title:'Blink Color:', color:()=>{return new Pixel(this.colors[1].red, this.colors[1].green, this.colors[1].blue, this.colors[1].white);}, update:this.CreateFunc(1, this)
      }
    );
    super.Init(leds);
  }

  CreateFunc(index, obj)
  {
    return function(pix){
      if(pix !== null)
      {
        obj.colors[index].red = pix.red;
        obj.colors[index].green = pix.green;
        obj.colors[index].blue = pix.blue;
      }
    };
  }
  
  NextStep(ledStrip)
  {
    var pix1;
    for(var l=0;l<ledStrip.leds.length;l++)
    {
      pix1 = this.GetColor(l);
      ledStrip.leds[l].SetColor(pix1.red, pix1.green, pix1.blue);
    }
    super.NextStep(ledStrip);
  }
  
  UpdateSteps()
  {
    this.steps = (this.options['timeBegin'] + this.options['timeToOn'] + this.options['timeOn'] + this.options['timeToOff'] + this.options['timeOver']) / this.delay;
  }

  GetColor(led)
  {
    var pix = new Pixel(0,0,0);
    var elapsed = (this.step % this.steps) * this.delay;
    if(elapsed < this.options['timeBegin'] || (led % this.options['every']) !== 0)
    {
      pix.red = this.colors[0].red;
      pix.green = this.colors[0].green;
      pix.blue = this.colors[0].blue;
    }
    else if(elapsed < this.options['timeBegin'] + this.options['timeToOn'])
    {
      elapsed -= this.options['timeBegin'];
      pix.red = this.colors[1].red * (elapsed / this.options['timeToOn']) + this.colors[0].red * (1.0 - elapsed / this.options['timeToOn']);
      pix.green = this.colors[1].green * (elapsed / this.options['timeToOn']) + this.colors[0].green * (1.0 - elapsed / this.options['timeToOn']);
      pix.blue = this.colors[1].blue * (elapsed / this.options['timeToOn']) + this.colors[0].blue * (1.0 - elapsed / this.options['timeToOn']);
    }
    else if(elapsed < this.options['timeBegin'] + this.options['timeToOn'] + this.options['timeOn'])
    {
      pix.red = this.colors[1].red;
      pix.green = this.colors[1].green;
      pix.blue = this.colors[1].blue;
    }
    else if(elapsed < this.options['timeBegin'] + this.options['timeToOn'] + this.options['timeOn'] + this.options['timeToOff'])
    {
      elapsed = elapsed - this.options['timeBegin'] - this.options['timeToOn'] - this.options['timeOn'];
      pix.red = this.colors[0].red * (elapsed / this.options['timeToOff']) + this.colors[1].red * (1.0 - elapsed / this.options['timeToOff']);
      pix.green = this.colors[0].green * (elapsed / this.options['timeToOff']) + this.colors[1].green * (1.0 - elapsed / this.options['timeToOff']);
      pix.blue = this.colors[0].blue * (elapsed / this.options['timeToOff']) + this.colors[1].blue * (1.0 - elapsed / this.options['timeToOff']);
    }
    else //if(elapsed < this.options['timeBegin'] + this.options['timeToOn'] + this.options['timeOn'] + this.options['timeToOff'] + this.options['timeOver'])
    {
      pix.red = this.colors[0].red;
      pix.green = this.colors[0].green;
      pix.blue = this.colors[0].blue;
    }
    return pix;
  }
  
  GetArduinoCode(stripid, effectname, leds)
  {
    var s = "strip_" + stripid;
    var code = super.GetArduinoCode(stripid, effectname, leds);
    
    code += "  if(millis() - " + s + ".effStart < " + this.delay + " * (" + s + ".effStep)) return 0x00;\n";
    code += "  uint8_t e,r,g,b;\n";
    code += "  if(" + s + ".effStep < " + (this.options['timeBegin'] / this.delay) + ") {\n";
    code += "    for(uint16_t j=0;j<" + leds + ";j++) \n";
    code += "      " + s + ".strip.setPixelColor(j, ";
      code += this.colors[0].red + ", ";
      code += this.colors[0].green + ", ";
      code += this.colors[0].blue + ");\n";
    code += "  }\n";
    code += "  else if(" + s + ".effStep  < " + ((this.options['timeBegin'] + this.options['timeToOn']) / this.delay) + ") {\n";
    code += "    e = (" + s + ".effStep * " + this.delay + ") - " + this.options['timeBegin'] + ";\n";
    code += "    r = " + this.colors[1].red + " * ( e / " + this.options['timeToOn'] + " ) + " + this.colors[0].red + " * ( 1.0 - e / " + this.options['timeToOn'] + " );\n";
    code += "    g = " + this.colors[1].green + " * ( e / " + this.options['timeToOn'] + " ) + " + this.colors[0].green + " * ( 1.0 - e / " + this.options['timeToOn'] + " );\n";
    code += "    b = " + this.colors[1].blue + " * ( e / " + this.options['timeToOn'] + " ) + " + this.colors[0].blue + " * ( 1.0 - e / " + this.options['timeToOn'] + " );\n";
    code += "    for(uint16_t j=0;j<" + leds + ";j++) \n";
    code += "      if((j%" + this.options['every'] + ")==0) " + s + ".strip.setPixelColor(j, r, g, b);\n";
    code += "      else " + s + ".strip.setPixelColor(j, " + this.colors[0].red + ", " + this.colors[0].green + ", " + this.colors[0].blue + ");\n";
    code += "  }\n";
    code += "  else if(" + s + ".effStep < " + ((this.options['timeBegin'] + this.options['timeToOn'] + this.options['timeOn']) / this.delay) + ") {\n";
    code += "    for(uint16_t j=0;j<" + leds + ";j++) \n";
    code += "      if((j%" + this.options['every'] + ")==0) " + s + ".strip.setPixelColor(j, ";
      code += this.colors[1].red + ", ";
      code += this.colors[1].green + ", ";
      code += this.colors[1].blue + ");\n";
      code += "      else " + s + ".strip.setPixelColor(j, " + this.colors[0].red + ", " + this.colors[0].green + ", " + this.colors[0].blue + ");\n";
    code += "  }\n";
    code += "  else if(" + s + ".effStep < " + ((this.options['timeBegin'] + this.options['timeToOn'] + this.options['timeOn'] + this.options['timeToOff']) / this.delay) + ") {\n";
    code += "    e = (" + s + ".effStep * " + this.delay + ") - " + (this.options['timeBegin'] + this.options['timeToOn'] + this.options['timeOn']) + ";\n";
    code += "    r = " + this.colors[0].red + " * ( e / " + this.options['timeToOff'] + " ) + " + this.colors[1].red + " * ( 1.0 - e / " + this.options['timeToOff'] + " );\n";
    code += "    g = " + this.colors[0].green + " * ( e / " + this.options['timeToOff'] + " ) + " + this.colors[1].green + " * ( 1.0 - e / " + this.options['timeToOff'] + " );\n";
    code += "    b = " + this.colors[0].blue + " * ( e / " + this.options['timeToOff'] + " ) + " + this.colors[1].blue + " * ( 1.0 - e / " + this.options['timeToOff'] + " );\n";
    code += "    for(uint16_t j=0;j<" + leds + ";j++) \n";
    code += "      if((j%" + this.options['every'] + ")==0) " + s + ".strip.setPixelColor(j, r, g, b);\n";
    code += "      else " + s + ".strip.setPixelColor(j, " + this.colors[0].red + ", " + this.colors[0].green + ", " + this.colors[0].blue + ");\n";
    code += "  }\n";
    code += "  else {\n";
    code += "    for(uint16_t j=0;j<" + leds + ";j++) \n";
    code += "      " + s + ".strip.setPixelColor(j, ";
      code += this.colors[0].red + ", ";
      code += this.colors[0].green + ", ";
      code += this.colors[0].blue + ");\n";
    code += "  }\n";
    code += "  if(" + s + ".effStep >= " + (this.steps) + ") {" + s + ".Reset(); return 0x03; }\n";
    code += "  else " + s + ".effStep++;\n";
    code += "  return 0x01;\n";
    code += "}\n\n";
    return code;
  }
};