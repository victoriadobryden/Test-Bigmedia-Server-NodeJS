// importScripts('/ol/turf.min.js');

// var jsonReader = new jsts.io.GeoJSONReader();

var queryableFunctions = {
    prepareFaces: function (source, cities, params) {
        prepareFaces(source, cities, params);
    }
};

// system functions

function defaultReply(message) {
    // your default PUBLIC function executed only when main page calls the queryableWorker.postMessage() method directly
    // do something
}

function reply() {
    if (arguments.length < 1) { throw new TypeError('reply - not enough arguments'); return; }
    postMessage({ 'queryMethodListener': arguments[0], 'queryMethodArguments': Array.prototype.slice.call(arguments, 1) });
}

onmessage = function(oEvent) {
    if (oEvent.data instanceof Object && oEvent.data.hasOwnProperty('queryMethod') && oEvent.data.hasOwnProperty('queryMethodArguments')) {
        queryableFunctions[oEvent.data.queryMethod].apply(self, oEvent.data.queryMethodArguments);
    } else {
        defaultReply(oEvent.data);
    }
};

function prepareFaces (source, cities, params) {
    if (source.length === 0) {
        return;
    }
    this.params = params;
    source.sort(function(a, b){ return a.id_city - b.id_city;});
    var id_city = source[0].id_city,
        res = [],
        initialCampaign = params.initialCampaign,
        initial = [];
    source.forEach(function(face, ix) {
        if (id_city !== face.id_city) {
            if (initialCampaign) {
                initial = initialCampaign.filter(function(face){
                        return face.id_city === id_city;
                    }).map(function(face){
                        if (!face.coveragesTurf) {
                            face.coveragesTurf = getFaceCoveragesTurf(face, cities[face.id_city]);
                        }
                        if (!face.cells) {
                            face.cells = getFaceCells(face, cities[face.id_city]);
                        }
                        return face;
                    });
            }
            reply('citycompleted', id_city, res, initial);
            id_city = face.id_city;
            res = [];
        }
        if (!face.coveragesTurf) {
            face.coveragesTurf = getFaceCoveragesTurf(face, cities[face.id_city]);
        }
        if (!face.cells) {
            face.cells = getFaceCells(face, cities[face.id_city]);
        }
        res.push(face);
    });
    if (initialCampaign) {
        initial = initialCampaign.filter(function(face){
                return face.id_city === id_city;
            }).map(function(face){
                if (!face.coveragesTurf) {
                    face.coveragesTurf = getFaceCoveragesTurf(face, cities[face.id_city]);
                }
                if (!face.cells) {
                    face.cells = getFaceCells(face, cities[face.id_city]);
                }
                return face;
            });
    }
    reply('citycompleted', id_city, res, initial);
}

function getRadius (cityArea, grp, index) {
    var me = this;
    // sector
    var grpVal = grp || 0.01;
    var //r = Math.sqrt(2 * cityArea * grpVal / (100 * Math.PI * (grpVal / 100 + 1.6))); //
        r = Math.sqrt(2 * cityArea * grpVal / (100 * Math.PI * 1.6));
    // circle
    // var r = Math.sqrt(cityArea * grpVal / (100 * Math.PI * (grpVal / 100 + 2)));
    if (index > 0) {
        // r = Math.sqrt(2 * cityArea * Math.log(Math.pow(me.params.coverageDays[index], Math.E)) / (Math.PI * 100 * (grpVal * me.params.coverageDays[index] / 100 + 1.6)) + Math.pow(r, 2));
        r = Math.sqrt(2 * cityArea * Math.log(Math.pow(me.params.coverageDays[index], Math.E)) / (Math.PI * 100 * 1.6) + Math.pow(r, 2));
        // r = Math.sqrt(2 * cityArea * Math.log(days[i] ** (Math.E)) / (Math.PI * 100) + (r ** 2));
        // Peter Gallop (sector)
        // r = Math.sqrt(2 * cityArea * grpVal * me.coverageDays[index] / (100 * Math.PI * (grpVal * me.coverageDays[index] / 100 + 2)));
        // Peter Gallop (circle)
        // r = Math.sqrt(cityArea * grpVal * me.coverageDays[index] / (100 * Math.PI * (grpVal * me.coverageDays[index] / 100 + 2)));
    }
    return r;
}

