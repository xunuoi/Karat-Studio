/**
 * ToxicController
 * 2015-11-10 04:11:19
 * 
 * @description :: Server-side logic for managing homes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

import {queryHot} from './QueryController'


function detectDevice(req){
    var ua = req.headers['user-agent'],
    $ = {};

    if (/mobile/i.test(ua))
        $.Mobile = true;

    if (/like Mac OS X/.test(ua)) {
        $.iOS = /CPU( iPhone)? OS ([0-9\._]+) like Mac OS X/.exec(ua)[2].replace(/_/g, '.');
        $.iPhone = /iPhone/.test(ua);
        $.iPad = /iPad/.test(ua);
    }

    if (/Android/.test(ua))
        $.Android = /Android ([0-9\.]+)[\);]/.exec(ua)[1];

    if (/webOS\//.test(ua))
        $.webOS = /webOS\/([0-9\.]+)[\);]/.exec(ua)[1];

    if (/(Intel|PPC) Mac OS X/.test(ua))
        $.Mac = /(Intel|PPC) Mac OS X ?([0-9\._]*)[\)\;]/.exec(ua)[2].replace(/_/g, '.') || true;

    if (/Windows NT/.test(ua))
        $.Windows = /Windows NT ([0-9\._]+)[\);]/.exec(ua)[1];

    return $
}

export default {
    index (req, res, next, page=1){
        //test for aa redirect
        /*var device = detectDevice(req);
        if(device.iPhone) {
            return res.redirect('https://itunes.apple.com/us/app/app-annie/id660004961');
        }
        if(device.Android) {
            return res.redirect('market://details?id=com.appannie.app')
        }

        if(device.Amazon) {
            return res.redirect('amzn://apps/android?p=com.appannie.app')
        }*/


        (async function() {

            try {
                let data = {}
                let hotArticleList = await queryHot()

                data['hotArticleList'] = hotArticleList
                res.auto('toxic/toxic', data)
                

            }catch(e){
                console.log(e)
                return res.serverError(e)
            } 

        })()
    },


    page (req, res, next){
        // console.log(req.params)

        let page = parseInt(req.params['id'])

        this.index(req, res, next, page)
    }
}

