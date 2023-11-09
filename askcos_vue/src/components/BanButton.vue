<template>
  <v-btn color="red-darken-2" variant="flat" @click="ban()">Ban</v-btn>
</template>

<script>
import { API } from "@/common/api";
import dayjs from "dayjs";

export default{
  name: 'BanButton',
  props: {
    smiles: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
  },
  methods: {
     ban() {
      const desc = prompt("Please enter a reason (for your records only)", "no reason");
      const url = `/api/banlist/${this.type}s/post`
      const body = {
        smiles: this.smiles,
        description: desc,
      };
      try {
        const json = API.post(url, body);
        const datetime = dayjs(json.created).format('MMMM D, YYYY h:mm A');
        alert(`Banned ${this.type} ${this.smiles} at ${datetime}`)
      } catch (error) {
        console.error(error);
        alert('Error banning')
      }
    },
  },
};
</script>


