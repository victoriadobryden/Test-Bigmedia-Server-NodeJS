Ext.define('Bigmedia.view.dialog.DlgImportPricesController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.dialog-dlgimportprices',

    onShowView: function (view) {
        var me = this;
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
            numbersTextArea = me.lookupReference('numbers'),
            cb = view.getCallbackImport(),
            scope = view.getCallbackScope(),
            chbSideNo = me.lookupReference('chbsideno'),
            linkField = chbSideNo.getValue() ? 'supplierNo': 'doorsNo';
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
            Ext.callback(cb, scope, [prices, linkField]);
        }
        view.hide();
    }
});
