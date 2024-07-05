Ext.define('Bigmedia.lib.validator.DateRange', {
    extend: 'Ext.data.validator.Validator',
    alias: 'data.validator.daterange',

    type: 'daterange',

    config: {
        /**
         * @cfg {String} message
         * The error message to return when the value is not specified.
         */
        message: 'Start date must be less or equal then End date',

        /**
         * @cfg {Boolean} allowEmpty
         * `true` to allow `''` as a valid value.
         */
        isStart: true,

        otherField: 'endDate',

        format: 'd.m.y'
    },

    validate: function(value, record) {
        var me = this;
        if ( value === undefined || value === null || value === '') {
            return true;
        }
        var date = (value instanceof Date) ? value : Ext.Date.parse(value, me.getFormat());
        if (! date) {
            return me.getMessage();
        }
        var valid = (!record.get(me.getOtherField()) ||
            (me.getIsStart() && +date <= +record.get(me.getOtherField())) ||
            (!me.getIsStart() && +date >= +record.get(me.getOtherField())));
        return valid ? true : me.getMessage();
    }
});
