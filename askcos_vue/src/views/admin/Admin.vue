<template>
    <v-layout style="height:100vh">
        <v-app-bar color="primary" density="compact">
            <template v-slot:prepend>
                <v-app-bar-nav-icon></v-app-bar-nav-icon>
            </template>
            <v-app-bar-title>Admin Panel</v-app-bar-title>
            <template v-slot:append>
                <v-btn prepend-icon="mdi-logout" variant="flat" color="orange-darken-1 text-white"
                    @click="logout">Logout</v-btn>
            </template>
        </v-app-bar>

        <v-main style="background-color: #f0f2f5">
            <v-container fluid>
                <v-row class="justify-center">
                    <v-col cols="12" md="12" xl="10">
                        <div class="mt-8 mb-5">

                            <h5 class="text-h4 text-blue">Hello, {{ username }}!</h5>
                            <v-alert density="compact" type="warning" title="Warning" class="mt-3">
                                <template v-slot:text>
                                    <p class="text-body-1">
                                        We trust you have received the usual lecture from the local System
                                        Administrator. It usually boils down to these three things:
                                    </p>
                                    <p class="text-body-1">#1) Respect the data of others.</p>
                                    <p class="text-body-1">#2) Think before you click.</p>
                                    <p class="text-body-1">#3) With great power comes great responsibility.</p>
                                </template>
                            </v-alert>
                        </div>
                    </v-col>
                </v-row>
                <v-row dense>
                    <v-col>
                        <v-sheet rounded="lg" elevation="2" class="pa-5">
                            <v-data-table :headers="headers" :items="users" multi-sort :search="''" show-select>
                                <template v-slot:top>
                                    <v-toolbar flat>
                                        <v-toolbar-title>ASKCOS Users</v-toolbar-title>
                                        <v-divider class="mx-4" inset vertical></v-divider>
                                        <v-spacer></v-spacer>
                                        <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" @click="dialog = true">New User</v-btn>
                                    </v-toolbar>
                                </template>
                                <template v-slot:item.is_superuser ="{ item }">
                                      <span v-if="item.raw.is_superuser === true">Admin</span>
                                      <span v-if="item.raw.is_superuser === false">Not Admin</span>
                                </template>
                                <template v-slot:item.actions="{ item }">
                                    <v-menu location="end">
                                        <template v-slot:activator="{ props }">
                                            <v-btn color="primary" dark v-bind="props" append-icon="mdi-chevron-down">
                                                More
                                            </v-btn>
                                        </template>

                                        <v-list>
                                            <v-list-item v-for="(item, index) in items" :key="index">
                                                <v-list-item-title>{{ item.title }}</v-list-item-title>
                                            </v-list-item>
                                        </v-list>
                                    </v-menu>
                                </template>
                            </v-data-table>
                        </v-sheet>
                    </v-col>
                </v-row>
            </v-container>

      <v-dialog v-model="dialog" max-width="600px">
        <v-card>
          <v-card-title class="mt-2">
            <v-col cols="12">Add new user</v-col></v-card-title>

          <v-card-text class="text-justify">
                    Ok
          </v-card-text>
          <v-card-actions class="mb-2">
            <v-spacer></v-spacer>
            <v-btn text @click="dialog = false">Ok</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
        </v-main>
    </v-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from "vue-router";
import { API } from "@/common/api";
const router = useRouter();
const username = ref(localStorage.getItem('username'))
const users = ref([])
const dialog = ref(false)

const headers = ref([
    { title: 'Username', key: 'username' },
    { title: 'Email', key: 'email' },
    { title: 'Admin Status', key: 'is_superuser' },
    { title: 'Last Login', key: 'lastLogin' },
    { title: 'Actions', key: 'actions', align: 'center' },
])

const items = ref([
    { title: 'Change Password' },
    { title: 'Export' },
    { title: 'Import' },
    { title: 'Remove' },
    { title: 'Lock' },
])

onMounted (async () => {
    try {
        const response = await API.get("/api/user/get-all-users");
        if (Array.isArray(response)) {
            users.value = response.filter(user => !user.username.startsWith('guest_'));
            console.log(response)
        } else {
            console.error("API did not return an array as expected:", response);
        }
    } catch (error) {
        console.error("Error fetching users:", error);
    } 
})

// logout function
const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('username')
    // logout to home page
    router.push('/admin-login');
}

</script>