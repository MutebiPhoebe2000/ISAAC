const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    requireTLS: Number(process.env.EMAIL_PORT) !== 465,
    family: 4,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  return transporter;
}

async function sendMail(options) {
  const activeTransporter = getTransporter();
  if (!activeTransporter) {
    console.warn(`[email] EMAIL_HOST/EMAIL_USER/EMAIL_PASS not configured — skipping email to ${options.to} ("${options.subject}")`);
    return;
  }
  try {
    await activeTransporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      ...options
    });
  } catch (error) {
    console.error(`[email] Failed to send "${options.subject}" to ${options.to}:`, error.message);
  }
}

async function sendRegistrationEmail(user) {
  await sendMail({
    to: user.email,
    subject: "Registration Successful – African Youth Summit 2026",
    text: `Dear ${user.fullName},\n\n`
      + "Thank you for registering for the African Youth Summit 2026. Your registration has been received successfully. "
      + "Our team will review your application and contact you once it has been approved.\n\n"
      + "Warm regards,\nAYS Organizing Team"
  });
}

async function sendApprovalEmail(user) {
  await sendMail({
    to: user.email,
    subject: "Congratulations! Your Registration Has Been Approved",
    text: `Dear ${user.fullName},\n\n`
      + "Congratulations!\n\n"
      + "Your application for the African Youth Summit 2026 has been approved.\n\n"
      + "We look forward to welcoming you to Mombasa. You may now log into your dashboard to access your participant information.\n\n"
      + "Warm regards,\nAYS Organizing Team"
  });
}

async function sendInvitationLetterEmail(user, attachmentBuffer, fileName, mimeType) {
  await sendMail({
    to: user.email,
    subject: "Your African Youth Summit 2026 invitation letter",
    text: `Dear ${user.fullName},\n\n`
      + "Please find attached your official invitation letter for the African Youth Summit 2026. "
      + "You can also download it anytime from your participant dashboard.\n\n"
      + "Warm regards,\nAYS Organizing Team",
    attachments: [
      {
        filename: fileName || "Invitation_Letter.pdf",
        content: attachmentBuffer,
        contentType: mimeType || "application/pdf"
      }
    ]
  });
}

module.exports = { sendRegistrationEmail, sendApprovalEmail, sendInvitationLetterEmail };
