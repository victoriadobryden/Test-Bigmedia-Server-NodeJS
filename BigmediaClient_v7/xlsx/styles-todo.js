let styleSheet = {
  numFmts: [],
  fonts: [],
  fills: [],
  borders: [],
  cellStyleXfs: [], // named style
  cellXfs: [] // array of defined styles, can be used by index
};

function compare2Objects (x, y) {
  var p;

  // remember that NaN === NaN returns false
  // and isNaN(undefined) returns true
  if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
       return true;
  }

  // Compare primitives and functions.
  // Check if both arguments link to the same object.
  // Especially useful on step when comparing prototypes
  if (x === y) {
      return true;
  }

  // Works in case when functions are created in constructor.
  // Comparing dates is a common scenario. Another built-ins?
  // We can even handle functions passed across iframes
  if ((typeof x === 'function' && typeof y === 'function') ||
     (x instanceof Date && y instanceof Date) ||
     (x instanceof RegExp && y instanceof RegExp) ||
     (x instanceof String && y instanceof String) ||
     (x instanceof Number && y instanceof Number)) {
      return x.toString() === y.toString();
  }

  // At last checking prototypes as good a we can
  if (!(x instanceof Object && y instanceof Object)) {
      return false;
  }

  if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
      return false;
  }

  if (x.constructor !== y.constructor) {
      return false;
  }

  if (x.prototype !== y.prototype) {
      return false;
  }

  // Check for infinitive linking loops
  if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
       return false;
  }

  // Quick checking of one object beeing a subset of another.
  // todo: cache the structure of arguments[0] for performance
  for (p in y) {
      if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
          return false;
      }
      else if (typeof y[p] !== typeof x[p]) {
          return false;
      }
  }

  for (p in x) {
      if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
          return false;
      }
      else if (typeof y[p] !== typeof x[p]) {
          return false;
      }

      switch (typeof (x[p])) {
          case 'object':
          case 'function':

              leftChain.push(x);
              rightChain.push(y);

              if (!compare2Objects (x[p], y[p])) {
                  return false;
              }

              leftChain.pop();
              rightChain.pop();
              break;

          default:
              if (x[p] !== y[p]) {
                  return false;
              }
              break;
      }
  }

  return true;
}

function addCellStyle(cellStyle){
  let newStyle = Object.keys(cellStyle).reduce(function(style, key){
    if ( key !== 'alignment' ){
      let ix;
      let globStyles = styleSheet[key + 's'].filter(function(item){
        return compare2Objects(item, cellStyle[key]);
      });
      if (globStyles.length > 0){
        ix = styleSheet[key + 's'].indexOf(globStyles[0]) + 1;
      } else {
        styleSheet[key + 's'].push(cellStyle[key]);
        ix = styleSheet[key + 's'].length;
      }
      style[key] = ix;
    } else {
      style[key] = Object.keys(cellStyle[key]).reduce(function(obj, item){ obj[item] = return obj;}, {});
    }
    return style;
  }, {});
  styleSheet.cellXfs.push(newStyle);
  return styleSheet.cellXfs.length - 1;
}

function getCellStyle(cellStyle){
  /*
    cellStyle = {
      numFmt: {}, // numFmtId: <unique_FmtId>, formatCode: “$ #,##0.00;$ #,##0.00;-“
      font: {}, // b, i, u, sz: {val: <font_size>}, color: {theme: <theme_id>}, name: {val: <font_name>}, family: {val: <font_family_id>}, scheme: {val: minor}
      fill: {}, // patternFill: {patternType: <"none" || "gray125">}
      border: {}, // left, right, top, bottom, diagonal
      alignment: {} // horizontal: "center" || "left" || "right"
    }
  */
  let filtered = Object.keys(cellStyle).reduce(function(xfsArray,cellStyleKey){
    return xfsArray.filter(function(item, ix, arr){
      if ( cellStyleKey !== 'alignment' ){
        return compare2Objects(styleSheet[cellStyleKey+'s'][item[cellStyleKey]], cellStyle[cellStyleKey]);
      } else {
        return compare2Objects(item[cellStyleKey], cellStyle[cellStyleKey]);
      }
      // return ( item[cellStyleKey] != undefined && compare2Objects(item[cellStyleKey], cellStyle[cellStyleKey]) );
    });
  },styleSheet.cellXfs);
  if (filtered.length > 0) {
    return styleSheet.cellXfs.indexOf(filtered[0]);
  } else {
    return addCellStyle(cellStyle);
  }
}
