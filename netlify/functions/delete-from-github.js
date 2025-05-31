const { validateAuth } = require('./utils/auth');

exports.handler = async (event, context) => {
  const { Octokit } = await import('@octokit/rest');
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ code: 405, message: 'Method not allowed' })
    };
  }

  try {
    const params = new URLSearchParams(event.rawQuery);
    const filename = params.get('name');
    const auth = params.get('auth');

    if (!filename) {
      return {
        statusCode: 400,
        body: JSON.stringify({ code: 400, message: 'Filename is required' })
      };
    }

    if (!auth) {
      return {
        statusCode: 400,
        body: JSON.stringify({ code: 400, message: 'Auth key is required' })
      };
    }

    try {
      validateAuth(auth);
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({ code: 401, message: 'Unauthorized' })
      };
    }

    const githubToken = process.env.GITHUB_PAT;
    const [owner, repoName] = process.env.GITHUB_REPO.split('/');

    if (!githubToken || !owner || !repoName) {
      throw new Error('Missing GitHub configuration');
    }

    const octokit = new Octokit({ auth: githubToken });
    
    // 获取文件的当前 SHA
    const { data: fileData } = await octokit.repos.getContent({
      owner,
      repo: repoName,
      path: `img/${filename}`
    });

    // 删除文件
    await octokit.repos.deleteFile({
      owner,
      repo: repoName,
      path: `img/${filename}`,
      message: `Delete ${filename}`,
      sha: fileData.sha
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        code: 200,
        message: 'File deleted successfully'
      })
    };

  } catch (error) {
    console.error('Error:', error);
    
    // 如果文件不存在，返回404
    if (error.status === 404) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          code: 404,
          message: 'File not found'
        })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        code: 500,
        message: error.message
      })
    };
  }
};