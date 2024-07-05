Ext.define("Bigmedia.Vars", {
    mixins: ['Ext.mixin.Observable'],

    required: [
        'Bigmedia.model.User',
        'Bigmedia.view.user.UserContainerWrap',
        'Bigmedia.view.dialog.DlgPriceEncryption'
    ],

    RANDOM_HASH: 'HRtuEoJfSu5pMLVZNQVo5CLPUHBdyTGnEPPynviX',

    config: {
        user: null,
        curCamp: null,
        publishedUrl: 'http://probillboard.com/Presenter/?uuid=',
        promocode: null,
        defaultRulesGroup: null,
        currentRulesGroup: null,
        showKSHitmap: false
    },

    singleton: true,

    coverageDays: [1, 3, 7, 15, 30],

    jsonReader: new jsts.io.GeoJSONReader(),
    jsonWriter: new jsts.io.GeoJSONWriter(),
    olFormat: new ol.format.GeoJSON(),

    cacheOccupancies: {},

    processObject: function (src, func) {
      const isObject = val =>
        val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date);
      const process = (obj) => {
        var res = {};
        Object.entries(obj).forEach(function(entry){
          var k = entry[0],
            v = entry[1];
          res[k] = isObject(v) ? process(v) : func(v);
        });
        return res;
      }
      return process(src || {});
    },

    readFeatureGeometry: function (s) {
      try {
        var me = this,
        json = JSON.parse(s);
        if (json.type === 'Circle') {
          return new ol.geom.Circle(json.center, json.radius);
        } else {
          return me.olFormat.readGeometry(s);
        }
      } catch (e) {
        console.log('error readingFeatureGeometry');
        console.log(e);
      }
    },

    writeFeatureGeometry: function (g) {
        var me = this;
        if ((typeof g != 'object') || !g.getType) {
          return '';
        }
        if (g.getType() === 'Circle') {
            return JSON.stringify({ type: 'Circle', center: g.getCenter(), radius: g.getRadius()});
        } else {
            return me.olFormat.writeGeometry(g);
        }
    },

    hashPwd: function (pwd) {
        try {
            return CryptoJS.MD5(pwd).toString();
        } catch (e) {
            return null;
        }
    },

    updateFacesFinalPrice: function () {
      var me = this,
        store = Ext.getStore('Faces'),
        group = me.getCurrentRulesGroup();
      store.beginUpdate();
      Ext.suspendLayouts();
      store.suspendEvents();
      var source = store.getData().getSource() || store.getData();
      source.each(function(face){
        var pseudoProp = {
          faceId: face.getId(),
          netCost: group ? group.getFaceMonthPrice(face.getData()) : face.get('price')
        }
        face.set({
          finalPrice: group ? group.getFaceMonthPrice(face.getData()) : face.get('price'),
          clientPrice: group ? group.getFaceMonthClientPrice(pseudoProp) : face.get('price')
        }, {commit: true}); //, silent: true
      });
      store.resumeEvents();
      Ext.resumeLayouts(true);
      store.endUpdate();
    },

    updateCurrentRulesGroup: function (newVal, oldVal) {
        var me = this;

        if (Ext.getStore('Faces') && Ext.getStore('Faces').isLoaded()) {
            me.updateFacesFinalPrice();
        }

        me.fireEventArgs('discountgroupchanged', [newVal, oldVal]);
    },

    updateDefaultRulesGroup: function (newVal, oldVal) {
      var me = this,
        lStore = Ext.util.LocalStorage.get('user' + me.getUser().getId());
      if (!newVal) {
          lStore.removeItem('default_RulesGroupId');
          lStore.release();
          return;
      }
      if (lStore.getItem('default_RulesGroupId') !== newVal.getId()) {
          lStore.setItem('default_RulesGroupId', newVal.getId());
      }
      lStore.release();
    },

    // getDefaultRulesGroup: function () {
    //     var me = this;
    //     if (!me.getUser()) {
    //         return;
    //     }
    //     var lStore = Ext.util.LocalStorage.get('user' + me.getUser().getId()),
    //         res = null;
    //     try {
    //         var groupId = lStore.getItem('default_RulesGroupId');
    //         if (groupId && Ext.getStore('RulesGroups')) {
    //             res = Ext.getStore('RulesGroups').getById(groupId);
    //         }
    //     } catch (e) {
    //
    //     } finally {
    //         lStore.release();
    //     }
    //     return res;
    // },
    //
    // setDefaultRulesGroup: function (group) {
    //     var me = this,
    //         store = Ext.util.LocalStorage.get('user' + me.getUser().getId());
    //     if (!group) {
    //         store.removeItem('default_RulesGroupId');
    //         store.release();
    //         return;
    //     }
    //     store.setItem('default_RulesGroupId', group.getId());
    //     store.release();
    // },

    getPubPassphrase: function (pubCampaignId) {
        var me = this,
            store = Ext.util.LocalStorage.get('user' + me.getUser().getId());
        var salt = pubCampaignId ? store.getItem('salt_pubCampaign' + pubCampaignId) : null;
        var decryptedSalt;
        if (salt) {
            decryptedSalt = me.decryptSalt(salt);
        }
        store.release();
        return decryptedSalt;
    },

    setPubPassphrase: function (phrase, pubCampaignId) {
        var me = this,
            store = Ext.util.LocalStorage.get('user' + me.getUser().getId());
        if (!phrase && pubCampaignId) {
            store.removeItem('salt_pubCampaign' + pubCampaignId);
            store.release();
            return;
        }
        var encrypted = me.encryptSalt(phrase);
        if (pubCampaignId) {
            store.setItem('salt_pubCampaign' + pubCampaignId, encrypted);
        }
        store.release();
    },

    showPubPriceEncryptDialog: function (pubCampaignId, success) {
        if (!pubCampaignId) {
            return;
        }
        var me = this,
            dlg = Ext.create('Bigmedia.view.dialog.DlgPriceEncryption', {
                hideSaveGlobal: true,
                listeners: {
                    success: function (pwd) {
                        if (pwd) {
                            me.setPubPassphrase(pwd, pubCampaignId);
                        }
                        if (success) {
                            Ext.callback(success, me);
                        }
                    }
                }
            });
        dlg.show();
    },

    showPriceEncryptDialog: function (campaignId, success) {
        var me = this,
            dlg = Ext.create('Bigmedia.view.dialog.DlgPriceEncryption', {
            listeners: {
                success: function (pwd, isGlobal) {
                    if (pwd) {
                        if (isGlobal) {
                            if (campaignId) {
                                me.setSalt(null, campaignId);
                            }
                            me.setSalt(pwd);
                        } else {
                            me.setSalt(pwd, campaignId);
                        }
                    }
                    if (success) {
                        Ext.callback(success, me);
                    }
                }
            }
        });
        dlg.show();
    },

    getSalt: function (campaignId) {
        var me = this;
        if (!me.getUser()) {
          return null;
        }
        var store = Ext.util.LocalStorage.get('user' + me.getUser().getId());
        var salt = campaignId ? store.getItem('salt_campaign' + campaignId) || store.getItem('salt_global') : store.getItem('salt_global');
        var decryptedSalt;
        if (salt) {
            decryptedSalt = me.decryptSalt(salt);
        }
        store.release();
        return decryptedSalt;
    },

    encryptSalt: function (pwd) {
        var cipher = CryptoJS.AES.encrypt(pwd, this.RANDOM_HASH);
        return cipher ? cipher.toString() : null;
    },

    decryptSalt: function (encrypted) {
        var decrypted;
        var bytes = CryptoJS.AES.decrypt(encrypted, this.RANDOM_HASH);
        if (bytes && bytes.words && bytes.words.length) {
            decrypted = bytes.toString(CryptoJS.enc.Utf8);
        }
        return decrypted;
    },

    encryptPrice: function (salt, price) {
        if (!price || !salt) {
            return null;
        }
        var cipher = CryptoJS.AES.encrypt(price.toString(), salt);
        return cipher ? cipher.toString() : null;
    },

    decryptPrice: function (salt, encryptedPrice) {
        if (!encryptedPrice || !salt) {
            return null;
        }
        var decrypted;
        var bytes = CryptoJS.AES.decrypt(encryptedPrice, salt);
        if (bytes && bytes.words && bytes.words.length) {
            try {
                decrypted = bytes.toString(CryptoJS.enc.Utf8);
            } catch (e) {
                return null;
            }
        }
        return +decrypted;
    },

    setSalt: function (salt, campaignId) {
        var me = this,
            store = Ext.util.LocalStorage.get('user' + me.getUser().getId());
        if (!salt && campaignId) {
            store.removeItem('salt_campaign' + campaignId);
            store.release();
            return;
        }
        var encrypted = me.encryptSalt(salt);
        if (campaignId) {
            store.setItem('salt_campaign' + campaignId, encrypted);
        } else {
            store.setItem('salt_global', encrypted);
        }
        store.release();
    },

    updatePromocode: function (newVal, oldVal) {
        var me = this,
            store = Ext.getStore('Faces');
        var discount = (newVal && newVal.discount) ? newVal.discount : 0;
        // store.beginUpdate();
        // store.each(function(face){
        //     face.set('finalPrice', face.get('price') - face.get('price') * discount / 100, {commit: true, silent: true});
        // });
        // store.endUpdate();
        me.fireEventArgs('promocodechanged', [newVal, oldVal]);
    },

    convertOlToTurf: function (geometry) {
        if (!geometry) {
            return null;
        }
        var tFeature;
        try {
            switch (geometry.getType()) {
                case 'Point':
                tFeature = turf.point(ol.proj.toLonLat(geometry.getCoordinates()));
                break;
                case 'LineString':
                tFeature = turf.lineString(geometry.getCoordinates().map(function(item){
                    return ol.proj.toLonLat(item);
                }));
                break;
                case 'Circle':
                var polygon = ol.geom.Polygon.fromCircle(geometry);
                tFeature = turf.polygon(polygon.getCoordinates().map(function(item){
                    return item.map(function(item){
                        return ol.proj.toLonLat(item);
                    })
                }));
                break;
                default:
                tFeature = turf.polygon(geometry.getCoordinates().map(function(item){
                    return item.map(function(item){
                        return ol.proj.toLonLat(item);
                    })
                }));
            }
        } catch (e) {
            console.error('Error converting geometry from ol to turf');
        } finally {

        }
        return tFeature ? tFeature.geometry : null;
    },

    getOlGeometryCentroid: function (geometry) {
        var me = this,
            res = null;
        switch (geometry.getType()) {
            case 'Point':
                res = geometry;
                break;
            case 'Circle':
                res = new ol.geom.Point(geometry.getCenter());
                break;
            default:
                var turfGeometry = me.convertOlToTurf(geometry),
                    centroid = turf.centroid(turfGeometry);
                res = me.convertTurfToOl(centroid.geometry);
        }
        return res;
    },

    convertTurfToOl: function (geometry) {
        if (!geometry) {
            return null;
        }
        return geometry.type === 'Polygon' ? new ol.geom.Polygon(
            geometry.coordinates.map(function(item) {
                return item.map(function(item) {
                    return ol.proj.fromLonLat(item);
                });
            })
        ) : geometry.type === 'LineString' ? new ol.geom.LineString(
            geometry.coordinates.map(function(item) {
                return ol.proj.fromLonLat(item);
            })
        ) : geometry.type === 'Point' ? new ol.geom.Point(ol.proj.fromLonLat(geometry.coordinates)) : null;
    },

    convertJstsToTurf: function (jstsGeometry) {
        var me = this;
        var geometry = me.jsonWriter.write(jstsGeometry);
        var feature = turf.feature(geometry);
        return feature;
    },

    convertJstsToOl: function (jFeature, projection) {
        var me = this;
        var geoFeature = me.jsonWriter.write(jFeature);
        var formatOptions = {featureProjection: projection};
        var olFeature = me.olFormat.readFeature(geoFeature, formatOptions);
        return olFeature;
    },

    convertTurfToJsts: function (turfGeometry) {
        var me = this;
        var jstsFeature = me.jsonReader.read(turfGeometry.geometry);
        return jstsFeature;
    },

    getRadius: function (cityArea, grp, index) {
        var me = this;
        // sector
        var grpVal = grp || 0.01;
        // var r = Math.sqrt(2 * cityArea * grpVal / (100 * Math.PI * (grpVal / 100 + 1.6))); //
        var r = Math.sqrt(2 * cityArea * grpVal / (100 * Math.PI * 1.6)); //
        // circle
        // var r = Math.sqrt(cityArea * grpVal / (100 * Math.PI * (grpVal / 100 + 2)));
        if (index > 0) {
            r = Math.sqrt(2 * cityArea * Math.log(Math.pow(me.coverageDays[index], Math.E)) / (Math.PI * 100 * 1.6) + Math.pow(r, 2));
            // r = Math.sqrt(2 * cityArea * Math.log(Math.pow(me.coverageDays[index], Math.E)) / (Math.PI * 100 * (grpVal * me.coverageDays[index] / 100 + 1.6)) + Math.pow(r, 2));
            // Peter Gallop (sector)
            // r = Math.sqrt(2 * cityArea * grpVal * me.coverageDays[index] / (100 * Math.PI * (grpVal * me.coverageDays[index] / 100 + 2)));
            // Peter Gallop (circle)
            // r = Math.sqrt(cityArea * grpVal * me.coverageDays[index] / (100 * Math.PI * (grpVal * me.coverageDays[index] / 100 + 2)));
        }
        return r;
    },

    getCoverages: function (coords, cityId, grp, angle) {
        var me = this,
            cities = Ext.getStore('CityBoundaries');
        var grpVal = grp || 0.01;
        if (coords && grpVal && coords.length === 2) {
            if (!coords[0] || !coords[1]) {
                return null;
            }
            var coverages = [];
            var city = cities.getById(cityId),
                cityArea = 0;
            if (city) {
                cityArea = city.get('area');
            }
            if (!cityArea) {
                return null;
            }
            // sector
            // var r = Math.sqrt(2 * cityArea * grp / (100 * Math.PI));
            // circle
            // var r = Math.sqrt(cityArea * grp / (100 * Math.PI));
            var days = me.coverageDays;
            for(var i = 0; i < days.length; i++) {
                // var radius = (i == 0) ? r : (r * (1 + (days[i]/15)));

                // var radius = Math.sqrt(cityArea * grp * days[i] / (100 * Math.PI))
                // var radius = Math.sqrt(2 * cityArea * grp * days[i] / (100 * Math.PI))

                var radius = me.getRadius(cityArea, grpVal, i);
                // sector
                // var radius = (i == 0) ? r : (Math.sqrt(2 * cityArea * Math.log(days[i] ** (Math.E)) / (Math.PI * 100) + (r ** 2)));

                // circle
                // var radius = (i == 0) ? r : (Math.sqrt(cityArea * Math.log(days[i] ** (Math.E)) / (Math.PI * 100) + (r ** 2)));
                if (!angle || angle === 'NULL') {
                    angle = 0;
                }

                var center = turf.point(coords);
                var circle = turf.circle(center, radius / 1000, {steps: 16, units: 'kilometers'});

                // sector
                var sector;
                var turfAngle = angle * (-1) + 90;
                sector = turf.polygon([circle.geometry.coordinates[0].slice(0,9).concat([circle.geometry.coordinates[0][0]])]);
                if (turfAngle !== 0) {
                    sector = turf.transformRotate(sector, turfAngle, {pivot: center});
                }
                var sectorJsts = me.convertTurfToJsts(turf.truncate(sector));
                coverages.push(sectorJsts);

                // circle
                // var circleJsts = Bigmedia.Vars.convertTurfToJsts(turf.truncate(circle));
                // coverages.push(circleJsts);
            }
            return coverages;
        }
        else {
            console.log('no coords: %o', coords);
            return null;
        }
    },

    calculateFaceCoverages: function (face) {
        var coverages = face.get('coverages');
        if (!coverages) {
            coverages = this.getCoverages([parseFloat(face.get('lon')), parseFloat(face.get('lat'))], face.get('id_city'), face.get('grp'), face.get('angle'));
            face.set('coverages', coverages, {commit: true, silent: true});
        }
        return coverages;
    },

    calculateCoverages: function (data) {
        try {
            if (data && data.lon && data.lat) {
                return this.getCoverages([parseFloat(data.lon), parseFloat(data.lat)], data.cityId, data.grp, data.angle);
            } else {
                return null;
            }
        } catch (e) {
            console.error('error calculate coverage: %o', data);
            return null;
        }
    },

    constructor: function(config) {
        var me = this;
        me.mixins.observable.constructor.call(me, config);
        me.initConfig(config);
        // me.setUser(Ext.create('Bigmedia.model.User'));
    },

    getViewport: function () {
        return Ext.ComponentQuery.query('mainviewport')[0];
    },

    updateCurCamp: function (newVal, oldVal) {
        this.fireEvent('curcampchanged');
    },

    updateShowKSHitmap: function (newVal, oldVal) {
        this.showKSHitmap=newVal;
        this.fireEvent('showKSHitmap',newVal);
    },
    getShowKSHitmap:function (){
        return this.showKSHitmap;
    },
    updateUser: function (newVal, oldVal) {
        var mv = Ext.getCmp('mainViewport'),
            refs = mv.getReferences(),
            mainCard = refs.mainCardPanel,
            facesView = mainCard.child('component[routeId=faces]'),
            restrictedArea = oldVal ? mainCard.child('component[restrictedArea=' + oldVal.get('id') + ']') : null;
        if (oldVal && oldVal.get('id') !== 'anonymous' && !oldVal.phantom && (!newVal || newVal.phantom || newVal.get('id') === 'anonymous')) {
            Ext.getCmp('mainViewport').getController().redirectTo('faces');
            if (facesView) {
                mainCard.setActiveItem(facesView);
            }
            Ext.toast(Bigmedia.Locales.varsLoggedOutToastText);
            // Google Analytics
            // console.log('gtag config anonymous');
            // gtag('set', {'user_id': null});
            this.taglog('user logged out', {userId: oldVal.get('id')});
        }
        if (oldVal && oldVal.get('id') !== 'anonymous' && !oldVal.phantom) {
            if (restrictedArea && (!newVal || newVal.get('id') === 'anonymous' || oldVal.get('id') !== newVal.get('id') )) {
                restrictedArea.destroy();
            }
        }
        if (newVal) {
            if (newVal.get('id') !== 'anonymous' && !newVal.phantom) {
                Ext.getCmp('mainViewport').getController().getRestrictedArea();

                var lStore = Ext.util.LocalStorage.get('user' + newVal.getId()),
                gStore = Ext.getStore('RulesGroups');
                if (lStore.getItem('default_RulesGroupId')) {
                    var defaultGroup = gStore.getById(lStore.getItem('default_RulesGroupId'));
                    // console.log('set %o', defaultGroup);
                    this.setDefaultRulesGroup(defaultGroup);
                }
                lStore.release();
                // Google Analytics
                // console.log('gtag config user ' + newVal.get('id'));
                // gtag('set', {'user_id': newVal.get('id')}); // Установити ідентифікатор користувача на основі параметра user_id після входу.
                this.taglog('user logged in', {userId: newVal.get('id')});
            } else {
                this.setDefaultRulesGroup(null);
            }
        }
        // Ext.getStore('Campaigns').reload();
        Ext.getCmp('mainViewport').getViewModel().set('user', newVal);
        var userOrgType = 'Anonymous';
        if (newVal) {
          if (newVal.get('orgId') && [1,2181,2911,3427,9447].indexOf(+newVal.get('orgId')) >= 0) {
            userOrgType = 'Bigmedia';
          } else {
            switch (+newVal.get('clientType')) {
              case 474:
                userOrgType = 'Network Agency';
                break;
              case 475:
                userOrgType = 'Agency';
                break;
              default:
                userOrgType = 'Direct Client';
            }
          }
          this.pushToDataLayer({'userOrgName': newVal.get('orgName')});
        } else {
          this.pushToDataLayer({'userOrgName': null});
        }
        this.pushToDataLayer({'userOrgType': userOrgType});
        if (newVal && newVal.get('id') !== 'anonymous' && !newVal.phantom) {
          this.pushToDataLayer({'event': 'userLoggedIn'});
        } else {
          if (oldVal && oldVal.get('id') !== 'anonymous' && !newVal.phantom) {
            this.pushToDataLayer({'event': 'userLoggedOut'});
          }
        }
        this.fireEventArgs('userchanged', [newVal]);
    },
    pushToDataLayer: function (obj) {
        if (window.dataLayer) {
            window.dataLayer.push(obj);
        }
    },
    loadUserConfig: function (obj, providerId) {
        var userConfig;
        if (obj.id != 'anonymous') {
            var store = Ext.util.LocalStorage.get('user' + obj.id);
            if (!providerId) {
                providerId = store.getItem('providerId');
            } else {
                store.setItem('providerId', providerId);
            }
            store.release();
            if (providerId !== 2) { //facebook
                var tokens = obj.tokens;
                if (tokens && tokens.length > 0) {
                    for (var i = 0; i < tokens.length; i++) {
                        if (tokens[i].providerId == 1) {
                            break;
                        }
                    }
                    if (i < tokens.length){
                        userConfig = {
                            id: obj.id,
                            name: obj.tokens[i].displayName,
                            email: obj.tokens[i].email,
                            pictureUrl: obj.tokens[i].pictureUrl,
                            profileId: obj.profileId
                        }
                    }
                }
            }
        } else {
            userConfig = {
                id: 'anonymous',
                name: 'Anonymous',
                pictureUrl: 'resources/images/anonymous.png'
            };
        }
    },
    //initially loaded from application launch
    loadUser: function (cb) {
        var me = this;
        // if (!me.getUser() || me.getUser().get('id') === 'anonymous') {
            var request = new XMLHttpRequest();
            request.open('GET', '/api/v1/auth/user');
            request.onreadystatechange = function() { // (3)
                if (request.readyState != 4) return;
                if (request.status != 200) {
                    console.log('Request auth/user error, status: ' + request.statusText);
                    Bigmedia.Vars.setUser(Ext.create('Bigmedia.model.User', {id: 'anonymous'}));
                    if (cb) { cb();}
                } else {
                    var user = JSON.parse(request.responseText),
                        newUser;
                    if (user) {
                        newUser = Ext.create('Bigmedia.model.User', user);
                        // newUser.initFields();
                    } else {
                        newUser = Ext.create('Bigmedia.model.User', {id: 'anonymous'});
                    }
                    Bigmedia.Vars.setUser(newUser);
                    if (cb) { cb();}
                }
            };
            request.send();
        // } else {
        //     me.getUser().load({
        //         success: function (record) {
        //             me.fireEvent('userchanged');
        //             if (cb) { cb();}
        //         },
        //         failure: function() {
        //             //TODO add error message
        //             console.log('error loading user');
        //             if (cb) { cb();}
        //         }
        //     });
        // }
    },
    logoutUser: function (cb) {
        var request = new XMLHttpRequest();
        request.open('POST', '/api/v1/auth/logout');

        request.onreadystatechange = function() { // (3)
            if (request.readyState != 4) return;
            if (request.status != 200) {
                Ext.Msg.alert('Logout error', 'Status: ' + request.statusText);
            } else {
                Bigmedia.lib.provider.Facebook.logout();
                var user = Ext.create('Bigmedia.model.User', {id: 'anonymous'});
                Bigmedia.Vars.setUser(user);
                if (cb) { cb();}
            }
        };
        request.send();
    },

    buildUrl: function (command) {
        var me = this;
        // console.log('buildUrl ' + me.getUser());
        if (this.getUser() && this.getUser().get('id') !== 'anonymous') {
            return '/user/' + this.getUser().get('id') + '/' + command;
        }
        else {
            return command;
        }
    },

    getFacesByPeriod: function (params) {
        var startDate = params.startDate,
            endDate = params.endDate,
            wholePeriod = !!params.wholePeriod,
            minFreeDays = params.minFreeDays || 15,
            allowTempRes = !!params.allowTempRes,
            now = new Date(),
            minDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1)),
            faces = {};

        var daysToBeg = Math.round((startDate - minDate) / (3600 * 24 * 1000)),
        daysPeriod = Math.round((endDate - startDate) / (3600 * 24 * 1000));

        var res,
        re = /(\d+)(\w)/g;
        //console.log(m.occ);
        //while ((res = re.exec(newValues.occ)) != null) {

        var source = params.store.getData();
        if(source.filtered){ source = source.getSource();}
        var freeRe = new RegExp('^.{' + daysToBeg + (wholePeriod ? '' : ',' + (daysToBeg + daysPeriod - minFreeDays)) + '}(' + (allowTempRes ? '[tf]' : 'f') + '{' + daysPeriod +'})');
        source.each(function(rec){
            var occ = rec.get('occByDays');
            if (!occ) {
                faces[rec.getId()] = daysPeriod;
            } else {
                // var tmpOcc = occ.slice(daysToBeg);
                if (freeRe.test(occ)) {
                    faces[rec.getId()] = freeRe.exec(occ)[1].length;
                }
            }
        });
        // source.each(function(rec){
        //     var occ = rec.get('occupancy'),
        //     beforePeriod = true,
        //     freePeriods = [],
        //     iDaysToBeg = daysToBeg,
        //     iDaysPeriod = daysPeriod;
        //     re.lastIndex = 0;
        //     if (!occ) {
        //         faces[rec.getId()] = daysPeriod;
        //     } else {
        //         while ((res = re.exec(occ)) != null && iDaysPeriod > 0) {
        //             var restDays = +res[1],
        //             status = res[2];
        //             if (beforePeriod && restDays <= iDaysToBeg) {
        //                 iDaysToBeg -= restDays;
        //                 continue;
        //             } else if (beforePeriod) {
        //                 beforePeriod = false;
        //                 restDays -= iDaysToBeg;
        //                 iDaysToBeg = 0;
        //             }
        //             if (iDaysToBeg === 0 && (status == 'f' || (status == 't' && allowTempRes) )) {
        //                 freePeriods.push(Math.min(iDaysPeriod, restDays));
        //             }
        //             iDaysPeriod -= restDays;
        //         }
        //         var maxFreePeriod = Math.max(freePeriods);
        //         if((wholePeriod && maxFreePeriod>=daysPeriod) || (!wholePeriod && maxFreePeriod>=minFreeDays)){
        //             faces[rec.getId()] = maxFreePeriod;
        //         }
        //     }
        // });

        return faces;
    },

    getFaceApproxCells: function (face) {
        var me = this,
            data = face.getData(),
            cells = me.getFaceDataApproxCells(face);
        face.set({cells: cells}, {silent: true});
        return cells;
    },

    isInsideCircle: function (center, radius, point) {
        return turf.distance(center, point) <= (radius / 1000);
    },

    inSector: function (center, faceAngle, point) {
        // var pointAngle = Math.atan2(point[1] - center[1]) / (point[0] - center[0]) * 180 / Math.PI;
        var bearing = turf.bearing(center, point);
        var res;
        if (faceAngle >= 0 && faceAngle <=90) {
            res = (bearing >= -90 - faceAngle) && (bearing <= 90 - faceAngle);
        } else if (faceAngle >= 270) {
            res = (bearing >= (270 - faceAngle)) && (bearing <= (270 + 180 - faceAngle));
        } else {
            res = (bearing < 90 - faceAngle) || (bearing > faceAngle - 90);
        }
        // console.log([bearing, faceAngle, res]);
        return res;
        // return pointAngle <= faceAngle - 90 && pointAngle >= faceAngle + 90;
    },

    getPeriodText: function (startDate, endDate, disabled) {
      // if (!startDate && !endDate) { return 'Всі площини'};
      if (disabled) { return 'Всі площини' };
      if (!startDate || !endDate) { return ''};
      if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
        return startDate + ' - ' + endDate;
      }
      var res = '';
      var start = Ext.Date.clearTime(startDate, true),
        end = Ext.Date.clearTime(endDate, true),
        sY = start.getFullYear(),
        sM = start.getMonth(),
        sD = start.getDate(),
        eY = end.getFullYear(),
        eM = end.getMonth(),
        eD = end.getDate(),
        sameY = (sY === eY),
        sameM = (sM === eM),
        isMonthStart = Ext.Date.isEqual(start, Ext.Date.getFirstDateOfMonth(start)),
        isMonthEnd = Ext.Date.isEqual(end, Ext.Date.getLastDateOfMonth(end));
      if (sD === 1 && sM === 0 && eD === 31 && eM === 11) {
        res = sY.toString();
        if (sameY) {
          res += ' рік';
        } else {
          res += ' - ' + eY.toString() + ' роки';
        }
      } else {
        var sFormat, eFormat = '';
        if (!isMonthStart || !isMonthEnd) {
          sFormat = 'd';
          eFormat = 'd';
          if (!sameY || !sameM) {
            sFormat += ' M';
            if (!sameY) {
              sFormat += ' \'y';
            }
          }
          eFormat += ' M \'y';
        }
        else {
          if (!sameY || !sameM) {
            sFormat = 'M';
            eFormat = 'M';
            if (!sameY) {
              sFormat += ' \'y';
            }
          } else {
            eFormat = 'F';
          }
          eFormat += ' \'y';
        }
        res = (sFormat ? Ext.Date.format(start, sFormat) + ' - ' : '');
        res += Ext.Date.format(end, eFormat);
      }
      return res;
    },

    getTimeAgo: function () {

    },

    // too slow
    // getCityApproxCells: function (city, facesStore) {
    //     var me = this,
    //         cellSize = 0.1, // kilometers
    //         dayIndex = 2;
    //     var origPoint = [city.get('bbox')[0], city.get('bbox')[1]];
    //     var xSize = Math.round(city.get('x') / cellSize),
    //         ySize = Math.round(city.get('y') / cellSize);
    //     var cells = {};
    //     for (var y = 0; y < ySize; y++) {
    //         cells[y] = {};
    //         for (var x = 0; x < xSize; x++) {
    //             facesStore.each(function(face){
    //                 var data = face.getData();
    //                 var coord = face.get('coord'),
    //                     radius = face.get('radius');
    //                 if (!coord) {
    //                     coord = [parseFloat(data.lon), parseFloat(data.lat)],
    //                         pos = data.pos;
    //                     if (+pos !== 0) {
    //                         var offset = [pos * 0.00005, 0],
    //                             angleRad = (data.angle) *  Math.PI / 180;
    //                         ol.coordinate.rotate(offset, angleRad);
    //                         ol.coordinate.add(coord, offset);
    //                     }
    //                     var grp = data.grp;
    //                     radius = me.getRadius(city.get('area'), grp, dayIndex);
    //                     face.set({coord: coord, radius: radius}, {silent: true});
    //                 }
    //                 var cellCenter = turf.destination(turf.destination(origPoint, x * cellSize + cellSize / 2, 90), y * cellSize + cellSize / 2, 0);
    //                 if (me.inSector(coord, data.angle, cellCenter.geometry.coordinates) && me.isInsideCircle(coord, radius, cellCenter.geometry.coordinates)) {
    //                      if (cells[y][x]) {
    //                          cells[y][x].faces.push(face.getId());
    //                          cells[y][x].facesCount++;
    //                      } else {
    //                          cells[y][x] = {faces: [face.getId()], facesCount: 1};
    //                      }
    //                      if (face.get('cells')) {
    //                          face.get('cells').push(y * xSize + x)
    //                      } else {
    //                          face.set({cells: [y * xSize + x]}, {silent: true});
    //                      }
    //                     // cells.push((y + fromCellY) * inRow + x + fromCellX);
    //                     // console.log('fast');
    //                 }
    //             })
    //         }
    //     }
    //     city.set({cells: cells}, {silent: true});
    // },

    getFaceDataApproxCells: function (face) {
        var me = this,
            data = face.getData();
        if (data.cells) {
            return data.cells;
        }
        var cellSize = 0.1, // kilometers
            dayIndex = 2;
        var city = Ext.getStore('CityBoundaries').getById(data['id_city']);
        if (!city) {
            return [];
        }
        // console.log('faceNo: ' + face.get('num'));
        if (parseFloat(data.lon) && parseFloat(data.lat)) {
            var coord = [parseFloat(data.lon), parseFloat(data.lat)],
                pos = data.pos;
            if (+pos !== 0) {
                var offset = [pos * 0.00005, 0],
                    angleRad = (data.angle) *  Math.PI / 180;
                ol.coordinate.rotate(offset, angleRad);
                ol.coordinate.add(coord, offset);
            }
            var grp = data.grp;
            //------------------------------------------------------------
            // third variant - like second but intersect is calculated mathematically (without turf library)
            // var coverage;
            // if (data.coverages) {
            //     coverage = data.coverages[dayIndex];
            // } else {
            //     coverage = me.calculateFaceCoverages(face)[dayIndex];
            // }
            // var turfCover = me.convertJstsToTurf(coverage);
            // var coverBBox = turf.bbox(turfCover);
            // var coverBP = turf.bboxPolygon(coverBBox);
            // var intersectedBP = turf.intersect(turf.bboxPolygon(city.get('bbox')), coverBP);
            // var iBBox = turf.bbox(intersectedBP);
            // // console.log(iBBox);
            // var ibbWidth = turf.distance([iBBox[0], iBBox[1]], [iBBox[2], iBBox[1]]),
            //     ibbHeight = turf.distance([iBBox[0], iBBox[1]], [iBBox[0], iBBox[3]]);
            // var fromCellX = 0;
            // if (city.get('bbox')[0] < iBBox[0]) {
            //     fromCellX = Math.round(turf.distance([city.get('bbox')[0],city.get('bbox')[1]], [iBBox[0], city.get('bbox')[1]]) / cellSize);
            // }
            // var fromCellY = 0;
            // if (city.get('bbox')[1] < iBBox[1]) {
            //     fromCellY = Math.round(turf.distance([city.get('bbox')[0],city.get('bbox')[1]], [city.get('bbox')[0], iBBox[1]]) / cellSize);
            // }
            // var cellsXLength = Math.round(ibbWidth / cellSize);
            // var cellsYLength = Math.round(ibbHeight / cellSize);
            // var origPoint = [iBBox[0], iBBox[1]];
            var radius = me.getRadius(city.get('area'), grp, dayIndex);
            var cellsXLength = Math.round((2 * radius / 1000) / cellSize);
            var cellsYLength = cellsXLength;
            var origPoint = turf.destination(coord, radius * Math.SQRT2 / 1000, -135);
            // console.log(origPoint);
            var fromCellX = Math.round(turf.distance([city.get('bbox')[0],city.get('bbox')[1]], [origPoint.geometry.coordinates[0], city.get('bbox')[1]]) / cellSize);
            if (fromCellX < 0) {
                fromCellX = 0;
            }
            var fromCellY = Math.round(turf.distance([city.get('bbox')[0],city.get('bbox')[1]], [city.get('bbox')[0], origPoint.geometry.coordinates[1]]) / cellSize);
            if (fromCellY < 0) {
                fromCellY = 0;
            }
            var inRow = Math.round(city.get('x') / cellSize);
            var cells = [];
            // console.log(radius);
            for (var y = 0; y < cellsYLength; y++) {
                for (var x = 0; x < cellsXLength; x++) {
                    // var fromPoint = turf.destination(turf.destination(origPoint, x * cellSize, 90), y * cellSize, 0);
                    // var cellCenter = turf.destination(turf.destination(fromPoint, cellSize / 2, 90), cellSize / 2, 0);
                    var cellCenter = turf.destination(turf.destination(origPoint, x * cellSize + cellSize / 2, 90), y * cellSize + cellSize / 2, 0);
                    if (me.isInsideCircle(coord, radius, cellCenter.geometry.coordinates) && me.inSector(coord, data.angle, cellCenter.geometry.coordinates) ) {
                        cells.push((y + fromCellY) * inRow + x + fromCellX);
                        // console.log('fast');
                    }

                    // var points = turf.pointsWithinPolygon(cellCenter, turfCover);
                    // if (points && points.features.length > 0) {
                    //     cells.push((y + fromCellY) * inRow + x + fromCellX);
                    //     // console.log('slow');
                    // }
                }
            }
            // console.log(cells);
            return cells;
            //------------------------------------------------------------
            // second variant (squares that intersects with coverage polygon - too slow)
            // var coverage;
            // if (data.coverages) {
            //     coverage = data.coverages[0];
            // } else {
            //     coverage = this.calculateFaceCoverages(face)[0];
            // }
            // var turfCover = this.convertJstsToTurf(coverage);
            // var coverBBox = turf.bbox(turfCover);
            // var coverBP = turf.bboxPolygon(coverBBox);
            // var intersectedBP = turf.intersect(turf.bboxPolygon(city.get('bbox')), coverBP);
            // var fromCellX = 0;
            // if (city.get('bbox')[0] < coverBBox[0]) {
            //     fromCellX = Math.round(turf.distance([city.get('bbox')[0],city.get('bbox')[1]], [coverBBox[0], city.get('bbox')[1]]) / cellSize);
            // }
            // var fromCellY = 0;
            // if (city.get('bbox')[1] < coverBBox[1]) {
            //     fromCellY = Math.round(turf.distance([city.get('bbox')[0],city.get('bbox')[1]], [city.get('bbox')[0], coverBBox[1]]) / cellSize);
            // }
            // var cellsXLength = Math.round(turf.distance(intersectedBP.geometry.coordinates[0][1], intersectedBP.geometry.coordinates[0][2]) / cellSize);
            // var cellsYLength = Math.round(turf.distance(intersectedBP.geometry.coordinates[0][0], intersectedBP.geometry.coordinates[0][1]) / cellSize);
            // var origPoint = intersectedBP.geometry.coordinates[0][0];
            // var inRow = Math.round(city.get('x') / cellSize);
            // var cells = [];
            // for (var y = 0; y < cellsYLength; y++) {
            //     for (var x = 0; x < cellsXLength; x++) {
            //         var fromPoint = turf.destination(turf.destination(origPoint, x * cellSize, 90), y * cellSize, 180);
            //         var cellPolygon = turf.polygon([[fromPoint.geometry.coordinates, turf.destination(fromPoint, cellSize, 90).geometry.coordinates, turf.destination(turf.destination(fromPoint, cellSize, 90), cellSize, 180).geometry.coordinates, turf.destination(fromPoint, cellSize, 180).geometry.coordinates, fromPoint.geometry.coordinates]]);
            //         // console.log([turfCover, cellPolygon]);
            //         if (turf.intersect(turfCover, cellPolygon)) {
            //             cells.push((y + fromCellY) * inRow + x + fromCellX);
            //         }
            //     }
            // }
            // // console.log(cells);
            // return cells;

            //------------------------------------------------------------
            // first variant (squares) fast, but inaccurate
            // var squareLength = Math.round(Math.sqrt(city.get('x') * city.get('y') / (cellSize * cellSize) * grp / 100)); // cells in row for face
            // var cells = [];
            // var fromCellX = Math.round(turf.distance([Math.max(city.get('bbox')[0], turf.destination(coord, squareLength * cellSize / 2, -90).geometry.coordinates[0]), city.get('bbox')[1]],[city.get('bbox')[0], city.get('bbox')[1]]) / cellSize);
            // var fromCellY = Math.round(turf.distance([city.get('bbox')[0], Math.max(city.get('bbox')[1], turf.destination(coord, squareLength * cellSize / 2, 180).geometry.coordinates[1])],[city.get('bbox')[0], city.get('bbox')[1]]) / cellSize);
            //
            // var inRow = Math.round(city.get('x') / cellSize);
            // for (var x = fromCellX; x < Math.min(fromCellX + squareLength, Math.round(city.get('x') / cellSize)); x++) {
            //     for (var y = fromCellY; y < Math.min(fromCellY + squareLength, Math.round(city.get('y') / cellSize)); y++) {
            //         cells.push(y * inRow + x);
            //     }
            // }
            // return cells;
            //------------------------------------------------------------
        } else {
            return [];
        }
    },

    taglog: function (tag, params) {
      var me = this;
      if (params) {
        params.site='bma';
      } else {
        params = {site: 'bma'};
      }
      if (me.taglogqueue && me.taglogqueue[tag]) {
        Ext.undefer(me.taglogqueue[tag])
      }
      if (!me.taglogqueue) {
        me.taglogqueue = {}
      }
      me.taglogqueue[tag] = Ext.defer(me.sendTaglog, 1000, me, [tag, params])
    },

    sendTaglog: function (tag, params) {
      fetch('/api/v1/taglog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tag: tag,
          params: params
        })
      }).then();
    },

    toastSuccess: function (message) {
      this.showToast(message, 'x-fa fa-check bm-green');
    },

    toastFailure: function (message) {
      this.showToast(message, 'x-fa fa-exclamation bm-red')
    },

    showToast: function (s, iconCls, color) {
      var html = '';
      if (iconCls) {
        if (color) {
          html = '<font color="' + color + '"><i class = "' + iconCls + '"></i></font>&nbsp;&nbsp;'
        } else {
          html = '<i class = "' + iconCls + '"></i>&nbsp;&nbsp;'
        }
      }
      html += s;
        Ext.toast({
            html: html,
            // iconCls: iconCls,
            // title: s,
            closable: false,
            align: 't',
            slideInDuration: 400
            // minWidth: 400
        });
    },

    /*
      QueryableWorker instances methods:
        * sendQuery(queryable function name, argument to pass 1, argument to pass 2, etc. etc): calls a Worker's queryable function
        * postMessage(string or JSON Data): see Worker.prototype.postMessage()
        * terminate(): terminates the Worker
        * addListener(name, function): adds a listener
        * removeListener(name): removes a listener
      QueryableWorker instances properties:
        * defaultListener: the default listener executed only when the Worker calls the postMessage() function directly
    */
    QueryableWorker: function (url, defaultListener, onError) {
        var me = this,
            worker = new window.Worker(url),
        listeners = {};

        me.defaultListener = defaultListener || function() {};

        if (onError) {worker.onerror = onError;}

        me.postMessage = function(message) {
            worker.postMessage(message);
        }

        me.terminate = function() {
            worker.terminate();
        }

        me.addListener = function(name, listener) {
            listeners[name] = listener;
        }

        me.removeListener = function(name) {
            delete listeners[name];
        }

        /*
        This functions takes at least one argument, the method name we want to query.
        Then we can pass in the arguments that the method needs.
        */
        me.sendQuery = function() {
            if (arguments.length < 1) {
                throw new TypeError('QueryableWorker.sendQuery takes at least one argument');
                return;
            }
            worker.postMessage({
                'queryMethod': arguments[0],
                'queryMethodArguments': Array.prototype.slice.call(arguments, 1)
            });
        }

        worker.onmessage = function(event) {
            if (event.data instanceof Object &&
                event.data.hasOwnProperty('queryMethodListener') &&
                event.data.hasOwnProperty('queryMethodArguments')) {
                    listeners[event.data.queryMethodListener].apply(me, event.data.queryMethodArguments);
                } else {
                    me.defaultListener.call(me, event.data);
                }
        }
    }
});
