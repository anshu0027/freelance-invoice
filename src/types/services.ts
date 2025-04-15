export interface ServiceItem {
  name: string
  description: string
  quantity: number
}

export interface ServicePackage {
  name: string
  services: ServiceItem[]
  monthlyPrice: number
}

export interface ServiceData {
  [category: string]: ServicePackage[]
}
