exports.handler = async (event) => {
  // Extract client IP address from Netlify header fields
  const clientIp = event.headers['client-ip'] || 
                   event.headers['x-nf-client-connection-ip'] || 
                   event.headers['x-forwarded-for'] || 
                   '127.0.0.1';
  
  // Clean up comma-separated IPs (e.g. if x-forwarded-for has multiple proxies)
  const cleanIp = clientIp.split(',')[0].trim();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, OPTIONS'
    },
    body: JSON.stringify({ ip: cleanIp }),
  };
};
