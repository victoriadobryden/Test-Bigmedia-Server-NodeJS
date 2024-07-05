Ext.define('Ext.overrides.ux.rating.Picker', {
    override: 'Ext.ux.rating.Picker',

    disabled: false,

    onClick: function (event) {
        if(this.disabled){return;}
        var value = this.valueFromEvent(event);
        this.setValue(value);
    },

    onMouseEnter: function () {
        if(this.disabled){return;}
        this.element.addCls(this.overCls);
    },

    onMouseLeave: function () {
        if(this.disabled){return;}
        this.element.removeCls(this.overCls);
    },

    onMouseMove: function (event) {
        if(this.disabled){return;}
        var value = this.valueFromEvent(event);
        this.setTrackingValue(value);
    }
});
