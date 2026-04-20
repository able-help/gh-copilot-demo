export class DogBreedFeatureError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'DogBreedFeatureError'
    this.code = code
  }
}
