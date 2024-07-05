Ext.define('Bigmedia.view.profile.Description', {
    extend: 'Ext.container.Container',
    xtype: 'profiledescriptionpanel',
    requires: [
        'Bigmedia.view.dialog.DlgUserInfo',
        'Bigmedia.view.det.DetLogo'
    ],

    height: 300,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    cls:'timeline-items-wrap user-profile-desc shadow-panel',

    items: [
        {
            xtype: 'container',
            flex: 1,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'container',
                    flex: 1,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'box',
                            componentCls: 'x-fa fa-home',
                            bind: {
                                html: '{user.cityName}, ' + Bigmedia.Locales.profileUkraineText + '<br>{user.address}'
                            },
                            padding: '0 0 12 0'
                        },
                        {
                            xtype: 'box',
                            componentCls: 'x-fa fa-clock-o',
                            bind: {
                                html: Bigmedia.Locales.profileMemberSinceText + ' {user.regDate:date("F j, Y")}'
                            },
                            padding: '0 0 12 0'
                        },
                        // {
                        //     xtype: 'box',
                        //     componentCls: 'x-fa fa-globe',
                        //     html: '<a href="#"\'></a>',
                        //     padding: '0 0 12 0'
                        // },
                        {
                            xtype: 'container',
                            flex: 1,
                            cls: 'about-me-wrap',
                            bind: {
                                html: '<h3 class="x-fa fa-user">{user.orgName}</p>'
                            }
                        },
                        {
                            xtype: 'button',
                            scale: 'large',
                            margin: '20px 20px 0 0',
                            // width: 220,
                            text: Bigmedia.Locales.profileChangeInfoBtnText,
                            handler: function(btn) {
                                var dlg = Ext.create('Bigmedia.view.dialog.DlgUserInfo',{
                                    modal: true
                                });
                                dlg.show();
                            }
                        }
                    ]
                }, {
                    xtype: 'container',
                    flex: 1,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'container',
                            cls: 'user-org-logo-container',
                            padding: 20,
                            flex: 1,
                            // layout: 'fit',
                            items: [
                                {
                                    xtype: 'image',
                                    reference: 'imageLogo',
                                    cls: 'user-org-logo',
                                    bind: {
                                        src: '/api/v1/orgs/{user.orgId}/logo.png'
                                    }
                                }
                            ]
                        }, {
                            xtype: 'button',
                            scale: 'large',
                            margin: '20px 0 0 20px',
                            // width: 220,
                            text: 'Upload logo',
                            handler: function(btn) {
                                var mainView = btn.up('mainviewport'),
                                    win = mainView.lookupReference('detLogo'),
                                    img = btn.up('profiledescriptionpanel').down('image'),
                                    logoURL = img.getSrc();
                                if (!win) {
                                    win = new Bigmedia.view.det.DetLogo({
                                        reference: 'detLogo',
                                        viewModel: {
                                            data: {
                                                logoURL: logoURL
                                            }
                                        }
                                    });

                                    win.on('imagesave', function () {
                                        var user = Bigmedia.Vars.getUser();
                                        var theOrg = new Bigmedia.model.Org({
                                            id: user.get('orgId'),
                                            logoBlob: win.getDataURL()
                                        });
                                        theOrg.save({
                                            success: function () {
                                                img.setSrc(win.getDataURL());
                                            },
                                            failure: function(record, operation) {
                                                Ext.toast({
                                                    html: 'Image upload was interrupted. Please, choose other picture.',
                                                    //title: title,
                                                    closable: false,
                                                    align: 't',
                                                    slideInDuration: 400,
                                                    minWidth: 400
                                                });
                                            }
                                        });
                                    });

                                    // A Window is a floating component, so by default it is not connected
                                    // to our main View in any way. By adding it, we are creating this link
                                    // and allow the window to be controlled by the main ViewController,
                                    // as well as be destroyed automatically along with the main View.
                                    // this.getView().add(win);
                                    mainView.add(win);
                                } else {
                                    win.getViewModel().set('logoURL', logoURL);
                                }
                                win.show();
                            }
                        }
                    ]
                }
            ]
        },
        {
            xtype:'toolbar',
            layout : {
                type : 'hbox',
                align: 'middle',
                pack : 'center'
            },
            items: [{
              xtype: 'combo',
              flex: 1,
              padding: 10,
              fieldLabel: Bigmedia.Locales.profileSelectDefaultDiscountLabel,
              labelWidth: 180,
              store: 'RulesGroups',
              displayField: 'name',
              valueField: 'id',
              queryMode: 'local',
              bind: {
                selection: '{theGroup}'
              },
            }, {
              xtype: 'button',
              text: Bigmedia.Locales.profileManageGroupsText,
              handler: function (btn) {
                  var dlg = Ext.create('Bigmedia.view.dialog.DlgEditRulesGroups', {});
                  dlg.show();
              }
            }]
            // items:[
            //     {
            //         xtype: 'box',
            //         cls: 'large-icon icon-padding',
            //         componentCls:'x-fa fa-thumbs-up',
            //         padding: '8 0 8 0'
            //     },
            //     {
            //         xtype: 'container',
            //         layout: {
            //             type: 'vbox',
            //             align: 'center',
            //             pack: 'center'
            //         },
            //         items: [
            //             {
            //                 xtype: 'label',
            //                 cls: 'likes-value',
            //                 text: '23'
            //             },
            //             {
            //                 xtype: 'label',
            //                 cls: 'likes-label',
            //                 text: 'Campaigns'
            //             }
            //         ]
            //     },
            //
            //     {
            //         xtype: 'box',
            //         cls: 'icon-padding',
            //         componentCls:'x-fa fa-ellipsis-v',
            //         padding: '8 0 8 0'
            //     },
            //
            //     {
            //         xtype: 'box',
            //         cls: 'large-icon icon-padding',
            //         componentCls:'x-fa fa-user-plus',
            //         padding: '8 0 8 0'
            //     },
            //     {
            //         xtype: 'container',
            //         layout: {
            //             type: 'vbox',
            //             align: 'center',
            //             pack: 'center'
            //         },
            //         items: [
            //             {
            //                 xtype: 'label',
            //                 cls: 'friends-value',
            //                 text: '10000'
            //             },
            //             {
            //                 xtype: 'label',
            //                 cls: 'friends-label',
            //                 text: 'Total budget'
            //             }
            //         ]
            //     }
            // ]
        }
    ]
});
