/* global Form, Effects */

// Version 1.3
// - updated for Generator 2.0
// Version 1.2
// - changed options name from length to rainbowlen, as length is a protected name
// Version 1.1
// - Compile errors, when rainbow had a different length than the led strip length

class EffectRainbow extends Effect
{  
  constructor()
  {
    super();
    this.name = "Rainbow";
    this.options['rainbowlen'] = 1;
    this.options['toLeft'] = true;
  }
  
  static get Author() {return "Adriano Petrucci";}
  static get Version() {return "1.3";}
    
  Init(leds)
  {
    this.colors.push(new Pixel(255,0,0));
    this.colors.push(new Pixel(0,255,0));
    this.colors.push(new Pixel(0,0,255));
    
    this.delay = 20;
    this.options['rainbowlen'] = leds;
    this.steps = leds;
    this.animationSettings.push(
      {type:'switch', title:'Direction:', options:['left','right'], value:()=>{return this.options['toLeft']?"left":"right";}, update:(val)=>{
          this.options['toLeft'] = (val === "left");
        }
      }
    );
    this.animationSettings.push(
      {type:'slider', title:'Steps (more steps = more fluid, but slower):', options:[1, leds, -leds*5], value:()=>{return this.steps;}, update:(val)=>{
         this.steps = val;
        }
      }
    );
    this.animationSettings.push(
      {type:'slider', title:'Length (led qty=entire rainbow):', options:[1, leds, -leds*5], value:()=>{return this.options['rainbowlen'];}, update:(val)=>{
         this.options['rainbowlen'] = val;
        }
      }
    );
    this.animationSettings.push(
      {type:'slider', title:'Delay (time between steps):', options:[1, 5, -100], value:()=>{return this.delay;}, update:(val)=>{
         this.delay = val;
        }
      }
    );
    for(let k=0;k<this.colors.length;k++)
    {
      this.colorSettings.push(
        {
          type:'color', title:'Color ' + (k+1) + ' :', color:()=>{return new Pixel(this.colors[k].red, this.colors[k].green, this.colors[k].blue, this.colors[k].white);}, update:this.CreateFunc2(k, this)
        }
      );
    }
    this.colorSettings.push(
      {
        type:'button', title:'Add Color', update:()=>{
          var k = this.colors.length;
          this.colors.push(new Pixel(255,0,0));
          this.colorSettings.splice(
                  -1, 
                  0, 
                  {
                    type:'color', title:'Color ' + (k+1) + ' :', color:()=>{return new Pixel(this.colors[k].red, this.colors[k].green, this.colors[k].blue, this.colors[k].white);}, update:this.CreateFunc2(k, this)
                  }
          );
          this.OpenColorSettings();
        }
      }
    );
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
    if(this.options['toLeft'])
      pos = this.step + led * this.steps / this.options['rainbowlen'];
    else
      pos = this.steps - (this.step - led * this.steps / this.options['rainbowlen']) % this.steps;

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
    code += "  uint16_t ind;\n";// = " + (this.options['toLeft'] ? s + ".step + "this.step + led * this.steps / this.options['rainbowlen'] : );
    code += "  for(uint16_t j=0;j<" + leds + ";j++) {\n";
    code += "    ind = " + (this.options['toLeft'] ? s + ".effStep + j * " + (this.steps / this.options['rainbowlen']) : this.steps + " - (" + s + ".effStep - j * " + (this.steps / this.options['rainbowlen']) + ") % " + this.steps) + ";\n";
    code += "    switch((int)((ind % " + this.steps + ") / " + (this.steps / this.colors.length) + ")) {\n";
    for(var k=0;k<this.colors.length;k++)
    {
      code += "      case " + k + ": factor1 = 1.0 - ((float)(ind % " + this.steps + " - " + k + " * " + (this.steps / this.colors.length) + ") / " + (this.steps / this.colors.length) +");\n";
      code += "              factor2 = (float)((int)(ind - " + (k * (this.steps / this.colors.length)) + ") % " + this.steps + ") / " + (this.steps / this.colors.length) + ";\n";
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
