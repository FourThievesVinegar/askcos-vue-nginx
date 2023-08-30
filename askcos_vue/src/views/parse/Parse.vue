<template>
    Redirecting to ASKCOS...
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { onMounted } from "vue";

const route = useRoute();
const router = useRouter();

onMounted(() => {
    let urlParams = route.query;
    console.log(urlParams)
});
</script>
