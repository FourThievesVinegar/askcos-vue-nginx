<template>
    <div>
        <v-text-field v-bind="$attrs" v-model="smiles" :disabled="disabled" :required="required" :label="label"
            append-icon="mdi-pencil" @click:append="openModal"></v-text-field>
        <slot></slot>
        <KetcherModal :id="modalId" :smiles="smiles"></KetcherModal>
    </div>
</template>

<script>
import { ref, computed, toRefs } from 'vue'
import KetcherModal from "@/components/KetcherModal";

export default {
    name: 'SmilesInput',
    components: {
        KetcherModal,
    },
    props: {
        id: {
            type: String,
            default: '',
        },
        value: {
            type: String,
            default: ''
        },
        disabled: {
            type: Boolean,
            default: false
        },
        required: {
            type: Boolean,
            default: false
        },
        label: {
            type: String,
            default: 'Enter SMILES'
        }
    },
    setup(props, { emit }) {
        const { id, value, disabled, required } = toRefs(props)

        const buttonId = computed(() => `edit-btn-${id.value}`)
        const modalId = computed(() => `ketcher-modal-${id.value}`)
        const smiles = ref(value.value)

        return {
            buttonId,
            modalId,
            smiles,
            disabled,
            required,
        }
    }
}
</script>
