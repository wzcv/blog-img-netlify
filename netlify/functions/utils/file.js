const parseMultipartFormData = (body, boundary) => {
  // Split the body into parts using the boundary
  const parts = body.split(`--${boundary}`);
  const result = {
    fields: {},
    files: {}
  };

  // Process each part
  parts.forEach(part => {
    if (part.includes('Content-Disposition: form-data;')) {
      const [headers, content] = part.split('\r\n\r\n');
      const nameMatch = headers.match(/name="([^"]+)"/);
      const filenameMatch = headers.match(/filename="([^"]+)"/);
      
      if (nameMatch) {
        const name = nameMatch[1];
        if (filenameMatch) {
          // This is a file
          const filename = filenameMatch[1];
          const fileContent = content.trim();
          if (!result.files[name]) {
            result.files[name] = [];
          }
          result.files[name].push({
            originalFilename: filename,
            content: fileContent
          });
        } else {
          // This is a field
          const value = content.trim();
          if (!result.fields[name]) {
            result.fields[name] = [];
          }
          result.fields[name].push(value);
        }
      }
    }
  });

  return result;
};

exports.parseMultipartForm = (event) => {
  const contentType = event.headers['content-type'] || '';
  const boundary = contentType.split('boundary=')[1];
  
  if (!boundary) {
    throw new Error('No multipart boundary found');
  }

  const body = Buffer.from(event.body, 'base64').toString();
  return parseMultipartFormData(body, boundary);
};

exports.generateFilename = (originalFilename) => {
  const timestamp = new Date().getTime();
  const fileExtension = originalFilename.split('.').pop();
  return `img/${timestamp}.${fileExtension}`;
};