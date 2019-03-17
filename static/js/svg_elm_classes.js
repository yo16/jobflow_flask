// ---------------------
// SPBox class
// ボックスクラス
// ---------------------
var SPBox = function(pos1, pos2, boxText=""){
    SvgPartsGroup.call(this);

    // 角のR
    this.cornerRound = 10;
    // テキストを書く際のパディング
    this.textPadding = 10;

    // ２点(p1とp2)を左上と右下に調整
    this.p1 = [(pos1[0]<pos2[0])?pos1[0]:pos2[0], (pos1[1]<pos2[1])?pos1[1]:pos2[1]];
    this.p2 = [(pos1[0]<pos2[0])?pos2[0]:pos1[0], (pos1[1]<pos2[1])?pos2[1]:pos1[1]];

    // translateの座標
    this.translatePos = [0,0];

    // 幅がcorner_roundの直径を下回った場合、
    // x2を強制的に外に移動させる。(高さも同様)
    if( this.p2[0]-this.p1[0] < this.corner_round*2 ){
        this.p2[0] = this.p1[0] + this.corner_round*2;
    }
    if( this.p2[1]-this.p1[1] < this.corner_round*2 ){
        this.p2[1] = this.p1[1] + this.corner_round*2;
    }

    // onMove時に連動するインスタンス
    this.onMoveInstances = [];

    // 四角を描画
    {
        this.append(
            new SvgPart(
                "path",
                {
                    "d": this.getBoxLine_d(),
                    "stroke": this.lineColor,
                    "stroke-width": this.lineWidth,
                    "fill": this.fillColor
                }
            )
        );
    }

    // 文字を追加
    // イベントはcssで透過させる
    if( boxText.length > 0 ){
        this.setText(boxText);
    }
};
inherits(SPBox, SvgPartsGroup);

// グループ内の要素のIDを返す
SPBox.prototype.getElmId = function(partsNo=0){
    if( partsNo==0 ){
        // 四角形のpath
        return "#" + this.svgParts[0].getId();
    }else if( partsNo==1 ){
        // 文字列のtext
        return "#" + this.svgParts[1].getId();
    }
    return null;
};

SPBox.prototype.getBoxLine_d = function(cornerRound=this.cornerRound){
    var x1 = this.p1[0]; var y1 = this.p1[1];
    var x2 = this.p2[0]; var y2 = this.p2[1];
    var cr = cornerRound;  // 長いから省略

    var pary = [
        "M", (x1+cr), y1,
        "L", (x2-cr), y1,
        "S", x2, y1, x2, (y1+cr),
        "L", x2, (y2-cr),
        "S", x2, y2, (x2-cr), y2,
        "L", (x1+cr), y2,
        "S", x1, y2, x1, (y2-cr),
        "L", x1, (y1+cr),
        "S", x1, y1, (x1+cr), y1
    ];
    return pary.join(" ");
};
SPBox.prototype.setText = function(text, changeBoxSize=true){
    // dummyを作って、サイズを得る
    //var elmText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    var elmText = document.getElementById("txt1");
    elmText.textContent = text;
    var bb = elmText.getBBox();
    var h = bb.height;
    var w = bb.width;

    // テキストを作成
    // イベントはcssで透過させる
    var t1 = new SvgPart(
        "text",
        {
            "x": ((this.p1[0]+(this.p2[0]-this.p1[0])/2) - w/2),
            "y": ((this.p1[1]+(this.p2[1]-this.p1[1])/2) + h/4 + 1),
            "stroke": this.lineColor,
            "style": "pointer-events: none"
        },
        text
    );

    // 箱のサイズを変更する
    if( changeBoxSize ){
        // 幅を再計算
        var new_w = w + this.textPadding*2;
        var cur_w = this.p2[0]-this.p1[0];
        if( cur_w < new_w ){
            this.p1[0] -= (new_w-cur_w)/2;
            this.p2[0] += (new_w-cur_w)/2;
        }
        // pathを変更
        // index:0はbox
        this.svgParts[0].setValue(
            "d",
            this.getBoxLine_d()
        );
    }

    this.append(t1);
};
SPBox.prototype.getTopCenter = function(){
    return [
        this.p1[0]+Math.floor((this.p2[0]-this.p1[0])/2)
            + this.translatePos[0],
        this.p1[1]
            + this.translatePos[1]
    ];
};
SPBox.prototype.getBottomCenter = function(){
    return [
        this.p1[0]+Math.floor((this.p2[0]-this.p1[0])/2)
            + this.translatePos[0],
        this.p2[1]
            + this.translatePos[1]
    ];
};
SPBox.prototype.addOnMoveInstance = function(ins){
    if( ins == null ) return;
    this.onMoveInstances.push(ins);
}
SPBox.prototype.onMove = function(pos){
    // translate値を移動する
    this.translatePos[0] = pos[0];
    this.translatePos[1] = pos[1];
    // 子instanceを移動する
    for( var i=0; i<this.onMoveInstances.length;i++ ){
        this.onMoveInstances[i].onMove(pos);;
    }
    return null;
};



