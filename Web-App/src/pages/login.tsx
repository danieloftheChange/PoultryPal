import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import React from "react";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(4, { message: "Password must be at least 4 characters" }),
  rememberMe: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Login3Props {
  heading?: string;
  subheading?: string;
  logo: {
    src: string;
    alt: string;
  };
  loginText?: string;
  signupText?: string;
  signupUrl?: string;
}

const LoginPage = ({
  heading = "PoultryPal",
  subheading = "Welcome back",
  logo = {
    src: "https://www.shadcnblocks.com/images/block/block-1.svg",
    alt: "logo",
  },
  loginText = "Log in",
  signupText = "Don't have an account?",
  signupUrl = "/signup",
}: Login3Props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setLoginError(null);
    try {
      const response = await axios.post('http://92.112.180.180:3000/api/v1/user/login', {
        email: data.email,
        password: data.password
      });

      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      // If remember me is checked, save email to localStorage
      if (data.rememberMe) {
        localStorage.setItem('rememberedEmail', data.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      reset();
      navigate('/dashboard');
    } catch (error) {
      console.error(
        'Login error:',
        error instanceof Error ? error.message : error
      );
      
      // Set appropriate error message
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          setLoginError("Invalid email or password. Please try again.");
        } else if (error.response.status === 404) {
          setLoginError("Account not found. Please check your email or sign up.");
        } else {
          setLoginError("An error occurred during login. Please try again later.");
        }
      } else {
        setLoginError("Cannot connect to server. Please check your internet connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Check for remembered email on component mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setValue('email', rememberedEmail);
      setValue('rememberMe', true);
    }
  }, [setValue]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="mx-auto w-full max-w-md rounded-xl p-8 shadow-lg bg-white">
        <div className="mb-8 flex flex-col items-center">
          <Link to="/" className="mb-6 flex items-center gap-2">
            <img
              src={logo.src}
              alt={logo.alt}
              className="h-10 w-auto"
            />
            <span className="text-2xl font-bold text-green-700">{heading}</span>
          </Link>
          <p className="text-gray-600 text-center">{subheading}</p>
        </div>

        {loginError && (
          <Alert variant="destructive" className="mb-6 bg-red-50 text-red-700 border border-red-200">
            <AlertDescription>{loginError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className={`h-11 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              {...register("email")}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <a href="#" className="text-sm font-medium text-green-700 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`h-11 pr-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                {...register("password")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="rememberMe" 
                {...register("rememberMe")}
              />
              <label
                htmlFor="rememberMe"
                className="text-sm font-medium text-gray-700 cursor-pointer select-none"
              >
                Remember me
              </label>
            </div>
          </div>

          <Button 
            type="submit" 
            className="mt-6 w-full h-11 bg-green-700 hover:bg-green-800 text-white font-medium"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </span>
            ) : (
              loginText
            )}
          </Button>
        </form>

        <div className="mt-8 flex justify-center gap-1 text-sm">
          <p className="text-gray-600">{signupText}</p>
          <Link to={signupUrl} className="font-medium text-green-700 hover:underline">
            Sign up
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            By logging in, you agree to our 
            <a href="#" className="text-green-700 hover:underline mx-1">Terms of Service</a>
            and
            <a href="#" className="text-green-700 hover:underline mx-1">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;