import axios from 'axios'
import Emitter from 'libs/emitter'
const baseURI = './img/%folder%/%dir%.jpg'
const dirs = ["l", "r", "u", "d", "b", "f"]

let imgData = [
    {img:0,end:90,frames:[{media:'./img/lake.jpg',pos:'-130,20,200',dialogSize: [250, 350]}]},
    {img:1,end:20,frames:[{media:'./img/beijiaer.jpg',pos:'100,40,200',dialogSize: [250, 20]}]}
]
let _currentScene

export function getPanoParams(userId) {

    Emitter.emit('soundPlay', 'sound')

}


export function updateTextures(index, dir = 'next') {

    if (dir === 'prev') {
        index--
        if (!imgData[index].img) index = imgData.length - 1
    } else {
        index++
        if (!imgData[index]) index = 0
    }

    let returnArr = []
    returnArr = dirs.map((v) => {
        let str = baseURI.replace('%dir%', 'pano_'+v).replace('%folder%', index)
        return str
    })
    let radius = imgData.map((v) => {
        return v.end / 360 * Math.PI * 2
    })
    let hotSpots = (() =>
        imgData[index].frames.map((hotspot) =>{
            let data = {
                media: hotspot.media,
                pos: hotspot.pos.replace('(', '').replace(')', '').split(','),
                dialogSize: hotspot.dialogSize
            }
            return data
        })
        
    )()

    _currentScene = {
        urls: returnArr,
        index,
        radius: radius,
        hotSpots: hotSpots
    }

    return _currentScene
}
export function currentScene () {
    return _currentScene
}
export function textureCount() { return imgData.length }