<template>
  <v-container class="fill-height" fluid style="min-height: calc(100vh-50px);">
    <v-row class="justify-center align-center">
      <v-col cols="12" md="12" xl="10" class="d-flex justify-center align-center flex-column">
        <v-expand-transition>
          <v-sheet elevation="2" rounded="lg" width="100%" class="mb-6 pa-6" v-show="show">
            <v-row>
              <v-col class="d-flex flew-row justify-center align-center">
                <v-menu location="end" v-if="username">
                  <template v-slot:activator="{ props }">
                    <v-btn color="orange-darken-1" dark v-bind="props" variant="tonal" prepend-icon="mdi-star"
                      append-icon="mdi-chevron-down">
                      Favorites
                    </v-btn>
                  </template>
                  <v-list>
                    <template v-for="(item, index) in favoritesMenu">
                      <v-list-item :to="item.link" v-if="item.selected" :key="index">
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                      </v-list-item>
                    </template>
                  </v-list>
                  <v-divider></v-divider>
                  <v-btn prepend-icon="mdi-pencil" @click="showEditFav = true">Edit Faviorites</v-btn>
                </v-menu>
                <v-tooltip max-width="200px" location="bottom">
                  <template v-slot:activator="{ props }">
                    <v-switch v-bind="props" v-model="nameResolver" class="ml-3" hide-details color="primary" inset density="compact"
                      true-icon="mdi-check">
                      <template v-slot:label>
                        Global Name Resolver: {{ nameResolver ? "ON" : "OFF" }}
                      </template>
                    </v-switch>
                  </template>
                  <p v-if="!!nameResolver">Connection to NIH name resolver is ON, structures may be sent to an external
                    service.</p>
                  <span v-else>Connection to NIH name resolver is OFF, structures will NOT be sent to an external
                    service.
                    Target query must be a SMILES string.</span>
                </v-tooltip>

                <v-spacer></v-spacer>
                <div v-if="username">
                  <span class="text-body-1 mr-1">Logged in as{{ superuser ? " superuser" : "" }},</span>
                  <v-chip color="primary" to="/admin" :disabled="username.startsWith('guest_')"><v-icon start
                      icon="mdi-account-circle"></v-icon><span class="text-body-1"><strong>{{ username
                        }}</strong></span></v-chip>
                </div>
              </v-col>
            </v-row>
            <v-row class="justify-center align-center pa-0 ma-0">
              <v-col cols="12" class="d-flex justify-center align-center text-center">
                <v-icon icon="mdi-compass-rose" class="text-h2 text-blue-darken-3 mr-2"></v-icon>
                <h2 class="text-h2 text-blue-darken-3 header font-weight-medium text-center"><strong>Explore
                    ASKCOS</strong></h2>
              </v-col>
            </v-row>
            <v-row class="justify-center align-center pa-0 ma-0">
              <v-col cols="12" class="d-flex justify-center align-center">
                <h6 class="text-h6">Enter a molecule or reaction SMILES to explore available tasks</h6>
              </v-col>
            </v-row>
            <LaunchPad></LaunchPad>
          </v-sheet>
        </v-expand-transition>
        <v-expand-transition>
          <v-sheet elevation="2" rounded="lg" width="100%" class="pa-6" v-show="show">
            <p class="mb-2 text-body-1">
              Here, we have hosted a number of computational tools to assist in
              synthetic planning and other aspects of organic chemistry. These are
              listed under the Modules tab in the navigation bar on the left, with
              more detailed description in
              <a target="_blank" href="https://askcos-docs.mit.edu/" color="primary">
                ASKCOS wiki <v-icon size="small">mdi mdi-open-in-new</v-icon></a>.
              Several of the deployed models are described in publications listed
              <a target="_blank" href="https://mlpds.mit.edu/papers/">here<v-icon size="small">mdi
                  mdi-open-in-new</v-icon></a>.
              References for the models are included in their respective pages
              where appropriate.

            </p>
            <v-alert border="start" type="info" density="compact" text="Please keep in mind that this service is supported by a fixed amount
              of computational resources. Your requests may take significantly
              longer than expected if there are several other users on the site
              also performing computationally-expensive requests." variant="tonal" class="mb-2 py-2"></v-alert>
            <v-alert border="start" density="compact" variant="tonal" icon="mdi mdi-handshake" class="mb-2">

              <template v-slot:text class="text-body-1">
                This work began under the DARPA Make-It program
                (ARO W911NF-16-2-0023) and continues to be supported by the
                <a target="_blank" href="https://mlpds.mit.edu">
                  Machine Learning for Pharmaceutical Discovery and Synthesis Consortium <v-icon size="small">mdi
                    mdi-open-in-new</v-icon></a>,
                and the National Institutes of Health (1U18TR004149-01).
              </template>
            </v-alert>
            <v-expansion-panels class="mb-2 text-body-1">
              <v-expansion-panel class="text-blue-darken-3">

                <template v-slot:title><v-icon class="mr-1">mdi mdi-lifebuoy</v-icon><strong>Support</strong></template>

                <template v-slot:text>
                  If you have any questions or if any of the links/images appear
                  broken, please email <a href="mailto:askcos_support@mit.edu">askcos_support@mit.edu</a>
                </template>
              </v-expansion-panel>
              <v-expansion-panel text='THIS SOFTWARE IS PROVIDED "AS IS" AND ANY EXPRESSED OR IMPLIED
            WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
            MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
            IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE FOR ANY
            DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
            DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
            GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
            INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
            IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
            OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN
            IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE."' class="text-blue-darken-3">

                <template v-slot:title><v-icon class="mr-1">mdi mdi-license</v-icon><strong>License</strong></template>
              </v-expansion-panel>
              <v-expansion-panel class="text-blue-darken-3">

                <template v-slot:title><v-icon class="mr-1">mdi
                    mdi-account-group</v-icon><strong>Contributors</strong></template>

                <template v-slot:text>
                  <v-chip class="ma-1" v-for="person in contributorList"><v-icon start icon="mdi-account"></v-icon><span
                      class="text-body-1">{{ person }}</span></v-chip>
                </template>
              </v-expansion-panel>
            </v-expansion-panels>
            <p class="mt-4 text-subtitle-2">Please review the <a
                href="https://askcos-docs.mit.edu/guide/9-Privacy-&-Terms-of-Service/9.1-ASKCOS-Terms-of-Service.html"
                target="_blank">Terms of Service <v-icon size="small">mdi mdi-open-in-new</v-icon></a> before using
              ASKCOS.</p>
          </v-sheet>
        </v-expand-transition>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model=showEditFav width="auto">
    <v-card>
      <v-card-title>
        <span class="text-h5">Edit Favorites</span>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-list>
          <v-list-item v-for="item in favoritesMenu" :key="item.link" @click="item.selected = !item.selected;">
            <v-list-item-title>
              {{ item.title }}
              <v-icon class="ml-1 mb-2" v-show="item.selected" icon="mdi-check">
              </v-icon>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="showEditFav = false; saveFav()" color="success">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { API } from '@/common/api'
