import React, { useState, useEffect, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./components/ui/card";
import { useToast } from "./components/ui/use-sonner";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const API = "https://api.zeiris.id.lv/crud/api_v1";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      if (!username || !password) {
        setError("Please enter both username and password");
        return;
      }
      
      setIsLoading(true);
      setError("");
      
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (data.token) {
        localStorage.setItem("token", data.token);
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        navigate("/tasks");
      } else {
        setError("Invalid username or password");
        toast({
          title: "Login failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError("Network error. Please try again.");
      toast({
        title: "Connection error",
        description: "Couldn't connect to the server",
        variant: "destructive",
      });
        console.error("Error during login:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      if (!username || !password) {
        setError("Please enter both username and password");
        return;
      }
      
      if (password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }
      
      setIsLoading(true);
      setError("");
      
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (data.message === "user created") {
        toast({
          title: "Registration successful",
          description: "Account created! Logging you in...",
        });
        handleLogin();
      } else {
        setError("Username already exists or invalid");
        toast({
          title: "Registration failed",
          description: data.message || "Username already exists or invalid",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError("Network error. Please try again.");
      toast({
        title: "Connection error",
        description: "Couldn't connect to the server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-violet-500 to-blue-500 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-2xl rounded-xl overflow-hidden border-0">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
            <CardTitle className="text-3xl font-bold text-center">TaskMaster</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 py-8 px-6">
            <h2 className="text-xl font-medium text-center text-gray-700">Welcome Back</h2>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-red-50 text-red-500 p-3 rounded-lg text-sm border border-red-200"
              >
                <AlertCircle className="inline mr-2 h-4 w-4" />
                {error}
              </motion.div>
            )}
            
            <div className="space-y-4">
              <div>
                <Input 
                  className="rounded-xl h-12" 
                  placeholder="Username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              
              <div>
                <Input 
                  className="rounded-xl h-12" 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pb-6 px-6">
            <Button 
              className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all" 
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-pulse mr-2">●</span>
                  <span className="animate-pulse mr-2 delay-100">●</span>
                  <span className="animate-pulse delay-200">●</span>
                </>
              ) : "Login"}
            </Button>
            
            <Button 
              className="w-full h-12 rounded-xl" 
              variant="outline" 
              onClick={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-pulse mr-2">●</span>
                  <span className="animate-pulse mr-2 delay-100">●</span>
                  <span className="animate-pulse delay-200">●</span>
                </>
              ) : "Register"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default Login;