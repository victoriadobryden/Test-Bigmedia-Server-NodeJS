Ext.define('Bigmedia.GridExport', {
    singleton: true,
    exportToExcel: function (grid, filename, cb, exportOccupancy, optExportPois) {
        function generateArray(table) {
            var out = [];
            var rows = table.querySelectorAll('tr');
            var ranges = [];
            for (var R = 0; R < rows.length; ++R) {
                var outRow = [];
                var row = rows[R];
                var columns = row.querySelectorAll('td');
                for (var C = 0; C < columns.length; ++C) {
                    var cell = columns[C];
                    var colspan = cell.getAttribute('colspan');
                    var rowspan = cell.getAttribute('rowspan');
                    var cellValue = cell.innerText;
                    if (cellValue !== "" && cellValue == +cellValue) cellValue = +cellValue;

                    //Skip ranges
                    ranges.forEach(function (range) {
                        if (R >= range.s.r && R <= range.e.r && outRow.length >= range.s.c && outRow.length <= range.e.c) {
                            for (var i = 0; i <= range.e.c - range.s.c; ++i) outRow.push(null);
                        }
                    });

                    //Handle Row Span
                    if (rowspan || colspan) {
                        rowspan = rowspan || 1;
                        colspan = colspan || 1;
                        ranges.push({
                            s: { r: R, c: outRow.length },
                            e: { r: R + rowspan - 1, c: outRow.length + colspan - 1 }
                        });
                    }
                    ;

                    //Handle Value
                    outRow.push(cellValue !== "" ? cellValue : null);

                    //Handle Colspan
                    if (colspan) for (var k = 0; k < colspan - 1; ++k) outRow.push(null);
                }
                out.push(outRow);
            }
            return [out, ranges];
        };

        function datenum(v, date1904) {
            if (date1904) v += 1462;
            var epoch = Date.parse(v);
            return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
        }

        // function decode_row(rowstr) { return parseInt(unfix_row(rowstr),10) - 1; }
        function encode_row(row) { return "" + (row + 1); }
        // function fix_row(cstr) { return cstr.replace(/([A-Z]|^)(\d+)$/,"$1$$$2"); }
        // function unfix_row(cstr) { return cstr.replace(/\$(\d+)$/,"$1"); }
        //
        // function decode_col(colstr) { var c = unfix_col(colstr), d = 0, i = 0; for(; i !== c.length; ++i) d = 26*d + c.charCodeAt(i) - 64; return d - 1; }
        function encode_col(col) { if (col < 0) throw new Error("invalid column " + col); var s = ""; for (++col; col; col = Math.floor((col - 1) / 26)) s = String.fromCharCode(((col - 1) % 26) + 65) + s; return s; }
        // function fix_col(cstr) { return cstr.replace(/^([A-Z])/,"$$$1"); }
        // function unfix_col(cstr) { return cstr.replace(/^\$([A-Z])/,"$1"); }
        //
        // function split_cell(cstr) { return cstr.replace(/(\$?[A-Z]*)(\$?\d*)/,"$1,$2").split(","); }
        // function decode_cell(cstr) { var splt = split_cell(cstr); return { c:decode_col(splt[0]), r:decode_row(splt[1]) }; }
        function encode_cell(cell) { return encode_col(cell.c) + encode_row(cell.r); }
        // function decode_range(range) { var x =range.split(":").map(decode_cell); return {s:x[0],e:x[x.length-1]}; }
        function encode_range(cs, ce) {
            if (typeof ce === 'undefined' || typeof ce === 'number') {
                return encode_range(cs.s, cs.e);
            }
            if (typeof cs !== 'string') {
                cs = encode_cell((cs));
            }
            if (typeof ce !== 'string') {
                ce = encode_cell((ce));
            }
            return cs == ce ? cs : cs + ":" + ce;
        }

        function sheet_from_array_of_arrays(data, opts) {
            var ws = {}, cols = [];
            var range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
            for (var R = 0; R != data.length; ++R) {
                for (var C = 0; C != data[R].length; ++C) {
                    if (range.s.r > R) range.s.r = R;
                    if (range.s.c > C) range.s.c = C;
                    if (range.e.r < R) range.e.r = R;
                    if (range.e.c < C) range.e.c = C;
                    var cell = { v: data[R][C] };
                    if (cell.v == null) continue;
                    // var cell_ref = XLSX.utils.encode_cell({c: C, r: R});
                    var cell_ref = encode_cell({ c: C, r: R });

                    if (typeof cell.v === 'number') cell.t = 'n';
                    else if (typeof cell.v === 'boolean') cell.t = 'b';
                    else if (cell.v instanceof Date) {
                        cell.t = 'n';
                        // cell.z = XLSX.SSF._table[14];
                        cell.z = 'm/d/yy';
                        cell.v = datenum(cell.v);
                    }
                    else if (cell.v && cell.v.url) {
                        cell.l = { Target: cell.v.url, Tooltip: cell.v };
                    }
                    else cell.t = 's';
                    //cell.v = 'some text';
                    //cell.l = {Target: 'http://www.bigmedia.ua/', tooltip: 'Bigmedia link'};
                    if (opts.numIndex !== undefined) {
                        if ((R >= opts.headerRows) && (R < opts.headerRows + opts.rowCount) && ((opts.addressIndex !== undefined && opts.addressIndex === C) || (opts.addressIndex === undefined && opts.numIndex === C))) {
                            var sn = Math.floor(data[R][opts.numIndex]);
                            cell.l = { Target: 'http://www.bigmedia.ua/cgi/detside.pl?sn=' + sn, Tooltip: 'Photo&amp;Schema' };
                        }
                    }
                    // Header style
                    if (R == 0 || (opts.headerRows !== undefined && opts.headerRows > R)) {
                        cell.s = "2";
                    }
                    // Occupancy style
                    if ((R >= opts.headerRows) && (R < opts.headerRows + opts.rowCount) && (opts.occIndex !== undefined && C >= opts.occIndex && C < opts.occIndex + opts.monsCount)) {
                        cell.s = "3";
                    }
                    if (cols[C] === undefined) {
                        cols[C] = {};
                    }
                    if (cell.v.length > 0 && (cols[C].wch === undefined || cols[C].wch < cell.v.length)) {
                        cols[C].wch = cell.v.length;
                        cols[C].bestFit = true;
                    }
                    ws[cell_ref] = cell;
                }
            }
            cols.forEach(function (col) {
                if (col.wch && col.wch > 100) {
                    col.wch = 100;
                    col.bestFit = false;
                }
            });
            // if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
            if (range.s.c < 10000000) ws['!ref'] = encode_range(range);
            if (opts.addressIndex !== undefined) {
                ws['!cols'] = cols;
            }
            return ws;
        }

        function Workbook() {
            if (!(this instanceof Workbook)) return new Workbook();
            this.SheetNames = [];
            this.Sheets = {};
        }

        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }

        function sheet_from_array_of_cells(data) {
            var ws = {}, cols = [];
            var range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
            for (var R = 0; R != data.length; ++R) {
                for (var C = 0; C != data[R].length; ++C) {
                    if (range.s.r > R) range.s.r = R;
                    if (range.s.c > C) range.s.c = C;
                    if (range.e.r < R) range.e.r = R;
                    if (range.e.c < C) range.e.c = C;
                    var cell = data[R][C];
                    if (!cell || cell.v == null) continue;
                    // var cell_ref = XLSX.utils.encode_cell({c: C, r: R});
                    var cell_ref = encode_cell({ c: C, r: R });
                    if (cols[C] === undefined) {
                        cols[C] = {};
                    }
                    if (cell.v.length > 0 && (cols[C].wch === undefined || cols[C].wch < cell.v.length)) {
                        cols[C].wch = cell.v.length;
                        cols[C].bestFit = true;
                    }
                    ws[cell_ref] = cell;
                }
            }
            cols.forEach(function (col) {
                if (col.wch && col.wch > 100) {
                    col.wch = 100;
                    col.bestFit = false;
                }
            });
            if (range.s.c < 10000000) {
                // ws['!ref'] = XLSX.utils.encode_range(range);
                ws['!ref'] = encode_range(range);
            }
            ws['!cols'] = cols;
            return ws;
        }

        var gridCols = grid.getColumns(),
            data = [], cols = [], export_occ = false, header1 = [], header2 = [], occ_index, i = 0, mons,
            numIndex, addressIndex, force_occ, cells = [], occCells = [];
        gridCols.forEach(function (col) {
            if (col.isVisible() && col.text !== '&#160;' && !col.ignoreExport) {
                // console.log(col);
                cols.push(col);
            }
        });
        var exportPois = (grid.getMapView && grid.getMapView() && (grid.getMapView().getMap().filterFaces.getActive() || !!optExportPois) && grid.getMapView().getMap().poiLayer.getSource().getFeatures().length > 0);
        // console.log([grid.getMapView(), optExportPois, grid.getMapView().getMap().poiLayer.getSource().getFeatures().length]);
        var maxMonthCount = 0, mons = [];
        if (grid.getSelectionModel().getCount() > 0) {
            grid.getSelection().forEach(function (rec) {
                if (rec.get('parsedOccupancy') && maxMonthCount < rec.get('parsedOccupancy').length) {
                    mons = rec.get('parsedOccupancy');
                    maxMonthCount = rec.get('parsedOccupancy').length;
                }
            });
        } else {
            grid.getStore().each(function (rec) {
                if (rec.get('parsedOccupancy') && maxMonthCount < rec.get('parsedOccupancy').length) {
                    mons = rec.get('parsedOccupancy');
                    maxMonthCount = rec.get('parsedOccupancy').length;
                }
            });
        }
        function validURL(str) {
            var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
                '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
                '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
                '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
            return !!pattern.test(str);
        }
        var statuses = {};
        var isFaceBeforePoi = function (face, poi) {
            var angle = face.get('angle'),
                fCoords = ol.proj.toLonLat(face.get('geometry').getCoordinates()),
                pCoords = ol.proj.toLonLat(poi.get('origObj').get('centroid').getCoordinates()),
                azimuth = turf.bearingToAzimuth(turf.bearing(fCoords, pCoords));
            return (angle >= 0 && angle <= 90 &&
                azimuth >= (90 - angle) &&
                azimuth <= (270 - angle)
            ) ||
                (
                    angle > 90 && angle < 270 &&
                    (
                        azimuth >= (450 - angle) ||
                        azimuth <= (270 - angle)
                    )
                ) ||
                (
                    angle >= 270 && angle <= 360 &&
                    azimuth <= (630 - angle) &&
                    azimuth >= (450 - angle)
                );
        }
        function getRecordCells(rec) {
            var line = [];
            cols.forEach(function (col) {
                var cell = {};
                if (col.xtype === 'datecolumn') {
                    cell.v = Ext.Date.format(rec.get(col.dataIndex), col.format);
                }
                else if (col.dataIndex) {
                    cell.v = rec.get(col.dataIndex);
                } else {
                    cell.v = null;
                }
                if (typeof cell.v === 'number') cell.t = 'n';
                else if (typeof cell.v === 'boolean') cell.t = 'b';
                else if (cell.v instanceof Date) {
                    cell.t = 'n';
                    // cell.z = XLSX.SSF._table[14];
                    cell.z = 'm/d/yy';
                    cell.v = datenum(cell.v);
                }
                else {
                    cell.t = 's';
                }
                if (col.dataIndex && col.dataIndex.match(/address/i) && rec.get('supplier') &&
                    (
                        rec.get('supplier').match(/bigmedia/i)
                        || rec.get('supplier').match(/ртм-україна/i)
                        || rec.get('supplier').match(/РТМ-Украина/i)
                    )) {
                    var sn;
                    // if (rec.sides && rec.sides().getCount() > 0) {
                    //     sn = rec.sides().first().get('num');
                    // console.log(rec);
                    if (rec.sides && rec.sides.length > 0) {
                        sn = rec.sides[0].num;
                    } else if (rec.get('supplierNo')) {
                        sn = rec.get('supplierNo');
                    }
                    var faceId = rec.get('faceId') || rec.get('id_face') || rec.getId();
                    if (sn) {
                        // cell.l = {Target: 'http://www.bigmedia.ua/cgi/detside.pl?sn=' + sn, Tooltip: 'Photo&amp;Schema'};
                        cell.l = { Target: 'https://bma.bigmedia.ua/photohub/detface/' + faceId, Tooltip: 'Photo&amp;Schema' };
                    }
                }
                line.push(cell)
            });
            // Add Photo and Schema columns
            var faceId = rec.get('faceId') || rec.get('id_face') || rec.getId();
            if (rec.get('supplier') && rec.get('supplier').match(/bigmedia/i)) {
                var sn;
                // if (rec.sides && rec.sides().getCount() > 0) {
                //     sn = rec.sides().first().get('num');
                if (rec.sides && rec.sides.length > 0) {
                    sn = rec.sides[0].num;
                } else if (rec.get('supplierNo')) {
                    sn = rec.get('supplierNo');
                }
                if (sn) {
                    line.push({ v: Bigmedia.Locales.exportExcelPhotoText, s: "1", f: 'HYPERLINK("https://bma.bigmedia.ua/photohub/face/' + faceId + '", "' + Bigmedia.Locales.exportExcelPhotoText + '")' });
                    // line.push({v: Bigmedia.Locales.exportExcelSchemaText, s: "1", f: 'HYPERLINK("http://www.bigmedia.ua/cgi/getschema.pl?sn=' + sn + '", "' + Bigmedia.Locales.exportExcelSchemaText + '")'});
                    line.push({ v: Bigmedia.Locales.exportExcelSchemaText, s: "1", f: 'HYPERLINK("https://bma.bigmedia.ua/photohub/schema/' + faceId + '", "' + Bigmedia.Locales.exportExcelSchemaText + '")' });
                    // line.push({v: Bigmedia.Locales.exportExcelPhotoText,
                    //     l: {
                    //         Target: 'http://www.bigmedia.ua/cgi/getphoto_.pl?sn='+sn,
                    //         Tooltip: Bigmedia.Locales.exportExcelPhotoText}});
                    // line.push({v: Bigmedia.Locales.exportExcelSchemaText,
                    //     l: {
                    //         Target: 'http://www.bigmedia.ua/cgi/getschema.pl?sn='+sn,
                    //         Tooltip: Bigmedia.Locales.exportExcelSchemaText}});
                } else {
                    line.push({ v: null });
                    line.push({ v: null });
                }
            } else if (rec.get('urlPhoto') && validURL(rec.get('urlPhoto'))) {
                line.push({ v: Bigmedia.Locales.exportExcelPhotoText, s: "1", f: 'HYPERLINK("https://bma.bigmedia.ua/photohub/face/' + faceId + '", "' + Bigmedia.Locales.exportExcelPhotoText + '")' });
                // line.push({v: Bigmedia.Locales.exportExcelPhotoText, s: "1", f: 'HYPERLINK("' + rec.get('urlPhoto') + '", "' + Bigmedia.Locales.exportExcelPhotoText + '")'});
                if (rec.get('urlSchema') && validURL(rec.get('urlSchema'))) {
                    line.push({ v: Bigmedia.Locales.exportExcelSchemaText, s: "1", f: 'HYPERLINK("' + rec.get('urlSchema') + '", "' + Bigmedia.Locales.exportExcelSchemaText + '")' });
                } else {
                    line.push({ v: null });
                }
            } else if (rec.get('doorsNo') || rec.get('doors_no')) {
                var doorsNo = rec.get('doorsNo') || rec.get('doors_no');
                line.push({ v: Bigmedia.Locales.exportExcelPhotoText, s: "1", f: 'HYPERLINK("https://bma.bigmedia.ua/photohub/doors/' + doorsNo + '", "' + Bigmedia.Locales.exportExcelPhotoText + '")' });
                line.push({ v: null });
            } else {
                line.push({ v: null });
                line.push({ v: null });
            }
            // Add POI columns
            if (exportPois) {
                var closest, closestPoint;
                var distanceKm;
                // if (rec.get('geometry').getType() !== 'LineString') {
                closest = grid.getMapView().getMap().poiLayer.getSource().getClosestFeatureToCoordinate(
                    rec.get('geometry').getCoordinates(),
                    // filter Function (feature)
                    function (poi) {
                        return poi.getGeometry().getType() === 'Point' && (!grid.getMapView().getMap().getBeforePoi() || isFaceBeforePoi(rec, poi))
                    }
                );
                if (closest) {
                    distanceKm = turf.distance(ol.proj.toLonLat(rec.get('geometry').getCoordinates()), ol.proj.toLonLat(closest.get('geometry').getCoordinates()), { units: 'kilometers' });
                    closestPoint = closest.get('geometry');
                }
                // console.log([closest, distanceKm, grid.getMapView().getMap().poiLayer.getSource().getFeatures().length]);
                grid.getMapView().getMap().poiLayer.getSource().getFeatures().forEach(function (poi) {
                    // console.log(poi.getGeometry().getType());
                    if (poi.getGeometry().getType() === 'LineString') {
                        var turfLine = Bigmedia.Vars.convertOlToTurf(poi.getGeometry()),
                            turfPoint = Bigmedia.Vars.convertOlToTurf(rec.get('geometry'));
                        var np = turf.nearestPointOnLine(turfLine, turfPoint, { units: 'kilometers' });
                        // distanceKm = turf.pointToLineDistance(turfPoint, turfLine, {units: 'kilometers'});
                        // console.log(np);
                        if (distanceKm === undefined || np.properties.dist < distanceKm) {
                            closest = poi;
                            closestPoint = Bigmedia.Vars.convertTurfToOl(np.geometry);
                            distanceKm = np.properties.dist;
                        }
                    } else if (poi.getGeometry().getType() !== 'Point') {
                        var testDist = turf.distance(ol.proj.toLonLat(rec.get('geometry').getCoordinates()), ol.proj.toLonLat(poi.get('origObj').get('centroid').getCoordinates()), { units: 'kilometers' });
                        if (distanceKm === undefined || testDist < distanceKm) {
                            closest = poi;
                            closestPoint = closest.get('origObj').get('centroid');
                            distanceKm = testDist;
                        }
                    }
                })
                // } else {
                //     var minDistance, closestTurf;
                //     grid.getMapView().getMap().poiLayer.getSource().forEachFeature(function(f){
                //         var turfLine = Bigmedia.Vars.convertOlToTurf(rec.getGeometry()),
                //             turfPoint = Bigmedia.Vars.convertOlToTurf(f.getGeometry());
                //         var np = turf.nearestPointOnLine(turfLine, turfPoint, {units: 'kilometers'});
                //         if (minDistance === undefined || minDistance > np.properties.dist) {
                //             minDistance = np.properties.dist;
                //             closestTurf = np;
                //         }
                //     });
                //     if (closestTurf) {
                //         distanceKm = minDistance;
                //         closest = Bigmedia.Vars.convertTurfToOl(closestTurf);
                //     }
                // }
                // if (grid.getMapView().getMap().getBeforePoi()) {
                //
                // } else {
                //     closest =
                // }
                if (closest) {
                    line.push({
                        v: closest.get('origObj').get('name'),
                        l: {
                            Target: 'https://www.google.com/maps/dir/' + ol.proj.toLonLat(rec.get('geometry').getCoordinates()).reverse().join(',') + '/' + ol.proj.toLonLat(closestPoint.getCoordinates()).reverse().join(','),
                            Tooltip: 'Powered by Bigmedia Assistant (https://bma.bigmedia.ua)'
                        }
                    });
                    distance = Math.round(distanceKm * 1000);
                    line.push({ v: distance, t: 'n' });
                } else {
                    line.push({ v: null });
                    line.push({ v: null });
                }
            }
            // Add Occupancy columns
            if (exportOccupancy) {
                var recMons = rec.get('parsedOccupancy');
                for (var i = 0; i < maxMonthCount; i++) {
                    var mon = recMons ? recMons[i] : null;
                    if (!mon) {
                        line.push({ v: null });
                        continue;
                    }
                    var res,
                        ms = typeof mon.monthStatus === 'function' ? mon.monthStatus() : mon.monthStatus,
                        styleRef;
                    switch (ms) {
                        case 'r':
                            res = Bigmedia.Locales.occReserved;
                            styleRef = 7;
                            break;
                        case 't':
                            res = Bigmedia.Locales.occTempReserved;
                            styleRef = 6;
                            break;
                        case 's':
                            res = Bigmedia.Locales.occSold;
                            styleRef = 5;
                            break;
                        case 'f':
                            res = Bigmedia.Locales.occFree;
                            styleRef = 4;
                            break;
                        case 'd':
                            res = Bigmedia.Locales.occDemounted;
                            styleRef = 8;
                            break;
                        default:
                            res = Bigmedia.Locales.occUnknown;
                            styleRef = 9;
                    }
                    line.push({
                        v: res.slice(0, 1).toLowerCase(),
                        s: styleRef.toString()
                        // s: "3"
                    });
                    statuses[ms] = res;
                }
            }
            return line;
        }

        var ranges = [];
        // cols.push({text: Bigmedia.Locales.exportExcelPhotoText});
        // cols.push({text: Bigmedia.Locales.exportExcelSchemaText});
        cols.forEach(function (col, i) {
            header1.push({ v: col.text, s: "2" });
            // Two-rows in header are pretty but useless :-(
            // if(exportOccupancy){
            //     header2.push(null);
            //     ranges.push({
            //         s: {r: 0, c: i},
            //         e: {r: 1, c: i}
            //     });
            // }
        });
        header1.push({ v: Bigmedia.Locales.exportExcelPhotoText, s: "2" });
        // Two-rows in header are pretty but useless :-(
        // if(exportOccupancy){
        //     header2.push(null);
        //     ranges.push({
        //         s: {r: 0, c: cols.length},
        //         e: {r: 1, c: cols.length}
        //     });
        // }
        header1.push({ v: Bigmedia.Locales.exportExcelSchemaText, s: "2" });
        // Two-rows in header are pretty but useless :-(
        // if(exportOccupancy){
        //     header2.push(null);
        //     ranges.push({
        //         s: {r: 0, c: cols.length + 1},
        //         e: {r: 1, c: cols.length + 1}
        //     });
        // }
        if (exportPois) {
            // Two-rows in header are pretty but useless :-(
            // if (exportOccupancy) {
            //     header1.push({v: 'POI', s: "2"});
            //     header1.push(null);
            //     ranges.push({
            //         s: {r: 0, c: cols.length + 2},
            //         e: {r: 0, c: cols.length + 3}
            //     });
            //     header2.push({v: 'POI name', s: "2"});
            //     header2.push({v: 'Distance (m)', s: "2"});
            // } else {
            header1.push({ v: 'POI name', s: "2" });
            header1.push({ v: 'Distance (m)', s: "2" });
            // }
        }
        if (exportOccupancy) {
            // Two-rows in header are pretty but useless :-(
            // header1.push({v: Bigmedia.Locales.colOccupancy, s: "2"});
            // ranges.push({
            //     s: {r: 0, c: cols.length + (exportPois ? 4 : 2)},
            //     e: {r: 0, c: cols.length + (exportPois ? 4 : 2) + maxMonthCount - 1}
            // });
            // mons.forEach(function(mon){
            //     header1.push(null);
            //     header2.push({v: Ext.Date.monthNames[mon.month] + "'" + mon.year.toString().slice(-2), s: "2"});
            // })
            // header1.pop();
            mons.forEach(function (mon) {
                header1.push({ v: Ext.Date.monthNames[mon.month] + "'" + mon.year.toString().slice(-2), s: "2" });
            })
        }
        data.push(header1);

        // Two-rows in header are pretty but useless :-(
        // if(header2.length > 0){
        //     data.push(header2);
        // }

        if (grid.getSelectionModel().getCount() > 0) {
            grid.getSelection().forEach(function (rec) {
                data.push(getRecordCells(rec));
            });
        } else {
            grid.getStore().each(function (rec) {
                data.push(getRecordCells(rec));
            });
        }

        data.push([{ v: null }]);

        if (Object.keys(statuses).length > 0) {
            data.push([{ v: null }, { v: null }, { v: null }, { v: Bigmedia.Locales.exportExcelStatusDescription }]);
            Object.keys(statuses).forEach(function (st) {
                data.push([{ v: null }, { v: null }, { v: null }, { v: statuses[st].slice(0, 1).toLowerCase() + ' - ' + statuses[st] }]);
            });
        }
        data.push([{ v: null }]);
        var now = new Date();
        data.push([{ v: null }, { v: null }, { v: null }, { v: Bigmedia.Locales.exportExcelDateGenerated + Ext.Date.format(now, 'd.m.Y H:i:s') }]);

        var ws_name = "Bigmedia";
        // console.log(data);

        var wb = new Workbook(), ws = sheet_from_array_of_cells(data);

        /* add ranges to worksheet */
        if (ranges.length > 0) {
            ws['!merges'] = ranges;
        }

        /* add worksheet to workbook */
        wb.SheetNames.push(ws_name);
        wb.Sheets[ws_name] = ws;

        var useWorker = typeof Worker !== 'undefined';

        if (!useWorker) {
            var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: false, type: 'array' });
            saveAs(new Blob([wbout], { type: "application/octet-stream" }), filename);
            if (cb) { cb(); }
        } else {
            var xlsxWorker = new window.Worker('packages/local/xlsx/xlsxworker.js');
            xlsxWorker.onmessage = function (evt) {
                switch (evt.data.t) {
                    case 'ready': break;
                    case 'error': console.error(evt.data.d); break;
                    case 'xlsx':
                        // console.log(evt.data.d);
                        // var wbout = JSON.parse(evt.data.d);
                        var wbout = evt.data.d;
                        // saveAs(new Blob([s2ab(wbout)], {type: "application/octet-stream"}), filename);
                        saveAs(new Blob([wbout], { type: "application/octet-stream" }), filename);
                        if (cb) { cb(); }
                        break;
                }
            };
            xlsxWorker.postMessage({ wb: wb });
        }



        //function export_table_to_excel () {
        //var theTable = document.getElementById(id);
        //var oo = generateArray(theTable);
        //var ranges = oo[1];
        //
        ///* original data */
        //var data = oo[0];

        //}
    }
});
