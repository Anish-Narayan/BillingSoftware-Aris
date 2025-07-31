import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import * as THREE from 'three';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create elegant floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 800;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 150;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.5,
      color: 0x4f46e5,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create subtle geometric shapes
    const geometryGroup = new THREE.Group();

    // Add subtle wireframe spheres
    for (let i = 0; i < 3; i++) {
      const sphereGeometry = new THREE.SphereGeometry(8 + i * 4, 16, 16);
      const sphereMaterial = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0x6366f1 : i === 1 ? 0x8b5cf6 : 0x06b6d4,
        wireframe: true,
        transparent: true,
        opacity: 0.1,
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60);
      geometryGroup.add(sphere);
    }

    scene.add(geometryGroup);

    camera.position.z = 80;

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Smooth animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Gentle particle rotation
      particlesMesh.rotation.x += 0.0005;
      particlesMesh.rotation.y += 0.001;

      // Subtle geometry rotation
      geometryGroup.rotation.x += 0.002;
      geometryGroup.rotation.y += 0.001;

      // Smooth mouse interaction
      camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
      camera.position.y += (mouseY * 3 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    sceneRef.current = { scene, camera, renderer, animate };

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setLoading(false);
        navigate('/dashboard');
      })
      .catch((error) => {
        setLoading(false);
        switch (error.code) {
          case 'auth/user-not-found':
            setError('No account found with this email address.');
            break;
          case 'auth/wrong-password':
            setError('Incorrect password. Please try again.');
            break;
          case 'auth/invalid-email':
            setError('Please enter a valid email address.');
            break;
          default:
            setError('Failed to log in. Please try again later.');
            break;
        }
        console.error('Firebase login error:', error);
      });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Three.js Background */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-blue-50/40 z-10" />

      {/* Login Form */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl p-12 rounded-3xl shadow-2xl w-full max-w-md border border-white/20 transform transition-all duration-300 hover:shadow-indigo-200/50">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-cyan-500/5 blur-xl -z-10"></div>

          <div className="text-center mb-10">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/25">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              BillingPro
            </h2>
            <p className="text-gray-600 text-sm font-medium">Professional Billing Management</p>
            <div className="w-12 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-red-600 text-center text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="space-y-6">
              <div className="space-y-1">
                <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    className="w-full py-4 px-4 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 
                           transition-all duration-200 
                           hover:border-indigo-300 hover:bg-white/60"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    className="w-full py-4 px-4 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 
                           transition-all duration-200 
                           hover:border-indigo-300 hover:bg-white/60"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-gray-600">Remember me</span>
                </label>
                <a
                  href="#"
                  className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 
                       hover:from-indigo-500 hover:via-indigo-400 hover:to-purple-500
                       text-white font-semibold rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2
                       transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/25
                       disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                       relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <svg
                        className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>

          {/* Professional indicator dots */}
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <p className="text-gray-500 text-xs text-center">
          © 2025 BillingPro. Secure • Professional • Reliable
        </p>
      </div>
    </div>
  );
};

export default Login;