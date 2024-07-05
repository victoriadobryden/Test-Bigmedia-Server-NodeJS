/**
 * Created by Alexander.Ustilov on 21.01.2016.
 */
Ext.define('Bigmedia.view.field.FilterContainerTag', {
    extend: 'Ext.form.FieldContainer',
    requires: [
        "Bigmedia.view.field.RefTag"
    ],
    xtype: "filtercontainertag",
    layout: 'hbox',
    width: '100%',
    labelFilter: '',
    targetGrid: '',
    filterField: '',
    items: [
        {
            xtype: 'checkboxfield',
            checked: false,
            width: 30
        },
        {
            xtype: 'reftag',
            //bind: {
            //    store: '{filterStore}'
            //},
            labelWidth: 60,
            layout: 'fit',
            flex: 1
        }
    ],
    initTagItem: function () {
        this.items.get(1).targetGrid = this.targetGrid;
        this.items.get(1).filterField = this.filterField;
        this.items.get(1).fieldLabel = this.labelFilter;
//        this.items.get(1).initTag();
        this.items.get(0).onBefore('change', this.onCheckChange, this);
        this.items.get(1).onAfter('change', this.onTagChange, this);
    },
    initComponent: function () {

        this.callParent(arguments);
        //this.initTagItem();

    },
    onTagChange: function (tag) {
        var cont = this;
        this.suppressRefresh = true;
        if (!!cont.items.get(0).getValue() !== (cont.items.get(1).getValue().length > 0)) {
            cont.items.get(0).setValue(cont.items.get(1).getValue().length > 0);
        }
    },
    onCheckChange: function (chb, newVal) {
        var cont = this;
        if (newVal) {
            if (cont.items.get(1).getRawValue() !== '') {
                if (!this.suppressRefresh) {
                    cont.items.get(1).fireEvent('change', cont.items.get(1), cont.items.get(1).getValue(), []);
                }
                this.suppressRefresh = false;
            }
            else {
                cont.items.get(1).expand();
                chb.setValue(false);
                return false;
            }
        }
        else {
            if (!this.suppressRefresh) {
                Ext.getCmp(cont.targetGrid).getStore().removeFilter('filter' + cont.filterField);
            }
            this.suppressRefresh = false;
        }
        return true;
    }
});