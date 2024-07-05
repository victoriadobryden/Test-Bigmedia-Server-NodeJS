Ext.define("Bigmedia.view.field.RefTag", {
    extend: "Ext.form.field.Tag",
    xtype: "reftag",

    requires: [
        "Bigmedia.view.field.RefTagController",
        "Bigmedia.view.field.RefTagModel",
        "Bigmedia.Locales"
    ],

    controller: "field-reftag",

    config: {
        filterField: null,
        targetStore: null
    },

    updateFilterField: function (newVal) {
        var me = this;
        if (me.getTargetStore()) {
            me.setStore(me.getTargetStore().dimStores[me.getFilterField]);
        }
    },

    updateTargetStore: function (newVal, oldVal) {
        var me = this;
        if (oldVal) {
            // oldVal.removeListener('datachanged', me.getController().onTargetStoreDataChanged);
            // oldVal.removeListener('load', me.getController().onTargetStoreDataChanged);
            oldVal.removeListener('dimensionschange', me.getController().onTargetStoreDataChanged);
            // oldVal.removeListener('add', me.getController().onTargetStoreAdd);
            // oldVal.removeListener('remove', me.getController().onTargetStoreRemove);
        }
        if (newVal) {
            // newVal.addListener('datachanged', me.getController().onTargetStoreDataChanged, me.getController());
            // newVal.addListener('load', me.getController().onTargetStoreDataChanged, me.getController());
            newVal.addListener('dimensionschange', me.getController().onTargetStoreDataChanged, me.getController());
            // newVal.addListener('add', me.getController().onTargetStoreAdd, me.getController());
            // newVal.addListener('remove', me.getController().onTargetStoreRemove, me.getController());
            // newVal.addListener('load', me.getController().onTargetStoreAdd, me.getController());
            me.setStore(newVal.dimStores[me.getFilterField()]);
        }
        // me.getController().initTotal();
        // me.getController().syncAll();
    },

    displayField: 'name',
    valueField: 'id',
    filterPickList: true,
    editable: false,
    selectOnFocus: false,
    queryMode: 'local',
    publishes: 'value',
    suppressRefresh: false,
    forceRefresh: false,
    labelTpl: new Ext.XTemplate('{name}<tpl if="addCount &gt; 0"><span class="tagfield-badge">{addCount}</span></tpl>', { //{[this.inGrid(values.id, targetGrid, filterField)]}
            disableFormats: true
        }
    ),
    tipTpl: new Ext.XTemplate(Bigmedia.Locales.refTagTip, {disableFromats: true}),
    tpl: new Ext.XTemplate(
        '<ul class="x-list-plain"><tpl for=".">',
        '<li role="option" class="x-boundlist-item <tpl if="addCount &lt;= 0">x-boundlist-item-disabled</tpl>">{name}<tpl if="addCount &gt; 0"><span class="tagfield-badge">{addCount}</span></tpl></li>', //{[this.inGrid(values.id, targetGrid, filterField)]}
        '</tpl></ul>',
        {
            disableFormats: true
        }
    ),
    // initComponent: function () {
    //     this.onBefore('expand', 'onBeforeTagExpand', this.getController());
    //     this.callParent([arguments]);
    // },
    listeners: {
        beforeselect: function (combo, record) {
            return record.get('addCount') > 0;
        },
        change: 'onTagValueChanged'
    }
});
