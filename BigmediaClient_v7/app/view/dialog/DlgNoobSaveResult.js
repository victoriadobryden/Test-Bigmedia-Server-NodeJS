Ext.define('Bigmedia.view.dialog.DlgNoobSaveResult',{
  extend: 'Bigmedia.view.dialog.MaterialDialog',

  requires: [
    'Bigmedia.view.dialog.DlgNoobSaveResultController'
  ],

  controller: 'dialog-dlgnoobsaveresult',

  title: 'Зберегти кампанію',

  modal: true,
  closeAction: 'destroy',

  autoSize: true,
  width: 340,
  // height: 504,
  layout: {
    type: 'vbox',
    align: 'middle'
  },
  scrollable: 'y',
  // setting the background of the container
  // style: 'background-color: var(--base-color)',

  items: [
    {
      xtype: 'form',
      // width: 340,
      // height: 474,
      reference: 'formCheckout',
      layout: {
        type: 'vbox',
        align: 'middle'
      },
      bodyPadding: 30,
      items: [
        {
          xtype: 'image',
          height: 40,
          width: 235,
          margin: '0 0 0 0',
          alt: 'bma-logo-image',
          src: 'resources/images/bma.png'
        },
        // {
        //   xtype: 'component',
        //   margin: '10 0 0 0',
        //   width: 280,
        //   html: 'Forgot Your Password?',
        //   style: {
        //     'font-size': '24px',
        //     'text-align': 'center'
        //   }
        // },
        {
          xtype: 'component',
          margin: '14 0 0 0',
          width: 260,
          html: 'Вкажіть електронну адресу, на яку ми відправимо Вам посилання на вибрану рекламну кампанію',
          style: {
            'font-size': '14px',
            'text-align': 'center',
            'line-height': '1.4',
            // 'letter-spacing': '0.5px'
          }
        },
        {
          xtype: 'component',
          reference: 'formSendFailure',
          tpl: '<tpl if="errors.length">' +
          '<span class="x-fa fa-exclamation-circle" style="color: red;">' +
          ' EMAIL ALREADY EXISTS</span>' +
          '</tpl>',
          height: 26,
          width: 260,
          margin: '7 0 0 0',
          style: {
            'font-size': '20px',
            'text-align': 'center',
            'letter-spacing': '0.25px',
            'font-weight': '500'
          }
        },
        {
          xtype: 'textfield',
          allowBlank: false,
          required: true,
          width: 260,
          margin: '24 0 0 0',
          fieldLabel: 'Email',
          msgTarget: 'qtip',
          reference: 'useremail',
          name: 'useremail',
          placeholder: 'user@example.com',
          vtype: 'email',
          responsiveConfig: {
            'desktop': {
              msgTarget: 'side'
            }
          }
        },
        {
          xtype: 'textfield',
          allowBlank: true,
          required: false,
          width: 260,
          margin: '24 0 0 0',
          fieldLabel: 'Телефон',
          msgTarget: 'qtip',
          name: 'userphone',
          reference: 'userphone',
          placeholder: '(xxx)xxx-xx-xx',
          responsiveConfig: {
            'desktop': {
              msgTarget: 'side'
            }
          }
        }
        // {
        //   xtype: 'button',
        //   text: 'Відправити',
        //   autoSize: true,
        //   margin: '30 0 0 0',
        //   height: 30,
        //   width: 280,
        //   handler: 'onSendClick',
        //   style: {
        //     'letter-spacing': '1.25px',
        //     'font-size': '14px'
        //   }
        // },
        // {
        //   xtype: 'component',
        //   height: 30,
        //   margin: "20 0 0 0",
        //   width: 280,
        //   style: {
        //     'font-size': '14px',
        //     'text-align': 'center',
        //     'letter-spacing': '1.09px'
        //   },
        //   html: "<a style='color: var(--base-color);text-decoration: none;' href='#'>Відмінити</a>"
        // }
      ],
      buttons: [{
        text: 'Відправити',
        disabled: true,
        formBind: true,
        handler: 'onSendClick'
      }]
    }
    // ,
    // {
    //   xtype: 'component',
    //   margin: "4 0 0 0",
    //   width: 280,
    //   style: {
    //     'font-size': '16px',
    //     'text-align': 'center',
    //     'color': 'var(--base-foreground-color)',
    //     'letter-spacing': '1.25px'
    //   },
    //   html: 'Don’t have an account?' +
    //   "<a style='font-weight:bold;color:var(--base-foreground-color);text-decoration: none;' href='#template-create-account'> Sign-Up</a>"
    // }
  ]
});
