import { request } from '@/utils/request'


export const login = (user: any) => request("/login/cellphone", user)

export const isRegister = (phone: any) => request("/cellphone/existence/check", { phone })

export const userInfo = (timestamp: any) => request("/user/account", {
  timestamp,
})

export const logout = (params: any) => request("/logout", params)

export const sendCaptcha = (phone: any) => request("/captcha/sent", { phone })

export const register = (registerInfo: any) => request("/register/cellphone", registerInfo)

export const qrLogin = (timestamp: any) => request("/login/qr/key", { timestamp })

export const qrCreate = (key: any, timestamp: any) => request("/login/qr/create", { key, timestamp })

export const qrCheck = (key: any, timestamp: any) => request("/login/qr/check", { key, timestamp })