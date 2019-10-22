/* global Form, Effects, LedStrip */

class Loop
{
  constructor(parent)
  {
    this.currentChild = -1;
    this.childs = [];
    this.parent = parent;
    this.loop = {type:"cycle", count:1, temp:0};
    this.ledStrip = null;
    this.div = document.createElement("div");
    this.div.className = "loopdiv";

    var p = document.createElement("p");
    p.appendChild(document.createTextNode("Loop"));

    p.addEventListener("click", function(){
      var inputs = [];
      inputs.push(Form.CreateSwitchInput("", "time", "cycle", this.loop.type, function(val){
        this.loop.type = val;
      }.bind(this)));
      inputs.push(Form.CreateNumberInput("Time(seconds) / Cycles(count):", this.loop.count, 1, 10000, function(val){
        this.loop.count = parseInt(val);
      }.bind(this)));

      Form.GetInputsSetttings("Looping ", inputs);
    }.bind(this));
    
    this.div.appendChild(p);
    
    var addSpan = document.createElement("span");
    addSpan.className = 'span-btn';

    var addEffect = document.createElement("b");

    addEffect.className = 'btn-add-effect';
    addEffect.appendChild(document.createTextNode("+ Add Effect"));
    addEffect.addEventListener("click", function(e){
      Effects.ChooseEffect(e, this);
    }.bind(this));
    addSpan.appendChild(addEffect);

    var addLoop = document.createElement("b");

    addLoop.className = 'btn-add-loop';
    addLoop.appendChild(document.createTextNode("+ Add Loop"));
    addLoop.addEventListener("click", function(){
      var loop = new Loop(this);
      this.childs.push(loop);

    }.bind(this));
    addSpan.appendChild(addLoop);
    this.div.appendChild(addSpan);
    
    if(parent.constructor === LedStrip)
    {
      this.ledStrip = parent;

    }
    else
    {
      this.ledStrip = parent.ledStrip;
      var delLoop = document.createElement("b");
      delLoop.className = "formbutton_removeloop";
      delLoop.appendChild(document.createTextNode("- Remove Loop"));
      delLoop.addEventListener("click", function(){
        if(this.childs.length > 0)
        {
          alert("Please remove loops and effects inside this loop before");
        }
        else
        {
          this.parent.RemoveInnerLoop(this);
        }
      }.bind(this));
      this.div.appendChild(delLoop);
    }
    
    if(parent.constructor === LedStrip) parent = document.getElementById("ledeffectsdiv");
    else parent = parent.div;
    
    if (document.getElementById("ledeffectsdiv").childElementCount == 0) {
      parent.appendChild(this.div);
    } else {
      while (document.getElementById("ledeffectsdiv").childElementCount > 1){
        document.getElementById("ledeffectsdiv").removeChild(document.getElementById("ledeffectsdiv").firstChild);
      };
      parent.appendChild(this.div);
    }

    parent.appendChild(document.createElement("br"));
  }
  
  RemoveInnerLoop(loop)
  {
    for(var k=0;k<this.childs.length;k++)
    {
      if(this.childs[k] === loop)
      {
        this.childs.splice(k, 1);
        break;
      }
    }
    this.div.removeChild(loop.div.nextSibling);
    this.div.removeChild(loop.div);
    if(this.currentChild >= this.childs.length) this.currentChild = -1;
  }
  
  RemoveInnerEffect(loop, effect)
  {
    for(var k=0;k<this.childs.length;k++)
    {
      if(this.childs[k] === effect)
      {
        this.childs.splice(k, 1);
        break;
      }
    }
    var test = document.getElementById('test');
    while (test.childElementCount > 0) {
     test.removeChild(test.childNodes[0]);
    }
    test.style.display = 'none';

    var footer = document.getElementsByClassName('footer')[0];
    footer.style.zIndex = '0';

    this.div.removeChild(effect.div.nextSibling);
    this.div.removeChild(effect.div);
    if(this.currentChild >= this.childs.length) this.currentChild = -1;
  }
  
  AddEffect(effectid)
  {
    var effect = Effects.NewEffect(effectid);
    effect.Init(this.ledStrip.leds.length);
    var delEffect = document.createElement("b");
    delEffect.className = "formbutton_removeeffect";
    delEffect.appendChild(document.createTextNode("- Remove"));
    delEffect.addEventListener("click", function(){
      this.RemoveInnerEffect(this, effect);
    }.bind(this));
    var infoEffect = document.createElement("i");
    infoEffect.className = "formbutton_info";
    infoEffect.appendChild(document.createTextNode("i"));
    infoEffect.addEventListener("click", function(e){
      Effects.ShowInfo(e, effectid);
    }.bind(this));

    effect.div.appendChild(delEffect);
    effect.div.appendChild(infoEffect);
    this.childs.push(effect);
    this.div.appendChild(effect.div);
    this.div.appendChild(document.createElement("br"));
    
    this.currentChild = this.childs.length - 1;
    return effect;
  }
  
