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
        <main class="w-full max-w-[1600px] mx-auto flex-1 flex flex-col min-w-0">
            <div class="mb-4 flex flex-wrap items-center gap-3">
                <h1 class="text-2xl font-medium">Tree Permutation Demo</h1>
                <a href="{{ url('/') }}" class="text-sm text-[#f53003] dark:text-[#FF4433] underline underline-offset-4 hover:opacity-90">
                    トップへ戻る
                </a>
                <a href="{{ url('/dashboard') }}" class="text-sm text-[#f53003] dark:text-[#FF4433] underline underline-offset-4 hover:opacity-90">
                    ダッシュボードへ
                </a>
            </div>
            <div class="flex-1 min-h-0 rounded-lg border border-[#e3e3e0] dark:border-[#3E3E3A] bg-white dark:bg-[#161615] overflow-x-auto">
                <iframe
                    id="tree-permutation-iframe"
                    src="{{ asset('tree-permutation-demo/dist/index.html') }}"
                    title="Tree Permutation Demo"
                    class="w-full min-w-[1180px] border-0 block"
                    style="min-height: 70vh;"
                ></iframe>
            </div>
        </main>
        <script>
            (function() {
                var iframe = document.getElementById('tree-permutation-iframe');
                if (!iframe) return;
                function injectStyles() {
                    try {
                        var doc = iframe.contentDocument || iframe.contentWindow.document;
                        if (!doc || !doc.body) return;
                        var style = doc.createElement('style');
                        style.textContent = [
                            'html, body, #root { background: #FDFDFC !important; color: #1b1b18 !important; }',
                            'body { place-items: start !important; justify-content: flex-start !important; align-items: flex-start !important; overflow-x: auto !important; min-height: 100vh !important; padding: 16px !important; }',
                            '#root { width: 100%; min-width: min-content; }',
                            'button { background-color: #f5f5f4 !important; color: #1b1b18 !important; border-color: #e3e3e0 !important; }',
                            'button:hover { border-color: #a1a09a !important; }',
                            'button:disabled { opacity: 0.5; }',
                            'input[type="checkbox"] { accent-color: #f53003; }',
                            'h2, h3, h4 { color: #1b1b18 !important; }',
                            'label { color: #1b1b18 !important; }',
                            'a { color: #f53003 !important; }'
                        ].join('\n');
                        doc.head.appendChild(style);
                    } catch (e) {}
                }
                iframe.addEventListener('load', injectStyles);
                if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') injectStyles();
            })();
        </script>
    </body>
</html>
