Ext.define('Bigmedia.view.campaign.CampCard',{
    extend: 'Ext.tab.Panel',

    xtype: 'campcard',

    requires: [
        'Bigmedia.view.campaign.CampCardController',
        'Bigmedia.view.campaign.CampCardModel',
        'Bigmedia.model.Campaign',
        'Bigmedia.view.map.MapView',
        'Bigmedia.store.Campaigns',
        'Ext.tab.Panel',
        'Ext.form.Panel',
        'Ext.toolbar.Toolbar',
        'Ext.button.Button',
        'Ext.form.FieldContainer',
        'Ext.form.field.Date',
        'Ext.grid.Panel',
        'Ext.grid.column.Widget',
        'Ext.grid.column.Date',
        'Ext.button.Split',
        'Ext.grid.column.Template',
        'Ext.window.MessageBox'
    ],

    controller: 'campaign-campcard',
    // viewModel: {
    //     type: 'campaign-campcard'
    // },

    config: {
        publishedCampaign: null
    },

    updatePublishedCampaign: function (newVal, oldVal) {
        this.getController().updatePublishedCampaign(newVal, oldVal);
    },

    layout: 'card',

    title: Bigmedia.Locales.campCardInformationTitle,

    header: false,

    defaults : {
        /*
        * Seek out the first enabled, focusable, empty textfield when the form is focused
        */
        defaultFocus: 'textfield:not([value]):focusable:not([disabled])',
        iconAlign: 'left',
        padding: 0 //'15px'
    },

    // xtype: 'tabpanel',

    // height: 270,

    tabBar: {
        // defaultButtonUI: 'wizard-' + this.colorScheme,
        cls: 'campcardtabbar',
        layout: {
            pack: 'center'
        }
    },

    // bbar: {
    //     reference: 'save-toolbar',
    //     margin: 8,
    //     items: [
    //         '->',
    //         {
    //             text: 'Save',
    //             // ui: this.colorScheme,
    //             formBind: true,
    //             // bind: {
    //             //     disabled: '{atBeginning}'
    //             // },
    //             listeners: {
    //                 click: 'onSaveClick'
    //             }
    //         },
    //         {
    //             text: 'Cancel',
    //             // ui: this.colorScheme,
    //             formBind: true,
    //             // reference : 'nextbutton',
    //             // bind: {
    //             //     disabled: '{atEnd}'
    //             // },
    //             listeners: {
    //                 click: 'onCancelClick'
    //             }
    //         }
    //     ]
    // },

    items: [
        {
            title: Bigmedia.Locales.campCardtabInfoTitle,
            iconCls: 'fa fa-info',
            xtype: 'form',
            reference: 'infoform',
            defaultType: 'textfield',
            modelValidation: true,
            padding: '15px 0 15px 15px',
            // trackResetOnLoad: true,
            defaults: {
                labelWidth: 90,
                labelAlign: 'top',
                labelSeparator: '',
                submitEmptyText: false,
                anchor: '100%'
            },
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'bottom',
                itemId: 'actionBar',
                // hidden: true,
                items: [
                    {
                        xtype: 'button',
                        text: Bigmedia.Locales.campCardCancelBtnText,
                        handler: function (btn) {
                            btn.up('campcard').lookupViewModel().getStore('campaigns').rejectChanges();
                        }
                    }, '->',
                    {
                        xtype: 'button',
                        text: Bigmedia.Locales.campCardSaveBtnText,
                        itemId: 'saveBtn',
                        handler: function (btn) {
                            // btn.up('campcard').lookupViewModel().getStore('campaigns').commitChanges();
                            // console.log(btn.up('campcard').lookupViewModel().getStore('campaigns'));
                            var store = btn.up('campcard').lookupViewModel().getStore('campaigns'),
                            curCamp = btn.up('campcard').lookupViewModel().get('curCamp');
                            if (curCamp.modified || curCamp.phantom) {
                                store.on('write', function () {
                                    Ext.toast({
                                        html: Bigmedia.Locales.campCardOnWriteToast,
                                        //title: title,
                                        closable: false,
                                        align: 't',
                                        slideInDuration: 400,
                                        minWidth: 400
                                    });
                                }, {
                                    single: true
                                })
                                store.sync();
                            }
                        }
                    }
                ]
            }],
            items:[
                {
                    emptyText : Bigmedia.Locales.campCardCampaignNameEmptyText,
                    bind: {
                        value: '{curCamp.name}'
                    }
                }, {
                    xtype: 'fieldcontainer',
                    fieldLabel: Bigmedia.Locales.campCardPeriodLabel,
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'datefield',
                            flex: 1,
                            bind: {
                                value: '{curCamp.startDate}'
                                // ,
                                // readOnly: '{isNotEditable}'
                            }
                        }, {
                            xtype: 'datefield',
                            flex: 1,
                            bind: {
                                value: '{curCamp.endDate}'
                                // ,
                                // readOnly: '{isNotEditable}'
                            }
                        }
                    ]
                }
                // ,
                // {
                //     xtype: 'combobox',
                //     bind: {
                //         value: '{curCamp.advertiserId}'
                //     }
                // }
            ],
            listeners: {
                dirtychange: function (form, dirty) {
                    // var curCamp = form.owner.lookupViewModel().get('curCamp');
                    // console.log(curCamp.dirty);
                    // console.log(curCamp.phantom);
                    // form.owner.down('#actionBar').setHidden(!curCamp.dirty && !curCamp.phantom);
                },
                validitychange: function (form , valid) {
                    form.owner.down('#saveBtn').setDisabled(!valid);
                }
            }
        }, {
            title: Bigmedia.Locales.campCardtabSubjectsTitle,
            iconCls: 'fa fa-picture-o',
            layout: 'fit',
            items: [{
                xtype: 'grid',
                tbar: [
                    {
                        reference: 'addPosterBtn',
                        xtype: 'button',
                        text: Bigmedia.Locales.campCardAddPosterBtnText,
                        iconCls: 'x-fa fa-plus-square',
                        handler: 'addPosterClick'
                    }
                ],
                // store: 'Posters',
                bind: '{curCamp.posters}',
                // },
                columns: [
                    {
                        header: Bigmedia.Locales.colImage,
                        dataIndex: 'subjectId',
                        sortable: false,
                        width: 250,
                        renderer: function(value, record){
                            var style = '';
                            if (value ) { //&& value.id
                                style = ' style="background-image: url(/api/v1/subjects/' + value + '/image.jpeg)"';
                                // Ext.Date.format(record.get('updatedAt'),'YmdHni') + ')"';
                            }
                            return '<div class="poster-picture"' + style + '/>';
                        }
                    }, {
                        header: Bigmedia.Locales.colPosterName,
                        dataIndex: 'name',
                        flex: 1
                    }, {
                        header: '',
                        width: 50,
                        xtype: 'widgetcolumn',
                        groupable: false,
                        hidable: false,
                        sortable: false,
                        // dataIndex: 'id',
                        widget: {
                            width: 40,
                            // textAlign: 'left',
                            xtype: 'button',
                            iconCls: 'x-fa fa-edit',
                            handler: function(editBtn) {
                                var thePoster = editBtn.getWidgetRecord();
                                editBtn.up('campcard').getController().showDetPoster(thePoster);
                            }
                            // ,
                            // onWidgetAttach: function(col, widget, rec) {
                            //     widget.setDisabled(!(rec.get('operationId') == 1 ||
                            //         rec.get('operationId') == 4 || rec.get('operationId') == 21 ||
                            //         rec.get('operationId') == 22 || rec.get('operationId') == 20));
                            // }
                        },
                        onWidgetAttach: function(col, widget, rec) {
                            widget.setDisabled(+rec.get('ownerId') !== +Bigmedia.Vars.getUser().get('id'));
                        }
                    }, {
                        header: '',
                        width: 50,
                        xtype: 'widgetcolumn',
                        groupable: false,
                        hidable: false,
                        sortable: false,
                        // dataIndex: 'id',
                        widget: {
                            width: 40,
                            // textAlign: 'left',
                            xtype: 'button',
                            iconCls: 'x-fa fa-remove',
                            handler: function(delBtn) {
                                Ext.Msg.confirm({
                                    title: 'Confirm delete subject',
                                    message: 'Are you sure?',
                                    buttons: Ext.Msg.YESNO,
                                    icon: Ext.Msg.QUESTION,
                                    fn: function (btn) {
                                        if (btn === 'yes') {
                                            var rec = delBtn.getWidgetRecord(),
                                            store = rec.store;
                                            if (store) {
                                                store.remove(rec);
                                                store.sync();
                                            }
                                        }
                                    },
                                    scope: delBtn
                                });
                            }
                        },
                        onWidgetAttach: function(col, widget, rec) {
                            widget.setDisabled(+rec.get('ownerId') !== +Bigmedia.Vars.getUser().get('id'));
                        }
                    }
                ]
                // ,
                // listeners: {
                //     itemclick: 'editPosterClick'
                // }
            }]
        }, {
            title: Bigmedia.Locales.campCardtabLiningProgressTitle,
            iconCls: 'fa fa-truck',
            layout: 'fit',
            items: [{
                xtype: 'grid',
                // store: 'Posters',
                bind: '{curCamp.campServiceOperations}',
                reference: 'campServices',
                scrollable: true,
                tbar: [
                    '->',
                    {
                        reference: 'exportservicebtn',
                        xtype: 'button',
                        text: Bigmedia.Locales.gridBtnExportToExcelText,
                        iconCls: 'x-fa fa-file-excel-o',
                        listeners: {
                            click: "exportCampServicesToExcel"
                        }
                    }
                ],
                // },
                columns: [
                    {
                        header: Bigmedia.Locales.colSideNumber,
                        dataIndex: 'sideNum',
                        width: 60
                    }, {
                        header: Bigmedia.Locales.colFaceNum,
                        dataIndex: 'faceNum',
                        width: 60
                    }, {
                        header: Bigmedia.Locales.colCity,
                        dataIndex: 'faceCity',
                        width: 100
                    }, {
                        header: Bigmedia.Locales.colAddress,
                        dataIndex: 'faceAddress',
                        width: 250
                        // flex:1
                    }
                    // , {
                    //     header: 'Type',
                    //     dataIndex: 'typeName',
                    //     width: 120
                    // }
                    , {
                        header: Bigmedia.Locales.colServiceStatus,
                        dataIndex: 'statusName',
                        width: 100
                    }, {
                        //     header: 'Performed',
                        //     dataIndex: 'performedAt',
                        //     xtype:'datecolumn',
                        //     format:'d.m.Y H:i'
                        // }, {
                        header: Bigmedia.Locales.colCoverDate,
                        dataIndex: 'coverAt',
                        xtype:'datecolumn',
                        format:'d.m.Y'
                    }, {
                        header: Bigmedia.Locales.colNote,
                        dataIndex: 'note'
                    }, {
                        header: Bigmedia.Locales.colServicePhoto,
                        dataIndex: 'photoRecObj',
                        sortable: false,
                        width: 250,
                        renderer: function(value){
                            var res = '<div class="poster-picture"></div>';
                            if (value && value.url ) { //&& value.id
                                res = '<a href="' + value.url + '" target="_blank"><div class="poster-picture" style="background-image: url(' + value.url + ')"></div></a>';
                            }
                            return res;
                        }
                    }
                ]
            }]
        }, {
            title: Bigmedia.Locales.campCardtabPhotosTitle,
            iconCls: 'fa fa-camera',
            layout: 'fit',
            padding: 0,
            defaults: {
                padding: 0
            },
            items: [{
                xtype: 'grid',
                reference: 'gridPhotos',
                plugins: 'gridfilters',
                // selModel: {
                //     type: 'checkboxmodel',
                //     checkOnly: true
                // },
                tbar: [
                    '->',
                    {
                        reference: 'exportPhotosBtn',
                        xtype: 'splitbutton',
                        text: Bigmedia.Locales.campCardPhotosExportToZip,
                        iconCls: 'x-fa fa-archive',
                        handler: function (btn) {
                            btn.up('campcard').getController().exportToArchive();
                        },
                        arrowHandler: function (btn) {
                            btn.up('campcard').getController().fillMonthlyExportMenu(btn);
                        }
                        // showEmptyMenu: true,
                        // listeners: {
                        //     click: "exportToArchive"
                        // },
                        // menu: []
                        //handler: function(){
                        //
                        //}
                    }
                ],
                // store: 'Posters',
                bind: '{curCamp.campPhotos}',
                // },
                columns: [
                    {
                        header: Bigmedia.Locales.colSideNumber,
                        dataIndex: 'sideNum',
                        width: 60
                    }, {
                        header: Bigmedia.Locales.colFaceNum,
                        dataIndex: 'faceNum',
                        width: 60
                    }, {
                        header: Bigmedia.Locales.colCity,
                        dataIndex: 'faceCity',
                        width: 100,
                        filter: 'list'
                    }, {
                        header: Bigmedia.Locales.colAddress,
                        dataIndex: 'faceAddress',
                        // flex:1,
                        width: 250,
                        filter: {
                            type: 'string',
                            itemDefaults: {
                                emptyText: Bigmedia.Locales.gridColumnStrFilterText
                            }
                        }
                    }, {
                        header: Bigmedia.Locales.colPhotoType,
                        dataIndex: 'typeName',
                        width: 120,
                        filter: 'list'
                    }, {
                        header: Bigmedia.Locales.colDeadline,
                        dataIndex: 'deadline',
                        xtype:'datecolumn',
                        format:'d.m.Y',
                        width: 120,
                        filter: 'list'
                    }, {
                        header: Bigmedia.Locales.colPhoto,
                        dataIndex: 'photoRecs',
                        sortable: false,
                        width: 250,
                        renderer: function(value){
                            console.log(value)
                            var res = '<div class="poster-picture"></div>';
                            if (value && value.length > 0 ) { //&& value.id
                                res = '<a href="' + value[0].url + '" target="_blank"><div class="poster-picture" style="background-image: url(' + value[0].url + ')"></div></a>';
                            }
                            return res;
                        }
                    }
                    // , {
                    //     header: 'Created',
                    //     dataIndex: 'createdAt',
                    //     xtype:'datecolumn',
                    //     format:'d.m.Y H:i'
                    // }, {
                    //     header: 'Modified',
                    //     dataIndex: 'updatedAt',
                    //     xtype:'datecolumn',
                    //     format:'d.m.Y H:i'
                    // },
                ]
            }]
        }, {
            title: Bigmedia.Locales.campCardtabDocumentsTitle,
            iconCls: 'fa fa-file-pdf-o',
            layout: 'fit',
            items: [{
                xtype: 'grid',
                bind: '{curCamp.documents}',
                columns: [
                    {
                        header: Bigmedia.Locales.colDocNum,
                        dataIndex: 'num'
                    }, {
                        header: Bigmedia.Locales.colDocType,
                        dataIndex: 'type'
                    }, {
                        header: Bigmedia.Locales.colDocStatus,
                        dataIndex: 'status',
                        flex: 1
                    }, {
                        header: Bigmedia.Locales.colCreatedAt,
                        dataIndex: 'createdAt',
                        xtype:'datecolumn',
                        format:'d.m.Y H:i'
                    }, {
                        header: Bigmedia.Locales.colModifiedAt,
                        dataIndex: 'updatedAt',
                        xtype:'datecolumn',
                        format:'d.m.Y H:i'
                    },
                    {
                        header: Bigmedia.Locales.colDownload,
                        width: 50,
                        groupable: false,
                        hidable: false,
                        sortable: false,
                        xtype: 'templatecolumn',
                        tpl: new Ext.XTemplate('<tpl if="pdfId &gt; 0">',
                        '<a target="_blank" href="/api/v1/campaigns/{campaignId}/documents/{id}/pdf" class="x-btn x-unselectable x-btn-default-small x-border-box" style="width:40px;" hidefocus="on" unselectable="on" role="button" aria-hidden="false" aria-disabled="false" tabindex="-1" data-tabindex-value="0" data-tabindex-counter="1">',
                        '<span data-ref="btnWrap" role="presentation" unselectable="on" style="table-layout:fixed;" class="x-btn-wrap x-btn-wrap-default-small ">',
                        '<span data-ref="btnEl" role="presentation" unselectable="on" style="" class="x-btn-button x-btn-button-default-small  x-btn-no-text x-btn-icon x-btn-icon-left x-btn-button-center ">',
                        '<span data-ref="btnIconEl" role="presentation" unselectable="on" class="x-btn-icon-el x-btn-icon-el-default-small x-fa fa-download " style=""></span>',
                        '<span data-ref="btnInnerEl" unselectable="on" class="x-btn-inner x-btn-inner-default-small">&nbsp;</span></span></span>',
                        '</a>',
                        '</tpl>')
                    }
                ]
            }]
        }, {
            title: Bigmedia.Locales.campCardtabPresentationTitle,
            iconCls: 'fa fa-line-chart',
            layout: 'fit',
            items: [{
                xtype: 'panel',
                reference: 'presentationCard',
                layout: 'card',
                items: [
                    {
                        xtype: 'container',
                        width: '100%',
                        height: '100%',
                        layout: {
                            type: 'hbox',
                            pack: 'center',
                            align: 'middle'
                        },
                        items: [
                            {
                                reference: 'addPublishedBtn',
                                xtype: 'button',
                                text: Bigmedia.Locales.campCardPresentationCreateBtn,
                                iconCls: 'x-fa fa-plus-square',
                                handler: 'addPublishedClick'
                            }
                        ]
                    },
                    {
                        xtype: 'container',
                        height: '100%',
                        layout: {
                            type: 'hbox',
                            align: 'stretch'
                        },
                        items: [
                            {
                                xtype: 'container',
                                flex: 1,
                                cls: 'qrcode-container',
                                items: [
                                    {
                                        xtype: 'image',
                                        cls: 'qrcode',
                                        reference: 'qrcode'
                                    }
                                ]
                            },
                            {
                                xtype: 'container',
                                flex: 2,
                                layout: {
                                    type: 'vbox',
                                    align: 'stretch',
                                    pack: 'middle'
                                },
                                items: [
                                    {
                                        xtype: 'container',
                                        layout: {
                                            type: 'hbox'
                                        },
                                        items: [
                                            {
                                                xtype: 'textfield',
                                                flex: 1,
                                                reference: 'publishedcampaignurl',
                                                readOnly: true
                                            },
                                            {
                                                xtype: 'button',
                                                text: Bigmedia.Locales.campCardPresentationOpenBtn,
                                                handler: 'openPresentationClick'
                                            },
                                            {
                                                xtype: 'button',
                                                text: Bigmedia.Locales.campCardPresentationInviteBtn,
                                                handler: 'sendInvitationClick'
                                            }
                                        ]
                                    },
                                    {
                                        xtype: 'toolbar',
                                        items: [
                                            {
                                                xtype: 'button',
                                                text: Bigmedia.Locales.campCardPresentationEditBtn,
                                                handler: 'editPresentationClick'
                                            },
                                            // {
                                            //     xtype: 'button',
                                            //     text: 'Apply changes',
                                            //     handler: 'Perform'
                                            // },
                                            '->',
                                            {
                                                xtype: 'button',
                                                bind: {
                                                    hidden: '{pubCamp.closed}'
                                                },
                                                text: Bigmedia.Locales.campCardPresentationCloseBtn,
                                                handler: 'closePresentationClick'
                                            },
                                            {
                                                xtype: 'button',
                                                bind: {
                                                    hidden: '{!pubCamp.closed}'
                                                },
                                                text: Bigmedia.Locales.campCardPresentationOpenAccessBtn,
                                                handler: 'openAccessPresentationClick'
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }]
            // ,
            // listeners: {
            //     beforeshow: function (panel) {
            //         // panel.up('campcard').getViewModel().get('curCamp.publisheds');
            //     },
            //     show: 'initPublishedCampTab'
            // }
            // items: [
            //     {
            //         xtype: 'container',
            //         layout: {
            //             type: 'hbox',
            //             align: 'stretch'
            //         },
            //         items: [
            //             {
            //                 xtype: 'textfield',
            //                 fieldLabel: 'Линк',
            //                 bind: {
            //                     value: 'http://192.168.4.12:3000/Presenter/?uuid={curCamp.publishCampaignId}'
            //                 },
            //                 flex: 1
            //             }
            //             {
            //                 xtype: 'button',
            //                 text: 'Создать презентацию',
            //                 handler: 'onCreatePresentationClick'
            //             }
            //         ]
            //     }
            // ]
        }
    ]
});
