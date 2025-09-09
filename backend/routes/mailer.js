const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const sendMail=(to, subject, text, html) => {
    const mailOptions = {
        from: process.env.EMAIL, to, subject, text, html
    }
    return transporter.sendMail(mailOptions)

}

module.exports=sendMail