import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { Readable } from "stream";

export class S3Uploader {
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
        Bucket: this.bucketName,
        Key: key,
        Body: markdownBuffer,
        ContentType: 'text/plain',
      };

      const command = new PutObjectCommand(uploadParams);
      const data = await this.s3Client.send(command);

      console.log("File uploaded successfully", data);
    } catch (err) {
      console.error("Error uploading file to S3", err);
    }
  }
}

export class S3Retriever {
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

  // Function to get the last uploaded file using lexicographical ordering of the keys
  public async getLastReadme(folderPath: string): Promise<string | null> {
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: folderPath,
        MaxKeys: 1, 
        StartAfter: folderPath
      });

      const listData = await this.s3Client.send(listCommand);

      if (!listData.Contents || listData.Contents.length === 0) {
        throw new Error(`No files found in folder: ${folderPath}`);
      }

      const latestFileKey = listData.Contents[0].Key;
      if (!latestFileKey) {
        throw new Error("Unable to find the latest file key.");
      }

      const getCommand = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: latestFileKey,
      });

      const getData = await this.s3Client.send(getCommand);
      const fileStream = getData.Body as Readable;

      const fileContent = await this.streamToString(fileStream);
      return fileContent;
    } catch (err) {
      console.error("Error retrieving last README file from S3", err);
      return null
    }
  }

  // Helper function to convert stream to string
  private async streamToString(stream: Readable): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
      stream.on("error", reject);
    });
  }
}