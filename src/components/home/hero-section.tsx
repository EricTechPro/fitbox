'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChefHat, Clock, MapPin, Star } from 'lucide-react'
import { useLanguageStore } from '@/stores/language-store'

export function HeroSection() {
  const { language } = useLanguageStore()

  const features = [
    {
      icon: ChefHat,
      title: language === 'en' ? 'Chef-Prepared' : '厨师精制',
      description: language === 'en' ? 'Fresh Asian fusion meals made daily' : '每日新鲜制作的亚洲融合餐'
    },
    {
      icon: Clock,
      title: language === 'en' ? 'Ready in Minutes' : '分钟即达',
      description: language === 'en' ? 'Heat and enjoy in just 2-3 minutes' : '仅需2-3分钟加热即可享用'
    },
    {
      icon: MapPin,
      title: language === 'en' ? 'Vancouver Delivery' : '温哥华配送',
      description: language === 'en' ? 'Sunday & Wednesday, 5:30-10:00 PM' : '周日和周三，下午5:30-10:00'
    }
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:20px_20px]" />

      <div className="container relative px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          {/* Badge */}
          <Badge variant="outline" className="mx-auto">
            <Star className="mr-1 h-3 w-3" />
            {language === 'en' ? 'Now serving Greater Vancouver' : '现服务大温哥华地区'}
          </Badge>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {language === 'en' ? (
                <>
                  Authentic Asian Fusion
                  <br />
                  <span className="text-primary">Delivered Fresh</span>
                </>
              ) : (
                <>
                  正宗亚洲融合美食
                  <br />
                  <span className="text-primary">新鲜配送</span>
                </>
              )}
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
              {language === 'en'
                ? 'Experience premium Asian fusion cuisine crafted by professional chefs and delivered to your door. From traditional flavors to modern twists, every meal is a culinary journey.'
                : '体验由专业厨师精心制作并送到您家门口的优质亚洲融合美食。从传统口味到现代创新，每一餐都是一次美食之旅。'
              }
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/menu">
                {language === 'en' ? 'Browse Menu' : '浏览菜单'}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href="/how-it-works">
                {language === 'en' ? 'How It Works' : '使用方法'}
              </Link>
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-none bg-muted/20">
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 border-t border-border/40">
            <p className="text-sm text-muted-foreground mb-4">
              {language === 'en' ? 'Trusted by customers across Vancouver' : '深受温哥华各地客户信赖'}
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>4.9/5 {language === 'en' ? 'Rating' : '评分'}</span>
              </div>
              <div>
                500+ {language === 'en' ? 'Happy Customers' : '满意客户'}
              </div>
              <div>
                {language === 'en' ? 'Fresh Daily' : '每日新鲜'}
              </div>
              <div>
                {language === 'en' ? 'Contactless Delivery' : '无接触配送'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}