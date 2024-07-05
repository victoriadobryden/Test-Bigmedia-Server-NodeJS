Ext.define('Bigmedia.view.field.MediaParamSliderController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.field-mediaparamslidercontroller',

    filterChanged: false,
    suppressRefresh: false,


    onSliderChangeComplete: function ( slider, newVal, thumb, eOpts ) {
        this.applyFilterValue(thumb.index);
    },

    applyFilterValue: function (thumbIndex) {
        var me = this,
            slider = me.getView(),
            store = slider.getTargetStore(),
            pos = thumbIndex == 0 ? 'min' : 'max',
            val = slider.getValue(thumbIndex);
            op = (pos === 'min')? '>' : '<';
        store.removeFilter('filter_' + pos + '_' + slider.getFilterField(), (pos === 'min' && val > slider.minValue) || (pos === 'max' && val < slider.maxValue));
        if( (pos === 'min' && val > slider.minValue) || (pos === 'max' && val < slider.maxValue)) {
            var mediaFilter = new Ext.util.Filter({
                property: slider.getFilterField(),
                id: 'filter_' + pos + '_' + slider.getFilterField(),
                operator: op,
                value: val
            });
            store.addFilter(mediaFilter);
        }
    },

    applyFilters: function () {
        this.applyFilterValue(0);
        this.applyFilterValue(1);
    }
    //}
});
