import client, { AUTH_ENDPOINTS } from './client.js'

/**
 * Sign up a new user.
 * @param {{ name: string, password: string }} payload
 * @returns {{ token: string, user: object }}
 */
export async function apiSignup({ name, password }) {
  const res = await client.post(AUTH_ENDPOINTS.signup, { name, password })
  return res.data
}

/**
 * Sign in an existing user.
 * @param {{ name: string, password: string }} payload
 * @returns {{ token: string, user: object }}
 */
export async function apiLogin({ name, password }) {
  const res = await client.post(AUTH_ENDPOINTS.login, { name, password })
  return res.data
}

/**
 * Fetch the currently authenticated user (requires Authorization header).
 * @returns {{ user: object } | object}
 */
export async function apiGetMe() {
  const res = await client.get(AUTH_ENDPOINTS.me)
  return res.data
}

