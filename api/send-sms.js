const twilio = require('twilio');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const accountSid = 'ACfb4504ebd8798db19c0f1f16abeb2520';
  const authToken = '71a3fa47412b2c9dfb3d9c576b8bca16';
  const client = twilio(accountSid, authToken);

  try {
    const { phoneNumber, message } = req.body;
    
    const result = await client.messages.create({
      body: message,
      from: '+14352918193',
      to: `+351${phoneNumber}`
    });

    console.log('SMS sent:', result.sid);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Twilio error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
} 