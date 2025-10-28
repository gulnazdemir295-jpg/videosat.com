// Environment variables - DO NOT COMMIT!
// This file is for documentation only

const CONFIG = {
    // AWS Configuration - Use environment variables
    aws: {
        accessKey: process.env.AWS_ACCESS_KEY_ID,
        secretKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
        bucket: process.env.AWS_S3_BUCKET,
        cloudfront: process.env.CLOUDFRONT_DISTRIBUTION_ID
    },
    
    // GitHub Configuration
    github: {
        token: process.env.GITHUB_TOKEN
    },
    
    // API Keys
    api: {
        key: process.env.API_KEY
    }
};

// Export config
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}