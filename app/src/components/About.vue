<template>
    <van-cell-group style="padding: 0.25em">
        <p>Paper Maker App (better name pending) is a simple progressive web app that enables Teachers to create basic Examination paper documents on their mobile phone - it currently generates Word .docx Documents so that they can be edited. </p>
        <strong>It is in the alpha version stage and still a Work-In-Progress </strong>
        <h4>Developer</h4>
        <p>Developed by <a href="mailto:zikani.nmwase@ymail.com">Zikani Nyirenda Mwase &lt;zikani.nmwase [at] ymail.com&gt;</a></p>


        <h4>How it works</h4>
        <p>This is built with some awesom Open-Source tools: Go, VueJS, <a href="https://vant-ui.github.io/vant">VANT UI</a>, and uses WASM to enable creating word documents offline. If WASM isn't available for some reason the app falls back it's server side API to process the request. </p>

        <p>Blog post coming soon at <a href="https://code.zikani.me">code.zikani.me</a></p>
    </van-cell-group>
    <van-cell-group>
        <van-divider>Settings</van-divider>
        <van-cell center title="Generate documents offline">
        <template #right-icon>
            <van-switch v-if="isWasmModuleLoaded" v-model="useOfflineMode" size="24" />
            <van-switch v-else disabled size="24" :value="false" />
        </template>
        </van-cell>
    </van-cell-group>
</template>