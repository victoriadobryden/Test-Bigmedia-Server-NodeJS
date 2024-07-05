Ext.define("Bigmedia.view.field.ByNumberFilterTag",{
    extend: "Ext.form.field.Tag",

    requires: [
        "Bigmedia.view.field.ByNumberFilterTagController",
        "Bigmedia.view.field.ByNumberFilterTagModel",
        "Bigmedia.Locales",
        "Bigmedia.model.ByNumber"
    ],

    controller: "field-bynumberfiltertag",
    viewModel: {
        type: "field-bynumberfiltertag"
    },
    xtype: 'bynumbertag',

    config: {
        filterField: null,
        targetStore: null
    },

    store: new Ext.data.Store({
        model: Bigmedia.model.ByNumber
    }),

    triggers: {
        newPeriod: {
            cls: 'newpoifilter-trigger',
            weight: -1, // negative to place before default triggers
            handler: function () {
                this.getController().newFilterByNumberClick();
            }
        }
    },

    hideTrigger: false,
    queryMode: 'local',
    //enableKeyEvents: true,
    triggerOnClick: true,

    filterField: 'bynumber',
    //labelWidth: 60,
    displayField: 'name',
    valueField: 'id',
    filterPickList: true,

    publishes: 'value',
    labelTpl: new Ext.XTemplate('{name}<tpl if="addCount &gt; 0"><span class="tagfield-badge">{addCount}</span></tpl>', { //{[this.inGrid(values.id, targetGrid, filterField)]}
            disableFormats: true
        }
    ),
    tipTpl: new Ext.XTemplate('{descr} ' + Bigmedia.Locales.refTagTip, {disableFormats: true}
    ),
    tpl: new Ext.XTemplate(
        '<ul class="x-list-plain"><tpl for=".">',
        '<li role="option" class="x-boundlist-item <tpl if="addCount &lt;= 0">x-boundlist-item-disabled</tpl>">{name}<tpl if="addCount &gt; 0"><span class="tagfield-badge">{addCount}</span></tpl></li>', //{[this.inGrid(values.id, targetGrid, filterField)]}
        '</tpl></ul>',
        {
            disableFormats: true
        }
    ),
    updateTargetStore: function (newVal, oldVal) {
        var me = this;
        if (oldVal) {
            // oldVal.removeListener('datachanged', me.getController().onTargetStoreDataChanged);
            oldVal.removeListener('add', me.getController().onTargetStoreDataChanged);
            oldVal.removeListener('remove', me.getController().onTargetStoreDataChanged);
        }
        if (newVal) {
            // newVal.addListener('datachanged', me.getController().onTargetStoreDataChanged, me.getController());
            newVal.addListener('add', me.getController().onTargetStoreDataChanged, me.getController());
            newVal.addListener('remove', me.getController().onTargetStoreDataChanged, me.getController());
        }
        me.getController().initTotal();
    },
    // setTargetStore: function(store){
    //     this.targetStore = store;
    //     this.getController().connectToStore(store);
    // },
    initComponent: function () {
        this.onBefore('expand', 'onBeforeTagExpand', this.getController());
        this.callParent([arguments]);
    },
    listeners: {
        beforeselect: function (combo, record) {
            return record.get('addCount') > 0;
        },
        change: 'onTagValueChanged'
 }
});
