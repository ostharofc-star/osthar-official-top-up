import {ReactNode} from 'react';
import {Toaster} from '@/components/ui/toaster';
import {Toaster as Sonner} from '@/components/ui/sonner';
import {TooltipProvider} from '@/components/ui/tooltip';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {BrowserRouter,Routes,Route,Navigate,useLocation} from 'react-router-dom';
import {MotionConfig} from 'framer-motion';
import {PlatformProvider,usePlatform} from '@/lib/platform';
import {Layout} from '@/components/Layout';
import {Spinner} from '@/components/shared';
import Index from './pages/Index';
import Store from './pages/Store';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Wallet from './pages/Wallet';
import Orders from './pages/Orders';
import AuthPage,{AuthCallback} from './pages/Auth';
import Legal from './pages/Legal';
import Receipt from './pages/Receipt';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
const queryClient=new QueryClient();
function Protected({children}:{children:ReactNode}){const {session,loading}=usePlatform();const location=useLocation();if(loading)return <div className="flex justify-center py-24"><Spinner/></div>;return session?<>{children}</>:<Navigate to="/login" replace state={{from:location.pathname}}/>;}
export default function App(){return <QueryClientProvider client={queryClient}><TooltipProvider><MotionConfig reducedMotion="user"><PlatformProvider><Toaster/><Sonner/><BrowserRouter><Routes>
  <Route element={<Layout/>}>
    <Route path="/" element={<Index/>}/>
    <Route path="/store" element={<Store/>}/>
    <Route path="/product/:id" element={<Product/>}/>
    <Route path="/cart" element={<Cart/>}/>
    <Route path="/login" element={<AuthPage/>}/>
    <Route path="/register" element={<AuthPage key="register" mode="register"/>}/>
    <Route path="/verify-email" element={<AuthPage key="otp" mode="otp"/>}/>
    <Route path="/forgot-password" element={<AuthPage key="forgot" mode="forgot"/>}/>
    <Route path="/reset-password" element={<AuthPage key="reset" mode="reset"/>}/>
    <Route path="/auth/callback" element={<AuthCallback/>}/>
    <Route path="/wallet" element={<Protected><Wallet key="overview"/></Protected>}/>
    <Route path="/wallet/topup" element={<Protected><Wallet key="topup" mode="topup"/></Protected>}/>
    <Route path="/wallet/history" element={<Protected><Wallet key="history" mode="history"/></Protected>}/>
    <Route path="/wallet/receipt/:id" element={<Protected><Receipt/></Protected>}/>
    <Route path="/orders" element={<Protected><Orders/></Protected>}/>
    <Route path="/orders/:id" element={<Protected><Orders/></Protected>}/>
    <Route path="/profile" element={<Protected><Profile/></Protected>}/>
    <Route path="/terms" element={<Legal type="terms"/>}/>
    <Route path="/privacy" element={<Legal type="privacy"/>}/>
    <Route path="*" element={<NotFound/>}/>
  </Route>
  <Route path="/admin" element={<Admin/>}/>
  <Route path="/admin/:section" element={<Admin/>}/>
</Routes></BrowserRouter></PlatformProvider></MotionConfig></TooltipProvider></QueryClientProvider>;}
