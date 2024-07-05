Ext.define('Bigmedia.view.field.PeriodFilterTagController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.field-periodfiltertag',

    filterChanged: false,
    suppressRefresh: false,

    //init: function (view) {
    //    this.selStore = new Ext.data.Store({
    //        model: 'Bigmedia.model.Street'
    //    });
    //},

    // listeners: {
    //     targetstoredatachanged: function () {
    //         this.onTargetStoreDataChanged();
    //     }
    // },

    newPeriodFilterClick: function () {
        var me = this,
            mv = me.getView().findParentByType('mainviewport');
        if(mv){
            //mv.dlgPoiCat.cbPoiTag = me.getView();
            mv.dlgCustomPeriod.showDialog(me.getView());
        }
    },

    // connectToStore: function (targetStore) {
    //     var me = this;
    //     if (me.storeRelayers) {
    //         Ext.destroy(me.storeRelayers);
    //         me.storeRelayers = null;
    //         var reconnect = true;
    //     }
    //     me.storeRelayers = me.relayEvents(targetStore, ['datachanged'], 'targetstore');
    //     //me.initTotal();
    //     //if (reconnect) {
    //     //    this.syncAll();
    //     //}
    // },

    //onStreetsLoad: function (refStore, records, successful, operation, eOpts) {
    //    if (!successful) {
    //        return;
    //    }
    //    var me = this;
    //    me.selStore.each(function(selRec){
    //        refStore.add(selRec);
    //    });
    //    me.initTotal();
    //    if (me.getView().targetStore.getData().filtered) {
    //        me.syncAll();
    //    }
    //},

    onBeforeTagExpand: function () {
        var me = this,
            view = me.getView();
        //if (view.getStore().getCount() == 0){
        //    me.initTotal();
        //}
        if (me.filterChanged) {
            me.syncAll();
            view.getPicker().refresh();
        }
    },

    onTargetStoreDataChanged: function () {
        console.log('targetstorechanged');
        var me = this,
            tag = me.getView();
        if (!tag.targetStore.isSorting && !me.suppressRefresh) {
            me.filterChanged = true;
            if (tag.getValue().length > 0) {
                me.syncVisible();
                tag.updateValue();
            }
        }
        me.suppressRefresh = false;
    },

    onTagValueChanged: function (tag, newVal, oldVal, forceRefresh) {
        var me = this;
        if (newVal !== oldVal) {
            var store = tag.targetStore,
                refStore = tag.getStore();
            if (newVal.length > 0) {
                if (oldVal.length > 0) {
                    me.suppressRefresh = true;
                    store.removeFilter('filter' + tag.filterField, true);
                }
                var faces = [];
                newVal.forEach(function (item) {
                    rec = refStore.getById(item);
                    if (rec && rec.get('faces')) {
                        faces = faces.concat(Object.keys(rec.get('faces')));
                    }
                });
                //console.log(faces);
                faces = faces.map(function (f) {
                    return +f;
                });
                //console.log(faces);
                var periodFilter = new Ext.util.Filter({
                    property: 'id',
                    id: 'filter' + tag.filterField,
                    operator: 'in',
                    value: faces
                });
                if(forceRefresh){
                    me.suppressRefresh = false;
                    me.forceRefresh = true;
                }
                store.addFilter(periodFilter);
            }
            else {
                me.suppressRefresh = true;
                store.removeFilter('filter' + tag.filterField);
            }
        }
    },

    //onBeforeTagExpand: function () {
    //    var me = this,
    //        view = me.getView();
    //    if (me.filterChanged) {
    //        me.syncAll();
    //        view.getPicker().refresh();
    //    }
    //}
    //,

    initTotal: function () {
        // console.log('initTotal start');
        var me = this,
            tag = me.getView(),
            tagStore = tag.getStore(),
            store = tag.targetStore,
            now = new Date(),
            startMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1)),
            tmp = [startMonth.getUTCDate(), startMonth.getUTCMonth() + 1, startMonth.getUTCFullYear()],
            monthes = {};

        var Month = function (year, mon, day) {
            mem = this;
            mem.day = (day || 1);
            mem.month = mon > 12 ? mon - 12 : mon;
            mem.year = mon > 12 ? year + 1 : year;
            mem.days = new Date(Date.UTC(year, mon, 0)).getUTCDate() - mem.day + 1;
            mem.emptyDays = mem.days - mem.day + 1;
            mem.free = 0;
            // mem.startDayIndex = Math.round((+(new Date(Date.UTC(year, mon, day))) - startMonth) / (1000 * 60 * 60 * 24));
            //this.genCalendar = me.genCalendar;
            // var ftRe = new RegExp('([ft]+)', 'g');
            var ftRe = /([ft]+)/g;
            mem.execOcc = function (occByDays) {
                // var start = mem.startDayIndex;
                var days = mem.days;
                var faceOccByDays = occByDays.slice(0, days);
                var freePeriods;
                if (faceOccByDays.matchAll) {
                    freePeriods = Array.from(faceOccByDays.matchAll(/([ft]+)/g));
                } else {
                    var res;
                    freePeriods = [];
                    while (res = ftRe.exec(faceOccByDays)) {
                        freePeriods.push(res[1]);
                    }
                }
                mem.free = freePeriods.reduce(function(res, per){
                    return res >= per.length ? res : per.length;
                }, 0);
                return occByDays.slice(days)
            }

            mem.saveMonth = function (faceId, filtered) {
                if (monthes[mem.year+'_'+mem.month]) {
                    monthes[mem.year+'_'+mem.month].totalCount++;
                    monthes[mem.year+'_'+mem.month].addCount++;
                    monthes[mem.year+'_'+mem.month].faces[faceId] = faceId;
                } else {
                    var faces = {};
                    faces[faceId] = faceId;
                    monthes[mem.year+'_'+mem.month] = {
                        name: Ext.Date.monthNames[(mem.month % 12) ? (mem.month % 12) - 1 : 11] + '&#39;' + mem.year.toString().slice(-2),
                        totalCount: 1,
                        addCount: 1,
                        faces: faces
                    };
                }
            }
        };
        var source = store.getData();
        if(source.filtered){ source = source.getSource();}
        source.each(function(rec){
            var occ = rec.get('occByDays'),
                recFiltered = store.getData().isItemFiltered(rec);
            if (occ) {
                var curMonth = new Month(+tmp[2], +tmp[1], +tmp[0]);
                while (occ.length > 0) {
                    occ = curMonth.execOcc(occ);
                    if (curMonth.free > 0) {
                        curMonth.saveMonth(rec.getId(), recFiltered);
                    }
                    curMonth = new Month(curMonth.year, curMonth.month + 1);
                }
            }
        });
        tagStore.loadRawData(Object.values(monthes));
        me.filterChanged = false;
        // console.log('initTotal end');
    },

    // initTotal: function () {
    //     var me = this,
    //         tag = me.getView(),
    //         tagStore = tag.getStore(),
    //         store = tag.targetStore,
    //         now = new Date(),
    //         startMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1)),
    //         tmp = [startMonth.getUTCDate(), startMonth.getUTCMonth() + 1, startMonth.getUTCFullYear()];
    //
    //     var Month = function (year, mon, day) {
    //         mem = this;
    //         mem.day = (day || 1);
    //         mem.month = mon;
    //         mem.year = year;
    //         mem.days = new Date(Date.UTC(year, mon, 0)).getUTCDate();
    //         mem.emptyDays = mem.days - mem.day + 1;
    //         mem.free = 0;
    //         //this.genCalendar = me.genCalendar;
    //
    //         mem.addPeriod = function (days, status) {
    //             var diff = days - mem.emptyDays;
    //             if(status == 'f' || status == 't'){
    //                 mem.free += Math.min(days,mem.emptyDays);
    //             }
    //             if (diff <= 0) {
    //                 mem.emptyDays = Math.abs(diff);
    //             }
    //             else {
    //                 mem.emptyDays = 0;
    //             }
    //             return diff;
    //         }
    //
    //         mem.saveMonth = function (faceId, filtered) {
    //             var m = tagStore.getById(mem.year+'_'+mem.month),
    //                 addCount = filtered ? 0 : 1;
    //             if(!m){
    //                 var faces = {};
    //                 faces[faceId] = mem.free;
    //                 tagStore.add({
    //                     id: mem.year+'_'+mem.month,
    //                     name: Ext.Date.monthNames[mem.month - 1] + '&#39;' + mem.year.toString().slice(-2),
    //                     totalCount: 1,
    //                     addCount: addCount,
    //                     faces: faces
    //                 });
    //             }
    //             else{
    //                 var faces = m.get('faces');
    //                 faces[faceId] = mem.free;
    //                 m.set({totalCount: m.get('totalCount')+1, addCount: m.get('addCount')+addCount, faces: faces});
    //             }
    //         }
    //     };
    //
    //     var res,
    //         re = /(\d+)(\w)/g;
    //     //console.log(m.occ);
    //     //while ((res = re.exec(newValues.occ)) != null) {
    //
    //     var source = store.getData();
    //     if(source.filtered){ source = source.getSource();}
    //     source.each(function(rec){
    //         var occ = rec.get('occupancy'),
    //             recFiltered = store.getData().isItemFiltered(rec);
    //         var curMonth = new Month(+tmp[2], +tmp[1], +tmp[0]);
    //         while ((res = re.exec(occ)) != null) {
    //             var restDays = +res[1],
    //                 status = res[2];
    //             while (restDays > 0) {
    //                 if (curMonth.emptyDays == 0) {
    //                     if(curMonth.free > 0){
    //                         curMonth.saveMonth(rec.getId(), recFiltered);
    //                     }
    //                     curMonth = new Month(curMonth.year, curMonth.month + 1);
    //                 }
    //                 restDays = curMonth.addPeriod(restDays, status);
    //             }
    //         }
    //         if(curMonth.free > 0){
    //             curMonth.saveMonth(rec.getId(), recFiltered);
    //         }
    //     });
    //     me.filterChanged = false;
    // },

    syncVisible: function () {
        var me = this,
            tag = me.getView(),
            tagStore = tag.getStore(),
            store = tag.targetStore,
            tagVal = tag.getValue(),
            loaded = {};
        if (tagVal.length == 0) {
            return;
        }
        store.each(function (rec) {
            tagVal.forEach(function (refId) {
                var refRec = tagStore.getById(refId);
                if (!refRec) {
                    // console.log(refId);
                }
                else {
                    var faces = refRec.get('faces');
                    if (faces && faces[rec.id]) {
                        if (!loaded[refId]) {
                            loaded[refId] = 1;
                        }
                        else {
                            loaded[refId]++;
                        }
                    }
                }
            });
        });
        tagVal.forEach(function (refId) {
            var rec = tagStore.getById(refId);
            if (rec) {
                rec.set('addCount', loaded[refId]);
            }
        });
    },

    syncAll: function () {
        var me = this,
            tag = me.getView(),
            store = tag.targetStore,
            tagStore = tag.getStore();

        if (store.getData().filtered) {

            var appliedFilters = store.getData().getFilters().clone();
            if (appliedFilters.get('filter' + tag.filterField)) {
                appliedFilters.removeByKey('filter' + tag.filterField);
            }
            if (appliedFilters.length == 0) {
                Ext.destroy(appliedFilters);
                tagStore.each(function (refRec) {
                    refRec.set('addCount', refRec.get('totalCount'));
                });
            } else {
                var clonedData = store.getData().getSource().clone();
                clonedData.setFilters(appliedFilters);
                var loaded = {};

                tagStore.each(function (refRec) {
                    if (!loaded[refRec.id]) {
                        loaded[refRec.id] = 0;
                    }
                    var faces = refRec.get('faces');
                    if (faces) {
                        Object.keys(faces).forEach(function (idf) {
                            if (clonedData.find('id', idf)) {
                                loaded[refRec.id]++;
                            }
                        });
                    }
                });
                tagStore.each(function (refRec) {
                    refRec.set('addCount', loaded[refRec.id]);
                });
                Ext.destroy(clonedData);
                Ext.destroy(appliedFilters);
            }

            //clonedData.each(function (record) {
            //    tagStore.each(function (refRec) {
            //        var faces = refRec.get('faces');
            //        if(!faces){loaded[refRec.id] = 0;}
            //        else if (faces[record.get('id')]) {
            //            if (!loaded[refRec.id]) {
            //                loaded[refRec.id] = 1;
            //            }
            //            else {
            //                loaded[refRec.id]++;
            //            }
            //        }
            //    });
            //    appliedFilters.destroy();
            //    clonedData.destroy();
            //    tagStore.each(function (refRec) {
            //        refRec.set({addCount: loaded[refRec.id]}, {
            //            commit: true,
            //            silent: false
            //        });
            //    });
            //});
        } else {
            tagStore.each(function (refRec) {
                refRec.set({addCount: refRec.get('totalCount')});
            });
        }
    }
});
