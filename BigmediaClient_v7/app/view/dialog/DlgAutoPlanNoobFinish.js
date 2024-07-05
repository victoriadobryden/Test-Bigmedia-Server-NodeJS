Ext.define('Bigmedia.view.dialog.DlgAutoPlanNoobFinish',{
  extend: 'Ext.window.Window',

  xtype: 'simplefinish',

  closeAction: 'destroy',

  width: 600,
  height: 500,

  header: false,

  maximized: false,

  layout: 'fit',

  modal: true,

  items: [
    {
      layout: 'fit',
      bind: {
        hidden: '{!saving}'
      },
      height: '100%',
      items: [
        {
          xtype: 'container',
          width: 600,
          minWidth: 400,
          layout: {
            type: 'vbox',
            pack: 'middle',
            align: 'stretch'
          },

          defaults: {
            width: '100%'
          },
          items: [
            {
              padding: 20,
              bind: {
                html: '<span style="font-size: 13px; color: #111; line-height: 16px">Зачекайте, будь ласка.<br>Зберігаємо дані на сервер</span>'
              }
            },
            { flex: 1},
            {
              html: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: rgb(255, 255, 255) none repeat scroll 0% 0%; display: block;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
              <rect fill="#0289d1" x="15" y="15" width="30" height="30" rx="3" ry="3">
              <animate attributeName="x" dur="2s" repeatCount="indefinite" keyTimes="0;0.083;0.25;0.333;0.5;0.583;0.75;0.833;1" values="15;55;55;55;55;15;15;15;15" begin="-1.8333333333333333s"></animate>
              <animate attributeName="y" dur="2s" repeatCount="indefinite" keyTimes="0;0.083;0.25;0.333;0.5;0.583;0.75;0.833;1" values="15;55;55;55;55;15;15;15;15" begin="-1.3333333333333333s"></animate>
              </rect><rect fill="#d11724" x="15" y="15" width="30" height="30" rx="3" ry="3">
              <animate attributeName="x" dur="2s" repeatCount="indefinite" keyTimes="0;0.083;0.25;0.333;0.5;0.583;0.75;0.833;1" values="15;55;55;55;55;15;15;15;15" begin="-1.1666666666666667s"></animate>
              <animate attributeName="y" dur="2s" repeatCount="indefinite" keyTimes="0;0.083;0.25;0.333;0.5;0.583;0.75;0.833;1" values="15;55;55;55;55;15;15;15;15" begin="-0.6666666666666666s"></animate>
              </rect><rect fill="#31a851" x="15" y="15" width="30" height="30" rx="3" ry="3">
              <animate attributeName="x" dur="2s" repeatCount="indefinite" keyTimes="0;0.083;0.25;0.333;0.5;0.583;0.75;0.833;1" values="15;55;55;55;55;15;15;15;15" begin="-0.5s"></animate>
              <animate attributeName="y" dur="2s" repeatCount="indefinite" keyTimes="0;0.083;0.25;0.333;0.5;0.583;0.75;0.833;1" values="15;55;55;55;55;15;15;15;15" begin="0s"></animate>
              </rect>
              </svg>`
            },
            { flex: 1}
          ]
        }
      ]
    },
    {
      xtype: 'container',
      layout: {
        type: 'center'
      },
      bind: {
        hidden: '{saving}'
      },
      height: '100%',
      width: '100%',
      items: [
        {
          layout: {
            type: 'vbox',
            align: 'center'
          },
          items: [
            {
              xtype: 'image',
              src: 'resources/simplebmafinish.png',
              width: 350,
              height: 250
            },
            {
              html: '<h2>Дані збережено</h2><p>Співробітник відділу продажів зв\'яжеться з Вами найближчим часом</p><p>На вказану вами електронну адресу відправлено посилання на презентацію сформованої рекламної кампанії</p>'
            }
          ]}
      ]
    }
  ],

  bbar: {
    bind: {
      hidden: '{saving}'
    },
    hidden: true,
    items: [
      {
        scale: 'large',
        ui: 'base-blue',
        text: 'Спланувати ще одну кампанію',
        handler: function (btn) {
          var vm = btn.up('window').lookupViewModel(),
            step = vm.get('step');
          vm.set('step', 1);
          btn.up('window').hide();
        }
      },
      '->',
      {
        scale: 'large',
        ui: 'base-blue',
        text: 'Перейти на сайт Bigmedia',
        handler: function (btn) {
          window.location.href = 'https://www.bigmedia.ua/'
        }
      }
    ]
  }
});
