import {
    updateTextures,
    textureCount
} from './TexturePath'
import load from 'load-asset'
import vshader from './shaders/sky.vert'
import fshader from './shaders/sky.frag'
import Emitter from './libs/emitter'

class ViewSky extends THREE.Object3D {
    sky
    dir = 'next'
    params = {
        wireframe: false
    }
    l = 500.
    currentMaterial

    uniforms = {
        u_time: {
            type: 'f',
            value: 0.2
        },
        u_resolution: {
            type: 'v2',
            value: new THREE.Vector2(window.innerWidth, window.innerHeight)
        },
        strength: {
            type: 'f',
            value: 5.5
        },
        progress: {
            type: 'f',
            value: -1.
        },
        v_progress: {
            type: 'f',
            value: 0.
        }
    }
    changeTexture = false
    textureArr = []
    textureIndex = -1
    scube
    tcube

    constructor(gl) {

        super()

        this.gl = gl
        if(window.gui) {
            let folder = gui.addFolder('wireframe')
            folder.add(this.params, 'wireframe')
            folder.open()
        }
        
    }
    cubeTexture(cubemapImgs) {
        let gl = this.gl
        let cubemapTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);

        for (var i = 0; i < 6; i++) {
            //r,l,u,d,b,f
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cubemapImgs[i])
        }
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

        return cubemapTexture
    }

    async getMaterial() {
        let {
            urls,
            index
        } = updateTextures(this.textureIndex, this.dir)
        let gl = this.gl
        this.textureIndex = index

        let opt = urls.map((v) => {
            return {
                url: v,
                type: 'image',
                crossOrigin: 'Anonymous'
            }
        })
        const images = await load.all(opt)
        // console.log('%c       ', `font-size: 500px; background: url(${images[0].src}) no-repeat;`)   

        let texture = this.cubeTexture(images)

        if (this.textureArr.length === textureCount()) {
            this.textureArr.shift()
        }
        this.textureArr.push(texture)

        gl.activeTexture(gl.TEXTURE0 + 0)
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)
        gl.uniform1i(this.tcube, 0)

        
    }
    async getMesh(type = 'box') {

        if (type !== 'box') {
            let geometry = new THREE.SphereGeometry(l, 64, 32)

            let material = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                map: new THREE.CanvasTexture(getAssets('bg'))
            })

            this.sky = new THREE.Mesh(geometry, material)
            return this.sky
        } else {
            let l = this.l
            let cubeVertices = new Float32Array([
                l, l, -l,
                l, -l, -l,
                l, -l, l,
                l, l, l, 
                -l, -l, l, 
                -l, -l, -l,
                -l, l, -l, 
                -l, l, l
            ])
            let cubeIndices = new Uint32Array([
                0, 1, 3, 3, 1, 2, //r
                7, 4, 6, 6, 4, 5, //l
                0, 6, 3, 6, 7, 3,  //u
                5, 2, 4, 1, 2, 5, //d
                0, 1, 6, 6, 1, 5, //b
                3, 2, 7, 7, 2, 4 //f
            ])

            let geometry = new THREE.BufferGeometry()

            geometry.addAttribute('position', new THREE.BufferAttribute(cubeVertices, 3));
            geometry.setIndex(new THREE.BufferAttribute(cubeIndices, 1));

            let material = new THREE.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader: vshader,
                fragmentShader: fshader,
                side: THREE.DoubleSide,
                transparent: true
            })


            this.currentMaterial = material
            // let geometry = new THREE.BoxGeometry(l,l,l)
            await this.getMaterial()
            this.sky = new THREE.Mesh(geometry, this.currentMaterial)

            requestAnimationFrame(() => {
                this.program = this.sky.material.program.program
                this.scube = this.gl.getUniformLocation(this.program, "scube")
                this.tcube = this.gl.getUniformLocation(this.program, "tcube")
            })


            this.sky.name = 'sky'
            return this.sky
        }
    }

    async updateSky(dir) {
        this.dir = dir
        console.log(dir)

        await this.getMaterial()
        this.changeTexture = true
        this.uniforms.progress.value = 0.

        
        let gl = this.gl
        gl.activeTexture(gl.TEXTURE0 + 1)
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.textureArr[this.textureArr.length - 2])
        gl.uniform1i(this.scube, 1)
    
    }


    render(t) {
        if (this.params.wireframe) {
            this.sky.material = new THREE.MeshBasicMaterial({
                color: 0xF3A2B0,
                wireframe: true
            })
        } else {
            if (this.sky) {
                this.sky.material = this.currentMaterial
                // this.sky.rotation.z += .03
                // this.sky.rotation.x += .03
            }

        }
        this.uniforms.u_time.value = t / 1000
        if (this.changeTexture) {
            this.uniforms.progress.value += .045
            this.uniforms.progress.value = clamp(this.uniforms.progress.value, 0., 1.)
            if (this.uniforms.progress.value === 1.) {
                this.changeTexture = false
                this.uniforms.progress.value = -1.

                //Emitter.emit('startRotate')
            }

        }
    }
}

function clamp(value, min, max) {
    if (value > max) {
        value = max;
    }

    if (value < min) {
        value = min;
    }
    return value
}
export default ViewSky