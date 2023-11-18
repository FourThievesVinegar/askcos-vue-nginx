<template>
  <js-panel :visible="!!selected && visible" :options="detailPanelOptions" @close="clearEmit">
    <div id="details" class="overflow-auto">
      <template v-if="selected">
        <template v-if="selected.type === 'chemical'">
          <div class="details-top text-center">
            <copy-tooltip :data="selected.smiles">
              <i class="far fa-copy mr-1"></i>
              <b>Smiles: </b>
              {{ selected.smiles }}
            </copy-tooltip>
            <div><b>Price ($/g): </b>{{ selected.data.ppg }}</div>
            <div v-if="selected.data.source"><b>Source: </b>{{ selected.data.source }}</div>
            <ketcher-min id="ketcher-min-chemical" ref="ketcher-min" class="position-relative"
              @change="selectedAtoms = $event"></ketcher-min>
            <div v-if="!!selected.stats">
              <p>
                <small>
                  Circle size = # of reactions involving atom ({{ selected.stats.reactions.min }} - {{
                    selected.stats.reactions.max }})<br />
                  Circle color = # of clusters involving atom (<span style="color: #c0f0c0">&cir;</span> {{
                    selected.stats.clusters.min }} - {{ selected.stats.clusters.max }}
                  <span style="color: #005020">&cir;</span>)
                </small>
              </p>
            </div>
          </div>
          <div class="d-flex justify-center pa-2 ma-2">
            <v-btn-group divided density="compact" rounded="pill">
              <v-tooltip location="bottom">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" id="expand-btn-side" variant="flat" color="orange-darken-1"
                    @click="$emit('selectAllOccur')" prepend-icon="mdi mdi-select-all">Select</v-btn>
                </template>
                <span>Select all occurrences</span>
              </v-tooltip>
              <v-tooltip location="bottom">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" id="expand-btn-side" variant="flat" color="red-darken-1"
                    @click="$emit('deleteChoice')" prepend-icon="mdi mdi-delete-empty">Delete</v-btn>
                </template>
                <span>Delete children node(s)</span>
              </v-tooltip>
              <v-tooltip location="bottom">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" id="expand-btn-side" variant="flat" color="blue-darken-1"
                    @click="$emit('collapseNode')" prepend-icon="mdi mdi-collapse-all">Collapse</v-btn>
                </template>
                <span>Collapse children node(s)</span>
              </v-tooltip>
            </v-btn-group>
          </div>
          <v-divider class="my-2" :thickness="2"></v-divider>
          <div id="chemical-node-toolbar" class="d-flex justify-center flex-gap-2 flex-wrap">
            <v-btn id="expand-btn-side" variant="flat" color="green" @click="expandNode"> Expand Node </v-btn>
            <v-btn data-cy="network-view_button_view-notes" id="notes" variant="flat" color="deep-orange"
              @click="dispNotes = !dispNotes"> {{ !dispNotes ? "View" : "Hide" }} Notes </v-btn>
            <v-btn id="add-precursor-btn" variant="flat" color="light-blue" @click="openAddNewPrecursorModal()"> Add
              Precursor
            </v-btn>
            <v-btn id="view-rec-templates-btn" variant="flat" color="primary" @click="showRecTemplate = true"
              prepend-icon="mdi-view-list"> View
              Recommended
              Templates </v-btn>
            <ban-button id="ban-chemical-btn" :smiles="selected.smiles" :type="selected.type"></ban-button>
          </div>
          <div class="d-flex flex-row align-center">
            <h3>Precursors</h3>
            <v-spacer></v-spacer>
            <v-switch id="allowCluster" v-model="allowCluster" name="allow-cluster-switch" @change="resetSortingCategory"
              label="Group Cluster" density="compact" hide-details color="primary">
            </v-switch>
            <v-spacer></v-spacer>
            <v-switch id="invertAtomFilter" v-model="invertAtomFilter" name="invert-atom-filter-switch"
              label="Invert Atom Filter" density="compact" hide-details color="primary">
            </v-switch>
          </div>
          <div>
            <v-select :items="sortingCategoryItems" label="Sort By" style="width: 100%" class="px-2" hide-details
              variant="outlined" density="compact" v-model="sortingCategory">
              <template v-slot:append>
                <v-btn @click="sortOrderAscending = !sortOrderAscending" variant="tonal">
                  <template v-slot:append>
                    <v-icon v-if="sortOrderAscending">mdi-sort-descending</v-icon>
                    <v-icon v-else>mdi-sort-ascending</v-icon>
                  </template>
                  {{ sortOrderAscending ? "Ascending" : "Descending" }}
                </v-btn>
              </template>
            </v-select>
          </div>

          <div id="Notes" v-if="dispNotes" class="my-3 scroll-list pa-0">
            <v-row v-for="(note, idx) in selected.disp.notes" :key="note.date + idx">
              <v-col cols="12">
                <v-card>
                  <v-card-title class="d-flex justify-space-between">
                    <span>{{ note.user }}</span>
                    <small>{{ note.date }}</small>
                  </v-card-title>
                  <v-card-text v-if="editIdx !== idx">
                    {{ note.comment }}
                  </v-card-text>
                  <v-card-actions v-if="editIdx !== idx">
                    <v-btn outlined color="success" @click="editIdx = idx; oldNote = note.comment;">Edit Note</v-btn>
                  </v-card-actions>
                  <v-card-text v-if="editIdx === idx">
                    <v-textarea v-model="note.comment" :counter="1000" outlined rows="4"></v-textarea>
                  </v-card-text>
                  <v-card-actions v-if="editIdx === idx" class="d-flex justify-space-between">
                    <v-btn outlined color="success" @click="editIdx = -1; note.comment = oldNote; oldNote = '';">Cancel
                      Change</v-btn>
                    <div>
                      <v-btn outlined color="success" @click="editNote(idx, false); editIdx = -1; oldNote = '';">Save
                        Change</v-btn>
                      <v-btn outlined color="error" @click="editNote(idx, true); editIdx = -1; oldNote = '';">Delete
                        Note</v-btn>
                    </div>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
            <v-row class="pa-0 ma-0">
              <v-col class="d-flex justify-center">
                <v-btn class="align-center" variant="flat" color="green-darken-1" id="addNote"
                  @click="addNote = !addNote">Add Note</v-btn>
              </v-col>
            </v-row>
          </div>
          <div v-show="addNote" id="addNotes" class="mx-2 px-2 scroll-list">
            <v-row class="pa-0 ma-0">
              <v-col>
                <v-text-field label="Name" v-model="noteUrsName" placeholder="Enter your name" density="compact"
                  variant="outlined" hide-details clearable id="note-user-name"
                  data-cy="network-view_input_user-name"></v-text-field>
              </v-col>
            </v-row>
            <v-row class="pa-0 ma-0">
              <v-col>
                <v-textarea label="Comment" v-model="noteComment" density="compact" variant="outlined"
                  placeholder="Enter your comment here. There is a max. character length of 1000." :rows="4" hide-details
                  :counter="1000" id="note-comment" data-cy="network-view_input_user-comment"></v-textarea>
              </v-col>
            </v-row>
            <v-row class="pa-0 ma-0">
              <v-col class="d-flex justify-center flex-gap-2 flex-wrap mb-2">
                <v-btn variant="flat" color="green-darken-1" class="mr-2" data-cy="network-view_button_save-note"
                  @click="saveNote">Save Note</v-btn>
                <v-btn variant="outlined" data-cy="network-view_button_cancel-note" @click="clearNote">Cancel</v-btn>
              </v-col>
            </v-row>
          </div>

          <div v-if="!resultsAvailable" class="text-center mt-5">
            <p class="lead">Click Expand Node above to expand this node and predict precursors for this target.</p>
            <div class="text-center justify-center mx-10">
              <v-text-field variant="outlined" v-model="reactionLimit" hide-details density="compact" number>
                <template v-slot:prepend>
                  Add top
                </template>
                <template v-slot:append>
                  {{ allowCluster ? "Clusters" : "Precursors" }} to the graph visualization
                </template>
              </v-text-field>

            </div>
          </div>
          <div v-else class="scroll-list">
            <div v-for="res in currentPrecursors" :key="res.rank" class="my-2 mx-2">
              <v-card no-body class="custom-shadow text-center py-2 px-2">
                <v-row class="justify-center align-center">
                  <v-col>
                    <v-img :src="getMolDrawEndPoint(res, true)" fluid></v-img>
                  </v-col>
                  <v-col>
                    <v-table class="table table-sm table-border ma-0" density="compact">
                      <tbody>
                        <tr>
                          <td>Rank</td>
                          <td>#{{ res.rank }}</td>
                        </tr>
                        <tr>
                          <td>Score</td>
                          <td>{{ num2str(res.retroScore) }}</td>
                        </tr>
                        <tr>
                          <td>Synthetic complexity</td>
                          <td>{{ num2str(res.scscore) }}</td>
                        </tr>
                        <tr>
                          <td># Examples</td>
                          <td>{{ res.numExamples }}</td>
                        </tr>
                        <tr>
                          <td>Template rank</td>
                          <td>{{ res.templateRank }}</td>
                        </tr>
                        <tr>
                          <td>Template score</td>
                          <td>{{ num2str(res.templateScore) }}</td>
                        </tr>
                        <tr>
                          <td>Plausibility</td>
                          <td>{{ num2str(res.ffScore) }}</td>
                        </tr>
                        <tr>
                          <td>Reaction cluster</td>
                          <td>{{ res.clusterName }}</td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-col>
                </v-row>
                <div class="row no-gutters">
                  <div class="col my-2">
                    <v-btn v-show="!(selected.id in res.inVis)" variant="flat" color="green" class="addRes mr-1"
                      :data-rank="res.rank" @click="addFromResults(selected, res)" icon="mdi-plus" density="compact">
                    </v-btn>
                    <v-btn v-show="selected.id in res.inVis" variant="flat" color="red" class="remRes mr-1"
                      title="Remove node(s)" :data-rank="res.rank" @click="remFromResults(selected, res)" icon="mdi-minus"
                      density="compact">
                    </v-btn>
                    <v-btn variant="flat" :data-rank="res.rank" title="Open cluser modal"
                      @click="openClusterPopoutModal(selected, res)" icon="mdi-group" density="compact">
                    </v-btn>
                    <v-btn id="permanent-delete-btn" variant="flat" color="red" @click="deleteFromGraph(res)"
                      title="Delete permanently" class="ml-1" density="compact" icon="mdi-delete">
                    </v-btn>
                  </div>
                </div>
              </v-card>
            </div>
          </div>
        </template>
        <template v-else-if="selected.type === 'reaction'">
          <div class="details-top text-center">
            <copy-tooltip :data="selected.smiles">
              <i class="far fa-copy mr-1"></i>
              <b>Smiles: </b>
              {{ selected.smiles }}
            </copy-tooltip>
            <smiles-image :smiles="selected.smiles" :align="settingsStore.ippSettings.alignPrecursorsToProduct">
            </smiles-image>
            <div class="d-flex justify-center pa-2 ma-2">
              <v-btn-group divided density="compact" rounded="pill">
                <v-tooltip location="bottom">
                  <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" id="expand-btn-side" variant="flat" color="orange-darken-1"
                      @click="$emit('selectAllOccur')" prepend-icon="mdi mdi-select-all">Select</v-btn>
                  </template>
                  <span>Select all occurrences</span>
                </v-tooltip>
                <v-tooltip location="bottom">
                  <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" id="expand-btn-side" variant="flat" color="red-darken-1"
                      @click="$emit('deleteChoice')" prepend-icon="mdi mdi-delete-empty">Delete</v-btn>
                  </template>
                  <span>Delete children node(s)</span>
                </v-tooltip>
                <v-tooltip location="bottom">
                  <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" id="expand-btn-side" variant="flat" color="blue-darken-1"
                      @click="$emit('collapseNode')" prepend-icon="mdi mdi-collapse-all">Collapse</v-btn>
                  </template>
                  <span>Collapse children node(s)</span>
                </v-tooltip>
              </v-btn-group>
            </div>
            <v-divider class="my-2" :thickness="2"></v-divider>
            <div v-if="!!selected.data.model && selected.data.model !== 'new'">
              <p class="h6 mb-2 text-body-1">
                <i class="fas fa-info-circle mr-1"></i>Reaction predicted by
                <v-chip variant="tonal">
                  {{ selected.data.model }} {{ selected.data.trainingSet }}
                </v-chip>
                model
              </p>
            </div>
            <v-btn class="my-3" variant="outlined"
              :href="'/forward?tab=context&rxnsmiles=' + encodeURIComponent(selected.smiles)" target="_blank">Evaluate
              reaction</v-btn>
            <div class="text-left mx-2">
              <v-table class="ma-0" density="compact">
                <tbody>
                  <tr>
                    <th>Score</th>
                    <td>{{ num2str(selected.data.retroScore) }}</td>
                  </tr>
                  <tr>
                    <th>Template rank</th>
                    <td>{{ selected.data.templateRank }}</td>
                  </tr>
                  <tr>
                    <th>Template score</th>
                    <td>{{ num2str(selected.data.templateScore) }}</td>
                  </tr>
                  <tr>
                    <th>Plausibility</th>
                    <td>{{ num2str(selected.data.ffScore) }}</td>
                  </tr>
                  <tr>
                    <th># Examples</th>
                    <td>{{ selected.data.numExamples }}</td>
                  </tr>
                  <tr>
                    <th>Supporting templates</th>
                    <td>
                      <ul>
                        <li v-for="id in selected.data.templateIds" :key="id">
                          <a :href="'/template?id=' + id" target="_blank"> {{ id }} ({{
                            resultsStore.templateSetSource[id] }}, {{ resultsStore.templateNumExamples[id] }} examples)
                          </a>
                        </li>
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
            <div class="btn-toolbar justify-content-end mx-2">
              <ban-button :smiles="selected.smiles" :type="selected.type"></ban-button>
            </div>
          </div>
          <div class="ma-2" v-if="selected.data.selecError">
            <v-alert type="warning">Could not check regio-selectivity for
              this reaction, possibly due to stereochemistry in the product.</v-alert>
          </div>
          <template v-if="'outcomes' in selected.data">
            <div class="ma-2">
              <h6 class="ma-0 text-h6">Regio-selective Products</h6>
            </div>
            <div class="d-flex justify-center flex-gap-2 flex-wrap ma-2">
              <v-btn id="predict-selectivity" variant="outlined" @click="predictSelectivity"> Predict Selectivity
              </v-btn>
            </div>
            <div class="scroll-list">
              <div class="grid-wrapper">
                <v-card v-for="(res, index) in selected.data.outcomes" class="custom-shadow ma-2 pa-2" :key="index">
                  <div class="container-fluid d-flex flex-column h-100 justify-content-between">
                    <v-row>
                      <v-col>
                        <img :src="getMolDrawEndPoint(res)" class="ma-1"
                          :class="res === selected.smiles.split('>>')[1] ? 'grey-border' : ''" style="max-width: 100%" />
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col v-if="selected.data.selectivity[index]">
                        Score {{ num2str(selected.data.selectivity[index]) }}
                        <span v-if="selected.data.selectivity[index] === Math.max(...selected.data.selectivity)">
                          <i class="fas fa-check"></i>
                        </span>
                        <span v-else>
                          <i class="fas fa-times"></i>
                        </span>
                      </v-col>
                    </v-row>
                  </div>
                </v-card>
              </div>
            </div>
          </template>
        </template>
      </template>
    </div>
  </js-panel>

  <v-dialog id="cluster-view-modal" v-model="showClusterPopoutModal" min-width="600px">
    <v-card>
      <v-card-title>View Cluster</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <div class="btn-toolbar justify-content-center mb-3">
          <!-- <b-input-group>
            <b-input-group-prepend>
              <v-btn variant="outline-dark" @click="clusterPopoutModalDecGroupID()">
                <i class="fas fa-arrow-left"></i>
              </v-btn>
            </b-input-group-prepend>
            <select id="clusterSelect" v-model="selectedClusterId" class="form-control"
              @change="clusterPopoutModalSetGroupID()">
              <option v-for="idx in resultsStore.clusteredResultsIndex[clusterPopoutModalData['selectedSmiles']]"
                :value="idx" :key="idx">
                {{ selectPopoutClusterName(idx) }}
              </option>
            </select>
            <b-input-group-append>
              <v-btn variant="outline-dark" @click="clusterPopoutModalIncGroupID()">
                <i class="fas fa-arrow-right"></i>
              </v-btn>
            </b-input-group-append>
          </b-input-group> -->
        </div>

        <div class="scroll-list">
          <div class="grid-wrapper">
            <v-card no-body class="custom-shadow ma-2 pa-2" v-for="res in currentClusterViewPrecursors" :key="res.rank">
              <div class="d-flex flex-column justify-space-between" style="height:100%">
                <div>
                  <v-table class="ma-0">
                    <tbody>
                      <tr>
                        <td>Rank</td>
                        <td>#{{ res.rank }}</td>
                      </tr>
                      <tr v-if="clusterPopoutModalData.optionsDisplay.showScore">
                        <td>Score</td>
                        <td>{{ num2str(res.retroScore) }}</td>
                      </tr>
                      <tr v-if="clusterPopoutModalData.optionsDisplay.showSCScore">
                        <td>Synthetic complexity</td>
                        <td>{{ num2str(res.scscore) }}</td>
                      </tr>
                      <tr v-if="clusterPopoutModalData.optionsDisplay.showNumExample">
                        <td># Examples</td>
                        <td>{{ res.numExamples }}</td>
                      </tr>
                      <tr v-if="clusterPopoutModalData.optionsDisplay.showTemplateScore">
                        <td>Template score</td>
                        <td>{{ num2str(res.templateScore) }}</td>
                      </tr>
                      <tr v-if="clusterPopoutModalData.optionsDisplay.showPlausibility">
                        <td>Plausibility</td>
                        <td>{{ num2str(res.ffScore) }}</td>
                      </tr>
                      <tr v-if="clusterPopoutModalData.optionsDisplay.showClusterId">
                        <td>Reaction cluster</td>
                        <td>{{ res.clusterName }}</td>
                      </tr>
                    </tbody>
                  </v-table>
                </div>
                <div>
                  <img :src="getMolDrawEndPoint(res, true)" style="max-width:100%" />
                </div>
                <div class="text-right">
                  <button v-if="clusterPopoutModalData.selected.id in res.inVis" class="remRes btn btn-sm btn-danger"
                    :data-rank="res.rank" @click="remFromResults(clusterPopoutModalData.selected, res)">
                    <i class="fas fa-minus"></i>
                  </button>
                  <button v-else class="addRes btn btn-sm btn-success" :data-rank="res.rank"
                    @click="addFromResults(clusterPopoutModalData.selected, res)">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
            </v-card>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <div>
          <v-btn variant="flat" class="mr-1"
            @click="openAddNewPrecursorModal(clusterPopoutModalData['selectedSmiles'], clusterPopoutModalData['clusterId'], clusterPopoutModalData['clusterName'])"
            title="Add precursor" icon="mdi-plus" color="success">
          </v-btn>
          <v-btn variant="flat" @click="
            showClusterPopoutModal = false;
          openClusterEditModal(clusterPopoutModalData['selected'], clusterPopoutModalData['clusterId'], clusterPopoutModalData['clusterName']);
          closeClusterPopoutModal();
          " title="Edit clusters" color="orange" icon="mdi-pencil" class="mr-1">
          </v-btn>
        </div>
        <div class="form-check-inline">
          <input class="form-check-input" id="cpShowScore" type="checkbox"
            v-model="clusterPopoutModalData.optionsDisplay.showScore" />
          <label class="form-check-label mr-2" for="cpShowScore">Score</label>
          <input class="form-check-input" id="cpShowSCScore" type="checkbox"
            v-model="clusterPopoutModalData.optionsDisplay.showSCScore" />
          <label class="form-check-label mr-2" for="cpShowSCScore">Synthetic complexity</label>
          <input class="form-check-input" id="cpShowNumEx" type="checkbox"
            v-model="clusterPopoutModalData.optionsDisplay.showNumExample" />
          <label class="form-check-label mr-2" for="cpShowNumEx"># Examples</label>
          <input class="form-check-input" id="cpShowTemp" type="checkbox"
            v-model="clusterPopoutModalData.optionsDisplay.showTemplateScore" />
          <label class="form-check-label mr-2" for="cpShowTemp">Template score</label>
          <input class="form-check-input" id="cpShowPlaus" type="checkbox"
            v-model="clusterPopoutModalData.optionsDisplay.showPlausibility" />
          <label class="form-check-label mr-2" for="cpShowPlaus">Plausibility</label>
        </div>
        <v-btn variant="flat" @click="showClusterPopoutModal = false" color="primary">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- <b-modal v-if="selected" id="cluster-edit-modal" title="Edit Cluster" size="xl" footer-class="justify-content-between" v-model="showClusterEditModal" @close="closeClusterEditModal">
        <div class="btn-toolbar justify-content-center mb-3">
          <b-input-group>
            <b-input-group-prepend>
              <v-btn variant="outline-dark" @click="clusterEditModalDecGroupID()">
                <i class="fas fa-arrow-left"></i>
              </v-btn>
            </b-input-group-prepend>
            <select id="clusterEditSelect" v-model="selectedClusterId" class="form-control" @change="clusterEditModalSetGroupID()">
              <option v-for="idx in resultsStore.clusteredResultsIndex[clusterEditModalData['selectedSmiles']]" :value="idx" :key="idx">
                {{ selectEditClusterName(idx) }}
              </option>
            </select>
            <b-input-group-append>
              <v-btn variant="outline-dark" @click="clusterEditModalIncGroupID()">
                <i class="fas fa-arrow-right"></i>
              </v-btn>
            </b-input-group-append>
          </b-input-group>
        </div>

        <div class="scroll-list-x mb-3">
          <div class="grid-wrapper-onerow">
            <b-card
              v-for="res in currentClusterEditPrecursors"
              :key="res.rank"
              no-body
              class="custom-shadow m-2 p-2"
              @dragstart="clusterEditOnDragstart(res, $event)"
              @dragend="clusterEditOnDragend($event)"
              draggable="true">
              <div class="d-flex flex-column justify-content-between h-100">
                <div>
                  <table class="table table-sm table-bordered m-0 nopointer">
                    <tbody>
                      <tr>
                        <td>Rank</td>
                        <td>#{{ res.rank }}</td>
                      </tr>
                      <tr v-if="clusterEditModalData.optionsDisplay.showScore">
                        <td>Score</td>
                        <td>{{ num2str(res.retroScore) }}</td>
                      </tr>
                      <tr v-if="clusterEditModalData.optionsDisplay.showSCScore">
                        <td>Synthetic complexity</td>
                        <td>{{ num2str(res.scscore) }}</td>
                      </tr>
                      <tr v-if="clusterEditModalData.optionsDisplay.showNumExample">
                        <td># Examples</td>
                        <td>{{ res.numExamples }}</td>
                      </tr>
                      <tr v-if="clusterEditModalData.optionsDisplay.showTemplateScore">
                        <td>Template score</td>
                        <td>{{ num2str(res.templateScore) }}</td>
                      </tr>
                      <tr v-if="clusterEditModalData.optionsDisplay.showPlausibility">
                        <td>Plausibility</td>
                        <td>{{ num2str(res.ffScore) }}</td>
                      </tr>
                      <tr v-if="clusterEditModalData.optionsDisplay.showClusterId">
                        <td>Reaction cluster</td>
                        <td>{{ res.clusterName }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <img :src="getMolDrawEndPoint(res, true)" class="mw-100 nopointer" draggable="false" @dragstart.prevent />
                </div>
              </div>
            </b-card>
          </div>
        </div>

        <div class="scroll-list-x">
          <div class="grid-wrapper-onerow">
            <b-card
              v-for="res in resultsStore.clusteredResults[selected.smiles]"
              :key="res.clusterId"
              no-body
              class="custom-shadow m-2 p-2"
              @drop.prevent="clusterEditOnDrop(res, $event)"
              @dragover.prevent="clusterEditOnDragover($event)"
              @dragenter.prevent="clusterEditOnDragenter($event)"
              @dragleave.prevent="clusterEditOnDragleave($event)"
              @click="
                clusterEditModalData['clusterId'] = res.clusterId;
                clusterEditModalData['clusterName'] = res.clusterName;
                selectedClusterId = res.clusterId;
                $forceUpdate();
              ">
              <div class="nopointer text-center">
                <h4 class="nonselectable nopointer">{{ res.clusterName }}</h4>
                <div class="nopointer">
                  <img :src="getMolDrawEndPoint(res, true)" class="mw-100 nopointer" draggable="false" @dragstart.prevent />
                </div>
              </div>
            </b-card>
            <b-card
              no-body
              class="custom-shadow m-2 p-2"
              @drop.prevent="clusterEditOnDropNew($event)"
              @dragover.prevent="clusterEditOnDragover($event)"
              @dragenter.prevent="clusterEditOnDragenter($event)"
              @dragleave.prevent="clusterEditOnDragleave($event)">
              <div class="nopointer text-center">
                <h4 class="nonselectable nopointer">New Reaction Cluster</h4>
                <i class="fas fa-plus-circle fa-8x text-dark nopointer"></i>
              </div>
            </b-card>
          </div>
        </div>

        <template #modal-footer="{ close }">
          <div>
            <v-btn
              variant="success"
              class="mr-1"
              @click="openAddNewPrecursorModal(clusterEditModalData['selectedSmiles'], clusterEditModalData['clusterId'], clusterEditModalData['clusterName'])"
              title="Add precursor">
              <i class="fas fa-plus"></i>
            </v-btn>
            <v-btn v-b-modal.settings-modal variant="outline-dark" title="Open settings">
              <i class="fas fa-cog"></i>
            </v-btn>
          </div>
          <div class="form-check-inline">
            <input class="form-check-input" id="ceShowScore" type="checkbox" v-model="clusterEditModalData.optionsDisplay.showScore" />
            <label class="form-check-label mr-2" for="ceShowScore">Score</label>
            <input class="form-check-input" id="ceShowSCScore" type="checkbox" v-model="clusterEditModalData.optionsDisplay.showSCScore" />
            <label class="form-check-label mr-2" for="ceShowSCScore">Synthetic complexity</label>
            <input class="form-check-input" id="ceShowNumEx" type="checkbox" v-model="clusterEditModalData.optionsDisplay.showNumExample" />
            <label class="form-check-label mr-2" for="ceShowNumEx"># Examples</label>
            <input class="form-check-input" id="ceShowTemp" type="checkbox" v-model="clusterEditModalData.optionsDisplay.showTemplateScore" />
            <label class="form-check-label mr-2" for="ceShowTemp">Template score</label>
            <input class="form-check-input" id="ceShowPlaus" type="checkbox" v-model="clusterEditModalData.optionsDisplay.showPlausibility" />
            <label class="form-check-label mr-2" for="ceShowPlaus">Plausibility</label>
          </div>
          <div>
            <v-btn variant="info" class="mr-1" @click="requestClusterId(clusterEditModalData['selectedSmiles'])">Re-cluster</v-btn>
            <v-btn variant="outline-secondary" @click="close()">Close</v-btn>
          </div>
        </template>
      </b-modal>  -->
  <v-dialog v-model="showAddNewPrecursorModal" width="auto" min-width="500px">
    <v-card>
      <v-card-title>Add Precursor</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <!-- ADD NIH Resolver -->
        <v-text-field label="Precursor" variant="outlined" hide-details density="compact"
          v-model="addNewPrecursorModal['newPrecursorSmiles']" class="mb-2">
          <template v-slot:append-inner>
            <v-btn variant="tonal" prepend-icon="mdi mdi-pencil"
              @click="openKetcher(addNewPrecursorModal['newPrecursorSmiles'])">Draw</v-btn>
          </template>
        </v-text-field>
        <smiles-image v-if="!!addNewPrecursorModal['newPrecursorSmiles']"
          :smiles="addNewPrecursorModal['newPrecursorSmiles']" height="100px"></smiles-image>
        <v-select label="Cluster Number" :items="clusterItems" v-model="addNewPrecursorModal['clusterId']"
          variant="outlined" hide-details density="compact">
        </v-select>
        <v-text-field v-if="addNewPrecursorModal['clusterId'] === -1" label="Cluster Name" variant="outlined" hide-details
          density="compact" v-model="addNewPrecursorModal['newClusterName']" class="mt-2"></v-text-field>
        <v-checkbox v-model="addNewPrecursorModal['noDupCheck']" label="No Duplicate check" hide-details></v-checkbox>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="closeAddNewPrecursorModal()">Cancel</v-btn>
        <v-btn color="primary" @click="addNewPrecursorModalSubmit()">Add Precursor</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <rec-templates-modal :selected="selected" :visible="showRecTemplate"
    @close-dialog="$event => showRecTemplate = $event"></rec-templates-modal>
  <ketcher-modal ref="ketcherRef" v-model="showKetcher" :smiles="smiles" @input="showKetcher = false"
    @update:smiles="updateSmiles" />
</template>

<script>
import JsPanel from "@/components/JsPanel";
import BanButton from "@/components/BanButton";
import CopyTooltip from "@/components/CopyTooltip";
import KetcherMin from "@/components/KetcherMin";
import SmilesImage from "@/components/SmilesImage";
import { num2str } from "@/common/utils";
import dayjs from "dayjs";
import { API } from "@/common/api";
import { getMolImageUrl } from "@/common/drawing";
import { mapStores } from "pinia";
import { useResultsStore } from "@/store/results";
import { useSettingsStore } from "@/store/settings";
import { useConfirm, useSnackbar } from 'vuetify-use-dialog';
import RecTemplatesModal from "@/components/RecTemplatesModal";
import KetcherModal from "@/components/KetcherModal";

export default {
  name: "NodeDetail",
  components: {
    KetcherModal,
    JsPanel,
    BanButton,
    CopyTooltip,
    KetcherMin,
    SmilesImage,
    RecTemplatesModal
  },
  emits: ['selectAllOccur', 'deleteChoice', 'collapseNode', 'close', 'expandNode', 'updatePendingTasks'],
  props: {
    selected: {
      type: Object,
      default: null,
    },
    enableResolver: {
      type: Boolean,
      default: false,
    },
    visible: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const createConfirm = useConfirm()
    const createSnackbar = useSnackbar()
    return {
      createConfirm,
      createSnackbar
    }
  },
  data() {
    return {
      smiles: '',
      showKetcher: false,
      editIdx: -1,
      oldNote: "",
      noteUrsName: "",
      noteComment: "",
      addNote: false,
      dispNotes: false,
      invertAtomFilter: false,
      selectedAtoms: [],
      detailPanelOptions: {
        id: "detailPanel",
        headerTitle: "Node Details",
        headerControls: { size: "sm" },
        position: { my: "right-top", at: "right-top", of: "#app" },
        panelSize: { width: 500, height: "100vh" },
      },
      clusterPopoutModalData: {
        optionsDisplay: {
          showScore: false,
          showSCScore: false,
          showNumExample: true,
          showTemplateScore: false,
          showPlausibility: true,
          showClusterId: false,
        },
      },
      clusterEditModalData: {
        optionsDisplay: {
          showScore: false,
          showNumExample: false,
          showTemplateScore: false,
          showPlausibility: false,
          showClusterId: false,
        },
      },
      showClusterPopoutModal: false,
      selectedClusterId: 0,
      showClusterEditModal: false,
      showAddNewPrecursorModal: false,
      showRecTemplate: false,
      addNewPrecursorModal: {},
      sortingCategoryItems: [
        { value: "retroScore", title: "Score" },
        { value: "scscore", title: "Synthetic Complexity" },
        { value: "numExamples", title: "Examples" },
        { value: "templateRank", title: "Template Rank" },
        { value: "ffScore", title: "Plausibility" },
        { value: "rmsMolwt", title: "Root Mean Square Molecular Weight" },
        { value: "numRings", title: "Number of Rings" }
      ]
    };
  },
  methods: {
    openKetcher(source) {
      this.smiles = source;
      this.showKetcher = true;
      this.$refs['ketcherRef'].smilesToKetcher()
    },
    updateSmiles(source) {
      this.addNewPrecursorModal['newPrecursorSmiles'] = source;
    },
    predictSelectivity() {
      this.$emit("updatePendingTasks", "add");
      let data = this.selected.data
      let url = '/api/legacy/general-selectivity';
      console.log(data)
      let body = {
        reactants: data.mappedPrecursors,
        product: data.mappedOutcomes,
        mapped: true,
        all_outcomes: true,
        verbose: false,
      }
      API.runCeleryTask(url, body)
        .then(output => {
          if (Array.isArray(output)) {
            this.updateDataNodes({
              id: data.id,
              selectivity: output,
            })
            // Update the selected data object
            let newData = this.dataGraph.nodes.get(this.selected.smiles)
            tthis.selected['data'] = newData
          } else {
            alert('Could not predict selectivity for this reaction.')
          }
        })
        .catch(error => {
          alert('There was an error predicting selectivity for this reaction: ' + error)
        })
        .finally(() => {
          this.$emit("updatePendingTasks", "sub");
        })
    },
    toggleResolver() {
      if (this.allowResolve) {
        this.allowResolve = false;
      } else {
        this.allowResolve = true;
      }
    },
    clearEmit() {
      this.selectedAtoms = [];
      this.$emit("close");
    },
    resetSortingCategory() {
      this.sortingCategory = "retroScore";
      this.selectSortingOrder();
    },
    selectSortingOrder() {
      this.sortOrderAscending =
        ["rmsMolwt", "numRings", "scscore", "templateRank"].includes(this.sortingCategory) || (this.sortingCategory === "retroScore" && this.settingsStore.tbSettings.precursorScoring === "SCScore");
    },
    clearNote() {
      this.noteUrsName = "";
      this.noteComment = "";
      this.addNote = false;
    },
    saveNote() {
      //stop adding notes if there are more then one node selected
      let dispNode = this.selected.disp;
      if (dispNode.notes == undefined) {
        dispNode.notes = [];
      }
      let note = {
        user: this.noteUrsName,
        date: new Date().toLocaleString(),
        comment: this.noteComment,
      };
      this.createConfirm({ title: 'Please Confirm', content: `Please review your comment: \n ${this.noteComment}`, dialogProps: { width: "auto" } })
        .then((value) => {
          if (value) {
            dispNode.notes.push(note);
            this.addNote = false;
            this.noteUrsName = "";
            this.noteComment = "";
            this.saveResult();
          }
        })
        .catch(() => {
          // An error occurred
        });
    },
    async editNote(index, shouldDelete) {
      let note = this.selected.disp.notes[index];
      if (shouldDelete) {
        await this.createConfirm({ title: 'Please Confirm', content: `Are your sure that you want to delete \n ${note.comment}?`, dialogProps: { width: "auto" } })
          .then((value) => {
            if (value) {
              /* eslint-disable */
              this.selected.disp.notes.splice(index, 1);
              this.$forceUpdate();
              this.saveResult();
            }
          })
          .catch(() => {
            // An error occurred
          });
      } else {
        note.date = new Date().toLocaleString();
        this.saveResult();
      }
    },
    getAllSettings() {
      return {
        network: this.settingsStore.visjsUserOptions,
        tb: this.settingsStore.tbSettings,
        ipp: this.settingsStore.ippSettings,
      };
    },
    saveResult() {
      this.$emit("updatePendingTasks", "add");
      const body = {
        result: {
          dataGraph: this.resultsStore.dataGraph.toJSON(),
          dispGraph: this.resultsStore.dispGraph.toJSON(),
        },
        settings: this.getAllSettings(),
        description: this.resultsStore.savedResultInfo.description,
        tags: this.resultsStore.savedResultInfo.tags.join(","),
        result_type: "ipp",
      };
      let url = `/api/results/create`;
      let method = "post";
      if (
        !!this.resultsStore.savedResultInfo.id &&
        this.resultsStore.savedResultInfo.type === "ipp" &&
        this.resultsStore.savedResultOverwrite
      ) {
        url += this.resultsStore.savedResultInfo.id + "/";
        body["check_date"] = this.resultsStore.savedResultInfo.modified;
        method = "put";
      }
      API[method](url, body)
        .then((json) => {
          if (json.success) {
            this.resultsStore.updateSavedResultInfo({
              result_id: json['result_id'],
              modified: json["modified"],
              modifiedDisp: dayjs(json["modified"]).format("MMMM D, YYYY h:mm A"),
            });
            this.createSnackbar({ text: 'The note was updated!', snackbarProps: { timeout: 2000, vertical: true } })
          } else {
            this.createSnackbar({ text: "Tree builder job complete! Visit results page for more details", snackbarProps: { timeout: -1, vertical: true } })

          }
        })
        .catch((error) => {
          this.createSnackbar({ text: 'Error while attempting to save result:' + error.messages, snackbarProps: { timeout: -1, vertical: true } })
        })
        .finally(() => {
          this.$emit("updatePendingTasks", "sub");
        });
    },
    selectPopoutClusterName(clusterId) {
      let allIds = this.resultsStore.clusteredResultsIndex[this.clusterPopoutModalData["selectedSmiles"]];
      let idx = allIds.indexOf(clusterId);
      return this.resultsStore.clusteredResults[this.clusterPopoutModalData["selectedSmiles"]][idx]["clusterName"];
    },
    selectEditClusterName(clusterId) {
      let allIds = this.resultsStore.clusteredResultsIndex[this.clusterEditModalData["selectedSmiles"]];
      let idx = allIds.indexOf(clusterId);
      return this.resultsStore.clusteredResults[this.clusterEditModalData["selectedSmiles"]][idx]["clusterName"];
    },
    openAddNewPrecursorModal(selectedSmiles, clusterId = -1, clusterName = "") {
      // clusterId == -1 is to add a new cluster
      this.showAddNewPrecursorModal = true;
      this.addNewPrecursorModal["selectedSmiles"] = selectedSmiles === undefined ? this.selected.smiles : selectedSmiles;
      this.addNewPrecursorModal["clusterId"] = clusterId;
      this.addNewPrecursorModal["clusterName"] = clusterName;
      this.addNewPrecursorModal["newClusterName"] = "";
      this.addNewPrecursorModal["newPrecursorSmiles"] = "";
      this.addNewPrecursorModal["noDupCheck"] = false;
    },
    closeAddNewPrecursorModal() {
      this.showAddNewPrecursorModal = false;
      this.addNewPrecursorModal["selectedSmiles"] = "";
      this.addNewPrecursorModal["clusterId"] = -1;
      this.addNewPrecursorModal["clusterName"] = "";
      this.addNewPrecursorModal["newClusterName"] = "";
      this.addNewPrecursorModal["newPrecursorSmiles"] = "";
      this.addNewPrecursorModal["noDupCheck"] = false;
    },
    checkDuplicatePrecursor(selectedSmiles, p) {
      let existing = this.resultsStore.dataGraph.getSuccessors(selectedSmiles);
      return existing.includes(p) ? this.resultsStore.dataGraph.nodes.get(p) : undefined;
    },
    addNewPrecursorModalSubmit() {
      let gid = this.addNewPrecursorModal["clusterId"];
      let smi = this.addNewPrecursorModal["newPrecursorSmiles"];
      this.validatesmiles(smi, !this.allowResolve)
        .then((isValid) => {
          return isValid ? smi : this.resolveChemName(smi);
        })
        .then((smi) => this.canonicalize(smi, (res) => (this.addNewPrecursorModal["newPrecursorSmiles"] = res)))
        .then(() => {
          let selecSmi = this.addNewPrecursorModal["selectedSmiles"];
          let newSmi = this.addNewPrecursorModal["newPrecursorSmiles"];
          if (newSmi !== undefined) {
            if (!this.addNewPrecursorModal["noDupCheck"]) {
              let s = this.checkDuplicatePrecursor(selecSmi, newSmi);
              if (s !== undefined) {
                this.$bvModal.msgBoxOk(
                  "There may be a duplicated precursor: rank: " + s.rank + " cluster: " + s.clusterId + '. If you still want to proceed, please select "No duplicate check" option.',
                  {
                    title: "Alert",
                    size: "sm",
                    okVariant: "danger",
                    okTitle: "Ok",
                    hideHeaderClose: true,
                    centered: true,
                    footerClass: "p-2",
                  }
                );
                return;
              }
            }
            this.clusterEditModalAddPrecursor(selecSmi, newSmi, gid);
            this.closeAddNewPrecursorModal();
          }
        })
        .catch((error) => {
          var error_msg = "unknown error";
          if ("message" in error) {
            error_msg = error.name + ":" + error.message;
          } else if (typeof error == "string") {
            error_msg = error;
          }
          this.$bvModal.msgBoxOk("There was an error fetching precursors for this target with the supplied settings: " + error_msg, {
            title: "Alert",
            size: "sm",
            okVariant: "danger",
            okTitle: "Ok",
            hideHeaderClose: true,
            centered: true,
            footerClass: "p-2",
          });
        });
    },
    addNewPrecursorModalName(clusterId) {
      let allIds = this.resultsStore.clusteredResultsIndex[this.addNewPrecursorModal["selectedSmiles"]];
      let idx = allIds.indexOf(parseInt(clusterId));
      if (idx === -1) {
        return ""
      }
      return this.resultsStore.clusteredResults[this.addNewPrecursorModal["selectedSmiles"]][idx]["clusterName"];
    },
    getMolDrawEndPoint(precursor, align = false) {
      //  precursor can be
      //      1) a smiles string,
      //      2) a object with properties "reactingAtoms" and "mappedSmiles"
      //      3) a object with property "smiles"
      //      4) an object with property "precursorSmiles"
      const highlight = this.settingsStore.isHighlightAtom;
      const transparent = false;
      let reference;
      if (align && this.selected && this.settingsStore.ippSettings.alignPrecursorsToProduct) {
        reference = this.selected.smiles;
      }
      return getMolImageUrl(precursor, highlight, transparent, reference);
    },
    checkFilter(result) {
      if (!this.selectedAtoms.length) {
        return true;
      }
      let reactingAtoms = [];
      if (result.reactingAtoms) {
        reactingAtoms = result.reactingAtoms.map((el) => el - 1);
      }
      let filterResult = reactingAtoms.some((index) => this.selectedAtoms.includes(index));
      if (this.invertAtomFilter) {
        filterResult = !filterResult;
      }
      return filterResult;
    },
    remFromResults(selected, reaction) {
      let node = this.resultsStore.dispGraph.nodes.get(reaction.inVis[selected.id]);
      this.resultsStore.deleteDispNode(node);
    },
    addFromResults(selected, reaction) {
      if (selected.id in reaction.inVis) {
        return;
      }
      this.resultsStore.addRetroResultToDispGraph({ data: [reaction.id], parentId: selected.id });
    },
    deleteFromGraph(reaction) {
      //removes from vuex store deletes from datagraph and removes from tree.
      this.$bvModal
        .msgBoxConfirm("This will be permanently deleted from the tree. Continue?", {
          title: "Please Confirm",
          size: "sm",
          okVariant: "success",
          okTitle: "Yes",
          cancelTitle: "No",
          footerClass: "p-2",
          hideHeaderClose: false,
          centered: true,
        })
        .then((value) => {
          if (!value) return;
          this.resultsStore.deleteDataNode(reaction);
        })
        .catch(() => {
          // An error occurred
        });
    },
    clusterPopoutModalSetGroupID() {
      let allIds = this.resultsStore.clusteredResultsIndex[this.clusterPopoutModalData["selectedSmiles"]];
      let idx = allIds.indexOf(this.selectedClusterId);
      this.clusterPopoutModalData["clusterId"] = this.selectedClusterId;
      let allResults = this.resultsStore.clusteredResults[this.clusterPopoutModalData["selectedSmiles"]];
      this.clusterPopoutModalData["clusterName"] = allResults[idx]["clusterName"];
    },
    openClusterPopoutModal(selected, res) {
      if (selected === undefined) {
        this.$bvModal.msgBoxOk("No target molecule selected. Please select a molecule in the tree.", {
          title: "Alert",
          size: "sm",
          okVariant: "danger",
          okTitle: "Ok",
          hideHeaderClose: true,
          centered: true,
          footerClass: "p-2",
        });
        return;
      }
      if (res.clusterId === undefined) {
        this.$bvModal
          .msgBoxConfirm("This precursor has not been clustered. Would you like to re-cluster the current list of precursors?", {
            title: "Please Confirm",
            size: "sm",
            okVariant: "success",
            okTitle: "Yes",
            cancelTitle: "No",
            footerClass: "p-2",
            hideHeaderClose: false,
            centered: true,
          })
          .then((value) => {
            if (!value) return;
            this.requestClusterId(selected.smiles).then(() => {
              // Retrieve updated res from dataGraph
              res = this.resulsStore.dataGraph.nodes.get(res.id);
              this.openClusterPopoutModal(selected, res);
            });
          })
          .catch(() => {
            // An error occurred
          });
      } else {
        this.clusterPopoutModalData["selected"] = selected;
        this.clusterPopoutModalData["selectedSmiles"] = selected.smiles;
        this.clusterPopoutModalData["res"] = res;
        this.clusterPopoutModalData["clusterId"] = res.clusterId;
        this.clusterPopoutModalData["clusterName"] = res.clusterName;
        this.selectedClusterId = res.clusterId;
        this.showClusterPopoutModal = true;
      }
    },
    closeClusterPopoutModal() {
      this.showClusterPopoutModal = false;
      this.clusterPopoutModalData["selected"] = undefined;
      this.clusterPopoutModalData["selectedSmiles"] = undefined;
      this.clusterPopoutModalData["res"] = undefined;
      this.clusterPopoutModalData["clusterId"] = undefined;
      this.clusterPopoutModalData["clusterName"] = undefined;
    },
    openClusterEditModal(selected, clusterId, clusterName) {
      if (selected === undefined) {
        this.$bvModal.msgBoxOk("No target molecule selected. Please select a molecule in the tree.", {
          title: "Alert",
          size: "sm",
          okVariant: "danger",
          okTitle: "Ok",
          hideHeaderClose: true,
          centered: true,
          footerClass: "p-2",
        });
        return;
      }
      if (clusterId === undefined) {
        clusterId = 0;
      }
      this.clusterEditModalData["selected"] = selected;
      this.clusterEditModalData["selectedSmiles"] = selected.smiles;
      this.clusterEditModalData["clusterId"] = clusterId;
      this.clusterEditModalData["clusterName"] = clusterName;
      this.selectedClusterId = clusterId;
      this.showClusterEditModal = true;
    },
    closeClusterEditModal() {
      this.showClusterEditModal = false;
      this.clusterEditModalData["selected"] = undefined;
      this.clusterEditModalData["selectedSmiles"] = undefined;
      this.clusterEditModalData["clusterId"] = undefined;
      this.clusterEditModalData["clusterName"] = undefined;
    },
    clusterPopoutModalIncGroupID() {
      let allIds = this.resultsStore.clusteredResultsIndex[this.clusterPopoutModalData["selectedSmiles"]];
      let allResults = this.resultsStore.clusteredResults[this.clusterPopoutModalData["selectedSmiles"]];
      let idx = allIds.indexOf(this.clusterPopoutModalData["clusterId"]);
      let idxToModify = Math.min(allIds.length - 1, idx + 1);
      this.clusterPopoutModalData["clusterId"] = allIds[idxToModify];
      this.clusterPopoutModalData["clusterName"] = allResults[idxToModify]["clusterName"];
      this.selectedClusterId = allIds[idxToModify];
    },
    clusterPopoutModalDecGroupID() {
      let allIds = this.resultsStore.clusteredResultsIndex[this.clusterPopoutModalData["selectedSmiles"]];
      let allResults = this.resultsStore.clusteredResults[this.clusterPopoutModalData["selectedSmiles"]];
      let idx = allIds.indexOf(this.clusterPopoutModalData["clusterId"]);
      let idxToModify = Math.max(0, idx - 1);
      this.clusterPopoutModalData["clusterId"] = allIds[idxToModify];
      this.clusterPopoutModalData["clusterName"] = allResults[idxToModify]["clusterName"];
      this.selectedClusterId = allIds[idxToModify];
    },
    clusterEditOnDragover(event) {
      event.dataTransfer.dropEffect = "move"; // important
    },
    clusterEditOnDragenter(event) {
      event.target.classList.add("dragover");
    },
    clusterEditOnDragleave(event) {
      event.target.classList.remove("dragover");
    },
    clusterEditOnDragstart(precursor, event) {
      event.target.style.opacity = "0.4";
      event.dataTransfer.setData("text/plain", precursor.id);
      let img = new Image();
      img.src = this.getMolDrawEndPoint(precursor.precursorSmiles);
      // set opacity does not work..
      event.dataTransfer.setDragImage(img, 10, 10);
      event.dataTransfer.effectAllowed = "all";
      // disable all buttons on dragging
      let buttons = document.querySelectorAll("button");
      buttons.forEach(function (e) {
        e.style.pointerEvents = "none";
      });
    },
    clusterEditOnDragend(event) {
      event.target.style.opacity = "1";
      // enable all buttons
      let buttons = document.querySelectorAll("button");
      buttons.forEach(function (e) {
        e.style.pointerEvents = "all";
      });
    },
    clusterEditOnDrop(target, event) {
      let smi = event.dataTransfer.getData("text/plain"); // precursor.id
      let obj = this.resultsStore.dataGraph.nodes.get(smi);
      let oldId = obj.clusterId;
      let newId = target.clusterId;
      this.resultsStore.updateDataNodes({
        id: smi,
        clusterId: newId,
        clusterName: target.clusterName,
      });
      this.clusterEditOnDragend(event);
      this.clusterEditOnDragleave(event);
      this.updateClusterReps(this.clusterEditModalData["selectedSmiles"], [oldId, newId]);
    },
    clusterEditOnDropNew(event) {
      let smi = event.dataTransfer.getData("text/plain"); // precursor.id
      let obj = this.resultsStore.dataGraph.nodes.get(smi);
      let allIds = this.resultsStore.clusteredResultsIndex[this.clusterEditModalData["selectedSmiles"]];
      let oldId = obj.clusterId;
      let newId = allIds[allIds.length - 1] + 1;
      let defaultName = `Reaction Cluster #${newId + 1}`;
      let customName = prompt("Please enter a name for the new cluster", defaultName);
      this.resultsStore.updateDataNodes({
        id: smi,
        clusterId: newId,
        clusterName: customName === "" || customName === null ? defaultName : customName,
      });
      this.clusterEditOnDragend(event);
      this.clusterEditOnDragleave(event);
      this.updateClusterReps(this.clusterEditModalData["selectedSmiles"], [oldId, newId]);
    },
    updateClusterReps(target, clusterIds) {
      // Update the cluster representatives for the specified clusterIds
      for (let clusterId of clusterIds) {
        let options = { filter: (item) => item.clusterId === clusterId };
        let precursorSmiles = this.resultsStore.dataGraph.getSuccessors(target);
        let precursors = this.resultsStore.dataGraph.nodes.get(precursorSmiles, options);
        this.resultsStore.updateDataNodes(
          precursors.map((item, index) => ({
            id: item.id,
            clusterRep: index === 0,
          }))
        ); // Set first item as cluster rep
      }
    },
    clusterEditModalIncGroupID() {
      let allIds = this.resultsStore.clusteredResultsIndex[this.clusterEditModalData["selectedSmiles"]];
      let allResults = this.resultsStore.clusteredResults[this.clusterEditModalData["selectedSmiles"]];
      let idx = allIds.indexOf(this.clusterEditModalData["clusterId"]);
      let idxToModify = Math.min(allIds.length - 1, idx + 1);
      this.clusterEditModalData["clusterId"] = allIds[idxToModify];
      this.clusterEditModalData["clusterName"] = allResults[idxToModify]["clusterName"];
      this.selectedClusterId = allIds[idxToModify];
    },
    clusterEditModalDecGroupID() {
      let allIds = this.resultsStore.clusteredResultsIndex[this.clusterEditModalData["selectedSmiles"]];
      let allResults = this.resultsStore.clusteredResults[this.clusterEditModalData["selectedSmiles"]];
      let idx = allIds.indexOf(this.clusterEditModalData["clusterId"]);
      let idxToModify = Math.max(0, idx - 1);
      this.clusterEditModalData["clusterId"] = allIds[idxToModify];
      this.clusterEditModalData["clusterName"] = allResults[idxToModify]["clusterName"];
      this.selectedClusterId = allIds[idxToModify];
    },
    clusterEditModalSetGroupID() {
      let allIds = this.resultsStore.clusteredResultsIndex[this.clusterEditModalData["selectedSmiles"]];
      let idx = allIds.indexOf(this.selectedClusterId);
      this.clusterEditModalData["clusterId"] = this.selectedClusterId;
      let allResults = this.resultsStore.clusteredResults[this.clusterEditModalData["selectedSmiles"]];
      this.clusterEditModalData["clusterName"] = allResults[idx]["clusterName"];
    },
    clusterEditModalAddPrecursor(selectedSmiles, smiles, clusterId) {
      // clusterId == -1 is to add a new cluster
      let successors = this.resultsStore.dataGraph.getSuccessors(selectedSmiles);
      let allIds = this.resultsStore.clusteredResultsIndex[selectedSmiles];
      let clusterName;
      if (clusterId === -1) {
        if (successors.length === 0 || allIds.length === 0) {
          clusterId = 0;
        } else {
          clusterId = allIds[allIds.length - 1] + 1;
        }
        clusterName = this.addNewPrecursorModal["newClusterName"];
        if (clusterName === "") {
          clusterName = `Reaction Cluster #${clusterId + 1}`;
        }
      } else {
        clusterName = this.addNewPrecursorModalName(clusterId);
      }
      let rank = Math.max(...this.resultsStore.dataGraph.nodes.get(successors).map((s) => s.rank)) + 1;
      let res = {
        outcome: smiles,
        smiles_split: smiles.split("."),
        rank: rank,
        group_id: clusterId,
        group_name: clusterName,
      };
      this.resultsStore.addRetroResultToDataGraph({ data: [res], parentSmiles: selectedSmiles });
    },
    requestClusterId(smiles) {
      this.$emit("updatePendingTasks", "add");
      return this.resultsStore.recluster(smiles).finally(() => {
        this.$emit("updatePendingTasks", "sub");
      });
    },
    validatesmiles(smiles, iswarning) {
      return API.post("/api/rdkit/validate/", { smiles: smiles }).then((json) => {
        if (!json["correct_syntax"]) {
          if (iswarning) {
            this.$bvModal.msgBoxOk("Invalid SMILES entered: Invalid Syntax", {
              title: "Alert",
              size: "sm",
              okVariant: "danger",
              okTitle: "Ok",
              hideHeaderClose: true,
              centered: true,
              footerClass: "p-2",
            });
          }
          return false;
        } else if (!json["valid_chem_name"]) {
          if (iswarning) {
            this.$bvModal.msgBoxOk("Invalid SMILES entered: Invalid Chemical Name", {
              title: "Alert",
              size: "sm",
              okVariant: "danger",
              okTitle: "Ok",
              hideHeaderClose: true,
              centered: true,
              footerClass: "p-2",
            });
          }
          return false;
        } else {
          return true;
        }
      });
    },
    canonicalize(smiles, input) {
      return API.post("/api/rdkit/canonicalize/", { smiles: smiles }).then((json) => {
        if (json.smiles) {
          if (typeof input === "string") {
            this[input] = json.smiles;
          } else if (input instanceof Function) {
            input(json.smiles);
          }
        }
      });
    },
    expandNode() {
      this.$emit("expandNode");
    },
    dayjs,
    num2str,
  },
  computed: {
    clusterItems() {
      let items = [{ title: "Create new cluster", value: -1 }];
      for (let idx in this.resultsStore.clusteredResultsIndex[this.addNewPrecursorModal['selectedSmiles']]) {
        let clusterName = this.addNewPrecursorModalName(idx)
        if (clusterName === "") {
          continue;
        }
        items.push({ title: clusterName, value: idx });
      }
      return items;
    },
    allowResolve: {
      get() {
        return this.settingsStore.allowResolve;
      },
      set(value) {
        this.settingsStore.setOption({ key: "allowResolve", value: value });
      },
    },
    sortingCategory: {
      get() {
        return this.settingsStore.sortingCategory;
      },
      set(value) {
        this.settingsStore.sortingCategory = value;
      },
    },
    sortOrderAscending: {
      get() {
        return this.settingsStore.sortOrderAscending;
      },
      set(value) {
        this.settingsStore.sortOrderAscending = value;
      },
    },
    allowCluster: {
      get() {
        return this.settingsStore.allowCluster;
      },
      set(value) {
        this.settingsStore.allowCluster = value;
      },
    },
    reactionLimit: {
      get() {
        return this.settingsStore.reactionLimit;
      },
      set(value) {
        this.settingsStore.reactionLimit = value;
      },
    },
    savedResultOverwrite: {
      get() {
        return this.resultsStore.savedResultInfo.overwrite;
      },
      set(value) {
        this.resultsStore.updateSavedResultInfo({ overwrite: value });
      },
    },
    resultsAvailable() {
      // Boolean of whether the selected chemical has been expanded
      // Returns false if a reaction node is selected
      if (this.selected.type !== "chemical") {
        return false;
      } else {
        return this.resultsStore.dataGraph.getSuccessors(this.selected.smiles).length !== 0;
      }
    },
    currentPrecursors() {
      // Array of precursors corresponding to the selected chemical
      this.resultsStore.recomputeData;
      if (this.selected.type !== "chemical") {
        return [];
      }

      let precursorSmiles = this.resultsStore.dataGraph.getSuccessors(this.selected.smiles);
      let cmp = this.sortOrderAscending
        ? (a, b) => {
          return a - b;
        }
        : (a, b) => {
          return b - a;
        };
      let options = {
        filter: (item) => {
          if (this.allowCluster && !item.clusterRep) {
            return false;
          }
          return this.checkFilter(item);
        },
        order: (a, b) => {
          let a_ = a[this.sortingCategory] === undefined ? 0 : a[this.sortingCategory];
          let b_ = b[this.sortingCategory] === undefined ? 0 : b[this.sortingCategory];
          if (a_ === b_) {
            return a.rank - b.rank;
          }
          return cmp(a_, b_);
        },
      };
      return this.resultsStore.dataGraph.nodes.get(precursorSmiles, options);
    },
    currentClusterViewPrecursors() {
      this.resultsStore.recomputeData;
      let smi = this.clusterPopoutModalData.selectedSmiles;
      let cid = this.clusterPopoutModalData.clusterId;
      let precursorSmiles = this.resultsStore.dataGraph.getSuccessors(smi);
      let options = {
        filter: (item) => item.clusterId === cid,
      };
      return this.resultsStore.dataGraph.nodes.get(precursorSmiles, options);
    },
    currentClusterEditPrecursors() {
      this.resultsStore.recomputeData;
      let smi = this.clusterEditModalData.selectedSmiles;
      let cid = this.clusterEditModalData.clusterId;
      let precursorSmiles = this.resultsStore.dataGraph.getSuccessors(smi);
      let options = {
        filter: (item) => item.clusterId === cid,
      };
      return this.resultsStore.dataGraph.nodes.get(precursorSmiles, options);
    },
    ...mapStores(useResultsStore, useSettingsStore),
  },
};
</script>

<style scoped>
.scroll-list {
  max-height: 50vh;
  overflow-y: scroll;
}

.scroll-list-x {
  max-height: 45vh;
  max-width: 90vw;
  overflow-x: scroll;
}

.custom-shadow {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
}

.custom-shadow:hover {
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
}

.grey-border {
  border: #333 3px solid;
}

.grid-wrapper {
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-auto-flow: row;
  grid-gap: 10px;
}

.grid-wrapper-onerow {
  display: grid;
  grid-template-rows: minmax(25vh, max-content);
  grid-auto-columns: 200px;
  grid-auto-flow: column;
  grid-gap: 10px;
}

[draggable] {
  user-select: none;
}

.nonselectable {
  user-select: none;
}

.nopointer {
  pointer-events: none;
}

.dragover {
  border: 2px dashed #000 !important;
}

.flex-gap-2 {
  gap: 0.5rem;
}
</style>
