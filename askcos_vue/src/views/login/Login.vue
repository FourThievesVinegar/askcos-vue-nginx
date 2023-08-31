<template>
    <div ref='vantaRef' style="height: 100vh" class="d-flex justify-center align-center">
        <v-container fluid>
            <v-row class="d-flex justify-space-between align-center px-16">
                <v-col cols="12" md="4">
                    <h1 class="text-h1 font-weight-bold text-white">ASKCOS.</h1>
                    <p class="text-h5 text-grey-lighten-3">software tools for Organic Chemistry, <span
                            style="text-decoration: wavy underline lime;">simplified</span></p>
                </v-col>
                <v-col cols="12" md="5" class="align-self-end">
                    <p class="text-h6 text-white font-weight-black">Trusted by</p>
                    <div class="slider">
                        <div class="slide-track">
                            <div class="slide">
                                <img src="@/assets/basf.png" height="100" width="250" alt="" />
                            </div>
                            <div class="slide">
                                <img src="@/assets/bms.png" height="100" width="250" alt="" />
                            </div>
                            <div class="slide">
                                <img src="@/assets/corteva.png" height="100" width="250" alt="" />
                            </div>
                            <div class="slide">
                                <img src="@/assets/janssen.png" height="100" width="250" alt="" />
                            </div>
                            <div class="slide">
                                <img src="@/assets/lilly.png" height="100" width="250" alt="" />
                            </div>
                            <div class="slide">
                                <img src="@/assets/corteva.png" height="100" width="250" alt="" />
                            </div>
                            <div class="slide">
                                <img src="@/assets/bms.png" height="100" width="250" alt="" />
                            </div>
                            <div class="slide">
                                <img src="@/assets/basf.png" height="100" width="250" alt="" />
                            </div>
                            <div class="slide">
                                <img src="@/assets/bms.png" height="100" width="250" alt="" />
                            </div>
                            <div class="slide">
                                <img src="@/assets/corteva.png" height="100" width="250" alt="" />
                            </div>
                            <div class="slide">
                                <img src="@/assets/janssen.png" height="100" width="250" alt="" />
                            </div>
                            <div class="slide">
                                <img src="@/assets/lilly.png" height="100" width="250" alt="" />
                            </div>
                            <div class="slide">
                                <img src="@/assets/corteva.png" height="100" width="250" alt="" />
                            </div>
                            <div class="slide">
                                <img src="@/assets/bms.png" height="100" width="250" alt="" />
                            </div>
                        </div>
                    </div>
                </v-col>
                <v-col cols="12" md="3">
                    <v-sheet elevation="10" rounded="lg">
                        <v-form ref="form" class="pa-5">
                            <div class="d-flex flex-column">
                                <v-btn color="green" size="x-large" block>
                                    SSO Login
                                </v-btn>
                                <v-container>
                                    <v-row wrap no-gutters>
                                        <v-col cols="5" class="text-center">
                                            <v-divider class="mt-3" />
                                        </v-col>
                                        <v-col cols="2" class="text-center text-h6">
                                            OR
                                        </v-col>
                                        <v-col cols="5" class="text-center">
                                            <v-divider class="mt-3" />
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </div>
                            <v-text-field label="Username" variant="outlined" required></v-text-field>
                            <v-text-field label="Password" variant="outlined" required></v-text-field>

                            <div class="d-flex flex-column">
                                <v-container>
                                    <v-row wrap no-gutters>
                                        <v-col cols="6" class="text-center">
                                            <v-btn color="primary" size="x-large">
                                                Log In
                                            </v-btn>
                                        </v-col>
                                        <v-col cols="6" class="text-center">
                                            <v-btn color="primary" size="x-large">
                                                Sign Up
                                            </v-btn>
                                        </v-col>
                                    </v-row>
                                </v-container>
                                <v-btn color="primary" size="x-large" block variant="plain">
                                    Reset Password
                                </v-btn>
                                <v-divider class="my-4">
                                </v-divider>
                                <v-btn color="primary" size="x-large" block variant="tonal" to="/">
                                    Continue as Guest
                                </v-btn>
                            </div>
                        </v-form>
                    </v-sheet>
                </v-col>
            </v-row>
        </v-container>

    </div>
</template>
  
<script setup>
import * as THREE from "three";
import HALO from 'vanta/dist/vanta.halo.min'
import { ref, onMounted } from 'vue';

const vantaRef = ref(null);

onMounted(() => {
    HALO({
        el: vantaRef.value,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        size: 0.50,
        baseColor: 0x1a59,
        backgroundColor: 0x2035b1,
    })
})
</script>

<style lang="scss">
@mixin white-gradient {
    background: linear-gradient(to right, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 100%);
}

$animationSpeed: 20s;

// Animation
@keyframes scroll {
    0% {
        transform: translateX(0);
    }

    100% {
        transform: translateX(calc(-250px * 7))
    }
}


// Styling
.slider {
    box-shadow: 0 10px 20px -5px rgba(0, 0, 0, .125);
    height: 100px;
    margin: auto;
    overflow: hidden;
    position: relative;
    width: auto;
    border-radius: 10px;

    &::before,
    &::after {
        @include white-gradient;
        content: "";
        height: 100px;
        position: absolute;
        width: 200px;
        z-index: 2;
    }

    &::after {
        right: 0;
        top: 0;
        transform: rotateZ(180deg);
    }

    &::before {
        left: 0;
        top: 0;
    }

    .slide-track {
        animation: scroll $animationSpeed linear infinite;
        display: flex;
        width: calc(250px * 14);
    }

    .slide {
        height: 100px;
        width: 250px;
    }
}
</style>