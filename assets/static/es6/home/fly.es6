/*
 * HOME BANNER SVG ANIMATION
 */

function start (){
    const pathColor = 'transparent'
    const animationTime = 6000
    const airImg = '/static/img/home/air.png'

    const paper = Snap('#banner_svg')

    let myPathB = paper
    .path('M880,32C376-4.2,80,42,44,191')
    .attr({
        id: 'squiggle',
        fill: 'none',
        strokeWidth: '4',
        stroke: pathColor,
        strokeMiterLimit: '10',
        strokeDasharray: '9 9',
        strokeDashOffset: '988.01'
    })

    let lenB = myPathB.getTotalLength()

    myPathB.attr({
        stroke: pathColor,
        strokeWidth: 4,
        fill: 'none',
        'stroke-dasharray': lenB + ' ' + lenB,
        'stroke-dashoffset': -lenB
    })
    .animate({
        'stroke-dashoffset': 10
    }, animationTime, mina.easeoutinout);
    
    //创建点
    /*let CircleB = paper.circle(16, 16, 8);
    CircleB.attr({
        fill: '#3f4445',
        stroke: '#fff',
        strokeWidth: 2
    })*/
    let plane = paper.image(airImg, 0, 0, 50, 44)

    
    Snap.animate(lenB, 0, (value) => {
        let movePoint = myPathB.getPointAtLength(value)

        plane.attr({
            'x': movePoint.x,
            'y': movePoint.y
        })
 
    }, animationTime, mina.easeinout)
    

}

export { start }




/*var snapA = Snap('#svgA');
var myPathA = snapA.path('M62.9 14.9c-25-7.74-56.6 4.8-60.4 24.3-3.73 19.6 21.6 35 39.6 37.6 42.8 6.2 72.9-53.4 116-58.9 65-18.2 191 101 215 28.8 5-16.7-7-49.1-34-44-34 11.5-31 46.5-14 69.3 9.38 12.6 24.2 20.6 39.8 22.9 91.4 9.05 102-98.9 176-86.7 18.8 3.81 33 17.3 36.7 34.6 2.01 10.2.124 21.1-5.18 30.1').attr({
    id: 'squiggle',
    fill: 'none',
    strokeWidth: '4',
    stroke: '#ffffff',
    strokeMiterLimit: '10',
    strokeDasharray: '9 9',
    strokeDashOffset: '988.01'
});
var len = myPathA.getTotalLength();
myPathA.attr({
    stroke: '#fff',
    strokeWidth: 4,
    fill: 'none',
    'stroke-dasharray': '12 6',
    'stroke-dashoffset': len
}).animate({
    'stroke-dashoffset': 10
}, 2500, mina.easeinout);
var CircleA = snapA.circle(32, 32, 16);
CircleA.attr({
    fill: '#3f4445',
    stroke: '#fff',
    strokeWidth: 2
});
setTimeout(function() {
    Snap.animate(0, len, function(value) {
        movePoint = myPathA.getPointAtLength(value);
        CircleA.attr({
            cx: movePoint.x,
            cy: movePoint.y
        });
    }, 2500, mina.easeinout);
});*/



/*
var snapC = Snap('#svgC');
var myPathC = snapC.path('M62.9 14.9c-25-7.74-56.6 4.8-60.4 24.3-3.73 19.6 21.6 35 39.6 37.6 42.8 6.2 72.9-53.4 116-58.9 65-18.2 191 101 215 28.8 5-16.7-7-49.1-34-44-34 11.5-31 46.5-14 69.3 9.38 12.6 24.2 20.6 39.8 22.9 91.4 9.05 102-98.9 176-86.7 18.8 3.81 33 17.3 36.7 34.6 2.01 10.2.124 21.1-5.18 30.1').attr({
    id: 'squiggle',
    fill: 'none',
    strokeWidth: '4',
    stroke: '#ffffff',
    strokeMiterLimit: '10',
    strokeDasharray: '9 9',
    strokeDashOffset: '988.01'
});
var lenC = myPathC.getTotalLength();
myPathC.attr({
    stroke: '#fff',
    strokeWidth: 4,
    fill: 'none',
    'stroke-dasharray': '12 6',
    'stroke-dashoffset': '180'
}).animate({
    'stroke-dashoffset': 10
}, 4500, mina.easeinout);
var Triangle = snapC.polyline('0,30 15,0 30,30');
Triangle.attr({
    id: 'plane',
    fill: '#fff'
});
var triangleGroup = snapC.g(Triangle);
setTimeout(function() {
    Snap.animate(0, lenC, function(value) {
        movePoint = myPathC.getPointAtLength(value);
        triangleGroup.transform('t' + parseInt(movePoint.x - 15) + ',' + parseInt(movePoint.y - 15) + 'r' + (movePoint.alpha - 90));
    }, 4500, mina.easeinout);
});
*/