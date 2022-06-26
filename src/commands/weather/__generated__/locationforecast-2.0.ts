/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface Forecast {
  meta: {units: ForecastUnits; updated_at: string}
  timeseries: ForecastTimeStep[]
}

/**
 * Summary of weather conditions.
 */
export interface ForecastSummary {
  /** A identifier that sums up the weather condition for this time period. May be used with https://api.met.no/weatherapi/weathericon/2.0/. */
  symbol_code: WeatherSymbol
}

/**
 * Weather parameters valid for a specific point in time.
 */
export interface ForecastTimeInstant {
  /**
   * Air pressure at sea level
   * @example 1017.23
   */
  air_pressure_at_sea_level?: number

  /**
   * Air temperature
   * @example 17.1
   */
  air_temperature?: number

  /**
   * Amount of sky covered by clouds.
   * @example 95.2
   */
  cloud_area_fraction?: number

  /**
   * Amount of sky covered by clouds at high elevation.
   * @example 95.2
   */
  cloud_area_fraction_high?: number

  /**
   * Amount of sky covered by clouds at low elevation.
   * @example 95.2
   */
  cloud_area_fraction_low?: number

  /**
   * Amount of sky covered by clouds at medium elevation.
   * @example 95.2
   */
  cloud_area_fraction_medium?: number

  /**
   * Dew point temperature at sea level
   * @example 8.1
   */
  dew_point_temperature?: number

  /**
   * Amount of area covered by fog.
   * @example 95.2
   */
  fog_area_fraction?: number

  /**
   * Amount of humidity in the air.
   * @example 81.1
   */
  relative_humidity?: number

  /**
   * The directon which moves towards
   * @example 121.3
   */
  wind_from_direction?: number

  /**
   * Speed of wind
   * @example 5.9
   */
  wind_speed?: number

  /**
   * Speed of wind gust
   * @example 15.9
   */
  wind_speed_of_gust?: number
}

/**
 * Weather parameters valid for a specified time period.
 */
export interface ForecastTimePeriod {
  /**
   * Maximum air temperature in period
   * @example 17.1
   */
  air_temperature_max?: number

  /**
   * Minimum air temperature in period
   * @example 11.1
   */
  air_temperature_min?: number

  /**
   * Best estimate for amount of precipitation for this period
   * @example 1.71
   */
  precipitation_amount?: number

  /**
   * Maximum amount of precipitation for this period
   * @example 4.32
   */
  precipitation_amount_max?: number

  /**
   * Minimum amount of precipitation for this period
   * @example 4.32
   */
  precipitation_amount_min?: number

  /**
   * Probability of any precipitation coming for this period
   * @example 37
   */
  probability_of_precipitation?: number

  /**
   * Probability of any thunder coming for this period
   * @example 54.32
   */
  probability_of_thunder?: number

  /**
   * Maximum ultraviolet index if sky is clear
   * @example 1
   */
  ultraviolet_index_clear_sky_max?: number
}

export interface ForecastTimeStep {
  /** Forecast for a specific time */
  data: {
    instant: {details?: ForecastTimeInstant}
    next_12_hours?: {details: ForecastTimePeriod; summary: ForecastSummary}
    next_1_hours?: {details: ForecastTimePeriod; summary: ForecastSummary}
    next_6_hours?: {details: ForecastTimePeriod; summary: ForecastSummary}
  }

  /**
   * The time these forecast values are valid for. Timestamp in format YYYY-MM-DDThh:mm:ssZ (ISO 8601)
   * @example 2019-12-03T14:00:00Z
   */
  time: string
}

export interface ForecastUnits {
  /** @example hPa */
  air_pressure_at_sea_level?: string

  /** @example C */
  air_temperature?: string

  /** @example C */
  air_temperature_max?: string

  /** @example C */
  air_temperature_min?: string

  /** @example % */
  cloud_area_fraction?: string

  /** @example % */
  cloud_area_fraction_high?: string

  /** @example % */
  cloud_area_fraction_low?: string

  /** @example % */
  cloud_area_fraction_medium?: string

  /** @example C */
  dew_point_temperature?: string

  /** @example % */
  fog_area_fraction?: string

  /** @example mm */
  precipitation_amount?: string

  /** @example mm */
  precipitation_amount_max?: string

  /** @example mm */
  precipitation_amount_min?: string

  /** @example % */
  probability_of_precipitation?: string

