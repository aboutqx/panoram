import Emitter from "libs/emitter"
import Dialog from './DialogCss3D'

let hotSpots = 
[{
    position: [],
    dialogSize: [250, 350],
    backOffset: [28, -70],
    event: {
        inverted: true,
        dept: 'image',
        src: ''
    }
},
{
    position: [],
    dialogSize: [250, 350],
    backOffset: [28, -70],
    event: {
        inverted: true,
        dept: 'pano',
        src: '1'
    }
}]


export default class HotSpots extends THREE.Object3D {
    meshes = []
    doms = []
    spotId = 0
    size = '64px'
    constructor(mainScene) {
        super()
        this.mainScene = mainScene

        this.dialog = new Dialog(this.mainScene)
    }
    
    
    //params : { pos,mediaLink }
    addHotSpots(params) {
        let prevSpots = document.querySelectorAll('.hotspot')
        for(let i=0; i<prevSpots.length; i++){
            document.body.removeChild(prevSpots[i])
        }

        this.setSpotsInfo(params)

        hotSpots.map((v) => {
            let obj = new THREE.Object3D()
            obj.position.set(-v.position[0]*2, v.position[1]*2, v.position[2]*2)
            this.meshes.push(obj)
            obj.info = v

            let dom = this.hotSpotDom(obj)
            document.body.appendChild(dom)
            this.doms.push(dom)
        })
    }

    setSpotsInfo(params){

        params.map((v, i) => {

            hotSpots[i].position = params[i].pos
            hotSpots[i].event.src = params[i].media
            hotSpots[i].dialogSize = params[i].dialogSize

        })
        
    }

    convertTo2D(obj) {
        let vector = new THREE.Vector3();

        //canvas 手机上渲染宽高是宽高的2倍
        let widthHalf = 0.5 * this.mainScene.renderer.context.canvas.clientWidth;
        let heightHalf = 0.5 * this.mainScene.renderer.context.canvas.clientHeight;

        obj.updateMatrixWorld();
        vector.setFromMatrixPosition(obj.matrixWorld) // get matrix in world
        vector.project(this.mainScene.camera) // convert to ndc vector

        vector.x = (vector.x * widthHalf) + widthHalf;
        vector.y = -(vector.y * heightHalf) + heightHalf;

        if(vector.z>1) vector=new THREE.Vector3(100000,100000,10000)
        return {
            x: vector.x,
            y: vector.y
        }
    }

    hotSpotDom(obj) {
        let div = document.createElement('div')
        div.id = `hotspot-${++this.spotId}`

        let {
            x,
            y
        } = this.convertTo2D(obj)

        div.classList.add('hotspot')
        div.classList.add('clickable')
        div.style = `width:${this.size};height:${this.size};
                    transform:translate(${x}px,${y}px);`
        div.innerHTML = ''
        
        div.addEventListener('click', (e) => {
            e.stopPropagation()
            this.showDialog(obj, div.id)
        })

        return div
    }

    showDialog(obj, id) {

        this.dialog.show({
            w: obj.info.dialogSize[0],
            h: obj.info.dialogSize[1],
            pos: obj.position,
            event: obj.info.event,
            backOffset: obj.info.backOffset,
            hotspotId: id
        })
    }

    update() {
        this.meshes.map((v, i) => {
            let {
                x,
                y
            } = this.convertTo2D(v)
            this.doms[i].style.transform = `translate(${x-32}px,${y-32}px)`
        })
        Emitter.on('hideDialogs', () => {
            this.dialog.hide()
        })

    }
}