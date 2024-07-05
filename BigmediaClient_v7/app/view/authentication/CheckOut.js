Ext.define('Bigmedia.view.authentication.CheckOut', {
    extend: 'Bigmedia.view.authentication.LockingWindow',
    xtype: 'checkoutdialog',

    requires: [
        'Ext.container.Container',
        'Ext.form.field.Text',
        'Ext.form.field.Checkbox',
        'Ext.button.Button',
        "Bigmedia.view.authentication.CheckOutController",
        'Bigmedia.view.authentication.CheckOutForm'
    ],
    controller: "authentication-checkout",

    title: Bigmedia.Locales.checkoutTitle,
    defaultFocus: 'form-checkout', // Focus the Auth Form to force field focus as well
    closable: true,
    closeAction: "hide",

    items: [
        {xtype: 'form-checkout'}
    ],

    listeners: {
        close: function ( win ){
            //this.getController().redirectTo('#cart');
            window.location = '#cart';
        }
    },

    initComponent: function() {
        this.addCls('user-login-register-container');
        this.callParent(arguments);
    }
});