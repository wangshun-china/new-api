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

import { AnimateInView } from '@/components/animate-in-view'

interface PromoProps {
  className?: string
}

export function Promo(_props: PromoProps) {
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
    <section className='border-border/40 relative z-10 border-t px-6 py-24 md:py-32'>
      <div className='mx-auto max-w-6xl'>
        <AnimateInView className='mb-16 text-center md:mb-20'>
          <p className='text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase'>
            {t('Plans & Promotions')}
          </p>
          <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>
            {t('Choose the plan that fits you')}
          </h2>
          <p className='text-muted-foreground/80 mx-auto mt-5 max-w-2xl text-sm leading-relaxed md:text-base'>
            {t('To purchase a plan, search "Xixi Box" on Xianyu.')}
          </p>
        </AnimateInView>

        <div className='grid gap-6 sm:grid-cols-2'>
          {images.map((img, i) => (
            <AnimateInView
              key={img.src}
              delay={i * 100}
              animation='fade-up'
              className='border-border/40 bg-muted/10 overflow-hidden rounded-2xl border p-3'
            >
              <img
                src={img.src}
                alt={img.alt}
                loading='lazy'
                className='mx-auto h-auto max-h-[600px] w-full rounded-xl object-contain'
              />
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  )
}
