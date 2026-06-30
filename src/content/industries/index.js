// Реестр индустрий — стр. 2. Каждое дерево — отдельный JSON.
// Порядок задаёт группировку по архетипу на странице.
import social from './social.json'
import search from './search.json'
import streaming from './streaming.json'
import saas from './saas.json'
import marketplace from './marketplace.json'
import ondemand from './ondemand.json'
import foodtech from './foodtech.json'
import ota from './ota.json'
import classifieds from './classifieds.json'
import restaurants from './restaurants.json'
import ecommerce from './ecommerce.json'
import fintech from './fintech.json'
import gaming from './gaming.json'
import edtech from './edtech.json'
import ai from './ai.json'

export const industries = [
  social, search,
  streaming, saas,
  marketplace, ondemand, foodtech, ota,
  classifieds,
  restaurants,
  ecommerce,
  fintech,
  gaming,
  edtech,
  ai,
]
export const industriesById = Object.fromEntries(industries.map((i) => [i.id, i]))
