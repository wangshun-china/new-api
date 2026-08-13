/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

interface PromoProps {
  className?: string
}

export function Promo(props: PromoProps) {
  const { t } = useTranslation()

  const images = [
    {
      src: '/promo-subscription.jpg',
      alt: t('Subscription plan purchase guide'),
    },
    {
      src: '/promo-xixi-box.jpg',
      alt: t('Xixi Box promotional image'),
    },
  ]

  return (
    <div className={cn('w-full', props.className)}>
      <div className='mb-6 text-center'>
        <p className='text-muted-foreground mb-2 text-[11px] font-medium tracking-[0.15em] uppercase'>
          {t('Plans & Promotions')}
        </p>
        <h2 className='text-xl leading-tight font-bold tracking-tight md:text-2xl'>
          {t('Choose the plan that fits you')}
        </h2>
        <p className='text-muted-foreground/80 mx-auto mt-3 max-w-md text-sm leading-relaxed'>
          {t('To purchase a plan, search "Xixi Box" on Xianyu.')}
        </p>
      </div>

      <div className='grid gap-5 sm:grid-cols-2'>
        {images.map((img) => (
          <div
            key={img.src}
            className='border-border/40 bg-muted/10 overflow-hidden rounded-2xl border p-2'
          >
            <img
              src={img.src}
              alt={img.alt}
              loading='lazy'
              className='mx-auto h-auto max-h-[440px] w-full rounded-xl object-contain'
            />
          </div>
        ))}
      </div>
    </div>
  )
}
