"use strict";

var express = require('express');

var _require = require('../models'),
    PhotosPresent = _require.PhotosPresent;

var config = require('../config');

var _require2 = require('../utils/async'),
    asyncMW = _require2.asyncMW;

var router = express.Router();
router.get('/:faceId', asyncMW(function _callee(req, res) {
  var faceId, data, html;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          faceId = req.params.faceId; // console.warn(faceId)

          _context.next = 3;
          return regeneratorRuntime.awrap(PhotosPresent.findOne({
            attributes: ['sideId', 'path', 'city', 'address', 'cathegory', 'supplier_sn', 'sizetype', 'sidetype'],
            where: {
              faceId: faceId
            }
          }));

        case 3:
          data = _context.sent;

          if (data) {
            _context.next = 6;
            break;
          }

          return _context.abrupt("return");

        case 6:
          html = getPresentHtml(data);
          res.send(html);

        case 8:
        case "end":
          return _context.stop();
      }
    }
  });
})); // router.get('/:sideNumber', asyncMW(async (req, res) => {
//   console.warn(req.params)
//     const {sideNumber} = req.params
//     console.warn('----------->',sideNumber)
//     // const data = await PhotosPresent.findOne({ attributes: ['sideId','path','city','address','cathegory','supplier_sn','sizetype','sidetype'], where : { sideId } })
//     // if(!data) return;
//     // res.send(getPresentHtml(data))
// }))

function getPresentHtml(data) {
  var html = "<!doctype html>\n<html>\n<head>\n<meta charset=\"UTF-8\"/>\n".concat(getPresentHtmlHead(data), "\n").concat(getPresentHtmlBoby(data), "\n</html>\n");
  return html;
}

function getPresentHtmlHead(data) {
  var head = "\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\n<title>BMA Present ".concat(data.supplier_sn, "</title>\n\n").concat(getPresntJavaScript(data), "\n").concat(getPresentCss(), "\n</head>");
  return head;
}

function getPresentHtmlBoby(data) {
  var body = "\n<body>\n".concat(getPresentHtmlBobyDispaly(data), "\n").concat(getPresentHtmlBobyPrint(data), "\n</body>\n");
  return body;
}

function getPresentHtmlBobyDispaly(data) {
  var sidetype = data.sidetype === 'Призмавижн' ? 'Призмавіжн' : data.sidetype;
  var dispaly = "\n<div align=\"center\" id=\"blank\" class=\"no_print\">\n<table width=\"750px\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\n<tr>\n<td width=\"105\" rowspan=\"4\" align=\"center\" valign=\"top\"><div style=\"margin-top:300px;\"></div></td>\n<td width=\"320\" colspan=\"2\"><div class=\"text_blank_table\"> ".concat(data.supplier_sn, ". ").concat(data.city, "<br />\n  ").concat(data.address, "<br />\n\u0420\u043E\u0437\u043C\u0456\u0440: ").concat(data.sizetype, " \u041A\u0430\u0442: ").concat(data.cathegory, " \u0422\u0438\u043F \u043F\u043E\u0432\u0435\u0440\u0445\u043D\u0456: ").concat(sidetype, "</div></td>\n\n<td width=\"220\" align=\"right\" valign=\"middle\"><a href=\"javascript:this.print()\"><img src=\"/resources/print_over.gif\" alt=\"print page\" width=\"38\" height=\"25\" border=\"0\" id=\"Print\" onmouseover=\"MM_swapImage('Print','','/resources/print_on.gif',1)\" onmouseout=\"MM_swapImgRestore()\" /></a></td>\n<td width=\"105\" rowspan=\"4\" align=\"center\" valign=\"top\"><div style=\"margin-top:300px;\"></div></td>\n</tr>\n\n<tr>\n<td width=\"540\" colspan=\"3\"><div class=\"images_big\"><img src=\"/photohub/getphoto/").concat(data.sideId, "\" name=\"bigImg\" width=\"540\" height=\"360\" /></div></td>\n</tr>\n<tr>\n<td width=\"160\" align=\"left\" valign=\"middle\"><div class=\"images_small\"><img name=\"photo\" src=\"/photohub/getphoto/").concat(data.sideId, "\" width=\"150\" onmouseover=\"bigImg.src=photo.src;\" onclick=\"bigImg.src=photo.src;\"/></div></td>\n<td width=\"160\" align=\"left\" valign=\"middle\"><div class=\"images_small\"><img name=\"schema\" src=\"/photohub/getschema/").concat(data.sideId, "\" width=\"150\" onmouseover=\"bigImg.src=schema.src;\" onclick=\"bigImg.src=schema.src;\"/></div></td>\n\n<td width=\"220\" rowspan=\"2\">&nbsp;</td>\n</tr>\n\n<tr>\n    <td width=\"320\" height=\"50\" colspan=\"2\" align=\"left\" valign=\"middle\"><div class=\"text_blank_table\"></div></td>\n</tr>\n</table>\n</div>\n");
  return dispaly;
}

