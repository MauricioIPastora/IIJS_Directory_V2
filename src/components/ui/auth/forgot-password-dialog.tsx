import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../dialog";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon } from "lucide-react";

// Import the cognito functions we'll need
import { CognitoUser } from 'amazon-cognito-identity-js';

// Get pool data from environment variables
const poolData = {
  UserPoolId: import.meta.env.VITE_AWS_USER_POOL_ID,
  ClientId: import.meta.env.VITE_AWS_USER_POOL_WEB_CLIENT_ID
};

import { CognitoUserPool } from 'amazon-cognito-identity-js';
const userPool = new CognitoUserPool(poolData);

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onResetSuccess: () => void;
  email: string; // Pre-filled email if available
}

export function ForgotPasswordDialog({ 
  isOpen, 
  onClose, 
  onResetSuccess,
  email: initialEmail 
}: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState<string>(initialEmail || "");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"request" | "reset">("request");
  
  const resetForm = () => {
    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setStep("request");
  };
  
  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };
  
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const userData = {
        Username: email,
        Pool: userPool
      };
      
      const cognitoUser = new CognitoUser(userData);
      
      // Request password reset
      cognitoUser.forgotPassword({
        onSuccess: () => {
          setIsLoading(false);
          setStep("reset");
        },
        onFailure: (err) => {
          setIsLoading(false);
          setError(err.message || "Failed to request password reset");
        }
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setIsLoading(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userData = {
        Username: email,
        Pool: userPool
      };
      
      const cognitoUser = new CognitoUser(userData);
      
      // Confirm password reset
      cognitoUser.confirmPassword(verificationCode, newPassword, {
        onSuccess: () => {
          setIsLoading(false);
          onResetSuccess();
        },
        onFailure: (err) => {
          setIsLoading(false);
          setError(err.message || "Failed to reset password");
        }
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px] bg-white !p-4">
        <DialogHeader>
          <DialogTitle>
            {step === "request" ? "Forgot Password" : "Reset Password"}
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        {step === "request" ? (
          <form onSubmit={handleRequestReset} className="space-y-4 py-4">
            <p className="text-sm !pt-4">
              Enter your email address and we'll send you a code to reset your password.
            </p>
            
            <div className="space-y-2 !py-2">
              <Label htmlFor="reset-email" className="!py-2">Email</Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="!pl-10"
                  required
                />
              </div>
            </div>
            
            <DialogFooter className="!pt-4 !space-x-2">
              <Button variant="outline" type="button" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Code"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 py-4">
            <p className="text-sm">
              Enter the verification code sent to your email and create a new password.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter code"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="********"
                  className="pl-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground px-1">
                Password must be at least 8 characters long
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="confirm-new-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}