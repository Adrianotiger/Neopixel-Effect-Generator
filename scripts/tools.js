
var Tools = new class
{
  constructor()
  {
    
  }
  
  ImportCode()
  {
    var divy = document.getElementById('importDiv');
    while(divy.childElementCount > 0){
      divy.removeChild(divy.lastElementChild);
    }

    var code = "Put your json with inside this box and load it.";
    
    var txtArea = document.createElement("textarea");
    txtArea.className = 'textarea-import';
    txtArea.setAttribute("placeholder", code);
    divy.appendChild(txtArea);
    
    divy.appendChild(document.createElement("br"));
    
    var loadScript = document.createElement("button");
    loadScript.appendChild(document.createTextNode("Import"));
    loadScript.className = 'btn-copy';
    divy.appendChild(loadScript);
    loadScript.addEventListener("click", ()=>{
      this._importCode(txtArea.value);
    });
  }
  
  _importCode(txt)
  {
    var json = "";
    try
    {
      json = JSON.parse(txt);
    }
    catch(e)
    {
      alert("Error parsing json: \n" + e + "\n");
      return;
    }

    console.log(json);
    if(json.NeoPixelEffects && json.NeoPixelEffects.strips)
    {
      while(LedStrips.GetStrips().length > 0)
        LedStrips.Remove(LedStrips.GetStrips()[0]);
      for(var s in json.NeoPixelEffects.strips)
      {
        var ls = new LedStrip(json.NeoPixelEffects.strips[s].pin, json.NeoPixelEffects.strips[s].leds);
        ls.frequence = json.NeoPixelEffects.strips[s].frequence;
        ls.colortype = json.NeoPixelEffects.strips[s].type;
        LedStrips.ledstrips.push(ls);
        LedStrips.strips++;
        LedStrips.SelectStrip(ls);
        addLedStrip(ls);
        for(var l in json.NeoPixelEffects.strips[s].loop)
        {
          this._importCodeLoop(ls.loop, json.NeoPixelEffects.strips[s].loop[l]);
        }
      }
    }
  }
  
  _importCodeLoop(loop, jsonEffect)
  {
    if(jsonEffect.loop) // has loop
    {
      var newloop = new Loop(loop);
      newloop.loop.type = jsonEffect.looptype;
      newloop.loop.count = parseInt(jsonEffect.loopcount);
      loop.childs.push(newloop);
      
      for(var l in jsonEffect.loop)
      {
        this._importCodeLoop(loop.childs[loop.childs.length-1], jsonEffect.loop[l]);
      }
    }
    else // is effect
    {
      var effId = 0;
      for(;effId<Effects.effects.length;effId++)
        if(Effects.effects[effId].name === jsonEffect.type) break;
      var eff = loop.AddEffect(effId);
      eff.delay = parseInt(jsonEffect.delay);
      eff.steps = parseInt(jsonEffect.steps);
      eff.colors = [];
      for(var c in jsonEffect.colors)
      {
        var p = new Pixel(
                parseInt(jsonEffect.colors[c].red), 
                parseInt(jsonEffect.colors[c].green), 
                parseInt(jsonEffect.colors[c].blue), 
                parseInt(jsonEffect.colors[c].white));
        eff.colors.push(p);
      }
      for(var o in jsonEffect.options)
      {
        if(jsonEffect.options[o]['value'] === 'true' || jsonEffect.options[o]['value'] === 'false')
          eff.options[jsonEffect.options[o]['name']] = (jsonEffect.options[o]['value'] === 'true');
        else if(parseInt(jsonEffect.options[o]['value']) > 0)
          eff.options[jsonEffect.options[o]['name']] = parseInt(jsonEffect.options[o]['value']);
        else
          eff.options[jsonEffect.options[o]['name']] = jsonEffect.options[o]['value'];
      }
    }
  }
  
  ExportCode()
  {
    var divy = document.getElementById('exportDiv');
    while(divy.childElementCount > 0){
      divy.removeChild(divy.lastElementChild);
    }

    var spaces = 8;
    var code = "{\"NeoPixelEffects\": {\n";
    code += "  \"strips\":[\n";
    for(var j=0;j<LedStrips.Count();j++)
    {
      var ls = LedStrips.GetStrip(j);
      if(j > 0) code += ",\n";
      code += "    {\n";
      code += "      \"pin\" : \"" + ls.pin + "\",\n";
      code += "      \"leds\" : \"" + ls.leds.length + "\",\n";
      code += "      \"frequence\" : \"" + ls.frequence + "\",\n";
      code += "      \"type\" : \"" + ls.colortype + "\",\n";
      code += "      \"loop\" : [\n";
      for(var k=0;k<ls.loop.childs.length;k++)
      {
        if(k>0) code += ",\n";
        code += this._exportLoop(spaces, ls.loop.childs[k]);
      }
      code += "\n";
      code += "      ]\n";
      code += "    }";
    }
    code += "\n";
    code += "  ]\n";
    code += "}\n}";
    
    var btn = document.createElement('button');
    btn.innerHTML = 'Copy'
    btn.className = 'btn-copy';

    var txtArea = document.createElement("pre");
    txtArea.setAttribute("style", "max-height:70vh;text-align:left;overflow:auto;font-size:70%;");
    var txtCode = document.createElement("code");
    txtCode.style.fontSize = '14px';
    txtArea.addEventListener("click", function(){
      var range = document.createRange();
      range.selectNode(txtArea);
      document.getSelection().empty();
      document.getSelection().addRange(range);
    });
    txtCode.appendChild(document.createTextNode(code));
    txtArea.appendChild(txtCode);

    divy.className = 'settings-div';
    var textarea = document.createElement("textarea");
    textarea.setAttribute('readonly', 'true');
    textarea.className = 'hide-input-for-copy';
    textarea.innerHTML = code;

    btn.addEventListener('click', () => {
      textarea.select();
      document.execCommand('Copy');
      alert('Copied!');
    });

    divy.appendChild(btn);
    divy.appendChild(txtArea);
    divy.appendChild(textarea);
    
    if(hljs)
      hljs.highlightBlock(txtArea);
  }
  
  _exportLoop(spaces, cl)
  {
    var tab = "";
    for(var j=0;j<spaces;j++) tab += " ";
    var code = "";
    code += tab + "{\n";
    code += tab + "  \"type\" : \"" + cl.constructor.name + "\",\n";
    if(cl.constructor === Loop)
    {
      code += tab + "  \"looptype\" : \"" + cl.loop.type + "\",\n";
      code += tab + "  \"loopcount\" : \"" + cl.loop.count + "\",\n";
      code += tab + "  \"loop\" : [\n";
      for(var k=0;k<cl.childs.length;k++)
      {
        if(k>0) code += ",\n";
        code += this._exportLoop(spaces+2, cl.childs[k]);
      }
      code += "\n";
      code += tab + "  ]\n";
    }
    else // an effect
    {
      code += tab + "  \"steps\" : \"" + cl.steps + "\",\n";
      code += tab + "  \"delay\" : \"" + cl.delay + "\",\n";
      code += tab + "  \"colors\" : [\n";
      for(var h=0;h<cl.colors.length;h++)
      {
        if(h > 0) code += ",\n";
        code += tab + "    {\n";
        code += tab + "      \"red\" : \"" + cl.colors[h].red + "\",\n";
        code += tab + "      \"green\" : \"" + cl.colors[h].green + "\",\n";
        code += tab + "      \"blue\" : \"" + cl.colors[h].blue + "\",\n";
        code += tab + "      \"white\" : \"" + cl.colors[h].white + "\"\n";
        code += tab + "    }";
      }
      code += "\n";
      code += tab + "  ],\n";
      code += tab + "  \"options\" : [\n";
      var h = 0;
      for(var o in cl.options)
      {
        if(h++ > 0) code += ",\n";
        code += tab + "    {\n";
        code += tab + "      \"name\" : \"" + o + "\",\n";
        code += tab + "      \"value\" : \"" + cl.options[o] + "\"\n";
        code += tab + "    }";
      }
      code += "\n";
      code += tab + "  ]\n";
    }
    code += tab + "}";
    return code;
  }
};