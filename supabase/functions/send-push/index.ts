
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push'

const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_EMAIL       = Deno.env.get('VAPID_EMAIL')!

webpush.setVapidDetails(
  'mailto:' + VAPID_EMAIL,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)

Deno.serve(async (req) => {
  try {
    const { notification_id } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Obtener la notificacion
    const { data: notif, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notification_id)
      .single()

    if (notifError || !notif) {
      return new Response(JSON.stringify({ error: 'Notificacion no encontrada' }), { status: 404 })
    }

    // Obtener todas las suscripciones
    const { data: subs, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (subsError || !subs?.length) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 })
    }

    // Mandar push a cada dispositivo suscripto
    const payload = JSON.stringify({
      title: notif.title,
      body:  notif.body,
      url:   '/admin',
      tag:   notif.type,
    })

    const results = await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        )
      )
    )

    // Limpiar suscripciones vencidas (410 Gone)
    const expired = results
      .map((r, i) => ({ r, sub: subs[i] }))
      .filter(({ r }) => r.status === 'rejected' && r.reason?.statusCode === 410)

    if (expired.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expired.map(({ sub }) => sub.endpoint))
    }

    const sent = results.filter((r) => r.status === 'fulfilled').length
    return new Response(JSON.stringify({ sent }), { status: 200 })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})