import type { MessageResolver } from 'lib/types'
import dayjs from 'dayjs'
import type { ForecastTimeInstant, METJSONForecast } from './__generated__/locationforecast-2.0'

const baseRadii = 11.25

const getDirectionSymbol = (value: number) => {
  if ((value >= baseRadii * 27 && value <= baseRadii * 32) || (value >= 0 && value < baseRadii)) {
    return 'Nord **↓**'
  }
  if (value >= baseRadii && value < baseRadii * 3) {
    return 'Nord-Øst **↙**'
  }
  if (value >= baseRadii * 3 && value < baseRadii * 7) {
    return 'Øst **←**'
  }
  if (value >= baseRadii * 7 && value < baseRadii * 11) {
    return 'Sør-Øst **↖**'
  }
  if (value >= baseRadii * 11 && value < baseRadii * 15) {
    return 'Sør **↑**'
  }
  if (value >= baseRadii * 15 && value < baseRadii * 19) {
    return 'Sør-Vest **↗**'
  }
  if (value >= baseRadii * 19 && value < baseRadii * 23) {
    return 'Vest **→**'
  }
  if (value >= baseRadii * 23 && value < baseRadii * 27) {
    return 'Nord-Vest **↘**'
  }
  return 'Ukjent'
}

const getFooter = ({ search, numberOfHits, searchIndex }) => {
  if (numberOfHits <= 1) {
    return ''
  }
  return `
    _Fikk ${numberOfHits} treff på søk mot stedsnavn. Viser nr **${searchIndex + 1}**._
    _For å se andre treff, skriv \`!weather ${search} <NUMMER>\`, der <NUMMER> er et tall fra 1 til ${numberOfHits}._
  `
}

export const weather: MessageResolver = async (msg, content) => {
  const baseMetUrl = new URL('https://api.met.no/weatherapi/locationforecast/2.0/complete')
  const metParams = new URLSearchParams()
  let actualName: string

  const [search, index] = content.split(' ')

  const locationBaseUrl = new URL('https://ws.geonorge.no/stedsnavn/v1/sted')
  const locationParams = new URLSearchParams()
  locationParams.append('sok', search)
  locationParams.append('fuzzy', 'true')
  locationParams.append('treffPerSide', '5')
  locationParams.append('side', '1')
  const locationUrl = `${locationBaseUrl}?${locationParams.toString()}`

  try {
    let searchIndex = index ? Math.max(Number.parseInt(index) - 1, 0) : 0
    const locationRes = await fetch(locationUrl)
    const locationJson = await locationRes.json()
    const numberOfHits = locationJson.navn.length

    if (searchIndex > numberOfHits) {
      searchIndex = 0
    }

    const place = locationJson.navn[searchIndex]
    actualName = place.stedsnavn[0].skrivemåte
    const geometry = place.geojson.geometry
    const county = place.fylker[0].fylkesnavn

    const coordinates = geometry.coordinates
    let lat: number
    let lon: number
    if (geometry.type === 'MultiPoint') {
      lat = coordinates[0][1]
      lon = coordinates[0][0]
    } else {
      lat = coordinates[1]
      lon = coordinates[0]
    }

    metParams.append('lat', lat.toString())
    metParams.append('lon', lon.toString())
    const metUrl = `${baseMetUrl}?${metParams.toString()}`
    const metRes = await fetch(metUrl)

    const metJson = (await metRes.json()) as METJSONForecast
    const timeSerie = metJson.properties.timeseries[0]
    const date = timeSerie.time
    const data = timeSerie.data
    const instant = data.instant
    const units = metJson.properties.meta.units

    const getValue = (name: keyof ForecastTimeInstant) => {
      const value = instant.details[name]
      if (name === 'wind_from_direction' && value) {
        const dir = getDirectionSymbol(value)
        return dir
      }
      return value ? `${value} ${units[name]}` : '-'
    }

    const response = `
      >>> 
      **${actualName}**  -  (${county})
      (${dayjs(date).format('DD.MM.YYYY - HH:mm')})

      Lufttemperatur: ${getValue('air_temperature')}
      Skydekke: ${getValue('cloud_area_fraction')}
      Relativ fuktighet: ${getValue('relative_humidity')}
      Vind fra: ${getValue('wind_from_direction')}
      Vindhastighet: ${getValue('wind_speed')}
      Vindhastighet på kast: ${getValue('wind_speed_of_gust')}

      ${getFooter({ search, numberOfHits, searchIndex })}
    `
    msg.channel.send(response)
    return
  } catch (e) {
    console.error('Error', e)
  }

  msg.channel.send('Nope, fant ingen ting!')
  return
}