// ---------------------
// SPArrow class
// 矢印クラス
// ---------------------
var SPArrow = function(box1, box2){
    SvgPartsGroup.call(this);

    // p1が始点、p2が終点
    this.p1 = [0,0];
    this.p2 = [0,0];
    // コントロールポイントを設定
    this.c1 = [0,0];
    this.c2 = [0,0];
    // 接続するBOX
    this.box1 = box1 ? box1 : null;   // from
    this.box2 = box2 ? box2 : null;   // to
    // boxに合わせてp1とp2を変更
    this.AdjustToBoxPos();

    // boxのonMove通知インスタンスに自分を追加
    this.box1.addOnMoveInstance(this);
    this.box2.addOnMoveInstance(this);

    this.top_length = 20;    // 三角形の長さ
    this.top_arg = 30;       // 三角形の角度

// ３次ベジエ曲線
    {
        this.append(
            new SvgPart(
                "path",
                {
                    "d": this.getConnectorLine_d(),
                    "stroke": this.lineColor,
                    "stroke-width": this.lineWidth,
                    "fill": "transparent"
                }
            )
        );
    }

    // 開始位置の円
    {
        var c1_r = 5;  // 円の半径

        this.append(
            new SvgPart(
                "circle",
                {
                    "cx": this.p1[0],
                    "cy": this.p1[1],
                    "r": c1_r,
                    "stroke": this.lineColor,
                    "stroke-width": this.lineWidth,
                    "fill": this.fillColor
                }
            )
        );
    }

    // 終了位置の矢先
    {
        this.append(
            new SvgPart(
                "path",
                {
                    "d": this.get_allow_top_line_d(),
                    "stroke": this.lineColor,
                    "stroke-width": this.lineWidth,
                    "fill": this.fillColor
                }
            )
        );
    }
};
inherits(SPArrow, SvgPartsGroup);

// グループ内の要素のIDを返す
SPArrow.prototype.getElmId = function(partsNo=0){
    if( partsNo==0 ){
        // 3次ベジエ
        return "#" + this.svgParts[0].getId();
    }else if( partsNo==1 ){
        // 始点の円
        return "#" + this.svgParts[1].getId();
    }else if( partsNo==2 ){
        // 終点の三角
        return "#" + this.svgParts[2].getId();
    }
    return null;
};

// 現在のp1とp2から、制御点を決める
SPArrow.prototype.setControlPoints = function(){
    var x1 = this.p1[0]; var y1 = this.p1[1];
    var x2 = this.p2[0]; var y2 = this.p2[1];

    // 制御点１
    var cx1 = x1;
    var cy1 = y1 + Math.floor((y2-y1)/2);
    // 制御点２
    var cx2 = x1 + Math.floor((x2-x1)/4);
    var cy2 = y1 + Math.floor((y2-y1)/2);

    this.c1[0] = cx1; this.c1[1] = cy1;
    this.c2[0] = cx2; this.c2[1] = cy2;
};

