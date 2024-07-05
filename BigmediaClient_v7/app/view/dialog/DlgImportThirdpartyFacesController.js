Ext.define('Bigmedia.view.dialog.DlgImportThirdpartyFacesController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.dialog-dlgimportthirdpartyfaces',

    onShowView: function (view) {
        var me = this;
        if (Bigmedia.Vars.getSalt()) {
            me.getViewModel().set('savepriceoption', '2');
            me.getViewModel().set('savepriceglobaldisable', false);
            me.getViewModel().set('savepricepasswordglobal', false);
        } else {
            me.getViewModel().set('savepricepasswordglobal', true);
            me.getViewModel().set('savepriceglobaldisable', true);
        }
        me.validateForm();
    },

    onCancelClick: function () {
        this.getView().hide();
    },

    validateForm: function () {
        var me = this,
            btn = me.lookupReference('btnImport'),
            numbersTextArea = me.lookupReference('numbers');
        var numbers = numbersTextArea.getValue().split(/[\s,;\n]+/);
        if ( numbers.length>0 ) {
            btn.enable();
        } else {
            btn.disable();
        }
    },

    onImportClick: function () {
        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            numbersTextArea = me.lookupReference('numbers'),
            startDate = me.lookupReference('seldatebeg'),
            endDate = me.lookupReference('seldateend'),
            cb = view.getCallbackImport(),
            scope = view.getCallbackScope(),
            chbSideNo = me.lookupReference('chbsideno'),
            linkField = chbSideNo.getValue() ? 'supplierNo': 'doorsNo',
            savepriceoption = vm.get('savepriceoption'),
            savepricepassword = vm.get('savepricepassword'),
            savepricepasswordglobal = vm.get('savepricepasswordglobal'),
            opts = {
                linkField: linkField,
                savepriceoption: savepriceoption,
                savepricepassword: savepricepassword,
                savepricepasswordglobal: savepricepasswordglobal
            };
        if (cb) {
            var numbers = numbersTextArea.getValue(); //.split(/[\s,;\n]+/);
            Ext.callback(cb, scope, [startDate.getValue(), endDate.getValue(), numbers, opts]);
        }
        view.hide();
    }
});
