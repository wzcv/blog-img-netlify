exports.generateFileUrl = (filename) => {
  const urlPrefix = process.env.URL_PREFIX;
  if (!urlPrefix) {
    throw new Error('URL_PREFIX environment variable is not set');
  }
  return `${urlPrefix}/${filename}`;
};

exports.generateDeleteUrl = (event, filename, auth) => {
  // Get host and protocol from the request headers
  const host = event.headers.host;
  const protocol = event.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${protocol}://${host}`;
  
  return `${baseUrl}/api/delete-from-github?name=${filename}&auth=${auth}`;
};