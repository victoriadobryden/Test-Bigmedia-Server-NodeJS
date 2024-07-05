Ext.define('Bigmedia.model.User', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'id', type: 'string', defaultValue: 'anonymous' },
        { name: 'login'},
        { name: 'name', type: 'string', defaultValue: 'Anonymous'},
        { name: 'firstName', type: 'string' },
        { name: 'lastName', type: 'string' },
        { name: 'showPlanner',
            calculate: function (data) {
                if (data.org) {
                    return data.org.showPlanner;
                }
                return false;
            }
        },
        // {
        //     name: 'pictureUrl',
        //     calculate: function (data) {
        //         return data.userPicture ? data.userPicture : 'resources/images/anonymous.png';
        //     }
        // },
        { name: 'userPicture', type: 'string' },
        { name: 'accessToken', type: 'string' },
        {
            name: 'displayName',
            calculate: function (data) {
                var fullName = data.name ? data.name : (data.firstName?data.firstName:'') + (data.lastName?((data.firstName?' ':'') + data.lastName):'');
                return fullName;
            }
        },
        { name: 'email', type: 'string' },
        { name: 'address', type: 'string' },
        { name: 'loggedIn', type: 'date'},
        { name: 'regDate', type: 'date'},
        { name: 'providerId', type: 'int' },
        { name: 'actions' },
        { name: 'orgId', type: 'int' },
        { name: 'org' },
        { name: 'clientType',
            calculate: function (data) {
              if (data.org) {
                  return data.org.clientType;
              }
            }
        },
        { name: 'orgName',
            calculate: function (data) {
                if (data.org) {
                    return data.org.name;
                }
            }
        },
        { name: 'cityId', type: 'int' },
        { name: 'cityName',
            calculate: function (data) {
                if (data.cityId) {
                    var store = Ext.getStore('Cities');
                    return store.getById(data.cityId).get('name');
                }
            }
        },
        { name: 'hasFacebookAccount', defaultValue: false },
        {
            name: 'isManager',
            calculate: function (data) {
                var orgs = [3427,1641,9447,4786,4787,2181,1,2911,5382,1065,12713,10522,11728];
                return data.org && data.orgId && orgs.indexOf(+data.orgId) >= 0;
            }
        },
        {
            name: 'defaultManagerId',
            calculate: function (data) {
                if (data.isManager) {
                    return data.id;
                } else {
                    if (data.org && data.org.managers && data.org.managers.length>0) {
                        return data.org.managers[0].id;
                    } else {
                        return 911; // regname=virtual
                    }
                }
            }
        }, {
            name: 'hasLocalAccount',
            calculate: function (data) {
                return (data.login && data.login !== '');
            }
        }, {
            name: 'isRegistered',
            calculate: function (data) {
                return (data.id !== 'anonymous');
            }
        }, {
            name: 'showHeatmap',
            calculate: function (data) {
                // let TrialDateEnd = new Date(2023,7,7),
                //     // agensyDateEnd = new Date(2023,11,31), //(Year  month (0-11)  day)
                //     agensyDateEnd = new Date(2024,0,31),
                //     CurDate = new Date(),
                //     orgs = [3427,1641,9447,4786,4787,2181,1,2911,5382,1065,12713,10522,11728],
                //     agensy = [5146,3216,994,3,18045,1205,3776,2412,29850,29165,29978];// 29165 Octagon ,29978 Promodo
                //     // agensy = [ 3,18045,1205,3776,2412 ];
                //     console.log(data);
                //     heatmapShow = (data.org && data.orgId && 
                //         (orgs.indexOf(+data.orgId) >= 0 || 
                //         // ( CurDate < TrialDateEnd ) ||
                //         // ( CurDate < agensyDateEnd  && agensy.indexOf(+data.orgId) >= 0 )
                //         agensy.indexOf(+data.orgId) >= 0
                //         )
                //     )

                
                // return  heatmapShow; 
                // (data.org && data.orgId && 
                    // (((orgs.indexOf(+data.orgId) >= 0 || (agensy.indexOf(+data.orgId) >= 0 && CurDate < agensyDateEnd ))|| ( CurDate < TrialDateEnd )))
                // );
                if (data.org) {
                    return data.org.showHeatmap;
                }
                return false;
            }
        }, {
            name: 'showMonitoring',
            calculate: function (data) {
                let 
                    // TrialDateEnd = new Date(2023,7,7),
                    // agensyDateEnd = new Date(2023,11,31), //(Year  month (0-11)  day)
                    // agensyDateEnd = new Date(2024,0,31),
                    // CurDate = new Date(),
                   orgs = [3427,1641,9447,4786,4787,2181,1,2911,5382,1065,12713,10522,11728],
                   monitoringShow = (data.org && data.orgId &&  (orgs.indexOf(+data.orgId) >= 0 )) ? 1 : 0 ;
                return monitoringShow;
            }
        }
    ],

    isRegistered: function () {
      return this.getId() !== 'anonymous';
    },

    constructor: function (config, providerId) {
        if (config) {
            var userConfig = {};
            if (config.id !== 'anonymous') {
                var store = Ext.util.LocalStorage.get('user' + config.id);
                if (!providerId) {
                    providerId = +store.getItem('providerId');
                }
                //  else {
                //     store.setItem('providerId', providerId);
                // }
                // store.release();
                if (providerId === 1 && config.tokens && config.tokens.length > 0) { //facebook
                    var tokens = config.tokens;
                    if (tokens && tokens.length > 0) {
                        for (var i = 0; i < tokens.length; i++) {
                            if (tokens[i].providerId == providerId) {
                                break;
                            }
                        }
                        if (i < tokens.length){
                            userConfig = {
                                name:       config.tokens[i].displayName,
                                email:      config.tokens[i].email,
                                pictureUrl: config.tokens[i].pictureUrl,
                                profileId:  config.tokens[i].profileId,
                                token:      config.tokens[i].token
                            }
                            providerId = 1;
                        }
                    }
                } else { //local
                    userConfig = {
                        name: config.name,
                        email: (config.emails && config.emails.length > 0) ? config.emails[0].email : ''
                    };
                    providerId = 2;
                }
                var store = Ext.util.LocalStorage.get('user' + config.id);
                if (providerId) {
                    store.setItem('providerId', providerId);
                }
                store.release();
                userConfig.hasFacebookAccount = config.tokens && config.tokens.some(function(token){ return token.providerId === 1;});
                userConfig.id = config.id;
                userConfig.orgId = config.orgId;
                userConfig.providerId = providerId;
                userConfig.origConfig = config;
                userConfig.actions = config.actions;
                userConfig.org = config.org;
                userConfig.login = config.login;
                userConfig.regDate = config.regDate;
                userConfig.firstName = config.firstName;
                userConfig.lastName = config.lastName;
                userConfig.address = config.address;
                if(config.org && config.org.showPlanner) {
                    userConfig.actions['showPlanner'] = 'showPlanner';
                }

                if (!userConfig.pictureUrl) {
                    if (userConfig.email) {
                        var hashedEmail = md5(userConfig.email.trim().toLowerCase());
                        userConfig.pictureUrl = 'https://www.gravatar.com/avatar/'+hashedEmail+'?d=identicon';
                    } else {
                        userConfig.pictureUrl = 'resources/images/anonymous.png';
                    }
                }
            } else {
                userConfig = {
                    id: 'anonymous',
                    name: 'Anonymous',
                    pictureUrl: 'resources/images/anonymous.png'
                };
            }
            // console.log(userConfig);
            this.callParent([userConfig]);
        } else {
            this.callParent([]);
        }
    },

    // getStoredProvider: function () {
    //     var store = Ext.util.LocalStorage.get('user' + this.get('id'));
    //     provider = store.getItem('provider');
    //     store.release();
    //     return provider;
    // },
    //
    // initFields: function () {
    //     var me = this,
    //         provider = me.get('provider');
    //     if (!provider) {
    //         if (me.get('id') !== 'anonymous') {
    //             var store = Ext.util.LocalStorage.get('user' + me.get('id'));
    //             provider = store.getItem('provider');
    //             store.release();
    //             // console.log('Provider: ' + provider);
    //         }
    //     }
    //     if (provider && provider !== 2 && me.get('tokens')) {
    //         var i;
    //         for(i = 0; i < me.get('tokens').length; i++) {
    //             if (me.get('tokens')[i].providerId === +provider) {
    //                 break;
    //             }
    //         }
    //         if (i < me.get('tokens').length) {
    //             me.set({
    //                 name: me.get('tokens')[i].displayName,
    //                 email: me.get('tokens')[i].email,
    //                 userPicture: me.get('tokens')[i].pictureUrl
    //             });
    //         }
    //     }
    //     if (provider && provider == 2 && me.get('emails') && me.get('emails').length > 0) {
    //         me.set('email', me.get('emails')[0].email);
    //     }
    //     if (!me.get('userPicture') && me.get('email')) {
    //         //gravatar
    //         var email = me.get('email'),
    //             email = email.trim(),
    //             email = email.toLowerCase(),
    //             hashedEmail = md5(email);
    //         console.log(hashedEmail);
    //         me.set('userPicture','https://www.gravatar.com/avatar/'+hashedEmail+'?d=identicon')
    //     }
    // },

    proxy: {
        type: 'rest',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: '/api/v1/auth/user',
        appendId: false
        // ,
        // reader: {
        //     type: 'json'
        // }
    }
});

