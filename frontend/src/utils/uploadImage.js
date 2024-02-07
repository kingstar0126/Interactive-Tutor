import AWS from "aws-sdk";

const S3_BUCKET = process.env.REACT_APP_S3_PUBLIC;
const s3 = new AWS.S3({
  params: { Bucket: S3_BUCKET },
  region: process.env.REACT_APP_REGION
});

export const uploadImage = async (path, file) => {
  if (file) {
    const filename = new Date().getTime() + file.name.replaceAll(" ", "");
    const filePath = `${path}/${filename}`;
    const params = {
      Bucket: S3_BUCKET,
      Key: filePath,
      Body: file
    };
    try {
      await s3.putObject(params).promise().then();
      return `https://${S3_BUCKET}.s3.${process.env.REACT_APP_REGION}.amazonaws.com/${filePath}`;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }
};
