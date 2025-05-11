export async function POST(request) {
  try {
    const formData = await request.formData();

    const response = await fetch('http://127.0.0.1:8000/forecast_expenses/', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ detail: 'Error processing request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}