Ext.define('Bigmedia.locale.ru.lib.validator.DateRange', {
    override: 'Bigmedia.lib.validator.DateRange',

    config: {
        /**
         * @cfg {String} message
         * The error message to return when the value is not specified.
         */
        message: 'Дата начала не может быть больше даты окончания',

        /**
         * @cfg {Boolean} allowEmpty
         * `true` to allow `''` as a valid value.
         */
        isStart: true,

        otherField: 'endDate',

        format: 'd.m.y'
    }
});