function getCoveragesTurf (face, city, grp, angle) {
    var me = this;
    var grpVal = grp || 0.01;
    if (face.turf && grpVal) {
        var coveragesTurf = [];
        var cityArea = 0;
        if (city) {
            cityArea = city.area;
        }
        if (!cityArea) {
            return null;
        }
        // sector
        // var r = Math.sqrt(2 * cityArea * grp / (100 * Math.PI));
        // circle
        // var r = Math.sqrt(cityArea * grp / (100 * Math.PI));
        var days = me.params.coverageDays;
        for(var i = 0; i < days.length; i++) {
            // var radius = (i == 0) ? r : (r * (1 + (days[i]/15)));

            // var radius = Math.sqrt(cityArea * grp * days[i] / (100 * Math.PI))
            // var radius = Math.sqrt(2 * cityArea * grp * days[i] / (100 * Math.PI))

            var radius = getRadius(cityArea, grpVal, i);
            // sector
            // var radius = (i == 0) ? r : (Math.sqrt(2 * cityArea * Math.log(days[i] ** (Math.E)) / (Math.PI * 100) + (r ** 2)));

            // circle
            // var radius = (i == 0) ? r : (Math.sqrt(cityArea * Math.log(days[i] ** (Math.E)) / (Math.PI * 100) + (r ** 2)));
            if (!angle || angle === 'NULL') {
                angle = 0;
            }

            // var center = turf.point(ol.proj.toLonLat(geometry.getCoordinates()));
            var center = face.turf;
            var circle = turf.circle(center, radius / 1000, {steps: 16, units: 'kilometers'});

            // sector
            var sector;
            var turfAngle = angle * (-1) + 90;
            sector = turf.polygon([circle.geometry.coordinates[0].slice(0,9).concat([circle.geometry.coordinates[0][0]])]);
            if (turfAngle !== 0) {
                sector = turf.transformRotate(sector, turfAngle, {pivot: center});
            }
            // var sectorJsts = convertTurfToJsts(turf.truncate(sector));
            // coverages.push(sectorJsts);
            coveragesTurf.push(turf.truncate(sector));

            // circle
            // var circleJsts = Bigmedia.Vars.convertTurfToJsts(turf.truncate(circle));
            // coverages.push(circleJsts);
        }
        return coveragesTurf;
    }
    else {
        return null;
    }
}

function convertTurfToJsts (turfGeometry) {
    var jstsFeature = jsonReader.read(turfGeometry.geometry);
    return jstsFeature;
}

function getFaceCoveragesTurf (face, city) {
    var coveragesTurf = face.coveragesTurf,
        grp = face.grp;
    if (face.useKSData)  grp = face.ksTRP || 0.01;
    if (!coveragesTurf) {
        face.coveragesTurf = coveragesTurf = getCoveragesTurf(face, city, grp, face.angle);
    }
    return coveragesTurf;
}

isInsideCircle = function (center, radius, point) {
    return turf.distance(center, point) <= (radius / 1000);
};

inSector = function (center, faceAngle, point) {
    // var pointAngle = Math.atan2(point[1] - center[1]) / (point[0] - center[0]) * 180 / Math.PI;
    var bearing = turf.bearing(center, point);
    var res;
    if (faceAngle >= 0 && faceAngle <=90) {
        res = (bearing >= -90 - faceAngle) && (bearing <= 90 - faceAngle);
    } else if (faceAngle >= 270) {
        res = (bearing >= (270 - faceAngle)) && (bearing <= (270 + 180 - faceAngle));
    } else {
        res = (bearing < 90 - faceAngle) || (bearing > faceAngle - 90);
    }
    // console.log([bearing, faceAngle, res]);
    return res;
    // return pointAngle <= faceAngle - 90 && pointAngle >= faceAngle + 90;
};

