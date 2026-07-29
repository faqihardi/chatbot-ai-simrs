<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        if (Auth::check()) {
            $role = Auth::user()->role->value ?? Auth::user()->role;
            if ($role === 'superadmin') return redirect('/superadmin');
            if ($role === 'admin_cs') return redirect('/admin');
            if ($role === 'staf') return redirect('/staf/chat');
            return redirect('/');
        }
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $remember = $request->boolean('remember');

        if (Auth::attempt($credentials, $remember)) {
            $request->session()->regenerate();

            $role = Auth::user()->role->value ?? Auth::user()->role;
            
            if ($role === 'superadmin') {
                return redirect()->intended('/superadmin');
            } else if ($role === 'admin_cs') {
                return redirect()->intended('/admin');
            } else if ($role === 'staf') {
                return redirect()->intended('/staf/chat');
            }

            return redirect()->intended('/');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
