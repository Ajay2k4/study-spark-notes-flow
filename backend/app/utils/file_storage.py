
import boto3
import os
import uuid
from botocore.exceptions import NoCredentialsError
from fastapi import UploadFile
from app.config import settings


class S3Storage:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.S3_BUCKET_NAME

    async def upload_file(self, file: UploadFile, folder: str = "uploads") -> str:
        """Upload a file to S3 bucket and return the URL"""
        try:
            file_extension = os.path.splitext(file.filename)[1]
            unique_filename = f"{folder}/{uuid.uuid4()}{file_extension}"
            
            # Read file content
            file_content = await file.read()
            
            # Upload file
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=unique_filename,
                Body=file_content,
                ContentType=file.content_type
            )
            
            # Generate URL
            url = f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{unique_filename}"
            return url
            
        except NoCredentialsError:
            raise Exception("AWS credentials not available")
    
    def delete_file(self, file_url: str) -> bool:
        """Delete a file from S3 bucket"""
        try:
            # Extract file key from URL
            file_key = file_url.split(f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/")[1]
            
            # Delete file
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=file_key
            )
            return True
        
        except Exception as e:
            print(f"Error deleting file: {str(e)}")
            return False

    def generate_presigned_url(self, object_key: str, expiration=3600) -> str:
        """Generate a presigned URL for downloading a file"""
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': object_key
                },
                ExpiresIn=expiration
            )
            return url
        
        except Exception as e:
            print(f"Error generating presigned URL: {str(e)}")
            return None


# Create an instance
s3_storage = S3Storage()
