Ext.define('Bigmedia.view.authentication.AuthenticationModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.authentication',

    requires: [
        'Bigmedia.model.User'
    ],

    // session: new Ext.data.Session(),

    // links: {
    //     curUser: {
    //         type: 'Bigmedia.model.User',
    //         id: 0
    //     }
    // },

    formulas: {
        curUser: function () {
            return Bigmedia.Vars.getUser();
        }
    },

    data: {
        username: '',
        password: '',
        rememberMe: true,
        reset: {
            email: '',
            code: ''
        },
        signup: {
            fullName: '',
            orgName: '',
            username: '',
            email: '',
            password: '',
            confirmpassword: '',
            agrees: false
        }
    }
});
