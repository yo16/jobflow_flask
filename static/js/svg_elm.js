/*
 svg関連クラス
 2019/3/13 y.ikeda
 */
// クラス継承用の関数
var inherits = function(childCtor, parentCtor) {
    Object.setPrototypeOf(childCtor.prototype, parentCtor.prototype);
};


// ---------------------
// SvgElm class
// SVG要素そのもの
// ---------------------
var SvgElm = function(svgSelector){
    this.svg = document.querySelector(svgSelector);
    // SvgPartsGroupの配列
    this.SPGs = {};
};
SvgElm.prototype.append = function(partGroup){
    // g要素をsvg要素へ追加
    this.svg.appendChild(partGroup.getElement());
    // 連想配列へ追加
    this.SPGs[partGroup.getId()] = partGroup;
};
SvgElm.prototype.getSPG = function(id){
    if(this.SPGs[id]){
        return this.SPGs[id];
    }
    return null;
};


// ---------------------
// SvgPartsGroup class
// SvgPartをまとめるクラス
// ---------------------
var _svg_grp_id = 0;
var SvgPartsGroup = function(){
    this.svgParts = [];

    this.lineColor = "#666";
    this.lineWidth = "2";
    this.fillColor = "#fff";

    this.elmGrp = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.id = "SvgPartsGroup"+(_svg_grp_id++);
    this.elmGrp.setAttribute("id", this.id);
};
// g要素を返す
SvgPartsGroup.prototype.getElement = function(){
    return this.elmGrp;
};
// g要素内のSvgPartインスタンス配列を返す
SvgPartsGroup.prototype.getParts = function(){
    return this.svgParts;
};
// g要素全体のBBoxを返す
SvgPartsGroup.prototype.getBBox = function(){
    return this.elmGrp.getBBox();
};
// 子要素を追加する
SvgPartsGroup.prototype.append = function(svgPart){
    // メンバ変数の配列へ追加
    this.svgParts.push(svgPart);
    // g要素にも追加
    this.elmGrp.appendChild(svgPart.getElement());
};
// グループ内の子要素のIDを返す
// partsNoがどのthis.svgPartsに対応するかは、
// このクラスを継承するクラスで決定する
SvgPartsGroup.prototype.getElmId = function(){
    return null;
};
// グループのIDを返す
SvgPartsGroup.prototype.getId = function(partsNo=0){
    return this.id;
};
// 移動時の動作
// 詳細はこのクラスを継承するクラスで決める
// posは左上の[x,y]
SvgPartsGroup.prototype.onMove = function(pos){
    return null;
};


// ---------------------
// SvgPart class
// SVG内を構成する１つ１つの部品要素の抽象クラス
// ---------------------
var _svg_part_id = 0;
var SvgPart = function(name, params, text=""){    
    // SVG内の要素を定義する
    this.elm = document.createElementNS("http://www.w3.org/2000/svg", name);
    for(key in params){
        // 属性
        this.elm.setAttribute(key, params[key]);
    }
    // テキスト
    this.elm.textContent = text;
    // ID
    this.id = "SvgPart" + (_svg_part_id++);
    this.elm.setAttribute("id", this.id);
};
// 要素を返す
SvgPart.prototype.getElement = function(){
    return this.elm;
};
// 属性に対応する値を返す
SvgPart.prototype.getValue = function(attr_name){
    if( this.elm.hasAttribute(attr_name) ){
        return this.elm.getAttribute(attr_name);
    }
    return null;
};
// 属性と値を設定する
SvgPart.prototype.setValue = function(attr_name, attr_value){
    this.elm.setAttribute(attr_name, attr_value);
};
// BBoxを返す
SvgPart.prototype.getBBox = function(){
    return this.elm.getBBox();
};


