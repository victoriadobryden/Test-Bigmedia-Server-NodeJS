const express = require('express')
const {PhotosPresent} = require('../models')
const config = require('../config')
const {asyncMW} = require('../utils/async')

const router = express.Router()

router.get('/:faceId', asyncMW(async (req, res) => {
    let {faceId} = req.params;
    //console.warn(faceId)
    faceId = parseInt(faceId);
    // console.warn(faceId)
    const data = await PhotosPresent.findOne({ attributes: ['sideId','path','city','address','cathegory','supplier_sn','sizetype','sidetype'], where : { faceId } })
    if(!data) return;
    let html=getPresentHtml(data);
    res.send(html)
}))
// router.get('/:sideNumber', asyncMW(async (req, res) => {
//   console.warn(req.params)
//     const {sideNumber} = req.params
//     console.warn('----------->',sideNumber)
//     // const data = await PhotosPresent.findOne({ attributes: ['sideId','path','city','address','cathegory','supplier_sn','sizetype','sidetype'], where : { sideId } })
//     // if(!data) return;
//     // res.send(getPresentHtml(data))
// }))

function getPresentHtml(data) {
    let html=`<!doctype html>
<html>
<head>
<meta charset="UTF-8"/>
${getPresentHtmlHead(data)}
${getPresentHtmlBoby(data)}
</html>
`
    return html;
} 
function getPresentHtmlHead(data) {
    let head =
`
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>BMA Present ${data.supplier_sn}</title>

${getPresntJavaScript(data)}
${getPresentCss()}
</head>`        
    return head
} 
function getPresentHtmlBoby(data){
    let body =
`
<body>
${getPresentHtmlBobyDispaly(data)}
${getPresentHtmlBobyPrint(data)}
</body>
`
    return body;
} 
function getPresentHtmlBobyDispaly(data){
    let sidetype = (data.sidetype==='Призмавижн') ? 'Призмавіжн' : data.sidetype
    let dispaly =
`
<div align="center" id="blank" class="no_print">
<table width="750px" border="0" cellspacing="0" cellpadding="0">
<tr>
<td width="105" rowspan="4" align="center" valign="top"><div style="margin-top:300px;"></div></td>
<td width="320" colspan="2"><div class="text_blank_table"> ${data.supplier_sn}. ${data.city}<br />
  ${data.address}<br />
Розмір: ${data.sizetype} Кат: ${data.cathegory} Тип поверхні: ${sidetype}</div></td>

<td width="220" align="right" valign="middle"><a href="javascript:this.print()"><img src="/resources/print_over.gif" alt="print page" width="38" height="25" border="0" id="Print" onmouseover="MM_swapImage('Print','','/resources/print_on.gif',1)" onmouseout="MM_swapImgRestore()" /></a></td>
<td width="105" rowspan="4" align="center" valign="top"><div style="margin-top:300px;"></div></td>
</tr>

<tr>
<td width="540" height="360" colspan="3">
<div class="images_big" style="display: grid; place-items: center;">
<img src="/photohub/getphoto/${data.sideId}" name="bigImg" style="max-width:540px;max-height:360px;"/>
</div></td>
</tr>
<tr>
<td width="160" align="left" valign="middle"><div class="images_small"><img name="photo" src="/photohub/getphoto/${data.sideId}" width="150" onmouseover="bigImg.src=photo.src;" onclick="bigImg.src=photo.src;"/></div></td>
<td width="160" align="left" valign="middle"><div class="images_small"><img name="schema" src="/photohub/getschema/${data.sideId}" width="150" onmouseover="bigImg.src=schema.src;" onclick="bigImg.src=schema.src;"/></div></td>

<td width="220" rowspan="2">&nbsp;</td>
</tr>

<tr>
    <td width="320" height="50" colspan="2" align="left" valign="middle"><div class="text_blank_table"></div></td>
</tr>
</table>
</div>
`
    return dispaly
}
function getPresentHtmlBobyPrint(data){
    let sidetype = (data.sidetype==='Призмавижн') ? 'Призмавіжн' : data.sidetype
    let print=
`
<div align="center" id="logo" class="no_display">
  <table width="540px" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td class="line" align="left" valign="middle"><div class="tab_logo"><img src="/resources/logotipe_bm.png" alt="logo" width="150" /></div></td>
    </tr>
  </table>
</div>
<div align="center" id="blank_page" class="no_display">
<table width="540px" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td align="left" valign="middle" width="70%"><div class="tab_body">${data.supplier_sn}. ${data.city}<br /><br />
    ${data.address}<br />
    Розмір: ${data.sizetype} Кат: ${data.cathegory} Тип поверхні: ${sidetype}</div></td>
  </tr>
  <tr>
    <td align="center" valign="middle"><div class="tab_body"><img align="left" src="/photohub/getphoto/${data.sideId}" width="540" /></div></td>
  </tr>
  <tr>
    <td align="center" valign="middle"><div class="tab_body"><img src="/photohub/getschema/${data.sideId}" width="540" alt="shema" /></div></td>
  </tr>
  <tr>
    <td align="left" valign="middle"><div class="tab_body"></div></td>
  </tr>
</table>
</div>
`
    return print;
}

