<template>
  <v-container fluid style="min-height: calc(100vh-50px)">
    <v-row class="justify-center">
      <v-col cols="12" sm="8" md="10">
        <h1 class="header my-6 text-center">
          ASKCOS: Software tools for organic synthesis
        </h1>
        <v-expand-transition>
          <v-sheet elevation="2" rounded="lg" width="100%" class="pa-6" v-show="show">
            <h2 class="my-1">Welcome</h2>

            <v-divider></v-divider>
            <p class="mt-6 mb-3 px-3 text-body-1">
              Here, we have hosted a number of computational tools to assist in
              synthetic planning and other aspects of organic chemistry. These
              are listed and described in the Modules tab in the top navigation
              bar. Please keep in mind that this service is supported by a fixed
              amount of computational resources. Your requests may take
              significantly longer than expected if there are several other
              users on the site also performing computationally-expensive
              requests.
              <br />
              <br />
              This work began under the DARPA Make-It program (ARO
              W911NF-16-2-0023) and continues to be supported by the Machine
              Learning for Pharmaceutical Discovery and Synthesis Consortium. The main
              algorithms for Monte Carlo Tree Search used in the Tree Builder are
              adapted from
              <br />
              <br />
              <small> Segler, M. H. S., Preuss, M., & Waller, M. P. (2018).
              Planning chemical syntheses with deep neural networks and symbolic AI.
              Nature, 555(7698), 604–610.
                <a href="https://doi.org/10.1038/nature25978">
                  https://doi.org/10.1038/nature25978
                </a>.
              </small>
              <br />
              <br />
              The other deployed models are described in their respective pages where
              appropriate.
            </p>
            <p class="px-3 text-body-1">
              The development of ASKCOS has been supported by the DARPA Make-It program (ARO W911NF-16-2-0023), the <a href="http://mlpds.mit.edu" target="_blank">Machine Learning for Pharmaceutical Discovery and Synthesis Consortium</a>, and the National Institutes of Health (1U18TR004149-01).
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
            </v-expansion-panels>
          </v-sheet>
        </v-expand-transition>
        <v-expand-transition>
          <v-sheet elevation="2" rounded="lg" width="100%" class="my-6 pa-6" v-show="show">
            <h2 class="my-3">Quick start</h2>
            <v-divider></v-divider>
            <LaunchPad></LaunchPad>
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
  text-fill-color: transparent;
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
