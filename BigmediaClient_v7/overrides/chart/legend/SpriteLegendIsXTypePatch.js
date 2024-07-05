Ext.define('Ext.chart.legend.SpriteLegendIsXTypePatch', {
    override: 'Ext.chart.legend.SpriteLegend',

    isXType: function (xtype) {
        return xtype === 'sprite';
    },


    getItemId: function () {
        return this.getId();
    }
});
