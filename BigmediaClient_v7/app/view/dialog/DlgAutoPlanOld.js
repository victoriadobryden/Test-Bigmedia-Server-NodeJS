Ext.define("Bigmedia.view.dialog.DlgAutoPlanOld", {
    extend: "Ext.window.Window",

    requires: [
        'Bigmedia.view.autoselectfaces.AutoPlanResult',
        'Bigmedia.view.wizard.WizardForm',
        'Bigmedia.view.wizard.WizardPage',
        'Bigmedia.view.dialog.DlgGiveMePromoCode',
        'Ext.chart.PolarChart',
        'Ext.chart.series.Pie',
        'Ext.chart.interactions.Rotate',
        'Ext.chart.interactions.ItemHighlight',
        'Ext.chart.theme.DefaultGradients',
        'Bigmedia.view.chart.CampStat',
        'Bigmedia.view.field.SplitsField',
        'Bigmedia.view.grid.ThirdParty',
        'Bigmedia.view.field.MultiSelectSplitField',
        'Bigmedia.view.grid.Cities',
        'Bigmedia.view.dialog.DlgAutoPlanController',
        'Bigmedia.view.dialog.DlgAutoPlanModel',
        'Ext.grid.plugin.RowWidget'
    ],

    controller: 'dialog-dlgautoplan',

    // resMaxCov: Ext.create('Bigmedia.store.PlannerStore'),
    // resMinBudget: Ext.create('Bigmedia.store.PlannerStore'),
    // resOptimum:  Ext.create('Bigmedia.store.PlannerStore'),

    // , {
    //     model: 'Face',
    //     autoLoad: true,
    //     proxy: {
    //         type: 'memory'
    //     }
    // }

    viewModel: {
        type: "dialog-dlgautoplan"
    },

    width: '99%',
    height: '99%',

    minWidth: 400,
    minHeight: 380,
    modal: true,
    closable: true,
    closeAction: 'hide',
    title: Bigmedia.Locales.dlgAutoSelectFaces.title,
    referenceHolder: true,
    layout: 'fit',
    items: [
        {
            xtype: 'wizardform',
            reference: 'wizard',
            defaults: {
                header: false,
                xtype: 'wizardpage'
            },
            items: [
                {
                    xtype: 'wizardpage',
                    title: Bigmedia.Locales.dlgAutoSelectFaces.wpPeriodTitle,
                    reference: 'period',
                    iconCls: 'x-fa fa-calendar',
                    layout: {
                        type: 'vbox',
                        align: 'middle',
                        pack: 'begin'
                    },
                    hideNextButton: true,
                    hidePrevButton: true,
                    bind: {
                        isCompleted: '{!(startFrom === "campaign") || startFromCampaignId}'
                    },
                    items: [
                        {
                            xtype: 'form',
                            reference: 'periodform',
                            itemId: 'periodform',
                            defaultType: 'datefield',
                            layout: {
                                type: 'hbox',
                                align: 'middle',
                                pack: 'center'
                            },
                            defaults: {
                                padding: 10,
                                labelWidth: 90,
                                labelAlign: 'top',
                                labelSeparator: '',
                                submitEmptyText: false,
                                anchor: '50%'
                            },
                            items:[
                                {
                                    fieldLabel: Bigmedia.Locales.fieldStartDateLabel,
                                    itemId: 'startDate',
                                    name: 'startDate',
                                    reference: 'startDate',
                                    twoWayBindable: 'value',
                                    bind: {
                                        value: '{startDate}'
                                    },
                                    validator: function (val) {
                                        var valDate = Ext.Date.parse(val, this.format),
                                            errMsg = Bigmedia.Locales.dlgCustomPeriodBegErrMsg,
                                            other = this.up('form').child('#endDate');
                                        if (valDate && +valDate <= +other.getValue()) {
                                            other.checkChange();
                                            other.publishState('value', other.getValue());
                                            return true;
                                        }
                                        return errMsg;
                                    },
                                    listeners: {
                                        change: function (edit, newVal, oldVal) {
                                            var other = edit.up('form').child('#endDate');
                                            // edit.setValue(new Date(Date.UTC(newVal.getFullYear(), newVal.getMonth(), newVal.getDate())));
                                            // console.log(edit.getValue());
                                            if (oldVal && newVal && +oldVal < +newVal && +other.getValue() < +newVal) {
                                                var months = 0, days = 0, curDate = new Date(+oldVal), otherVal = other.getValue();
                                                otherVal.setDate(otherVal.getDate() + 1);
                                                var tmp = new Date(+curDate);
                                                while (tmp <= otherVal) {
                                                    tmp.setMonth(curDate.getMonth() + 1);
                                                    if (tmp <= otherVal) {
                                                        months++;
                                                        curDate = tmp;
                                                    }
                                                }
                                                tmp = new Date(+curDate);
                                                while (tmp < otherVal) {
                                                    days++;
                                                    tmp.setDate(curDate.getDate() + 1);
                                                    curDate = tmp;
                                                }
                                                // var otherNew = new Date(+newVal);
                                                // otherNew.setMonth(newVal.getMonth() + months, newVal.getDate() + days - 1);
                                                var otherNew = new Date(Date.UTC(newVal.getFullYear(), newVal.getMonth() + months, newVal.getDate() + days - 1));
                                                other.setValue(otherNew);
                                            }
                                            edit.up('window').getController().onUpdatePeriod();
                                        }
                                    }
                                }, {
                                    fieldLabel: Bigmedia.Locales.fieldEndDateLabel,
                                    itemId: 'endDate',
                                    name: 'endDate',
                                    reference: 'endDate',
                                    twoWayBindable: 'value',
                                    bind: {
                                        value: '{endDate}'
                                    },
                                    validator: function (val) {
                                        var valDate = Ext.Date.parse(val, this.format),
                                            errMsg = Bigmedia.Locales.dlgCustomPeriodEndErrMsg,
                                            other = this.up('form').child('#startDate');
                                        if (valDate && +valDate >= +other.getValue()) {
                                            other.checkChange();
                                            other.publishState('value', other.getValue());
                                            return true;
                                        }
                                        return errMsg;
                                    },
                                    listeners: {
                                        change: function (edit, newVal, oldVal) {
                                            var other = edit.up('form').child('#startDate');
                                            // edit.setValue(new Date(Date.UTC(newVal.getFullYear(), newVal.getMonth(), newVal.getDate())));
                                            // edit.publishState('value', edit.getValue());
                                            // console.log(edit.getValue());
                                            if (oldVal && newVal && +oldVal > +newVal && +other.getValue() > +newVal) {
                                                var months = 0, days = 0, curDate = new Date(+oldVal), otherVal = other.getValue();
                                                otherVal.setDate(otherVal.getDate() - 1);
                                                var tmp = new Date(+curDate);
                                                while (tmp >= otherVal) {
                                                    tmp.setMonth(curDate.getMonth() - 1);
                                                    if (tmp >= otherVal) {
                                                        months++;
                                                        curDate = tmp;
                                                    }
                                                }
                                                tmp = new Date(+curDate);
                                                while (tmp >= otherVal) {
                                                    days++;
                                                    tmp.setDate(curDate.getDate() - 1);
                                                    curDate = tmp;
                                                }
                                                var otherNew = new Date(Date.UTC(newVal.getFullYear(), newVal.getMonth() - months, newVal.getDate() - days + 1));
                                                // otherNew.setMonth(newVal.getMonth() - months, newVal.getDate() - days + 1);
                                                other.setValue(otherNew);
                                            }
                                            edit.up('window').getController().onUpdatePeriod();
                                        }
                                    }
                                }
                            ],
                            listeners: {
                                validitychange: function (form , valid) {
                                    form.owner.up('wizardpage').setIsCompleted(valid);
                                }
                            }
                        },
                        {
                            xtype: 'container',
                            reference: 'startfrom',
                            // title: 'Start from',
                            layout: {
                                type: 'hbox',
                                align: 'stretchmax',
                                pack: 'center'
                            },
                            width: '90%',
                            defaultType: 'fieldset',
                            padding: 10,
                            defaults: {
                                margin: 5,
                                layout: {
                                    type: 'vbox',
                                    align: 'stretch',
                                    pack: 'start'
                                },
                                flex: 1,
                                defaults: {
                                    margin: 5
                                    // ,
                                    // padding: 5
                                }
                            },
                            items: [
                                {
                                    items: [
                                        {
                                            xtype: 'button',
                                            scale: 'large',
                                            ui: 'soft-green',
                                            width: '90%',
                                            text: Bigmedia.Locales.dlgAutoSelectFaces.startFromBlankBtnText,
                                            // toggleGroup: 'StartFrom',
                                            // pressed: true,
                                            // allowDepress: false,
                                            handler: function (btn) {
                                                // if (btn.pressed) {
                                                    btn.lookupViewModel().set('startFrom', 'blank');
                                                    btn.up('wizardform').goNext();
                                                // }
                                            }
                                        },
                                        {
                                            xtype: 'component',
                                            html: '<center>' + Bigmedia.Locales.dlgAutoSelectFaces.startFromBlankDescr + '</center>',
                                            flex: 1
                                        }
                                    ]
                                },
                                {
                                    items: [
                                        {
                                            xtype: 'button',
                                            scale: 'large',
                                            ui: 'soft-green',
                                            width: '90%',
                                            text: Bigmedia.Locales.dlgAutoSelectFaces.startFromCartBtnText,
                                            // toggleGroup: 'StartFrom',
                                            // allowDepress: false,
                                            bind: {
                                                disabled: '{cartIsEmpty}'
                                            },
                                            handler: function (btn) {
                                                // if (btn.pressed) {
                                                    btn.lookupViewModel().set('startFrom', 'cart');
                                                // }
                                                btn.up('wizardform').goNext();
                                            }
                                        },
                                        {
                                            xtype: 'component',
                                            html: '<center>' + Bigmedia.Locales.dlgAutoSelectFaces.startFromCartDescr + '</center>',
                                            flex: 1
                                        }
                                    ]
                                },
                                {
                                    items: [
                                        {
                                            xtype: 'button',
                                            scale: 'large',
                                            ui: 'soft-green',
                                            width: '90%',
                                            text: Bigmedia.Locales.dlgAutoSelectFaces.startFromCampaignBtnText,
                                            bind: {
                                                disabled: '{!startFromCampaignId}'
                                            },
                                            // toggleGroup: 'StartFrom',
                                            // allowDepress: false,
                                            handler: function (btn) {
                                                // if (btn.pressed) {
                                                    btn.lookupViewModel().set('startFrom', 'campaign');
                                                    btn.up('wizardform').goNext();
                                                // }
                                            }
                                        },
                                        {
                                            xtype: 'component',
                                            html: '<center>' + Bigmedia.Locales.dlgAutoSelectFaces.startFromCampaignDescr + '</center>',
                                            flex: 1
                                        },
                                        {
                                            xtype: 'combo',
                                            bind: {
                                                store: '{campaigns}',
                                                value: '{startFromCampaignId}'
                                            },
                                            width: '100%',
                                            forceSelection: true,
                                            queryMode: 'local',
                                            valueField: 'id',
                                            reference: 'startFromCampaignCombo',
                                            itemId: 'startFromCampaignCombo',
                                            listConfig: {
                                                minWidth: 150
                                            },
                                            displayField: 'name',
                                            // Template for the dropdown menu.
                                            // Note the use of the "x-list-plain" and "x-boundlist-item" class,
                                            // this is required to make the items selectable.
                                            tpl: Ext.create('Ext.XTemplate',
                                                '<tpl for=".">',
                                                    '<li class="campview-combo-item camp-combo-preview-100 camp-combo-dataitem x-boundlist-item">',
                                                        '<div class="camp-picture "',
                                                            '<tpl if="this.hasSubject(subjectId) == true"> style="background-image: url(/api/v1/subjects/{subjectId}/image.jpeg)"</tpl>>',
                                                            '<div class="camp-combo-info">',
                                                                '<div class="camp-combo-name">{name}</div>',
                                                                '<div class="camp-combo-period">{startDate:date("d.m.Y")}&nbsp;-&nbsp;{endDate:date("d.m.Y")}</div>',
                                                            '</div>',
                                                        '</div>',
                                                    '</li>',
                                                '</tpl>',
                                                {
                                                    hasSubject: function (subjectId) {
                                                        return !!subjectId;
                                                    }
                                                }
                                            ),
                                            // template for the content inside text field
                                            displayTpl: Ext.create('Ext.XTemplate',
                                                '<tpl for=".">',
                                                    '{name} ({startDate:date("d.m.Y")}..{endDate:date("d.m.Y")})',
                                                '</tpl>'
                                            ),
                                            listeners: {
                                                select: function (combo) {
                                                    combo.up('wizardpage').setIsCompleted(true);
                                                }
                                            }
                                        }
                                    ]
                                }
                            ]
                            // items: [
                            //     {
                            //         boxLabel: 'New campaign', reference: 'startFromNew', name: 'startFrom', inputValue: 'new', bind: { value: '{startFromNew}'}, checked: true,
                            //         listeners: {
                            //             change: function (radio) {
                            //                 radio.up('wizardpage').setIsCompleted(true);
                            //             }
                            //         }
                            //     },
                            //     {
                            //         boxLabel: 'Extend cart', reference: 'startFromCart', name: 'startFrom', inputValue: 'cart', bind: { disabled: '{cartIsEmpty}', value: '{startFromCart}'},
                            //         listeners: {
                            //             change: function (radio) {
                            //                 radio.up('wizardpage').setIsCompleted(true);
                            //             }
                            //         }
                            //     },
                            //     {
                            //         xtype: 'container',
                            //         layout: 'vbox',
                            //         width: '100%',
                            //         items: [
                            //             {
                            //                 xtype: 'radio',
                            //                 boxLabel: 'Improve Campaign',
                            //                 reference: 'startFromCampaign',
                            //                 name: 'startFrom',
                            //                 itemId: 'startFromCampaign',
                            //                 inputValue: 'campaign',
                            //                 bind: {
                            //                     value: '{startFromCampaign}'
                            //                 },
                            //                 listeners: {
                            //                     change: function (radio) {
                            //                         radio.up('wizardpage').setIsCompleted(true);
                            //                     }
                            //                 }
                            //                 // , bind: { disabled: '{campaign's empty}'}
                            //             },
                            //             {
                            //                 xtype: 'combo',
                            //                 bind: {
                            //                     store: '{campaigns}',
                            //                     value: '{startFromCampaignId}'
                            //                 },
                            //                 width: '100%',
                            //                 forceSelection: true,
                            //                 queryMode: 'local',
                            //                 valueField: 'id',
                            //                 reference: 'startFromCampaignCombo',
                            //                 itemId: 'startFromCampaignCombo',
                            //                 listConfig: {
                            //                     minWidth: 150
                            //                 },
                            //                 displayField: 'name',
                            //                 // Template for the dropdown menu.
                            //                 // Note the use of the "x-list-plain" and "x-boundlist-item" class,
                            //                 // this is required to make the items selectable.
                            //                 tpl: Ext.create('Ext.XTemplate',
                            //                     '<tpl for=".">',
                            //                         '<li class="campview-combo-item camp-combo-preview-100 camp-combo-dataitem x-boundlist-item">',
                            //                             '<div class="camp-picture "',
                            //                                 '<tpl if="this.hasSubject(subjectId) == true"> style="background-image: url(/api/v1/subjects/{subjectId}/image.jpeg)"</tpl>>',
                            //                                 '<div class="camp-combo-info">',
                            //                                     '<div class="camp-combo-name">{name}</div>',
                            //                                     '<div class="camp-combo-period">{startDate:date("d.m.Y")}&nbsp;-&nbsp;{endDate:date("d.m.Y")}</div>',
                            //                                 '</div>',
                            //                             '</div>',
                            //                         '</li>',
                            //                     '</tpl>',
                            //                     {
                            //                         hasSubject: function (subjectId) {
                            //                             return !!subjectId;
                            //                         }
                            //                     }
                            //                 ),
                            //                 // template for the content inside text field
                            //                 displayTpl: Ext.create('Ext.XTemplate',
                            //                     '<tpl for=".">',
                            //                         '{name} ({startDate:date("d.m.Y")}..{endDate:date("d.m.Y")})',
                            //                     '</tpl>'
                            //                 ),
                            //                 listeners: {
                            //                     select: function (combo) {
                            //                         combo.up('wizardpage').setIsCompleted(true);
                            //                     }
                            //                 }
                            //             }
                            //         ]
                            //     }
                            // ]
                        }
                    ],
                    // applyIsCompleted: function (newVal) {
                    //     var me = this,
                    //         store = me.up('window').getViewModel().getStore('srcFaces'),
                    //         startFromCampaign = me.up('window').getViewModel().get('startFromCampaign'),
                    //         startFromCampaignId = me.up('window').getViewModel().get('startFromCampaignId');
                    //         // combo = me.down('combo#startFromCampaignCombo');
                    //     return newVal && store && (store.getCount() > 0) && (!startFromCampaign || !startFromCampaign.checked || startFromCampaignId);
                    // },
                    listeners: {
                        show: function (page) {
                            var dlg = page.up('window'),
                                start = page.down('datefield#startDate'),
                                end = page.down('datefield#endDate'),
                                now = new Date();
                            var minDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1));
                            var maxDate;
                            var facesStore = dlg.getViewModel().getStore('srcFaces');
                            if (facesStore && facesStore.getAt(0)) {
                                var occ = facesStore.getAt(0).get('occupancy');
                                if (occ) {
                                    occ = occ[0];
                                    var days = +occ.split(/\D/).reduce(function(s, i){return s + (+i);}, 0);
                                    maxDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + days));
                                }
                            }
                            if (!maxDate) {
                                maxDate = new Date(minDate.getFullYear() + 1, 11, 31);
                            }
                            start.setMinValue(minDate);
                            start.setMaxValue(maxDate);
                            end.setMinValue(minDate);
                            end.setMaxValue(maxDate);
                            var startVal = new Date(Date.UTC(now.getFullYear(), now.getMonth()+1, 1)),
                                endVal = new Date(Date.UTC(now.getFullYear(), now.getMonth()+2, 0));
                            if (!start.getValue()){
                                start.setValue(startVal);
                            }
                            if (!end.getValue()){
                                end.setValue(endVal);
                            }
                        }
                    }
                },
                {
                    xtype: 'wizardpage',
                    title: Bigmedia.Locales.dlgAutoSelectFaces.addThirdPartyTitle,
                    reference: 'sourcepage',
                    iconCls: 'x-fa fa-database',
                    isCompleted: true,
                    layout: {
                        type: 'vbox',
                        align: 'stretch',
                        pack: 'begin'
                    },
                    items: [
                        {
                            xtype: 'component',
                            html: '<center>' + Bigmedia.Locales.dlgAutoSelectFaces.addThirdPartyDescr + '</center>'
                        },
                        // {
                        //     xtype: 'fieldset',
                        //     title: 'Faces\'s source',
                        //     defaultType: 'checkbox',
                        //     layout: 'hbox',
                        //     items: [
                        //         {
                        //             boxLabel: 'Bigmedia',
                        //             name: 'face-source-bigmedia',
                        //             inputValue: 'Bigmedia',
                        //             checked: true,
                        //             disabled: true,
                        //             margin: '0 20 0 0'
                        //         },
                        //         {
                        //             boxLabel: 'Third-party',
                        //             name: 'face-source-third-party',
                        //             inputValue: 'third-party',
                        //             // checked: false,
                        //             bind: {
                        //                 value: '{thirdpartySource}'
                        //             },
                        //             listeners: {
                        //                 change: function (chbox, newVal) {
                        //                     var tpStore = Ext.getStore('ThirdPartyBoards'),
                        //                         mainView = chbox.up('window');
                        //                     if (newVal && tpStore.getCount() === 0) {
                        //                         var win = mainView.lookupReference('dlgImportPrices');
                        //                         if (!win) {
                        //                             win = new Bigmedia.view.dialog.DlgImportPrices({
                        //                                 onlyDoorsNo: true,
                        //                                 reference: 'dlgImportPrices',
                        //                                 callbackImport: function (prices, linkField) {
                        //                                     var nums = Object.keys(prices);
                        //                                     Ext.Ajax.request({
                        //                                         url: '/api/v1/thirdparty',
                        //                                         method: 'POST',
                        //                                         jsonData: {dixes: nums}
                        //                                     }).then(function(response, opts) {
                        //                                         var faces = Ext.decode(response.responseText);
                        //                                         faces.forEach(function(face){
                        //                                             face.price = prices[face.doors_no];
                        //                                         });
                        //                                         tpStore.loadRawData(faces, true);
                        //                                         tpStore.fireEventArgs('add', [tpStore, faces]);
                        //                                     },
                        //                                     function(response, opts) {
                        //                                         console.log('server-side failure with status code ' + response.status);
                        //                                     });
                        //                                 },
                        //                                 callbackScope: null
                        //                             });
                        //                             mainView.add(win);
                        //                         }
                        //                         win.show();
                        //                     } else {
                        //                         var srcFaces = mainView.getViewModel().getStore('srcFaces');
                        //                         if (!newVal) {
                        //                             var recsToRemove = [];
                        //                             (srcFaces.getData().getSource() || src.Faces.getData()).each(function(face){
                        //                                     if (face.get('supplier') !== 'BIGMEDIA') {
                        //                                         recsToRemove.push(face);
                        //                                     }
                        //                             });
                        //                             srcFaces.remove(recsToRemove);
                        //                         } else {
                        //                             var recsToAdd = [];
                        //                             (tpStore.getData().getSource() || tpStore.getData()).each(function(face){
                        //                                 recsToAdd.push(face);
                        //                             });
                        //                             srcFaces.add(recsToAdd);
                        //                             srcFaces.fireEventArgs('load', [srcFaces]);
                        //                         }
                        //
                        //                     }
                        //                 }
                        //             }
                        //         }
                        //     ]
                        // },
                        {
                            xtype: 'thirdparty-grid',
                            itemId: 'thirdpartygrid',
                            flex: 1,
                            store: 'ThirdPartyBoards'
                        }
                    ]
                },
                {
                    title: Bigmedia.Locales.dlgAutoSelectFaces.wpCitiesTitle,
                    iconCls: 'x-fa fa-map-marker',
                    layout: {
                        type: 'vbox',
                        pack: 'center',
                        align: 'stretch'
                    },
                    scrollable: 'y',
                    bind: {
                        isCompleted: '{planStore.count > 0}'
                    },
                    items: [
                        {
                            xtype: 'cities-grid',
                            reference: 'citiesGrid',
                            bind: {
                                store: '{cities}'
                                // facesStore: '{srcFaces}'
                            },
                            flex: 1
                        },
                        // {
                        //     xtype: 'reftag',
                        //     reference: 'reftagcity',
                        //     width: '100%',
                        //     filterField: 'city',
                        //     multiSelect: true,
                        //     fieldLabel: Bigmedia.Locales.colCity,
                        //     allowBlank: false,
                        //     bind: {
                        //         targetStore: '{srcFaces}',
                        //         store: '{cities}'
                        //     },
                        //     validator: function (val) {
                        //         var errMsg = "Select city with available faces";
                        //         // if the numeric value is not 10 digits return an error message
                        //         return (val && this.getTargetStore().getCount() > 0) ? true : errMsg;
                        //     },
                        //     listeners: {
                        //         validitychange: function (tag , valid) {
                        //             tag.up('wizardpage').setIsCompleted(valid);
                        //         }
                        //     }
                        // },
                    ],
                    listeners: {
                        show: function (page) {
                            var grid = page.child('cities-grid'),
                                store = grid.getStore(),
                                selModel = grid.getSelectionModel(),
                                selected = selModel.getSelection();
                            store.beginUpdate();
                            store.each(function(rec){
                                if (rec.get('selected') && ! selected.some(function(sel){
                                    return rec.getId() === sel.getId();
                                })) {
                                    rec.set('selected', false);
                                }
                            });
                            selected.forEach(function(selRec){
                                if (!selRec.get('selected')) {
                                    selRec.set('selected', true);
                                }
                            });
                            // selModel.deselectAll();
                            // store.each(function(rec){
                            //     if (rec.get('selected')) {
                            //         rec.set('selected', false);
                            //     }
                            // });
                            store.endUpdate();
                        }
                    }
                }, {
                    xtype: 'wizardpage',
                    title: Bigmedia.Locales.dlgAutoSelectFaces.splitsTitle,
                    reference: 'planSplits',
                    iconCls: 'x-fa fa-arrows-h',
                    width: '100%',
                    layout: {
                        type: 'vbox',
                        pack: 'center',
                        align: 'middle'
                    },
                    isCompleted: true,
                    defaults: {
                        padding: 10
                    },
                    items: [
                        {
                            xtype: 'container',
                            layout: {
                                type: 'hbox',
                                align: 'middle'
                            },
                            width: '100%',
                            scrollable: 'y',
                            defaults: {
                                padding: 5
                            },
                            items: [
                                {
                                    xtype: 'checkbox',
                                    boxLabel: 'A/B',
                                    reference: 'splitAB',
                                    publishes: 'value',
                                    checked: true
                                },
                                {
                                    xtype: 'numberfield',
                                    reference: 'fieldcata',
                                    bind: {
                                        disabled: '{!splitAB.value}',
                                        value: '{fieldcata}'
                                    },
                                    minValue: 0,
                                    step: 5,
                                    maxValue: 100,
                                    width: 70
                                },
                                {
                                    xtype: 'splitsfield',
                                    flex: 1,
                                    height: 90,
                                    reference: 'splitsfieldcatab',
                                    bind: {
                                        disabled: '{!splitAB.value}',
                                        store: '{catabStore}'
                                        // ,
                                        // facesStore: '{srcFaces}'
                                    },
                                    dimensionField: 'catab',
                                    dimensionName: 'A/B',
                                    series: {
                                        title: ['A', 'B'],
                                        xField: 'dimension',
                                        yField: ['data0', 'data1'],
                                        labelField: ['name0', 'name1']
                                    }
                                },
                                {
                                    xtype: 'numberfield',
                                    reference: 'fieldcatb',
                                    bind: {
                                        disabled: '{!splitAB.value}',
                                        value: '{fieldcatb}'
                                    },
                                    minValue: 0,
                                    step: 5,
                                    maxValue: 100,
                                    width: 70
                                }
                                // ,
                                // {
                                //     xtype: 'radiogroup',
                                //     vertical: true,
                                //     columns: 1,
                                //     hidden: true,
                                //     bind: {
                                //         disabled: '{!splitAB.value}'
                                //     },
                                //     items: [
                                //         { boxLabel: 'За кількістю', name: 'rb', inputValue: '1', checked: true },
                                //         { boxLabel: 'За бюджетом', name: 'rb', inputValue: '2' }
                                //     ]
                                // }
                            ]
                        }, {
                            xtype: 'reftag',
                            reference: 'reftagsize',
                            width: '100%',
                            filterField: 'size',
                            multiSelect: true,
                            fieldLabel: Bigmedia.Locales.colSize,
                            bind: {
                                targetStore: '{srcFaces}'
                                // ,
                                // store: '{sizes}'
                            }
                        }, {
                            xtype: 'reftag',
                            reference: 'reftagsidetype',
                            width: '100%',
                            filterField: 'sidetype',
                            multiSelect: true,
                            fieldLabel: Bigmedia.Locales.colSidetype,
                            bind: {
                                targetStore: '{srcFaces}'
                                // ,
                                // store: '{sidetypes}'
                            }
                        }, {
                            xtype: 'fieldset',
                            title: Bigmedia.Locales.dlgAutoSelectFaces.additParameters,
                            collapsible: true,
                            collapsed: true,
                            layout: 'vbox',
                            width: '100%',
                            defaults: {
                                xtype: 'numberfield',
                                width: '100%',
                                minValue: 0,
                                labelWidth: 200
                            },
                            items: [
                                {
                                    bind: {
                                        value: '{maxOnStreet}'
                                    },
                                    fieldLabel: Bigmedia.Locales.dlgAutoSelectFaces.maxOnStreetLabel,
                                    step: 1
                                },
                                {
                                    bind: {
                                        value: '{minDistanceOnStreet}'
                                    },
                                    fieldLabel: Bigmedia.Locales.dlgAutoSelectFaces.minDistanceOnStreetLabel,
                                    step: 10
                                },
                                {
                                    bind: {
                                        value: '{minDistance}'
                                    },
                                    fieldLabel: Bigmedia.Locales.dlgAutoSelectFaces.minDistanceLabel,
                                    step: 1
                                },
                                // {
                                //     xtype: 'refmediaparamslider',
                                //     reference: 'refGRP',
                                //     hideEmptyLabel: true,
                                //     labelWidth: 30,
                                //     anchor: '0',
                                //     bind: {
                                //         targetStore: '{srcFaces}'
                                //     },
                                //     width: '90%',
                                //     fieldLabel: 'GRP',
                                //     values: [0.01, 24.6],
                                //     increment: 0.01,
                                //     decimalPrecision: 2,
                                //     minValue: 0,
                                //     maxValue: 24.6,
                                //     filterField: 'grp'
                                // },
                                {
                                    xtype: 'refmediaparamslider',
                                    hideEmptyLabel: true,
                                    labelWidth: 30,
                                    anchor: '0',
                                    bind: {
                                        targetStore: '{srcFaces}'
                                    },
                                    width: '90%',
                                    reference: 'refOTS',
                                    fieldLabel: 'OTS',
                                    values: [1, 101],
                                    increment: 1,
                                    minValue: 0,
                                    maxValue: 101,
                                    filterField: 'ots'
                                }
                            ]
                        }
                        // ,
                        // {
                        //     xtype: 'container',
                        //     layout: {
                        //         type: 'hbox',
                        //         align: 'middle'
                        //     },
                        //     width: '100%',
                        //     items: [
                        //         {
                        //             xtype: 'checkbox',
                        //             boxLabel: 'Suppliers',
                        //             reference: 'splitSupplier',
                        //             publishes: 'value'
                        //         },
                        //         {
                        //             xtype: 'multiselectsplitfield',
                        //             reference: 'splitSupplierSelect',
                        //             flex: 1,
                        //             bind: {
                        //                 facesStore: '{srcFaces}',
                        //                 disabled: '{!splitSupplier.value}'
                        //             },
                        //             dimensionField: 'supplier',
                        //             dimensionName: 'Supplier',
                        //             limits: {
                        //                 BIGMEDIA: {
                        //                     min: 25,
                        //                     max: null
                        //                 }
                        //             }
                        //         }
                        //     // {
                        //         //     xtype: 'splitsfield',
                        //         //     flex: 1,
                        //         //     reference: 'splitsfieldsupplier',
                        //         //     bind: {
                        //             //         disabled: '{!splitSupplier.value}',
                        //             //         facesStore: '{srcFaces}'
                        //             //     },
                        //             //     dimensionField: 'supplier',
                        //             //     dimensionName: 'Supplier',
                        //             //     limits: {
                        //                 //         BIGMEDIA: {
                        //                     //             min: 25
                        //                     //         }
                        //                     //     }
                        //                     // },
                        //                     // {
                        //                         //     xtype: 'radiogroup',
                        //                         //     vertical: true,
                        //                         //     columns: 1,
                        //                         //     bind: {
                        //                             //         disabled: '{!splitSupplier.value}'
                        //                             //     },
                        //                             //     items: [
                        //                                 //         { boxLabel: 'За кількістю', name: 'rb', inputValue: '1' },
                        //                                 //         { boxLabel: 'За бюджетом', name: 'rb', inputValue: '2', checked: true }
                        //                                 //     ]
                        //                                 // }
                        //     ]
                        // }
                        // {
                        //     xtype: 'fieldset',
                        //     collapsible: true,
                        //     collapsed: false,
                        //     title: 'Splits',
                        //     width: '100%',
                        //     layout: 'vbox',
                        //     items: [
                        //     ]
                        // }
                    ]
                }, {
                    xtype: 'wizardpage',
                    title: Bigmedia.Locales.dlgAutoSelectFaces.wpBudgetTitle,
                    reference: 'planPage',
                    iconCls: 'x-fa fa-money',
                    // width: '100%',
                    layout: {
                        type: 'vbox',
                        pack: 'center',
                        align: 'stretch'
                    },
                    // isCompleted: false,
                    bind: {
                        isCompleted: '{planReady && (ruleType === "1" || theGroup)}'
                    },
                    // listeners: {
                        // hide: function (page) {
                        //     // console.log('hide %o', page.down('grid'));
                        //     var grid = page.down('grid');
                        //     // grid.setStore(null);
                        // },
                        // show: function (page) {
                        //     // console.log('show %o', page.down('grid'));
                        //     var grid = page.down('grid'),
                        //         win = page.up('window'),
                        //         vm = win.getViewModel();
                        //     // grid.setStore(vm.get('planStore'));
                        // }
                    // },
                    items: [
                        {
                            xtype: 'grid',
                            // width: '100%',
                            reference: 'planGrid',
                            flex: 1,
                            bind: {
                                store: '{planStore}'
                            },
                            viewConfig: {
                                listeners: {
                                    expandbody: function (rowNode, record, expandRow, e) {

                                        // console.log([this, rowNode, record, expandRow, e]);
                                        var tv = this,
                                            grid = tv.ownerGrid;
                                        var pluggy = grid.getPlugin('rowwidget');
                                        grid.getStore().each(function(rec) {
                                            var node = tv.getNodeByRecord(rec);
                                            if (node && node !== rowNode) {
                                                var normalRow = Ext.fly(node),
                                                isCollapsed = normalRow.hasCls(pluggy.rowCollapsedCls);
                                                if (!isCollapsed) {
                                                    pluggy.toggleRow(tv.indexOf(node), record);
                                                }
                                            }
                                        });
                                    }
                                },
                                markDirty: false
                            },
                            forceFit: true,
                            // lockedGridConfig: {
                            //     header: false,
                            //     // collapsible: false,
                            //     width: "50%",
                            //     minWidth: 300,
                            //     forceFit: true
                            // },
                            columns: [
                                {
                                    text: Bigmedia.Locales.colCity,
                                    dataIndex: 'name',
                                    width: 300
                                    // ,
                                    // locked: true
                                },
                                {
                                    text: Bigmedia.Locales.dlgAutoSelectFaces.planBudgetLabel,
                                    dataIndex: 'budget',
                                    // flex: 1,
                                    width: 120,
                                    editor: {
                                        xtype: 'numberfield',
                                        step: 1000,
                                        minValue: 0
                                    }
                                },
                                {
                                    text: Bigmedia.Locales.dlgAutoSelectFaces.planBoardsLabel,
                                    dataIndex: 'quantity',
                                    // flex: 1,
                                    width: 120,
                                    editor: {
                                        xtype: 'numberfield',
                                        step: 1,
                                        minValue: 0
                                    }
                                },
                                {
                                    text: Bigmedia.Locales.dlgAutoSelectFaces.planCoverageLabel,
                                    dataIndex: 'coverage',
                                    // flex: 1,
                                    width: 120,
                                    editor: {
                                        xtype: 'numberfield',
                                        step: 1,
                                        minValue: 0,
                                        maxValue: 90
                                    }
                                }
                            ],
                            plugins: {
                                cellediting: {
                                    clicksToEdit: 1
                                },
                                rowwidget: {
                                    selectRowOnExpand: true,
                                    widget: {
                                        xtype: 'container',
                                        layout: {
                                            type: 'hbox',
                                            align: 'stretchmax',
                                            pack: 'start'
                                        },
                                        config: {
                                            record: null
                                        },
                                        bind: {
                                            record: '{record}'
                                        },
                                        defaultBindProperty: 'record',
                                        defaults: {
                                            padding: 3
                                        },
                                        items: [
                                            {
                                                xtype: 'multiselectsplitfield',
                                                // reference: 'splitSupplierSelect',
                                                // flex: 1,
                                                width: 370,
                                                bind: {
                                                    selStore: '{record.selsuppliers}',
                                                    searchStore: '{record.suppliers}',
                                                    parentName: '{record.name}'
                                                },
                                                dimensionField: 'name',
                                                dimensionName: Bigmedia.Locales.colSupplier,
                                                limits: {
                                                    BIGMEDIA: {
                                                        min: 25,
                                                        max: null
                                                    }
                                                }
                                            },
                                            {
                                                xtype: 'multiselectsplitfield',
                                                // reference: 'splitSupplierSelect',
                                                // flex: 1,
                                                width: 370,
                                                bind: {
                                                    selStore: '{record.selsizes}',
                                                    searchStore: '{record.sizes}',
                                                    parentName: '{record.name}'
                                                },
                                                splitMode: 'limits',
                                                dimensionField: 'name',
                                                dimensionName: Bigmedia.Locales.colSize
                                                // ,
                                                // limits: {
                                                //     BIGMEDIA: {
                                                //         min: 25,
                                                //         max: null
                                                //     }
                                                // }
                                            }
                                            // {
                                            // xtype: 'multiselector',
                                            // autoLoad: true,
                                            // width: 370,
                                            // plugins: {
                                            //     cellediting: {
                                            //         clicksToEdit: 1
                                            //         // triggerEvent: 'cellfocus'
                                            //     }
                                            // },
                                            // viewConfig: {
                                            //     markDirty: false
                                            // },
                                            // bind: {
                                            //     store: '{record.selsizes}',
                                            //     title: Bigmedia.Locales.dlgAutoSelectFaces.multiselectLimitsBySizesTitle + '{record.name}',
                                            //     search: {
                                            //         xtype: 'multiselector-search',
                                            //         minWidth: 130,
                                            //         width: 130,
                                            //         height: 200,
                                            //         field: 'name',
                                            //         store: '{record.sizes}'
                                            //     }
                                            // },
                                            // columns: [{
                                            //     text: Bigmedia.Locales.colSize,
                                            //     dataIndex: 'longname',
                                            //     menuDisabled: true,
                                            //     hideable: false,
                                            //     width: 150
                                            // }, {
                                            //     text: Bigmedia.Locales.dlgAutoSelectFaces.colLimits,
                                            //     dataIndex: 'limit',
                                            //     menuDisabled: true,
                                            //     hideable: false,
                                            //     width: 80,
                                            //     editor: {
                                            //         xtype: 'numberfield',
                                            //         minValue: 0
                                            //     }
                                            // }, {
                                            //     text: '',
                                            //     xtype: 'actioncolumn',
                                            //     menuDisabled: true,
                                            //     hideable: false,
                                            //     flex: 1,
                                            //     align: 'end',
                                            //     // width: 40,
                                            //     items: [{
                                            //         iconCls: 'x-fa fa-times',
                                            //         tooltip: Bigmedia.Locales.gridBtnRemoveSidesText,
                                            //         handler: function(grid, rowIndex, colIndex) {
                                            //             var rec = grid.getStore().getAt(rowIndex);
                                            //             grid.getStore().remove(rec);
                                            //             var ms = grid.up('multiselector'),
                                            //             searchGrid = ms.searchPopup.lookup('searchGrid');
                                            //             searchGrid.getSelectionModel().deselect([rec]);
                                            //             // ms.search.deselectRecords([rec]);
                                            //         }
                                            //     }]
                                            // }]

                                            // }
                                        ]
                                    }
                                }
                            }
                        },
                        // ,
                        // {
                        //     xtype: 'container',
                        //     layout: {
                        //         type: 'hbox',
                        //         align: 'stretchmax',
                        //         pack: 'start'
                        //     },
                        //     // config: {
                        //     //     record: null
                        //     // },
                        //     // bind: {
                        //     //     record: '{record}'
                        //     // },
                        //     // defaultBindProperty: 'record',
                        //     defaults: {
                        //         padding: 3
                        //     },
                        //     items: [
                        //         {
                        //             xtype: 'multiselectsplitfield',
                        //             // reference: 'splitSupplierSelect',
                        //             // flex: 1,
                        //             width: 370,
                        //             bind: {
                        //                 selStore: '{planGrid.selection.selsuppliers}',
                        //                 searchStore: '{planGrid.selection.suppliers}',
                        //                 parentName: '{planGrid.selection.name}'
                        //             },
                        //             dimensionField: 'name',
                        //             dimensionName: Bigmedia.Locales.colSupplier,
                        //             limits: {
                        //                 BIGMEDIA: {
                        //                     min: 25,
                        //                     max: null
                        //                 }
                        //             }
                        //         },
                        //         {
                        //         xtype: 'multiselector',
                        //         autoLoad: true,
                        //         width: 370,
                        //         plugins: {
                        //             cellediting: {
                        //                 clicksToEdit: 1
                        //                 // triggerEvent: 'cellfocus'
                        //             }
                        //         },
                        //         viewConfig: {
                        //             markDirty: false
                        //         },
                        //         bind: {
                        //             store: '{planGrid.selection.selsizes}',
                        //             title: Bigmedia.Locales.dlgAutoSelectFaces.multiselectLimitsBySizesTitle + '{planGrid.selection.name}',
                        //             search: {
                        //                 xtype: 'multiselector-search',
                        //                 minWidth: 130,
                        //                 width: 130,
                        //                 height: 200,
                        //                 field: 'name',
                        //                 store: '{planGrid.selection.sizes}'
                        //             }
                        //         },
                        //         columns: [{
                        //             text: Bigmedia.Locales.colSize,
                        //             dataIndex: 'longname',
                        //             menuDisabled: true,
                        //             hideable: false,
                        //             width: 150
                        //         }, {
                        //             text: Bigmedia.Locales.dlgAutoSelectFaces.colLimits,
                        //             dataIndex: 'limit',
                        //             menuDisabled: true,
                        //             hideable: false,
                        //             width: 80,
                        //             editor: {
                        //                 xtype: 'numberfield',
                        //                 minValue: 0
                        //             }
                        //         }, {
                        //             text: '',
                        //             xtype: 'actioncolumn',
                        //             menuDisabled: true,
                        //             hideable: false,
                        //             flex: 1,
                        //             align: 'end',
                        //             // width: 40,
                        //             items: [{
                        //                 iconCls: 'x-fa fa-times',
                        //                 tooltip: Bigmedia.Locales.gridBtnRemoveSidesText,
                        //                 handler: function(grid, rowIndex, colIndex) {
                        //                     var rec = grid.getStore().getAt(rowIndex);
                        //                     grid.getStore().remove(rec);
                        //                     var ms = grid.up('multiselector'),
                        //                     searchGrid = ms.searchPopup.lookup('searchGrid');
                        //                     searchGrid.getSelectionModel().deselect([rec]);
                        //                     // ms.search.deselectRecords([rec]);
                        //                 }
                        //             }]
                        //         }]
                        //     }]
                        // },

                        // {
                        //     xtype: 'numberfield',
                        //     fieldLabel: Bigmedia.Locales.dlgAutoSelectFaces.planBudgetLabel,
                        //     reference: 'fieldbudget',
                        //     bind: {
                        //         value: '{planBudget}'
                        //     },
                        //     step: 1000,
                        //     minValue: 0,
                        //     listeners: {
                        //         change: function (edit) {
                        //             edit.up('wizardpage').setIsCompleted(!!edit.getValue() || !!edit.nextSibling().getValue() || !!edit.nextSibling().nextSibling().getValue());
                        //         }
                        //     }
                        // },
                        // {
                        //     xtype: 'numberfield',
                        //     fieldLabel: Bigmedia.Locales.dlgAutoSelectFaces.planBoardsLabel,
                        //     reference: 'fieldboards',
                        //     bind: {
                        //         value: '{planBoards}'
                        //     },
                        //     step: 1,
                        //     minValue: 0,
                        //     listeners: {
                        //         change: function (edit) {
                        //             edit.up('wizardpage').setIsCompleted(!!edit.getValue() || !!edit.previousSibling().getValue() || !!edit.nextSibling().getValue());
                        //         }
                        //     }
                        // },
                        // {
                        //     xtype: 'numberfield',
                        //     fieldLabel: Bigmedia.Locales.dlgAutoSelectFaces.planCoverageLabel,
                        //     reference: 'fieldcoverage',
                        //     bind: {
                        //         value: '{planCoverage}'
                        //     },
                        //     maxValue: 90,
                        //     minValue: 0,
                        //     step: 1,
                        //     listeners: {
                        //         change: function (edit) {
                        //             edit.up('wizardpage').setIsCompleted(!!edit.getValue() || !!edit.previousSibling().getValue() || !!edit.previousSibling().previousSibling().getValue());
                        //         }
                        //     }
                        // },

                        {
                            xtype: 'fieldcontainer',
                            margin: '20 0 0 0',
                            layout: {
                              type: 'vbox',
                              align: 'center',
                              pack: 'center'
                            },
                            items: [
                              {
                                xtype: 'radiogroup',
                                fieldLabel: Bigmedia.Locales.dlgAutoSelectFaces.rgDiscountTypeLabel,
                                name: 'rb-horiz-1',
                                columns: 2,
                                bind: '{ruleType}',
                                simpleValue: true,
                                items: [
                                    {boxLabel: Bigmedia.Locales.dlgAutoSelectFaces.discountForBigmediaLabel, name: 'rb', inputValue: '1', width: 150},
                                    {boxLabel: Bigmedia.Locales.dlgAutoSelectFaces.flexibleDiscountLabel, name: 'rb', inputValue: '2'}
                                ]
                              },
                              {
                                xtype: 'numberfield',
                                fieldLabel: Bigmedia.Locales.dlgAutoSelectFaces.fixedDiscountLabel,
                                labelWidth: 130,
                                width: 300,
                                min: 0,
                                max: 99,
                                bind: {
                                  hidden: '{ruleType !== "1"}',
                                  value: '{discountSimple}'
                                }
                              },
                              {
                                xtype: 'container',
                                bind: {
                                  hidden: '{ruleType !== "2"}'
                                },
                                layout: {
                                  type: 'hbox',
                                  align: 'middle',
                                  pack: 'center'
                                },
                                items: [{
                                  xtype: 'combo',
                                  flex: 1,
                                  padding: 10,
                                  fieldLabel: Bigmedia.Locales.dlgAutoSelectFaces.selectDiscountGroup,
                                  store: 'RulesGroups',
                                  displayField: 'name',
                                  valueField: 'id',
                                  queryMode: 'local',
                                  bind: {
                                    // store: '{rulesgroups}',
                                    selection: '{theGroup}'
                                  },
                                }, {
                                  xtype: 'button',
                                  text: Bigmedia.Locales.dlgAutoSelectFaces.manageGroups,
                                  handler: function (btn) {
                                      var dlg = Ext.create('Bigmedia.view.dialog.DlgEditRulesGroups', {});
                                      dlg.show();
                                  }
                                }]
                              }
                            ]
                        }
                        // {
                        //     xtype: 'fieldcontainer',
                        //     margin: '20 0 0 0',
                        //     layout: {
                        //         type: 'hbox',
                        //         pack: 'center',
                        //         align: 'middle'
                        //     },
                        //     items: [
                        //         {
                        //             fieldLabel: Bigmedia.Locales.dlgAutoSelectFaces.promoCodeLabel,
                        //             xtype: 'textfield',
                        //             reference: 'promocode',
                        //             maskRe: /[0-9\-a-zA-Z]/,
                        //             maxLength: 15,
                        //             enforceMaxLength: true,
                        //             bind: {
                        //                 value: '{promo.code}'
                        //             },
                        //             listeners: {
                        //                 change: function (input, newVal, oldVal) {
                        //                     var parent = input.up('window'),
                        //                         vm = parent.getViewModel();
                        //                     if (newVal) {
                        //                         var t = newVal.replace(/-/g,'');
                        //                         var a = t.split('').reduce(function(arr,c){
                        //                             if (arr.length > 0) {
                        //                                 if (arr[arr.length-1].length<3) {
                        //                                     arr[arr.length-1] += c;
                        //                                 } else {
                        //                                     arr.push(c);
                        //                                 }
                        //                             } else {
                        //                                 arr.push(c);
                        //                             }
                        //                             return arr;
                        //                         },[]);
                        //                         var v = a.join('-');
                        //                         if (v.length === 3 || v.length === 7 || v.length === 11) {
                        //                             v = v + '-';
                        //                         }
                        //                         input.setValue(v);
                        //                         var promocode = input.getValue();
                        //                         if (promocode.length === 15) {
                        //                             Ext.Ajax.request({
                        //                                 url: '/api/v1/data?promocode=' + promocode,
                        //                                 success: function(response, opts) {
                        //                                     var obj = Ext.decode(response.responseText);
                        //                                     if (obj && obj.length > 0 && obj[0].discount) {
                        //                                         vm.set('promo.discount', obj[0].discount);
                        //                                         vm.set('promo.status', 'smile');
                        //                                         Bigmedia.Vars.setPromocode({code: promocode, discount: obj[0].discount});
                        //                                     }
                        //                                 },
                        //                                 failure: function(response, opts) {
                        //                                     vm.set('promo.discount', null);
                        //                                     vm.set('promo.status', 'meh');
                        //                                     // console.log('server-side failure with status code ' + response.status);
                        //                                 }
                        //                             });
                        //                         } else {
                        //                             vm.set('promo.status','meh');
                        //                             vm.set('promo.discount', null);
                        //                         }
                        //                     } else {
                        //                         vm.set('promo.discount', null);
                        //                         vm.set('promo.status','frown');
                        //                     }
                        //                 }
                        //             }
                        //         },
                        //         {
                        //             xtype: 'button',
                        //             scale: 'large',
                        //             margin: '0 0 0 5',
                        //             reference: 'promoSmile',
                        //             bind: {
                        //                 UI: '{promo.status}',
                        //                 iconCls: 'x-fa fa-{promo.status}-o'
                        //             },
                        //             handler: function (btn) {
                        //                 var userData = { userName: null, userEmail: null, userOrganization: null};
                        //                 if (Bigmedia.Vars.getUser() && Bigmedia.Vars.getUser().get('name') !== 'Anonymous') {
                        //                     userData.userName = Bigmedia.Vars.getUser().get('displayName');
                        //                     userData.userEmail = Bigmedia.Vars.getUser().get('email');
                        //                     userData.userOrganization = Bigmedia.Vars.getUser().get('orgName');
                        //                 }
                        //                 var win = Ext.create('Bigmedia.view.dialog.DlgGiveMePromoCode', {
                        //                     viewModel: {
                        //                         data: userData
                        //                     }
                        //                 });
                        //                 win.show();
                        //             },
                        //             listeners: {
                        //                 afterrender: function (btn) {
                        //                     var win = btn.up('window'),
                        //                         vm = win.getViewModel();
                        //                     var tip = Ext.create('Ext.tip.ToolTip', {
                        //                         target: btn.el,
                        //                         trackMouse: true,
                        //                         renderTo: Ext.getBody(),
                        //                         listeners: {
                        //                             beforeshow: function updateTipBody(tip) {
                        //                                 var status = vm.get('promo.status');
                        //                                 var tipText = Bigmedia.Locales.dlgAutoSelectFaces.smileTipText[status];
                        //                                 tip.update(tipText);
                        //                             }
                        //                         }
                        //                     });
                        //                 }
                        //             }
                        //         }
                        //     ]
                        // }
                    ]
                },
                // {
                //     xtype: 'wizardpage',
                //     title: Bigmedia.Locales.dlgAutoSelectFaces.wpStartTitle,
                //     iconCls: 'x-fa fa-flag',
                //     layout: {
                //         type: 'hbox',
                //         pack: 'center',
                //         align: 'middle'
                //     },
                //     isCompleted: true,
                //     html: '<h3>' + Bigmedia.Locales.dlgAutoSelectFaces.wpStartText + '</h3>',
                //     hideNextButton: true,
                //     items: [
                //         {
                //             xtype: 'button',
                //             scale: 'large',
                //             ui: 'soft-green',
                //             text: Bigmedia.Locales.dlgAutoSelectFaces.btnStartSelectText,
                //             handler: function (btn) {
                //                 btn.up('wizardform').goNext();
                //             }
                //         }
                //     ]
                // },
                {
                    xtype: 'wizardpage',
                    // title: 'Производятся вычисления',
                    // iconCls: 'x-fa fa-flag-checkered',
                    layout: {
                        type: 'vbox',
                        align: 'stretch',
                        pack: 'center'
                    },
                    // height: "100%",
                    hideNavButtons: true,
                    // html: '<h4>' + 'Подбор щитов' + '</h4>',
                    items: [
                        {
                            xtype: 'grid',
                            reference: 'progressGrid',
                            width: '100%',
                            flex: 1,
                            bind: {
                                store: '{planStore}'
                            },
                            viewConfig: {
                                markDirty: false,
                                throttledUpdate: true
                            },
                            columns: [
                                {
                                    text: Bigmedia.Locales.colCity,
                                    dataIndex: 'name',
                                    menuDisabled: true,
                                    sortable: false,
                                    hideable: false,
                                    width: 120
                                },
                                {
                                    text: Bigmedia.Locales.dlgAutoSelectFaces.colProgress,
                                    flex: 1,
                                    xtype    : 'widgetcolumn',
                                    menuDisabled: true,
                                    sortable: false,
                                    hideable: false,
                                    widget: {
                                        bind: '{record.progress}',
                                        xtype: 'progressbarwidget',
                                        textTpl: [
                                            '{percent:number("0")}% done'
                                        ]
                                    }
                                }
                            ]
                        },
                        {
                            xtype: 'progressbar',
                            width: '90%',
                            margin: 20,
                            listeners: {
                                render: function (pbar) {
                                    pbar.wait({interval: 500,
                                        text: Bigmedia.Locales.dlgAutoSelectFaces.planningInProgress
                                    });
                                }
                            }
                        },
                        {
                            xtype: 'container',
                            layout: {
                                type: 'hbox',
                                align: 'middle'
                            },
                            items: [
                                {
                                    xtype: 'container',
                                    flex: 1
                                },
                                {
                                    xtype: 'button',
                                    scale: 'large',
                                    ui: 'soft-red',
                                    text: Bigmedia.Locales.btnCancelText,
                                    handler: function (btn) {
                                        btn.up('window').getController().cancelPlanningClick();
                                    }
                                },
                                {
                                    xtype: 'container',
                                    flex: 1
                                }
                            ]
                        }
                    ],
                    listeners: {
                        show: function (panel) {
                            panel.up('window').getController().onProgressPageShow(panel);
                        }
                    }
                },
                {
                    title: Bigmedia.Locales.dlgAutoSelectFaces.wpResultTitle,
                    iconCls: 'x-fa fa-flag-checkered',
                    reference: 'resultpage',
                    layout: 'fit',
                    bind: {
                        isCompleted: '{finalStore.count > 0}'
                    },
                    hidePrevButton: true,
                    items:[
                        {
                            xtype: 'autoplanresult',
                            reference: 'searchresult',
                            listeners: {
                                goback: function () {
                                    var win = this.up('window');
                                    // win.lookupViewModel().get('finalStore').removeAll();
                                    // win.lookupViewModel().get('planVarStore').removeAll();
                                    // var planStore =  win.lookupViewModel().get('planStore');
                                    // planStore.beginUpdate();
                                    // planStore.each(function (rec) {
                                    //     rec.set('selected', false);
                                    // });
                                    // planStore.endUpdate();
                                    //Client's comments
                                    win.lookup('wizard').goTo(4);
                                }
                            }
                        }
                    ]
                },
                {
                    title: Bigmedia.Locales.dlgAutoSelectFaces.wpCampStat,
                    iconCls: 'x-fa fa-line-chart',
                    reference: 'campstatpage',
                    layout: 'fit',
                    // layout: {
                    //     type: 'vbox',
                    //     align: 'stretch',
                    //     pack: 'center'
                    // },
                    isCompleted: true,
                    items:[
                        {
                            xtype: 'tabpanel',
                            items: [
                                {
                                    title: Bigmedia.Locales.dlgAutoSelectFaces.mediaPlan,
                                    layout: 'fit',
                                    items: [
                                        {
                                            xtype: 'pivot-planvariant',
                                            bind: {
                                                source: '{finalStore}'
                                            }
                                        }
                                    ]
                                },
                                {
                                    title: Bigmedia.Locales.dlgAutoSelectFaces.charts,
                                    layout: 'fit',
                                    items: [
                                        {
                                            xtype: 'campstat',
                                            bind: {
                                                source: '{finalStore}'
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                        // {
                        //     xtype: 'container',
                        //     flex: 1,
                        //     layout: {
                        //         type: 'fit',
                        //     },
                        //     items: [
                        //         {
                        //             xtype: 'campstat',
                        //             height: '100%',
                        //             bind: {
                        //                 source: '{finalStore}'
                        //             }
                        //         }
                        //     ]
                        // },
                        // {
                        //     xtype: 'component',
                        //     reference: 'descrSelectedCampaign',
                        //     bind: {
                        //         html: '{descrSelectedCampaign}'
                        //     }
                        // },
                    ],
                    listeners: {
                        show: function (page) {
                            // var win = page.up('window'),
                            //     vm = win.getViewModel(),
                            //     wizard = page.up('wizardform'),
                            //     searchresult = wizard.lookup('searchresult'),
                            //     resStore = searchresult.getViewModel().get('resStore');
                            // var stat = resStore.getCoverageStat(),
                            //     covOne;
                            // if (stat) {
                            //     covOne = Math.round(stat.covMax * stat.grps * 100 / (stat.covMax + stat.grps)) / 100;
                            // }
                            // var budget = Ext.util.Format.currency(resStore.sum('finalPrice'));
                            // var html = Ext.String.format(Bigmedia.Locales.dlgAutoSelectFaces.descrSelectedCampaignHtml, resStore.getCount(), budget, covOne);
                            // vm.set('descrSelectedCampaign', html);
                        }
                    }
                },
                {
                    title: Bigmedia.Locales.dlgAutoSelectFaces.wpAddToCampaign,
                    iconCls: 'x-fa fa-trophy',
                    reference: 'addtocampaignpage',
                    layout: {
                        type: 'vbox',
                        align: 'middle',
                        pack: 'center'
                    },
                    isCompleted: true,
                    hideNextButton: true,
                    items: [
                        {
                            xtype: 'container',
                            bind: {
                                hidden: '{startFrom === "campaign" && startFromCampaignId}'
                            },
                            reference: 'saveto',
                            title: 'Save to',
                            // title: 'Start from',
                            layout: {
                                type: 'hbox',
                                align: 'stretchmax',
                                pack: 'center'
                            },
                            width: '80%',
                            defaultType: 'fieldset',
                            padding: 10,
                            defaults: {
                                margin: 5,
                                layout: {
                                    type: 'vbox',
                                    align: 'stretch',
                                    pack: 'start'
                                },
                                flex: 1,
                                defaults: {
                                    margin: 5
                                    // ,
                                    // padding: 5
                                }
                            },
                            items: [
                                {
                                    items: [
                                        {
                                            xtype: 'textfield',
                                            // flex: 1,
                                            width: '90%',
                                            reference: 'saveToCampaignName',
                                            bind: {
                                                value: '{saveToNewCampaignName}'
                                            },
                                            emptyText: Bigmedia.Locales.dlgAutoSelectFaces.campaignNameEmptyText
                                        },
                                        {
                                            xtype: 'component',
                                            html: '<center>' + Bigmedia.Locales.dlgAutoSelectFaces.createCampaignDescr + '</center>',
                                            flex: 1
                                        },
                                        {
                                            xtype: 'radiogroup',
                                            bind: '{savepriceoption}',
                                            vertical: true,
                                            simpleValue: true,
                                            items: [
                                                { boxLabel: 'Do not save price', name: 'sp', inputValue: '1', checked: true },
                                                { boxLabel: 'Save using global password', name: 'sp', inputValue: '2', bind: {
                                                    disabled: '{savepriceglobaldisable}'
                                                } },
                                                { boxLabel: 'Input special password', name: 'sp', inputValue: '3' }
                                            ]
                                        },
                                        {
                                            xtype: 'textfield',
                                            bind: {
                                                hidden: '{savepriceoption != "3"}',
                                                value: '{savepricepassword}'
                                            },
                                            width: '100%'
                                        },
                                        {
                                            xtype: 'checkbox',
                                            bind: {
                                                hidden: '{savepriceoption != "3"}',
                                                value: '{savepricepasswordglobal}'
                                            },
                                            fieldLabel: 'Save as global password'
                                        },
                                        {
                                            xtype: 'button',
                                            scale: 'large',
                                            ui: 'soft-green',
                                            width: '90%',
                                            text: Bigmedia.Locales.dlgAutoSelectFaces.createCampaignBtnText,
                                            bind: {
                                                disabled: '{saveToNewCampaignName == "" || (savepriceoption === "3" && !savepricepassword)}'
                                            },
                                            handler: function (btn) {
                                                btn.lookupViewModel().set('saveToNewCampaign', true);
                                                btn.up('window').getController().addSelectedToCampaign();
                                            }
                                        }
                                    ]
                                },
                                {
                                    items: [
                                        {
                                            xtype: 'combo',
                                            bind: {
                                                store: '{campaigns}',
                                                value: '{saveToCampaignId}'
                                            },
                                            // flex: 1,
                                            width: 250,
                                            forceSelection: true,
                                            queryMode: 'local',
                                            valueField: 'id',
                                            reference: 'saveToCampaignCombo',
                                            itemId: 'saveToCampaignCombo',
                                            listConfig: {
                                                minWidth: 150
                                            },
                                            displayField: 'name',
                                            // Template for the dropdown menu.
                                            // Note the use of the "x-list-plain" and "x-boundlist-item" class,
                                            // this is required to make the items selectable.
                                            tpl: Ext.create('Ext.XTemplate',
                                                '<tpl for=".">',
                                                    '<li class="campview-combo-item camp-combo-preview-100 camp-combo-dataitem x-boundlist-item">',
                                                        '<div class="camp-picture "',
                                                            '<tpl if="this.hasSubject(subjectId) == true"> style="background-image: url(/api/v1/subjects/{subjectId}/image.jpeg)"</tpl>>',
                                                            '<div class="camp-combo-info">',
                                                                '<div class="camp-combo-name">{name}</div>',
                                                                '<div class="camp-combo-period">{startDate:date("d.m.Y")}&nbsp;-&nbsp;{endDate:date("d.m.Y")}</div>',
                                                            '</div>',
                                                        '</div>',
                                                    '</li>',
                                                '</tpl>',
                                                {
                                                    hasSubject: function (subjectId) {
                                                        return !!subjectId;
                                                    }
                                                }
                                            ),
                                            // template for the content inside text field
                                            displayTpl: Ext.create('Ext.XTemplate',
                                                '<tpl for=".">',
                                                    '{name} ({startDate:date("d.m.Y")}..{endDate:date("d.m.Y")})',
                                                '</tpl>'
                                            ),
                                            listeners: {
                                                select: function (combo) {
                                                    combo.up('wizardpage').setIsCompleted(true);
                                                }
                                            }
                                        },
                                        {
                                            xtype: 'component',
                                            html: '<center>' + Bigmedia.Locales.dlgAutoSelectFaces.saveToCampaignDescr + '</center>',
                                            flex: 1
                                        },
                                        {
                                            xtype: 'button',
                                            scale: 'large',
                                            ui: 'soft-green',
                                            width: '90%',
                                            text: Bigmedia.Locales.dlgAutoSelectFaces.saveToCampaignBtnText,
                                            bind: {
                                                disabled: '{!saveToCampaignId}'
                                            },
                                            handler: function (btn) {
                                                btn.lookupViewModel().set('saveToCampaign', true);
                                                btn.up('window').getController().addSelectedToCampaign(btn.lookupViewModel().get('saveToCampaignId'));
                                            }
                                        }
                                    ]
                                }
                            ]
                        },{
                            xtype: 'container',
                            bind: {
                                hidden: '{!(startFrom === "campaign" && startFromCampaignId)}'
                            },
                            reference: 'savetostarted',
                            title: 'Save to',
                            // title: 'Start from',
                            layout: {
                                type: 'hbox',
                                align: 'stretchmax',
                                pack: 'center'
                            },
                            width: '80%',
                            defaultType: 'fieldset',
                            padding: 10,
                            defaults: {
                                margin: 5,
                                layout: {
                                    type: 'vbox',
                                    align: 'middle',
                                    pack: 'center'
                                },
                                flex: 1,
                                defaults: {
                                    margin: 5
                                    // ,
                                    // padding: 5
                                }
                            },
                            items: [
                                {
                                    xtype: 'button',
                                    scale: 'large',
                                    ui: 'soft-green',
                                    width: 300,
                                    text: Bigmedia.Locales.dlgAutoSelectFaces.saveToCampaignBtnText,
                                    handler: function (btn) {
                                        btn.lookupViewModel().set('saveToCampaign', true);
                                        btn.lookupViewModel().set('saveToCampaignId', btn.lookupViewModel().get('startFromCampaignId'));
                                        btn.up('window').getController().addSelectedToCampaign(btn.lookupViewModel().get('startFromCampaignId'));
                                    }
                                }
                            ]
                        }
                    ]
                }
            ],
            listeners: {
                curpagechanged: function (prevPageIndex, curPageIndex) {
                    var me = this,
                        vm = me.getViewModel();
                    if (prevPageIndex === 0) {
                        var startFrom = vm.get('startFrom'),
                            startFromBlank = startFrom === 'blank',
                            startFromCart = startFrom === 'cart'
                            startFromCampaign = startFrom === 'campaign';
                        var cities = {};
                        if (startFromCart) {
                            var cartStore = Ext.getStore('ShoppingCart');
                            cartStore.each(function(face){
                                cities[face.get('id_city')] = 1;
                            });
                        } else if (startFromCampaign) {
                            var combo = me.lookup('startFromCampaignCombo');
                            var campaignId = combo.getValue();
                            if (campaignId) {
                                var vm = me.lookupViewModel(true),
                                    campStore = vm.getStore('campaigns');
                                var campaign = campStore.getById(campaignId);
                                var proposals = campaign.proposals();
                                proposals.load({
                                    scope: me,
                                    callback: function(records, operation, success) {
                                        records.forEach(function(proposal){
                                            // console.log(proposal);
                                            var face = Ext.getStore('Faces').getById(proposal.get('faceId'));
                                            if (face) {
                                                cities[face.get('id_city')] = 1;
                                            }
                                        });
                                    }
                                })
                            }
                        }
                    }
                    // var vm = this.up('window').getViewModel();
                    // var store = this.up('window').getViewModel().getStore('srcFaces');
                    // console.log(store.getCount());
                }
            }
        }
    ],
    // onThirdPartyAdd: function (store, records) {
    //     var me = this,
    //         vm = me.getViewModel();
    //     console.log('onThirdPartyAdd: %o', records);
    //     vm.getStore('srcFaces').add(records);
    // },
    // onThirdPartyRemove: function (store, records) {
    //     var me = this,
    //         vm = me.getViewModel();
    //     vm.getStore('srcFaces').remove(records);
    // },
    loadCities: function () {
        var me = this,
            allCities = me.getViewModel().getStore('allCities'),
            citiesStore = Ext.getStore('Cities'),
            cityBoundStore = Ext.getStore('CityBoundaries');
        if (!cityBoundStore.isLoaded()) {
            cityBoundStore.on({
                load: {
                    fn: me.loadCities,
                    scope: me,
                    single: true
                }
            });
            return;
        }
        citiesStore.each(function(rec){
            var cityBound = cityBoundStore.getById(rec.getId());
            if (cityBound && cityBound.get('area')) {
                allCities.add({
                    id: rec.getId(),
                    name: rec.get('name'),
                    area: cityBound ? cityBound.get('area') / 1000000 : null
                });
            }
        });
    },
    discardRemoveBigmedia: function(store, records) {
        // console.log('on remove');
        records.forEach(function(rec){
            if (rec.get('name') === 'BIGMEDIA') {
                store.insert(0, rec);
            }
        });
    },
    discardUpdateBigmedia: function(store, record) {
        // console.log('on update');
        if (record.get('name') === 'BIGMEDIA' && (!record.get('min') || record.get('min') < 25)) {
            record.set('min', 25);
        }
    },
    listeners: {
        hide: function (win) {
            var vm = win.getViewModel();
            vm.getStore('srcFaces').removeListener('datachanged', win.getController().onStoreDataChanged);
            vm.getStore('srcFaces').removeListener('load', win.getController().onStoreLoad);
            var citiesGrid = win.lookup('wizard').lookup('citiesGrid');
            citiesGrid.getSelectionModel().deselectAll();
            // Ext.getStore('ThirdPartyBoards').removeListener('add', this.onThirdPartyAdd);
            // Ext.getStore('ThirdPartyBoards').removeListener('remove', this.onThirdPartyRemove);
        },
        show: function (win) {
            var me = this,
                wizard = win.lookup('wizard');
            var vm = win.getViewModel();
            var facesStore = Ext.getStore('Faces'),
                avFaces = wizard.lookup('foundFaces');
            if (!avFaces) {
                var bbar = wizard.getDockedItems('toolbar[dock="bottom"]')[0];
                bbar.insert(0, Ext.create({xtype: 'displayfield', reference: 'foundFaces', bind: {value: 'Found <b>{availableFaces}</b> boards'}}));
            }
            // too slow
            // facesStore.each(function(rec){
            //     if (!rec.get('cells')) {
            //         rec.set('cells', Bigmedia.Vars.getFaceApproxCells(rec));
            //     }
            // });
            var main = Ext.ComponentQuery.query('mainviewport')[0],
                ra = main.getController().getRestrictedArea();
            vm.setStores({
                srcFaces: {
                    type: 'dimensionstore',
                    model: 'Face',
                    autoLoad: true,
                    dimensions: ['size', 'sidetype'],
                    proxy: {
                        type: 'memory'
                    }
                    // ,
                    // filters: [
                    //     function(item) {
                    //         // console.log(item);
                    //         // return item.get('facesCount') > 0;
                    //         return !item.inCart;
                    //     }
                    // ],
                },
                // cities: {
                //     source: Ext.getStore('Cities')
                // },
                // sizes: {
                //     source: Ext.getStore('Sizes')
                // },
                // sidetypes: {
                //     source: Ext.getStore('Sidetypes')
                // },
                campaigns: {
                    source: ra.getViewModel().getStore('campaigns'),
                    sorters: [{
                        property: 'name',
                        direction: 'ASC'
                    }]
                },
                allCities: new Ext.data.Store({
                    model: 'PlanCity',
                    proxy: 'memory',
                    listeners: {
                        add: function (store, records) {
                            records.forEach(function(rec){
                                rec.selsuppliers().on({
                                    remove: me.discardRemoveBigmedia,
                                    update: me.discardUpdateBigmedia,
                                    scope: me
                                });
                                rec.selsizes().on('datachanged', function(s) {me.getController().updatePlanPageCompleted();}, me.getController());
                                rec.selsizes().setRemoteFilter(false);
                                rec.selsuppliers().setRemoteFilter(false);
                                rec.sizes().setRemoteFilter(false);
                                rec.suppliers().setRemoteFilter(false);
                                rec.selsizes().addFilter({
                                    id: 'notemptyquantity',
                                    property: 'quantity',
                                    operator: '>',
                                    value: 0
                                });
                                rec.selsuppliers().addFilter({
                                    id: 'notemptyquantity',
                                    property: 'quantity',
                                    operator: '>',
                                    value: 0
                                });
                                rec.sizes().addFilter({
                                    id: 'notemptyquantity',
                                    property: 'quantity',
                                    operator: '>',
                                    value: 0
                                });
                                rec.suppliers().addFilter({
                                    id: 'notemptyquantity',
                                    property: 'quantity',
                                    operator: '>',
                                    value: 0
                                });
                            });
                            // console.log();
                        },
                        // update: function (store, record){
                        //     console.log(record);
                        // },
                        datachanged: function (store) {
                        // console.log([store, records]);
                            // store.each(function(rec){
                            //     // console.log('here');
                            //     if (rec.selsizes && !rec.selsizes().hasListener('datachanged')) {
                            //         console.log('add listener on datachanged');
                            //         rec.selsizes().on('datachanged', function(s) {me.getController().updatePlanPageCompleted();}, me.getController());
                            //     }
                            //     if (rec.selsuppliers && !rec.selsuppliers().hasListener('datachanged')) {
                            //         rec.selsuppliers().on('datachanged', function(s) {me.getController().updatePlanPageCompleted();}, me.getController());
                            //     }
                            //     if (rec.selsuppliers && !rec.selsuppliers().hasListener('remove')) {
                            //         console.log('add listener on remove');
                            //         rec.selsuppliers().on('remove', function(store, records) {
                            //             console.log('on remove');
                            //             records.forEach(function(rec){
                            //                 if (rec.get('name') === 'BIGMEDIA') {
                            //                     store.insert(0, rec);
                            //                 }
                            //             });
                            //         }, me);
                            //     }
                            //     if (rec.selsuppliers && !rec.selsuppliers().hasListener('update')) {
                            //         rec.selsuppliers().on('update', function(store, record) {
                            //             if (record.get('name') === 'BIGMEDIA' && (!record.get('min') || record.get('min') < 25)) {
                            //                 record.set('min', 25);
                            //             }
                            //         }, me);
                            //     }
                            // });
                            me.getController().updateAvailableFaces();
                            me.getController().updatePlanPageCompleted();
                        }
                    }
                }),
                cities: {
                    source: '{allCities}',
                    filters: [
                        function(item) {
                            // console.log(item);
                            // return item.get('facesCount') > 0;
                            return item.faces().count() > 0;
                        }
                    ],
                    sorters: [
                        {
                            property: 'population',
                            direction: 'DESC'
                        }
                    ]
                },
                planStore: {
                    source: '{cities}',
                    filters: [
                        function(item) {
                            // console.log(item.selected);
                            return item.get('selected');
                        }
                    ]
                },
                repStore: {
                    model: 'Face',
                    autoLoad: true,
                    proxy: {
                        type: 'memory'
                    }
                }
                // ,
                // plannerSource: {
                //     source: '{srcFaces}',
                //     filters: [
                //         function(item) {
                //             // console.log(item.selected);
                //             return (vm.getStore('planStore').count() === 0) || !!vm.getStore('planStore').getById(item.get('id_city'));
                //         }
                //     ]
                // }
            });
            var toAdd = [];
            Ext.getStore('Faces').each(function(item){
                if ((item.get('price') > 0) && !!item.get('lon') && !!item.get('lat')) {
                    var rec = item.copy();
                    rec.set('inCart', false);
                    toAdd.push(rec);
                }
            });
            vm.getStore('srcFaces').add(toAdd);
            this.loadCities();
            if (vm.get('thirdpartySource')) {
                Ext.getStore('ThirdPartyBoards').each(function(item){
                    if (!!item.get('lon') && !!item.get('lat')){
                        var rec = item.copy();
                        rec.set('inCart', false);
                        vm.getStore('srcFaces').add(rec);
                    }
                });
            }
            // Ext.getStore('ThirdPartyBoards').addListener('add', win.onThirdPartyAdd, win);
            // Ext.getStore('ThirdPartyBoards').addListener('remove', win.onThirdPartyRemove, win);
            vm.getStore('srcFaces').addListener('datachanged', win.getController().onStoreDataChanged, win.getController());
            vm.getStore('srcFaces').addListener('load', win.getController().onStoreLoad, win.getController());
            var periodform = win.lookup('wizard').lookup('period').child('form(true)');
            if (wizard.getActiveIndex() === 0) {
                wizard.getActivePage().fireEventArgs('show', [wizard.getActivePage()]);
            }
            wizard.goTo(0);

            periodform.checkChange();
            // win.resMaxCov.removeAll();
            // win.resMinBudget.removeAll()
            // win.resOptimum.removeAll();
            // var resPage = win.lookup('resultpage');
            // console.log(resPage);
            // if (resPage) {
                // var searchRes = win.down('simpleresearchresult');
                // if (searchRes) {
                //     searchRes.safeClean();
                //     searchRes.lookup('minBudgetBtn').setPressed(true);
                //     searchRes.getViewModel().set('resStore', me.getStoreMinBudget());
                //     searchRes.lookup('resultTabPanel').setActiveItem(0);
                //     // searchRes.lookup('minBudgetBtn').setPressed(true);
                //     // searchRes.getViewModel().set('resStore', win.resMinBudget);
                //     // searchRes.lookup('resultTabPanel').setActiveItem(0);
                // }
            // }
            win.getController().onUpdatePeriod();
            if (Bigmedia.Vars.getSalt()) {
                me.getViewModel().set('savepriceoption', '2');
                me.getViewModel().set('savepriceglobaldisable', false);
                me.getViewModel().set('savepricepasswordglobal', false);
            } else {
                me.getViewModel().set('savepricepasswordglobal', true);
                me.getViewModel().set('savepriceglobaldisable', true);
            }
            me.getViewModel().set({
                savepricepassword: '',
                saveToCampaignName: ''
            });
            //Google Analytics
            // console.log('send event Start Planner');
            // gtag('event', 'show_planner', {
            //     'event_category': 'PLANNER',
            //     'event_label': 'show planner'
            // });
        }
    }
    // ,
    // initComponent: function () {
    //     var me = this;
    //     me.callParent();
    //     var periodform = me.lookupReference('periodform');
    //     periodform.checkValidity();
    // }
});
