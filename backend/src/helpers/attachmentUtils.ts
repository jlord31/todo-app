import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';

const XAWS = AWSXRay.captureAWS(AWS);

// TODO: Implement the fileStogare logic

export class AttachmentUtils {
  constructor(
    private readonly s3: AWS.S3 = createS3Client(),
    private readonly bucketName: string = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration: string = process.env.SIGNED_URL_EXPIRATION
  ) {}

  getUploadUrl(todoId: string) {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: this.urlExpiration
    });
  }

  getDownloadUrl(todoId: string): string {
    return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
  }
}

function createS3Client(): AWS.S3 {
  return new XAWS.S3({
    signatureVersion: 'v4'
  });
}