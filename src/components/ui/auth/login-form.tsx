import type React from "react";

import { useState } from "react";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../card";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignUpDialog } from "./signup-dialog";
import { ForgotPasswordDialog } from "./forgot-password-dialog";

interface LoginFormProps { 
    onSubmit?: (email: string, password: string) => void;
    className?: string;
}

export default function LoginForm({ onSubmit, className }: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [isSignUpOpen, setIsSignUpOpen] = useState(false);
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            onSubmit?.(email, password)
            // If no submit is provided, simulate delay ay ay
            if (!onSubmit) {
                await new Promise((resolve) => setTimeout(resolve, 1000))
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center !bg-[#00609c] !w-full">
            <Card className={cn("w-full max-w-md justify-items-center !bg-white", className)}>
                <CardHeader className="!pt-12">
                    <img src="/logocircleenglish.jpg" alt="IIJS Logo" className="h-24 !mx-auto !rounded-full" />
                    <CardTitle className="text-2xl font-bold text-center !pt-2">IIJS Directory</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email and password to login to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-2 !p-2">
                            <Label htmlFor="email" className="!p-2 text-md" >Email</Label>
                            <div className="relative">
                                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@ii-js.org"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="!pl-10 border-2 focus:border-[#00609c] focus:ring-[#00609c]"
                                    required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between !pl-4">
                                <label htmlFor="password">
                                    Password
                                </label>
                                <a  
                                    href="#"
                                    onClick={() => setIsForgotPasswordOpen(true)}
                                    className="text-sm hover:!underline hover:!text[#00609c] !transition-colors !pr-4"
                                >Forgot password?</a>
                            </div>
                            <div className="relative !p-2">
                                <LockIcon
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="********"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="!pl-10 border-2 focus:border-[#00609c] focus:ring-[#00609c]"
                                        required
                                        />
                                <Button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <EyeOffIcon className="h-4 w-4" />
                                        ) : ( <EyeIcon className="h-4 w-4" />)}
                                    </Button>
                            </div>
                        </div>
                        <div className="!px-2 !pt-2">
                        <Button
                            type="submit"
                            className="w-full bg-[#80bc00] border-color-[#80bc00] text-blue"
                            >
                                {isLoading ? "Signing in..." : "Sign In"}
                            </Button>
                            </div>
                            </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    {/* <div className="relative !px-32">
                        <div className="absolute inset-0 flex items-center !-mt-8">
                            <span className="w-full border-t border-color-[#636569]"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-color-[#636569]">
                                Or continue with
                            </span>
                        </div>
                    </div>
                    <div className="w-full !p-2">
                        <Button
                            variant="outline"
                            className="w-full bg-background border-color-[#636569] border-2">
                            Microsoft
                            </Button>
                    </div> */}
                    <p className="text-center text-sm color-[#636569] !pb-4">
                        Don't have an account?{" "}
                        <a href="#"
                         onClick={() => setIsSignUpOpen(true)}
                         className="text-[#00609c] hover:!underline transition-colors">Sign up</a>
                </p>
                </CardFooter>
                </Card>

                <SignUpDialog 
                isOpen={isSignUpOpen} 
                onClose={() => setIsSignUpOpen(false)} 
                onSignUpSuccess={(email) => {
                    setEmail(email);
                    setIsSignUpOpen(false);
                }}
            />


                <ForgotPasswordDialog 
                    isOpen={isForgotPasswordOpen} 
                    onClose={() => setIsForgotPasswordOpen(false)}
                    onResetSuccess={() => {
                        setIsForgotPasswordOpen(false);
                    }} 
                    email={email} // Pass current email if already entered
            />
        </div>
    )
}