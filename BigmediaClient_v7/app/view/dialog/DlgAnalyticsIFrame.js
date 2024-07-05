Ext.define('Bigmedia.view.dialog.DlgAnalyticsIFrame',{
  extend: 'Ext.window.Window',

  requires: [
    'Ext.Component'
  ],

  modal: true,
  autoShow: true,
  closeAction: 'destroy',

  width: '100%',
  height: '100%',

  // header: false,

  maximized: true,

  layout: 'fit',

  title: 'Аналітика ринку зовнішньої реклами України від Бігмедіа',
  closable: true,

  items: [
    {
      xtype: 'box',
      autoEl: {
          tag: 'iframe',
          src: 'https://app.powerbi.com/view?r=eyJrIjoiZjFmYjIzYmYtY2RlZC00NTdiLTliODQtMTMyZmRjNmIyMDIzIiwidCI6IjNkMjIzNmU5LTg1OTgtNDdlMi1hM2QyLTQ5N2QyNWQ2NjFiMSIsImMiOjl9',
          // src: 'https://app.powerbi.com/reportEmbed?reportId=7934f137-b792-454a-a55b-dd512b18977f&autoAuth=true&ctid=3d2236e9-8598-47e2-a3d2-497d25d661b1&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXdlc3QtZXVyb3BlLWQtcHJpbWFyeS1yZWRpcmVjdC5hbmFseXNpcy53aW5kb3dzLm5ldC8ifQ%3D%3D',
          title: 'OOH_Market_Category',
          // width: 1140,
          // height: 541,
          frameborder: "0",
          allowFullScreen: "true"
      }
    }
  ],

  // tbar: {
  //   items: [
  //     {
  //       xtype: 'component',
  //       html: '<h1>Аналітика ринку зовнішньої реклами України від Бігмедіа</h1>'
  //     }
  //   ]
  // },
  bbar: {
    items: [
      '->',
      {
        scale: 'large',
        ui: 'base-blue',
        text: 'Повернутись до БМА',
        handler: function (btn) {
          btn.up('window').close();
        }
      }
    ]
  }
});
