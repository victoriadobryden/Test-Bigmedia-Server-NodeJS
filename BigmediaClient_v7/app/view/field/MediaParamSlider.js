Ext.define("Bigmedia.view.field.MediaParamSlider", {
    extend: "Ext.slider.Multi",
    xtype: "refmediaparamslider",

    requires: [
        "Bigmedia.view.field.MediaParamSliderController",
        "Bigmedia.Locales"
    ],

    controller: "field-mediaparamslidercontroller",

    config: {
        targetStore: null,
        filterField: null
    },

    updateTargetStore: function (newVal, oldVal) {
        if (newVal) {
            this.getController().applyFilters();
        }
    },

    listeners:{
        changecomplete: "onSliderChangeComplete"
    },
    setValues: function (value) {
        if(value instanceof Array){
            this.setValue(value);
        } else {
            this.setValue([value]);
        }
    },
    applyFilters: function () {
        this.getController().applyFilters();
    }
});
