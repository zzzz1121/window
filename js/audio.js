import { state, update, subscribe } from './state.js';
const tracks={rain:'assets/rain.mp3',city:'assets/city.mp3',wind:'assets/wind.wav'};
// Extend the V1 local AudioBuffer loop into three independent gains + one master.
export function createAudio(notify) {
  let context,master,loading=null;
  const channels={};
  async function prepare() {
    if(!context){const AC=window.AudioContext||window.webkitAudioContext;
      if(!AC)throw new Error('当前浏览器不支持声音混合');
      context=new AC();master=context.createGain();master.gain.value=0;master.connect(context.destination);
    }
    await context.resume();
    if(!loading)loading=Promise.all(Object.entries(tracks).map(async([name,url])=>{
      const response=await fetch(url);if(!response.ok)throw new Error(`${name} 音频加载失败`);
      const buffer=await context.decodeAudioData(await response.arrayBuffer());
      const source=context.createBufferSource(),gain=context.createGain();
      source.buffer=buffer;source.loop=true;source.connect(gain);gain.connect(master);
      gain.gain.value=state.sound[name]/100;source.start();channels[name]={source,gain};
    })).catch(error=>{for(const t of Object.values(channels)){t.source.stop();t.gain.disconnect();}
      for(const key of Object.keys(channels))delete channels[key];loading=null;throw error;});
    await loading;
  }
  function sync(){if(!context)return;
    master.gain.setTargetAtTime(state.playing?state.master/100*.65:0,context.currentTime,.08);
    for(const [name,t]of Object.entries(channels))t.gain.gain.setTargetAtTime(state.sound[name]/100,context.currentTime,.08);
  }
  subscribe(sync);
  let intent=0;
  async function play() {
    const ticket=++intent;
    try{await prepare();if(ticket===intent){update({playing:true});sync();}}
    catch(error){update({playing:false});notify(error.message);}
  }
  return {
    async toggle(){if(state.playing){intent++;update({playing:false});}else await play();},
    setTrack(name,value){update({sound:{...state.sound,[name]:Number(value)}});if(!state.playing)void play();},
    setMaster(value){update({master:Math.max(0,Math.min(100,Math.round(value)))});if(!state.playing)void play();}
  };
}
