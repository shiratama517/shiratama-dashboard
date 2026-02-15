<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Tree Permutation Demo - {{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        <!-- Styles / Scripts -->
        @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
            @vite(['resources/css/app.css', 'resources/js/app.js'])
        @else
            <link rel="stylesheet" href="{{ asset('css/tailwind-fallback.css') }}">
        @endif
    </head>
    <body class="bg-[#FDFDFC] dark:bg-[#0a0a0a] text-[#1b1b18] dark:text-[#EDEDEC] flex flex-col p-6 lg:p-8 min-h-screen">
        <main class="w-full max-w-6xl mx-auto flex-1 flex flex-col">
            <div class="mb-4 flex flex-wrap items-center gap-3">
                <h1 class="text-2xl font-medium">Tree Permutation Demo</h1>
                <a href="{{ url('/') }}" class="text-sm text-[#f53003] dark:text-[#FF4433] underline underline-offset-4 hover:opacity-90">
                    トップへ戻る
                </a>
                <a href="{{ url('/dashboard') }}" class="text-sm text-[#f53003] dark:text-[#FF4433] underline underline-offset-4 hover:opacity-90">
                    ダッシュボードへ
                </a>
            </div>
            <div class="flex-1 min-h-0 rounded-lg overflow-hidden border border-[#e3e3e0] dark:border-[#3E3E3A] bg-white dark:bg-[#161615]">
                <iframe
                    src="{{ asset('tree-permutation-demo/dist/index.html') }}"
                    title="Tree Permutation Demo"
                    class="w-full h-full min-h-[70vh] border-0"
                ></iframe>
            </div>
        </main>
    </body>
</html>
