const sendConfirmationSMS = async (phoneNumber) => {
  try {
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phoneNumber,
        message: 'A sua reserva foi registada no nosso sistema e está a aguardar confirmação dos barbeiros. Receberá uma mensagem assim que for confirmada.'
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao enviar SMS');
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

export default sendConfirmationSMS; 