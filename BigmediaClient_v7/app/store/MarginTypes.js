Ext.define('Bigmedia.store.MarginTypes', {
    extend: 'Ext.data.Store',
    alias: 'store.margintypes',
    storeId: 'MarginTypes',

    fields: [
        {name: 'id', type: 'string'},
        {name: 'name', type: 'string'}
        // ,
        // {name: 'totalCount', type: 'int', defaultValue: '0'},
        // {name: 'addCount', type: 'int', defaultValue: '0'},
        // {name: 'subCount', type: 'int', defaultValue: '0'}
    ],

    data: Bigmedia.Locales.getRefStoreData('refMarginType'),

    proxy: {
        type: 'memory'
    },
    autoLoad: true,

    getPriceWithMargin: function (price, marginTypeId, marginValue, roundTypeId) {
        if (!marginTypeId) {
            return price;
        }
        var res;
        switch (marginTypeId) {
            case "percentMarkup":
                res = Math.round(price + price * marginValue / 100);
                break;
            case "fixedMarkup":
                res = price + marginValue;
                break;
            case "percentMargin":
                res = Math.round(price / (100 - marginValue) * 100);
                break;
            default:
                res = price;
        }
        switch (roundTypeId) {
          case "ceilBy50":
            res = Math.ceil(res / 50) * 50;
            break;
          case "ceilBy100":
            res = Math.ceil(res / 100) * 100;
            break;
        }
        return res;
    }
});
