exports.generateFileUrl = (filename) => {
  const urlPrefix = process.env.URL_PREFIX;
  if (!urlPrefix) {
    throw new Error('URL_PREFIX environment variable is not set');
  }
  return `${urlPrefix}/${filename}`;
};

exports.generateDeleteUrl = (filename, auth) => {
  const baseUrl = process.env.URL_PREFIX;
  if (!baseUrl) {
    throw new Error('URL_PREFIX environment variable is not set');
  }
  return `${baseUrl}/api/delete-from-github?name=${filename}&auth=${auth}`;
};