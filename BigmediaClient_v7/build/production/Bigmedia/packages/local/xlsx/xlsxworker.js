importScripts('jszip.js');
importScripts('xlsx.adopted.js');
postMessage({t:"ready"});

onmessage = function (evt) {
  try {
    var wbout = XLSX.write(evt.data.wb, {bookType: 'xlsx', bookSST: false, type: 'array', compression: true});
    postMessage({t:"xlsx", d: wbout});
  } catch(e) {
    postMessage({t:"error", d:e.stack||e});
  }
};
