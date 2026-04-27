/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'
export const timeout = 50000
export const serverApi = axios.create({
  baseURL: '/api/v1',
  timeout,
})

serverApi.interceptors.response.use((res) => {
  return res.data
})

export const aiApi = axios.create({
  baseURL: '/api/ai/v1',
  timeout,
})

aiApi.interceptors.response.use((res) => {
  return res.data
})

export interface Response<T = any> {
  timestamp: string
  path: string
  message: string
  code: number
  success: boolean
  data: T
}
