const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

require('dotenv').config()

const bucketName = process.env.AWS_BUCKET_NAME
const bucketRegion = process.env.AWS_REGION
const accessKey = process.env.AWS_ACCESS_KEY_ID
const secretKey = process.env.AWS_SECRET_ACCESS_KEY

const s3Client = new S3Client({
	region: bucketRegion,
	credentials: {
		accessKeyId: accessKey,
		secretAccessKey: secretKey
	}
})

function uploadFile(fileBuffer, fileName, mimetype) {
	const uploadParams = {
		Bucket: bucketName,
		Body: fileBuffer,
		Key: fileName,
		ContentType: mimetype
	}

	return s3Client.send(new PutObjectCommand(uploadParams));
}

function deleteFile(fileName) {
	const deleteParams = {
		Bucket: bucketName,
		Key: fileName,
	}

	return s3Client.send(new DeleteObjectCommand(deleteParams));
}

async function getObjectSignedUrl(key) {
	const params = {
		Bucket: bucketName,
		Key: key
	}

	const command = new GetObjectCommand(params);
	const seconds = 60
	const url = await getSignedUrl(s3Client, command, { expiresIn: seconds });

	return url
}

module.exports = { uploadFile, deleteFile, getObjectSignedUrl };
