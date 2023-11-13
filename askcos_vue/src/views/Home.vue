<template>
  <v-container class="fill-height" fluid style="min-height: calc(100vh-50px);">
    <v-row class="justify-center align-center">
      <v-col cols="12" md="12" xl="10" class="d-flex justify-center align-center flex-column">
        <v-expand-transition>
          <v-sheet elevation="2" rounded="lg" width="100%" class="mb-6 pa-6" v-show="show">
            <v-row class="justify-center align-center pa-0 ma-0">
              <v-col cols="12" class="d-flex justify-center align-center">
                <h2 class="text-h2 text-blue-darken-3 header font-weight-medium"><strong>Explore ASKCOS</strong></h2>
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
            <p class="mb-2 px-3 text-body-1">
              Here, we have hosted a number of computational tools to assist in
              synthetic planning and other aspects of organic chemistry. These
              are listed and described in the Modules tab in the top navigation
              bar. Please keep in mind that this service is supported by a fixed
              amount of computational resources. Your requests may take
              significantly longer than expected if there are several other
              users on the site also performing computationally-expensive
              requests.
            </p>
            <p class="mb-2 px-3 text-body-1">
              This work began under the DARPA Make-It program (ARO
              W911NF-16-2-0023) and continues to be supported by the Machine
              Learning for Pharmaceutical Discovery and Synthesis Consortium. The main
              algorithms for Monte Carlo Tree Search used in the Tree Builder are
              adapted from
              <q><i> Segler, M. H. S., Preuss, M., & Waller, M. P. (2018).
                  Planning chemical syntheses with deep neural networks and symbolic AI.
                  Nature, 555(7698), 604–610.
                  <a href="https://doi.org/10.1038/nature25978">
                    https://doi.org/10.1038/nature25978
                  </a>.
                </i>
              </q>
            </p>
            <p class="mb-2 px-3 text-body-1">
              The other deployed models are described in their respective pages where
              appropriate.
            </p>
            <p class="mb-2 px-3 text-body-1">
              The development of ASKCOS has been supported by the DARPA Make-It program (ARO W911NF-16-2-0023), the <a
                href="http://mlpds.mit.edu" target="_blank">Machine Learning for Pharmaceutical Discovery and Synthesis
                Consortium</a>, and the National Institutes of Health (1U18TR004149-01).
            </p>
            <v-expansion-panels class="mt-6 text-body-1" variant="popout">
              <v-expansion-panel text="If you have any questions or if any of the links/images appear
            broken, please email askcos_support@mit.edu." class="text-blue-darken-3">
                <template v-slot:title><v-icon class="mr-1">mdi mdi-lifebuoy</v-icon><strong>Support</strong></template>
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
          </v-sheet>
        </v-expand-transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import LaunchPad from "@/components/home/Launchpad.vue";

const show = ref(false);

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
  "Huiqian Lin",
  "Mark Murnin",
  "Connor Coley"
])

onMounted(() => {
  show.value = true; // <div>
});
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
