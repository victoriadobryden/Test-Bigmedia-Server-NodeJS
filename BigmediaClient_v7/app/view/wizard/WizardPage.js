Ext.define('Bigmedia.view.wizard.WizardPage', {
    extend: 'Ext.panel.Panel',
    xtype: 'wizardpage',

    config: {
        isCompleted: false
    },

    updateIsCompleted: function (newVal, oldVal) {
        var wizard = this.up('wizardform');
        this.fireEvent('pagechanged');
    }
});
