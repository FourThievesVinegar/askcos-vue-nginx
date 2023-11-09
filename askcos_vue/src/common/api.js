/*
 * ASKCOS API client library
 */
import { useFastapiStore } from "@/store/fastapi";

const API = {
  pollInterval: 1000,
  pollIntervalLong: 2000,

  getHeaders(data) {
    let headers = {};
    if (data && !(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    headers['Authorization'] = 'Bearer ' + localStorage.getItem('accessToken');

    return headers
  },


  fetchHandler(response) {
    if (response.ok) {
      return response.json().then(json => {
        return json
      }).catch(() => {
        return response.statusText
      })
    } else {
      return response.json().catch(() => {
        // Status not ok, and there is no json body
        return Promise.reject(new Error(response.statusText))
      }).then(json => {
        // Status not ok, but there is a json body
        return Promise.reject(new Error(JSON.stringify(json)))
      })
    }
  },


  async get(endpoint, params) {
    const fastapiStore = useFastapiStore()
    if (params) {
      if (!(params instanceof URLSearchParams)) {
        params = new URLSearchParams(params);
      }
      endpoint += `?${params.toString()}`;
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.getHeaders(null),
    });
    const json = await this.fetchHandler(response);
    fastapiStore.logs.unshift({ endpoint: endpoint, method: 'GET', request: params, response: json });
    return json;
  },


  async post(endpoint, data, query = false) {
    const fastapiStore = useFastapiStore()

    let response = null;
    if (!query) {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getHeaders(data),
        body: data instanceof FormData ? data : JSON.stringify(data),
      });
    }
    else {
      response = await fetch(endpoint + "?" + new URLSearchParams(data).toString(), {
        method: 'POST',
        headers: this.getHeaders()
      })
    }
    const json = await this.fetchHandler(response);
    fastapiStore.logs.unshift({ endpoint: endpoint, method: 'POST', request: data, response: json });
    return json
  },

  async put(endpoint, data) {
    const fastapiStore = useFastapiStore()
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: this.getHeaders(data),
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
    const json = await this.fetchHandler(response);
    fastapiStore.logs.unshift({ endpoint: endpoint, method: 'PUT', request: data, response: json });
    return json;
  },

  async delete(endpoint) {
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: this.getHeaders(null),
    });
    return this.fetchHandler(response);
  },

  async runCeleryTask(endpoint, data, progress) {
    const json = await this.post(endpoint, data);
    if (json.task_id) {
      return this.pollCeleryResult(json.task_id, progress);
    }
    else {
      return this.pollCeleryResult(json, progress);
    }
  },

  pollCeleryResult(taskId, progress) {
    const check = (resolve, reject) => {
      this.get(`/api/legacy/celery/task/${taskId}/`)
        .then((json) => {
          if (json.complete) {
            return resolve(json.output);
          } if (json.failed) {
            return reject(new Error('Celery task failed.'));
          }
          if (progress) {
            progress(json);
          }
          setTimeout(check, API.pollInterval, resolve, reject);
        })
        .catch((error) => {
          if (error instanceof TypeError && error.message === 'Failed to fetch') {
            console.log('Unable to fetch celery results due to connection error. Will keep trying.');
            setTimeout(check, API.pollIntervalLong, resolve, reject);
          } else {
            return reject(error);
          }
        });
    };
    return new Promise(check);
  },
};

export { API };
