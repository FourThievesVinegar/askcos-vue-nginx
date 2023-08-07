<template>
  <v-container fluid>
    <v-row style="min-height: 100vh" class="justify-center">
      <v-col cols="12" sm="8" md="10">
        <h1 class="my-6 text-center">
          ASKCOS: Software tools for organic synthesis
        </h1>

        <v-sheet elevation="5" rounded="lg" width="100%" class="pa-6">
          <h2 class="my-6">This is ASKCOS!</h2>
          <v-divider></v-divider>
          <p class="mt-6">
            Here, we have hosted a number of computational tools to assist in
            synthetic planning and other aspects of organic chemistry. These are
            listed and described in the Modules tab in the top navigation bar.
            Please keep in mind that this service is supported by a fixed amount
            of computational resources. Your requests may take significantly
            longer than expected if there are several other users on the site
            also performing computationally-expensive requests.
          </p>
          <p class="mt-6">
            This work began under the DARPA Make-It program (ARO
            W911NF-16-2-0023) and continues to be supported by the Machine
            Learning for Pharmaceutical Discovery and Synthesis Consortium.
            Several of the deployed models are described in publications listed
            here.
          </p>
          <p class="mt-6">
            If you have any questions or if any of the links/images appear
            broken, please email mlpds_support@mit.edu.
          </p>
          <p class="mt-6">
            THIS SOFTWARE IS PROVIDED "AS IS" AND ANY EXPRESSED OR IMPLIED
            WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
            MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
            IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE FOR ANY
            DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
            DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
            GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
            INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
            IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
            OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN
            IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
          </p>
        </v-sheet>
        <v-sheet elevation="5" rounded="lg" width="100%" class="my-6 pa-6">
          <h2 class="my-6">Getting Started!</h2>
          <v-divider></v-divider>
          <LaunchPad></LaunchPad>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import LaunchPad from "@/components/home/Launchpad.vue"

const loaded = ref(false);
const loading = ref(false);

function onClick() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    loaded.value = true;
  }, 2000);
}
</script>
