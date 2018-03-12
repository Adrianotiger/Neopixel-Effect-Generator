/* global Form, Effects */

class EffectRainbow extends Effect
{  
  constructor()
  {
    super();
    this.name = "Rainbow";
    this.toLeft = true;
  }
  
  static get Author() {return "Adriano Petrucci";}
  static get Version() {return "1.0";}
    
  Init(leds)
  {
    this.colors.push(new Pixel(255,0,0));
    this.colors.push(new Pixel(0,255,0));
    this.colors.push(new Pixel(0,0,255));
    
    this.delay = 20;
    this.length = leds;
    this.steps = leds;
    
    this.animationSettings.push(Form.CreateSwitchInput("Direction:", "left", "right", this.toLeft?"left":"right", function(val){
      if(val==="left") this.toLeft = true;
      else this.toLeft = false;
    }.bind(this)));
    this.animationSettings.push(Form.CreateSliderInput("Steps (more steps = more fluid, but slower):", this.steps, leds, 1, -leds * 5, function(val){
      this.steps = val;
    }.bind(this)));
    this.animationSettings.push(Form.CreateSliderInput("Length (led qty=entire rainbow):", this.length, leds, 1, -leds * 5, function(val){
      this.length = val;
    }.bind(this)));
    this.animationSettings.push(Form.CreateSliderInput("Delay (time between steps):", this.delay, 5, 1, -100, function(val){
      this.delay = val;
    }.bind(this)));
    
    for(var k=0;k<this.colors.length;k++)
    {
      this.colorSettings.push(Form.CreateColorInput("Color " + (k+1) + " :", this.colors[k].red, this.colors[k].green, this.colors[k].blue, this.CreateFunc2(k, this)));
    }
    this.colorSettings.push(Form.CreateCloseButton("Add Color", function(){
      var k = this.colors.length;
      this.colors.push(new Pixel(255,0,0));
      this.colorSettings.splice(-1, 0, Form.CreateColorInput("Color " + (k+1) + " :", this.colors[k].red, this.colors[k].green, this.colors[k].blue, this.CreateFunc2(k, this)));
      this.OpenColorSettings();
    }.bind(this)));
    
    super.Init(leds);
  }

  CreateFunc(color, index, obj)
  {
    switch(color)
    {
      case 'red': return function(e){obj.colors[index].red = e.detail.val;};
      case 'green': return function(e){obj.colors[index].green = e.detail.val;};
      case 'blue': return function(e){obj.colors[index].blue = e.detail.val;};
    }
  }
  
  CreateFunc2(index, obj)
  {
    return function(pix) {
      if(!pix)
      {
        obj.colorSettings.splice(index, 1);
        obj.colors.splice(index, 1);
      }
      else
      {
        obj.colors[index].red = pix.red;
        obj.colors[index].green = pix.green;
        obj.colors[index].blue = pix.blue;
      }
    };
  }
  
  NextStep(ledStrip)
  {
    for(var l=0;l<ledStrip.leds.length;l++)
    {
      var pix1 = this.GetColor(l);
      ledStrip.leds[l].SetColor(pix1.red, pix1.green, pix1.blue);
    }
    super.NextStep(ledStrip);
  }
  
  GetColor(led)
  {
    var colors = this.colors.length;
    var sectors = colors;
    var pix = new Pixel(0,0,0);
    var substeps = this.steps / colors;
    var pos;
    if(this.toLeft)
      pos = this.step + led * this.steps / this.length;
    else
      pos = this.steps - (this.step - led * this.steps / this.length) % this.steps;

    for(var j=0;j<colors;j++)
    {
      for(var k=0;k<sectors;k++)
      {
        if(j === k)
        {
          if(parseInt((pos % this.steps) / substeps) === k)
          {
            var factor = 1.0 - ((pos % this.steps - k * substeps) / substeps);
            pix.red += parseInt(this.colors[j].red * factor);
            pix.green += parseInt(this.colors[j].green * factor);
            pix.blue += parseInt(this.colors[j].blue * factor);
          }
          else if(parseInt((pos % this.steps) / substeps) === ((k + sectors - 1) % sectors))
          {
            var factor = (((pos - ((k + sectors - 1) % sectors) * substeps) % this.steps) / substeps);
            pix.red += parseInt(this.colors[j].red * factor);
            pix.green += parseInt(this.colors[j].green * factor);
            pix.blue += parseInt(this.colors[j].blue * factor);
          }
        }
      }
    }
    return pix;
  }
  
  GetArduinoCode(stripid, effectname, leds)
  {
    var s = "strip_" + stripid;
    var code = super.GetArduinoCode(stripid, effectname, leds);
    
    code += "  if(millis() - " + s + ".effStart < " + this.delay + " * (" + s + ".effStep)) return 0x00;\n";
    code += "  float factor1, factor2;\n";
    code += "  uint16_t ind;\n";// = " + (this.toLeft ? s + ".step + "this.step + led * this.steps / this.length : );
    code += "  for(uint16_t j=0;j<" + leds + ";j++) {\n";
    code += "    ind = " + (this.toLeft ? s + ".effStep + j * " + (this.steps / this.length) : this.steps + " - (" + s + ".effStep - j * " + (this.steps / this.length) + ") % " + this.steps) + ";\n";
    code += "    switch((ind % " + this.steps + ") / " + (this.steps / this.colors.length) + ") {\n";
    for(var k=0;k<this.colors.length;k++)
    {
      code += "      case " + k + ": factor1 = 1.0 - ((float)(ind % " + this.steps + " - " + k + " * " + (this.steps / this.colors.length) + ") / " + (this.steps / this.colors.length) +");\n";
      code += "              factor2 = (float)((ind - " + (k * (this.steps / this.colors.length)) + ") % " + this.steps + ") / " + (this.steps / this.colors.length) + ";\n";
      code += "              " + s + ".strip.setPixelColor(j, ";
        code += this.colors[k].red + " * factor1 + " + this.colors[(k+1)%this.colors.length].red + " * factor2, ";
        code += this.colors[k].green + " * factor1 + " + this.colors[(k+1)%this.colors.length].green + " * factor2, ";
        code += this.colors[k].blue + " * factor1 + " + this.colors[(k+1)%this.colors.length].blue + " * factor2);\n";
      code += "              break;\n";
    }
    code += "    }\n";
    code += "  }\n";
    code += "  if(" + s + ".effStep >= " + (this.steps) + ") {" + s + ".Reset(); return 0x03; }\n";
    code += "  else " + s + ".effStep++;\n";
    code += "  return 0x01;\n";
    code += "}\n\n";
    return code;
  }
};
