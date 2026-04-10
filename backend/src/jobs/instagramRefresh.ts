import { prisma } from '../utils/prisma'

export async function refreshInstagramTokenIfNeeded(): Promise<void> {
  try {
    const tenants = await prisma.tenant.findMany({
      where: {
        instagram_access_token: { not: null },
        instagram_token_expiry: { not: null },
      },
    })

    for (const tenant of tenants) {
      if (!tenant.instagram_access_token || !tenant.instagram_token_expiry) continue

      // Refresh if expiring within 7 days
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      if (tenant.instagram_token_expiry > sevenDaysFromNow) continue

      try {
        const res = await fetch(
          `https://graph.instagram.com/refresh_access_token` +
          `?grant_type=ig_refresh_token` +
          `&access_token=${tenant.instagram_access_token}`
        )
        const data = await res.json() as any
        if (!data.access_token) {
          console.error(`[instagram] Token refresh failed for tenant ${tenant.slug}:`, data)
          continue
        }

        await prisma.tenant.update({
          where: { id: tenant.id },
          data: {
            instagram_access_token: data.access_token,
            instagram_token_expiry: new Date(Date.now() + data.expires_in * 1000),
          },
        })
        console.log(`[instagram] Token refreshed for tenant ${tenant.slug}`)
      } catch (e) {
        console.error(`[instagram] Token refresh error for tenant ${tenant.slug}:`, e)
      }
    }
  } catch (e) {
    console.error('[instagram] refreshInstagramTokenIfNeeded error:', e)
  }
}
