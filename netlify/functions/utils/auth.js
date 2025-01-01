// Authentication utility
exports.validateAuth = (auth) => {
  const validKey = process.env.AUTH_KEY;
  if (!auth || auth !== validKey) {
    throw new Error('Invalid authentication key');
  }
};