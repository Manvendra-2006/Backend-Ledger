import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});
// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export async function sendRegistrationEmail(userEmail,name){
    const subject = 'Welcome to Backend Ledger'
    const text = `Hello ${name} , \n \n Thank you for registering at Backend Ledger . We are excited to have you on board \n \n Best regards , \n The Backend Ledger Team`
    const html = `<p>Hello ${name},</p><p>Thank you for registering at Backend Ledger, We're excited to have you on board!</p><p>Best Regards,<br>The Backend Ledger Team</p>`
    await sendEmail(userEmail,subject,text,html)
}

export async function sendtransactionEmail(
   userEmail,
   name,
   amount,
   toAccount
){
   const subject = "Transaction Successful"

   const text = `Hello ${name}, \n\n Your transaction was completed successfully. \n\n Amount Transferred: ₹${amount} \n Transferred To Account: ${toAccount} \n\n Thank you for using Backend Ledger. \n\n Best Regards, \n The Backend Ledger Team`

   const html = `
      <p>Hello ${name},</p>

      <p>Your transaction was completed successfully.</p>

      <p><b>Amount Transferred:</b> ₹${amount}</p>

      <p><b>Transferred To Account:</b> ${toAccount}</p>

      <p>Thank you for using Backend Ledger.</p>

      <p>
         Best Regards,<br>
         The Backend Ledger Team
      </p>
   `

   await sendEmail(userEmail, subject, text, html)
}
