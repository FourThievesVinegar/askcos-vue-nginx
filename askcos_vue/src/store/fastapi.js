import { defineStore } from "pinia";

export const useFastapiStore = defineStore("fastapi", {
    state: () => ({
        logs: [],
    }),
    getters: () => ({

    }),
    actions: () => ({
        addLogs({ endpoint, method, request, response }) {
            this.logs.push(
                {
                    endpoint: endpoint,
                    method: method,
                    request: request,
                    response: response
                }
            )
        }
    })
})