"use strict";

Ext.define("Bigmedia.view.carousel.FacePhotos", {
  extend: "Ext.container.Container",
  requires: ["Bigmedia.carousel.CarouselContainer", "Bigmedia.carousel.CarouselToolbar"],
  xtype: "facephotoscarousel",
  config: {
    face: null
  },
  viewModel: {},
  layout: 'anchor',
  referenceHolder: true,
  items: [{
    xtype: 'panel',
    shrinkWrap: false,
    shrinkWrapDock: false,
    manageHeight: false,
    listeners: {
      // resize: function(p) {
      // },
      afterlayout: function afterlayout(p) {
        p.body.setStyle('height', 'auto');
      }
    },
    // componentLayout: 'auto',
    anchor: '100% 100%',
    bodyStyle: {
      height: '100% !important'
    },
    items: {
      reference: 'carousel',
      xtype: 'carousel',
      // shrinkWrap: false,
      // shrinkWrapDock: false,
      publishes: 'single',
      items: []
    },
    dockedItems: [{
      xtype: 'bmcarouseltoolbar',
      dock: 'bottom',
      bind: {
        hidden: '{carousel.single}'
      } // ,
      // shrinkWrap: true,
      // shrinkWrapDock: true

    }]
  }],
  updateFace: function updateFace(f) {
    var me = this; // ,
    //     carousel = me.lookupReference('carousel');
    // carousel.removeAll(true);

    var photos = [];

    if (!f) {
      me.initCarousel(photos);
      return;
    } // console.log(f);


    if (f.get('photos')) {
      f.get('photos').forEach(function (p) {
        if (p.id) {
          // photos.push('https://www.bigmedia.ua/cgi/getphoto_.pl?id=' + p.id);
          photos.push('/photohub/photo/' + p.id);
        } else if (p.src) {
          // photos.push(p.src);
          // photos.push('/proxyphoto?src=' + p.src);
          if (f.get('faceId')) {
            photos.push('/photohub/face/' + f.get('faceId'));
          } else {
            photos.push('/photohub/face/' + f.getId());
          }
        }
      });
    } else if (f.get('urlPhoto')) {
      // photos.push(f.get('urlPhoto'));
      // photos.push('/proxyphoto?src=' + f.get('urlPhoto'));
      if (f.get('faceId')) {
        photos.push('/photohub/face/' + f.get('faceId'));
      } else {
        photos.push('/photohub/face/' + f.getId());
      }
    } else if (f.get('doorsNo')) {
      photos.push('/photohub/doors/' + f.get('doorsNo'));
    }

    me.initCarousel(photos);
  },
  initCarousel: function initCarousel(photos) {
    var me = this,
        carousel = me.lookupReference('carousel');
    carousel.removeAll(true);

    if (photos.length > 0) {
      photos.forEach(function (f) {
        carousel.add(new Ext.panel.Panel({
          bodyStyle: 'background: center / cover no-repeat url(' + f + ')'
        }) // new Ext.container.Container({
        //     layout: 'fit',
        //     items: new Ext.Img({
        //             src: f,
        //             width: "100%"
        //         }
        //     )
        // })
        );
      });
    }
  }
});