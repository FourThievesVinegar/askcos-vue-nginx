/*
 * ASKCOS API client library
 */
import Cookies from 'js-cookie';

const authMigratedAPI = ["/api/banlist"];

const API = {
  pollInterval: 1000,
  pollIntervalLong: 2000,

  getHeaders(data, endpoint) {
    console.log(endpoint)

    let headers = {};
    
    if (authMigratedAPI.some(api => endpoint.startsWith(api))) {
      const accessToken = localStorage.getItem('accessToken');
      headers = {
        'accept': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      };
    }
    else {
      headers = {
        'X-CSRFToken': Cookies.get('csrftoken'),
      }
      if (data && !(data instanceof FormData)) {
        headers['Content-Type'] = 'application/json'
      }
    }

    return headers
  },


  fetchHandler(response) {
    if (response.ok) {
      return response.json()
    } else {
      return response.json().catch(() => {
        // Status not ok, and there is no json body
        return Promise.reject(new Error(response.statusText))
      }).then(json => {
        // Status not ok, but there is a json body
        return Promise.reject(new Error(json.error))
      })
    }
  },


  get(endpoint, params) {
    if (!endpoint.endsWith('/') && !authMigratedAPI.some(api => endpoint.startsWith(api))) {
      endpoint += '/';
    }
    if (params) {
      if (!(params instanceof URLSearchParams)) {
        params = new URLSearchParams(params);
      }
      endpoint += `?${params.toString()}`;
    }

    return fetch(endpoint, {
      method: 'GET',
      headers: this.getHeaders(null, endpoint),
    }).then(this.fetchHandler);
  },


  post(endpoint, data) {
    if (!endpoint.endsWith('/') && !authMigratedAPI.some(api => endpoint.startsWith(api))) {
      endpoint += '/';
    }
    return fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(data, endpoint),
      body: data instanceof FormData ? data : JSON.stringify(data),
    }).then(this.fetchHandler);
  },

  put(endpoint, data) {
    if (!endpoint.endsWith('/') && !authMigratedAPI.some(api => endpoint.startsWith(api))) {
      endpoint += '/';
    }
    return fetch(endpoint, {
      method: 'PUT',
      headers: this.getHeaders(data, endpoint),
      body: data instanceof FormData ? data : JSON.stringify(data),
    }).then(this.fetchHandler);
  },

  delete(endpoint) {
    if (!endpoint.endsWith('/') && !authMigratedAPI.some(api => endpoint.startsWith(api))) {
      endpoint += '/';
    }
    return fetch(endpoint, {
      method: 'DELETE',
      headers: this.getHeaders(null, endpoint),
    }).then(this.fetchHandler);
  },

  runCeleryTask(endpoint, data, progress) {
    return this.post(endpoint, data)
      .then((json) => this.pollCeleryResult(json.task_id, progress));
  },

  pollCeleryResult(taskId, progress) {
    const check = (resolve, reject) => {
      this.get(`/api/v2/celery/task/${taskId}/`)
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
