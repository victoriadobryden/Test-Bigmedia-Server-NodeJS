Ext.define("Bigmedia.view.field.PoiTag", {
    extend: "Bigmedia.view.field.RefTag",
    xtype: "poitag",

    requires: [
        "Bigmedia.Locales"
    ],

    ref_name: 'poi',
    targetGrid: '',
    filterField: 'poi',
    labelWidth: 60,
    displayField: 'name',
    valueField: 'id',
    filterPickList: true,

    publishes: 'value',
    filterChanged: true,
    suppressRefresh: false,
    forceRefresh: false,
    store: {
        fields: ['id', 'name', 'descr',
            {name: 'totalCount', type: 'int', defaultValue: '0'},
            {name: 'addCount', type: 'int', defaultValue: '0'},
            {name: 'subCount', type: 'int', defaultValue: '0'}],
        data : []
    },
    labelTpl: new Ext.XTemplate('{name}<tpl if="subCount &gt; 0"><span class="tagfield-badge">-{subCount}</span></tpl>', { //{[this.inGrid(values.id, targetGrid, filterField)]}
            disableFormats: true
        }
    ),
    tipTpl: new Ext.XTemplate('{descr}', {disableFromats: true}),
    tpl: new Ext.XTemplate(
        '<ul class="x-list-plain"><tpl for=".">',
        '<li role="option" class="x-boundlist-item <tpl if="addCount &lt;= 0">x-boundlist-item-disabled</tpl>">{city}, {name}<tpl if="addCount &gt; 0"><span class="tagfield-badge">+{addCount}</span></tpl></li>', //{[this.inGrid(values.id, targetGrid, filterField)]}
        '</tpl></ul>',
        {
            disableFormats: true
        }
    ),

    initTag: function () {
        var tag = this;
        Ext.getCmp(tag.targetGrid).onAfter('datachanged', function () {
            if (!Ext.getCmp(tag.targetGrid).isSorting) {
                tag.filterChanged = true;
                tag.syncTag();
            }
        });
    },
    syncTag: function () {
        if ((this.forceRefresh || this.getRawValue() !== '') && !this.suppressRefresh) {
            this.recalcRefData();
        }
        this.forceRefresh = false;
        if (!this.suppressRefresh) {
            this.updateValue();
        }
        this.suppressRefresh = false;
    },
    initComponent: function () {
        //this.addListener('beforeexpand', this.initAddit);
        //this.addListener('beforecollapse');
        this.onBefore('expand', this.beforeExpand);
        this.callParent([arguments]);
    },
    beforeExpand: function () {
        //if (this.getRawValue() !== '') {
        //    //this.forceRefresh = true;
        //    this.recalcRefData();
        //    //this.syncTag();
        //    this.getPicker().refresh();
        //}
        //this.getPicker().refresh();
    },
    recalcRefData: function () {
        var combo = this;

        //console.log('recalcRefData');

        var store = Ext.getCmp(combo.targetGrid).getStore();
        var refStore = this.getStore();

        //refStore.each(function (rec) {
        //    var faces = rec.get('faces');
        //    //console.log(faces);
        //    var loaded = 0;
        //    faces.forEach(function (item) {
        //        if (store.getById(item)) {
        //            loaded++;
        //        }
        //    });
        //    rec.set({totalCount: loaded}, {
        //        commit: true,
        //        silent: true
        //    });
        //});

        //if (!this.filterChanged) {
        //    return;
        //}

        if (store.getData().filtered) {
            var clonedData = store.getData().getSource().clone();
            var loaded = {}, missed = {};
            var appliedFilters = store.getData().getFilters().clone();
            if (appliedFilters.get('filter' + combo.filterField)) {
                appliedFilters.removeByKey('filter' + combo.filterField);
            }
            clonedData.setFilters(appliedFilters);
            clonedData.each(function (record) {

                if (store.getData().find('id', record.get('id'))) {
                    if (!missed[record.get('id')]) {
                        missed[record.get('id')] = 1;
                    }
                    else {
                        missed[record.get('id')]++;
                    }
                }
                if (!loaded[record.get('id')]) {
                    loaded[record.get('id')] = 1;
                }
                else {
                    loaded[record.get('id')]++;
                }
            });
            appliedFilters.destroy();

            clonedData.destroy();
        }

        if (refStore) {
            refStore.getData().getSource().each(function (refRec) {
                    var addVal = 0, subVal = 0;
                    if (store.getData().filtered) {
                        var faces = refRec.get('faces');
                        faces.forEach(function (f) {
                            if (loaded[f]) {
                                addVal++;
                            }
                            if (missed[f]) {
                                subVal++;
                            }
                        });
                    }
                    else {
                        addVal = refRec.get('totalCount') || 0;
                        subVal = refRec.get('totalCount') || 0;
                    }
                    refRec.set({addCount: addVal, subCount: subVal}, {
                        commit: true,
                        silent: true
                    });
                }
            );
        }
        this.filterChanged = false;
    },
    listeners: {
        beforeselect: function (combo, record) {
            return record.get('addCount') > 0;
        },
        change: function (combo, newVal, oldVal) {

            if (newVal !== oldVal) {

                if (newVal.length > 0) {
                    var store = Ext.getCmp(combo.targetGrid).getStore();
                    //combo.suppressRefresh = true;
                    if (oldVal.length > 0) {
                        combo.suppressRefresh = true;
                        store.removeFilter('filterpoi', true);
                    }
                    var refStore = this.getStore();
                    var faces = [];
                    //refStore.each(function (rec) {
                    //    if (newVal.some(function (item) {
                    //            return item === rec.getId();
                    //        })) {
                    //        faces = faces.concat(rec.get('faces'));
                    //    }
                    //});
                    newVal.forEach(function(item){
                        var rec = refStore.getById(item);
                        if(rec){
                            faces = faces.concat(rec.get('faces'));
                        }
                    });
                    //console.log(faces);
                    var poiFilter = new Ext.util.Filter({
                        property: 'id',
                        id: 'filterpoi',
                        operator: 'in',
                        value: faces
                    });
                    //console.log(newVal);
                    //combo.suppressRefresh = true;
                    combo.suppressRefresh = true;
                    Ext.getCmp(combo.targetGrid).getStore().addFilter(poiFilter);
                    //combo.updateValue();
                }
                else {
                    combo.suppressRefresh = true;
                    Ext.getCmp(combo.targetGrid).getStore().removeFilter('filterpoi');
                }
            }
        }
    }
});
