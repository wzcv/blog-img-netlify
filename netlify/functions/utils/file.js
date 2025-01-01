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
      // Split headers and content, keeping the binary data intact
      const headerEnd = part.indexOf('\r\n\r\n');
      if (headerEnd === -1) return;

      const headers = part.slice(0, headerEnd);
      const content = part.slice(headerEnd + 4);
      
      const nameMatch = headers.match(/name="([^"]+)"/);
      const filenameMatch = headers.match(/filename="([^"]+)"/);
      
      if (nameMatch) {
        const name = nameMatch[1];
        if (filenameMatch) {
          // This is a file
          const filename = filenameMatch[1];
          if (!result.files[name]) {
            result.files[name] = [];
          }
          result.files[name].push({
            originalFilename: filename,
            content: content,
            contentType: headers.match(/Content-Type: ([^\r\n]+)/)?.[1]
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

  // Convert base64 to binary while preserving binary data
  const body = Buffer.from(event.body, 'base64').toString('binary');
  return parseMultipartFormData(body, boundary);
};

exports.generateFilename = (originalFilename) => {
  const timestamp = new Date().getTime();
  const fileExtension = originalFilename.split('.').pop();
  return `img/${timestamp}.${fileExtension}`;
};