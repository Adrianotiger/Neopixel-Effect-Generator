/* global Form, Effects */

// Version 1.1
// - Arduino code was wrong, it was never fading...
// 
// Every effect extends the Effect class.
// This will give some base functionality
class EffectFade extends Effect
{  
  constructor()
  {
      // Call Effect()
      // This will give this variables:
      // - this.colors = []; -> Array of colors used for this animation
      // - this.step = 0;    -> current step for animation (used only for the webpage)
      // - this.steps = 0;   -> total steps for this animation
      // - this.delay = 20;  -> delay until next step will be executed
      // - this.name = "??"; -> effect name, this must be declared in your costructor
      // - this.animationSettings -> array of settings to show if the user press "Animation"
      // - this.colorSettings     -> array of settings to show if the user press "Colors"
    super();
    this.name = "Fade";   // give a name to this effect
      // Option variables. Every option must be declared here
      // They are inside an array, so the values can be saved and loaded easly to/from a file
    this.options['duration'] = 100;   // duration of the entire animation
    this.options['every'] = 1;        // only every X leds will animate
  }
  
  static get Author() {return "Adriano Petrucci";}
  static get Version() {return "1.0";}
  
    // Init class, parameters: number of leds (if you need to know how many leds the strip has)
  Init(leds)
  {
    this.colors.push(new Pixel(0,0,0));       // Color 1 (begin color)
    this.colors.push(new Pixel(255,255,255)); // Color 2 (end color)
    
    this.delay = this.options['duration'] / 20;          // calculate the delay to have 20 steps
        
    this.UpdateSteps();                       // calculate the steps to show this animation
        
        // Fill the settings array. See Form to get a list of possible inputs
        // Slider input: 
        //   title to show, 
        //   current value, 
        //   default value if user double clicks the slider, 
        //   min value, 
        //   max value (negative to give the possibility to insert a bigger number manually)
        //   return function
    this.animationSettings.push(Form.CreateSliderInput("Duration (ms):", this.options['duration'], 1000, 100, -1000, function(val){
      if(val < this.delay) 
        alert("Duration must be greater than the delay");
      else
      {
        this.options['duration'] = val;
        this.UpdateSteps();
      }
    }.bind(this)));
    this.animationSettings.push(Form.CreateSliderInput("Delay between steps (ms):", this.delay, 10, 1, -100, function(val){
      if(val > this.options['duration']) 
        alert("Delay must be smaller than the duration");
      else
      {
        this.delay = val;
        this.UpdateSteps();
      }
    }.bind(this)));
    this.animationSettings.push(Form.CreateSliderInput("Every (led):", this.options['every'], 1, 1, leds, function(val){
      this.options['every'] = val;
      this.UpdateSteps();
    }.bind(this)));

      // fill colors array, only 2 for start and end color
    this.colorSettings.push(Form.CreateColorInput("Begin Color :", this.colors[0].red, this.colors[0].green, this.colors[0].blue, this.CreateFunc(0, this)));
    this.colorSettings.push(Form.CreateColorInput("End Color :", this.colors[1].red, this.colors[1].green, this.colors[1].blue, this.CreateFunc(1, this)));

    super.Init(leds);
  }

    // Color changed, update the animation with the new colors
  CreateFunc(index, obj)
  {
      // If pix is null, the user removed the color. Not each effect allows to remove colors
    return function(pix){
      if(pix !== null)
      {
        obj.colors[index].red = pix.red;
        obj.colors[index].green = pix.green;
        obj.colors[index].blue = pix.blue;
      }
    };
  }
  
    // Set strip colors for the next step
    // use this.step to get the current step
    // parameter: ledStrip to update
  NextStep(ledStrip)
  {
    for(var l=0;l<ledStrip.leds.length;l++)
    {
      if((l % this.options['every']) !== 0) continue;
      var pix1 = this.GetColor(l);
      ledStrip.leds[l].SetColor(pix1.red, pix1.green, pix1.blue);
    }
    super.NextStep(ledStrip);
  }
  
    // optional: use this function to update the total steps used for your animation
    // it is used to calculate the duration of the animation and to get the speed factor if your browser is not 
    // able to update so fast
  UpdateSteps()
  {
    this.steps = this.options['duration'] / this.delay;
  }

    // Get the led color of the single led inside the led strip
    // parameter: led id (0 to strip leds - 1)
  GetColor(led)
  {
    var pix = new Pixel(this.colors[0].red,this.colors[0].green,this.colors[0].blue);
    var elapsed = Math.min(this.step, this.steps) * this.delay / this.options['duration'];
    pix.red = this.colors[1].red * elapsed + this.colors[0].red * (1.0 - elapsed);
    pix.green = this.colors[1].green * elapsed + this.colors[0].green * (1.0 - elapsed);
    pix.blue = this.colors[1].blue * elapsed + this.colors[0].blue * (1.0 - elapsed);
    return pix;
  }
  
    // generate the arduino code
    // this can only be tested once you compile the code with the Arduino IDE
  GetArduinoCode(stripid, effectname, leds)
  {
    var s = "strip_" + stripid;
    var code = super.GetArduinoCode(stripid, effectname, leds);
    
    code += "  if(millis() - " + s + ".effStart < " + this.delay + " * (" + s + ".effStep)) return 0x00;\n";
    code += "  uint8_t r,g,b;\n";
    code += "  double e;\n";
    code += "  e = (" + s + ".effStep * " + this.delay + ") / " + this.options['duration'] + ";\n";
    code += "  r = ( e ) * " + this.colors[1].red + " + " + this.colors[0].red + " * ( 1.0 - e );\n";
    code += "  g = ( e ) * " + this.colors[1].green + " + " + this.colors[0].green + " * ( 1.0 - e );\n";
    code += "  b = ( e ) * " + this.colors[1].blue + " + " + this.colors[0].blue + " * ( 1.0 - e );\n";
    code += "  for(uint16_t j=0;j<" + leds + ";j++) {\n";
    code += "    if((j % " + this.options['every'] + ") == 0)\n";
    code += "      " + s + ".strip.setPixelColor(j, r, g, b);\n";
    code += "    else\n";
    code += "      " + s + ".strip.setPixelColor(j, 0, 0, 0);\n";
    code += "  }\n";
    code += "  if(" + s + ".effStep >= " + (this.steps) + ") {" + s + ".Reset(); return 0x03; }\n";
    code += "  else " + s + ".effStep++;\n";
    code += "  return 0x01;\n";
    code += "}\n\n";
    return code;
  }
};
