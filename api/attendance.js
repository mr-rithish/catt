export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { htno, password } = req.body || {};

  if (!htno || !password) {
    return res.status(400).json({ error: 'HTNO and password are required' });
  }

  try {
    const apiUrl = `https://vce-ckdjcdajdfgedhcm.centralindia-01.azurewebsites.net/get_student_data`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ htno, password }),
    });

    if (!response.ok) {
      return res.status(401).json({ error: 'Invalid HTNO or password' });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Login failed. Please check your credentials.' });
  }
}
