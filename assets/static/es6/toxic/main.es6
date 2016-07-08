/**
 * ES6 FILE FOR ToxicController 
 * 2015-11-10 04:11:19
 */

// 月工资p/（（ 8+加班时间e+通勤时间t）*工作天数d）


function calIndex(p, e, t, d){
    return p/((8+e*1.1+t*0.9)*d)
}

function result($ctn, num){
    $ctn.html(num)

    document.title = `我工作的性感指数是${num}!`
}

function main (argument) {
    let $c = $('.org.job_sexy_num'),
        
        $per = $c.find('input[name="per"]'),
        $extra = $c.find('input[name="extra"]'),
        $traffic = $c.find('input[name="traffic"]'),
        $day = $c.find('input[name="day"]'),

        $calBtn = $c.find('.cal_btn'),
        $result = $c.find('.result')


    $calBtn.on('click', function(evt){
        let per = parseFloat($per.val()),
            extra = parseFloat($extra.val()),
            traffic = parseFloat($traffic.val()),
            day = parseFloat($day.val())

        if(!per || !day){
            return alert('请填写相关数据')
        }

        let rs = calIndex(per, extra, traffic, day)
        result($result, rs)

        // console.log(per, extra, traffic, day)
    })


}


$(()=>{
    main()
})