  NextStep()
  {
    var effectOver = false;
    var loopOver = false;
    if(this.currentChild < 0) return;
    if(this.childs[this.currentChild].constructor === Loop)
    {
      var ret = this.childs[this.currentChild].NextStep();
      if(typeof ret === "undefined")
      {
        //console.log("Effect over");
        effectOver = true;
        if(this.loop.type === "time")
        {
          // todo: break inner loops
        }
        else
        {
          if(this.currentChild >= this.childs.length - 1)
          {
            this.loop.temp++;
            if(this.loop.temp >= this.loop.count)
              loopOver = true; 
          }
        }
      }
      else if(!ret) return false;
    }
    else  // Effect
    {
      var effect = this.childs[this.currentChild];
      var now = window.performance.now();
      if(now - Effects.lastStep < effect.delay) return false;
      Effects.lastStep = now;
      effect.NextStep(this.ledStrip);
      Effects.speedFactorTime += effect.delay;
      if(now - Effects.speedFactorStart > 1000)
      {
        var effective = (now - Effects.speedFactorStart) / (Effects.speedFactorTime);
        document.getElementById("info_speedfactor").innerHTML = (parseInt(effective * 100) / 100.0) + "x";
        Effects.speedFactorStart = window.performance.now();
        Effects.speedFactorTime = 0;
        
      }
      if(this.loop.type === "time")
      {
        this.loop.temp += effect.delay;
        if(this.loop.temp / 1000 >= this.loop.count)
        {
          effectOver = true;
          loopOver = true;
        }
      }
      else
      {
        if(effect.step >= effect.steps)
        {
          effectOver = true;
          if(this.currentChild >= this.childs.length - 1)
          {
            this.loop.temp++;
            if(this.loop.temp >= this.loop.count)
              loopOver = true; 
          }
        }
      }
    }
    if(loopOver)
    {
      //console.log("--> Loop over");
      this.childs[this.currentChild].EndEffect();
      if(this.parent.constructor === Loop)
      {
        this.currentChild = 0;
        return;
      }/*
      else
      {
        this.childs[this.currentChild].InitEffect();
      }*/
    }
    if(effectOver)
    {
      //console.log("--> Effect " + this.childs[this.currentChild].name + " over");
      this.childs[this.currentChild].EndEffect();
      // next effect
      if(this.currentChild >= this.childs.length - 1)
      {
        // loop over
        this.currentChild = 0;
        if(loopOver && this.parent.constructor === Loop)
        {
          return;
        }
        else
        {
          // should never happens
          this.childs[this.currentChild].InitEffect();
        }
      }
      else
      {
        this.currentChild++;
        this.childs[this.currentChild].InitEffect();
      }
    }
    return true;
  }
  
  InitEffect()
  {
    this.loop.temp = 0;
    if(this.currentChild >= 0)
    {
      this.childs[this.currentChild].InitEffect();
    }
  }
  
  EndEffect()
  {
    if(this.currentChild >= 0)
    {
      this.childs[this.currentChild].EndEffect();
    }
  }
  
  GetArduinoLoops(stripid, loopname)
  {
    var code = "struct Loop strip" + stripid + loopname + "(" + this.childs.length + ", " + (this.loop.type === "time" ? "true" : "false") + ", " + this.loop.count + ");\n";
    var loopnameAdd = 0;
    for(var k=0;k<this.childs.length;k++)
    {
      if(this.childs[k].constructor === Loop)
      {
        code += this.childs[k].GetArduinoLoops(stripid, loopname + loopnameAdd);
        loopnameAdd++;
      }
    }
    return code;
  }
  
  GetArduinoCode(stripid, loopname)
  {
    var code = "";
    code += "uint8_t strip" + stripid + "_" + loopname + "() {\n";
    code += "  uint8_t ret = 0x00;\n";
    code += "  switch(strip" + stripid + loopname + ".currentChild) {\n";
    var loopnameAdd = 0;
    var effectAdd = 0;
    for(var k=0;k<this.childs.length;k++)
    {
      code += "    case " + k + ": \n";
      if(this.childs[k].constructor === Loop)
      {
        code += "           ret = strip" + stripid + "_" + loopname + loopnameAdd + "();break;\n";
        loopnameAdd++;
      }
      else
      {
        code += "           ret = strip" + stripid + "_" + loopname + "_eff" + effectAdd + "();break;\n";
        effectAdd++;
      }
    }
    code += "  }\n";
    code += "  if(ret & 0x02) {\n";
      code += "    ret &= 0xfd;\n";
      code += "    if(strip" + stripid + loopname + ".currentChild + 1 >= strip" + stripid + loopname + ".childs) {\n";
      code += "      strip" + stripid + loopname + ".currentChild = 0;\n";
      code += "      if(++strip" + stripid + loopname + ".currentTime >= strip" + stripid + loopname + ".cycles) {strip" + stripid + loopname + ".currentTime = 0; ret |= 0x02;}\n";
      code += "    }\n";
      code += "    else {\n";
      code += "      strip" + stripid + loopname + ".currentChild++;\n";
      code += "    }\n";
      code += "  };\n";
    code += "  return ret;\n";
    code += "}\n\n";
    loopnameAdd = 0;
    effectAdd = 0;
    for(var k=0;k<this.childs.length;k++)
    {
      if(this.childs[k].constructor === Loop)
      {
        code += this.childs[k].GetArduinoCode(stripid, loopname + loopnameAdd);
        loopnameAdd++;
      }
      else
      {
        code += this.childs[k].GetArduinoCode(stripid, loopname + "_eff" + effectAdd, this.ledStrip.leds.length);
        effectAdd++;
      }
    }
    return code;
  }
};