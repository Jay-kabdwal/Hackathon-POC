import nodemailer from "nodemailer";

type RegistrationConfirmation = {
  leaderName: string;
  leaderEmail: string;
  teamName: string;
  teamNumber: number;
};

type JudgeOtpEmail = {
  judgeName: string;
  judgeEmail: string;
  otp: string;
  expiresInMinutes: number;
};

function logSmtpError(error: unknown): void {
  if (typeof error !== "object" || error === null) {
    console.error("Email delivery failed: SMTP returned an unknown error.");
    return;
  }

  const smtpError = error as {
    name?: unknown;
    message?: unknown;
    code?: unknown;
    responseCode?: unknown;
    command?: unknown;
  };

  console.error("Email delivery failed:", {
    name: typeof smtpError.name === "string" ? smtpError.name : undefined,
    message:
      typeof smtpError.message === "string" ? smtpError.message : undefined,
    code: typeof smtpError.code === "string" ? smtpError.code : undefined,
    responseCode:
      typeof smtpError.responseCode === "number"
        ? smtpError.responseCode
        : undefined,
    command:
      typeof smtpError.command === "string" ? smtpError.command : undefined,
  });
}

async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
}): Promise<boolean> {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM;
  if (!smtpUser || !smtpPass || !from) {
    console.error(
      "Email was not sent: SMTP_USER, SMTP_PASS, and EMAIL_FROM are required.",
    );
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
    });
    return true;
  } catch (error) {
    logSmtpError(error);
    return false;
  }
}

export function sendRegistrationConfirmationEmail({
  leaderName,
  leaderEmail,
  teamName,
  teamNumber,
}: RegistrationConfirmation): Promise<boolean> {
  return sendEmail({
    to: leaderEmail,
    subject: `Hackathon Registration Confirmed — Team ${teamNumber}`,
    text: [
      `Hello ${leaderName},`,
      "",
      `Your team "${teamName}" has been registered successfully.`,
      `Your team number is ${teamNumber}.`,
      "",
      "Please keep this number for future hackathon communication.",
    ].join("\n"),
  });
}

export function sendJudgeOtpEmail({
  judgeName,
  judgeEmail,
  otp,
  expiresInMinutes,
}: JudgeOtpEmail): Promise<boolean> {
  return sendEmail({
    to: judgeEmail,
    subject: "Your hackathon judge verification code",
    text: [
      `Hello ${judgeName},`,
      "",
      `Your verification code is ${otp}.`,
      `This code expires in ${expiresInMinutes} minutes.`,
      "",
      "If you did not request this code, you can ignore this email.",
    ].join("\n"),
  });
}
