Ext.define('Bigmedia.view.wizard.WizardFormModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.wizardform',

    formulas: {
        nextDisabled: function (get) {
            return get('atEnd') || get('isUncompleted');
        }
    },

    data: {
        atBeginning: true,
        atEnd: false,
        isUncompleted: true
    }
});
