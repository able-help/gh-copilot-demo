import type { DogImageAsset } from '../../src'

type ExpoImagePickerAssetLike = {
  uri: string
  fileName?: string | null
  mimeType?: string | null
  fileSize?: number | null
  width: number
  height: number
}

type ReactNativeImagePickerAssetLike = {
  uri?: string
  fileName?: string
  type?: string
  fileSize?: number
  width?: number
  height?: number
}

export function fromExpoImagePickerAsset(asset: ExpoImagePickerAssetLike): DogImageAsset {
  return {
    uri: asset.uri,
    fileName: asset.fileName ?? undefined,
    mimeType: asset.mimeType ?? undefined,
    fileSize: asset.fileSize ?? 0,
    width: asset.width,
    height: asset.height
  }
}

export function fromReactNativeImagePickerAsset(asset: ReactNativeImagePickerAssetLike): DogImageAsset {
  return {
    uri: asset.uri ?? '',
    fileName: asset.fileName,
    mimeType: asset.type,
    fileSize: asset.fileSize ?? 0,
    width: asset.width ?? 0,
    height: asset.height ?? 0
  }
}
