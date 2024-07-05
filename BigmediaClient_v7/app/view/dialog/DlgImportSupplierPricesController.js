Ext.define('Bigmedia.view.dialog.DlgImportSupplierPricesController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.dialog-dlgimportsupplierprices',

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
        me.getViewModel().set({
            savepricepassword: ''
        });
        me.validateForm();
    },

    onCancelClick: function () {
        this.getView().hide();
    },

    validateForm: function () {
        var me = this,
            btn = me.lookupReference('btnImport'),
            numbersTextArea = me.lookupReference('numbers');
        var numbers = numbersTextArea.getValue().split(/\n+/g).filter(function(item){ return item.match(/\w+[^.,\w\d]+\d+[.,]?\d*/g);});
        if ( numbers.length>0 ) {
            btn.enable();
        } else {
            btn.disable();
        }
    },

    onImportClick: function () {
        var me = this,
            view = me.getView(),
            vm = me. getViewModel(),
            numbersTextArea = me.lookupReference('numbers'),
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
            var lines = numbersTextArea.getValue().split(/\n+/g).filter(function(item){ return item.match(/\w+[^.,\w\d]+\d+[.,]?\d*/);}),
                prices;
            prices = lines.reduce(function(res, line){
                var match = line.match(/(\w+)[^.,\w\d]+(\d+[.,]?\d*)/);
                if (match) {
                    var price = match[2].replace(/\,/,'.');
                    res[match[1]] = price;
                }
                return res;
            },{});
            // console.log([prices, linkField]);
            Ext.callback(cb, scope, [prices, opts]);
        }
        view.hide();
    }
});