import LaunchPad from "@/components/home/Launchpad.vue";
import { useConfirm } from 'vuetify-use-dialog';
import { useRouter } from "vue-router";

const superuser = ref(false);
const show = ref(false);
const showEditFav = ref(false);
const createConfirm = useConfirm();
const router = useRouter();
const nameResolver = ref(false);

const username = ref(localStorage.getItem("username"))

const favoritesMenu = ref([
  { title: "Interactive Path Planner/Tree Builder", link: '/network?tab=IPP', selected: true },
  { title: "Retrosynthesis Prediction", link: '/network?tab=RP', selected: true },
  { title: "Condition Recommendation", link: '/forward?tab=context', selected: false },
  { title: "Product Prediction", link: "/forward?tab=forward", selected: false },
  { title: "Impurity Prediction", link: "/forward?tab=impurity", selected: false },
  { title: "Regioselectivity Prediction", link: "/forward?tab=selectivity", selected: false },
  { title: "Aromatic C-H Functionalization", link: "/forward?tab=sites", selected: false },
  { title: "Solubility Prediction", link: "/forward?tab=sites", selected: false },
  { title: "Solvent Screening", link: "/solprop?tab=solscreen", selected: false },
  { title: "Buyables", link: "/buyables", selected: false },
  { title: "Drawing", link: "/drawing", selected: false },
  { title: "Server Status", link: "/status", selected: false },
  { title: "Logs", link: "/logs", selected: false },
  { title: "My Results", link: "/results", selected: false },
  { title: "My Banlist", link: "/banlist", selected: false }
])

const contributorList = ref([
  "Zhenkgai Tu (Maintainer)",
  "Sourabh Choure (Maintainer)",
  "Max Liu",
  "Samuel Gong",
  "Mun Hong Fong",
  "Aaron Chen",
  "Tony Li",
  "Mike Fortunato",
  "Pritha Verma",
  "Thomas Struble",
  "David Graff",
  "Itai Levin",
  "Jiannan Liu",
  "Hanyu Gao",
  "Yunsie Chung",
  "Florence Vermeire",
  "Yiming Mo",
  "Thijs Stuyver",
  "Yanfei Guan",
  "Travis Nevins",
  "Joonyoung Joung",
  "Huiqian Lin",
  "Mark Murnin",
  "Connor Coley"
])

onMounted(() => {
  show.value = true;
  const favData = localStorage.getItem(`${username.value}_fav`);
  if (JSON.parse(favData)) {
    favoritesMenu.value = JSON.parse(favData);
  }
  if (username.value) { amisuperuser() }
});

const saveFav = () => {
  const favData = JSON.stringify(favoritesMenu.value);
  localStorage.setItem(`${username.value}_fav`, favData);
}

const amisuperuser = async () => {
  try {
    const json = await API.get('/api/user/am-i-superuser');
    superuser.value = json
  }
  catch {
    await createConfirm({ title: 'Login Error', content: 'Session expired, please re-login', dialogProps: { width: "auto" } })
    superuser.value = false
    router.push("/login");
  }
}
</script>

<style scoped>
.header {
  background: linear-gradient(to right,
      #65676b 20%,
      #006bd6 30%,
      #0080ff 70%,
      #8a8e94 80%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-emphasis-color: transparent;
  background-size: 500% auto;
  animation: paint 5s ease-in-out infinite alternate;
}

@keyframes paint {
  0% {
    background-position: 0% 50%;
  }

  100% {
    background-position: 100% 50%;
  }
}
</style>
