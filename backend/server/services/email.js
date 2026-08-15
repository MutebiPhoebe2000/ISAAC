const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

async function sendMail(options) {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  if (!process.env.BREVO_API_KEY || !from) {
    console.warn(`[email] BREVO_API_KEY/EMAIL_FROM not configured — skipping email to ${options.to} ("${options.subject}")`);
    return { ok: false, error: "Email service is not configured." };
  }

  const payload = {
    sender: { email: from },
    to: [{ email: options.to }],
    subject: options.subject,
    textContent: options.text,
    ...(options.attachments && {
      attachment: options.attachments.map((attachment) => ({
        name: attachment.filename,
        content: Buffer.isBuffer(attachment.content)
          ? attachment.content.toString("base64")
          : attachment.content
      }))
    })
  };

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Brevo API responded with ${response.status}: ${errorBody}`);
    }
    return { ok: true };
  } catch (error) {
    console.error(`[email] Failed to send "${options.subject}" to ${options.to}:`, error.message);
    return { ok: false, error: error.message };
  }
}

async function sendRegistrationEmail(user) {
  return sendMail({
    to: user.email,
    subject: "Registration Successful – African Youth Summit 2026",
    text: `Dear ${user.fullName},\n\n`
      + "Thank you for registering for the African Youth Summit 2026. Your registration has been received successfully. "
      + "Our team will review your application and contact you once it has been approved.\n\n"
      + "Warm regards,\nAYS Organizing Team"
  });
}

async function sendApprovalEmail(user) {
  return sendMail({
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
  return sendMail({
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

async function sendCustomEmail(to, subject, text) {
  return sendMail({ to, subject, text });
}

/**
 * Branded activity/announcement email sent by an admin to one delegate.
 * title/message are expected to already be stripped of any HTML tags (and of
 * any redundant admin-typed greeting/sign-off) by the caller.
 */
async function sendActivityEmail(user, title, message) {
  return sendMail({
    to: user.email,
    subject: `[AYS 2026] ${title}`,
    text: "African Youth Summit 2026\n\n"
      + `${title}\n\n`
      + `Dear ${user.fullName},\n\n`
      + `${message}\n\n`
      + "Regards,\nAfrican Youth Summit 2026 Committee"
  });
}

module.exports = {
  sendRegistrationEmail,
  sendApprovalEmail,
  sendInvitationLetterEmail,
  sendCustomEmail,
  sendActivityEmail
};
