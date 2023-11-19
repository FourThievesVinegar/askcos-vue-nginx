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
                            <v-alert density="compact" type="warning" title="Warning" class="mt-3" v-if="isAdmin">
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
                    <v-col cols="12">
                        <v-sheet rounded="lg" elevation="2" class="pa-5">
                            <v-data-table :headers="headers" :items="tableItems" multi-sort :search="''" show-select
                                v-if="isAdmin" v-model="selection" item-value="username">
                                <template v-slot:top>
                                    <v-toolbar flat>
                                        <v-toolbar-title>ASKCOS Users</v-toolbar-title>
                                        <v-select label="Filter by account type" density="comfortable" variant="outlined"
                                            hide-details clearable :items="filterOptions" item-text="title" item-value="key"
                                            v-model="filterSelected" class="mr-3"></v-select>
                                        <v-menu location="end">
                                            <template v-slot:activator="{ props }">
                                                <v-btn color="primary" dark v-bind="props" append-icon="mdi-chevron-down"
                                                    v-if="selection.length" variant="flat">
                                                    Bulk Operation
                                                </v-btn>
                                            </template>

                                            <v-list>
                                                <v-list-item v-for="(action, index) in bulkActionItems" :key="index">
                                                    <v-btn variant="tonal" color="primary"
                                                        @click="mutateAll(action.func)">{{ action.title
                                                        }}</v-btn>
                                                </v-list-item>
                                            </v-list>
                                        </v-menu>
                                        <!-- <v-divider class="mx-4" inset vertical></v-divider> -->
                                        <v-spacer></v-spacer>
                                        <v-btn color="primary" variant="flat" prepend-icon="mdi-plus"
                                            @click="dialog = true">New User</v-btn>
                                    </v-toolbar>
                                </template>
                                <template v-slot:item.is_superuser="{ item }">
                                    <span v-if="item.raw.is_superuser === true">Admin</span>
                                    <span v-if="item.raw.is_superuser === false">Not Admin</span>
                                </template>
                                <template v-slot:item.actions="{ item }">
                                    <v-menu location="end">
                                        <template v-slot:activator="{ props }">
                                            <v-btn color="primary" dark v-bind="props" append-icon="mdi-chevron-down"
                                                :disabled="selection.length !== 0">
                                                More
                                            </v-btn>
                                        </template>

                                        <v-list>
                                            <v-list-item
                                                v-if="!(item.raw.accountType === 'Guest' || item.raw.accountType === 'Admin')">
                                                <v-btn variant="tonal" color="warning"
                                                    @click="mutate(item.raw.username, 'admin')">Make admin</v-btn>
                                            </v-list-item>
                                            <v-list-item
                                                v-if="!(item.raw.accountType === 'Guest' || item.raw.accountType === 'Normal')">
                                                <v-btn variant="tonal" color="primary"
                                                    @click="mutate(item.raw.username, 'normal')">Make normal user</v-btn>
                                            </v-list-item>
                                            <v-list-item v-if="!(item.raw.disabled === false)">
                                                <v-btn variant="tonal" color="primary"
                                                    @click="mutate(item.raw.username, 'enable')">Unlock Account</v-btn>
                                            </v-list-item>
                                            <v-list-item v-if="!(item.raw.disabled === true)">
                                                <v-btn variant="tonal" color="primary"
                                                    @click="mutate(item.raw.username, 'disable')">Lock Account</v-btn>
                                            </v-list-item>
                                            <v-list-item v-if="!(item.raw.accountType === 'Guest')">
                                                <v-btn variant="tonal" color="primary"
                                                    @click="mutate(item.raw.username, 'pwd')">Change Password</v-btn>
                                            </v-list-item>
                                            <v-list-item>
                                                <v-btn variant="tonal" color="error"
                                                    @click="mutate(item.raw.username, 'delete')">Delete Account</v-btn>
                                            </v-list-item>
                                        </v-list>
                                    </v-menu>
                                </template>
                            </v-data-table>
                            <div v-if="!isAdmin">
                                <v-row>
                                    <v-col cols="12" class="d-flex flex-row justify-center align-center">
                                        <v-btn color="warning" class="mr-2">Change Password</v-btn>
                                        <v-btn color="warning" class="mr-2">Update Email</v-btn>
                                        <v-btn color="error">Delete Account</v-btn>
                                    </v-col>
                                </v-row>
                            </div>
                        </v-sheet>
                    </v-col>
                </v-row>
            </v-container>

            <v-dialog v-model="dialog" max-width="600px">
                <v-card>
                    <v-card-title class="mt-2">
                        <v-col cols="12">Add new user</v-col></v-card-title>

                    <v-card-text>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field v-model="newUsername" variant="outlined" label="Username" hide-details
                                    clearable></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field v-model="newEmail" variant="outlined" label="Email" hide-details
                                    clearable></v-text-field>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12">
                                <v-text-field v-model="newPassword" variant="outlined" label="Password" type="password"
                                    hide-details clearable></v-text-field>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12">
                                <v-checkbox label="Make admin" v-model="newSuperuser"></v-checkbox>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions class="mb-2">
                        <v-spacer></v-spacer>
                        <v-btn text @click="addUser()">Submit</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-main>
    </v-layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from "vue-router";
