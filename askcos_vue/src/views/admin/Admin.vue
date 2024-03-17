<template>
    <v-layout style="height:100vh">
        <v-app-bar color="primary" density="compact">
            <v-app-bar-title>Admin Panel</v-app-bar-title>
            <template v-slot:append>
                <v-btn prepend-icon="mdi-home" variant="flat" color="grey text-white mr-2" to="/">Home</v-btn>
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
                        <v-sheet rounded="lg" elevation="2" class="pa-5" v-if="isAdmin">
                            <v-data-table :headers="headers" :items="tableItems" multi-sort :search="''" show-select
                                v-if="isAdmin" v-model="selection" item-value="username">
                                <template v-slot:top>
                                    <v-toolbar flat>
                                        <v-toolbar-title>ASKCOS Users</v-toolbar-title>
                                        <v-select label="Filter by account type" density="comfortable"
                                            variant="outlined" hide-details clearable :items="filterOptions"
                                            item-text="title" item-value="key" v-model="filterSelected"
                                            class="mr-3"></v-select>
                                        <v-menu location="end">
                                            <template v-slot:activator="{ props }">
                                                <v-btn color="primary" dark v-bind="props"
                                                    append-icon="mdi-chevron-down" v-if="selection.length"
                                                    variant="flat">
                                                    Bulk Operation
                                                </v-btn>
                                            </template>

                                            <v-list>
                                                <v-list-item v-if="showMakeAdminButton">
                                                    <v-btn variant="tonal" color="warning"
                                                        @click="mutateAll('admin')">Make
                                                        selected admins</v-btn>
                                                </v-list-item>
                                                <v-list-item v-if="showMakeNormalButton">
                                                    <v-btn variant="tonal" color="primary"
                                                        @click="mutateAll('normal')">Make
                                                        selected normal users</v-btn>
                                                </v-list-item>
                                                <v-list-item>
                                                    <v-btn variant="tonal" color="primary"
                                                        @click="mutateAll('enable')">Unlock selected
                                                        accounts</v-btn>
                                                </v-list-item>
                                                <v-list-item>
                                                    <v-btn variant="tonal" color="primary"
                                                        @click="mutateAll('disable')">Lock selected
                                                        accounts</v-btn>
                                                </v-list-item>
                                                <v-list-item>
                                                    <v-btn variant="tonal" color="error"
                                                        @click="mutateAll('delete')">Delete
                                                        selected accounts</v-btn>
                                                </v-list-item>
                                            </v-list>
                                        </v-menu>
                                        <!-- <v-divider class="mx-4" inset vertical></v-divider> -->
                                        <v-spacer></v-spacer>
                                        <v-btn color="primary" variant="flat" prepend-icon="mdi-plus"
                                            @click="dialog = true">New
                                            User</v-btn>
                                    </v-toolbar>
                                </template>
                                <template v-slot:item.is_superuser="{ item }">
                                    <span v-if="item.raw.is_superuser === true">Admin</span>
                                    <span v-else>Not Admin</span>
                                </template>
                                <template v-slot:item.disabled="{ item }">
                                    <span v-if="item.raw.disabled === true">Yes</span>
                                    <span v-else>No</span>
                                </template>
                                <template v-slot:item.accountType="{ item }">
                                    <v-chip :color="getColor(item.raw.accountType)">
                                        {{ item.raw.accountType }}
                                    </v-chip>
                                </template>
                                <template v-slot:item.last_login="{ item }">
                                    <span>{{ formatDateWithoutTimezone(item.raw.last_login) }}</span>
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
                                                    @click="mutate(item.raw.username, 'admin')">Make
                                                    admin</v-btn>
                                            </v-list-item>
                                            <v-list-item
                                                v-if="!(item.raw.accountType === 'Guest' || item.raw.accountType === 'Normal')">
                                                <v-btn variant="tonal" color="primary"
                                                    @click="mutate(item.raw.username, 'normal')">Make
                                                    normal user</v-btn>
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
                                                    @click="mutate(item.raw.username, 'pwd')">Change
                                                    Password</v-btn>
                                            </v-list-item>
                                            <v-list-item v-if="!(item.raw.accountType === 'Guest')">
                                                <v-btn variant="tonal" color="primary"
                                                    @click="mutate(item.raw.username, 'email')">Change Email</v-btn>
                                            </v-list-item>
                                            <v-list-item>
                                                <v-btn variant="tonal" color="error"
                                                    @click="mutate(item.raw.username, 'delete')">Delete
                                                    Account</v-btn>
                                            </v-list-item>
                                        </v-list>
                                    </v-menu>
                                </template>
                            </v-data-table>
                        </v-sheet>
                    </v-col>
                </v-row>
                <div v-if="!isAdmin">
                    <v-row class="d-flex flex-row justify-center align-center">
                        <v-col cols="12" sm="3">
                            <v-sheet class="pa-5 rounded-lg" elevation="2">
                                <h4 class="text-h4">Profile Picture</h4>
                                <v-divider></v-divider>
                                <div class="d-flex flex-column justify-center align-center mt-1">
                                    <v-img :src="gravatarURL(username)" width="200" style="border-radius: 50%;"></v-img>
                                    <p class="mt-1">Type</p>
                                </div>
                                <v-alert text="The above image is loaded via Gravatar" title="Info" type="info"
                                    variant="tonal" class="mt-1" density="compact"></v-alert>
                            </v-sheet>
                        </v-col>
                        <v-col cols="12" sm="4" class="d-flex flex-row justify-center align-center">
                            <v-sheet class="pa-5 rounded-lg" elevation="2">
                                <h4 class="text-h4">Email</h4>
                                <v-divider></v-divider>
                                <p class="text-body-1">soura@gmail.com</p>
                                <v-btn color="warning" class="mr-2" @click="mutate(username, 'email')"
                                    size="small">Update
                                    Email</v-btn>
                                <h4 class="mt-4 text-h4">Password</h4>
                                <v-divider></v-divider>
                                <p class="text-body-1">Last Login: Today</p>
                                <v-btn color="warning" class="mr-2" @click="mutate(username, 'pwd')" size="small">Change
                                    Password</v-btn>
                                <v-alert text="If you wish to delete this account you can do so by clicking below"
                                    title="Danger Zone" type="warning" class="mt-2" density="compact" color="#FF0000"
                                    variant="outlined"></v-alert>
                                <v-btn color="error" @click="mutate(username, 'delete')" size="small" class="mt-2">Delete
                                    Account</v-btn>
                            </v-sheet>
                        </v-col>
                    </v-row>
                </div>
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

            <v-dialog width="500px" v-model="changePwd">
                <v-card>
                    <v-card-title>
                        Change Password
                    </v-card-title>
                    <v-card-text>
                        <v-text-field v-model="newPassword" variant="outlined" label="Password" type="password"
                            hide-details clearable></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn text @click="changePwd = false; newPassword = ''">Cancel</v-btn>
                        <v-btn text @click="changePassword()">Submit</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <v-dialog width="500px" v-model="updateEmail">
                <v-card>
                    <v-card-title>
                        Change Email
                    </v-card-title>
                    <v-card-text>
                        <v-text-field v-model="newEmail" variant="outlined" label="Email" hide-details
                            clearable></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn text @click="updateEmail = false; newEmail = ''">Cancel</v-btn>
                        <v-btn text @click="changeEmail()">Submit</v-btn>
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
import { useSnackbar } from 'vuetify-use-dialog';
import gravatar from "gravatar"

