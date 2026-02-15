<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Dashboard - {{ config('app.name', 'Laravel') }}</title>

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
        <main class="w-full max-w-4xl mx-auto flex-1">
            <div class="mb-6">
                <h1 class="text-2xl font-medium mb-4">Dashboard</h1>
                <a href="{{ url('/') }}" class="text-sm text-[#f53003] dark:text-[#FF4433] underline underline-offset-4 hover:opacity-90">
                    トップへ戻る
                </a>
            </div>
            <div class="dashboard-main">
                {{-- ダッシュボードのメインエリア（ウィジェット・カード等を追加する場合はここに配置） --}}
            </div>
        </main>
    </body>
</html>