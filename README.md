# blog-img-netlify API 文档

本项目提供 API 用于将图片上传到 GitHub 仓库，并支持删除已上传的图片。
项目用于Qexo图库，以GitHub做图床，并通过Netlify转发，速度快

## API 端点

根据 `netlify.toml` 的配置，API 的基础路径为 `/api/`。

### 1. 上传图片

- **端点**: `/api/upload-to-github`
- **方法**: `POST`
- **请求格式**: `multipart/form-data`
- **表单字段**:
    - `auth` (string, 必填): 认证密钥。
    - `image` (file, 必填): 要上传的图片文件。
- **成功响应 (200)**:
    ```json
    {
        "code": 200,
        "url": "图片的 URL",
        "delete_url": "删除图片的 URL"
    }
    ```
- **错误响应**:
    - `400 Bad Request`: 缺少 `auth` 密钥或 `image` 文件。
    - `401 Unauthorized`: 认证失败。
    - `405 Method Not Allowed`: 请求方法不是 `POST`。
    - `500 Internal Server Error`: 服务器内部错误，例如 GitHub 配置缺失或操作失败。

### 2. 删除图片

- **端点**: `/api/delete-from-github`
- **方法**: `GET`
- **查询参数**:
    - `name` (string, 必填): 要删除的图片文件名 (例如 `image.png`)。
    - `auth` (string, 必填): 认证密钥。
- **成功响应 (200)**:
    ```json
    {
        "code": 200,
        "message": "File deleted successfully"
    }
    ```
- **错误响应**:
    - `400 Bad Request`: 缺少 `name` 或 `auth` 参数。
    - `401 Unauthorized`: 认证失败。
    - `404 Not Found`: 文件未找到。
    - `405 Method Not Allowed`: 请求方法不是 `GET`。
    - `500 Internal Server Error`: 服务器内部错误，例如 GitHub 配置缺失或操作失败。

## 认证

API 使用简单的密钥进行认证。客户端需要在请求中提供正确的 `auth` 参数。该密钥通过 `AUTH_KEY` 环境变量进行配置。

## 环境变量

项目运行需要以下环境变量：

- `GITHUB_PAT`: 用于访问 GitHub API 的 Personal Access Token。
- `GITHUB_REPO`: 目标 GitHub 仓库，格式为 `owner/repoName` (例如 `your-username/your-repo`)。
- `AUTH_KEY`: 用于 API 认证的密钥。
- `URL_PREFIX`: 生成图片 URL 的前缀 (例如 `https://your-custom-domain.com` 或 Netlify 站点的默认 URL `https://your-site-name.netlify.app`)。


