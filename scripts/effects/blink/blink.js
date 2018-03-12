/* global Form, Effects */

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
  }
  
  static get Author() {return "Adriano Petrucci";}
  static get Version() {return "1.0";}
  
  Init(leds)
  {
    this.colors.push(new Pixel(0,0,0));
    this.colors.push(new Pixel(255,255,255));
    
    this.delay = 2;
    
    this.options['timeBegin'] = 100;
    this.options['timeToOn'] = 2;
    this.options['timeOn'] = 2;
    this.options['timeToOff'] = 20;
    this.options['timeOver'] = 100;
    
    this.UpdateSteps();
    this.options['length'] = leds;
        
    this.animationSettings.push(Form.CreateSliderInput("Delay before blink (ms):", this.options['timeBegin'], 100, 1, -1000, function(val){
      this.options['timeBegin'] = val;
      this.UpdateSteps();
    }.bind(this)));
    this.animationSettings.push(Form.CreateSliderInput("Delay for max intensity (ms):", this.options['timeToOn'], 2, 1, -100, function(val){
      this.options['timeToOn'] = val;
      this.UpdateSteps();
    }.bind(this)));
    this.animationSettings.push(Form.CreateSliderInput("Delay for On (ms):", this.options['timeOn'], 2, 1, -100, function(val){
      this.options['timeOn'] = val;
      this.UpdateSteps();
    }.bind(this)));
    this.animationSettings.push(Form.CreateSliderInput("Delay for min intensity (ms):", this.options['timeToOff'], 20, 1, -100, function(val){
      this.options['timeToOff'] = val;
      this.UpdateSteps();
    }.bind(this)));
    this.animationSettings.push(Form.CreateSliderInput("Delay after blink (ms):", this.options['timeOver'], 100, 1, -1000, function(val){
      this.options['timeOver'] = val;
      this.UpdateSteps();
    }.bind(this)));
    this.animationSettings.push(Form.CreateSliderInput("Delay (time between steps):", this.delay, 2, 1, 100, function(val){
      this.delay = val;
      this.UpdateSteps();
    }.bind(this)));

    this.colorSettings.push(Form.CreateColorInput("Base Color :", this.colors[0].red, this.colors[0].green, this.colors[0].blue, this.CreateFunc(0, this)));
    this.colorSettings.push(Form.CreateColorInput("Blink Color :", this.colors[1].red, this.colors[1].green, this.colors[1].blue, this.CreateFunc(1, this)));

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
    var pix1 = this.GetColor(0);
    for(var l=0;l<ledStrip.leds.length;l++)
    {
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
    if(elapsed < this.options['timeBegin'])
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
    code += "      " + s + ".strip.setPixelColor(j, r, g, b);\n";
    code += "  }\n";
    code += "  else if(" + s + ".effStep < " + ((this.options['timeBegin'] + this.options['timeToOn'] + this.options['timeOn']) / this.delay) + ") {\n";
    code += "    for(uint16_t j=0;j<" + leds + ";j++) \n";
    code += "      " + s + ".strip.setPixelColor(j, ";
      code += this.colors[1].red + ", ";
      code += this.colors[1].green + ", ";
      code += this.colors[1].blue + ");\n";
    code += "  }\n";
    code += "  else if(" + s + ".effStep < " + ((this.options['timeBegin'] + this.options['timeToOn'] + this.options['timeOn'] + this.options['timeToOff']) / this.delay) + ") {\n";
    code += "    e = (" + s + ".effStep * " + this.delay + ") - " + (this.options['timeBegin'] + this.options['timeToOn'] + this.options['timeOn']) + ";\n";
    code += "    r = " + this.colors[0].red + " * ( e / " + this.options['timeToOff'] + " ) + " + this.colors[1].red + " * ( 1.0 - e / " + this.options['timeToOff'] + " );\n";
    code += "    g = " + this.colors[0].green + " * ( e / " + this.options['timeToOff'] + " ) + " + this.colors[1].green + " * ( 1.0 - e / " + this.options['timeToOff'] + " );\n";
    code += "    b = " + this.colors[0].blue + " * ( e / " + this.options['timeToOff'] + " ) + " + this.colors[1].blue + " * ( 1.0 - e / " + this.options['timeToOff'] + " );\n";
    code += "    for(uint16_t j=0;j<" + leds + ";j++) \n";
    code += "      " + s + ".strip.setPixelColor(j, r, g, b);\n";
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