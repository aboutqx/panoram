import './assets/main.scss'
import mainScene from  './mainScene'
import Config from './Config'
import load from 'load-asset'
import Emitter from './libs/emitter';

const container = document.getElementById('canvas-container')
const progressbar = container.querySelector('.progress-bar')
const svgDoc = document.getElementById('full-screen')

async function loadScene(assets){
	if (Object.keys(assets).length > 0) {
		window.getAssets = await load.any(assets, ({progress,error}) => {
			progressbar.innerHTML = 'Loading...' + (progress * 100).toFixed() + '%';
			if (error) console.error(error);
		})
	}
	setTimeout(()=>{
		progressbar.style.display='none'
		container.querySelector('canvas').style.opacity=1
	},200)
	const t=new mainScene(container);
	t.load(() => t.play());
}

loadScene(Config.assets)

const wave = document.getElementById('wave')
Emitter.on('soundPlay',  (data) => {
	const audio = document.createElement('audio')
	audio.autoplay = true
	audio.src = data.detail
	document.body.appendChild(audio)
	
	audio.play().then(() => {
		wave.classList.add('active')
	}).catch(e => {
		//click to play
	})
	wave.addEventListener('click',  () => {
		if (wave.classList.contains('active')) {
			wave.classList.remove('active')
			audio.pause()
		} else {
			audio.play()
			wave.classList.add('active')
		}

	})

	audio.addEventListener('ended',  () => {
		wave.classList.remove('active')
	})
})