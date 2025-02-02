export async function sendConfirmationSMS(phone: string, name: string, date: string) {
  try {
    const response = await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({phone, name, date}),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to send SMS');
    }

    return data;
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    throw error;
  }
} 