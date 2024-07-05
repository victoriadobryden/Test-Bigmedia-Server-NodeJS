Ext.define('Bigmedia.lib.AdvancedVType', {
    override: 'Ext.form.field.VTypes',

    daterange: function(val, field) {
        var date = field.parseDate(val);

        if (!date) {
            return false;
        }
        if (field.startDateField && (!this.dateRangeMax || (date.getTime() != this.dateRangeMax.getTime()))) {
            var start = field.up('form').down('#' + field.startDateField);
            start.setMaxValue(date);
            start.validate();
            if (field.endDateField) {
                var end = field.up('form').down('#' + field.endDateField);
                if (end) {
                    end.validate();
                }
            }
            this.dateRangeMax = date;
        }
        else if (field.endDateField && (!this.dateRangeMin || (date.getTime() != this.dateRangeMin.getTime()))) {
            var end = field.up('form').down('#' + field.endDateField);
            end.setMinValue(date);
            end.validate();
            if (field.startDateField) {
                var start = field.up('form').down('#' + field.startDateField);
                if (start) {
                    start.validate();
                }
            }
            this.dateRangeMin = date;
        }
        /*
         * Always return true since we're only using this vtype to set the
         * min/max allowed values (these are tested for after the vtype test)
         */
        return true;
    },

    daterangeText: Bigmedia.Locales.verifyDateRangeText,
    // 'Start date must be less than end date',

    password: function(val, field) {
        if (field.initialPassField) {
            var pwd = field.up('form').down('#' + field.initialPassField);
            return pwd && (val == pwd.getValue());
        }
        return true;
    },

    passwordText: Bigmedia.Locales.dlgRegisterPasswordsErrMsg
});
