// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/lib/auth';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            await authService.login({
                email: data.email,
                password: data.password,
                rememberMe: data.rememberMe,
            });
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFillDemo = (email: string, pass: string) => {
        setValue('email', email, { shouldValidate: true });
        setValue('password', pass, { shouldValidate: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-white font-bold text-xl">FM</span>
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Fuel Manager</CardTitle>
                    <CardDescription>
                        Enter your credentials to access the dashboard
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                {...register('email')}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="•••••••••"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pr-10"
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password.message}</p>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 text-sm">
                                <input
                                    type="checkbox"
                                    className="rounded border-input text-primary focus:ring-primary"
                                    {...register('rememberMe')}
                                />
                                <span>Remember me</span>
                            </label>
                            <button type="button" className="text-sm text-primary hover:underline">
                                Forgot password?
                            </button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                        <div className="text-xs text-muted-foreground text-center space-y-1">
                            <p className="font-semibold text-slate-500">Demo accounts (Click to auto-fill):</p>
                            <button
                                type="button"
                                onClick={() => handleFillDemo('admin@example.com', 'admin123')}
                                className="block mx-auto text-primary hover:text-primary/85 hover:underline py-0.5 cursor-pointer font-medium"
                            >
                                admin@example.com / admin123
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFillDemo('manager@example.com', 'manager123')}
                                className="block mx-auto text-primary hover:text-primary/85 hover:underline py-0.5 cursor-pointer font-medium"
                            >
                                manager@example.com / manager123
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFillDemo('viewer@example.com', 'viewer123')}
                                className="block mx-auto text-primary hover:text-primary/85 hover:underline py-0.5 cursor-pointer font-medium"
                            >
                                viewer@example.com / viewer123
                            </button>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
