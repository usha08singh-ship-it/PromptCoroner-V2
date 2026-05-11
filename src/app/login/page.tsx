'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { Mail, Lock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const bgRef = useRef<HTMLDivElement>(null);
  const centerpieceRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!bgRef.current) return;
    
    const container = bgRef.current;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0B0D13, 0.001);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 1000;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    const color1 = new THREE.Color('#7F75F8');
    const color2 = new THREE.Color('#5587F7');

    for(let i = 0; i < particlesCount * 3; i+=3) {
      posArray[i] = (Math.random() - 0.5) * 3000;
      posArray[i+1] = (Math.random() - 0.5) * 3000;
      posArray[i+2] = (Math.random() - 0.5) * 2000;

      const mixedColor = color1.clone().lerp(color2, Math.random());
      colorArray[i] = mixedColor.r;
      colorArray[i+1] = mixedColor.g;
      colorArray[i+2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const material = new THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2);
      mouseY = (event.clientY - window.innerHeight / 2);
    };

    document.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.0005;

      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (!centerpieceRef.current) return;

    const container = centerpieceRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.OctahedronGeometry(1.5, 0);
    
    const material = new THREE.MeshStandardMaterial({
      color: 0x5587F7,
      emissive: 0x2A1B6A,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8,
      flatShading: true,
      transparent: true,
      opacity: 0.9
    });

    const mesh = new THREE.Mesh(geometry, material);
    
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x7F75F8,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const wireframe = new THREE.Mesh(geometry, wireframeMaterial);
    mesh.add(wireframe);

    const beamGeometry = new THREE.CylinderGeometry(1.6, 1.6, 0.05, 32);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0x8774f9,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const scanBeam = new THREE.Mesh(beamGeometry, beamMaterial);
    scanBeam.rotation.x = Math.PI / 2;
    mesh.add(scanBeam);

    scene.add(mesh);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x7F75F8, 2);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x5587F7, 2);
    pointLight2.position.set(-2, -3, 2);
    scene.add(pointLight2);

    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;

      mesh.rotation.y += 0.01;
      mesh.rotation.x += 0.005;
      
      mesh.position.y = Math.sin(time * 2) * 0.15;

      scanBeam.position.y = Math.sin(time * 3.0) * 1.6;
      scanBeam.material.opacity = 0.4 + Math.sin(time * 6.0) * 0.4;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(reqId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg('Check your email for the confirmation link. If email confirmation is off, you can sign in now.');
        const { data: { user } } = await supabase.auth.getUser();
        if (user) router.push('/');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'OAuth failed.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#0B0D13] font-sans text-white">
      <style dangerouslySetInnerHTML={{__html: `
        input:focus {
          outline: none;
          border-color: #5587F7 !important;
          box-shadow: 0 0 0 1px #5587F7 !important;
        }
        .text-brand-gradient {
          background: linear-gradient(to right, #8774f9, #4f8bf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .bg-brand-gradient {
          background: linear-gradient(to right, #8774f9, #4f8bf6);
        }
      `}} />

      {/* 3D Background Canvas */}
      <div ref={bgRef} className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none" />

      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[440px] p-10 bg-[#1d1a23]/80 backdrop-blur-xl rounded-[24px] border border-[#2A2E37] shadow-2xl relative z-10 mx-4"
      >
        <header className="text-center mb-10">
          <div ref={centerpieceRef} className="w-24 h-24 mx-auto mb-4 relative z-20 pointer-events-none" />
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center justify-center gap-1 font-heading">
            <span className="text-brand-gradient">Prompt</span><span>Coroner</span>
          </h1>
          <p className="text-[#cbc3d7] text-sm font-medium">
            {isSignUp ? 'Join the future of prompt forensics' : 'Welcome back, investigator'}
          </p>
        </header>

        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#93000a]/20 border border-[#ffb4ab]/20 text-[#ffb4ab] p-3 rounded-xl text-sm mb-6 flex items-start gap-2 relative z-10"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </motion.div>
          )}
          
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#0566d9]/20 border border-[#adc6ff]/20 text-[#adc6ff] p-3 rounded-xl text-sm mb-6 flex items-start gap-2 relative z-10"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{successMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4 mb-8">
          <button
            onClick={() => handleOAuth('google')}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#181A20] hover:bg-[#1E2128] border border-[#2A2E37] rounded-xl text-sm font-semibold transition-colors duration-200"
          >
            <GoogleIcon />
            Continue with Google
          </button>
          <button
            onClick={() => handleOAuth('github')}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#181A20] hover:bg-[#1E2128] border border-[#2A2E37] rounded-xl text-sm font-semibold transition-colors duration-200"
          >
            <GitHubIcon />
            Continue with GitHub
          </button>
        </div>

        <div className="relative flex items-center mb-8">
          <div className="flex-grow border-t border-[#2A2E37]"></div>
          <span className="flex-shrink-0 mx-4 text-xs font-semibold tracking-wider text-[#646A7A] uppercase">
            Or continue with email
          </span>
          <div className="flex-grow border-t border-[#2A2E37]"></div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-[#cbc3d7]">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#cbc3d7]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="block w-full pl-10 pr-3 py-3 bg-[#0B0D13] border border-[#2A2E37] rounded-xl text-sm placeholder-[#555967] text-white focus:ring-0 transition-shadow duration-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-[#cbc3d7]">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#cbc3d7]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-3 py-3 bg-[#0B0D13] border border-[#2A2E37] rounded-xl text-sm placeholder-[#555967] text-white focus:ring-0 transition-shadow duration-200"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 py-3.5 px-4 bg-brand-gradient hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-semibold text-white shadow-[0_0_20px_rgba(135,116,249,0.3)] transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-[#cbc3d7]">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setSuccessMsg(''); }}
              className="text-[#8774f9] hover:text-white font-medium transition-colors"
            >
              {isSignUp ? 'Sign in instead' : 'Create one now'}
            </button>
          </p>
        </div>
      </motion.main>
    </div>
  );
}
