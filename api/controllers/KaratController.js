/**
 * KaratController
 * 2015-09-02 02:09:11
 * 
 * @description :: Server-side logic for managing homes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

import {join, resolve} from 'path'
import {unlinkSync} from 'fs'
import SkipperDisk  from 'skipper-disk'
import  {getTag} from './TagController'

import gm from 'gm'
import sh from 'shelljs'

import * as util from './util'

import {queried} from './QueryController'


let upload_dir = resolve(sails.config.appPath, '.tmp/uploads')
let upload_path = join(upload_dir, 'img')

let thumb_img_dir = join(upload_path, 'thumb')
let mid_img_dir = join(upload_path, 'mid')
let large_img_dir = join(upload_path, 'large')


class KaratManage {

    constructor (){
        
    }

    //blue print
    _config: {
        actions: true,
        shortcuts: false,
        rest: false
    }


    /**
     * !!!important
     * deploy project ,update 
     */
    
    deploy(req, res, next) {
        res.json({
            'state': 'progressing'
        })

        sh.cd(sails.config.appPath)
        sh.exec('gulp deploy &')
    }   


    /**
     * Karat Index Page
     * ======================
     */
    
    index (req, res, next) {
         res.render('karat/karat')
    }


    /**
     * USER LOGIN AND OUT ================
     */

    logout(req, res, next) {
        delete req.user
        req.session.authenticated = false
        return res.send('Logout succeed!')
    }


    login(req, res, next) {

        return res.render('karat/loginView')
    }


    loginCheck(req, res, next) {
        var _user = req.body

        User.findOne(_user)
        .exec((err, u) => {
            //if user/pwd error ,u == undefined
            if(err || !u) return res.json({
                'state': 'failed'
            })
            
            //else go on...
            req.session.authenticated = true
            req.session.user = u
            // console.log(u)

            return res.json({
                'state': 'succeed',
                'redirect': req.session.originalUrl
            })

        })

    }

    
    /**
     * GM DRAW Verify Code IMAGES
     */
    
    verification (req, res, next){
        let vstr = util.guid().substring(0, 4)
        req.session.verification = vstr

        let ary = util.captcha(()=>{
            return vstr
        }).get()
        // console.log(ary[0])//字符串
        res.write(ary[1]) //
        res.end()

    }


    /**
     * GALLERY parse img src
     */
    
    collectImage(content){

        let imgSrcList = content.match(/src=(?:['"])(.*?\.(css|js|html|tpl|jpg||png||gif||jpeg||svg|eot|woff|tff))(?:['"])/gmi) || []

        let rsList = []

        for (let item of imgSrcList){
            
            let ritem = item.replace(/^src=["']/, '').replace(/['"]$/, '')

            rsList.push(ritem)
            // console.log(ritem)
        }

        return rsList
    }


    /**
     * Delete gallery/article images
     * Sync delete...
     */
    
    deleteImgFile(aid, cb){
        Article.findOne({'id': aid})
        .exec((err, a) => {
            if(err) {
                cb ? cb(err) : '';
                return false;
            }
            //@debug
            //may be the gallery is deleted
            //delete all files
            if(a && a.img.length){
               let imgList = a.img.concat(a.mid, a.thumb, a.raw)
                try {
                    imgList.forEach((v, i)=>{
                        unlinkSync(join(upload_dir, v))
                    })
                    console.log('IMG file deleted succeed!')
                    cb ? cb() : ''
                    
                }catch(err){
                    cb ? cb(err) : '';
                }
                
            }else {
                console.log('This Article already deleted! ')
                cb ? cb() : ''
            }

        })

    }


    /** 
     * Remove Gallery
     */

    removeGallery (article_id) {
        // console.log(article_id);
        Gallery.destroy({'article_id': article_id})
        .exec((err, rs) => {
            if(err) throw Error(err)

            console.log(`Remove Gallery Succeed: ${article_id}`)
        })

    }


    /**
     * Update gallery
     */

    updateGallery (article){
        // let imgList = this.collectImage(article['content'])
        let imgList = article.img || []
        //删除gallery
        if(!imgList.length) return this.removeGallery(article['id'])

        Gallery.find({'article_id': article['id']})
        .exec((err, rs) => {
            if(err) throw Error(err)

            if(rs.length){
                Gallery.update({
                    'article_id': article['id']
                }, {
                    'title': article['title'],
                    'author': article['author'],
                    'article_type': article['type'],
                    'description': 'Article description',
                    'img': imgList,
                    'thumb': article.thumb,
                    'mid': article.mid,
                    'raw': article.raw,
                    'enable': article['en_gallery']
                },
                // { 'upsert': true }: not valid in sails ORM
                ).exec((err, rs) => {
                    if(err) throw Error(err)

                    console.log(`Update Gallery: ${rs['title']}`)
                })
            }else {

                //如果没查到，并且启用了gallery, 那么创建新的Gallery
                article.en_gallery ? this.createGallery(article) : 'not create gallery'
            }
        })
    
    }


    /**
     * Create gallery by article
     */

    createGallery (article) {
        // let imgList = this.collectImage(article['content'])
        let imgList = article.img

        Gallery.create({
            'title': article['title'],
            'article_id': article['id'],
            'author': article['author'],
            'description': 'Article description',
            'enable': article['en_gallery'],
            'img': imgList,
            'thumb': article.thumb,
            'mid': article.mid,
            'raw': article.raw
        }).exec((err, rs) => {
            if(err) throw Error(err)

        })

    }


    /**
     * Add the url of multi size img src to data
     */
    
    splitGallery(articleObj){
        
        articleObj.img ?
            (articleObj.thumb = [],
            articleObj.mid = [],
            articleObj.raw = [],
            articleObj.img.forEach((v, i) => {
                /**
                 * Use /img/large as default img path
                 *img/large/c6b09ff1-f9fd-43bb-989e-b156dc354324.jpg
                 */
                
                articleObj.thumb.push(v.replace(/(\/img\/large\/)/g, '/img/thumb/'))
                articleObj.mid.push(v.replace(/(\/img\/large\/)/g, '/img/mid/'))

                articleObj.raw.push(v.replace(/(\/img\/large\/)/g, '/img/'))

            })) : 
            (articleObj.img = [], articleObj.thumb = [], articleObj.mid = [], articleObj.raw = [])

    }


    /**
     * ARTICLE =====================
     */
    
    article_editor (req, res, next) {
        let article_id = req.param('id')

        let rdata = {
            'article_id': article_id
        };

        // let tags;
        
        (async function() {
            rdata['tag'] = await getTag()
        
            if(article_id){
                Article.findOne({'id': article_id})
                .exec((err, rs) => {
                    if(!err){
                        // console.log(rs)
                        if(!rs) return res.notFound('This article not found')

                        rdata['article'] = rs
                        //有的文章没有tag
                        if(!rdata['article']['tag']) rdata['article']['tag'] = []

                        res.render('karat/create_article', rdata)
                    }else {
                        throw Error(err)
                        res.negotiate(err)
                    }
                })
                
            }else {

                res.render('karat/create_article', rdata)
            }

        })()
        
    }


    article_list (req, res, next, page=1){
        /*Article.find()
        .sort({'createdAt': -1})
        .exec((err, rs) => {
            if(err) throw Error(err)

            let articleList = rs
            // console.log(articleList)

            res.render('karat/article_list', {
                'articleList': articleList
            })
        })*/
        return queried(page, Article, {}, data => {
            res.auto('karat/article_list', data)
        }, true)
    }

    article_page (req, res, next){
        // console.log(req.params)

        let page = parseInt(req.params['id'])

        return this.article_list(req, res, next, page)
    }


    article_delete (req, res, next){
        let aid = req.param('id')

        //delete files
        this.deleteImgFile(aid, (err) => {
            if(err) console.log('Delete File Error: \n', err)

            //async delete gallery
            this.removeGallery(aid)

            Article.destroy({'id': aid})
            .exec((err, rs) => {
                if(!err) {

                    return res.json({
                        'state': 'succeed'
                    })
                }else {
                    return res.json({
                        'state': 'failed',
                        'mes': err.toString()
                    })
                }
            })

        })

    }


    /**
     * Update article 
     */
    article_update (req, res, next) {

        //if not POST, then 404
        if(req.method != 'POST') return res.notFound()

        let articleObj = req.body
        let aid = articleObj['article_id']

        console.log(`article id: ${aid}`)

        //split gallery, make the articleObj
        this.splitGallery(articleObj)
        

        if(!aid){
            
            console.log(`Create new Article: ${articleObj.title}`)

            Article.create(articleObj)
            .exec((err, a) => {
                if(err) res.json({
                    'state': 'failed',
                    'mes': 'create new article'
                })

                articleObj.en_gallery ? this.createGallery(a) : 'not create gallery'
                
                res.json({
                    'state': 'succeed'
                })
            })

        }else{
            console.log(`IS UPDATE...${aid}`)
            
            Article.update({'id': aid}, articleObj)
            .exec((err, dataList) => {
                if(err) res.json({
                    'state': 'failed'
                })

                // console.log(dataList)

                this.updateGallery(dataList[0])
                res.json({
                    'state': 'succeed',
                    'mes': 'update a article'
                })

                
            })
        }
        
    }


    /**
     * Read img from .tmp
     */
    
    _disabled_img (req, res, next){
        return false;

        /*let fileAdapter = SkipperDisk()

        let imgName = req.param('id')
        let no_resize = req.param('no_resize')
        let is_thumb = req.param('is_thumb')

        let img_x = req.param('img_x') || 800
        let img_y = req.param('img_y') || 600

        // console.log(img_x, img_y)
        // for gm test =================
        let imgfd = join(upload_path,  )

        let gmer = gm(imgfd)
        if(no_resize != 1) {
            gmer.resize(img_x, img_y)
        }
        if(is_thumb == 1){
            gmer.crop(img_x, img_y, 0, 0)
        }
        // .sepia()
        gmer
        .autoOrient()
        .stream()
        .pipe(res);

        if(imgName){
            let imgfd = join(upload_path, imgName )

            fileAdapter.read(imgfd)
            .on('error', function (err){
                console.log(`Image Maybe lost: ${err.path}`)
                return res.notFound('图片走丢了，或许她从未存在过...');
            })
            .pipe(res)
        }else {
            res.notFound()
        }*/
    }


    /**
     * gm generate multi size img, thumb, mid ,large
     */
    
    gm_multi_size (fd){

        let thumb_path = fd.replace(upload_path, thumb_img_dir)
        let mid_path = fd.replace(upload_path, mid_img_dir)
        let large_path = fd.replace(upload_path, large_img_dir)

        let sizeMap = new Map([
            [thumb_path, [150, 150]],
            [mid_path, [300, 300]],
            [large_path, [1200, 1200]]
        ])

        let pList = []

        for(let [k, v] of sizeMap){

            pList.push(new Promise((resolve, reject)=>{
                // console.log(k)
                
                gm(fd)
                .resize(...v)
                .autoOrient()
                .write(k, (err) =>{
                    if(err) console.log('gm_thumb error: ', err)

                    resolve(k)
                })
            }))

            
        }

        return pList

    }


    /**
     * Upload Imgage from editor
     */
    
    upload (req, res, next) {

        req.file('article_img')
        .upload({
            // don't allow the total upload size to exceed ~20MB
            maxBytes: 20000000,
            dirname: upload_path
        },
        (err, uploadedFiles) => {
            if (err) {
                return res.negotiate(err);
            }

            // If no files were uploaded, respond with an error.
            if (uploadedFiles.length === 0) {
                return res.badRequest('No file was uploaded');
            }

            let file = uploadedFiles[0]

            //默认使用large尺寸的图片作为展示
            let imgUrl = file.fd.replace(upload_path, '/img/large')

            let fileInfo = {
                'imgUrl': imgUrl,
                //file.fd:: file description
                'imgFd': file.fd
            }

            //async generate thumb,mid,large
            //等待所有图片尺寸生成完毕
            let pList = this.gm_multi_size(file.fd)

            Promise.all(pList)
            .then(result=>{
                res.json({
                    'success': true,
                    "msg": "Complete!",
                    "file_path": fileInfo['imgUrl'],
                    "data": fileInfo
                })
            })  

        })
    }

}


const karatManage = new KaratManage()


export default karatManage

