export async function sendConfirmationSMS(phone: string, name: string, date: string): Promise<boolean> {
  try {
    const response = await fetch('/api/sendSMS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, name, date }),
    });

    if (!response.ok) {
      throw new Error('Failed to send SMS');
    }

    return true;
  } catch (error: unknown) {
    console.error('Error sending SMS:', error instanceof Error ? error.message : 'Unknown error');
    throw error instanceof Error ? error : new Error('Failed to send SMS');
  }
} 