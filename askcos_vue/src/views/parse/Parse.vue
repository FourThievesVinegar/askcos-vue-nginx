<template>
    Redirecting to ASKCOS...
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { onMounted } from "vue";
import {COMMANDS} from "@/views/parse/commands"

const route = useRoute();
const router = useRouter();

onMounted(() => {
    let urlParams = route.query;
    console.log(COMMANDS)
});
</script>
