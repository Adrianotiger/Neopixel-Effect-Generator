/* global Form, Effects */

// Every effect extends the Effect class.
// This will give some base functionality
class EffectMove extends Effect
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
    this.name = "Move";   // give a name to this effect
      // Option variables. Every option must be declared here
      // They are inside an array, so the values can be saved and loaded easly to/from a file
    this.options['toLeft'] = true;    // direction
    this.options['rotate'] = true;    // if the first led should get the color of the last one after each step
  }
  
  static get Author() {return "Adriano Petrucci";}
  static get Version() {return "1.0";}
  
    // Init class, parameters: number of leds (if you need to know how many leds the strip has)
  Init(leds)
  {    
    this.delay = 50;
    this.steps = leds;    // calculate the steps to show this animation
        
        // Fill the settings array. See Form to get a list of possible inputs
        // Slider input: 
        //   title to show, 
        //   current value, 
        //   default value if user double clicks the slider, 
        //   min value, 
        //   max value (negative to give the possibility to insert a bigger number manually)
        //   return function
    this.animationSettings.push(Form.CreateSwitchInput("Direction:", "left", "right", this.options['toLeft']?"left":"right", function(val){
      this.options['toLeft'] = (val === "left");
    }.bind(this)));
    this.animationSettings.push(Form.CreateSwitchInput("Rotate:", "yes", "no", this.options['rotate']?"yes":"no", function(val){
      this.options['rotate'] = (val === "yes");
    }.bind(this)));
    this.animationSettings.push(Form.CreateSliderInput("Steps for effect:", this.steps, leds, 1, leds, function(val){
      this.steps = val;
    }.bind(this)));
    this.animationSettings.push(Form.CreateSliderInput("Delay between steps (ms):", this.delay, 10, 1, -100, function(val){
      this.delay = val;
    }.bind(this)));
      
    super.Init(leds);
  }
  
    // Set strip colors for the next step
    // use this.step to get the current step
    // parameter: ledStrip to update
  NextStep(ledStrip)
  {
    if(this.options['toLeft'])
    {
      var pix1 = new Pixel(ledStrip.leds[0].red, ledStrip.leds[0].green, ledStrip.leds[0].blue);
      for(var l=0;l<ledStrip.leds.length-1;l++)
      {
        ledStrip.leds[l].SetColor( ledStrip.leds[l+1].red,  ledStrip.leds[l+1].green,  ledStrip.leds[l+1].blue);
      }
      if(this.options['rotate'])
        ledStrip.leds[ledStrip.leds.length - 1].SetColor(pix1.red, pix1.green, pix1.blue);
      else
        ledStrip.leds[ledStrip.leds.length - 1].SetColor(0, 0, 0);
    }
    else
    {
      var pix1 = new Pixel(ledStrip.leds[ledStrip.leds.length-1].red, ledStrip.leds[ledStrip.leds.length-1].green, ledStrip.leds[ledStrip.leds.length-1].blue);
      for(var l=ledStrip.leds.length-1;l>0;l--)
      {
        ledStrip.leds[l].SetColor( ledStrip.leds[l-1].red,  ledStrip.leds[l-1].green,  ledStrip.leds[l-1].blue);
      }
      if(this.options['rotate'])
        ledStrip.leds[0].SetColor(pix1.red, pix1.green, pix1.blue);
      else
        ledStrip.leds[0].SetColor(0, 0, 0);
    }
    
    
    super.NextStep(ledStrip);
  }
    
    // generate the arduino code
    // this can only be tested once you compile the code with the Arduino IDE
  GetArduinoCode(stripid, effectname, leds)
  {
    var s = "strip_" + stripid;
    var code = super.GetArduinoCode(stripid, effectname, leds);
    
    code += "  if(millis() - " + s + ".effStart < " + this.delay + " * (" + s + ".effStep)) return 0x00;\n";
    if(this.options['rotate'])
    {
      if(this.options['toLeft'])
        code += "  uint32_t c = " + s + ".strip.getPixelColor(0);\n";
      else
        code += "  uint32_t c = " + s + ".strip.getPixelColor(" + (leds-1) + ");\n";
    }
    if(this.options['toLeft'])
    {
      code += "  for(uint16_t j=0;j<" + leds + "-1;j++) \n";
      code += "    " + s + ".strip.setPixelColor(j, " + s + ".strip.getPixelColor(j+1)); \n";
    }
    else
    {
      code += "  for(uint16_t j=" + leds + "-1;j>0;j--) \n";
      code += "    " + s + ".strip.setPixelColor(j, " + s + ".strip.getPixelColor(j-1)); \n";
    }
    if(this.options['rotate'])
    {
      if(this.options['toLeft'])
        code += "    " + s + ".strip.setPixelColor(" + leds + "-1, c); \n";
      else
        code += "    " + s + ".strip.setPixelColor(0, c); \n";
    }
    code += "  if(" + s + ".effStep >= " + (this.steps) + ") {" + s + ".Reset(); return 0x03; }\n";
    code += "  else " + s + ".effStep++;\n";
    code += "  return 0x01;\n";
    code += "}\n\n";
    return code;
  }
};
