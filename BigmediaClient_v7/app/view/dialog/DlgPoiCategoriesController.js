Ext.define('Bigmedia.view.dialog.DlgPoiCategoriesController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.dialog-dlgpoicategories',

    //control: {
    //    'slider': {
    //        '#sliderPoiDist': {
    //            changecomplete: 'onParamsChanged'
    //        }
    //    },
    //    'checkbox': {
    //        '#chbPoiBefore':{
    //            change: 'onParamsChanged'
    //        }
    //    },
    //    'treepanel': {
    //        '#treePoiCat':{
    //            checkchange: 'onTreeCheckChanged'
    //        }
    //    },
    //    'fieldset': {
    //        '#fieldsetPoiTreeCat':{
    //            beforeexpand: 'onFieldsetTreeCatExpand'
    //        }
    //    }
    //},

    listen: {
        store: {
            '#PoiSearch': {
                load: 'onPoiSearchLoad'
            },
            '#PoiLinkCatFaces': {
                load: 'onPoiCategoriesLoad'
            }
        }
    },

    init: function (view) {
        var me = this;
        me.cbPoiTag = view.cbPoiTag;
        if (me.cbPoiTag) {
            me.facesStore = me.cbPoiTag.targetStore;
            me.targetFaces = me.initTargetFaces();
        }
        me.dist = me.lookupReference('Dstn');
        me.before = me.lookupReference('Bfr');
        //me.poiFaces = {};
        //me.catFaces = {};
        //me.selFaces = {};
        //me.emptyFaces = {total: true, cat: true, poi: true};
        me.selPoiStore = new Ext.data.Store({
            model: 'Bigmedia.model.Poi'
        });
    },

    clearTreeView: function () {
        var treeCat = this.lookupReference('treeCat');

        function clearNode (node) {
            node.set('checked', false);
            if (node !== treeCat.getRootNode()) {
                treeCat.collapseNode(node);
            }
            var children = node.childNodes;
            children.forEach(function (child) {
                clearNode(child);
            });
        }
        clearNode(treeCat.getRootNode());
    },

    clearWindow: function () {
        var me = this;
        me.clearTreeView();
        me.lookupReference('poisearch').setValue([]);
        me.dist.setValue(3000);
        me.before.setValue(false);
        me.lookupReference('fieldsetDistBefore').collapse();
        me.lookupReference('fieldsetPoiTreeCat').collapse();
        me.lookupReference('fieldsetPoiSearch').collapse();
        me.poiFaces = {};
        me.catFaces = {};
        me.selFaces = {};
        me.emptyFaces = {total: true, cat: true, poi: true};
        me.updateCreateButton();
    },

    updateCreateButton: function () {
        var me = this,
            btn = me.lookupReference('btnCreateFilter'),
            totalFacesCount = Object.keys(me.selFaces).length,
            sb = me.lookupReference('statusBar');
        if (!me.emptyFaces.total) {
            btn.enable();
            sb.setStatus({
                text: Bigmedia.Locales.dlgPoiCategoriesStatusReady,
                iconCls: 'ready-icon'
            });
            sb.items.get(0).text = Ext.String.format(Bigmedia.Locales.dlgPoiCategoriesStatusReady, totalFacesCount);
        } else {
            btn.disable();
            sb.clearStatus();
            sb.items.get(0).text = '';
        }
    },

    onFieldsetTreeCatExpand: function () {
        var me = this,
            catStore = Ext.getStore('PoiLinkCatFaces'),
            treeCat = me.lookupReference('treeCat');
        //console.log('onFieldsetTreeCatExpand');
        if (!catStore.isLoaded()) {
            //treeCat.rootVisible = false;
            var root = treeCat.getRootNode();
            treeCat.expandNode(root);
            //root.set('visible',false);
            //catStore.load();
            treeCat.collapseAll();
            //treeCat.expandNode(root);
        }
    },

    onCloseWindowClick: function () {
        this.getView().hide();
    },

    onShowView: function (view) {
        var me = this,
            catStore = Ext.getStore('PoiLinkCatFaces'),
            treeCat = me.lookupReference('treeCat');

        if (view.cbPoiTag) {
            me.facesStore = view.cbPoiTag.targetStore;
            me.targetFaces = me.initTargetFaces();
        }
        me.clearWindow();
        //if (!catStore.isLoaded()) {
        //    //treeCat.rootVisible = false;
        //    //var root = treeCat.getRootNode();
        //    //root.set('visible',false);
        //    //catStore.load();
        //    //treeCat.collapseAll();
        //}
    },

    mergeFaces: function (dst, src) {
        var res = {};
        for (var key in dst) {
            res[key] = dst[key];
        }
        for (var key in src) {
            if (!res[key]) {
                res[key] = src[key];
            }
            else {
                res[key].d = Math.min(dst[key].d, src[key].d);
                if (res[key].b == null) {
                    res[key].b = src[key].b;
                }
                else if (src[key].b != null) {
                    res[key].b = Math.min(res[key].b, src[key].b);
                }
            }
        }
        return res;
    },

    setCatFaces: function (faces) {
        var me = this;
        me.catFaces = faces;
        me.emptyFaces.cat = Object.keys(faces).length == 0;
        me.selFaces = me.mergeFaces(faces, me.poiFaces);
        me.emptyFaces.total = me.emptyFaces.cat && me.emptyFaces.poi;
        me.updateCreateButton();
    },

    setPoiFaces: function (faces) {
        var me = this;
        me.poiFaces = faces;
        me.emptyFaces.poi = Object.keys(faces).length == 0;
        me.selFaces = me.mergeFaces(faces, me.catFaces);
        me.emptyFaces.total = me.emptyFaces.cat && me.emptyFaces.poi;
        me.updateCreateButton();
    },

    initTargetFaces: function () {
        var store = this.facesStore;
        if (!store.getData().filtered) {
            return null;
        }
        var appliedFilters = store.getData().getFilters().clone();
        if (appliedFilters.get('filterpoi')) {
            appliedFilters.removeByKey('filterpoi');
        }
        if (appliedFilters.length > 0) {
            var loaded = {};
            var clonedData = store.getData().getSource().clone();
            clonedData.setFilters(appliedFilters);
            clonedData.each(function (record) {
                if (!loaded[record.get('id')]) {
                    loaded[record.get('id')] = 1;
                }
                else {
                    loaded[record.get('id')]++;
                }
            });
            clonedData.destroy();
            return loaded;
        }
        appliedFilters.destroy();
        return null;
    },

    getTargetFaces: function () {
        return this.targetFaces;
    },

    genNewName: function () {
        var me = this,
            view = me.getView(),
            treeCat = me.lookupReference('treeCat'),
            poiSearch = me.lookupReference('poisearch'),
            name = '';
        function getPoiNames(){
            var names = [];
            me.selPoiStore.each(function(rec){
                names.push(rec.get('name'));
            });
            return names.join(', ');
        }
        function getCheckedNodes (node) {
            if (node.get('checked')) {
                return [node];
            }
            if (node.childNodes.length > 0) {
                var children = node.childNodes;
                return children.reduce(function (checked, child) {
                    return checked.concat(getCheckedNodes(child));
                }, []);
            }
            else {
                return [];
            }
        }
        /* tree.getChecked() not applicable, we don't need add checked children if parent is checked*/
        function getCatNames() {
            var nodes = getCheckedNodes(treeCat.getRootNode());
            var names = nodes.map(function(item){ return item.get('name');});
            return names.join(', ');
        }
        if(poiSearch.getValue().length>0){
            name = getPoiNames();
        } else if (treeCat.getChecked().length>0) {
            name = getCatNames();
        }
        name = Ext.String.ellipsis(name,30);
        if(me.dist.getValue() < 3000 || me.before.getValue()){ name += ' ' + Bigmedia.Locales.poiFilterSetNameParamLimits;}
        return name;
    },

    genNewDescr: function () {
        var me = this,
            view = me.getView(),
            treeCat = me.lookupReference('treeCat'),
            poiSearch = me.lookupReference('poisearch'),
            name = '';
        function getPoiNames(){
            var names = [];
            me.selPoiStore.each(function(rec){
                names.push(rec.get('name'));
            });
            return names.join(', ');
        }
        function getCheckedNodes (node) {
            if (node.get('checked')) {
                return [node];
            }
            if (node.childNodes.length > 0) {
                var children = node.childNodes;
                return children.reduce(function (checked, child) {
                    return checked.concat(getCheckedNodes(child));
                }, []);
            }
            else {
                return [];
            }
        }
        /* tree.getChecked() not applicable, we don't need add checked children if parent is checked*/
        function getCatNames() {
            var nodes = getCheckedNodes(treeCat.getRootNode());
            var names = nodes.map(function(item){ return item.get('name');});
            return names.join(', ');
        }
        if(poiSearch.getValue().length>0){
            name = Ext.String.format(Bigmedia.Locales.poiFilterSetDescrObjects,poiSearch.getValue().length) + ' ' + getPoiNames();
        }
        if (treeCat.getChecked().length>0) {
            name = Ext.String.format(Bigmedia.Locales.poiFilterSetDescrCategories,treeCat.getChecked().length) + ' ' + getCatNames();
        }
        name = Ext.String.ellipsis(name,40);
        if(me.dist.getValue() < 3000 || me.before.getValue()){
            name += ' ' + Bigmedia.Locales.poiFilterSetDescrParamLimits;
            if(me.dist.getValue() < 3000){
                name += ' ' + Ext.String.format(Bigmedia.Locales.poiFilterSetDescrParamDist,me.dist.getValue());
            }
            if(me.before.getValue()){
                name += ' ' + Bigmedia.Locales.poiFilterSetDescrParamBefore;
            }
        }
        return name;
    },

    onCreateFilterClick: function () {
        var me = this,
            view = me.getView(),
            poiTag = view.cbPoiTag,
            tagStore = poiTag.getStore();
        var validFaces = Object.keys(me.selFaces).reduce(function(validFaces,fid){
            if(me.isFittingDistance(me.selFaces[fid])){
                validFaces[fid] = fid;
            }
            return validFaces;
        },{});
        var items = tagStore.add({
            name: me.genNewName(),
            descr: me.genNewDescr(),
            totalCount: Object.keys(validFaces).length,
            addCount: Object.keys(validFaces).length,
            faces: validFaces
        });
        var oldVal = poiTag.getValue();
        tagVal = oldVal.concat(items[0].id);
        poiTag.setValue(tagVal);
        poiTag.updateValue();
        poiTag.fireEventArgs('change',[poiTag, tagVal, oldVal, true]);
        view.hide();
    },

    getCurrentFaceList: function () {

    },

    isFittingDistance: function (face) {
        var me = this,
            d = me.dist,
            b = me.before;
        return face.d <= d.getValue() && (!b.getValue() || (face.b != null && face.b <= d.getValue()));
    },

    inCatFaces: function (fid) {
        var me = this;
        return me.emptyFaces ? (me.emptyFaces.cat || me.catFaces[fid]) : null;
    },

    inPoiFaces: function (fid) {
        var me = this;
        return me.emptyFaces.poi || me.poiFaces[fid];
    },

    isFittingFace: function (face, fid) {
        var me = this,
            d = me.dist,
            b = me.before;
        /*(Object.keys(me.selFaces).length == 0 || me.selFaces[fid]) &&*/
        return (me.emptyFaces.total || me.selFaces[fid]) && me.isFittingDistance(face);
    },

    onPoiCategoriesLoad: function (poiCatStore, records, successful) {
        if (!successful) {
            return;
        }
        var me = this,
            store = me.facesStore;

        var loaded = me.getTargetFaces();

        function initCategory (rec) {
            var totalLoaded = {};
            if (rec.childNodes.length > 0) {
                var children = rec.childNodes;
                children.forEach(function (child) {
                    var childLoaded = initCategory(child);
                    totalLoaded = me.mergeFaces(totalLoaded, childLoaded);
                });
            }
            var faces = {};
            if (rec.get('faces') && rec.get('faces') !== null) {
                faces = rec.get('faces');
            }
            totalLoaded = me.mergeFaces(totalLoaded, faces);
            var total = Object.keys(totalLoaded).length;

            var addVal = 0, subVal = 0;

            //if (loaded) {
            Object.keys(totalLoaded).forEach(function (fid) {
                if ((!loaded || loaded[fid]) && me.isFittingDistance(totalLoaded[fid]) && me.inPoiFaces(fid)) {
                    addVal++;
                }
            });
            //}
            //else {
            //    addVal = total;
            //}
            rec.set({totalCount: total, faces: totalLoaded, addCount: addVal}, {
                commit: true,
                silent: false
            });
            return totalLoaded;
        }

        records.forEach(function (rec) {
            initCategory(rec);
        });
    },

    getSelectedTreeFaces: function () {
        var me = this,
            tree = me.lookupReference('treeCat');

        function getChecked (node) {
            if (node.get('checked')) {
                return [node];
            }
            if (node.childNodes.length > 0) {
                var children = node.childNodes;
                return children.reduce(function (checked, child) {
                    return checked.concat(getChecked(child));
                }, []);
            }
            else {
                return [];
            }
        }

        /* tree.getChecked() not applicable, we don't need add checked children if parent is checked*/
        var nodes = getChecked(tree.getRootNode());
        return nodes.reduce(function (faces, item) {
            return me.mergeFaces(faces, item.get('faces'));
        }, {});
    },

    onTreeCheckChanged: function (node, checked) {
        function checkChange (item) {
            //if (item !== node) {
                item.set('checked', item.get('addCount')>0 && checked);
            //}
            if (item.childNodes.length > 0) {
                var children = item.childNodes;
                children.forEach(function (child) {
                    checkChange(child);
                });
            }
        }

        checkChange(node);
        this.setCatFaces(this.getSelectedTreeFaces());
        this.recalcPoi();
    },

    onParamsChanged: function (slider, newValue, thumb, eOpts) {
        this.recalcCats();
        this.recalcPoi();
    },

    onPoiValueChanged: function (tag, newVal, oldVal) {
        var me = this;
        //me.selPoiStore.each(function(selRec){
        //    var isSelected = Ext.Array.some(newVal,function(selId){
        //        return selId == selRec.id;
        //    });
        //    if(!isSelected){
        //        me.selPoiStore.remove(selRec);
        //    }
        //});
        me.selPoiStore.removeAll(true);
        if (newVal !== oldVal) {
            if (newVal.length > 0) {
                newVal.forEach(function (item) {
                    //var rec = me.selPoiStore.getById(item);
                    //if (!rec) {
                    var rec = tag.getStore().getById(item);
                    me.selPoiStore.add(rec);
                    //}
                });
            }
        }
        var total = {};
        me.selPoiStore.each(function (selRec) {
            total = me.mergeFaces(total, selRec.get('faces'));
        });
        me.setPoiFaces(total);
        me.recalcCats();
    },

    onPoiSearchLoad: function (poiStore, records, successful) {
        var me = this,
            store = me.facesStore;

        me.selPoiStore.each(function (selRec) {
            poiStore.add(selRec);
        });

        if (!successful) {
            return;
        }

        var loaded = me.getTargetFaces();

        function initPoi (rec) {
            var faces = {};
            if (rec.get('faces') && rec.get('faces') !== null) {
                faces = rec.get('faces');
            }
            var total = Object.keys(faces).length;

            var addVal = 0;

            Object.keys(faces).forEach(function (fid) {
                //if (totalLoaded[fid].d <= d.getValue() && (!b.getValue() || (totalLoaded[fid].b != null && totalLoaded[fid].b <= d.getValue()))) {
                if ((!loaded || loaded[fid]) && me.isFittingDistance(faces[fid]) && me.inCatFaces(fid)) {
                    addVal++;
                }

            });
            rec.set({totalCount: total, addCount: addVal}, {
                commit: true,
                silent: false
            });
        }

        records.forEach(function (rec) {
            initPoi(rec);
        });
    },
    recalcCats: function () {
        var me = this,
            refStore = me.lookupReference('treeCat').getStore();

        var loaded = me.getTargetFaces();

        function recalcCategory (rec) {
            if (rec.childNodes.length > 0) {
                var children = rec.childNodes;
                children.forEach(function (child) {
                    recalcCategory(child);
                });
            }
            var faces = {};
            if (rec.get('faces') && rec.get('faces') !== null) {
                faces = rec.get('faces');
            }
            var addVal = 0;
            Object.keys(faces).forEach(function (fid) {
                if (me.isFittingDistance(faces[fid]) && me.inPoiFaces(fid)) {
                    if (!loaded || loaded[fid]) {
                        addVal++;
                    }
                }
            });

            if(addVal == 0 && rec.get('checked')){
                rec.set('checked',false);
            }

            rec.set({addCount: addVal}, {
                commit: true,
                silent: false
            });
        }

        if (refStore) {
            refStore.each(function (refRec) {
                recalcCategory(refRec);
            });
        }
    },

    recalcPoi: function () {
        var me = this,
            tag = me.lookupReference('poisearch'),
            tagStore = tag.getStore(),
            selStore = me.selPoiStore;
        var loaded = me.getTargetFaces();

        selStore.each(function (selRec) {
            if (!tagStore.getById(selRec.id)) {
                tagStore.add(selRec);
            }
        });

        var source = tagStore.getData().getSource() || tagStore.getData();

        source.each(function (rec) {
            var faces = {};
            if (rec.get('faces') && rec.get('faces') !== null) {
                faces = rec.get('faces');
            }
            var addVal = 0;

            Object.keys(faces).forEach(function (fid) {
                //if (totalLoaded[fid].d <= d.getValue() && (!b.getValue() || (totalLoaded[fid].b != null && totalLoaded[fid].b <= d.getValue()))) {
                if ((!loaded || loaded[fid]) && me.isFittingDistance(faces[fid]) && me.inCatFaces(fid)) {
                    addVal++;
                }

            });
            rec.set({addCount: addVal}, {
                commit: true,
                silent: false
            });
        });
        tag.updateValue();
    }
});