  /** @example % */
  probability_of_thunder?: string

  /** @example % */
  relative_humidity?: string

  /** @example 1 */
  ultraviolet_index_clear_sky_max?: string

  /** @example degrees */
  wind_from_direction?: string

  /** @example m/s */
  wind_speed?: string

  /** @example m/s */
  wind_speed_of_gust?: string
}

export interface METJSONForecast {
  geometry: PointGeometry
  properties: Forecast

  /** @example Feature */
  type: 'Feature'
}

export interface PointGeometry {
  /**
   * [longitude, latitude, altitude]. All numbers in decimal.
   * @example [60.5,11.59,1001]
   */
  coordinates: number[]
  type: 'Point'
}

/**
 * A identifier that sums up the weather condition for this time period. May be used with https://api.met.no/weatherapi/weathericon/2.0/.
 * @example clearsky_day
 */
export enum WeatherSymbol {
  ClearskyDay = 'clearsky_day',
  ClearskyNight = 'clearsky_night',
  ClearskyPolartwilight = 'clearsky_polartwilight',
  FairDay = 'fair_day',
  FairNight = 'fair_night',
  FairPolartwilight = 'fair_polartwilight',
  LightssnowshowersandthunderDay = 'lightssnowshowersandthunder_day',
  LightssnowshowersandthunderNight = 'lightssnowshowersandthunder_night',
  LightssnowshowersandthunderPolartwilight = 'lightssnowshowersandthunder_polartwilight',
  LightsnowshowersDay = 'lightsnowshowers_day',
  LightsnowshowersNight = 'lightsnowshowers_night',
  LightsnowshowersPolartwilight = 'lightsnowshowers_polartwilight',
  Heavyrainandthunder = 'heavyrainandthunder',
  Heavysnowandthunder = 'heavysnowandthunder',
  Rainandthunder = 'rainandthunder',
  HeavysleetshowersandthunderDay = 'heavysleetshowersandthunder_day',
  HeavysleetshowersandthunderNight = 'heavysleetshowersandthunder_night',
  HeavysleetshowersandthunderPolartwilight = 'heavysleetshowersandthunder_polartwilight',
  Heavysnow = 'heavysnow',
  HeavyrainshowersDay = 'heavyrainshowers_day',
  HeavyrainshowersNight = 'heavyrainshowers_night',
  HeavyrainshowersPolartwilight = 'heavyrainshowers_polartwilight',
  Lightsleet = 'lightsleet',
  Heavyrain = 'heavyrain',
  LightrainshowersDay = 'lightrainshowers_day',
  LightrainshowersNight = 'lightrainshowers_night',
  LightrainshowersPolartwilight = 'lightrainshowers_polartwilight',
  HeavysleetshowersDay = 'heavysleetshowers_day',
  HeavysleetshowersNight = 'heavysleetshowers_night',
  HeavysleetshowersPolartwilight = 'heavysleetshowers_polartwilight',
  LightsleetshowersDay = 'lightsleetshowers_day',
  LightsleetshowersNight = 'lightsleetshowers_night',
  LightsleetshowersPolartwilight = 'lightsleetshowers_polartwilight',
  Snow = 'snow',
  HeavyrainshowersandthunderDay = 'heavyrainshowersandthunder_day',
  HeavyrainshowersandthunderNight = 'heavyrainshowersandthunder_night',
  HeavyrainshowersandthunderPolartwilight = 'heavyrainshowersandthunder_polartwilight',
  SnowshowersDay = 'snowshowers_day',
  SnowshowersNight = 'snowshowers_night',
  SnowshowersPolartwilight = 'snowshowers_polartwilight',
  Fog = 'fog',
  SnowshowersandthunderDay = 'snowshowersandthunder_day',
  SnowshowersandthunderNight = 'snowshowersandthunder_night',
  SnowshowersandthunderPolartwilight = 'snowshowersandthunder_polartwilight',
  Lightsnowandthunder = 'lightsnowandthunder',
  Heavysleetandthunder = 'heavysleetandthunder',
  Lightrain = 'lightrain',
  RainshowersandthunderDay = 'rainshowersandthunder_day',
  RainshowersandthunderNight = 'rainshowersandthunder_night',
  RainshowersandthunderPolartwilight = 'rainshowersandthunder_polartwilight',
  Rain = 'rain',
  Lightsnow = 'lightsnow',
  LightrainshowersandthunderDay = 'lightrainshowersandthunder_day',
  LightrainshowersandthunderNight = 'lightrainshowersandthunder_night',
  LightrainshowersandthunderPolartwilight = 'lightrainshowersandthunder_polartwilight',
  Heavysleet = 'heavysleet',
  Sleetandthunder = 'sleetandthunder',
  Lightrainandthunder = 'lightrainandthunder',
  Sleet = 'sleet',
  LightssleetshowersandthunderDay = 'lightssleetshowersandthunder_day',
  LightssleetshowersandthunderNight = 'lightssleetshowersandthunder_night',
  LightssleetshowersandthunderPolartwilight = 'lightssleetshowersandthunder_polartwilight',
  Lightsleetandthunder = 'lightsleetandthunder',
  PartlycloudyDay = 'partlycloudy_day',
  PartlycloudyNight = 'partlycloudy_night',
  PartlycloudyPolartwilight = 'partlycloudy_polartwilight',
  SleetshowersandthunderDay = 'sleetshowersandthunder_day',
  SleetshowersandthunderNight = 'sleetshowersandthunder_night',
  SleetshowersandthunderPolartwilight = 'sleetshowersandthunder_polartwilight',
  RainshowersDay = 'rainshowers_day',
  RainshowersNight = 'rainshowers_night',
  RainshowersPolartwilight = 'rainshowers_polartwilight',
  Snowandthunder = 'snowandthunder',
  SleetshowersDay = 'sleetshowers_day',
  SleetshowersNight = 'sleetshowers_night',
  SleetshowersPolartwilight = 'sleetshowers_polartwilight',
  Cloudy = 'cloudy',
  HeavysnowshowersandthunderDay = 'heavysnowshowersandthunder_day',
  HeavysnowshowersandthunderNight = 'heavysnowshowersandthunder_night',
  HeavysnowshowersandthunderPolartwilight = 'heavysnowshowersandthunder_polartwilight',
  HeavysnowshowersDay = 'heavysnowshowers_day',
  HeavysnowshowersNight = 'heavysnowshowers_night',
  HeavysnowshowersPolartwilight = 'heavysnowshowers_polartwilight',
}

