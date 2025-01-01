const multiparty = require('multiparty');

// File parsing utility
exports.parseMultipartForm = (event) => {
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form();
    form.parse(event, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

// Generate unique filename
exports.generateFilename = (originalFilename) => {
  const timestamp = new Date().getTime();
  const fileExtension = originalFilename.split('.').pop();
  return `img/${timestamp}.${fileExtension}`;
};