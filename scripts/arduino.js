var Arduino = new class
{
  constructor()
  {
    this.stripsDeclaration = "//[STRIPS_DECLARATION]\n";
    this.stripsInit = "//[STRIPS_INIT]\n";
    this.stripsLoop = "//[STRIPS_LOOP]\n";
    this.stripsFunctions = "//[STRIPS_FUNCTIONS]\n";
    this.stripsType = "[STRIPS_TYPE]";
    
    this.baseCode = "#include <Adafruit_NeoPixel.h>\n\n";
    this.baseCode += "#ifdef __AVR__\n";
    this.baseCode += "#include <avr/power.h> // Required for 16 MHz Adafruit Trinket\n";
    this.baseCode += "#endif\n";
    this.baseCode += "class Strip\n{\npublic:\n  uint8_t   effect;\n  uint8_t   effects;\n  uint16_t  effStep;\n  unsigned long effStart;\n  Adafruit_NeoPixel strip;\n";
      this.baseCode += "  Strip(uint16_t leds, uint8_t pin, uint8_t toteffects, uint16_t striptype) : strip(leds, pin, striptype) {\n    effect = -1;\n    effects = toteffects;\n    Reset();\n  }\n";
      this.baseCode += "  void Reset(){\n    effStep = 0;\n    effect = (effect + 1) % effects;\n    effStart = millis();\n  }\n";
    this.baseCode += "};\n\n";
    this.baseCode += "struct Loop\n{\n  uint8_t currentChild;\n  uint8_t childs;\n  bool timeBased;\n  uint16_t cycles;\n  uint16_t currentTime;\n  ";
      this.baseCode += "Loop(uint8_t totchilds, bool timebased, uint16_t tottime) {currentTime=0;currentChild=0;childs=totchilds;timeBased=timebased;cycles=tottime;}\n};\n\n";
    this.baseCode += "//[STRIPS_DECLARATION]\n\n";
    this.baseCode += "";
    this.baseCode += "//[GLOBAL_VARIABLES]\n\n";
    this.baseCode += "void setup() {\n\n";
    this.baseCode += "  #if defined(__AVR_ATtiny85__) && (F_CPU == 8000000)\n";
    this.baseCode += "  clock_prescale_set(clock_div_1);\n";
    this.baseCode += "  #endif\n";
    this.baseCode += "  //Your setup here:\n\n";
    this.baseCode += "//[STRIPS_INIT]\n";
    this.baseCode += "}\n\n";
    this.baseCode += "void loop() {\n\n";
    this.baseCode += "  //Your code here:\n\n";
    this.baseCode += "  strips_loop();\n";
    this.baseCode += "}\n\n";
    this.baseCode += "void strips_loop() {\n";
    this.baseCode += "//[STRIPS_LOOP]\n";
    this.baseCode += "}\n\n";
    this.baseCode += "//[STRIPS_FUNCTIONS]\n";
  }
  
  GenerateCode()
  {
    var divy = document.getElementById('arduCodeDiv');
    
    while(divy.childElementCount > 0){
      divy.removeChild(divy.firstChild);
    }

    divy.className = 'arduino-code-div';
    var button = document.createElement('button');
    button.appendChild(document.createTextNode('Copy Code'));
    button.className = 'btn-copy';

    var black = document.createElement("div");
    divy.appendChild(black);
    var window = document.createElement("div");
    window.addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
    }.bind(this));


    var h2 = document.createElement("h2");
    h2.appendChild(document.createTextNode("Arduino Code"));
    window.appendChild(h2);

    
    var code = this.baseCode;
    code = this.ReplaceDeclaration(code);
    code = this.ReplaceInit(code);
    code = this.ReplaceLoop(code);
    code = this.ReplaceFunctions(code);
    
    var txtArea = document.createElement("pre");
    txtArea.setAttribute("style", "max-height:70vh;overflow:auto;background-color:white;text-align:left;overflow:auto;font-size:70%;");
    var txtCode = document.createElement("code");
    txtCode.style.fontSize = '14px';
    txtArea.addEventListener("click", function(){
      var range = document.createRange();
      range.selectNode(txtArea);
      document.getSelection().empty();
      document.getSelection().addRange(range);
    });

    var textarea = document.createElement("textarea");
    textarea.setAttribute('readonly', 'true');
    textarea.className = 'hide-input-for-copy';
    textarea.innerHTML = code;


    button.addEventListener('click', () => {
      textarea.select();
      document.execCommand('Copy');
      alert('Copied!');
    });
    divy.appendChild(button);

    txtCode.appendChild(document.createTextNode(code));
    txtArea.appendChild(txtCode);

    divy.appendChild(txtArea);
    divy.appendChild(textarea);    

    if(hljs)
      hljs.highlightBlock(txtArea);
  }
  
  ReplaceStripType(original)
  {
    return original.replace(this.stripsType, NEO_GRB + NEO_KHZ800)
  }
  
  ReplaceDeclaration(original)
  {
    var decl = "";
    
    for(var k=0;k<LedStrips.Count();k++)
    {
      decl += "Strip strip_" + k + "(" + LedStrips.GetStrip(k).leds.length + ", ";
        decl += LedStrips.GetStrip(k).pin + ", ";
        decl += LedStrips.GetStrip(k).leds.length + ", ";
        decl += LedStrips.GetStrip(k).colortype + " + NEO_KHZ" + LedStrips.GetStrip(k).frequence;
        decl += ");\n";
    }
    for(var k=0;k<LedStrips.Count();k++)
    {
      decl += LedStrips.GetStrip(k).GetArduinoLoops(k);
    }
    return original.replace(this.stripsDeclaration, decl);
  }
  
  ReplaceGlobal(original)
  {
    var global = "";
  }
  
  ReplaceInit(original)
  {
    var global = "";
    for(var k=0;k<LedStrips.Count();k++)
    {
      global += "  strip_" + k + ".strip.begin();\n";
    }
    return original.replace(this.stripsInit, global);
    
  }
  
  ReplaceLoop(original)
  {
    var loop = "";
    for(var k=0;k<LedStrips.Count();k++)
    {
      loop += "  if(strip" + k + "_loop0() & 0x01)\n";
      loop += "    strip_" + k + ".strip.show();\n";
    }
    return original.replace(this.stripsLoop, loop);
  }
  
  ReplaceFunctions(original)
  {
    var functions = "";
    
    for(var k=0;k<LedStrips.Count();k++)
    {
      functions += LedStrips.GetStrip(k).GetArduinoCode(k);
    }
    
    return original.replace(this.stripsFunctions, functions);
  }
};