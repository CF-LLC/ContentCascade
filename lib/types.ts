export interface Plan {
  name: string
  price: number
  description: string
  features: string[]
  priceId: string | null
  popular: boolean
}
