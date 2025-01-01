const { Octokit } = require('@octokit/rest');
const { validateAuth } = require('./utils/auth');
const { parseMultipartForm, generateFilename } = require('./utils/file');

exports.handler = async (event, context) => {
  // Only allow POST method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ code: 405, message: 'Method not allowed' })
    };
  }

  try {
    // Parse the multipart form data
    const { fields, files } = await parseMultipartForm(event);
    const auth = fields.auth[0];
    const image = files.image[0];

    // Validate auth key
    try {
      validateAuth(auth);
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({ code: 401, message: 'Unauthorized' })
      };
    }

    // Validate image
    if (!image) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          code: 400, 
          message: 'Image file is required' 
        })
      };
    }

    // Read file content
    const fs = require('fs');
    const fileContent = fs.readFileSync(image.path);
    const fileBase64 = fileContent.toString('base64');

    // Get GitHub credentials from environment variables
    const githubToken = process.env.GITHUB_PAT;
    const [owner, repoName] = process.env.GITHUB_REPO.split('/');

    if (!githubToken || !owner || !repoName) {
      throw new Error('Missing GitHub configuration');
    }

    // Initialize Octokit
    const octokit = new Octokit({
      auth: githubToken
    });

    // Generate filename and upload
    const filename = generateFilename(image.originalFilename);
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo: repoName,
      path: filename,
      message: `Upload ${filename}`,
      content: fileBase64
    });

    // Generate URL using Netlify domain
    const host = event.headers.host;
    const protocol = event.headers['x-forwarded-proto'] || 'https';
    const fileUrl = `${protocol}://${host}/${filename}`;

    return {
      statusCode: 200,
      body: JSON.stringify({
        code: 200,
        url: fileUrl
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        code: 500,
        message: error.message
      })
    };
  }
};