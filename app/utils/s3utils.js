const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  region: process.env.AWS_REGION || 'eu-north-1',
});

const getSignedUrl = (bucket, key) => {
  const params = {
    Bucket: bucket,
    Key: key,
    Expires: 3600, // URL expires in 1 hour
  };
  return s3.getSignedUrl('getObject', params);
};

module.exports = getSignedUrl;
