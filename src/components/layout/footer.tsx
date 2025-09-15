'use client'

import React from 'react'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { MapPin, Phone, Mail, Clock, Truck } from 'lucide-react'
import { useLanguageStore } from '@/stores/language-store'

export function Footer() {
  const { language } = useLanguageStore()

  const currentYear = new Date().getFullYear()

  const contactInfo = {
    phone: '+1 (604) 123-4567',
    email: 'hello@fitboxmeals.com',
    address: language === 'en'
      ? 'Greater Vancouver Area, BC'
      : '大温哥华地区，BC省'
  }

  const deliveryInfo = {
    days: language === 'en'
      ? 'Sunday & Wednesday'
      : '周日和周三',
    times: '5:30 PM - 10:00 PM',
    areas: language === 'en'
      ? 'Greater Vancouver Area'
      : '大温哥华地区'
  }

  const footerSections = [
    {
      title: language === 'en' ? 'Quick Links' : '快速链接',
      links: [
        { href: '/menu', label: language === 'en' ? 'Weekly Menu' : '每周菜单' },
        { href: '/how-it-works', label: language === 'en' ? 'How It Works' : '使用方法' },
        { href: '/about', label: language === 'en' ? 'About Us' : '关于我们' },
        { href: '/contact', label: language === 'en' ? 'Contact' : '联系我们' }
      ]
    },
    {
      title: language === 'en' ? 'Customer Care' : '客户服务',
      links: [
        { href: '/faq', label: language === 'en' ? 'FAQ' : '常见问题' },
        { href: '/nutrition', label: language === 'en' ? 'Nutrition Info' : '营养信息' },
        { href: '/allergens', label: language === 'en' ? 'Allergen Guide' : '过敏原指南' },
        { href: '/support', label: language === 'en' ? 'Support' : '支持' }
      ]
    },
    {
      title: language === 'en' ? 'Legal' : '法律条款',
      links: [
        { href: '/privacy', label: language === 'en' ? 'Privacy Policy' : '隐私政策' },
        { href: '/terms', label: language === 'en' ? 'Terms of Service' : '服务条款' },
        { href: '/refund', label: language === 'en' ? 'Refund Policy' : '退款政策' }
      ]
    }
  ]

  return (
    <footer className="border-t bg-background">
      <div className="container px-4">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <span className="text-sm font-bold">FB</span>
              </div>
              <span className="text-xl font-bold tracking-tight">FitBox</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              {language === 'en'
                ? 'Authentic, healthy Asian fusion cuisine delivered fresh to your door in Greater Vancouver.'
                : '正宗健康的亚洲融合美食，新鲜配送到大温哥华地区您的家门口。'
              }
            </p>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{contactInfo.address}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{contactInfo.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{contactInfo.email}</span>
              </div>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-sm font-semibold">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator />

        {/* Delivery Information */}
        <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {language === 'en' ? 'Delivery Schedule' : '配送时间'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {deliveryInfo.days} • {deliveryInfo.times}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {language === 'en' ? 'Delivery Area' : '配送范围'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {deliveryInfo.areas}
            </p>
          </div>
        </div>

        <Separator />

        {/* Bottom Footer */}
        <div className="py-6 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p className="text-xs text-muted-foreground">
            © {currentYear} FitBox Meals. {language === 'en' ? 'All rights reserved.' : '版权所有。'}
          </p>
          <div className="flex items-center space-x-4">
            <p className="text-xs text-muted-foreground">
              {language === 'en'
                ? 'Made with ❤️ in Vancouver'
                : '用❤️在温哥华制作'
              }
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}