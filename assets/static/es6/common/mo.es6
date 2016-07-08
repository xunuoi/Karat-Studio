/**
 * FOR MAOV 
 * jQuery is necessary
 * @author  Cloud
 */

// import * as util from 'mo.util'
import * as pjax from 'mo.pjax'
import {preload} from 'mo.source'
import * as util from 'mo.util'
import formatter from 'mo.formatter'


let _export = {
    'go': pjax.go,
    'define': pjax.define,
    'state': pjax.state,
    'touch': pjax.touch,
    'config': pjax.config,
    'preload': preload,
    'util': util,
    'formatter': formatter
}

window.MO = _export

export default _export

