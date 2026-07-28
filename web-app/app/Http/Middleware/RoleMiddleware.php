<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect('/login');
        }

        $roleValue = $user->role->value ?? $user->role;

        // Superadmin always has access
        if ($roleValue === 'superadmin') {
            return $next($request);
        }

        if (in_array($roleValue, $roles)) {
            return $next($request);
        }

        // Unauthorized
        return redirect('/');
    }
}