import { API } from "@/common/api";
import { useConfirm, useSnackbar } from 'vuetify-use-dialog';

// const createConfirm = useConfirm();
const createSnackbar = useSnackbar()
const router = useRouter();
const username = ref(localStorage.getItem('username'))
const newUsername = ref('')
const newPassword = ref('')
const newEmail = ref('')
const newSuperuser = ref(false)
const isAdmin = ref(false)
const users = ref([])
const dialog = ref(false)
const selection = ref([]);
const filterOptions = ref([
    { key: 'Guest', title: 'Guest' },
    { key: 'Normal', title: 'Normal' },
    { key: 'Admin', title: 'Admin' },
]);
const headers = ref([
    { title: 'Username', key: 'username' },
    { title: 'Email', key: 'email' },
    { title: 'Account Type', key: 'accountType' },
    { title: 'Last Login', key: 'lastLogin' },
    { title: 'Actions', key: 'actions', align: 'center' },
])

const bulkActionItems = ref([
    { title: 'Make all admin', func: "admin" },
    { title: 'Make all normal user', func: "normal" },
    { title: 'Lock all acount', func: "disable" },
    { title: 'Unlock all acount', func: "enable" },
    { title: 'Delete all account', func: "delete" },
])

const filterSelected = ref(null)

const tableItems = computed(() => {
    let items = users.value;
    if (filterSelected.value === 'all' || filterSelected.value === null) {
        return items
    }
    return items.filter(item => item.accountType === filterSelected.value);
})

onMounted(async () => {
    await fetchData()
})

