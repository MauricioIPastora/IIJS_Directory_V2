import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../dialog";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon } from "lucide-react";

// Import the cognito functions we'll need to add
import { CognitoUserPool, CognitoUserAttribute, CognitoUser } from 'amazon-cognito-identity-js';

// Get pool data from environment variables
const poolData = {
  UserPoolId: import.meta.env.VITE_AWS_USER_POOL_ID,
  ClientId: import.meta.env.VITE_AWS_USER_POOL_WEB_CLIENT_ID
};

const userPool = new CognitoUserPool(poolData);

interface SignUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUpSuccess: (email: string) => void;
}

export function SignUpDialog({ isOpen, onClose, onSignUpSuccess }: SignUpDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [needVerification, setNeedVerification] = useState(false);
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const attributeList = [
        new CognitoUserAttribute({
          Name: 'email',
          Value: email
        })
      ];
      
      // Sign up the user
      userPool.signUp(
        email,
        password,
        attributeList,
        [],
        (err) => {
          setIsLoading(false);
          
          if (err) {
            setError(err.message || "Could not create account. Please try again.");
            return;
          }
          
          // Show verification step
          setNeedVerification(true);
        }
      );
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setIsLoading(false);
    }
  };
  
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      // Create a CognitoUser object
      const userData = {
        Username: email,
        Pool: userPool
      };
      
      const cognitoUser = new CognitoUser(userData);
      
      // Confirm registration
      cognitoUser.confirmRegistration(verificationCode, true, (err) => {
        setIsLoading(false);
        
        if (err) {
          setError(err.message || "Failed to verify account. Please try again.");
          return;
        }
        
        // Call the success callback with the email so it can be auto-filled in the login form
        onSignUpSuccess(email);
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setIsLoading(false);
    }
  };
  
  // Reset states when dialog closes
  const handleClose = () => {
    if (!isLoading) {
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setVerificationCode("");
      setError("");
      setNeedVerification(false);
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px] bg-white !p-2">
        <DialogHeader className="!pt-2">
          <DialogTitle>{needVerification ? "Verify Your Email" : "Create Account"}</DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        {!needVerification ? (
          <form onSubmit={handleSignUp} className="!space-y-4 !py-4">
            <div className="!space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="!pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="!space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="!pl-10"
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
            
            <div className="!space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********"
                  className="!pl-10"
                  required
                />
              </div>
            </div>
            
            <DialogFooter className="pt-4 !space-x-2">
              <Button variant="outline" type="button" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4 py-4">
            <p className="text-sm">
              We've sent a verification code to your email address. Please enter it below to confirm your account.
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
            
            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify Email"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
