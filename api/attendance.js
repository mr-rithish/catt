export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { htno, password } = req.query;

  if (!htno || !password) {
    return res.status(400).json({ error: 'HTNO and password are required' });
  }

  try {
    const apiUrl = `https://api.vce75.me/get_student_data?htno=${htno}&password=${password}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
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
