import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
    private readonly s3Client: S3Client;
    private readonly logger = new Logger(UploadService.name);
    private readonly bucketName: string;

    constructor(private configService: ConfigService) {
        const region = this.configService.get<string>('AWS_REGION');
        const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
        this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME') || '';

        if (!region || !accessKeyId || !secretAccessKey || !this.bucketName) {
            this.logger.warn('AWS S3 configuration is missing. Uploads will fail.');
        }

        this.s3Client = new S3Client({
            region,
            credentials: {
                accessKeyId: accessKeyId || '',
                secretAccessKey: secretAccessKey || '',
            },
        });
    }

    async uploadFile(key: string, body: Buffer, contentType: string): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: body,
                ContentType: contentType,
            });

            await this.s3Client.send(command);

            // Construct the URL
            // Virtual-hosted-style URL: https://bucket-name.s3.region-code.amazonaws.com/key-name
            const region = this.configService.get<string>('AWS_REGION');
            return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
        } catch (error) {
            this.logger.error(`Failed to upload file to S3: ${error}`);
            throw error;
        }
    }
}
