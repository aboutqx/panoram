import Config from './Config'
import Stats from 'libs/stats.min'
import * as dat from 'dat.gui'
if(Config.debug) {
    window.gui = new dat.GUI({
        width: 300
    })
}

import Emitter from 'libs/emitter'
import { isMobile } from 'libs/Util'

//canvas dom,model params
class Scene {
    cameraParams = {
        fov: 60,
        x: 0,
        y: 0,
        z: 0,
        far: 15000
    }
    uniforms
    vrMode = false
    effect

    constructor(dom) {
        this.container = dom;
        this.option = Config || {};

        this.update = this._update.bind(this)

        this._init();
        this._setControls();
        this._addLight();
    }

    _init() {
        var option = this.option;

        this.canvasWidth = option.width || window.innerWidth;
        this.canvasHeight = option.height || window.innerHeight;

        // scene
        this.scene = new THREE.Scene();
        this.scene.camera = this.camera = new THREE.PerspectiveCamera(this.cameraParams.fov, this.canvasWidth / this.canvasHeight, .1, this.cameraParams.far)

        if (this.container.querySelector('canvas')) {
            this.container.removeChild(this.container.querySelector('canvas'))
        }
        this.renderer = new THREE.WebGLRenderer({
            alpha: option.alpha || true,
            antialias: true
        })
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(this.canvasWidth, this.canvasHeight)
        this.container.appendChild(this.renderer.domElement)

        this.gl = this.renderer.context

        //this.addGridHelper(5);
        this.cssScene = new THREE.Scene()
        this.cssRenderer = new THREE.CSS3DRenderer()
        this.cssRenderer.setSize(this.canvasWidth, this.canvasHeight)
        this.css3dContainer = document.getElementById('css3d-container')
        this.css3dContainer.appendChild(this.cssRenderer.domElement)

        if (Config.debug) {
            window.scene = this.scene;
            this.addGUI()

            this.stats = new Stats()
            this.container.appendChild(this.stats.dom)

            this.addGridHelper()
        }

        option.post && this.post();
        this.effect = new THREE.StereoEffect(this.renderer)
        this.effect.setSize(this.canvasWidth, this.canvasHeight)
    }

    add(object) {
        this.scene.add(object)
    }

    remove(object) {
        this.scene.remove(object)
    }

    post() {

    }

    addGUI() {
        let folder = gui.addFolder('camera')
        folder.add(this.cameraParams, 'fov', 10, 90).step(1)
        folder.add(this.cameraParams, 'x', -500, 500).step(1)
        folder.add(this.cameraParams, 'y', -500, 500).step(1)
        folder.add(this.cameraParams, 'z', -500, 500).step(1)
        folder.add(this.cameraParams, 'far', 1, 1000).step(1)
        folder.open()
    }

    _setControls() {
        switch (Config.controls) {
            case 'orbit':
            default:
                const OrbitControls = require('./libs/Controls/OrbitControls').default;
                this.controls = new OrbitControls(this.camera);
                this.controls.sensitivity = .08
                if (isMobile) this.controls.sensitivity = .3
                this.controls.fov.limit(0, 90)
                break;
            case 'range':
                var RangeControls = require('./libs/Controls/RangeControls')(THREE);
                this.controls = new RangeControls(this, {
                    rx: .1,
                    xMax: Number.POSITIVE_INFINITY,
                    xMin: Number.NEGATIVE_INFINITY,
                    yMax: 9,
                    yMin: 2
                }, 500);
                break;
        }
        Emitter.on('stopControl', () => {
            this.controls.lockRotation()
        })
        Emitter.on('startControl', (e) => {
            this.controls.lockRotation(false)
        })
        Emitter.on('vrMode', (e) =>{
            this.vrMode = Boolean(e.detail)
            if(!this.vrMode) this.resize()
            if(this.vrMode&&isMobile) alert('请将手机横屏欣赏')
        })
    }
    addLightHelpr() {

        var matBox = new THREE.MeshPhongMaterial();
        var geoBox = new THREE.BoxGeometry(5000, 5000, 5000);

        var skyBox = new THREE.Mesh(geoBox, matBox);
        this.scene.add(skyBox);

        lightHelper = new THREE.SpotLightHelper(this.spotLight);
        this.scene.add(lightHelper);
    }
    addGridHelper(step, size) {
        var size = size || 10;

        var gridHelper = new THREE.GridHelper(size, step);
        this.scene.add(gridHelper);
    }
    _addLight() {

    }
    turnOffLight() {

        for (var i = 0; i < this.scene.children.length; i++) {
            if (this.scene.children[i] instanceof THREE.Light) {
                this.scene.children[i].visible = false;
            }
        }

    }

    resize(w, h) {
        if(!w){
            w = this.canvasWidth
        }
        if(!h) {
            h = this.canvasHeight
        }
        this.camera.aspect = w / h
        this.camera.updateProjectionMatrix()
        if (this.option.post) {
            this.FXAAPass.uniforms['resolution'].value.set(1 / w, 1 / h);
            this.composer.setSize(w, h)
        }
        if(this.vrMode) {
            this.effect.setSize(w, h)
        }

        this.renderer.setSize(w, h)
        this.cssRenderer.setSize(w, h)
    }

    _update(t) {
        requestAnimationFrame(this.update)

        this.render()
        this.loop(t * .01)
    }

    render() {
        if (Config.debug) {
            this.camera.fov = this.cameraParams.fov
            this.camera.position.set(this.cameraParams.x, this.cameraParams.y, this.cameraParams.z)
            this.camera.updateProjectionMatrix()
        }
        this.lightHelper && this.lightHelper.update();

        if(this.vrMode) {
            this.effect.render(this.scene, this.camera)
        } else {
            this.composer ? (this.composer.render()) : this.renderer.render(this.scene, this.camera)
        }
        
        this.cssRenderer.render(this.cssScene, this.camera)

        this.stats&&this.stats.update()
        this.controls.update()
    }

    loop() {
        //extended
    }
}
export default Scene