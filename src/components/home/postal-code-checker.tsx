'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { MapPin, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { validatePostalCode, formatPostalCode } from '@/lib/mock-data/postal-validation'
import { useLanguageStore } from '@/stores/language-store'
import type { DeliveryValidation } from '@/types/common'

export function PostalCodeChecker() {
  const { language } = useLanguageStore()
  const [postalCode, setPostalCode] = React.useState('')
  const [validation, setValidation] = React.useState<DeliveryValidation | null>(null)
  const [isChecking, setIsChecking] = React.useState(false)

  const handleCheck = async () => {
    if (!postalCode.trim()) return

    setIsChecking(true)

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const result = validatePostalCode(postalCode)
    setValidation(result)

    if (result.isValid) {
      setPostalCode(formatPostalCode(postalCode))
    }

    setIsChecking(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPostalCode(value)

    // Clear validation when user starts typing again
    if (validation) {
      setValidation(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCheck()
    }
  }

  return (
    <section className="py-16 bg-muted/20">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <Badge variant="outline" className="mx-auto">
              <MapPin className="mr-1 h-3 w-3" />
              {language === 'en' ? 'Delivery Check' : '配送检查'}
            </Badge>

            <h2 className="text-3xl font-bold tracking-tight">
              {language === 'en' ? 'Check Delivery Availability' : '检查配送服务'}
            </h2>

            <p className="text-lg text-muted-foreground">
              {language === 'en'
                ? 'Enter your postal code to see if we deliver to your area and check delivery fees.'
                : '输入您的邮政编码查看我们是否配送到您的区域并检查配送费用。'
              }
            </p>
          </div>

          {/* Postal Code Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {language === 'en' ? 'Enter Your Postal Code' : '输入您的邮政编码'}
              </CardTitle>
              <CardDescription>
                {language === 'en'
                  ? 'We currently serve Greater Vancouver Area (BC)'
                  : '我们目前服务大温哥华地区（BC省）'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="V6B 1A1"
                  value={postalCode}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="text-center text-lg font-mono uppercase"
                  maxLength={7}
                />
                <Button
                  onClick={handleCheck}
                  disabled={!postalCode.trim() || isChecking}
                  className="min-w-[100px]"
                >
                  {isChecking ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <>
                      {language === 'en' ? 'Check' : '检查'}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              {/* Validation Result */}
              {validation && (
                <Alert variant={validation.isValid ? 'default' : 'destructive'}>
                  <div className="flex items-start space-x-2">
                    {validation.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <AlertDescription>
                        {validation.message}
                        {validation.isValid && validation.deliveryFee > 0 && (
                          <div className="mt-2">
                            <Badge variant="secondary">
                              {language === 'en' ? 'Delivery Fee' : '配送费'}: ${validation.deliveryFee.toFixed(2)}
                            </Badge>
                          </div>
                        )}
                        {validation.isValid && validation.deliveryFee === 0 && (
                          <div className="mt-2">
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              🎉 {language === 'en' ? 'Free Delivery!' : '免费配送！'}
                            </Badge>
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              )}

              {/* Call to Action */}
              {validation?.isValid && (
                <div className="pt-4 border-t">
                  <Button asChild className="w-full" size="lg">
                    <a href="/menu">
                      {language === 'en' ? 'Browse Menu' : '浏览菜单'} →
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coverage Area Info */}
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">
              {language === 'en' ? 'Delivery Coverage' : '配送覆盖范围'}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1">
                <div className="font-medium">{language === 'en' ? 'Vancouver' : '温哥华'}</div>
                <div className="text-muted-foreground">V5A-V6Z</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium">{language === 'en' ? 'Richmond' : '列治文'}</div>
                <div className="text-muted-foreground">V6V-V7E</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium">{language === 'en' ? 'Burnaby' : '本拿比'}</div>
                <div className="text-muted-foreground">V3J-V5H</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium">{language === 'en' ? 'North Van' : '北温'}</div>
                <div className="text-muted-foreground">V7G-V7W</div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {language === 'en'
                ? '+ Surrey, Delta, Coquitlam, New Westminster, West Vancouver and more'
                : '+ 素里、三角洲、高贵林、新威斯敏斯特、西温哥华等更多地区'
              }
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}