const partners = {
  dneprovision: {
    active: true,
      name: 'Днепровижн',
      transport: 'email',
      email: {
          addresses: ['kisliy@prospect.net.ua', 'director@dpv.com.ua']
      }
  },
  sas: {
    active: true,
      name: 'САС',
      transport: 'email',
      email: {
        names: ['Михаил Лапко'],
        addresses: ['misha@sas.com.ua','mihaillapko@gmail.com']
      }
  },
  vial: {
    active: true,
      name: 'Виал Медиа',
      transport: 'email',
      email: {
          addresses: ['buzunov@vial.kharkov.ua']
      },
      templateExt: 'xls'
  },
  bioforce: {
    active: true,
      name: 'Биофорс',
      transport: 'email',
      email: {
          addresses: ['manager@dneproutdoor.com', 'manager1@dneproutdoor.com']
      }
  },
  naruzhka: {
    active: true,
      name: 'Наружка',
      transport: 'email',
      email: {
          addresses: ['info@naruzhka.co.ua']
      }
  },
  klo: {
    active: true,
      name: 'A-Petrol',
      transport: 'email',
      email: {
        names: ['Ната Литвинова'],
        addresses: ['litvin.n@klo.ua', 'shytikov.r@klo.ua', 'tatochka35@gmail.com', 'shytikov.r@gmail.com']
      }
  },
  // city: {
  //   active: true,
  //     name: 'City Media Group',
  //     transport: 'email',
  //     email: {
  //         addresses: ['katya@outdoor.dp.ua']
  //     }
  // },
  gk: {
    active: true,
      name: 'Галицькі Контракти',
      transport: 'email',
      email: {
          addresses: ['kiril.obukhovsky@ura.com.ua']
      }
  },
  bonamente: {
    active: true,
      name: 'Бона Менте',
      transport: 'ftp',
      ftp: {
          host: '31.41.216.88',
          user: 'outhub@bomond.od.ua',
          password: 'outhub'
      },
      fileName: 'Bomond.xml'
  },
  perekhid: {
    active: true,
      name: 'Перехид Аутдор ДП',
      transport: 'email',
      email: {
          addresses: ['1c-po@perekhid-outdoor.com.ua']
      },
      templateExt: 'xls'
   // transport: 'ftp',
      // ftp: {
      //     host: 'ftp.p-o.com.ua',
      //     user: 'puser_ftp',
      //     password: 'kzS2JZi1C4'
      // },
      // fileName: 'OUTHUB_Perekhid.xls'
  },
  swoutdoor: {
    active: true,
    name: 'СВ Аутдор',
    // transport: 'email',
    // email: {
    //   addresses: ['mpogosov@sv-outdoor.com.ua'],
    //   names: ['Михаил Погосов']
    // }
    // transport: 'ftp',
    // ftp: {
    //     host: '92.60.180.13',
    //     user: 'SWOutdoor',
    //     password: 'SKUrnoRc'
    // },
    transport: 'https',
    fileName: 'www.sv-outdoor.com/export_panels.txt',
    encoding: 'cp1251',
    format: {
      separator: ';',
      fields: ['orig_side_num','orig_city','orig_address','orig_light','orig_catab','active'],
      fromCurrentMonth: true,
      freeFlag: 'F',
      reservFlag: 'R',
      soldFlag: 'B',
      replaceFirstLetter: true
    }
  },
  sean: {
    active: true,
      name: 'Сеан',
      transport: 'ftp',
      ftp: {
          host: '94.158.150.198',
          port: 21,
          user: 'bronmedia',
          password: 'wXV628ht'
      },
      fileName: 'Saled.xls'
  },
  luvers: {
    active: true,
    name: 'Луверс',
    transport: 'https',
    format: {
      separator: ';',
      fields: ['orig_id', 'orig_side_num'],
      fromCurrentMonth: true,
      freeFlag: '',
      reservFlag: 'r',
      soldFlag: '1',
      replaceFirstLetter: false
    },
    fileName: 'db.luvers.com.ua/spec.php'
  },
  octagon: {
    active: true,
    name: 'Octagon Outdoor',
    transport: 'https',
    fileName: 'online.octagon.com.ua/api/big-media.php',
    fileInventoryName: 'online.octagon.com.ua/api/big-media-inventar.php',
    http: {
      user: 'null',
      password: 'BqUgLv9K25MdVU'
    },
    // out: {
    //   stockFileName: '/var/www/html/octagon/bigmedia_inventory.xlsx',
    //   occupancyFileName: '/var/www/html/octagon/bigmedia_occupancy.xlsx'
    // }
  },
  rtm: {
    active: true,
    name: 'РТМ-Украина',
    transport: 'http',
    fileName: 'www.rtm.com.ua/!os/bb.media/bb_rtmoccupation.xlsx',
    fileInventory: [ 
        'www.rtm.com.ua/!os/bb.media/bb_rtmmodel.xlsx',
        'www.rtm.com.ua/!os/bb.media/bb_rtmmodel_BM.xlsx'
    ],
    http: {
      user: 'bmedia',
      password: 'Mkr2tZlg'
    },
    out: {
      // ftp: {
      //   host: '92.60.180.13',
      //   user: 'bma',
      //   password: 'gyXQ8SZu'
      // },
      stockFileName: '/var/www/html/rtm/bigmedia_inventory.xlsx',
      occupancyFileName: '/var/www/html/rtm/bigmedia_occupancy.xlsx',
      statisticFileName: '/var/www/html/rtm/bigmedia_statistic.xlsx',
      serviceFileName: '/var/www/html/rtm/bigmedia_service.xlsx',
      // stockFileName: 'RTM/bigmedia_inventory.xlsx',
      // occupancyFileName: 'RTM/bigmedia_occupancy.xlsx'
    }
  },
  rs: {
    active: true,
      name: 'Реклама Сервис',
      transport: 'email',
      email: {
          addresses: ['board@rs.zp.ua']
      },
    templateExt: 'xlsx'
  },
  commerce: {
    active: true,
      name: 'Коммерц Эволюшн',
      transport: 'email',
      email: {
          addresses: ['juliapoltava777@gmail.com']
      }
  },
  eliziya: {
    active: true,
    name: 'ЭЛИЗИЯ',
    transport: 'https',
    fileName: 'eliziya.com/files/status.xml'
  },
  zgia: {
    active: true,
      name: 'ЗГИА',
      transport: 'email',
      email: {
          names: ['Алексей Котяхов'],
          addresses: ['zmia-alex@ukr.net']
      }
  },
  goldFuture: {
    active: true,
      name: 'Gold Future',
      transport: 'email',
      email: {
          names: ['Виталий Гриц', 'Оксана Михайленко'],
          addresses: ['xtrpower@gmail.com', 'oksanam054@gmail.com']
      }
  },
  dovira: {
    active: true,
    name: 'Довира Аутдор',
    transport: 'email',
    email: {
      names: ['Оксана Станишевская'],
      addresses: ['o.stanishevska@1plus1.tv']
    }
  },
  cityRtm: {
    active: true,
    name: 'СИТИ-РТМ',
    transport: 'email',
    // transport: 'http',
    // fileName: 'rtm.com.ua/bb.media/bb_rtmoccupation.xlsx',
    // http: {
    //     user: 'bmedia',
    //     password: 'Mkr2tZlg'
    // },
    email :{
      addresses:['mila-siti@te.net.ua']
    },
    templateExt: 'xls'
  },
  alhor: {
    active: true,
    name: 'Альхор Аутдор',
    transport: 'email',
    email: {
      names: ['Елена Костенко'],
      addresses: ['olena@alhor.kyiv.ua','elena@alhor.kiev.ua', 'elena@alhor-outdoor.com']
    }
  },
  bumerang: {
    active: true,
    name: 'Бумеранг',
    transport: 'email',
    email: {
      names: ['Александра Щербатюк'],
      addresses: ['bumeranguzh@gmail.com']
    },
    templateExt: 'xls'
  },
  stReklama: {
    active: true,
    name: 'СТ-Реклама',
    transport: 'email',
    email: {
      // names: ['Александра Щербатюк'],
      addresses: ['st.recklama@gmail.com']
    }
  },
  billboard: {
    active: true,
    name: 'Биллборд',
    transport: 'email',
    email: {
      names: ['Голубченко Виктор'],
      addresses: ['golybchenko@gmail.com']
    }
    // ,
    // templateExt: 'xls'
  },
  fabrikaReklamy: {
    active: true,
    name: 'Фабрика Рекламы',
    transport: 'email',
    email: {
      names: ['Кира Захарова'],
      addresses: ['clearline@ukr.net']
    },
    templateExt: 'xls'
  },
  wildWest: {
    active: true,
    name: 'Дикий Запад',
    transport: 'email',
    email: {
      names: ['Олег Хомик'],
      addresses: ['akva2007if@gmail.com']
    },
    templateExt: 'xls'
  },
  krash: {
    active: true,
    name: 'Краш',
    transport: 'email',
    email: {
      // names: [],
      addresses: ['m1@krash.kiev.ua']
    }
  },
  bordyUkrayiny: {
    active: true,
    name: 'Борды Украины Медиа',
    transport: 'email',
    email: {
      names: ['Алена Журавлева'],
      addresses: ['sale-bordy@ukr.net']
    },
    templateExt: 'xls'
  },
  technopark: {
    active: true,
    name: 'Технопарк',
    transport: 'email',
    email: {
      names: ['Евгений Поддубный'],
      addresses: ['evgenii.poddubnyi@technoparkltd.com.ua', 'sales@technoparkltd.com.ua']
    }
  },
  boyko: {
    active: true,
    name: 'Бойко ФОП',
    transport: 'email',
    email: {
      names: ['Владимир Бойко'],
      addresses: ['boiko.tur@gmail.com']
    }
  },
  bigInfo: {
    active: true,
    name: 'БИГ-ИНФО',
    transport: 'email',
    email: {
      names: ['Андрей Григоров'],
      addresses: ['rabiginfo@gmail.com']
    }
  },
  artRadio: {
    active: true,
    name: 'Арт Радио',
    transport: 'email',
    email: {
      names: ['Лилия Мазур'],
      addresses: ['lilia.artradio@gmail.com']
    }
  },
  namenanikFOP: {
    active: true,
    name: 'Наменанік ФОП',
    transport: 'email',
    email: {
      addresses: ['namenanik@gmail.com']
    }
  },
  IDMedia: {
    active: true,
    name: 'IDMedia',
    transport: 'email',
    email: {
      names: ['Дмитрий Давидчук'],
      addresses: ['dmitriy.davidchuk@idmedia.com.ua']
    }
  },
  MediaGroup: {
    active: true,
    name: 'Медіа груп',
    transport: 'email',
    email: {
      addresses: ['mediabord@gmail.com']
    }
  },
  BFGPromotion: {
    active: true,
    templateExt: 'xls',
    name: 'BFG Promotion',
    transport: 'email',
    email: {
      addresses: ['mail@spyboard.com.ua']
    }
  },
  Cityboard: {
    active: true,
    name: 'СІТІ БОРД ДНІПРО',
    transport: 'email',
    email: {
      addresses: ['advboarddp@gmail.com']
    },
    templateExt: 'xls'
  },
  ADVExpert: {
    active: false,
    name: 'ADV Expert',
    transport: 'email',
    email: {
      addresses: ['vbr013@gmail.com']
    }
  },
  RAImage: {
    active: true,
    name: 'Імідж',
    transport: 'email',
    email: {
      names: ['Фесак Вікторія'],
      addresses: ['office@image-outdoor.com.ua']
    }
  },
  Acvarium: {
    active: true,
    name: 'Акваріум',
    transport: 'email',
    email: {
      names: ['Halyna Soroka'],
      addresses: ['h.soroka@akvarium.pro']
    }
  }
}

module.exports = partners
