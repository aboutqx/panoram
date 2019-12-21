import Emitter from "./libs/emitter"

export default class DialogCss3d {
    trans = new THREE.Vector3()
    closeX = document.getElementById('closeX')
    hotspotId

    constructor(mainScene) {
        this.mainScene = mainScene
        this.cssScene = mainScene.cssScene
        
        this.backDom = document.getElementById('hotspot-back')
        this.foreDom = document.createElement('div')
        this.foreDom.setAttribute('id', 'hotpspot-dialog')
        this.fore3D = new THREE.CSS3DObject(this.foreDom)
        this.back3D = new THREE.CSS3DObject(this.backDom)
        Emitter.on('hide', )

        
        this.closeX.addEventListener('click', () => this.hide())
    }

    show(props){
        this.hotspotId = props.hotspotId
        this.setContent(props.event)
        if(props.event.dept=='pano') return

        this.foreDom.style.width = props.w + 'px'
        this.foreDom.style.height = props.h + 'px'

        TweenLite.delayedCall(.1, () => {
            this.foreDom.classList.add("active");
            this.backDom.classList.add("active");
            
            this.backDom.style.width = `${props.w+40}px`
            this.backDom.style.height = `${props.h+140}px`

            document.getElementById(this.hotspotId).style.display = 'none'
        })
        

        let pos = props.pos
        this.fore3D.position.set(pos.x, pos.y, pos.z)
        this.back3D.position.set(pos.x+props.backOffset[0] , pos.y+props.backOffset[1], pos.z)

        this.fore3D.getWorldDirection(this.trans)
        this.back3D.position.addScaledVector(this.trans, 1.3)

        // this.fore3D.scale.x = -1

        this.cssScene.add(this.fore3D)

        if (props.backOffset[0] == props.backOffset[1] && props.backOffset[1] == 0) {
            console.log('no back')
        }
        else this.cssScene.add(this.back3D)

        
    }

    hide() {
        this.foreDom.classList.remove("active");
        this.backDom.classList.remove("active");
        this.backDom.style.width = 0 + "px";
        this.backDom.style.height = 0 + "px";

        if (this.foreDom.contains(this.closeX)) {
            this.foreDom.removeChild(this.closeX)
        }
        
        TweenLite.delayedCall(.5, () => {
            this.cssScene.remove(this.fore3D)
            this.cssScene.remove(this.back3D)
            document.getElementById(this.hotspotId) && (document.getElementById(this.hotspotId).style.display = 'block')
            
        })
    }

    setContent(event) {
        this.foreDom.innerHTML = ''

        let dom
        switch(event.dept){
            case 'video':
                dom = document.createElement('video')
                this.foreDom.appendChild(dom)
                dom.outerHTML = `<video  src=${event.src} autoplay loop></video>`
                break;
            case 'image':
                dom = new Image()
                this.foreDom.appendChild(dom)
                dom.src=event.src
                break;
            case 'pano':
                Emitter.emit('nextPano', event.src)

        }

        if(event.inverted) {
            this.foreDom.classList.add('inverted')
            this.backDom.classList.add('inverted')
        }else {
            this.foreDom.classList.remove('inverted')
            this.backDom.classList.remove('inverted')
        }
        
        
        TweenLite.delayedCall(1, () => {
            this.foreDom.appendChild(this.closeX)
        })
        
    }

}