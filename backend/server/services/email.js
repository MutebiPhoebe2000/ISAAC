const RESEND_API_URL = "https://api.resend.com/emails";

async function sendMail(options) {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  if (!process.env.RESEND_API_KEY || !from) {
    console.warn(`[email] RESEND_API_KEY/EMAIL_FROM not configured — skipping email to ${options.to} ("${options.subject}")`);
    return;
  }

  const payload = {
    from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    ...(options.attachments && {
      attachments: options.attachments.map((attachment) => ({
        filename: attachment.filename,
        content: Buffer.isBuffer(attachment.content)
          ? attachment.content.toString("base64")
          : attachment.content
      }))
    })
  };

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Resend API responded with ${response.status}: ${errorBody}`);
    }
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
