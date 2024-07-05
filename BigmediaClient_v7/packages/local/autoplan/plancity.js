// importScripts('/ol/turf.min.js');
// importScripts('/ol/jsts.min.js');

var jsonReader = new jsts.io.GeoJSONReader(),
    jsonWriter = new jsts.io.GeoJSONWriter();

function convertJstsToTurf (jstsGeometry) {
    var me = this;
    var geometry = me.jsonWriter.write(jstsGeometry);
    var feature = turf.feature(geometry);
    return feature;
}

function convertTurfToJsts (turfGeometry) {
    var jstsFeature = jsonReader.read(turfGeometry.geometry);
    return jstsFeature;
}

var queryableFunctions = {
    getFacesByAlgorithm: function (city, method, source, params, initialCampaign) {
        getFacesByAlgorithm(city, method, source, params, initialCampaign);
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

getFacesByAlgorithm = function (city, method, source, params, initialCampaign) {
    var me = this;
    me.params = me.prepareParams(city, params);
    // console.log(city.jsts);
    city.jsts = convertTurfToJsts(turf.truncate(city.turf));
    // console.log(source);
    source.forEach(function(face){
        face.coverages = face.coveragesTurf.map(function(ct){
            return convertTurfToJsts(ct);
        });
    });
    // console.log(city.jsts);
    // console.log(me.params);
    me.grpSorted = source;

    me.minPrice = source.reduce(function(minPrice, rec){ return ((minPrice === null) || minPrice > rec.finalPrice) ? rec.finalPrice : minPrice}, null);

    me.resultStreets = {};
    me.resultStore = {};

    var nodes = me.getTopNodes(method, initialCampaign);
    var node = me.getBestChain(nodes, method);
    // var node = createChainNode(null, grpSorted.getAt(0).getId(), grpSorted);
    if (node) {
        var bestChild = node.getBestChildNode();
        var boards = bestChild.getChainBoards();
        // console.log([nodes, node, bestChild, boards]);
        reply('algorithmcompleted', city.id, method, boards);
    } else {
        reply('algorithmcompleted', city.id, method, []);
    }

    // var bestNode = me.getTopNodesPromise(method).then(function(nodes){
    //     reply('topNodes');
    //     return me.getBestChain(nodes, method);
    // }).then(function(node){
    //     reply('bestChild');
    //     if (node) {
    //         var bestChild = node.getBestChildNode();
    //         return bestChild.getChainBoards();
    //     }
    // }).resolve();
    // reply('bestNode', bestNode);

    // var nodes = me.getTopNodes(method);
    // var node = me.getBestChain(nodes, method);
    // // var node = createChainNode(null, grpSorted.getAt(0).getId(), grpSorted);
    // if (progressbar && maxprogressvalue) {
    //     progressbar.updateProgress(maxprogressvalue);
    // }
    // if (node) {
    //     var bestChild = node.getBestChildNode();
    //     return bestChild.getChainBoards();
    // }
};

prepareParams = function (city, params) {
    params.planBoards = city.planBoards;
    params.planSizes = city.planSizes;
    params.planBudget = city.planBudget;
    params.planCoverage = city.planCoverage;
    params.splits = city.splits;
    params.city = city;
    if (!params.planBoards && city.planSizes && Object.keys(city.planSizes).length > 0) {
        params.planBoards = Object.values(city.planSizes).reduce(function(res, planSize){ return res + (planSize || 0);}, 0); //.limit
    }
    if (! params.planBoards && ! params.planBudget && params.planCoverage > 60) {
        params.variants = 1;
        params.topVariants = 3;
        params.maxDeep = 50;
    } else if ((params.planBoards && params.planBoards < 10) || (params.planBudget && params.planBudget < 50000) || (params.planCoverage && params.planCoverage < 30)) {
        params.variants = 3;
        params.topVariants = 5;
        params.maxDeep = 100;
    } else if ((params.planBoards && params.planBoards < 30) || (params.planBudget && params.planBudget < 150000) || (params.planCoverage && params.planCoverage <= 50)) {
        params.variants = 2;
        params.topVariants = 3;
        params.maxDeep = 80;
    } else if ((params.planBoards && params.planBoards < 50) || (params.planBudget && params.planBudget < 300000) || (params.planCoverage && params.planCoverage <= 60)) {
        params.variants = 2;
        params.topVariants = 2;
        params.maxDeep = 60;
    } else {
        params.variants = 1;
        params.topVariants = 3;
        params.maxDeep = 50;
    }
    return params;
};

incProgress = function (val) {
    // var me = this,
    //     incVal = val || 0.05,
    //     newVal = me.progressbar.getValue() + incVal;
    // if (me.progressbar && me.maxprogressvalue && newVal < me.maxprogressvalue) {
    //     me.progressbar.updateProgress(newVal);
    // }
};

getBestChain = function (nodes, method) {
    var me = this,
        node = nodes.reduce(function(best, node){
        return best === null ? node.getBestChildNode(method) : me.getBest(best.getBestChildNode(method), node.getBestChildNode(method), method);
    },null);
    return node;
};

getTopNodes = function (method, initialCampaign) {
    var me = this;
    if (method !== 'MinPrice') {
        me.grpSorted.forEach(function(item){
            item.score = me.getItemScore(item, method);
        });
        me.grpSorted.sort(function(a, b){ return b.score - a.score;});
    } else {
        me.grpSorted.sort(function(a, b){ return a.finalPrice - b.finalPrice;});
    }
    me.grpSorted.forEach(function(item, ix){
        item.index = ix;
    });
    var nodes = [],
        initNode = null;
    if (initialCampaign) {
        initNode = initialCampaign.reduce(function(parentNode, face){
            return this.createChainNode(parentNode, face, me.grpSorted, method, true);
        }, null);
    }
    var j = 0, progressVal;
    // if (me.params.progressbar && me.params.maxprogressvalue) {
    //     progressVal = (me.params.maxprogressvalue - me.params.progressbar.getValue()) / me.params.topVariants;
    // }
    // var i = 0;
    // var nPromises = [];
    while (nodes.length < me.params.topVariants && j < me.grpSorted.length) {
    // while (i < me.params.topVariants && j < me.grpSorted.length) {
        if (!me.params.planBudget || me.grpSorted[j].finalPrice < me.params.planBudget) {
            // nPromises.push(me.createChainNodePromise(null, me.grpSorted[j].id, me.grpSorted, method));
            if (!me.params.planSizes || (me.params.planSizes[me.grpSorted[j].id_size] === undefined) || (me.params.planSizes[me.grpSorted[j].id_size] > 0) ) {
                nodes.push(me.createChainNode(initNode, me.grpSorted[j], me.grpSorted, method));
            }
            // i++;
        }
        j++;
    }
    return nodes;
};

convertArrToObj = function (arr) {
    return arr.reduce(function(res, item){ res[item]=item; return res;}, {});
};

getItemScore = function (item, method) {
    var rate = 1;
    //// TODO: B&B W&W Typical
    // var oWorsts = me.convertArrToObj(me.params.worsts),
    //     oBests = me.convertArrToObj(me.params.bests),
    //     oTypicals = me.convertArrToObj(me.params.typicals);
    // if (oTypicals[item.get('doors_no')]) {
    //     rate = params.settings.typical;
    // } else if (oBests[item.get('doors_no')]) {
    //     rate = params.settings.best;
    // } else if (oWorsts[item.get('doors_no')]) {
    //     console.log(item.get('doors_no'));
    //     rate = params.settings.worst;
    // }
    var res = null;
    if (method === 'MaxGRPDivPrice') {
        if (item.finalPrice) {
            res = item.ots * rate / item.finalPrice;
        } else {
            res = item.ots * rate / 10000;
        }
    } else {
        res = item.ots * rate;
    }
    return res;
};

getBest = function (node1, node2, method) {
    var res = node1;
    // different boards count: win candidate with maximum boards' count
    if (node1.level > node2.level) {
        return node1;
    } else if (node1.level < node2.level) {
        return node2;
    }
    switch(method) {
        case 'MaxGRPDivPrice':
        if (node1.costPerArea > node2.costPerArea) {
            res = node2;
        }
        break;
        case 'MaxScore':
        if (node1.sumScore < node2.sumScore) {
            res = node2;
        }
        break;
        case 'MaxGRP':
        if (node1.sumOTS < node2.sumOTS) {
            res = node2;
        }
        break;
        case 'MinPrice':
        if (node1.budget > node2.budget) {
            res = node2;
        }
        break;
        case 'MaxCoverage':
        if (node1.cellsCount < node2.cellsCount) {
            // if (best.cells.length < candidate.cells.length) {
            // if (best.coverageArea < candidate.coverageArea) {
            res = node2;
        }
        break;
    }
    return res;
};

createChainNode = function (parentNode, face, store, method, forced) {
    var me = this,
        faceId = face.id;
    var minPrice = me.minPrice;
    if (!face) { return null; }
    if (parentNode && parentNode.getChainBoardIds()[faceId]) {
        // return null;
        return parentNode;
    }
    var budget = parentNode ? parentNode.budget : 0;
    if (face.finalPrice) { budget += face.finalPrice; }
    var sumOTS = parentNode ? parentNode.sumOTS : 0;
    // if (face.get('ots')) { sumOTS += face.get('ots'); }
    sumOTS += face.ots ? face.ots : 1;
    var sumGRP = parentNode ? parentNode.sumGRP : 0;
    // if period is less then 20 days - we count coverage on 15 days
    var dayIx = ((me.params.endDate - me.params.startDate) / (1000 * 60 * 60 * 24) <= 20) ? 3 : 4;
    // if (face.get('grp')) { sumGRP += face.get('grp'); }
    sumGRP += (face.grp ? face.grp : 0.01)  * me.params.coverageDays[dayIx];
    var sumScore = parentNode ? parentNode.sumScore : 0;
    if (face.score) { sumScore += face.score; }
    var streets = parentNode ? parentNode.streets : {};
    var faceStreets = face.streets ? face.streets.split(/\s+/) : [];
    faceStreets.filter(function(fs){return !!fs;}).forEach(function(fs){ streets[fs] = streets[fs] ? streets[fs] + 1 : 1;});

    var faceCells = face.cells;
    var cells = parentNode ? parentNode.cells : {};
    faceCells.forEach(function(cell){cells[cell] = cell;});
    var cellsCount = Object.keys(cells).length;
    var cellsArea = cellsCount * Math.sqrt(me.params.approxCellSize);
    var costPerArea = 0;
    if (budget && cellsArea) {
        costPerArea = budget / cellsArea;
    }
    var costPerThousand = 0;
    if (budget && sumOTS) {
        costPerThousand = budget / sumOTS;
    }
    var coverage = parentNode ? parentNode.coverage : null;
    var coverageArea = parentNode ? parentNode.coverageArea : null;
    var sizes = parentNode ? parentNode.sizes : {};
    sizes[face.id_size] = (sizes[face.id_size] || 0) + 1;
    if (me.params.planCoverage) {
        var faceCoverages = face.coverages;
        var union = faceCoverages ? ((parentNode && parentNode.union) ? jsts.operation.union.UnaryUnionOp.union(parentNode.union.union(faceCoverages[dayIx])) : faceCoverages[dayIx]) : (parentNode ? parentNode.union : null);
        var city = me.params.city;
        if (city && union) {
            var intersected = jsts.operation.overlay.OverlayOp.intersection(city.jsts, union);
            var coverageArea = turf.area(convertJstsToTurf(intersected));
            union = intersected;
            // covMax
            coverage = coverageArea / city.area * 100;
            // for frequency 1
            coverage = coverage * sumGRP / (coverage + sumGRP);
        }
    }
    var splits;
    if (me.params.splits) {
        splits = parentNode ? JSON.parse(JSON.stringify(parentNode.splits)) : {};
        me.params.splits.forEach(function(split){
          if (split.values) {
            var fieldName = split.fieldName;
            if (!splits[fieldName]) {
                splits[fieldName] = {};
            }
            if (!splits[fieldName][face[fieldName]]) {
                splits[fieldName][face[fieldName]] = {value: (split.type === 'budget') ? face.finalPrice : 1};
            } else {
                splits[fieldName][face[fieldName]].value = splits[fieldName][face[fieldName]].value + ((split.type === 'budget') ? face.finalPrice : 1);
            }
          }
        });
        // console.log(splits);
        // console.log([parentNode ? parentNode.level + 1 : 0, splits]);
    }
    var parentSuppliers = parentNode ? parentNode.suppliers : {};
    var suppliers = Object.keys(parentSuppliers).reduce(function(res, supplier){
        res[supplier] = supplier === face.supplier ? parentSuppliers[supplier] + 1 : parentSuppliers[supplier];
        return res;
    }, {});
    var newNode = {
        parent: parentNode,
        level: parentNode ? parentNode.level + 1 : 0,
        sumGRP: sumGRP,
        sumOTS: sumOTS,
        sumScore: sumScore,
        budget: budget,
        union: union,
        coverage: coverage,
        splits: splits,
        coverageArea: coverageArea,
        costPerArea: costPerArea,
        costPerThousand: costPerThousand,
        cells: cells,
        cellsCount: cellsCount,
        suppliers: suppliers,
        face: face,
        streets: streets,
        sizes: sizes,
        children: [],
        getChainBoardIds: function () {
            var parentChain = parentNode ? parentNode.getChainBoardIds() : {};
            parentChain[face.id] = face;
            return parentChain;
        },
        getChainBoards: function () {
            var parentChain = parentNode ? parentNode.getChainBoards() : [];
            parentChain.push(face);
            return parentChain;
        },
        getTopParentIndex: function () {
            if (!parentNode) { return face.index;}
            return parentNode.getTopParentIndex();
        }
    };
    newNode.getBestChildNode = function () {
        if (newNode.children.length === 0) {
            return newNode;
        }
        if (newNode.bestChild) {
            return newNode.bestChild;
        }
        var best = newNode.children[0].getBestChildNode();
        for (var i = 1; i < newNode.children.length; i++) {
            var candidate = newNode.children[i].getBestChildNode();
            best = me.getBest(best, candidate, method);
        }
        newNode.bestChild = best;
        return best;
    }
    if (forced) {
        return newNode;
    }

    // Not works because of planSize items are particular and not consists of all sizes
    // if (me.params.planSizes) {
    //     var restSizes = Object.keys(me.params.planSizes).reduce(function(res, sizeId){
    //         if (me.params.planSizes[sizeId] > 0 && (!newNode.sizes[sizeId] || newNode.sizes[sizeId] < me.params.planSizes[sizeId])) {
    //             res.push(sizeId);
    //         }
    //         return res;
    //     }, []);
    //     if (restSizes.length === 0) {
    //         console.log('limits achieved: ' + newNode.sizes);
    //         newNode.done = true;
    //         // me.incProgress();
    //         return newNode;
    //     }
    // }
    if (me.params.planBoards && newNode.level + 1 >= me.params.planBoards) {
        newNode.done = true;
        me.incProgress();
        return newNode;
    }
    if (me.params.planBudget && newNode.budget + minPrice >= me.params.planBudget) {
        // console.log([newNode.budget, minPrice, me.params.planBudget]);
        newNode.done = true;
        me.incProgress();
        return newNode;
    }

    // if (parentNode && parentNode.splitFrom) {
    //     i = parentNode.splitFrom;
    // }

    if (me.params.planBudget && me.params.planBudget - newNode.budget < minPrice ) {
        // console.log(3);
        me.incProgress();
        return newNode;
    }
    if (me.params.planCoverage && me.params.planCoverage - newNode.coverage <= 0 ) {
        // console.log([me.params.planCoverage, newNode.coverage]);
        me.incProgress();
        return newNode;
    }

    // var i = store.indexOfId(faceId) + 1;
    var i = face.index + 1;

    // disable splits with min limitation where no more boards in source
    if (me.params.splits) {
      var idsInNodeChain = newNode.getChainBoardIds();
      // console.log([me.params.splits, newNode.splits]);
        me.params.splits.forEach(function(split){
            if (split.values) {
                Object.keys(split.values).filter(function(key){
                    // return !!split.values[key].min && !split.values[key].disabled;
                    return !!split.values[key].min && !(newNode.splits[split.fieldName][key] && newNode.splits[split.fieldName][key].disabled);
                }).forEach(function(key){
                    if (!store.filter(function(f){
                        return (f[split.fieldName] === key) && !(idsInNodeChain[f.id]);
                    }).some(function(f){
                        return fitBoardToChain(newNode, f) && notExists(newNode.cells, f.cells).length > 0 && fitBoardToSplit(newNode, f);
                    })) {
                      // split.values[key].disabled = true;
                      if (!newNode.splits[split.fieldName][key]) {
                        newNode.splits[split.fieldName][key] = {};
                        console.log('Split for node is not initialized but disabled');
                      }
                      newNode.splits[split.fieldName][key].disabled = true;
                      console.log('Split is disabled: %o', newNode.splits);
                      // i = store.length;
                      // i = 0;
                    }
                });
            }
        });
    }

    if (me.params.splitFrom) {
        i = me.params.splitFrom;
        me.params.splitFrom = 0;
    }

    var variants = newNode.level < 3 ? me.params.variants : 1;
    var fromTop = false;
    if (i >= store.length) {
        fromTop = true;
        i = newNode.getTopParentIndex() + 1;
    }
    // console.log([i, store.length]);
    while (newNode.children.length < variants && i < store.length ) {
        var bestIndex = me.findBestNextBoardIndex(newNode, i, store, method);
        if (bestIndex !== undefined) {
            i = bestIndex;
        } else if (!fromTop) {
            fromTop = true;
            i = newNode.getTopParentIndex() + 1;
            continue;
        } else {
            break;
        }
        // already checked in findBestNextBoardIndex
        // if (!me.fitBoardToChain(newNode, store[i])) {
        //     i++;
        //     continue;
        // }

        // if (me.params.splits && me.params.splits.some(function(split){
        //     // console.log([newNode.splits, face, split]);
        //     return newNode.splits[split.fieldName] && newNode.splits[split.fieldName][face[split.fieldName]] && ((newNode.splits[split.fieldName][face[split.fieldName]] / (newNode.level + 1)) > split.values[face[split.fieldName]]);
        // })){
        //     if (!me.params.splitFrom || me.params.splitFrom > i) {
        //         me.params.splitFrom = i;
        //     }
        //     i++;
        //     // console.log(newNode.splits);
        //     continue;
        // } else {
        //     console.log([newNode.splits.id_catab, face.id_catab]);
        // }
        // me.createChainNodePromise(newNode, store.getAt(i).getId(), store, method).then(function(node){newNode.children.push(node);});

        // try to clear disabled flag for split
        // disabled in improved version
        // me.params.splits.forEach(function(split){
        //     if (split.values) {
        //         Object.keys(split.values).filter(function(key){
        //             return split.values[key].disabled;
        //         }).forEach(function(key){
        //             split.values[key].disabled = false;
        //         });
        //     }
        // });

        var child = me.createChainNode(newNode, store[i], store, method);
        if (child && (child !== newNode)) {
            newNode.children.push(child);
            fromTop = false;
        }
        i++;
    }
    return newNode;
};

notExists = function (source, candidate) {
    return candidate.reduce(function(ne, c){
        // if (source.every(function(s){ return c !== s;})) {
        //     ne.push(c);
        // }
        if (!source[c]) { ne.push(c); }
        return ne;
    },[]);
};

findBestNextBoardIndex = function (node, fromIndex, store, method) {
    var me = this, maxDelta = 0, maxUnionArea = 0, maxIndex, candidateCount = 0, minIntersectedArea = 0, fromTop = false, i = fromIndex;
    // (!fromTop || i <= store.length) && (fromTop || i < fromIndex)
    while ( (candidateCount <= me.params.maxDeep) && ((!fromTop && (i <= store.length)) || (fromTop && (i < fromIndex))) ) {
        if (i === store.length) {
            fromTop = true;
            i = 0;
        }
        var face = store[i],
            faceCells = face.cells;
        if (faceCells && faceCells.length > 0 && me.fitBoardToChain(node, store[i])) {
            // splits
            if (me.params.splits) {
                // var fitForSplit = true;
                var fitForSplit = me.params.splits.filter(function(split){ return !!split.values;}).every(function(split){
                    if (split.values[face[split.fieldName]] && typeof split.values[face[split.fieldName]] !== 'object') {
                        // simple splits like A/B: "values: {A: 80, B: 20}"
                        // console.log([split, split.values[face[split.fieldName]], face[split.fieldName]]);
                        if (split.values[face[split.fieldName]] === 0) {
                            return false;
                        }
                        return (split.values[face[split.fieldName]] > 0) && ( !node.splits[split.fieldName] || !node.splits[split.fieldName][face[split.fieldName]] ||  (((node.splits[split.fieldName][face[split.fieldName]].value + 1) / (node.level + 3)) <= (split.values[face[split.fieldName]] / 100)));
                    } else {
                        if (split.values[face[split.fieldName]] && split.values[face[split.fieldName]] !== null ) {
                            var max = split.values[face[split.fieldName]].max;
                            // if (max === 0) { return false; }
                            if (max && node.splits[split.fieldName] && node.splits[split.fieldName][face[split.fieldName]] &&  (((node.splits[split.fieldName][face[split.fieldName]].value + (split.type === 'budget' ? face.finalPrice : 1)) / (split.type === 'budget' ? (node.budget + face.finalPrice) : (node.level + 2))) > (max / 100))) { return false; }
                            if (split.values[face[split.fieldName]].min && !node.splits[split.fieldName][face[split.fieldName]]) {
                                return true;
                            }
                        }
                        var fitMinSplits =  !(Object.keys(split.values).filter(function(key){
                            // console.log((!!split.values[key].min) && (key !== face[split.fieldName]));
                            // return (!!split.values[key]) && (!split.values[key].disabled) && (!!split.values[key].min) && (key !== face[split.fieldName]);
                            return (!!split.values[key]) && !(node.splits[split.fieldName][face[split.fieldName]] && node.splits[split.fieldName][face[split.fieldName]].disabled) && (!!split.values[key].min) && (key !== face[split.fieldName]);
                        }).some(function(key){
                            var min = split.values[key].min;
                            // console.log([key, min, face[split.fieldName], node.splits[split.fieldName][key], node.budget, face.finalPrice]);
                            var unfitSplit = (!min) || (min === 100) || (!node.splits[split.fieldName][key]) || ((node.splits[split.fieldName][key].value / (split.type === 'budget' ? (node.budget + face.finalPrice) : (node.level + 2))) < (min / 100));
                            return unfitSplit;
                        }));
                        // console.log('fitMinSplits: ' + fitMinSplits);
                        return fitMinSplits;
                    }

                });
                if (!fitForSplit) {
                    // console.log([me.params.splits, face.supplier, node.splits.supplier, node.level]);
                    me.params.splitFrom = me.params.splitFrom ? Math.min(me.params.splitFrom, i): i;
                    i++;
                    continue;
                }
                // else {
                //     if (face.catab === 'B') {
                //         console.log([me.params.splits, face.catab, node.splits, node.level]);
                //     }
                // }
            }
            candidateCount++;
            var neCells = me.notExists(node.cells, faceCells);
            // if (method !== 'MaxCoverage') {
            if (method === 'MinPrice') {
                if (neCells.length === faceCells.length) {
                    maxIndex = i;
                    break;
                }
                if (!minIntersectedArea || (minIntersectedArea > faceCells.length - neCells.length)) {
                    minIntersectedArea = faceCells.length - neCells.length;
                    maxIndex = i;
                }
            } else {
                if (maxUnionArea < node.cellsCount + neCells.length) {
                    maxUnionArea = node.cellsCount + neCells.length;
                    maxDelta = neCells.length;
                    maxIndex = i;
                }
            }
        }
        i++;
    }
    return maxIndex;
};

fitBoardToSplit = function (node, face) {
    var me = this;
    return me.params.splits.filter(function(split){ return !!split.values;}).every(function(split){
        if (split.values[face[split.fieldName]] && typeof split.values[face[split.fieldName]] !== 'object') {
            // simple splits like A/B: "values: {A: 80, B: 20}"
            // console.log([split, split.values[face[split.fieldName]], face[split.fieldName]]);
            if (split.values[face[split.fieldName]] === 0) {
                return false;
            }
            return (split.values[face[split.fieldName]] > 0) && ( !node.splits[split.fieldName] || !node.splits[split.fieldName][face[split.fieldName]] ||  (((node.splits[split.fieldName][face[split.fieldName]].value + 1) / (node.level + 3)) <= (split.values[face[split.fieldName]] / 100)));
        } else {
            if (split.values[face[split.fieldName]] && split.values[face[split.fieldName]] !== null ) {
                var max = split.values[face[split.fieldName]].max;
                // if (max === 0) { return false; }
                if (max && node.splits[split.fieldName] && node.splits[split.fieldName][face[split.fieldName]] &&  (((node.splits[split.fieldName][face[split.fieldName]].value + (split.type === 'budget' ? face.finalPrice : 1)) / (split.type === 'budget' ? (node.budget + face.finalPrice) : (node.level + 2))) > (max / 100))) { return false; }
                if (split.values[face[split.fieldName]].min && !node.splits[split.fieldName][face[split.fieldName]]) {
                    return true;
                }
            }
            var fitMinSplits = !(Object.keys(split.values).filter(function(key){
                // console.log((!!split.values[key].min) && (key !== face[split.fieldName]));
                // return (!!split.values[key]) && (!split.values[key].disabled) && (!!split.values[key].min) && (key !== face[split.fieldName]);
                return (!!split.values[key]) && !(node.splits[split.fieldName][face[split.fieldName]] && node.splits[split.fieldName][face[split.fieldName]].disabled) && (!!split.values[key].min) && (key !== face[split.fieldName]);
            }).some(function(key){
                var min = split.values[key].min;
                // console.log([key, min, face[split.fieldName]]);
                return (!min) || (min === 100) || (!node.splits[split.fieldName][key]) || ((node.splits[split.fieldName][key].value / (split.type === 'budget' ? (node.budget + face.finalPrice) : (node.level + 2))) < (min / 100));
            }));
            return fitMinSplits;
        }
    });
};

// findBestNextBoardIndex = function (node, fromIndex, store, method) {
//     var me = this, maxDelta = 0, maxUnionArea = 0, maxIndex, candidateCount = 0, minIntersectedArea = 0, splitFrom = node.splitFrom;
//     for (var i = fromIndex; i < store.length && candidateCount <= me.params.maxDeep; i++) {
//         // var faceCells = store.getAt(i).get('cells');
//         // if (!faceCells) {
//         var face = store[i],
//             faceCells = face.cells;
//             // if (faceCells) {
//             //     store.getAt(i).set('cells', faceCells);
//             // }
//         // }
//         if (faceCells && faceCells.length > 0 && me.fitBoardToChain(node, store[i])) {
//             if (me.params.splits && (me.params.splits.some(function(split){
//                 // console.log([newNode.splits, face, split]);
//                 if (split.values && node.splits[split.fieldName]) {
//                     if (split.values[face[split.fieldName]] !== null && (typeof split.values[face[split.fieldName]] === 'object')) {
//                         var min = node.splits[split.fieldName][face[split.fieldName]] && split.values[face[split.fieldName]].min,
//                             max = node.splits[split.fieldName][face[split.fieldName]] && split.values[face[split.fieldName]].max;
//                         return (max && (node.splits[split.fieldName][face[split.fieldName]] / (node.level + 1)) * 100 > max);
//                         //(min && (node.splits[split.fieldName][face[split.fieldName]] / (node.level + 1)) < min) ||
//                     } else {
//                         var res = node.splits[split.fieldName] && node.splits[split.fieldName][face[split.fieldName]] && ((node.splits[split.fieldName][face[split.fieldName]] / (node.level + 1)) > (split.values[face[split.fieldName]] / 100));
//                         // if (! res) {
//                         //     console.log([node.splits[split.fieldName], split.values[face[split.fieldName]], node.level]);
//                         // }
//                         return res;
//                     }
//                 }
//                 else {
//                     return false;
//                 }
//             }) || me.params.splits.some(function(split){
//                 if (!split.values) {return false;}
//                 // var res = false;
//                 var res = Object.keys(split.values).some(function(key){
//                     if ((typeof split.values[key] === 'object') && split.values[key].min && (face[split.fieldName] !== key)) {
//                         var min = split.values[key].min;
//                         return !node.splits[split.fieldName][key] || ((node.splits[split.fieldName][key] / (node.level + 1)) < (min / 100));
//                     } else {
//                         return false;
//                     }
//                 });
//                 // console.log(res);
//                 return res;
//                 // if (split.values && split.values (!node.splits[split.fieldName] || node.splits[split.fieldName]))
//             }))) {
//                 if (!splitFrom || splitFrom > i) {
//                     splitFrom = i;
//                 }
//                 // if (!me.params.splitFrom || me.params.splitFrom > i) {
//                 //     me.params.splitFrom = i;
//                 // }
//                 // console.log(node.splits);
//                 continue;
//             }
//             node.splitFrom = splitFrom;
//             candidateCount++;
//             var neCells = me.notExists(node.cells, faceCells);
//             // if (method !== 'MaxCoverage') {
//             if (method === 'MinPrice') {
//                 if (neCells.length === faceCells.length) {
//                     maxIndex = i;
//                     break;
//                 }
//                 if (!minIntersectedArea || minIntersectedArea > faceCells.length - neCells.length) {
//                     minIntersectedArea = faceCells.length - neCells.length;
//                     maxIndex = i;
//                 }
//             } else {
//                 if (maxUnionArea < node.cellsCount + neCells.length) {
//                     maxUnionArea = node.cellsCount + neCells.length;
//                     maxDelta = neCells.length;
//                     maxIndex = i;
//                 }
//             }
//         }
//     }
//     return maxIndex;
// };

fitBoardToChain = function (parentNode, face) {
    var me = this;
    if (!parseFloat(face.lon) || !parseFloat(face.lat)) {
        // console.log('1');
        return false;
    }
    var boardIds = parentNode.getChainBoardIds();
    if (boardIds[face.id]) {
        // console.log('2');
        return false;
    }
    if (me.params.planBudget && parentNode.budget + face.finalPrice > me.params.planBudget) {
        // console.log('3');
        return false;
    }
    if (me.params.planSizes && (+me.params.planSizes[face.id_size] === 0 || ( (parentNode.sizes[face.id_size] && parentNode.sizes[face.id_size] + 1 > me.params.planSizes[face.id_size])) ) ) {
        return false;
    }
    var res = true;
    var faceStreets = face.streets ? face.streets.split(/\s+/) : [];
    if (faceStreets.filter(function(street){return !!street}).some(function(street){ return me.params.maxOnStreet < parentNode.streets[street] + 1;})) {
        // console.log(['4', faceStreets]);
        return false;
    }
    var node = parentNode;
    while (node && res) {
        // ignore same doorsNo
        // if (face.doors_no === node.face.doors_no) {
        //     res = false;
        //     // console.log('5');
        //     break;
        // }
        var oResStreets = me.convertArrToObj(node.face.streets ? node.face.streets.split(/\s+/) : []);
        if (me.params.minDistanceOnStreet && faceStreets.some(function(street){ return !!oResStreets[street];})) {
            var distance = turf.distance(node.face.turf, face.turf, {units: 'kilometers'}) * 1000;
            res = ( distance >= me.params.minDistanceOnStreet );
        }
        if (res && me.params.minDistance) {
            var distance = turf.distance(node.face.turf, face.turf, {units: 'kilometers'}) * 1000;
            res = ( distance >= me.params.minDistance );
        }
        node = node.parent;
    }
    return res;
};

checkBoard = function (item) {
    var me = this,
        res = true;
    var streets = item.streets.split(/\s+/);
    if (streets.some(function(street){ return me.params.maxOnStreet < me.resultStreets[street] + 1;})) {
        return false;
    }
    for(var i = 0; i < me.resultStore.length && res; i++) {
        // ignore same doorsNo
        // if (item.doors_no === me.resultStore[i].doors_no) {
        //     break;
        // }
        if (!parseFloat(item.lon) || !parseFloat(item.lat)) {
            res = false;
            break;
        }
        var oResStreets = me.convertArrToObj(me.resultStore[i].get('streets').split(/\s+/));
        if (streets.some(function(street){ return !!oResStreets[street];})) {
            res = turf.distance(turf.point([me.resultStore[i].lon, me.resultStore[i].lat]), turf.point([item.lon, item.lat]), {units: 'kilometers'}) * 1000 >= me.params.minDistanceOnStreet;
        } else {
            res = turf.distance(turf.point([me.resultStore[i].lon, me.resultStore[i].lat]), turf.point([item.lon, item.lat]), {units: 'kilometers'}) * 1000 >= me.params.minDistance;
        }
    }
    return res;
};

addStreetsFromFace = function (item) {
    var me = this,
        streets = item.streets;
    if (streets) {
        streets.split(/\s+/).forEach(function(street){
            me.resultStreets[street] = me.resultStreets[street] ? resultStreets[street] + 1 : 1;
        });
    }
};