const fetchData = async () => {
    try {
        // check if the username is admin
        isAdmin.value = await API.get("/api/user/am-i-superuser");

        if (isAdmin.value) {
            const response = await API.get("/api/user/get-all-users");
            if (Array.isArray(response)) {
                response.forEach((user) => {
                    if (user.username.startsWith('guest_')) {
                        user.accountType = "Guest"
                        return;
                    }
                    if (user.is_superuser) {
                        user.accountType = "Admin"
                        return;
                    }
                    user.accountType = "Normal";
                })
                users.value = response;
            } else {
                console.error("API did not return an array as expected:", response);
            }
        }
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

const addUser = () => {
    if (!newUsername.value || !newPassword.value || !newEmail.value) {
        createSnackbar({ text: "Please fill in all fields", snackbarProps: { timeout: 3000 } });
        return;
    }

    let body = {
        username: newUsername.value,
        password: newPassword.value,
        email: newEmail.value,
        is_superuser: newSuperuser.value,
    };

    API.post('/api/user/register', body, true)
        .then(response => {
            console.log(response.Error)
            if (response === "OK") {
                createSnackbar({ text: "User added successfully!", snackbarProps: { timeout: 3000 } });
                users.value.push({ ...body, accountType: newSuperuser.value ? "Admin" : "Normal" });
                clearUserFields();
            }
        })
        .catch((err) => {
            const match = err.toString().match(/\"detail\":\"([^\"]+)\"/);
            const detail = match[1];
            createSnackbar({ text: `Failed to add user: ${detail}`, snackbarProps: { timeout: 3000 } });
            clearUserFields();
        })
        .finally(() => {
            dialog.value = false;
        });
};

const clearUserFields = () => {
    newUsername.value = '';
    newPassword.value = '';
    newEmail.value = '';
    newSuperuser.value = false;
};

// logout function
const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('username')
    // logout to home page
    router.push('/admin-login');
}

const mutate = async (username, method) => {
    switch (method) {
        case 'pwd':
            await API.post('/api/user/update', { username: username }, true)
                .then(response => {
                    console.log(response.Error)
                    if (response === "OK") {
                        createSnackbar({ text: "Password changed successfully!", snackbarProps: { timeout: 3000 } });
                    }
                })
                .catch((err) => {
                    const match = err.toString().match(/\"detail\":\"([^\"]+)\"/);
                    const detail = match[1];
                    createSnackbar({ text: `Failed to change password: ${detail}`, snackbarProps: { timeout: 3000 } });
                })
            break;
        case 'admin':
            await API.get('/api/user/promote', { username: username }, true)
                .then(async response => {
                    console.log(response.Error)
                    if (response === "OK") {
                        await fetchData()
                        createSnackbar({ text: "Successfully made admin!", snackbarProps: { timeout: 3000 } });
                    }
                })
                .catch((err) => {
                    const match = err.toString().match(/\"detail\":\"([^\"]+)\"/);
                    const detail = match[1];
                    createSnackbar({ text: `Failed to change account type: ${detail}`, snackbarProps: { timeout: 3000 } });
                })
            break;
        case 'normal':
            await API.get('/api/user/demote', { username: username }, true)
                .then(async response => {
                    console.log(response.Error)
                    if (response === "OK") {
                        await fetchData()
                        createSnackbar({ text: "Successfully made normal user!", snackbarProps: { timeout: 3000 } });
                    }
                })
                .catch((err) => {
                    const match = err.toString().match(/\"detail\":\"([^\"]+)\"/);
                    const detail = match[1];
                    createSnackbar({ text: `Failed to delete account: ${detail}`, snackbarProps: { timeout: 3000 } });
                })
            break;
        case 'disable':
            await API.post('/api/user/update', { username: username, disabled: true }, true)
                .then(async response => {
                    console.log(response.Error)
                    if (response === "OK") {
                        await fetchData()
                        createSnackbar
                            ({ text: "Account disabled successfully!", snackbarProps: { timeout: 3000 } });
                    }
                })
                .catch((err) => {
                    const match = err.toString().match(/\"detail\":\"([^\"]+)\"/);
                    const detail = match[1];
                    createSnackbar({ text: `Failed to disable account: ${detail}`, snackbarProps: { timeout: 3000 } });
                })
            break;
        case 'enable':
            await API.post('/api/user/update', { username: username, disabled: false }, true)
                .then(async response => {
                    console.log(response.Error)
                    if (response === "OK") {
                        await fetchData()
                        createSnackbar
                            ({ text: "Account enabled successfully!", snackbarProps: { timeout: 3000 } });
                    }
                })
                .catch((err) => {
                    const match = err.toString().match(/\"detail\":\"([^\"]+)\"/);
                    const detail = match[1];
                    createSnackbar({ text: `Failed to enable account: ${detail}`, snackbarProps: { timeout: 3000 } });
                })
            break;
        case 'delete':
            await API.delete('/api/user/delete', { username: username }, true)
                .then(async response => {
                    console.log(response.Error)
                    if (response === "OK") {
                        await fetchData()
                        createSnackbar
                            ({ text: "Account deleted successfully!", snackbarProps: { timeout: 3000 } });
                    }
                })
                .catch((err) => {
                    console.log(err)
                    const match = err.toString().match(/\"detail\":\"([^\"]+)\"/);
                    const detail = match[1];
                    createSnackbar({ text: `Failed to delete account: ${detail}`, snackbarProps: { timeout: 3000 } });
                })
            break;
    }
}

const mutateAll = (method) => {
    for (const username of selection.value) {
        mutate(username, method)
    }
}

</script>