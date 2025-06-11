import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function Login() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-md w-full mx-4">
        <Card className="shadow-lg border border-slate-200">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Users className="text-white text-2xl" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Talent Management</h1>
              <p className="text-slate-600 mt-2">Sign in to your account</p>
            </div>
            
            <Button 
              onClick={handleLogin}
              className="w-full bg-primary hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Sign In with Replit
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
