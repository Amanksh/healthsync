import { ConfigService } from '@nestjs/config';
export declare class UploadService {
    private configService;
    private readonly s3Client;
    private readonly logger;
    private readonly bucketName;
    constructor(configService: ConfigService);
    uploadFile(key: string, body: Buffer, contentType: string): Promise<string>;
}