export type QueryParamsType = Record<string | number, any>
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean
  /** request path */
  path: string
  /** content type of request body */
  type?: ContentType
  /** query params */
  query?: QueryParamsType
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat
  /** request body */
  body?: unknown
  /** base url */
  baseUrl?: string
  /** request cancellation token */
  cancelToken?: CancelToken
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>
  securityWorker?: (
    securityData: SecurityDataType | null
  ) => Promise<RequestParams | void> | RequestParams | void
  customFetch?: typeof fetch
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D
  error: E
}

type CancelToken = Symbol | string | number

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = 'https://api.met.no/weatherapi/locationforecast/2.0'
  private securityData: SecurityDataType | null = null
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker']
  private abortControllers = new Map<CancelToken, AbortController>()
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams)

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  }

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig)
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data
  }

  private encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key)
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`
  }

  private addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key])
  }

  private addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key]
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&')
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {}
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key])
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key)
      )
      .join('&')
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery)
    return queryString ? `?${queryString}` : ''
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string')
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key]
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
            ? JSON.stringify(property)
            : `${property}`
        )
        return formData
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  }

  private mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    }
  }

  private createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken)
      if (abortController) {
        return abortController.signal
      }
      return void 0
    }

    const abortController = new AbortController()
    this.abortControllers.set(cancelToken, abortController)
    return abortController.signal
  }

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken)

    if (abortController) {
      abortController.abort()
      this.abortControllers.delete(cancelToken)
    }
  }

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {}
    const requestParams = this.mergeRequestParams(params, secureParams)
    const queryString = query && this.toQueryString(query)
    const payloadFormatter = this.contentFormatters[type || ContentType.Json]
    const responseFormat = format || requestParams.format

    return this.customFetch(
      `${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`,
      {
        ...requestParams,
        headers: {
          ...(type && type !== ContentType.FormData ? {'Content-Type': type} : {}),
          ...(requestParams.headers || {}),
        },
        signal: cancelToken ? this.createAbortSignal(cancelToken) : void 0,
        body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
      }
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>
      r.data = null as unknown as T
      r.error = null as unknown as E

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data
              } else {
                r.error = data
              }
              return r
            })
            .catch((e) => {
              r.error = e
              return r
            })

      if (cancelToken) {
        this.abortControllers.delete(cancelToken)
      }

      if (!response.ok) throw data
      return data
    })
  }
}

/**
 * @title Locationforecast
 * @version 2.0
 * @license CC BY 4.0 (http://creativecommons.org/licenses/by/4.0)
 * @termsOfService /doc/TermsOfService
 * @baseUrl https://api.met.no/weatherapi/locationforecast/2.0
 * @contact Developer Support <weatherapi-adm@met.no> (http://met.no)
 *
 * Weather forecast for a specified place
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  classic = {
    /**
     * @description Weather forecast for a specified place
     *
     * @tags data
     * @name ClassicList
     * @request GET:/classic
     */
    classicList: (
      query: {altitude?: number; lat: number; lon: number},
      params: RequestParams = {}
    ) =>
      this.request<string, any>({
        path: `/classic`,
        method: 'GET',
        query: query,
        ...params,
      }),
  }
  classicFormat = {
    /**
     * @description Weather forecast for a specified place
     *
     * @tags data
     * @name ClassicDetail
     * @request GET:/classic.{format}
     */
    classicDetail: (
      format: 'xml',
      query: {altitude?: number; lat: number; lon: number},
      params: RequestParams = {}
    ) =>
      this.request<string, any>({
        path: `/classic.${format}`,
        method: 'GET',
        query: query,
        ...params,
      }),
  }
  compact = {
    /**
     * @description Weather forecast for a specified place
     *
     * @tags data
     * @name CompactList
     * @request GET:/compact
     */
    compactList: (
      query: {altitude?: number; lat: number; lon: number},
      params: RequestParams = {}
    ) =>
      this.request<METJSONForecast, any>({
        path: `/compact`,
        method: 'GET',
        query: query,
        ...params,
      }),
  }
  compactFormat = {
    /**
     * @description Weather forecast for a specified place
     *
     * @tags data
     * @name CompactDetail
     * @request GET:/compact.{format}
     */
    compactDetail: (
      format: 'json',
      query: {altitude?: number; lat: number; lon: number},
      params: RequestParams = {}
    ) =>
      this.request<METJSONForecast, any>({
        path: `/compact.${format}`,
        method: 'GET',
        query: query,
        ...params,
      }),
  }
  complete = {
    /**
     * @description Weather forecast for a specified place
     *
     * @tags data
     * @name CompleteList
     * @request GET:/complete
     */
    completeList: (
      query: {altitude?: number; lat: number; lon: number},
      params: RequestParams = {}
    ) =>
      this.request<METJSONForecast, any>({
        path: `/complete`,
        method: 'GET',
        query: query,
        ...params,
      }),
  }
  completeFormat = {
    /**
     * @description Weather forecast for a specified place
     *
     * @tags data
     * @name CompleteDetail
     * @request GET:/complete.{format}
     */
    completeDetail: (
      format: 'json',
      query: {altitude?: number; lat: number; lon: number},
      params: RequestParams = {}
    ) =>
      this.request<METJSONForecast, any>({
        path: `/complete.${format}`,
        method: 'GET',
        query: query,
        ...params,
      }),
  }
  healthz = {
    /**
     * @description Check health status for product
     *
     * @tags metadata
     * @name HealthzList
     * @request GET:/healthz
     */
    healthzList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/healthz`,
        method: 'GET',
        ...params,
      }),
  }
  schema = {
    /**
     * @description Schema for XML data
     *
     * @tags metadata
     * @name SchemaList
     * @request GET:/schema
     */
    schemaList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/schema`,
        method: 'GET',
        ...params,
      }),
  }
  status = {
    /**
     * @description Weather forecast for a specified place
     *
     * @tags data
     * @name StatusList
     * @request GET:/status
     */
    statusList: (params: RequestParams = {}) =>
      this.request<string, any>({
        path: `/status`,
        method: 'GET',
        ...params,
      }),
  }
  statusFormat = {
    /**
     * @description Weather forecast for a specified place
     *
     * @tags data
     * @name StatusDetail
     * @request GET:/status.{format}
     */
    statusDetail: (format: 'json', params: RequestParams = {}) =>
      this.request<string, any>({
        path: `/status.${format}`,
        method: 'GET',
        ...params,
      }),
  }
}
