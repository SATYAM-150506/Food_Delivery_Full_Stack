module.exports = {
  service: process.env.MAIL_SERVICE || 'gmail',
  user: process.env.MAIL_USER || 'your_email@gmail.com',
  pass: process.env.MAIL_PASS || 'your_email_password',
  from: process.env.MAIL_FROM || 'support@fooddelivery.com'
};
