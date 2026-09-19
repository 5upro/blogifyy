require("dotenv").config({ path: "../.env" });

const nodemailer = require("nodemailer");
const brevoTransport = require("nodemailer-brevo-transport");

const BREVO_API_KEY = process.env.BREVO_API_KEY;

if (!BREVO_API_KEY) {
  console.error("Error: BREVO_API_KEY is not set in .env file");
  process.exit(1);
}

const transporter = nodemailer.createTransport(
  new brevoTransport({
    apiKey: BREVO_API_KEY
  })
);

/**
 * Send a contact confirmation email to the user.
 * @param {{ name: string, email: string, subject: string, message: string }} contactData
 */
async function sendContactConfirmation({ name, email, subject, message }) {
  const info = await transporter.sendMail({
    from: '"Blogify" <noreply-blogify@surajitsen.live>',
    to: `"${name}" <${email}>`,
    subject: "Thanks for contacting Blogify",
    html: `
      <h3>Hello ${name},</h3>
      <p>Thank you for reaching out to <b>Blogify</b>.</p>
      <p>We have received your message regarding "<b>${subject}</b>" and will get back to you soon.</p>
      <br/>
      <p>Best regards,<br>Blogify Team</p>
    `
  });

  return info;
}

module.exports = { transporter, sendContactConfirmation };