// p1とp2を結ぶ３次ベジエのpathのd値を返す
SPArrow.prototype.getConnectorLine_d = function(){
    var x1 = this.p1[0]; var y1 = this.p1[1];
    var x2 = this.p2[0]; var y2 = this.p2[1];
    var cx1 = this.c1[0]; var cy1 = this.c1[1];
    var cx2 = this.c2[0]; var cy2 = this.c2[1];

    // path.d値
    var pary = [
        "M", x1, y1,
        "C", cx1, cy1, cx2, cy2, x2, y2
    ];
    return pary.join(" ");
};

// p1とp2を結ぶ時の終点の矢先のpathのd値を返す
SPArrow.prototype.get_allow_top_line_d = function(top_length=this.top_length, top_arg=this.top_arg){
    var x1 = this.p1[0]; var y1 = this.p1[1];
    var x2 = this.p2[0]; var y2 = this.p2[1];
    var cx1 = this.c1[0]; var cy1 = this.c1[1];
    var cx2 = this.c2[0]; var cy2 = this.c2[1];

    var v1 = [cx2-x2, cy2-y2];
    var v1_len = Math.sqrt(v1[0]*v1[0]+v1[1]*v1[1]);
    v1[0] = v1[0]*top_length/v1_len;
    v1[1] = v1[1]*top_length/v1_len;
    var top_arg_half = Math.PI*(top_arg/2)/180;   // 回転角度(左右に半分ずつ回す)
    v1_1 = [
        v1[0]*Math.cos(top_arg_half) - v1[1]*Math.sin(top_arg_half),
        v1[0]*Math.sin(top_arg_half) + v1[1]*Math.cos(top_arg_half)
    ];
    top_arg_half *= -1;
    v1_2 = [
        v1[0]*Math.cos(top_arg_half) - v1[1]*Math.sin(top_arg_half),
        v1[0]*Math.sin(top_arg_half) + v1[1]*Math.cos(top_arg_half)
    ];
    v1_1[0] = Math.floor(v1_1[0])+x2;
    v1_1[1] = Math.floor(v1_1[1])+y2;
    v1_2[0] = Math.floor(v1_2[0])+x2;
    v1_2[1] = Math.floor(v1_2[1])+y2;
    pary = [
        "M", x2, y2,
        "L", v1_1[0], v1_1[1],
        "L", v1_2[0], v1_2[1],
        "L", x2, y2
    ];

    return pary.join(" ");
};
// SPBoxを接続する
SPArrow.prototype.ConnectBoxies = function(boxFrom, boxTo){
    if( boxForm != null ){
        this.box1 = boxFrom;
    }
    if( boxTo != null ){
        this.box2 = boxTo;
    }
    // 位置を調整
    this.AdjustToBoxPos();
};
// boxに合わせて位置を調整
SPArrow.prototype.AdjustToBoxPos = function(){
    if( this.box1 ){
        var pos = this.box1.getBottomCenter();
        this.p1[0] = pos[0];
        this.p1[1] = pos[1];
    }
    if( this.box2 ){
        var pos = this.box2.getTopCenter();
        this.p2[0] = pos[0];
        this.p2[1] = pos[1];
    }
    // p1とp2に合わせてコントロールポイントを変更
    this.setControlPoints();
};
//　移動時
SPArrow.prototype.onMove = function(pos){
    // メンバ変数を変更
    this.AdjustToBoxPos();

    // DOM要素を変更
    // ３次ベジエ
    {
        var b = this.svgParts[0];
        b.setValue(
            "d",
            this.getConnectorLine_d()
        );
    }
    // 始点の円
    {
        var c = this.svgParts[1];
        c.setValue("cx",this.p1[0]);
        c.setValue("cy",this.p1[1]);
    }
    // 終点の三角
    {
        var t = this.svgParts[2];
        t.setValue(
            "d",
            this.get_allow_top_line_d()
        );
    }
};
