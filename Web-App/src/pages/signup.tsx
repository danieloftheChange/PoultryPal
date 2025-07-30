import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  firstName: z.string()
    .min(2, { message: 'First name must be at least 2 characters' })
    .max(50, { message: 'First name must be less than 50 characters' }),
  lastName: z.string()
    .min(2, { message: 'Last name must be at least 2 characters' })
    .max(50, { message: 'Last name must be less than 50 characters' }),
  email: z.string()
    .email({ message: 'Please enter a valid email address' }),
  password: z.string()
    .min(4, { message: 'Password must be at least 4 characters' })
    .max(100, { message: 'Password must be less than 100 characters' }),
  passwordConfirm: z.string()
    .min(1, { message: 'Please confirm your password' }),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords don't match",
  path: ["passwordConfirm"],
});

type FormData = z.infer<typeof formSchema>;

interface SignUpFormProps {
  heading?: string;
  subheading?: string;
  logo: {
    src: string;
    alt: string;
  };
  signupText?: string;
  loginText?: string;
  loginUrl?: string;
}

const SignUpPage = ({
  heading = "PoultryPal",
  subheading = "Sign up for free",
  logo = {
    src: "https://shadcnblocks.com/images/block/block-1.svg",
    alt: "logo",
  },
  signupText = "Create an account",
  loginText = "Already have an account?",
  loginUrl = "/login",
}: SignUpFormProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Refs for handling mousedown/mouseup events
  const passwordButtonRef = useRef<HTMLButtonElement>(null);
  const confirmPasswordButtonRef = useRef<HTMLButtonElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      passwordConfirm: '',
    }
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Omit passwordConfirm when sending data to the API
      const { passwordConfirm, ...submitData } = data;
      
      await axios.post('http://92.112.180.180:3000/api/v1/user/signup', submitData);
      
      setSuccess("Account created successfully! Redirecting to login page...");
      form.reset();
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error(
        'Sign up error:',
        error instanceof Error ? error.message : error
      );
      
      // Set appropriate error message
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          setError("Email already in use. Please use a different email or login.");
        } else {
          setError("An error occurred during sign up. Please try again later.");
        }
      } else {
        setError("Cannot connect to server. Please check your internet connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle mouse events for showing password
  const handlePasswordMouseDown = () => {
    setShowPassword(true);
  };
  
  const handlePasswordMouseUp = () => {
    setShowPassword(false);
  };
  
  // Handle mouse events for showing password confirmation
  const handlePasswordConfirmMouseDown = () => {
    setShowPasswordConfirm(true);
  };
  
  const handlePasswordConfirmMouseUp = () => {
    setShowPasswordConfirm(false);
  };

  // Add event listeners to handle cases where mouse up occurs outside the button
  const handleGlobalMouseUp = () => {
    setShowPassword(false);
    setShowPasswordConfirm(false);
  };

  // Ensure mouse up still works if cursor moves out of button while down
  useState(() => {
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const passwordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 1; // Uppercase
    if (/[a-z]/.test(password)) strength += 1; // Lowercase
    if (/[0-9]/.test(password)) strength += 1; // Numbers
    if (/[^A-Za-z0-9]/.test(password)) strength += 1; // Special characters
    
    return strength;
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength === 0) return "Very weak";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    if (strength === 4) return "Strong";
    return "Very strong";
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength === 0) return "bg-red-500";
    if (strength === 1) return "bg-red-400";
    if (strength === 2) return "bg-yellow-500";
    if (strength === 3) return "bg-yellow-400";
    if (strength === 4) return "bg-green-500";
    return "bg-green-600";
  };

  const currentPassword = form.watch("password");
  const strength = passwordStrength(currentPassword);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <Link to="/" className="mb-6 flex items-center gap-2">
            <img
              src={logo.src}
              alt={logo.alt}
              className="h-10 w-auto"
            />
            <span className="text-2xl font-bold text-green-700">{heading}</span>
          </Link>
          <h2 className="mt-2 text-center text-xl font-semibold text-gray-900">{subheading}</h2>
        </div>

        {error && (
          <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 mb-4 bg-green-50 border border-green-200 rounded-md text-green-700 flex items-start">
            <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="h-11 pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        ref={passwordButtonRef}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 select-none touch-none"
                        onMouseDown={handlePasswordMouseDown}
                        onMouseUp={handlePasswordMouseUp}
                        onMouseLeave={handlePasswordMouseUp}
                        onTouchStart={handlePasswordMouseDown}
                        onTouchEnd={handlePasswordMouseUp}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  {currentPassword && (
                    <div className="mt-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-700">Password strength:</span>
                        <span className="text-xs font-medium" style={{ color: strength > 2 ? '#22c55e' : strength > 0 ? '#eab308' : '#ef4444' }}>
                          {getPasswordStrengthText(strength)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${getPasswordStrengthColor(strength)}`} style={{ width: `${(strength / 5) * 100}%` }}></div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        For a stronger password, include uppercase and lowercase letters, numbers, and special characters.
                      </div>
                    </div>
                  )}
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />
            
            {/* Password Confirmation Field with Click-and-Hold */}
            <FormField
              control={form.control}
              name="passwordConfirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPasswordConfirm ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="h-11 pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        ref={confirmPasswordButtonRef}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 select-none touch-none"
                        onMouseDown={handlePasswordConfirmMouseDown}
                        onMouseUp={handlePasswordConfirmMouseUp}
                        onMouseLeave={handlePasswordConfirmMouseUp}
                        onTouchStart={handlePasswordConfirmMouseDown}
                        onTouchEnd={handlePasswordConfirmMouseUp}
                        tabIndex={-1}
                      >
                        {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit"
              className="w-full h-11 bg-green-700 hover:bg-green-800 text-white" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </span>
              ) : signupText}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {loginText}{' '}
            <Link to={loginUrl} className="font-medium text-green-700 hover:underline">
              Log in
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            By signing up, you agree to our 
            <a href="#" className="text-green-700 hover:underline mx-1">Terms of Service</a>
            and
            <a href="#" className="text-green-700 hover:underline mx-1">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;