// const createConfirm = useConfirm();
const createSnackbar = useSnackbar()
const router = useRouter();
const username = ref(localStorage.getItem('username'))
const newUsername = ref('')
const newPassword = ref('')
const newEmail = ref('')
const newSuperuser = ref(false)
const selectedUser = ref('')
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
    { title: 'Disabled', key: 'disabled' },
    { title: 'Last Login', key: 'last_login' },
    { title: 'Actions', key: 'actions', align: 'center' },
])
const changePwd = ref(false)
const updateEmail = ref(false)
const usersDict = ref({});
const filterSelected = ref(null)

function gravatarURL(email) {
    const gtype = localStorage.getItem("gtype");
    return gravatar.url(email, { d: gtype ?? "wavatar", s: '300' });
}

const tableItems = computed(() => {
    let items = users.value;
    if (filterSelected.value === 'all' || filterSelected.value === null) {
        return items
    }
    return items.filter(item => item.accountType === filterSelected.value);
})

const guestSelected = computed(() => {
    return selection.value.some(el => el.startsWith("guest_"))
})

const formatDateWithoutTimezone = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return date.toLocaleString('en-US', options); // Adjust the locale as needed
};

const changePassword = async () => {
    await API.post('/api/user/reset-password', { username: selectedUser.value, password: newPassword.value }, true)
        .then(async response => {
            console.log(response.Error)
            if (response === "OK") {
                await fetchData()
                createSnackbar({ text: "Successfully changed password!", snackbarProps: { timeout: 3000 } });
            }
        })
        .catch((err) => {
            const match = err.toString().match(/\"detail\":\"([^\"]+)\"/);
            const detail = match[1];
            createSnackbar({ text: `Failed to change password: ${detail}`, snackbarProps: { timeout: 3000 } });
        })
    selectedUser.value = "";
    newPassword.value = "";
    changePwd.value = false;
}

const changeEmail = async () => {
    await API.post('/api/user/update', { username: selectedUser.value, email: newEmail.value }, true)
        .then(async response => {
            console.log(response.Error)
            if (response === "OK") {
                await fetchData()
                createSnackbar({ text: "Successfully changed email!", snackbarProps: { timeout: 3000 } });
            }
        })
        .catch((err) => {
            const match = err.toString().match(/\"detail\":\"([^\"]+)\"/);
            const detail = match[1];
            createSnackbar({ text: `Failed to change email: ${detail}`, snackbarProps: { timeout: 3000 } });
        })
    selectedUser.value = "";
    newEmail.value = "";
    updateEmail.value = false;
}


onMounted(async () => {
    await fetchData()
})

const fetchData = async () => {
    try {
        // check if the username is admin
        isAdmin.value = await API.get("/api/user/am-i-superuser");

        usersDict.value = {};
        users.value.forEach(user => {
            usersDict.value[user.username] = user;
        });

        if (isAdmin.value) {
            const response = await API.get("/api/user/get-all-users");
            if (Array.isArray(response)) {
                response.forEach((user) => {
                    usersDict.value[user.username] = user;
                    if (user.username.startsWith('guest_')) {
                        user.accountType = "Guest"
                    } else if (user.is_superuser) {
                        user.accountType = "Admin"
                    } else {
                        user.accountType = "Normal"
                    }
                })
                users.value = response;
                console.log(users.value)
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
        case 'email':
            updateEmail.value = true;
            selectedUser.value = username;
            break;
        case 'pwd':
            changePwd.value = true;
            selectedUser.value = username;
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
    if (method === 'delete') {
        selection.value = [];
    }
}

const showMakeAdminButton = computed(() => {
    return selection.value.some(username =>
        usersDict.value[username].accountType === 'Normal'
    ) && !selection.value.some(username =>
        usersDict.value[username].accountType === 'Admin'
    );
});

const showMakeNormalButton = computed(() => {
    return selection.value.some(username =>
        usersDict.value[username].accountType === 'Admin'
    ) && !selection.value.some(username =>
        usersDict.value[username].accountType === 'Normal'
    );
});

const getColor = (type) => {
    if (type === "Admin") return 'green'
    if (type === "Normal") return 'blue'
    else return 'orange'
}
</script>