Ext.define('Bigmedia.model.Org', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'id', type: 'int'},
        { name: 'logoBlob'}
    ],
    proxy: {
        type: 'rest',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: '/api/v1/orgs',
        writer: {
            writeAllFields: true
        }
    }
});

// Ext.define('Bigmedia.proxy.UserProxy', {
//     extend: 'Ext.data.proxy.Rest',
//     alias: 'proxy.userproxy',
//
//     buildUrl: function(request) {
//         var me        = this,
//             operation = request.getOperation(),
//             records   = operation.getRecords(),
//             record    = records ? records[0] : null,
//             format    = me.getFormat(),
//             url       = me.getUrl(request),
//             params = request.getParams(),
//             id;
//
//         if (record && !record.phantom) {
//             id = record.getId();
//         } else {
//             id = operation.getId();
//         }
//
//         // console.log('url before: ' + url);
//         // console.log(me);
//         // console.log(request);
//
//         // if (me.getAppendId() && me.isValidId(id)) {
//         //     if (!url.match(me.slashRe)) {
//         //         url += '/';
//         //     }
//         //
//         //     url += encodeURIComponent(id);
//         //     if (params) {
//         //         delete params[me.getIdParam()];
//         //     }
//         // }
//         // console.log('url after: ' + url);
//
//         if (format) {
//             if (!url.match(me.periodRe)) {
//                 url += '.';
//             }
//
//             url += format;
//         }
//
//         if (!record) {
//             var filters = params.filter;
//             if (filters) {
//                 filters = Ext.decode(filters);
//                 id = filters[0].value;
//                 var addSlash = (url.charAt() !== '/')?'/':'';
//                 url = '/api/v1/user/' + encodeURIComponent(id) + addSlash + url;
//                 delete params['filter'];
//                 // params.filter = '';
//             }
//         } else {
//             url = '/api/v1/' + url;
//         }
//
//         // console.log('url in request: ' + url);
//
//         request.setUrl(url);
//
//         // console.log('url in the end: ' + url);
//         // console.log('filter: %o', params.filter);
//
//         return me.callParent([request]);
//     }
// });
//
// Ext.define('Bigmedia.model.UserBase', {
//     extend: 'Ext.data.Model',
//     idProperty: 'id',
//     fields: [
//         { name: 'id' },
//         { name: 'userId',
//             reference: {
//                 parent: 'User'
//             },
//             allowBlank: false
//         }
//     ],
//     proxy: 'userproxy'
// });
//
// Ext.define('Bigmedia.model.Logo', {
//     extend: 'Bigmedia.model.UserBase',
//
//     fields: [
//         { name: 'logo'}
//     ],
//     proxy: {
//         type: 'userproxy',
//         limitParam: null,
//         pageParam: '',
//         startParam: '',
//         url: 'logo'
//     }
// });
