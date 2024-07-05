Ext.define('Bigmedia.view.dialog.DlgFilterByNumberControllerOld', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.dialog-dlgfilterbynumberold',

    onShowView: function (view) {
        var me = this,
            filterName = me.lookupReference('filtername');
        me.validateForm();

        if (view.cbPoiTag) {
            me.facesStore = view.cbPoiTag.getTargetStore();
            // console.log(view.cbPoiTag);
            var filtersCount = view.cbPoiTag.getValue().length + view.cbPoiTag.getStore().getCount() + 1;
            me.lookupReference('filtername').setValue(me.genDefaultName());
            //me.targetFaces = me.initTargetFaces();
        }
    },

    onCloseWindowClick: function () {
        this.getView().hide();
    },

    validateForm: function () {
        var me = this,
            searchSideNo = me.lookupReference('chbsideno').getValue(),
            searchDoorsNo = me.lookupReference('chbdoorsno').getValue(),
            btn = me.lookupReference('btnCreateFilter'),
            numbersTextArea = me.lookupReference('numbers');
        var numbers = numbersTextArea.getValue().split(/[\s,;\n]+/).filter(function(item){ return item.match(/\w+/);});
        if ((searchSideNo || searchDoorsNo) && numbers.length>0 ) {
            btn.enable();
        } else {
            btn.disable();
        }
    },

    genDefaultName: function () {
        var me = this,
            view = me.getView(),
            filtersCount = view.cbPoiTag.getValue().length + view.cbPoiTag.getStore().getCount() + 1;
        return Bigmedia.Locales.dlgFilterByNumberDefaultFilterName + filtersCount;
    },

    genNewName: function () {
        var me = this,
            numbers = me.lookupReference('numbers').getValue(),
            filterName = me.lookupReference('filtername').getValue();
        var name = filterName || me.genDefaultName();
        return name;
    },

    genNewDescr: function () {
        var me = this,
            numbersText = me.lookupReference('numbers').getValue();
        var numbers = numbersText.split(/[\s,;\n]+/).filter(function(item){ return item.match(/\w+/);});
        var name = Bigmedia.Locales.dlgFilterByNumberFilterDescr + Ext.String.ellipsis(numbers.join(','), 50);
        return name;
    },

    onCreateFilterClick: function () {
        var me = this,
            view = me.getView(),
            poiTag = view.cbPoiTag,
            tagStore = poiTag.getStore(),
            numbers = me.lookupReference('numbers').getValue();
        var validFaces = me.parseNumbers(numbers);
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
        poiTag.fireEventArgs('change', [poiTag, tagVal, oldVal, true]);
        view.hide();
    },

    parseNumbers: function (numbers) {
        var me = this,
            searchSideNo = me.lookupReference('chbsideno').getValue(),
            searchDoorsNo = me.lookupReference('chbdoorsno').getValue(),
            faces = {};

        testObj = numbers.split(/[\s,;\n]+/).reduce(function(res,num){ res[num] = num; return res;},{});

        var source = me.getView().cbPoiTag.getTargetStore().getData();
        var sides = Ext.getStore('Sides');

        if(source.filtered){ source = source.getSource();}
        source.each(function(rec){
            if ((searchSideNo && testObj[rec.get('num')]) || (searchDoorsNo && testObj[rec.get('doors_no')])) {
                faces[rec.getId()] = rec.getId();
            }
        });
        sides.each(function(rec){
            if ((searchSideNo && testObj[rec.get('num')]) || (searchDoorsNo && testObj[rec.get('doorsNo')])) {
                faces[rec.get('faceId')] = rec.get('faceId');
            }
        });

        return faces;
    }

});
