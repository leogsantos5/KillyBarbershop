import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email, name, code } = await req.json();

    const transporter = nodemailer.createTransport({
      // Your email service config
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verificação de novo barbeiro - Barbearia Killy Ross',
      html: `
        <h1>Olá ${name}!</h1>
        <p>Seu código de verificação é: <strong>${code}</strong></p>
        <p>Use este código para verificar sua conta.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
