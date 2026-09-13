// Разбор индустрий по AARRR и HEART. Лежит отдельно от деревьев и, как и
// справочник метрик, импортируется ТОЛЬКО динамически: это ещё ~50 КБ gzip,
// и в чанке страницы они не нужны никому, кто не открыл вид «Фреймворк».
import ai from './ai.json'
import classifieds from './classifieds.json'
import ecommerce from './ecommerce.json'
import edtech from './edtech.json'
import fintech from './fintech.json'
import foodtech from './foodtech.json'
import gaming from './gaming.json'
import marketplace from './marketplace.json'
import messengers from './messengers.json'
import ondemand from './ondemand.json'
import ota from './ota.json'
import restaurants from './restaurants.json'
import saas from './saas.json'
import search from './search.json'
import social from './social.json'
import streaming from './streaming.json'

export const frameworksById = {
  ai, classifieds, ecommerce, edtech, fintech, foodtech, gaming, marketplace,
  messengers, ondemand, ota, restaurants, saas, search, social, streaming,
}
