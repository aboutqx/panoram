/**
 * Event Emitter
 */

class Emitter {
  static emit (event, data, bubbling = true, cancelable = true) {
    let e

    if (window.CustomEvent && !window.isIE) {
      e = new CustomEvent(event, { bubbles: bubbling, cancelable: cancelable, detail: data })
    } else {
      e = document.createEvent('CustomEvent')
      e.initCustomEvent(event, bubbling, cancelable, data)
    }

    window.dispatchEvent(e)
  }

  static on (event, callback) {
    window.addEventListener(event, callback)
  }
}

export default Emitter
