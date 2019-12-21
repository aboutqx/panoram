export function isType(name, type) {
    let allowedExtension
    if (type === 'img') allowedExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp']
    else if (type === 'video') allowedExtension = ['mp4', 'webm', 'ogg']
    else return false
    let isValidFile
    let t = name.split('.').pop().toLowerCase()
    for (let index in allowedExtension) {
        if (t === allowedExtension[index]) {
            isValidFile = true
            break
        }
    }
    return isValidFile
}
export const isMobile = (() =>{
    return /iPhone|Andorid|ipad|ipod/i.test(navigator.userAgent)
})()

