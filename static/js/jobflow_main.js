var _svg = null;

$(document).ready(function(){
    _svg = new SvgElm("#svg1");
    var box1 = new SPBox([50,50], [100, 100], "テスト１");
    var box2 = new SPBox([250,270], [300, 300], "t");
    var box3 = new SPBox([310,200], [350, 250], "box3");

    var arw1 = new SPArrow(
        box1,box2
    );
    var arw2 = new SPArrow(
        box3,box2
    );

    _svg.append(box1);
    _svg.append(box2);
    _svg.append(box3);
    _svg.append(arw1);
    _svg.append(arw2);
    
    draggable("#"+box1.getId());
    draggable("#"+box2.getId());
    draggable("#"+box3.getId());
});

// SP要素にドラッグする機能を追加
var _drag = {
    isMouseDown: false,
    target: "",     // 要素のid
    offsetx: 0,     // ウィンドウ全体中のドラッグ要素の座標
    offsety: 0
};
$(document).mouseup(function(){
    _drag.isMouseDown = false;
    _drag.target = "";
});
$(document).mousemove(function(e){
    if( !_drag.isMouseDown ) return;
    if( _drag.target.length==0 ) return;
    if( !_svg ) return;

    // idからSPG要素を取得
    // _drag.targetは#が付いているので、１文字削除
    var spg = _svg.getSPG(_drag.target.slice(1));

    // オリジナルの位置
    var bb = spg.getBBox();
    
    var x = e.clientX - _drag.offsetx - bb.x;
    /*
    console.log('mousemove');
    console.log(e.clientX);
    console.log(_drag.offsetx);
    console.log(x);
    */
    var y = e.clientY - _drag.offsety - bb.y;
    $(_drag.target).attr(
        'transform', 'translate('+x+','+y+')'
    );
    // 移動
    spg.onMove([x,y]);
});
function draggable(selector){
    var elm = $(selector);
    elm.mousedown(function(e){
        e.preventDefault();
        var rect = elm[0].getBBox();
        // すでにtranslateがかかっている場合はその値をrectへ反映させる
        var transform = elm.attr('transform');
        if( typeof transform !== 'undefined' && transform !== false){
            // transformあり
            var m = transform.match(/translate\((\-?[0-9]+),(\-?[0-9]+)\)/)
            if(m){
                rect.x += m[1] - 0;
                rect.y += m[2] - 0;
            }
        }

        _drag.offsetx = e.clientX - rect.x;
        _drag.offsety = e.clientY - rect.y;
        _drag.isMouseDown = true;
        _drag.target = selector;
        /*　
        console.log('mousedown');
        console.log(e.clientX); // window内の位置
        console.log(rect.x);    // SVG内の位置
        console.log(_drag.offsetx);
        */
        return false;
    });
}

