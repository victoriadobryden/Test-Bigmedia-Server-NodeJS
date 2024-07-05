Ext.define('Bigmedia.locale.ukr.lib.validator.DateRange', {
    override: 'Bigmedia.lib.validator.DateRange',

    config: {
        /**
         * @cfg {String} message
         * The error message to return when the value is not specified.
         */
        message: 'Дата початку не може бути більшою ніж кінцева дата',

        /**
         * @cfg {Boolean} allowEmpty
         * `true` to allow `''` as a valid value.
         */
        isStart: true,

        otherField: 'endDate',

        format: 'd.m.y'
    }
});
