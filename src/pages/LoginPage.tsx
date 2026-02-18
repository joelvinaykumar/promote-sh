import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Sparkles, Mail, Lock } from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'

const formSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const LoginPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useUser()
  const navigate = useNavigate()
  const location = useLocation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  })

  // Where to go after login
  const from = (location.state as any)?.from?.pathname || '/'

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      })

      const { data, error } = await response.json()
      
      if (error) {
        alert(error.message)
        return
      }

      if (data.session && data.user) {
        // Map Supabase User to internal User type
        login(data.session.access_token, data.user)
        navigate(from, { replace: true })
      }
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='h-screen w-screen flex items-center justify-center bg-[#f6f8fa] p-4 font-sans'>
      <div className='absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50' />
      
      <Card className='w-full max-w-md relative z-10 border-slate-200 shadow-xl overflow-hidden'>
        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500' />
        
        <CardHeader className='pb-2 pt-8 text-center'>
          <div className='mx-auto bg-slate-900 size-12 rounded-xl flex items-center justify-center mb-4 shadow-lg'>
            <Sparkles className='text-white size-6' />
          </div>
          <CardTitle className='text-2xl font-bold text-slate-900'>Welcome Back</CardTitle>
          <CardDescription className='text-slate-500'>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className='pt-6 space-y-4'>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <FormControl>
                        <Input 
                          placeholder="email@example.com" 
                          {...field} 
                          className="pl-10 h-11 bg-white border-slate-200 focus:ring-slate-900 transition-all"
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          className="pl-10 h-11 bg-white border-slate-200 focus:ring-slate-900 transition-all"
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </CardContent>
            
            <CardFooter className='pb-8 pt-2 flex flex-col space-y-4'>
              <Button 
                type='submit' 
                className='w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all shadow-md group'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className='size-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                ) : (
                  <div className='flex items-center gap-2'>
                    Sign In
                    <Sparkles className='size-4 opacity-0 group-hover:opacity-100 transition-opacity' />
                  </div>
                )}
              </Button>
              
              <div className='flex items-center gap-2 text-xs text-slate-400'>
                 <div className='h-px flex-1 bg-slate-200' />
                 <span>Secured Access</span>
                 <div className='h-px flex-1 bg-slate-200' />
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
