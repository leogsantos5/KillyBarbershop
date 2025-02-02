import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export async function POST(request: Request) {
  try {
    const { phone, name, date } = await request.json();

    const message = await client.messages.create({
      body: `Olá ${name}, a sua marcação para ${date} foi registada. Aguarde confirmação dos barbeiros.`,
      from: twilioPhone,
      to: phone
    });

    return NextResponse.json({ success: true, messageId: message.sid });
  } catch (error: unknown) {
    console.error('SMS sending error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 