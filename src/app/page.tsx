import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Welcome to FitBox
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Authentic Asian fusion meals delivered fresh to your door
          </p>
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle>Check Delivery</CardTitle>
              <CardDescription>
                Enter your postal code to see if we deliver to your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter your postal code (e.g., M5V 3A8)"
                />
                <Button className="w-full">Check Delivery Availability</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
