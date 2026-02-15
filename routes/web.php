<?php

use Illuminate\Support\Facades\Route;

// Welcome route
Route::get('/', function () {
    return view('welcome');
});

// Dashboard route
Route::get('/dashboard', function () {
    return view('dashboard');
});

// Tree Permutation Demo（Blade でラップして iframe 表示）
Route::get('/tree-permutation', function () {
    return view('tree-permutation');
});