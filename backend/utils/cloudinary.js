import { v2 as cloudinary } from 'cloudinary'

let isConfigured = false

const configureCloudinary = () => {
  if (isConfigured) return
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are missing.')
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })
  isConfigured = true
}

const uploadImage = async (file, options = {}) => {
  if (!file?.buffer) {
    throw new Error('Image file is required.')
  }
  configureCloudinary()
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString(
    'base64'
  )}`
  return cloudinary.uploader.upload(dataUri, {
    folder: options.folder,
  })
}

export { uploadImage }
