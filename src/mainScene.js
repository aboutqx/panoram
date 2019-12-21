import Scene from './scene'
import ViewSky from './ViewSky'
import Emitter from 'libs/emitter'
import {
	setFullScreen,
	setExitFullScreen
} from 'libs/FullScreen'
import {
	getPanoParams,
	currentScene
} from './TexturePath'
const userId = location.search.split('=')[1] || 100027
import HotSpots from './ViewHotSpot'

const getMouse = function (mEvent, mTarget) {

	const o = mTarget || {};
	if (mEvent.touches) {
		o.x = mEvent.touches[0].pageX;
		o.y = mEvent.touches[0].pageY;
	} else {
		o.x = mEvent.clientX;
		o.y = mEvent.clientY;
	}

	return o;
}

class mainScene extends Scene {
	mouse
	startRotate = false
	rotate = 0.
	radius
	delta
	timer
	targetPosition = new THREE.Vector3(0, 300, -500.)
	length = 250.
	controlMode = document.querySelector('.control-mode')
	hotSpots
	timer
	fullScreen = document.getElementById('full-screen')
	vr = document.getElementById('vr-control')
	constructor(dom){
		super(dom);//call _init,_addLight

		this._resize=this._resize.bind(this)
		this.contianer = dom
		this.camera.rotation.set(0, 0, 0)

	}
	
	async init(){
		this.sky = new ViewSky(this.gl)
		this.mesh = await this.sky.getMesh()
		this.add(this.mesh)

		this.hotSpots = new HotSpots(this)
		this.hotSpots.addHotSpots(currentScene().hotSpots)

		this.getDelta()
		this.startRotate = false
		Emitter.emit('stopControl')

		Emitter.on('startRotate', () => this.startRotate = true)
		Emitter.on('nextPano', () => {
			this.updateSky()
		})
	}

	load(callback){
		getPanoParams(userId)
		callback()
		
		
	}
	play(){
		this.init()

		this.update()
		this.addListeners()
	}
	_resize(){
		Scene.prototype.resize.call(this,window.innerWidth,window.innerHeight)
		this.hotSpots&&this.hotSpots.update()
	}

	addListeners(){
		window.addEventListener('resize',this._resize)
		this.controlMode.addEventListener('mousedown', (e) => {
			e.stopPropagation()
			let dom = e.target
			if(dom.innerHTML === '自动'){
				this._down()
			} else {
				this._up()
			}
		})
		window.addEventListener('contextmenu', (e) => e.preventDefault())
		this.gl.canvas.addEventListener('mousedown', () => this._down())
		this.gl.canvas.addEventListener('touchstart', () => this._down())

		let svgDoc = this.fullScreen
		let open = svgDoc.getElementById('open')
		let close = svgDoc.getElementById('close')
		this.fullScreen.addEventListener('click', () =>{

			if(open.style.display === 'none') {
				setFullScreen(true)
				open.style.display = 'block'
				close.style.display = 'none'
			} else {
				setFullScreen(false)
				close.style.display = 'block'
				open.style.display = 'none'
			}
		})
		setExitFullScreen(() =>{
			close.style.display = 'block'
			open.style.display = 'none'
		})

		this.vr.addEventListener('click', () =>{
			if(!this.vr.classList.contains('active')){
				this.vr.classList.add('active')
				Emitter.emit('vrMode', true)
			} else {
				this.vr.classList.remove('active')
				Emitter.emit('vrMode', false)
			}
			
		})
	}

	_down(e) {
		
		Emitter.emit('startControl')
		this.startRotate = false
		this.controlMode.innerHTML = '手动'
	}
	
	_up() {
		Emitter.emit('stopControl')

		this.startRotate = true

		this.controlMode.innerHTML = '自动'
		this.getDelta() //刷新delta
		
	}

	loop(t){
		// console.log(this.controls.ry.value, this.radius)
		this.sky.render(t)

		if(this.startRotate && this.radius!==undefined) {
			this.controls.ry.value += this.delta
			if ((this.delta < 0 && this.controls.ry.value <= this.radius) || (this.delta > 0 && this.controls.ry.value >= this.radius) && Math.abs(this.controls.ry.value - this.radius)<.03) {

				this.startRotate = false
				this.updateSky()
			}
		}
		
		this.hotSpots&&this.hotSpots.update()
	}

	async updateSky(){
		await this.sky.updateSky('next')
		// this.startRotate = true //emmit when mix texture finished
		this.getDelta()
		
		this.hotSpots.addHotSpots(currentScene().hotSpots, currentScene().index)
		Emitter.emit('hideDialogs')
	}

	getDelta () {
		let delta = .025
		this.radius = currentScene().radius
		this.delta = (this.radius - this.controls.ry.value > 0) ? delta : -delta
	}
}
export default mainScene