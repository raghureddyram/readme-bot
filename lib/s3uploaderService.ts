import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export default class S3Uploader {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(bucketName: string = "readme-bot", region: string = "us-west-1") {
    this.bucketName = bucketName;
    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "your-access-key-id",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "your-secret-access-key"
      }
    });
  }

  public async uploadFile(markdownContent: string, key: string): Promise<void> {
    try {
      const markdownBuffer = Buffer.from(markdownContent); // Convert markdown content to buffer

      const uploadParams = {
        Bucket: this.bucketName, // Use the class-level bucketName
        Key: key, // Key for the object
        Body: markdownBuffer, // File content as buffer
        ContentType: 'text/plain', // Content type as plain text (can be 'text/markdown' for markdown files)
      };

      const command = new PutObjectCommand(uploadParams);
      const data = await this.s3Client.send(command);

      console.log("File uploaded successfully", data);
    } catch (err) {
      console.error("Error uploading file to S3", err);
    }
  }
}