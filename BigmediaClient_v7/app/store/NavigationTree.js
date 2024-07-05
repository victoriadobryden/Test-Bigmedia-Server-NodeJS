Ext.define('Bigmedia.store.NavigationTree', {
    extend: 'Ext.data.TreeStore',

    storeId: 'NavigationTree',
    root: {
        expanded: true,
        children: [
            {
                text:   'Bigmedia network',
                view:   'FacesView',
                leaf:   true,
                // iconCls: 'right-icon new-icon x-fa fa-desktop',
                iconCls: 'right-icon x-fa fa-desktop',
                routeId: 'faces'
            },
            {
                text:   'Campaigns',
                view:   'campaign.CampaignsView',
                // stores: ['Campaigns'], //
                // iconCls: 'right-icon hot-icon x-fa fa-send ',
                // iconCls: 'right-icon x-fa fa-send ',
                leaf:   true,
                userAction: 'showAdvCampaigns',
                routeId: 'campaigns'
            },
            {
                text:   'Campaign',
                view:   'campaign.CampView',
                // stores: ['Campaigns'], //
                // iconCls: 'right-icon hot-icon x-fa fa-send ',
                // iconCls: 'right-icon x-fa fa-send ',
                leaf:   true,
                userAction: 'showCampaignCard',
                routeId: 'campView'
            },
            // {
            //     text:   'Monitoring',
            //     view:   'MonitoringView',
            //     // stores: ['Monitoring'], //
            //     // iconCls: 'right-icon hot-icon x-fa fa-send ',
            //     // iconCls: 'right-icon x-fa fa-send ',
            //     leaf:   true,
            //     //userAction: 'showMonitoringView',
            //     iconCls: 'right-icon x-fa fa-desktop',
            //     routeId: 'monitoring'
            // },
            {
                view: 'authentication.Login',
                hideMode: 'offsets',
                routeId: 'auth.login',
                isWindow: true
            }, {
                view: 'authentication.PasswordReset',
                hideMode: 'offsets',
                routeId: 'auth.reset',
                isWindow: true
            }, {
                view: 'authentication.LoginByCode',
                hideMode: 'offsets',
                routeId: 'auth.loginByCode',
                isWindow: true
            }, {
                view: 'authentication.Register',
                hideMode: 'offsets',
                routeId: 'auth.signup',
                isWindow: true
            }, {
                text:   'Profile',
                view:   'profile.UserProfile',
                leaf:   true,
                iconCls: 'x-fa fa-user',
                routeId:'profile'
            }, {
                view: 'authentication.CheckOut',
                hideMode: 'offsets',
                isPersistent: true,
                routeId: 'checkout',
                isWindow: true
            }, {
                view: 'authentication.ShoppingCart',
                hideMode: 'offsets',
                isPersistent: true,
                routeId: 'cart',
                isWindow: true
            }, {
                text: 'FAQ',
                view: 'pages.FAQ',
                leaf: true,
                hideMode: 'offsets',
                iconCls: 'x-fa fa-question',
                isPersistent: true,
                routeId:'faq',
                isWindow: true
            }, {
                view: 'error.Error404Window',
                leaf: true,
                isPersistent: false,
                routeId:'error404',
                isWindow: true
            }, {
                view: 'error.Error500Window',
                leaf: true,
                isPersistent: false,
                routeId:'error500',
                isWindow: true
            }, {
                view: 'error.BlankPage',
                leaf: true,
                isPersistent: false,
                routeId:'blank',
                isWindow: true
            }, {
                view: 'det.DetPoster',
                leaf: true,
                isPersistent: false,
                routeId:'det.poster',
                isWindow: true
            },{
                view: 'det.DetMonitoring',
                leaf: true,
                isPersistent: false,
                routeId:'det.monitoring',
                isWindow: true
            }, {
                view: 'dialog.DlgAddToCampaign',
                leaf: true,
                isPersistent: false,
                routeId:'dialog.DlgAddToCampaign',
                isWindow: true
            }, {
                view: 'dialog.DlgChangePassword',
                leaf: true,
                isPersistent: false,
                routeId:'dialog.DlgChangePassword',
                isWindow: true
            }, {
                view: 'dialog.DlgLogin',
                leaf: true,
                isPersistent: false,
                routeId:'dialog.DlgLogin',
                isWindow: true
            }, {
                view: 'dialog.DlgUserInfo',
                leaf: true,
                isPersistent: false,
                routeId:'dialog.DlgUserInfo',
                isWindow: true
            }, {
                view: 'drag.Image',
                leaf: true,
                isPersistent: false,
                routeId:'drag.Image',
                isWindow: true
            }, {
                view: 'dialog.DlgAutoPlan',
                leaf: true,
                isPersistent: true,
                routeId: 'planner',
                // userAction: 'showPlanner',
                isWindow: true
            }, {
                view: 'dialog.DlgAutoPlanNoob',
                leaf: true,
                isPersistent: false,
                routeId: 'bma-noob',
                isWindow: true
                // userAction: 'showPlanner',
            }
        ]
    },
    fields: [
        {
            name: 'text'
        }
    ]
});
