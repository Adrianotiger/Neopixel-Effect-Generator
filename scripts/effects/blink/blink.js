/* global Form, Effects */

class EffectBlink extends Effect
{  
  constructor()
  {
    super();
    this.name = "Blink";
    this.length = 0;
    this.timeBegin = 20;
    this.timeToOn = 1;
    this.timeOn = 1;
    this.timeToOff = 5;
    this.timeOver = 0;
  }
  
  static get Author() {return "Adriano Petrucci";}
  static get Version() {return "1.0";}
  
  Init(leds)
  {
    this.colors.push(new Pixel(0,0,0));
    this.colors.push(new Pixel(255,255,255));
    
    this.delay = 2;
    
    this.timeBegin = 100;
    this.timeToOn = 2;
    this.timeOn = 2;
    this.timeToOff = 20;
    this.timeOver = 100;
    
    this.UpdateSteps();
    this.length = leds;
        
    this.animationSettings.push(Form.CreateSliderInput("Delay before blink (ms):", this.timeBegin, 100, 1, -1000, function(val){
      this.timeBegin = val;
      this.UpdateSteps();
    }.bind(this)));
    this.animationSettings.push(Form.CreateSliderInput("Delay for max intensity (ms):", this.timeToOn, 2, 1, -100, function(val){
      this.timeToOn = val;
      this.UpdateSteps();
    }.bind(this)));
    this.animationSettings.push(Form.CreateSliderInput("Delay for On (ms):", this.timeOn, 2, 1, -100, function(val){
      this.timeOn = val;
      this.UpdateSteps();
    }.bind(this)));
    this.animationSettings.push(Form.CreateSliderInput("Delay for min intensity (ms):", this.timeToOff, 20, 1, -100, function(val){
      this.timeToOff = val;
      this.UpdateSteps();
    }.bind(this)));
    this.animationSettings.push(Form.CreateSliderInput("Delay after blink (ms):", this.timeOver, 100, 1, -1000, function(val){
      this.timeOver = val;
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
    this.steps = (this.timeBegin + this.timeToOn + this.timeOn + this.timeToOff + this.timeOver) / this.delay;
  }

  GetColor(led)
  {
    var pix = new Pixel(0,0,0);
    var elapsed = (this.step % this.steps) * this.delay;
    if(elapsed < this.timeBegin)
    {
      pix.red = this.colors[0].red;
      pix.green = this.colors[0].green;
      pix.blue = this.colors[0].blue;
    }
    else if(elapsed < this.timeBegin + this.timeToOn)
    {
      elapsed -= this.timeBegin;
      pix.red = this.colors[1].red * (elapsed / this.timeToOn) + this.colors[0].red * (1.0 - elapsed / this.timeToOn);
      pix.green = this.colors[1].green * (elapsed / this.timeToOn) + this.colors[0].green * (1.0 - elapsed / this.timeToOn);
      pix.blue = this.colors[1].blue * (elapsed / this.timeToOn) + this.colors[0].blue * (1.0 - elapsed / this.timeToOn);
    }
    else if(elapsed < this.timeBegin + this.timeToOn + this.timeOn)
    {
      pix.red = this.colors[1].red;
      pix.green = this.colors[1].green;
      pix.blue = this.colors[1].blue;
    }
    else if(elapsed < this.timeBegin + this.timeToOn + this.timeOn + this.timeToOff)
    {
      elapsed = elapsed - this.timeBegin - this.timeToOn - this.timeOn;
      pix.red = this.colors[0].red * (elapsed / this.timeToOff) + this.colors[1].red * (1.0 - elapsed / this.timeToOff);
      pix.green = this.colors[0].green * (elapsed / this.timeToOff) + this.colors[1].green * (1.0 - elapsed / this.timeToOff);
      pix.blue = this.colors[0].blue * (elapsed / this.timeToOff) + this.colors[1].blue * (1.0 - elapsed / this.timeToOff);
    }
    else //if(elapsed < this.timeBegin + this.timeToOn + this.timeOn + this.timeToOff + this.timeOver)
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
    code += "  if(" + s + ".effStep < " + (this.timeBegin / this.delay) + ") {\n";
    code += "    for(uint16_t j=0;j<" + leds + ";j++) \n";
    code += "      " + s + ".strip.setPixelColor(j, ";
      code += this.colors[0].red + ", ";
      code += this.colors[0].green + ", ";
      code += this.colors[0].blue + ");\n";
    code += "  }\n";
    code += "  else if(" + s + ".effStep  < " + ((this.timeBegin + this.timeToOn) / this.delay) + ") {\n";
    code += "    e = (" + s + ".effStep * " + this.delay + ") - " + this.timeBegin + ";\n";
    code += "    r = " + this.colors[1].red + " * ( e / " + this.timeToOn + " ) + " + this.colors[0].red + " * ( 1.0 - e / " + this.timeToOn + " );\n";
    code += "    g = " + this.colors[1].green + " * ( e / " + this.timeToOn + " ) + " + this.colors[0].green + " * ( 1.0 - e / " + this.timeToOn + " );\n";
    code += "    b = " + this.colors[1].blue + " * ( e / " + this.timeToOn + " ) + " + this.colors[0].blue + " * ( 1.0 - e / " + this.timeToOn + " );\n";
    code += "    for(uint16_t j=0;j<" + leds + ";j++) \n";
    code += "      " + s + ".strip.setPixelColor(j, r, g, b);\n";
    code += "  }\n";
    code += "  else if(" + s + ".effStep < " + ((this.timeBegin + this.timeToOn + this.timeOn) / this.delay) + ") {\n";
    code += "    for(uint16_t j=0;j<" + leds + ";j++) \n";
    code += "      " + s + ".strip.setPixelColor(j, ";
      code += this.colors[1].red + ", ";
      code += this.colors[1].green + ", ";
      code += this.colors[1].blue + ");\n";
    code += "  }\n";
    code += "  else if(" + s + ".effStep < " + ((this.timeBegin + this.timeToOn + this.timeOn + this.timeToOff) / this.delay) + ") {\n";
    code += "    e = (" + s + ".effStep * " + this.delay + ") - " + (this.timeBegin + this.timeToOn + this.timeOn) + ";\n";
    code += "    r = " + this.colors[0].red + " * ( e / " + this.timeToOff + " ) + " + this.colors[1].red + " * ( 1.0 - e / " + this.timeToOff + " );\n";
    code += "    g = " + this.colors[0].green + " * ( e / " + this.timeToOff + " ) + " + this.colors[1].green + " * ( 1.0 - e / " + this.timeToOff + " );\n";
    code += "    b = " + this.colors[0].blue + " * ( e / " + this.timeToOff + " ) + " + this.colors[1].blue + " * ( 1.0 - e / " + this.timeToOff + " );\n";
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