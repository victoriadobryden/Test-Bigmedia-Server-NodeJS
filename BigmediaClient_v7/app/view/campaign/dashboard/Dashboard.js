Ext.define('Bigmedia.view.campaign.dashboard.Dashboard', {
    extend: 'Ext.container.Container',
    xtype: 'campaigndashboard',

    requires: [
        'Ext.ux.layout.ResponsiveColumn',
        'Bigmedia.view.campaign.dashboard.Info',
        'Bigmedia.view.campaign.dashboard.ServiceActivity',
        'Bigmedia.view.campaign.dashboard.ServiceOperations',
        'Bigmedia.view.campaign.dashboard.Proposals',
        'Bigmedia.view.campaign.dashboard.SidesBars',
        'Bigmedia.view.campaign.dashboard.PhotoRepActivity',
        'Bigmedia.view.campaign.dashboard.BudgetBars',
        'Bigmedia.view.campaign.dashboard.PhotoRepExecution',
        'Bigmedia.view.chart.CoverageInteractive',
        'Bigmedia.view.campaign.dashboard.DashboardController'
    ],

    controller: 'dashboard',

    layout: 'responsivecolumn',

    scrollable: 'y',

    items: [
        {
            xtype: 'container',
            userCls: 'big-40 small-100',
            margin: 0,
            padding: 0,
            defaults: {
                style: {
                    margin: '0 20px 20px 0',
                    float: 'left'
                }
            },
            items: [
                {
                    xtype: 'campinfo',
                    bind: {
                        data: {
                            campName: '{curCamp.name}',
                            campStartDate: '{curCamp.startDate}',
                            campEndDate: '{curCamp.endDate}',
                            curCamp: '{curCamp}'
                        }
                    },
                    cls: 'infocampaign-panel shadow',
                    userCls: 'small-100'
                },
                        {
                            xtype: 'campserviceactivity',
                            bind: {
                                dataStore: '{curCamp.campServiceOperations}'
                            },
                            userCls: 'small-50'
                        },
                        {
                            xtype: 'campsidesbars',
                            bind: {
                                dataStore: '{curCamp.proposals}'
                            },
                            userCls: 'small-50'
                        },
                        {
                            xtype: 'campbudgetbars',
                            bind: {
                                dataStore: '{curCamp.estimations}'
                            },
                            userCls: 'small-50'
                        },
                        {
                            xtype: 'campphotorepactivity',
                            bind: {
                                dataStore: '{curCamp.campPhotos}'
                            },
                            userCls: 'small-50'
                        }
            ]
        },
        {
            xtype: 'campproposals',
            bind: {
                dataSource: {
                    bindTo: '{curCamp.proposals}'
                }
                // ,
                // curCamp: '{curCamp}'
                // dataSource: '{proposals}'
            },
            userCls: 'big-60 small-100'
        },
        {
            xtype: 'chartscoverageinteractive',
            reference: 'chartcoverage',
            bind: {
                facesStore: '{curCamp.proposals}'
                // facesStore: '{proposals}'
                // facesStore: {
                //     bindTo: '{proposals}',
                //     deep: true
                // }
            },
            hideCitiesBar: false,
            userCls: 'big-100 small-100'
        },
        {
            xtype: 'campservices',
            bind: {
                dataSource: '{curCamp.campServiceOperations}',
                hidden: '{curCamp.campServiceOperations.count == 0}'
            },
            userCls: 'big-50 small-100'
        },
        {
            xtype: 'campphotorepexecution',
            bind: {
                dataSource: '{curCamp.campPhotos}',
                hidden: '{curCamp.campPhotos.count == 0}'
            },
            userCls: 'big-50 small-100'
        }
    ]
});
