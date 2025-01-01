exports.generateFileUrl = (filename) => {
  const urlPrefix = process.env.URL_PREFIX;
  if (!urlPrefix) {
    throw new Error('URL_PREFIX environment variable is not set');
  }
  return `${urlPrefix}/${filename}`;
};