getFaceCells = function (data, city) {
    var me = this;
    if (data.cells) {
        return data.cells;
    }
    var cellSize = 0.1, // kilometers
        dayIndex = 2;
    // console.log('faceNo: ' + face.get('num'));
    if (parseFloat(data.lon) && parseFloat(data.lat)) {
        // var coord = [parseFloat(data.lon), parseFloat(data.lat)],
        //     pos = data.pos;
        // if (+pos !== 0) {
        //     var offset = [pos * 0.00005, 0],
        //         angleRad = (data.angle) *  Math.PI / 180;
        //     // turf.transformRotate(turf.point(coord), data.angle)
        //     // ol.coordinate.rotate(offset, angleRad);
        //     // ol.coordinate.add(coord, offset);
        // }
        var coord = data.turf;
        var grp = data.grp;
        if (data.useKSData)  grp = data.ksTRP || 0.01;
        //------------------------------------------------------------
        // third variant - like second but intersect is calculated mathematically (without turf library)
        // var coverage;
        // if (data.coverages) {
        //     coverage = data.coverages[dayIndex];
        // } else {
        //     coverage = me.calculateFaceCoverages(face)[dayIndex];
        // }
        // var turfCover = me.convertJstsToTurf(coverage);
        // var coverBBox = turf.bbox(turfCover);
        // var coverBP = turf.bboxPolygon(coverBBox);
        // var intersectedBP = turf.intersect(turf.bboxPolygon(city.get('bbox')), coverBP);
        // var iBBox = turf.bbox(intersectedBP);
        // // console.log(iBBox);
        // var ibbWidth = turf.distance([iBBox[0], iBBox[1]], [iBBox[2], iBBox[1]]),
        //     ibbHeight = turf.distance([iBBox[0], iBBox[1]], [iBBox[0], iBBox[3]]);
        // var fromCellX = 0;
        // if (city.get('bbox')[0] < iBBox[0]) {
        //     fromCellX = Math.round(turf.distance([city.get('bbox')[0],city.get('bbox')[1]], [iBBox[0], city.get('bbox')[1]]) / cellSize);
        // }
        // var fromCellY = 0;
        // if (city.get('bbox')[1] < iBBox[1]) {
        //     fromCellY = Math.round(turf.distance([city.get('bbox')[0],city.get('bbox')[1]], [city.get('bbox')[0], iBBox[1]]) / cellSize);
        // }
        // var cellsXLength = Math.round(ibbWidth / cellSize);
        // var cellsYLength = Math.round(ibbHeight / cellSize);
        // var origPoint = [iBBox[0], iBBox[1]];
        var radius = getRadius(city.area, grp, dayIndex);
        var cellsXLength = Math.round((2 * radius / 1000) / cellSize);
        var cellsYLength = cellsXLength;
        var origPoint = turf.destination(data.turf, radius * Math.SQRT2 / 1000, -135);
        // console.log(origPoint);
        var fromCellX = Math.round(turf.distance([city.bbox[0],city.bbox[1]], [origPoint.geometry.coordinates[0], city.bbox[1]]) / cellSize);
        if (fromCellX < 0) {
            fromCellX = 0;
        }
        var fromCellY = Math.round(turf.distance([city.bbox[0],city.bbox[1]], [city.bbox[0], origPoint.geometry.coordinates[1]]) / cellSize);
        if (fromCellY < 0) {
            fromCellY = 0;
        }
        var inRow = Math.round(city.x / cellSize);
        var cells = [];
        // console.log(radius);
        for (var y = 0; y < cellsYLength; y++) {
            for (var x = 0; x < cellsXLength; x++) {
                // var fromPoint = turf.destination(turf.destination(origPoint, x * cellSize, 90), y * cellSize, 0);
                // var cellCenter = turf.destination(turf.destination(fromPoint, cellSize / 2, 90), cellSize / 2, 0);
                var cellCenter = turf.destination(turf.destination(origPoint, x * cellSize + cellSize / 2, 90), y * cellSize + cellSize / 2, 0);
                if (isInsideCircle(coord, radius, cellCenter.geometry.coordinates) && inSector(coord, data.angle, cellCenter.geometry.coordinates) ) {
                    cells.push((y + fromCellY) * inRow + x + fromCellX);
                    // console.log('fast');
                }

                // var points = turf.pointsWithinPolygon(cellCenter, turfCover);
                // if (points && points.features.length > 0) {
                //     cells.push((y + fromCellY) * inRow + x + fromCellX);
                //     // console.log('slow');
                // }
            }
        }
        // console.log(cells);
        return cells;
        //------------------------------------------------------------
        // second variant (squares that intersects with coverage polygon - too slow)
        // var coverage;
        // if (data.coverages) {
        //     coverage = data.coverages[0];
        // } else {
        //     coverage = this.calculateFaceCoverages(face)[0];
        // }
        // var turfCover = this.convertJstsToTurf(coverage);
        // var coverBBox = turf.bbox(turfCover);
        // var coverBP = turf.bboxPolygon(coverBBox);
        // var intersectedBP = turf.intersect(turf.bboxPolygon(city.get('bbox')), coverBP);
        // var fromCellX = 0;
        // if (city.get('bbox')[0] < coverBBox[0]) {
        //     fromCellX = Math.round(turf.distance([city.get('bbox')[0],city.get('bbox')[1]], [coverBBox[0], city.get('bbox')[1]]) / cellSize);
        // }
        // var fromCellY = 0;
        // if (city.get('bbox')[1] < coverBBox[1]) {
        //     fromCellY = Math.round(turf.distance([city.get('bbox')[0],city.get('bbox')[1]], [city.get('bbox')[0], coverBBox[1]]) / cellSize);
        // }
        // var cellsXLength = Math.round(turf.distance(intersectedBP.geometry.coordinates[0][1], intersectedBP.geometry.coordinates[0][2]) / cellSize);
        // var cellsYLength = Math.round(turf.distance(intersectedBP.geometry.coordinates[0][0], intersectedBP.geometry.coordinates[0][1]) / cellSize);
        // var origPoint = intersectedBP.geometry.coordinates[0][0];
        // var inRow = Math.round(city.get('x') / cellSize);
        // var cells = [];
        // for (var y = 0; y < cellsYLength; y++) {
        //     for (var x = 0; x < cellsXLength; x++) {
        //         var fromPoint = turf.destination(turf.destination(origPoint, x * cellSize, 90), y * cellSize, 180);
        //         var cellPolygon = turf.polygon([[fromPoint.geometry.coordinates, turf.destination(fromPoint, cellSize, 90).geometry.coordinates, turf.destination(turf.destination(fromPoint, cellSize, 90), cellSize, 180).geometry.coordinates, turf.destination(fromPoint, cellSize, 180).geometry.coordinates, fromPoint.geometry.coordinates]]);
        //         // console.log([turfCover, cellPolygon]);
        //         if (turf.intersect(turfCover, cellPolygon)) {
        //             cells.push((y + fromCellY) * inRow + x + fromCellX);
        //         }
        //     }
        // }
        // // console.log(cells);
        // return cells;

        //------------------------------------------------------------
        // first variant (squares) fast, but inaccurate
        // var squareLength = Math.round(Math.sqrt(city.get('x') * city.get('y') / (cellSize * cellSize) * grp / 100)); // cells in row for face
        // var cells = [];
        // var fromCellX = Math.round(turf.distance([Math.max(city.get('bbox')[0], turf.destination(coord, squareLength * cellSize / 2, -90).geometry.coordinates[0]), city.get('bbox')[1]],[city.get('bbox')[0], city.get('bbox')[1]]) / cellSize);
        // var fromCellY = Math.round(turf.distance([city.get('bbox')[0], Math.max(city.get('bbox')[1], turf.destination(coord, squareLength * cellSize / 2, 180).geometry.coordinates[1])],[city.get('bbox')[0], city.get('bbox')[1]]) / cellSize);
        //
        // var inRow = Math.round(city.get('x') / cellSize);
        // for (var x = fromCellX; x < Math.min(fromCellX + squareLength, Math.round(city.get('x') / cellSize)); x++) {
        //     for (var y = fromCellY; y < Math.min(fromCellY + squareLength, Math.round(city.get('y') / cellSize)); y++) {
        //         cells.push(y * inRow + x);
        //     }
        // }
        // return cells;
        //------------------------------------------------------------
    } else {
        return [];
    }
};
