import { SCENE, SCENES, paintScene } from './config.js';
import { createFog } from './fog.js';
import { createRain } from './rain.js';
import { createAudio } from './audio.js';
import { bindUI, createNotifier } from './ui.js';
import { update } from './state.js';
const notify=createNotifier();
async function init(){
 try{
  const background=await paintScene(document.querySelector('#background'));
  const fog=createFog(document.querySelector('#fog'),background,()=>document.querySelector('#hint').classList.add('dismissed'));
  const rain=await createRain(document.querySelector('#rain'),background,notify);
  const audio=createAudio(notify);
  let request=0;
  async function changeScene(key,custom){
   const token=++request,scene=custom||SCENES[key];
   try{
    const next=document.createElement('canvas');next.width=SCENE.width;next.height=SCENE.height;
    await paintScene(next,scene);if(token!==request)return;
    await rain.setBackground(next);if(token!==request)return;
    background.getContext('2d').drawImage(next,0,0);fog.setBackground();
    update({scene:key});document.querySelector('#scene-caption').textContent=scene.caption;
    notify(`窗外已切换为${scene.label}`);
   }catch(error){if(token===request)notify('图片未能读取，请尝试其他 JPG、PNG 或 WebP 图片');console.warn('Scene image:',error.message);}
  }
  bindUI({fog,rain,audio,changeScene,notify});
  document.querySelector('#loading').classList.add('ready');document.querySelector('#window').dataset.ready='true';
 }catch(error){document.querySelector('#loading').textContent='窗景未能加载，请检查本地资源并通过 localhost 打开。';console.error('WINDOW initialization failed:',error);}
}
init();
