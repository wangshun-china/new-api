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
import { Server } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { SectionPageLayout } from '@/components/layout'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useStatus } from '@/hooks/use-status'

import { ApiKeysDialogs } from './components/api-keys-dialogs'
import { ApiKeysPrimaryButtons } from './components/api-keys-primary-buttons'
import { ApiKeysProvider } from './components/api-keys-provider'
import { ApiKeysTable } from './components/api-keys-table'

export function ApiKeys() {
  const { t } = useTranslation()
  const { status } = useStatus()
  const configuredAddress =
    status?.server_address ?? status?.data?.server_address
  const serverAddress =
    typeof configuredAddress === 'string' && configuredAddress.trim()
      ? configuredAddress.trim()
      : window.location.origin
  const apiBaseUrl = `${serverAddress.replace(/\/+$/, '').replace(/\/v1$/i, '')}/v1`

  return (
    <ApiKeysProvider>
      <SectionPageLayout fixedContent>
        <SectionPageLayout.Title>{t('API Keys')}</SectionPageLayout.Title>
        <SectionPageLayout.Actions>
          <ApiKeysPrimaryButtons />
        </SectionPageLayout.Actions>
        <SectionPageLayout.Content>
          <div className='flex h-full min-h-0 flex-col gap-3'>
            <Alert className='shrink-0'>
              <Server aria-hidden='true' />
              <AlertTitle>{t('API Base URL')}</AlertTitle>
              <AlertDescription>
                <div className='mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                  <span>
                    {t(
                      'Use this URL with your API key in OpenAI-compatible clients.'
                    )}
                  </span>
                  <div className='bg-muted/60 flex min-w-0 items-center gap-1 rounded-md border px-2 py-1'>
                    <code className='min-w-0 truncate text-xs'>
                      {apiBaseUrl}
                    </code>
                    <CopyButton
                      value={apiBaseUrl}
                      className='size-7'
                      iconClassName='size-3.5'
                      tooltip={t('Copy to clipboard')}
                      successTooltip={t('Copied!')}
                    />
                  </div>
                </div>
              </AlertDescription>
            </Alert>
            <div className='min-h-0 flex-1'>
              <ApiKeysTable />
            </div>
          </div>
        </SectionPageLayout.Content>
      </SectionPageLayout>

      <ApiKeysDialogs />
    </ApiKeysProvider>
  )
}