function getPresentHtmlBobyPrint(data) {
  var sidetype = data.sidetype === 'Призмавижн' ? 'Призмавіжн' : data.sidetype;
  var print = "\n<div align=\"center\" id=\"logo\" class=\"no_display\">\n  <table width=\"540px\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\n    <tr>\n      <td class=\"line\" align=\"left\" valign=\"middle\"><div class=\"tab_logo\"><img src=\"/resources/logotipe_bm.png\" alt=\"logo\" width=\"150\" /></div></td>\n    </tr>\n  </table>\n</div>\n<div align=\"center\" id=\"blank_page\" class=\"no_display\">\n<table width=\"540px\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\n  <tr>\n    <td align=\"left\" valign=\"middle\" width=\"70%\"><div class=\"tab_body\">".concat(data.supplier_sn, ". ").concat(data.city, "<br /><br />\n    ").concat(data.address, "<br />\n    \u0420\u043E\u0437\u043C\u0456\u0440: ").concat(data.sizetype, " \u041A\u0430\u0442: ").concat(data.cathegory, " \u0422\u0438\u043F \u043F\u043E\u0432\u0435\u0440\u0445\u043D\u0456: ").concat(sidetype, "</div></td>\n  </tr>\n  <tr>\n    <td align=\"center\" valign=\"middle\"><div class=\"tab_body\"><img align=\"left\" src=\"/photohub/getphoto/").concat(data.sideId, "\" width=\"540\" /></div></td>\n  </tr>\n  <tr>\n    <td align=\"center\" valign=\"middle\"><div class=\"tab_body\"><img src=\"/photohub/getschema/").concat(data.sideId, "\" width=\"540\" alt=\"shema\" /></div></td>\n  </tr>\n  <tr>\n    <td align=\"left\" valign=\"middle\"><div class=\"tab_body\"></div></td>\n  </tr>\n</table>\n</div>\n");
  return print;
}

function getPresentCss() {
  var bmcss = "\n<link href=\"/resources/present.css\" rel=\"stylesheet\" type=\"text/css\">\n<link href=\"/resources/print.css\" rel=\"stylesheet\" media=\"print\" type=\"text/css\">\n<link href=\"/resources/display.css\" rel=\"stylesheet\" media=\"screen\" type=\"text/css\">\n<link rel=\"icon\" href=\"/resources/bma.png\" type=\"image/x-icon\"/>\n<link rel=\"shortcut icon\" href=\"/resources/bma.png\" type=\"image/x-icon\"/>\n<STYLE type=\"text/css\">\n<!--\n.cal_cury{ \n\tbackground-color:#FFFFCC;\n\ttext-align:center;\n\tfont-size: 18px;\n}\n.cal_nexty{\n\tbackground-color:#DDDDDD;\n\ttext-align:center;\n\tfont-size: 18px;\n}\n.cal_free{\n\tcolor:#00FF00;\n\ttext-align:center;\n\tfont-size: 18px;\n}\n.cal_notfree{\n\tcolor: #CC0000;\n\ttext-align:center;\n\tfont-size: 18px;\n}\n.cal_tab{\n\tborder: none;\n\tfont-size: 18px;\n}\n-->\n</STYLE>\n";
  return bmcss;
}

function getPresntJavaScript(data) {
  var jsData = "\n<script type=\"text/javascript\">\n<!--\n\nvar curidphoto=0;\n\nfunction ShowPrintVersion(sid){\n SidePrnWindow=window.open(\"/photohub/detside/".concat(data.sideId, "\",\"SidePrnWindow\",\"menubar,resizable,toolbar,titlebar,scrollbars,height=450,width=700\");\n SidePrnWindow.focus();\n}\n\nfunction ShowSideInfo(url){\n window.document.location=url;\n}\n\nfunction showDetPhoto(){\n bb_photo=window.open(\"/photohub/detside/").concat(data.sideId, "\",\"bb_photo\",\"statusbar,menubar,WIDTH=640,HEIGHT=480\");\n bb_photo.focus();\n}\nfunction MM_swapImgRestore() { //v3.0\n    var i,x,a=document.MM_sr; for(i=0;a&&i<a.length&&(x=a[i])&&x.oSrc;i++) x.src=x.oSrc;\n}\nfunction MM_findObj(n, d) { //v4.01\n    var p,i,x;  if(!d) d=document; if((p=n.indexOf(\"?\"))>0&&parent.frames.length) {\n      d=parent.frames[n.substring(p+1)].document; n=n.substring(0,p);}\n    if(!(x=d[n])&&d.all) x=d.all[n]; for (i=0;!x&&i<d.forms.length;i++) x=d.forms[i][n];\n    for(i=0;!x&&d.layers&&i<d.layers.length;i++) x=MM_findObj(n,d.layers[i].document);\n    if(!x && d.getElementById) x=d.getElementById(n); return x;\n}  \nfunction MM_swapImage() { //v3.0\n    var i,j=0,x,a=MM_swapImage.arguments; document.MM_sr=new Array; for(i=0;i<(a.length-2);i+=3)\n     if ((x=MM_findObj(a[i]))!=null){document.MM_sr[j++]=x; if(!x.oSrc) x.oSrc=x.src; x.src=a[i+2];}\n  }\n</script>\n");
  return jsData;
}

function imageUrlToBase64(url) {
  var response, blob, contentType, base64String;
  return regeneratorRuntime.async(function imageUrlToBase64$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(fetch(url));

        case 3:
          response = _context2.sent;
          _context2.next = 6;
          return regeneratorRuntime.awrap(response.arrayBuffer());

        case 6:
          blob = _context2.sent;
          contentType = response.headers.get('content-type');
          base64String = "data:".concat(contentType, ";base64,").concat(Buffer.from(blob).toString('base64'));
          return _context2.abrupt("return", base64String);

        case 12:
          _context2.prev = 12;
          _context2.t0 = _context2["catch"](0);
          console.warn(_context2.t0);

        case 15:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 12]]);
}

module.exports = router;