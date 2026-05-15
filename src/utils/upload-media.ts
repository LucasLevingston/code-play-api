import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import type { Readable } from "stream";
import { pipeline } from "stream/promises";
import { env } from "@/env";

const hasAwsStorage = Boolean(env.AWS_REGION && env.AWS_S3_BUCKET);

const s3Client = hasAwsStorage
   ? new S3Client({
      region: env.AWS_REGION,
      ...(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && {
         credentials: {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
         },
      }),
   })
   : null;

function getExtensionFromFileName(fileName: string) {
   const extension = path.extname(fileName).toLowerCase();

   if (extension) return extension;

   return ".bin";
}

function getExtensionFromMimeType(mimeType?: string) {
   switch (mimeType) {
      case "video/mp4":
         return ".mp4";
      case "video/webm":
         return ".webm";
      case "video/quicktime":
         return ".mov";
      case "image/jpeg":
         return ".jpg";
      case "image/png":
         return ".png";
      case "image/webp":
         return ".webp";
      default:
         return ".bin";
   }
}

function getExtension(fileName: string, mimeType?: string) {
   const extension = getExtensionFromFileName(fileName);

   if (extension !== ".bin") return extension;

   return getExtensionFromMimeType(mimeType);
}

function getPublicBaseUrl() {
   if (!env.AWS_REGION || !env.AWS_S3_BUCKET) {
      return "";
   }

   return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com`;
}

export async function storeMediaFile({
   stream,
   folder,
   fileName,
   contentType,
}: {
   stream: Readable;
   folder: "videos" | "thumbnails";
   fileName: string;
   contentType?: string;
}) {
   const extension = getExtension(fileName, contentType);
   const objectName = `${folder}/${randomUUID()}${extension}`;

   if (s3Client && env.AWS_S3_BUCKET) {
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
         chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      await s3Client.send(
         new PutObjectCommand({
            Bucket: env.AWS_S3_BUCKET,
            Key: objectName,
            Body: buffer,
            ContentType: contentType,
            ContentLength: buffer.length,
         }),
      );

      const publicBaseUrl = getPublicBaseUrl();

      return `${publicBaseUrl}/${objectName}`;
   }

   const uploadDirectory = path.join(process.cwd(), "uploads", folder);
   await mkdir(uploadDirectory, { recursive: true });

   const localPath = path.join(uploadDirectory, `${randomUUID()}${extension}`);
   await pipeline(stream, createWriteStream(localPath));

   return `/uploads/${folder}/${path.basename(localPath)}`;
}
