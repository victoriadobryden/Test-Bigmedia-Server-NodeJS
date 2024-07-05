const nodemailer = require('nodemailer')
const config = require('../config')
const { getFromDB } = require('./database')
const partners = require('../config/partners')

async function sendNotifications () {
    const data = await getFromDB('exec sp_web_platform_partners_occ_stat')
    const now = new Date()
    const deadline = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const allPartners = data.recordset
    const debtors = allPartners.filter((partner)=>{
        return partner['last_update'] < deadline && Object.values(partners).some((configPartner)=>configPartner.name===partner.name && configPartner.email)
    })
    // console.log(htmlTable);
    const message = {
        subject: 'Актуальна сітка',
        // to: 'ustiloff@bigboard.ua',
        text: 'Пришліть, будь ласка, свіжу сітку'
    }
    debtors.forEach(async (debtor)=>{
        const lastString = debtor.last_update ? debtor.last_update.toLocaleString('UA') : ''
        Object.values(partners).forEach((p)=>{
            if (debtor.name === p.name) {
                message.to = p.email.addresses.join(';')
            }
        })
        // message.to = debtor.email.addresses.join(';')
        if (!message.to) {
            message.to = 'ustiloff@bigboard.ua'
        }
        message.html = `<p>Доброго дня</p><p>Останній раз, коли ми отримали від Вас сітку, був ${lastString}</p><p>Відправте, будь ласка, актуальну сітку у відповідь на цей лист.</p><p>Дякую. Щиро Ваш, BMA робот 🤖</p><p><br>PS. Не намагайтеся вести переписку використовуючи цю адресу. Я розумію тільки листи з прикріпленими сітками :-)<br>Натомість, якщо у Вас виникли запитання, звертайтеся за адресою <a href="mailto:ilya.kiselov@bigmedia.ua">ilya.kiselov@bigmedia.ua</a></p><p>PPS. Я не буду набридати Вам листами, якщо буду отримувати від Вас сітку кожного робочого дня до 11:00</p>`;
        await sendEmail(message)
    })
}

async function sendStatus () {
    const data = await getFromDB('exec sp_web_platform_partners_occ_stat')
    const allPartners = data.recordset
    const htmlTable = allPartners.reduce((html, partner)=>{
        let partnerEmails = '', sendToPartner = ''
        Object.values(partners).forEach((configPartner) => {
            if (configPartner.name === partner.name && configPartner.email) {
                partnerEmails = configPartner.email.addresses.join(';')
            }
        })
        if (partnerEmails) {
            sendToPartner = '<a href="mailto:' + partnerEmails + '">Нагнути матюків</a>'
        }
        partner.last_update = partner.last_update ? partner.last_update.toLocaleString('UA') : ''
        return html + '<tr><td>' + Object.values(partner).join('</td><td>') + '</td><td>' + sendToPartner + '</td></tr>'
    }, '<table border="1"><tr><td>' + Object.keys(allPartners[0]).join('</td><td>') + '</td><td></td></tr>') + '</table>'
    const message = {
        subject: 'Статистика активності партнерів в системі',
        // to: 'ustiloff@bigboard.ua',
        to: config.adminEmails.join(';'),
        text: 'Таблиця актуальності даних',
        html: '<p>Доброго дня. Ось що маємо на даний момент:</p><p>' + htmlTable + '</p><p><br>Have a nice day</p><p>Sincerely yours, BMA Robot 🤖</p>'
    }
    await sendEmail(message)
}

async function sendEmail (opts) {
    let transporter = nodemailer.createTransport({
        host: config.mail.host,
        port: 2525,
        ignoreTLS: true,
        auth: {
            user: config.mail.user,
            pass: config.mail.password
        }
    })

    const msgOpts = Object.assign(opts, {from: '"BMA robot 🤖" <' + config.mail.user + '>'})

    let info = await transporter.sendMail(
        msgOpts
        // {
        // from: '"Fred Foo 👻" <foo@example.com>', // sender address
        // to: 'bar@example.com, baz@example.com', // list of receivers
        // subject: 'Hello ✔', // Subject line
        // text: 'Hello world?', // plain text body
        // html: '<b>Hello world?</b>' // html body
        // }
    );

    console.log('Message sent: %s', info.messageId);
}

module.exports = { sendEmail, sendNotifications, sendStatus}
