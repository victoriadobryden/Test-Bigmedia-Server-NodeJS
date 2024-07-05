Ext.define('Bigmedia.view.campaign.CampCardController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.campaign-campcard',

    requires: [
        'Bigmedia.view.det.DetPoster',
        'Ext.menu.Menu',
        'Bigmedia.model.Poster',
        'Ext.window.MessageBox',
        'Bigmedia.view.det.DetPublishedCampaign',
        'Bigmedia.view.dialog.DlgPosterTask',
        'Bigmedia.view.dialog.DlgImportPrices'
    ],
    init: function (view) {
        var me = this,
            // mapView = me.lookupReference('campMap'),
            // grid = me.lookupReference('campProposals'),
            gridPhotos = me.lookupReference('gridPhotos');

        // mapView.getMap().setGrid(grid);

        me.callParent();

        var user = Bigmedia.Vars.getUser(),
            infoform = me.lookupReference('infoform'),
            manStore = Ext.create('Ext.data.Store', {
                fields: ['id', 'name'],
                data : user.get('org').managers.map(function(man){ return {id: man.id, name: man.firstName + ' ' + man.lastName}})
            });
        // console.log(user);
        if (manStore.getCount() > 1) {
            infoform.add(Ext.create('Ext.form.field.ComboBox', {
                reference: 'managers',
                queryMode: 'local',
                displayField: 'name',
                valueField: 'id',
                fieldLabel: 'Manager',
                bind: {
                    value: '{curCamp.managerId}'
                },
                store: manStore
            }));
        } else if (manStore.getCount() === 1 && manStore.getAt(0).getId() !== 911) {
            infoform.add(Ext.create('Ext.form.field.Text',{
                readOnly: true,
                fieldLabel: 'Manager',
                value: manStore.getAt(0).get('name')
            }));
        }

        var ra = Ext.ComponentQuery.query('restrictedarea')[0];

        ra.getViewModel().bind({
            bindTo: '{curCamp}'
            // ,
            // deep: true
        }, function(v) {
            me.updateCurrentCampaign(v);
        });

        // ra.getViewModel().bind({
        //     bindTo: '{pubCamp}'
        //     // ,
        //     // deep: true
        // }, function(v) {
        //     me.updatePublishedCampaign(v);
        // });

    },

    addPosterTask: function (btn) {
        var me = this,
            mainView = me.getView().up('mainviewport'),
            win = mainView.lookupReference('dlgPosterTask');
        if (!win) {
            win = new Bigmedia.view.dialog.DlgPosterTask({
                reference: 'dlgPosterTask'
            });
            mainView.add(win);
        } else {
        }
        win.getViewModel().set('curCamp', me.getViewModel().get('curCamp'));
        win.getViewModel().set('grid', me.lookup('campProposals'));
        win.show();
    },

    exportCampServicesToExcel: function (btn) {
        Ext.MessageBox.show({
            msg: Bigmedia.Locales.exportExcelSavingData,
            progressText: Bigmedia.Locales.exportExcelProgressText,
            width: 300,
            wait: {
                interval: 200
            },
            animateTarget: btn
        });

        var me = this;

        me.timer = Ext.defer(function () {
            //This simulates a long-running operation like a database save or XHR call.
            //In real code, this would be in a callback function.
            var campaignId = me.getViewModel().get('curCamp').get('id')
            Bigmedia.GridExport.exportToExcel(me.lookup('campServices'), 'bigmedia_campaign_' + campaignId + '_services.xlsx', function () {
                //Ext.MessageBox.hide();
                //me.showToast('Your fake data was saved!', 'Done');
            });

            me.timer = null;
            Ext.MessageBox.hide();
            me.showToast(Bigmedia.Locales.exportExcelFileSaved, Bigmedia.Locales.exportExcelDone);
        }, 3000);

    },

    showToast: function (s, title) {
        Ext.toast({
            html: s,
            //title: title,
            closable: false,
            align: 't',
            slideInDuration: 400,
            minWidth: 400
        });
    },

    fillMonthlyExportMenu: function (btn) {
        var store = btn.up('grid').getStore(),
            ctrlr = btn.up('campcard').getController();
        var months = {};
        store.each(function(rec){
            if (rec.get('photoRecs') && rec.get('photoRecs').length > 0) {
                var dl = rec.get('deadline'),
                mi = Ext.Date.format(dl,'Y\\-m');
                if (!months[mi]) {
                    months[mi] = {name: Ext.Date.format(dl, 'F\\\'y'), year: dl.getFullYear(), month: dl.getMonth(),
                        count: 1, days: {}};
                    months[mi].days[dl.getDate()] = {name: Ext.Date.format(dl, 'd\\.m\\.Y'), count: 1};
                } else {
                    months[mi].count++;
                    if (months[mi].days[dl.getDate()]) {
                        months[mi].days[dl.getDate()].count++;
                    } else {
                        months[mi].days[dl.getDate()] = {name: Ext.Date.format(dl, 'd\\.m\\.Y'), count: 1};
                    }
                }
            }
        });
        var items = Object.keys(months).sort().reverse().map(function(m){
            var month = months[m],
                days = Object.keys(month.days).sort(function(a,b){ return a > b ? 1 : a < b ? -1 : 0;}).map(function(d){
                    return {text: month.days[d].name + ' (' + month.days[d].count + ')', day: d};
                });
            return {
                text: months[m].name + ' (' + months[m].count + ')',
                menu: new Ext.menu.Menu({
                    items: days.length > 1 ? new Array({text: 'All'}).concat(days) : days,
                    year: months[m].year,
                    month: months[m].month,
                    plain: true,
                    listeners: {
                        click: function (menu, item) {
                            if (item) {
                                ctrlr.exportToArchive(menu.year + '/' + (menu.month + 1).toString() + (item.day ? '/' + item.day : '') );
                            }
                        }
                    }

                })
            };
        });
        var menu = new Ext.menu.Menu({
            items: items,
            plain: true
            // ,
            // listeners: {
            //     click: function (menu, item) {
            //         if (item) {
            //             ctrlr.exportToArchive(item.year + '/' + (item.month + 1).toString());
            //         }
            //     }
            // }
        });
        // console.log(menu);
        btn.setMenu(menu);
        btn.showMenu();
    },

    transliterateFileName: function (str) {
        var a = {"Ё":"YO","Й":"I","Ц":"TS","У":"U","К":"K","Е":"E","Н":"N","Г":"G","Ш":"SH","Щ":"SCH","З":"Z","Х":"H","Ъ":"'","ё":"yo","й":"i","ц":"ts","у":"u","к":"k","е":"e","н":"n","г":"g","ш":"sh","щ":"sch","з":"z","х":"h","ъ":"'","Ф":"F","Ы":"I","В":"V","А":"a","П":"P","Р":"R","О":"O","Л":"L","Д":"D","Ж":"ZH","Э":"E","ф":"f","ы":"i","в":"v","а":"a","п":"p","р":"r","о":"o","л":"l","д":"d","ж":"zh","э":"e","Я":"Ya","Ч":"CH","С":"S","М":"M","И":"I","Т":"T","Ь":"'","Б":"B","Ю":"YU","я":"ya","ч":"ch","с":"s","м":"m","и":"i","т":"t","ь":"'","б":"b","ю":"yu","Ї":"YI","ї":"yi","Є":"YE","є":"ye","І":"I","і":"i"};

        function transliterateWord(word){
          return word.split('').map(function(ch) {
            return a[ch] || ch;
          }).join("");
        }

        return str.split(' ').map(function(word) {
            return transliterateWord(word);
        }).join('_');
    },

    cleanFileName: function (fn) {
        return fn.replace(/[\*\|\\\:\"<>\?\/]/g,'');
    },

    paintQrCode: function (text) {
        var img = this.lookup('qrcode');
        var opts = {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            rendererOpts: {
                quality: 0.3
            }
        };
        qrcodelib.toDataURL(text, opts, function (err, url) {
            if (err) throw err;
            img.setSrc(url);
        });
    },

    openPresentationClick: function (btn) {
        var me = this,
            urlField = me.lookup('publishedcampaignurl'),
            url = urlField.getValue();
        window.open(url + '&preview=true', '_blank');
    },

    sendInvitation: function (email) {
        var me = this,
            view = me.getView(),
            curCamp = me.getViewModel().get('curCamp'),
            pubCamp = view.getPublishedCampaign();
        if (pubCamp) {
            var store = new Ext.data.Store({
                fields: [
                    { name: 'id', type: 'int'},
                    { name: 'email', type: 'string'}
                ],
                proxy: {
                    type: 'rest',
                    url: '/api/v1/campaigns/' + curCamp.getId() + '/published/' + pubCamp.getId() + '/presenterInvitations'
                },
                autoSync: true,
                listeners: {
                    write: function (store) {
                        me.showToast(Bigmedia.Locales.campCardPresentationInvitationSentTitle, Bigmedia.Locales.campCardPresentationInvitationSentText);
                    }
                }
            });
            store.add({email: email});
        }
    },

    showEmailPrompt: function (email) {
        var me = this;
        Ext.Msg.prompt('Email', 'Please enter client email:', function(btn, text){
            if (btn == 'ok'){
                if (!Ext.form.field.VTypes.email(text)) {
                    Ext.Msg.show({
                        title: 'Error',
                        message: 'Entered email address is invalid. Do you want to try one more time?',
                        buttons: Ext.Msg.YESNOCANCEL,
                        icon: Ext.Msg.ERROR,
                        fn: function(btn) {
                            if (btn === 'yes') {
                                me.showEmailPrompt(email);
                            }
                        },
                        scope: me
                    });
                } else {
                    me.sendInvitation(text);
                }
            }
        }, me, false, email);
    },

    sendInvitationClick: function (btn) {
        var me = this,
            view = me.getView(),
            curCamp = me.getViewModel().get('curCamp'),
            pubCamp = view.getPublishedCampaign(),
            campView = view.up('campview');
        if (pubCamp && pubCamp.get('closed') && campView.publishedCamps) {
            Ext.Msg.show({
                title: Bigmedia.Locales.campCardPresentationInviteOpenAccessConfirmTitle,
                message: Bigmedia.Locales.campCardPresentationInviteOpenAccessConfirmText,
                buttons: Ext.Msg.YESNOCANCEL,
                icon: Ext.Msg.QUESTION,
                fn: function(btn) {
                    if (btn === 'yes') {
                        pubCamp.set('closed', 0);
                        // me.publishedCamps.remove(curPublishedCamp);
                        campView.publishedCamps.sync({
                            success: function() {
                                me.showEmailPrompt('');
                            }
                        });
                    }
                }
            });
        } else {
            me.showEmailPrompt('');
        }
    },

    editPresentationClick: function (btn) {
        var me = this;
        me.showDetPublished(me.getView().getPublishedCampaign());
    },

    updateCurrentCampaign: function (v) {
        var me = this,
            view = me.getView();
    },

    updatePublishedCampaign: function (newVal, oldVal) {
        var me = this;
        me.initPublishedCampTab(newVal);
    },

    initPublishedCampTab: function (publishedCamp) {
        var view = this.getView(),
            card = view.lookup('presentationCard'),
            urlField = view.lookup('publishedcampaignurl');
        if (publishedCamp) {
            url = Bigmedia.Vars.getPublishedUrl() + publishedCamp.getId(),
            urlField.setValue(url);
            this.paintQrCode(url);
            card.setActiveItem(1);
        } else {
            card.setActiveItem(0);
        }
    },

    showDetPoster: function (thePoster) {
        var mainView = this.getView().up('mainviewport'),
            win = mainView.lookupReference('detPoster');
        if (!win) {
            win = new Bigmedia.view.det.DetPoster({
                reference: 'detPoster',
                viewModel: {
                    data: {
                        thePoster: thePoster
                    }
                }
            });

            // A Window is a floating component, so by default it is not connected
            // to our main View in any way. By adding it, we are creating this link
            // and allow the window to be controlled by the main ViewController,
            // as well as be destroyed automatically along with the main View.
            // this.getView().add(win);
            mainView.add(win);
        } else {
            win.getViewModel().set('thePoster', thePoster);
        }
        win.show();
    },

    // onDetPublishedSave: function (thePublished) {
    //     var me = this;
    //     me.up('campview').setPublishedCampaign(thePublished);
    //     // me.lookupViewModel().set('pubCamp', thePublished);
    //     // this.getView().setPublishedCampaign(thePublished);
    // },

    showDetPublished: function (thePublished) {
        var me = this,
            mainView = me.getView().up('mainviewport'),
            win = mainView.lookupReference('detPublished'),
            campView = me.getView().up('campview');
        if (!win) {
            win = new Bigmedia.view.det.DetPublishedCampaign({
                reference: 'detPublished',
                store: campView.publishedCamps,
                viewModel: {
                    data: {
                        thePublished: thePublished
                    }
                }
            });
            win.on({
                save: campView.setPublishedCampaign,
                // save: me.onDetPublishedSave,
            //     hide: me.initPublishedCampTab,
            //     close: me.initPublishedCampTab,
                scope: campView
            });
            mainView.add(win);
        } else {
            win.setStore(campView.publishedCamps);
            win.getViewModel().set('thePublished', thePublished);
        }
        win.show();
    },

    closePresentationClick: function (btn) {
        var me = this,
            view = me.getView(),
            curPublishedCamp = view.getPublishedCampaign(),
            campView = view.up('campview');
        if (curPublishedCamp && campView.publishedCamps) {
            Ext.Msg.show({
                title: Bigmedia.Locales.campCardPresentationCloseConfirmTitle,
                message: Bigmedia.Locales.campCardPresentationCloseConfirmText,
                buttons: Ext.Msg.YESNOCANCEL,
                icon: Ext.Msg.QUESTION,
                fn: function(btn) {
                    if (btn === 'yes') {
                        curPublishedCamp.set('closed', 1);
                        // me.publishedCamps.remove(curPublishedCamp);
                        campView.publishedCamps.sync({
                            success: function() {
                                me.showToast(Bigmedia.Locales.campCardPresentationCloseToastTitle, Bigmedia.Locales.campCardPresentationCloseToastText);
                                // view.setPublishedCampaign(null);
                            }
                        });
                    }
                }
            });
        }
    },

    openAccessPresentationClick: function (btn) {
        var me = this,
            view = me.getView(),
            curPublishedCamp = view.getPublishedCampaign(),
            campView = view.up('campview');
        if (curPublishedCamp && campView.publishedCamps) {
            Ext.Msg.show({
                title: Bigmedia.Locales.campCardPresentationOpenAccessConfirmTitle,
                message: Bigmedia.Locales.campCardPresentationOpenAccessConfirmText,
                buttons: Ext.Msg.YESNOCANCEL,
                icon: Ext.Msg.QUESTION,
                fn: function(btn) {
                    if (btn === 'yes') {
                        curPublishedCamp.set('closed', 0);
                        // me.publishedCamps.remove(curPublishedCamp);
                        campView.publishedCamps.sync({
                            success: function() {
                                me.showToast(Bigmedia.Locales.campCardPresentationOpenAccessToastTitle, Bigmedia.Locales.campCardPresentationOpenAccessToastText);
                                // view.setPublishedCampaign(null);
                            }
                        });
                    }
                }
            });
        }
    },

    editPosterClick: function (grid, thePoster) {
        this.showDetPoster(thePoster);
    },

    addPosterClick: function (btn) {
        // var store = this.getViewModel().get('curCamp.posters'),
        var newPoster = new Bigmedia.model.Poster({
            campaignId: this.getViewModel().get('curCamp').get('id'),
            ownerId: Bigmedia.Vars.getUser().get('id')
        });
        this.showDetPoster(newPoster);
    },

    addPublishedClick: function (btn) {
        // var store = this.getViewModel().get('curCamp.posters'),
        var camp = this.getViewModel().get('curCamp'),
            user = Bigmedia.Vars.getUser();
        var newPublished = new Bigmedia.model.Published({
            campaignId: camp.get('id'),
            name: camp.get('name'),
            startDate: camp.get('startDate'),
            endDate: camp.get('endDate'),
            email: user.get('email'),
            ownerId: user.get('id')
        });
        this.showDetPublished(newPublished);
    },

    exportToArchive: function (month) {
        var me = this,
            grid = me.lookupReference('gridPhotos'),
            selected = grid.getSelection(),
            curCamp = me.getViewModel().get('curCamp'),
            now = new Date(),
            url = '/api/v1/campaigns/' + curCamp.get('id') + '/photorecs/',
            fileName = 'photos_' +
                // me.transliterateFileName(curCamp.get('name')) + '_' +
                encodeURIComponent(me.cleanFileName(curCamp.get('name'))) + '_' +
                // Ext.Date.format(now,'ymdHis') +
                (month ? month.replace(/\//g,'-') : 'all') +
                '.zip',
            monthly = month ? month + '/' : '';
                //template={city}/{sideNumber}{photoType}.jpg&
                // params = '?ids=';
            //campaigns/:id/photorecs/monthly/:year/:month/:filename.zip
        if (grid.getStore().getTotalCount() > 0) {
            window.open(url + monthly + fileName,'_blank');
            //Google Analytics
            // console.log('send event POI');
            // gtag('event', 'download_photos', {
                // 'event_category': 'photorep',
                // 'event_label': 'downloaded',
                // 'value': url + monthly + fileName
            // });
        }
    }

});
