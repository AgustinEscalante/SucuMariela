// src/hooks/usePushNotifications.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const VAPID_PUBLIC_KEY = 'BGHC_889icNTV5nO-6VHj-nuZnq6PVTLwbv9xSkTSbz-qiN1IZ_F4yk2GSi_tSEhxCecXk87OHwJdXkvFBx94QA'

function urlBase64ToUint8Array(base64String) {
  const padding  = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64   = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData  = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushNotifications() {
  const [supported,   setSupported]   = useState(false)
  const [permission,  setPermission]  = useState('default')
  const [subscribed,  setSubscribed]  = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setSupported(true)
      setPermission(Notification.permission)

      // Verificar si ya hay una suscripcion activa
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setSubscribed(!!sub)
        })
      })
    }
  }, [])

  const subscribe = async () => {
    setLoading(true)
    setError(null)
    try {
      // Registrar SW si no esta registrado
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Pedir permiso
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') throw new Error('Permiso denegado')

      // Suscribirse al push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      // Guardar la suscripcion en Supabase
      const { error: dbError } = await supabase
        .from('push_subscriptions')
        .upsert({
          endpoint:  sub.endpoint,
          p256dh:    btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')))),
          auth:      btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')))),
          user_agent: navigator.userAgent,
        }, { onConflict: 'endpoint' })

      if (dbError) throw dbError
      setSubscribed(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const unsubscribe = async () => {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', sub.endpoint)
        await sub.unsubscribe()
      }
      setSubscribed(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { supported, permission, subscribed, loading, error, subscribe, unsubscribe }
}
