import {MessageResolver} from 'api/'
import dayjs from 'dayjs'
import {ForecastTimeInstant, METJSONForecast} from './__generated__/locationforecast-2.0'

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

export const weather: MessageResolver = async (msg, content) => {
  const baseMetUrl = new URL('https://api.met.no/weatherapi/locationforecast/2.0/complete')
  const metParams = new URLSearchParams()

  let actualName: string

  const locationBaseUrl = new URL('https://ws.geonorge.no/stedsnavn/v1/sted')
  const locationParams = new URLSearchParams()
  locationParams.append('sok', content)
  locationParams.append('fuzzy', 'true')
  locationParams.append('treffPerSide', '1')
  locationParams.append('side', '1')
  const locationUrl = `${locationBaseUrl}?${locationParams.toString()}`

  try {
    const locationRes = await fetch(locationUrl)
    const locationJson = await locationRes.json()
    actualName = locationJson.navn[0].stedsnavn[0].skrivemåte
    const geometry = locationJson.navn[0].geojson.geometry
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
      **${actualName}**
      (${dayjs(date).format('DD.MM.YYYY - HH:mm')})

      Lufttemperatur: ${getValue('air_temperature')}
      Skydekke: ${getValue('cloud_area_fraction')}
      Relativ fuktighet: ${getValue('relative_humidity')}
      Vind fra: ${getValue('wind_from_direction')}
      Vindhastighet: ${getValue('wind_speed')}
      Vindhastighet på kast: ${getValue('wind_speed_of_gust')}
    `
    msg.channel.send(response)
    return
  } catch (e) {
    console.error('Error', e)
  }

  msg.channel.send('Nope, fant ingen ting!')
  return
}