function getPresentCss(){
    let bmcss = 
`
<link href="/resources/present.css" rel="stylesheet" type="text/css">
<link href="/resources/print.css" rel="stylesheet" media="print" type="text/css">
<link href="/resources/display.css" rel="stylesheet" media="screen" type="text/css">
<link rel="icon" href="/resources/bma.png" type="image/x-icon"/>
<link rel="shortcut icon" href="/resources/bma.png" type="image/x-icon"/>
<STYLE type="text/css">
<!--
.cal_cury{ 
	background-color:#FFFFCC;
	text-align:center;
	font-size: 18px;
}
.cal_nexty{
	background-color:#DDDDDD;
	text-align:center;
	font-size: 18px;
}
.cal_free{
	color:#00FF00;
	text-align:center;
	font-size: 18px;
}
.cal_notfree{
	color: #CC0000;
	text-align:center;
	font-size: 18px;
}
.cal_tab{
	border: none;
	font-size: 18px;
}
-->
</STYLE>
`
    return bmcss;
}

function getPresntJavaScript(data){
    let jsData =
`
<script type="text/javascript">
<!--

var curidphoto=0;

function ShowPrintVersion(sid){
 SidePrnWindow=window.open("/photohub/detside/${data.sideId}","SidePrnWindow","menubar,resizable,toolbar,titlebar,scrollbars,height=450,width=700");
 SidePrnWindow.focus();
}

function ShowSideInfo(url){
 window.document.location=url;
}

function showDetPhoto(){
 bb_photo=window.open("/photohub/detside/${data.sideId}","bb_photo","statusbar,menubar,WIDTH=640,HEIGHT=480");
 bb_photo.focus();
}
function MM_swapImgRestore() { //v3.0
    var i,x,a=document.MM_sr; for(i=0;a&&i<a.length&&(x=a[i])&&x.oSrc;i++) x.src=x.oSrc;
}
function MM_findObj(n, d) { //v4.01
    var p,i,x;  if(!d) d=document; if((p=n.indexOf("?"))>0&&parent.frames.length) {
      d=parent.frames[n.substring(p+1)].document; n=n.substring(0,p);}
    if(!(x=d[n])&&d.all) x=d.all[n]; for (i=0;!x&&i<d.forms.length;i++) x=d.forms[i][n];
    for(i=0;!x&&d.layers&&i<d.layers.length;i++) x=MM_findObj(n,d.layers[i].document);
    if(!x && d.getElementById) x=d.getElementById(n); return x;
}  
function MM_swapImage() { //v3.0
    var i,j=0,x,a=MM_swapImage.arguments; document.MM_sr=new Array; for(i=0;i<(a.length-2);i+=3)
     if ((x=MM_findObj(a[i]))!=null){document.MM_sr[j++]=x; if(!x.oSrc) x.oSrc=x.src; x.src=a[i+2];}
  }
</script>
`
    return jsData
}
async function imageUrlToBase64(url) {
    try {
      const response = await fetch(url);
      const blob = await response.arrayBuffer();
      const contentType = response.headers.get('content-type');
      const base64String = `data:${contentType};base64,${Buffer.from(
        blob,
      ).toString('base64')}`;
      return base64String;
    } catch (err) {
      console.warn(err);
    }
}

module.exports = router