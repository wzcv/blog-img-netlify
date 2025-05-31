const { validateAuth } = require('./utils/auth');
const { parseMultipartForm, generateFilename } = require('./utils/file');
const { generateFileUrl, generateDeleteUrl } = require('./utils/url');

exports.handler = async (event, context) => {
  const { Octokit } = (await import('@octokit/rest')).default;
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ code: 405, message: 'Method not allowed' })
    };
  }

  try {
    const { fields, files } = await parseMultipartForm(event);
    
    if (!fields.auth || !fields.auth[0]) {
      return {
        statusCode: 400,
        body: JSON.stringify({ code: 400, message: 'Auth key is required' })
      };
    }

    const auth = fields.auth[0];
    try {
      validateAuth(auth);
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({ code: 401, message: 'Unauthorized' })
      };
    }

    if (!files.image || !files.image[0]) {
      return {
        statusCode: 400,
        body: JSON.stringify({ code: 400, message: 'Image file is required' })
      };
    }

    const image = files.image[0];
    const imageBuffer = Buffer.from(image.content, 'binary');
    const imageContent = imageBuffer.toString('base64');
    
    const githubToken = process.env.GITHUB_PAT;
    const [owner, repoName] = process.env.GITHUB_REPO.split('/');

    if (!githubToken || !owner || !repoName) {
      throw new Error('Missing GitHub configuration');
    }

    const octokit = new Octokit({ auth: githubToken });
    const filename = generateFilename(image.originalFilename);
    
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo: repoName,
      path: filename,
      message: `Upload ${filename}`,
      content: imageContent
    });

    const fileUrl = generateFileUrl(filename);
    const deleteUrl = generateDeleteUrl(event, filename.replace('img/', ''), auth);

    return {
      statusCode: 200,
      body: JSON.stringify({
        code: 200,
        url: fileUrl,
        delete_url: deleteUrl
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